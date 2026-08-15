'use server';

import { z } from 'zod';
import type { Row } from '@/lib/db/types';
import { stableUuid } from '@/lib/stable-uuid';
import { staffCan } from '../auth';
import {
  archive,
  discardDraft,
  publishDirect,
  publishDraft,
  saveDraft,
  unarchive,
} from '../content/editorial';
import { priceFields, type Availability, type PriceMode } from '../content/menu';
import { done, run, saved, type ActionState } from './shared';

/**
 * Menu mutations.
 *
 * The design rule behind all of them: a Manager changing a price mid-service does
 * it in one action from the list, with no record to open and no review step —
 * because the alternative is that they stop using the admin and the website goes
 * stale. Everything that is not a price or an availability toggle goes through
 * the ordinary draft-then-publish path.
 */

const priceSchema = z.object({
  id: z.string().min(1),
  mode: z.enum(['fixed', 'ask-server', 'market', 'hidden']),
  amount: z.string().trim().max(12),
});

/** Change a price from the list. One field, one save. */
export async function setPrice(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db, staff }) => {
    const parsed = priceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Check the price.' };
    }

    const fields = priceFields(parsed.data.mode as PriceMode, parsed.data.amount);
    const item = await db.get<Row>('menu_items', parsed.data.id);
    if (!item) return { ok: false, message: 'That dish no longer exists.' };

    if (staffCan(staff, 'content.publish')) {
      await publishDirect(db, 'menu_items', parsed.data.id, fields, staff);
      return done(`Price updated for “${item.name}”.`, 'menu');
    }

    await saveDraft(db, 'menu_items', parsed.data.id, fields, staff);
    return saved(`Saved as a draft. A manager needs to publish “${item.name}”.`);
  });
}

const availabilitySchema = z.object({
  id: z.string().min(1),
  availability: z.enum(['available', 'unavailable', 'hidden']),
  note: z.string().trim().max(120).optional(),
});

/**
 * Sold out, back on, or hidden.
 *
 * This is the single most-used control in the whole admin — it happens mid-shift,
 * usually on a phone — so it publishes immediately for anyone who can publish.
 */
export async function setAvailability(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.edit', async ({ db, staff }) => {
    const parsed = availabilitySchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not save that change.' };

    const { id, availability, note } = parsed.data;
    const item = await db.get<Row>('menu_items', id);
    if (!item) return { ok: false, message: 'That dish no longer exists.' };

    const fields: Row = {
      availability,
      available: availability === 'available',
      availability_note: availability === 'unavailable' ? (note || null) : null,
    };

    const said: Record<Availability, string> = {
      available: `“${item.name}” is back on the menu.`,
      unavailable: `“${item.name}” is marked sold out. Guests still see it, greyed out.`,
      hidden: `“${item.name}” is hidden from guests. It is still here for you.`,
    };

    if (staffCan(staff, 'content.publish')) {
      await publishDirect(db, 'menu_items', id, fields, staff);
      return done(said[availability], 'menu');
    }

    await saveDraft(db, 'menu_items', id, fields, staff);
    return saved('Saved as a draft. A manager needs to publish it.');
  });
}

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'The dish needs a name.').max(120),
  description: z.string().trim().max(600),
  categoryId: z.string().min(1),
  mode: z.enum(['fixed', 'ask-server', 'market', 'hidden']),
  amount: z.string().trim().max(12),
  availability: z.enum(['available', 'unavailable', 'hidden']),
  modifierGroupLabel: z.string().trim().max(60),
  choices: z.string().trim().max(600),
  addOns: z.string().trim().max(600),
  dietary: z.string().trim().max(200),
  featured: z.coerce.boolean(),
  publish: z.string().optional(),
});

/**
 * The full item editor.
 *
 * Choice groups and paid add-ons are typed as plain lines rather than a nested
 * form, because "Mole, Mango Habanero, Buffalo, BBQ" is how a person holds that
 * information — and because a repeater with six controls per row is unusable on
 * the phone this actually gets edited on.
 */
export async function saveMenuItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db, staff }) => {
    const parsed = itemSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return {
        ok: false,
        message: issue?.message ?? 'Please check the form.',
        errors: issue ? { [String(issue.path[0])]: issue.message } : undefined,
      };
    }

    const value = parsed.data;
    const fields: Row = {
      name: value.name,
      description: value.description || null,
      category_id: value.categoryId,
      availability: value.availability,
      available: value.availability === 'available',
      modifier_group_label: value.modifierGroupLabel || null,
      dietary: value.dietary ? value.dietary.split(',').filter(Boolean) : [],
      featured: value.featured,
      ...priceFields(value.mode as PriceMode, value.amount),
    };

    const wantsPublish = value.publish === 'true' && staffCan(staff, 'content.publish');

    if (wantsPublish) {
      await publishDirect(db, 'menu_items', value.id, fields, staff);
    } else {
      await saveDraft(db, 'menu_items', value.id, fields, staff);
    }

    await replaceModifiers(db, value.id, value.choices, value.addOns);

    return wantsPublish
      ? done(`“${value.name}” is live.`, 'menu')
      : saved('Saved as a draft. Publish when you are ready.');
  });
}

