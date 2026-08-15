'use server';

import { z } from 'zod';
import type { Row } from '@/lib/db/types';
import { venueIsoDate } from '@/lib/events';
import { staffCan } from '../auth';
import { archive, publishDirect, saveDraft } from '../content/editorial';
import { done, run, saved, type ActionState } from './shared';

/**
 * Event mutations.
 *
 * The shape of this file follows the shape of the data: a series carries the
 * defaults, and an occurrence row exists only when one night differs. So there is
 * no "create the next twelve Fridays" action — the dates are generated — and
 * instead there is "make this one night different", which is the thing a
 * restaurant actually does.
 */

const httpsUrl = z
  .string()
  .trim()
  .refine((value) => !value || /^https:\/\/\S+$/i.test(value), {
    message: 'A ticket link has to start with https://',
  });

/* ------------------------------------------------------------------ series */

const seriesSchema = z.object({
  slug: z.string().min(1),
  title: z.string().trim().min(1, 'The night needs a name.').max(120),
  summary: z.string().trim().max(200),
  description: z.string().trim().max(1200),
  ageMin: z.string().trim().max(3),
  ageNote: z.string().trim().max(120),
  music: z.string().trim().max(200),
  price: z.string().trim().max(12),
  ticketPolicy: z.enum(['required', 'door', 'free', 'later']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use a time like 22:00.'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use a time like 02:00.'),
  publish: z.string().optional(),
});

function minutesOf(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export async function saveSeries(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db, staff }) => {
    const parsed = seriesSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, message: issue?.message ?? 'Please check the form.' };
    }

    const value = parsed.data;
    const start = minutesOf(value.startTime);
    let end = minutesOf(value.endTime);
    // A close time at or before the door time means it closes after midnight,
    // which is the normal case here — 10pm to 2am.
    if (end <= start) end += 1440;

    const price = value.price.replace(/[$,\s]/g, '');
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      return { ok: false, message: 'Enter the entry price as a number, for example 10.' };
    }

    const fields: Row = {
      title: value.title,
      summary: value.summary,
      description: value.description,
      age_min: value.ageMin ? Number(value.ageMin) : null,
      age_note: value.ageNote || null,
      music_formats: value.music.split(',').map((s) => s.trim()).filter(Boolean),
      price_cents: price ? Math.round(Number(price) * 100) : null,
      ticket_policy: value.ticketPolicy,
      start_minutes: start,
      end_minutes: end,
    };

    const wantsPublish = value.publish === 'true' && staffCan(staff, 'content.publish');
    if (wantsPublish) {
      await publishDirect(db, 'event_series', value.slug, fields, staff);
      return done(`${value.title} updated. Every future date uses these details.`, 'events');
    }

    await saveDraft(db, 'event_series', value.slug, fields, staff);
    return saved('Saved as a draft. A manager needs to publish it.');
  });
}

const pauseSchema = z.object({ slug: z.string().min(1), paused: z.enum(['true', 'false']) });

/**
 * Pausing stops generating future dates without losing the series or its history —
 * the honest way to say "we are not running this at the moment".
 */
export async function setSeriesPaused(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.publish', async ({ db, staff }) => {
    const parsed = pauseSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not change that.' };

    const paused = parsed.data.paused === 'true';
    await publishDirect(db, 'event_series', parsed.data.slug, { paused }, staff);
    return done(
      paused
        ? 'Paused. No new dates will appear on the website until you start it again.'
        : 'Running again. Future dates are back on the website.',
      'events',
    );
  });
}

/* -------------------------------------------------------------- occurrence */

const overrideSchema = z.object({
  seriesSlug: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['scheduled', 'sold-out', 'cancelled', 'postponed', 'free']),
  ticketUrl: httpsUrl,
  price: z.string().trim().max(12),
  flyerAssetId: z.string().trim().max(60),
  title: z.string().trim().max(120),
  note: z.string().trim().max(300),
});

/**
 * Make one night different.
 *
 * A blank field means "use the series default", which is why every value is
 * written as null rather than as an empty string — an empty string would be an
 * override that says "nothing", and the night would lose its music or its name.
 */
export async function saveOccurrence(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = overrideSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
    }

    const value = parsed.data;
    const price = value.price.replace(/[$,\s]/g, '');
    if (price && (!Number.isFinite(Number(price)) || Number(price) < 0)) {
      return { ok: false, message: 'Enter the entry price as a number, for example 10.' };
    }

    const id = `${value.seriesSlug}:${value.date}`;
    const fields: Row = {
      id,
      series_slug: value.seriesSlug,
      starts_at: value.date,
      ends_at: value.date,
      status: value.status,
      ticket_url: value.ticketUrl || null,
      price_cents: price ? Math.round(Number(price) * 100) : null,
      flyer_asset_id: value.flyerAssetId || null,
      title: value.title || null,
      note: value.note || null,
      published: true,
      draft: null,
      archived_at: null,
    };

    // Nothing left to override: drop the row so the night goes back to being a
    // plain generated date with no record attached at all.
    const empty =
      value.status === 'scheduled' &&
      !value.ticketUrl &&
      !price &&
      !value.flyerAssetId &&
      !value.title &&
      !value.note;

    if (empty) {
      await db.remove('event_occurrences', id);
      return done('This night is back to the usual details.', 'events');
    }

    await db.upsert('event_occurrences', fields);
    return done(
      value.status === 'cancelled'
        ? 'This night is marked cancelled. Every other date is unchanged.'
        : 'Saved for this night only.',
      'events',
    );
  });
}

