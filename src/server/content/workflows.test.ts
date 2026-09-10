import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LocalDb } from '@/lib/db/local';
import type { Db, Row } from '@/lib/db/types';
import { getUpcomingEvents, nextEvent, venueIsoDate } from '@/lib/events';
import { buildRecords } from '@/server/migration/records';
import type { Staff } from '../auth';
import { archive, publishDirect, saveDraft } from './editorial';
import { getEditableEvents } from './events';
import { getMediaLibrary, usageOf } from './media';
import { getEditableMenus, priceFields } from './menu';

/**
 * The acceptance scenarios, run against a real database.
 *
 * These are the release-gate items: a draft must never reach a public read,
 * hidden means hidden, a cancelled night must not become "what's on", and media
 * that is still in use must not be removable. Each one is exercised through the
 * same repository code the admin and the public site call.
 */

const manager: Staff = {
  id: 'test-manager',
  email: 'manager@oasis.local',
  name: 'Alex',
  role: 'admin',
  sections: [],
  active: true,
  source: 'local',
};

let dir: string;
let db: Db;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'oasis-workflow-'));
  db = new LocalDb(dir, () => buildRecords().tables);
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

/** The published menu, exactly as a guest would receive it. */
async function publicMenus() {
  const { getPublicMenus } = await import('./menu');
  const { __setLocalDbForTests } = await import('@/lib/db');
  __setLocalDbForTests(db as LocalDb);
  return getPublicMenus();
}

function findItem(menus: Awaited<ReturnType<typeof publicMenus>>, id: string) {
  return menus.flatMap((m) => m.categories.flatMap((c) => c.items)).find((i) => i.id === id);
}