/**
 * Choices and add-ons are rewritten wholesale.
 *
 * They are small, ordered, and belong to exactly one dish, so a diff would be
 * more code and more ways to be wrong than simply replacing the set.
 */
async function replaceModifiers(
  db: import('@/lib/db/types').Db,
  itemId: string,
  choices: string,
  addOns: string,
): Promise<void> {
  const existing = await db.list<Row>('menu_modifiers');
  for (const row of existing) {
    if (row.item_id === itemId) await db.remove('menu_modifiers', String(row.id));
  }

  const rows: Row[] = [];
  let sort = 0;

  for (const label of choices.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)) {
    rows.push({
      id: stableUuid('menu-modifier', `${itemId}:${sort}`),
      item_id: itemId,
      label,
      price_cents: null,
      sort,
    });
    sort += 1;
  }

  // "Add meat +4" / "Shrimp 6" — the number is the surcharge.
  for (const line of addOns.split('\n').map((s) => s.trim()).filter(Boolean)) {
    const match = /^(.*?)\s*\+?\$?(\d+(?:\.\d{1,2})?)\s*$/.exec(line);
    if (!match) continue;
    rows.push({
      id: stableUuid('menu-modifier', `${itemId}:${sort}`),
      item_id: itemId,
      label: match[1]!.trim(),
      price_cents: Math.round(Number(match[2]) * 100),
      sort,
    });
    sort += 1;
  }

  for (const row of rows) await db.insert('menu_modifiers', row);
}

/* ----------------------------------------------------------------- ordering */

const moveSchema = z.object({
  table: z.enum(['menu_items', 'menu_categories']),
  id: z.string().min(1),
  direction: z.enum(['up', 'down']),
  /** Rows in current display order, so the swap is unambiguous. */
  siblings: z.string().min(1),
});

/**
 * Move one row up or down.
 *
 * Two integers change, not the whole list — so moving one dish does not create a
 * version-history entry for every other dish in the category. Keyboard operable
 * by construction: they are buttons, not a drag target.
 */
export async function moveRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.publish', async ({ db }) => {
    const parsed = moveSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not reorder that.' };

    const { table, id, direction } = parsed.data;
    const siblings = parsed.data.siblings.split(',').filter(Boolean);
    const index = siblings.indexOf(id);
    const target = direction === 'up' ? index - 1 : index + 1;

    if (index === -1 || target < 0 || target >= siblings.length) {
      return { ok: true, message: '' };
    }

    const other = siblings[target]!;
    const [a, b] = await Promise.all([db.get<Row>(table, id), db.get<Row>(table, other)]);
    if (!a || !b) return { ok: false, message: 'Could not reorder that.' };

    await db.update(table, id, { sort: b.sort });
    await db.update(table, other, { sort: a.sort });

    return done('Order updated.', 'menu');
  });
}

/* --------------------------------------------------------- create & archive */

const addItemSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().trim().min(1, 'Give the dish a name.').max(120),
});

export async function addMenuItem(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.publish', async ({ db }) => {
    const parsed = addItemSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Give the dish a name.' };
    }

    const { categoryId, name } = parsed.data;
    // A readable, stable id derived from the name, because it becomes part of
    // the public anchor and of every version-history entry.
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);

    const existing = await db.list<Row>('menu_items');
    let id = base || 'new-item';
    let n = 2;
    while (existing.some((row) => row.id === id)) id = `${base}-${n++}`;

    const inCategory = existing.filter((row) => row.category_id === categoryId);
    const sort = Math.max(0, ...inCategory.map((row) => Number(row.sort ?? 0))) + 1;

    await db.insert('menu_items', {
      id,
      category_id: categoryId,
      name,
      description: null,
      price_mode: 'ask-server',
      price_cents: null,
      price_note: 'Ask your server',
      modifier_group_label: null,
      dietary: [],
      availability: 'hidden',
      available: false,
      featured: false,
      sort,
      draft: null,
      archived_at: null,
    });

    // Hidden on creation, deliberately: a half-finished dish should not appear on
    // the website between "add" and "fill in the details".
    return done(`Added “${name}”. It is hidden from guests until you switch it on.`, 'menu');
  });
}

const idSchema = z.object({ table: z.string().min(1), id: z.string().min(1) });

export async function archiveRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.archive', async ({ db, staff }) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not archive that.' };
    await archive(db, parsed.data.table, parsed.data.id, staff);
    return done('Taken off the website. Nothing was deleted — you can put it back.', 'menu');
  });
}

export async function unarchiveRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.archive', async ({ db }) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not restore that.' };
    await unarchive(db, parsed.data.table, parsed.data.id);
    return done('Back on the website.', 'menu');
  });
}

/* --------------------------------------------------------------- publishing */

export async function publishRow(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.publish', async ({ db, staff }) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not publish that.' };
    const fields = await publishDraft(db, parsed.data.table, parsed.data.id, staff);
    const area = parsed.data.table.startsWith('menu') ? 'menu' : 'events';
    return done(
      fields.length ? 'Published. It is on the website now.' : 'Nothing was waiting to publish.',
      area,
    );
  });
}

export async function discardRowDraft(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = idSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not discard that.' };
    await discardDraft(db, parsed.data.table, parsed.data.id);
    return saved('Draft discarded. The website is unchanged.');
  });
}