const clearSchema = z.object({ id: z.string().min(1) });

export async function clearOccurrence(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = clearSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not reset that night.' };
    await db.remove('event_occurrences', parsed.data.id);
    return done('Back to the usual details for that night.', 'events');
  });
}

/**
 * Paste a list of ticket links, one per line, as `YYYY-MM-DD https://…`.
 *
 * Typing twelve links into twelve inputs is the kind of task people stop doing,
 * and stale ticket links are worse than none.
 */
const bulkSchema = z.object({
  seriesSlug: z.string().min(1),
  lines: z.string().max(4000),
});

export async function setTicketLinks(_prev: ActionState, formData: FormData): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = bulkSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not read that list.' };

    const problems: string[] = [];
    let applied = 0;

    for (const raw of parsed.data.lines.split('\n')) {
      const line = raw.trim();
      if (!line) continue;

      const match = /^(\d{4}-\d{2}-\d{2})[\s,]+(\S+)$/.exec(line);
      if (!match) {
        problems.push(`Could not read: “${line}”`);
        continue;
      }
      const [, date, url] = match;
      if (!/^https:\/\//i.test(url!)) {
        problems.push(`${date}: a ticket link has to start with https://`);
        continue;
      }

      const id = `${parsed.data.seriesSlug}:${date}`;
      const existing = await db.get<Row>('event_occurrences', id);
      await db.upsert('event_occurrences', {
        ...(existing ?? {
          id,
          series_slug: parsed.data.seriesSlug,
          starts_at: date,
          ends_at: date,
          status: 'scheduled',
          published: true,
        }),
        ticket_url: url,
      });
      applied += 1;
    }

    if (applied === 0) {
      return { ok: false, message: problems[0] ?? 'Nothing to add. Use: 2026-08-21 https://…' };
    }

    const message = `${applied} ticket ${applied === 1 ? 'link' : 'links'} saved.`;
    return problems.length
      ? saved(`${message} ${problems.length} line(s) skipped: ${problems[0]}`)
      : done(message, 'events');
  });
}

/* ---------------------------------------------------------- one-time event */

const oneTimeSchema = z.object({
  title: z.string().trim().min(1, 'Give the event a name.').max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date.'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use a time like 21:00.'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Use a time like 01:00.'),
  description: z.string().trim().max(1200),
  ageMin: z.string().trim().max(3),
  music: z.string().trim().max(200),
  price: z.string().trim().max(12),
  ticketUrl: httpsUrl,
});

/**
 * A one-time event starts as a DRAFT.
 *
 * Nothing half-entered should be able to appear on the website between "save" and
 * "finish filling it in", so publication is always a second, deliberate action.
 */
export async function createOneTimeEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.edit', async ({ db }) => {
    const parsed = oneTimeSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the form.' };
    }

    const value = parsed.data;
    const startsAt = venueInstant(value.date, value.startTime);
    let endsAt = venueInstant(value.date, value.endTime);
    // An end time before the start means the night runs past midnight.
    if (new Date(endsAt) <= new Date(startsAt)) {
      const next = new Date(new Date(value.date).getTime() + 86_400_000).toISOString().slice(0, 10);
      endsAt = venueInstant(next, value.endTime);
    }

    const price = value.price.replace(/[$,\s]/g, '');
    const slug = value.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);

    await db.insert('event_occurrences', {
      id: `one-time:${slug}:${value.date}`,
      series_slug: null,
      slug: `${slug}-${value.date}`,
      title: value.title,
      description: value.description || null,
      starts_at: startsAt,
      ends_at: endsAt,
      status: 'scheduled',
      age_min: value.ageMin ? Number(value.ageMin) : null,
      music_formats: value.music.split(',').map((s) => s.trim()).filter(Boolean),
      price_cents: price ? Math.round(Number(price) * 100) : null,
      ticket_url: value.ticketUrl || null,
      published: false,
      draft: null,
      archived_at: null,
    });

    return saved(`“${value.title}” saved as a draft. Publish it when the details are final.`);
  });
}

/** A venue-local wall clock time as an instant, DST included. */
function venueInstant(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const naive = Date.UTC(year!, month! - 1, day!, hour!, minute!);
  const offset = (): number => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date(naive));
    const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-6';
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
    if (!match) return -360;
    return (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] ?? 0));
  };
  return new Date(naive - offset() * 60_000).toISOString();
}

const publishOccurrenceSchema = z.object({ id: z.string().min(1), published: z.enum(['true', 'false']) });

export async function setOccurrencePublished(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.publish', async ({ db }) => {
    const parsed = publishOccurrenceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not change that.' };

    const published = parsed.data.published === 'true';
    await db.update('event_occurrences', parsed.data.id, { published });
    return done(
      published ? 'Published. It is on the website now.' : 'Taken off the website.',
      'events',
    );
  });
}

export async function archiveOccurrence(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return run('content.archive', async ({ db, staff }) => {
    const parsed = clearSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, message: 'Could not archive that.' };
    await archive(db, 'event_occurrences', parsed.data.id, staff);
    return done('Archived. It is off the website but kept in your history.', 'events');
  });
}

export { venueIsoDate };