describe('the migration', () => {
  it('imports every menu item exactly once, keeping display order', async () => {
    const { report } = buildRecords();
    const rows = await db.list<Row>('menu_items');
    const ids = rows.map((row) => row.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(report.counts.menu_items).toBe(rows.length);

    const starters = rows
      .filter((row) => row.category_id === 'starters')
      .sort((a, b) => Number(a.sort) - Number(b.sort));
    expect(starters[0]!.id).toBe('oasis-wings');
  });

  it('is idempotent — running it twice does not duplicate anything', async () => {
    const before = (await db.list<Row>('menu_items')).length;
    for (const row of buildRecords().tables.menu_items!) {
      await db.upsert('menu_items', row);
    }
    expect((await db.list<Row>('menu_items')).length).toBe(before);
  });

  it('keeps a numeric price and an “Ask your server” apart', async () => {
    const queso = await db.get<Row>('menu_items', 'queso-dip');
    const margarita = await db.get<Row>('menu_items', 'margarita');

    expect(queso!.price_mode).toBe('fixed');
    expect(queso!.price_cents).toBe(900);
    expect(margarita!.price_mode).toBe('ask-server');
    expect(margarita!.price_cents).toBeNull();
    expect(margarita!.price_note).toBeTruthy();
  });

  it('keeps modifier prices in whole cents, with their decimals intact', async () => {
    const modifiers = await db.list<Row>('menu_modifiers');
    const priced = modifiers.filter((row) => row.price_cents != null);
    expect(priced.length).toBeGreaterThan(0);
    for (const row of priced) expect(Number.isInteger(row.price_cents)).toBe(true);
  });

  it('preserves the current temporary-unavailability state', async () => {
    const ribeye = await db.get<Row>('menu_items', 'mexican-rib-eye');
    expect(ribeye!.availability).toBe('unavailable');
  });

  it('keeps brunch empty, with its honest message', async () => {
    const brunch = await db.get<Row>('menus', 'brunch');
    const categories = await db.list<Row>('menu_categories', { where: { menu_slug: 'brunch' } });
    expect(categories).toHaveLength(0);
    expect(String(brunch!.empty_state)).toMatch(/finali/i);
  });

  it('carries both event series with their music, times and age rules', async () => {
    const series = await db.list<Row>('event_series');
    expect(series.map((s) => s.slug).sort()).toEqual(['oasis-fridays', 'oasis-latin-saturdays']);
    for (const row of series) {
      expect((row.music_formats as string[]).length).toBeGreaterThan(0);
      expect(row.age_min).toBe(18);
      expect(row.start_minutes).toBe(1320);
      expect(row.end_minutes).toBe(1560);
    }
  });

  it('keeps every media asset and its alt text', async () => {
    const media = await db.list<Row>('media_assets');
    expect(media.length).toBeGreaterThan(15);
    for (const row of media) {
      // Either it describes itself, or it is explicitly decorative.
      expect(Boolean(row.alt) || row.decorative === true).toBe(true);
    }
  });
});

describe('a price change', () => {
  it('reaches the guest, formatted', async () => {
    await publishDirect(db, 'menu_items', 'queso-dip', priceFields('fixed', '11.50'), manager);
    const item = findItem(await publicMenus(), 'queso-dip');
    expect(item!.priceCents).toBe(1150);
  });

  it('switching to “ask your server” removes the number entirely', async () => {
    await publishDirect(db, 'menu_items', 'queso-dip', priceFields('ask-server', ''), manager);
    const item = findItem(await publicMenus(), 'queso-dip');
    // A stale number reaching the page is the failure this guards.
    expect(item!.priceCents).toBeNull();
    expect(item!.priceNote).toBe('Ask your server');
  });

  it('refuses a price that is not a number', () => {
    expect(() => priceFields('fixed', 'twelve')).toThrow(/number/i);
    expect(() => priceFields('fixed', '-4')).toThrow(/number/i);
    expect(() => priceFields('fixed', '')).toThrow(/number/i);
  });
});

describe('availability', () => {
  it('sold out keeps the dish visible, flagged', async () => {
    await publishDirect(
      db,
      'menu_items',
      'birria-ramen',
      { availability: 'unavailable', available: false },
      manager,
    );
    const item = findItem(await publicMenus(), 'birria-ramen');
    expect(item).toBeDefined();
    expect(item!.available).toBe(false);
  });

  it('hidden removes it from the guest menu but keeps it in the admin', async () => {
    await publishDirect(
      db,
      'menu_items',
      'birria-ramen',
      { availability: 'hidden', available: false },
      manager,
    );

    expect(findItem(await publicMenus(), 'birria-ramen')).toBeUndefined();

    const admin = await getEditableMenus(db);
    const stillThere = admin
      .flatMap((m) => m.categories.flatMap((c) => c.items))
      .find((i) => i.id === 'birria-ramen');
    expect(stillThere?.availability).toBe('hidden');
  });
});

describe('drafts never leak', () => {
  it('a drafted price is invisible to guests until it is published', async () => {
    await saveDraft(db, 'menu_items', 'queso-dip', { price_cents: 9900 }, manager);

    const item = findItem(await publicMenus(), 'queso-dip');
    expect(item!.priceCents).toBe(900);

    const admin = await getEditableMenus(db);
    const working = admin
      .flatMap((m) => m.categories.flatMap((c) => c.items))
      .find((i) => i.id === 'queso-dip');
    expect(working!.priceCents).toBe(9900);
    expect(working!.state).toBe('changed');
  });

  it('a drafted event change is invisible on the public selector', async () => {
    await saveDraft(db, 'event_series', 'oasis-fridays', { title: 'Renamed Fridays' }, manager);

    const { getPublicEvents } = await import('./events');
    const { __setLocalDbForTests } = await import('@/lib/db');
    __setLocalDbForTests(db as LocalDb);

    const published = await getPublicEvents();
    expect(published.series.find((s) => s.slug === 'oasis-fridays')!.title).toBe('Oasis Fridays');

    const editable = await getEditableEvents(db);
    expect(editable.series.find((s) => s.slug === 'oasis-fridays')!.title).toBe('Renamed Fridays');
  });
});

describe('archiving', () => {
  it('takes a dish off the guest menu without deleting it', async () => {
    await archive(db, 'menu_items', 'queso-dip', manager);
    expect(findItem(await publicMenus(), 'queso-dip')).toBeUndefined();
    expect(await db.get('menu_items', 'queso-dip')).not.toBeNull();
  });

  it('a category with nothing left in it stops rendering as an empty heading', async () => {
    const items = await db.list<Row>('menu_items', { where: { category_id: 'sides' } });
    for (const row of items) await archive(db, 'menu_items', String(row.id), manager);

    const menus = await publicMenus();
    expect(menus.flatMap((m) => m.categories).find((c) => c.id === 'sides')).toBeUndefined();
  });
});

describe('one night, changed', () => {
  const now = new Date('2026-08-16T12:00:00Z');

  it('takes its own ticket link and artwork, and leaves the rest alone', async () => {
    await db.upsert('event_occurrences', {
      id: 'oasis-fridays:2026-08-21',
      series_slug: 'oasis-fridays',
      starts_at: '2026-08-21',
      ends_at: '2026-08-21',
      status: 'scheduled',
      ticket_url: 'https://tickets.example.com/aug21',
      flyer_asset_id: 'flyerLatinSaturdays',
      published: true,
    });

    const events = await getEditableEvents(db);
    const changed = getUpcomingEvents(events, now).find(
      (e) => venueIsoDate(e.startsAt) === '2026-08-21',
    )!;
    const untouched = getUpcomingEvents(events, now).find(
      (e) => venueIsoDate(e.startsAt) === '2026-08-28',
    )!;

    expect(changed.ticketUrl).toBe('https://tickets.example.com/aug21');
    expect(changed.flyerAssetId).toBe('flyerLatinSaturdays');
    expect(untouched.flyerAssetId).toBe('flyerFridays');
    expect(untouched.ticketUrl).toContain('oasis-fridays-2026-08-28');
  });

  it('cancelling it advances the next event without touching later dates', async () => {
    await db.upsert('event_occurrences', {
      id: 'oasis-fridays:2026-08-21',
      series_slug: 'oasis-fridays',
      starts_at: '2026-08-21',
      ends_at: '2026-08-21',
      status: 'cancelled',
      published: true,
    });

    const events = await getEditableEvents(db);
    const next = nextEvent(events, now, 'oasis-fridays')!;
    expect(venueIsoDate(next.startsAt)).toBe('2026-08-28');

    const listed = getUpcomingEvents(events, now).find(
      (e) => venueIsoDate(e.startsAt) === '2026-08-21',
    );
    // Still listed, so a ticket-holder finds out.
    expect(listed?.status).toBe('cancelled');
  });

  it('generates six weeks of dates with no duplicates, twice running', async () => {
    const events = await getEditableEvents(db);
    const first = getUpcomingEvents(events, now)
      .filter((e) => e.seriesSlug === 'oasis-fridays')
      .slice(0, 6);
    const second = getUpcomingEvents(await getEditableEvents(db), now)
      .filter((e) => e.seriesSlug === 'oasis-fridays')
      .slice(0, 6);

    expect(first).toHaveLength(6);
    expect(new Set(first.map((e) => e.id)).size).toBe(6);
    expect(second.map((e) => e.id)).toEqual(first.map((e) => e.id));
    // Generating dates must not write rows. Standalone one-off events live in
    // the same table, so the assertion is about this series, not the table.
    const rows = await db.list<{ series_slug: string | null }>('event_occurrences');
    expect(rows.filter((row) => row.series_slug === 'oasis-fridays')).toHaveLength(0);
  });
});

describe('media protection', () => {
  it('knows every place a photo is used, from the real records', async () => {
    const usage = await usageOf(db, 'flyerFridays');
    expect(usage.length).toBeGreaterThan(0);
    expect(usage[0]!.label).toMatch(/Fridays/);
    expect(usage[0]!.route).toBe('/events/oasis-fridays');
  });

  it('reports nothing for a photo that is genuinely unused', async () => {
    expect(await usageOf(db, 'privateEvents')).toHaveLength(0);
  });

  it('follows a swap, so the old photo is free and the new one is in use', async () => {
    await db.update('event_series', 'oasis-fridays', { flyer_asset_id: 'plateTorta' });
    expect(await usageOf(db, 'flyerFridays')).toHaveLength(0);
    expect((await usageOf(db, 'plateTorta')).length).toBeGreaterThan(0);
  });

  it('flags a photo with no description as a publication problem', async () => {
    await db.update('media_assets', 'plateTorta', { alt: '', decorative: false });
    const library = await getMediaLibrary(db);
    const entry = library.find((m) => m.assetId === 'plateTorta')!;
    const { mediaProblems } = await import('./media');
    expect(mediaProblems(entry).join(' ')).toMatch(/description/i);
  });
});

describe('the homepage stores nothing twice', () => {
  it('takes its event dates from the same selector /events uses', async () => {
    const events = await getEditableEvents(db);
    const now = new Date('2026-08-16T12:00:00Z');
    const sections = await db.list<Row>('page_sections', { where: { page: 'home' } });

    // No homepage section carries a date, a price or a dish name of its own.
    for (const section of sections) {
      const text = `${section.heading} ${section.body ?? ''}`;
      expect(text).not.toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(text).not.toMatch(/\$\d/);
    }

    expect(nextEvent(events, now)).not.toBeNull();
  });

  it('keeps address, phone and hours out of page records entirely', async () => {
    const sections = await db.list<Row>('page_sections');
    const settings = await db.get<Row>('site_settings', 'default');
    for (const section of sections) {
      const text = `${section.heading} ${section.body ?? ''}`;
      expect(text).not.toMatch(/\(\d{3}\)\s?\d{3}-\d{4}/);
      expect(text).not.toMatch(/\b1250 E/);
    }
    expect(settings).not.toBeNull();
  });
});

describe('media that the design places', () => {
  it('counts a design-fixed placement as still in use', async () => {
    const library = await getMediaLibrary(db);
    const backBar = library.find((m) => m.assetId === 'backBar')!;
    const { totalPlacements } = await import('./media');

    // Nothing in the database points at it — a component asks for it by name.
    expect(backBar.usage).toHaveLength(0);
    expect(backBar.registryUsage.length).toBeGreaterThan(0);
    // Which still has to read as "in use", or archiving would leave a gap.
    expect(totalPlacements(backBar)).toBeGreaterThan(0);
  });
});
