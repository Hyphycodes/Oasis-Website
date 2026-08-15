'use server';

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getSessionClient } from '@/lib/supabase/server';
import { archive, publishDirect, unarchive } from '../content/editorial';
import { getMedia, routesOfRegistryUsage, usageOf } from '../content/media';
import { done, run, type ActionState } from './shared';

/**
 * Media.
 *
 * Two rules that are enforced here rather than left to whoever is uploading:
 *
 *  1. A meaningful image cannot be published without a description, and a
 *     decorative one has to be marked decorative on purpose. The database has the
 *     same constraint, so neither can be skipped by a direct API call.
 *  2. Nothing that is still in use can be archived without being shown, by name,
 *     where it is used. The reference list is a live query over the same rows the
 *     public site reads.
 */

/** Formats the frontend can genuinely render. Anything else is refused clearly. */
const ACCEPTED: Record<string, 'image' | 'video'> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/avif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
};

const MAX_IMAGE_BYTES = 8_000_000;
const MAX_VIDEO_BYTES = 40_000_000;

function slugOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

const uploadSchema = z.object({
  title: z.string().trim().max(80),
  alt: z.string().trim().max(200),
  decorative: z.coerce.boolean(),
  tags: z.string().trim().max(200),
});

export async function uploadMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('media.upload', async ({ db, staff }) => {
    const file = formData.get('file');
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, message: 'Choose a photo or video to upload.' };
    }

    const kind = ACCEPTED[file.type];
    if (!kind) {
      return {
        ok: false,
        message: `We cannot use ${file.type || 'that kind of file'}. Send a JPEG, PNG, WebP, AVIF, MP4 or WebM.`,
      };
    }

    const limit = kind === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > limit) {
      return {
        ok: false,
        message: `That file is ${(file.size / 1_000_000).toFixed(1)}MB. The limit for a ${kind} is ${limit / 1_000_000}MB — try exporting it smaller.`,
      };
    }

    const parsed = uploadSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Please check the description.' };
    const value = parsed.data;

    if (!value.decorative && !value.alt.trim()) {
      return {
        ok: false,
        message:
          'Add a short description of what the photo shows, or tick “decorative” if it carries no information.',
      };
    }
    if (kind === 'video') {
      return {
        ok: false,
        message:
          'Videos need a still poster frame and a matching crop, so a developer places them. Send the file to them and it will be wired up.',
      };
    }

    const base = slugOf(file.name) || 'upload';
    const existing = await db.list<Row>('media_assets');
    let assetId = base;
    let n = 2;
    while (existing.some((row) => row.asset_id === assetId)) assetId = `${base}-${n++}`;

    const extension = file.name.match(/\.[a-z0-9]+$/i)?.[0] ?? '.jpg';
    const filename = `${assetId}${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    let publicPath: string;
    if (isLocalDb()) {
      // Development only. In production this branch is unreachable, because
      // `getWriteDb` refuses to hand back a local database there.
      const dir = path.join(process.cwd(), 'public', 'media', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, filename), bytes);
      publicPath = `/media/uploads/${filename}`;
    } else {
      const supabase = await getSessionClient();
      if (!supabase) return { ok: false, message: 'Could not reach the file store.' };
      const { error } = await supabase.storage
        .from('media')
        .upload(filename, bytes, { contentType: file.type, upsert: false });
      if (error) return { ok: false, message: `Upload failed: ${error.message}` };
      publicPath = supabase.storage.from('media').getPublicUrl(filename).data.publicUrl;
    }

    const size = await imageSize(bytes);

    await db.insert('media_assets', {
      asset_id: assetId,
      path: publicPath,
      title: value.title || file.name,
      alt: value.decorative ? null : value.alt,
      decorative: value.decorative,
      kind,
      width: size?.width ?? 0,
      height: size?.height ?? 0,
      ratio: size ? `${size.width}:${size.height}` : '',
      focal: '50% 50%',
      poster: null,
      status: 'final',
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      size_bytes: file.size,
      mime: file.type,
      duration_seconds: null,
      uploaded_by: staff.source === 'supabase' ? staff.id : null,
      draft: null,
      archived_at: null,
    });

    return done(`Uploaded “${value.title || file.name}”. You can use it anywhere now.`, 'media');
  });
}

/**
 * Pixel dimensions, read from the file header.
 *
 * Recorded so the admin can warn about a photo that is too small for the slot it
 * is dropped into, and so the layout can reserve the right space before the image
 * arrives. Unknown dimensions are stored as zero rather than guessed.
 */
async function imageSize(bytes: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    const { default: sharp } = await import('sharp');
    const meta = await sharp(bytes).metadata();
    return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
  } catch {
    return null;
  }
}

const repointSchema = z.object({
  assetId: z.string().min(1),
  replacementId: z.string().min(1),
});

/**
 * Point a design-placed slot at a different file.
 *
 * Most photographs on this website are not chosen by a staff member — they are
 * written into the layout as `<Asset id="dishQuesabirria" />`, because the
 * composition is built around that shape and that focal point. There is no
 * reference row to repoint, so `replaceMedia` cannot touch them, and until now
 * the admin correctly said "swapping this is a job for your developer".
 *
 * It is not any more. The public site resolves every image through the media
 * record, so changing which FILE a slot points at changes the website. The slot
 * keeps its id, its crop and its place in the design; only the picture changes.
 *
 * The alt text comes across with the file, because a description that stays
 * behind describes the wrong photograph — the single most common way an image
 * swap breaks a screen reader.
 */
export async function repointMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db, staff }) => {
    const parsed = repointSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not swap that photo.' };
    const { assetId, replacementId } = parsed.data;

    if (assetId === replacementId) {
      return { ok: false, message: 'That is the photo already in this slot.' };
    }

    const [slot, replacement] = await Promise.all([
      db.get<Row>('media_assets', assetId),
      db.get<Row>('media_assets', replacementId),
    ]);
    if (!slot) return { ok: false, message: 'That slot no longer exists.' };
    if (!replacement?.path) return { ok: false, message: 'Pick a photo that has a file.' };

    if (replacement.kind !== slot.kind) {
      return {
        ok: false,
        message: `This slot holds a ${slot.kind}. Pick a ${slot.kind} to put in it.`,
      };
    }

    // Snapshot first. Repointing a slot replaces the only record of which file
    // used to be in it, so without this the swap would be one-way — and "put the
    // old photo back" is the first thing anyone asks for after a swap.
    await publishDirect(db, 'media_assets', assetId, {
      path: replacement.path,
      width: replacement.width,
      height: replacement.height,
      ratio: replacement.ratio,
      mime: replacement.mime,
      size_bytes: replacement.size_bytes,
      poster: replacement.poster ?? slot.poster ?? null,
      alt: replacement.decorative ? null : (replacement.alt ?? slot.alt),
      decorative: Boolean(replacement.decorative),
      status: 'final',
    }, staff);

    const entry = await getMedia(db, assetId);
    const routes = [
      ...(entry?.usage ?? []).map((use) => use.route),
      ...routesOfRegistryUsage(entry?.registryUsage ?? []),
    ];

    return done('Swapped. Every place that uses this photo now shows the new one.', 'media', routes);
  });
}

const detailsSchema = z.object({
  assetId: z.string().min(1),
  title: z.string().trim().max(80),
  alt: z.string().trim().max(200),
  decorative: z.coerce.boolean(),
  tags: z.string().trim().max(200),
  focal: z.string().trim().max(20),
});

export async function saveMediaDetails(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = detailsSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not save that.' };
    const value = parsed.data;

    if (!value.decorative && !value.alt.trim()) {
      return {
        ok: false,
        message:
          'Add a short description of what the photo shows, or tick “decorative” if it carries no information.',
      };
    }

    await db.update('media_assets', value.assetId, {
      title: value.title,
      alt: value.decorative ? null : value.alt,
      decorative: value.decorative,
      tags: value.tags ? value.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      focal: /^\d{1,3}% \d{1,3}%$/.test(value.focal) ? value.focal : '50% 50%',
    });

    return done('Saved.', 'media');
  });
}

const archiveSchema = z.object({ assetId: z.string().min(1), confirm: z.string().optional() });

/**
 * Archiving a photo that is still on the website is refused, and the refusal
 * lists every place using it. Confirming does not force it through — it archives
 * only once the references are gone.
 */
export async function archiveMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.archive', async ({ db, staff }) => {
    const parsed = archiveSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not archive that.' };

    const entry = await getMedia(db, parsed.data.assetId);
    if (!entry) return { ok: false, message: 'That photo no longer exists.' };

    const usage = await usageOf(db, parsed.data.assetId);
    if (usage.length > 0) {
      const where = usage.map((use) => use.label).join(', ');
      return {
        ok: false,
        message: `Still in use in ${usage.length} ${usage.length === 1 ? 'place' : 'places'}: ${where}. Swap the photo there first, then archive this one.`,
      };
    }

    // Placements the design fixes — a component asking for this asset by name —
    // cannot be changed from here, so archiving would leave a hole on a page.
    if (entry.registryUsage.length > 0) {
      return {
        ok: false,
        message: `The design places this photo on ${entry.registryUsage.join(', ')}. Ask your developer to swap it there first — archiving it here would leave a gap.`,
      };
    }

    await archive(db, 'media_assets', parsed.data.assetId, staff);
    return done('Archived. The file is kept, it is just not offered any more.', 'media');
  });
}

export async function unarchiveMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.archive', async ({ db }) => {
    const parsed = archiveSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not restore that.' };
    await unarchive(db, 'media_assets', parsed.data.assetId);
    return done('Back in the library.', 'media');
  });
}

const replaceSchema = z.object({
  assetId: z.string().min(1),
  replacementId: z.string().min(1),
  scope: z.enum(['one', 'all']),
  /** For `one`: the record to change. */
  target: z.string().optional(),
});

/**
 * Swap a photo — in one place, or everywhere it appears.
 *
 * Asking which is not a nicety: "replace the homepage picture" and "replace this
 * picture everywhere" are different intentions, and guessing wrong silently
 * changes pages the person was not looking at.
 */
export async function replaceMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = replaceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not swap that photo.' };
    const { assetId, replacementId, scope, target } = parsed.data;

    const replacement = await db.get<Row>('media_assets', replacementId);
    if (!replacement) return { ok: false, message: 'Pick a photo to use instead.' };

    let changed = 0;

    const swap = async (table: string, column: string, id: string) => {
      await db.update(table, id, { [column]: replacementId });
      changed += 1;
    };

    if (scope === 'one' && target) {
      const [table, column, id] = target.split('|');
      if (!table || !column || !id) return { ok: false, message: 'Could not swap that photo.' };
      await swap(table, column, id);
    } else {
      for (const row of await db.list<Row>('event_series')) {
        if (row.flyer_asset_id === assetId) await swap('event_series', 'flyer_asset_id', String(row.slug));
      }
      for (const row of await db.list<Row>('event_occurrences')) {
        if (row.flyer_asset_id === assetId) await swap('event_occurrences', 'flyer_asset_id', String(row.id));
      }
      for (const row of await db.list<Row>('page_sections')) {
        if (row.media_asset_id === assetId) await swap('page_sections', 'media_asset_id', String(row.id));
      }
      for (const row of await db.list<Row>('menu_items')) {
        if (row.media_asset_id === assetId) await swap('menu_items', 'media_asset_id', String(row.id));
      }
    }

    if (changed === 0) return { ok: false, message: 'Nothing was using that photo.' };
    return done(
      scope === 'one'
        ? 'Swapped in that one place. Everywhere else is unchanged.'
        : `Swapped in ${changed} ${changed === 1 ? 'place' : 'places'}.`,
      'media',
    );
  });
}
