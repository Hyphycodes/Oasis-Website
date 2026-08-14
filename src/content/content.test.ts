import { describe, expect, it } from 'vitest';
import { assets as narrowAssets, type AssetRecord } from './assets';
import { cateringItems, cateringPackages } from './catering';
import { eventSeries } from './events';
import { allMenus } from './menu';
import { seo } from './pages';
import { site } from './site';

/**
 * Content integrity.
 *
 * These guard the honesty rules the project is built on — no invented prices, no
 * dead links, no stale dates, no fake social accounts. They fail loudly if a
 * future edit breaks one.
 */

/**
 * `assets` is declared with `as const satisfies`, so every property narrows to a
 * literal type. Widening it here lets the tests iterate generically.
 */
const assets: Record<string, AssetRecord> = narrowAssets;

const allItems = allMenus.flatMap((menu) =>
  menu.categories.flatMap((category) => category.items.map((item) => ({ menu, category, item }))),
);

describe('menus', () => {
  it('gives every unpriced item a price note instead of a blank or $0', () => {
    for (const { item } of allItems) {
      if (item.priceCents == null) {
        expect(item.priceNote, `${item.name} has no price and no note`).toBeTruthy();
      } else {
        expect(item.priceCents, `${item.name} is priced at 0`).toBeGreaterThan(0);
      }
    }
  });

  it('uses unique item ids within a menu', () => {
    for (const menu of allMenus) {
      const ids = menu.categories.flatMap((c) => c.items.map((i) => i.id));
      expect(new Set(ids).size, `duplicate ids in ${menu.slug}`).toBe(ids.length);
    }
  });

  it('never leaves a category or item unnamed', () => {
    for (const { category, item } of allItems) {
      expect(category.name.trim()).not.toBe('');
      expect(item.name.trim()).not.toBe('');
    }
  });

  it('keeps the brunch menu genuinely empty with an honest empty state', () => {
    const brunch = allMenus.find((menu) => menu.slug === 'brunch')!;
    expect(brunch.categories).toHaveLength(0);
    expect(brunch.emptyState).toBeTruthy();
    // It must not pretend a menu exists.
    expect(brunch.emptyState).toMatch(/finali/i);
  });

  it('carries no placeholder or development text', () => {
    const forbidden = /lorem ipsum|TODO|FIXME|coming soon!|placeholder text/i;
    for (const { item } of allItems) {
      expect(forbidden.test(item.name)).toBe(false);
      if (item.description) expect(forbidden.test(item.description)).toBe(false);
    }
  });

  it('avoids the generic luxury phrases the brief prohibits', () => {
    const banned = [
      'culinary excellence',
      'embark on a journey',
      'where flavor meets passion',
      'elevate your',
      'tantalize your taste buds',
    ];
    const corpus = allItems
      .map(({ item }) => `${item.name} ${item.description ?? ''}`)
      .join(' ')
      .toLowerCase();
    for (const phrase of banned) {
      expect(corpus, `found "${phrase}"`).not.toContain(phrase);
    }
  });

  it('normalises the spelling errors carried over from the live site', () => {
    const corpus = allItems.map(({ item }) => item.description ?? '').join(' ');
    expect(corpus).not.toMatch(/tomatoe\b/);
    expect(corpus).not.toMatch(/side of console/);
    expect(corpus).not.toMatch(/pickle red onions/);
  });
});

describe('event series', () => {
  it('carries no date field of any kind', () => {
    for (const series of eventSeries) {
      const keys = Object.keys(series);
      for (const forbidden of ['date', 'startsAt', 'endsAt', 'nextDate']) {
        expect(keys, `${series.slug} exposes ${forbidden}`).not.toContain(forbidden);
      }
    }
  });

  it('ends after it starts', () => {
    for (const series of eventSeries) {
      expect(series.endMinutes).toBeGreaterThan(series.startMinutes);
    }
  });

  it('points at an artwork asset that is never allowed to contain a date', () => {
    for (const series of eventSeries) {
      const asset = assets[series.artworkAssetId];
      expect(asset, `${series.slug} artwork missing`).toBeDefined();
      expect(asset?.containsText, `${series.slug} artwork may not contain a date`).not.toBe('date');
    }
  });

  it('has a unique slug per series', () => {
    const slugs = eventSeries.map((series) => series.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('site settings', () => {
  it('links only real social accounts', () => {
    // The live site links four platform homepages as though they were Oasis
    // accounts. Those must never come back.
    const platformHomepages = [
      'http://www.youtube.com/',
      'http://www.x.com/',
      'http://www.linkedin.com/',
      'http://www.tiktok.com/',
    ];
    for (const social of site.socials) {
      expect(platformHomepages).not.toContain(social.url);
      // A real account URL has a path beyond the origin.
      expect(new URL(social.url).pathname.replace(/\/$/, '')).not.toBe('');
    }
  });

  it('marks disputed facts as provisional', () => {
    expect(site.phone.provisional).toBe(true);
    expect(site.hours.provisional).toBe(true);
    expect(site.phone.note).toMatch(/CONTENT-QUESTIONS/);
  });

  it('never invents an email address or coordinates', () => {
    expect(site.email).toBeNull();
    expect(site.geo).toBeNull();
  });

  it('uses https for reservation and ordering', () => {
    expect(site.reservationUrl.startsWith('https://')).toBe(true);
    expect(site.orderUrl.startsWith('https://')).toBe(true);
  });

  it('covers all seven days of the week exactly once', () => {
    const days = site.hours.value.map((entry) => entry.day).sort();
    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
});

describe('catering', () => {
  it('prices every package and item', () => {
    for (const pkg of cateringPackages) {
      expect(pkg.priceCents).toBeGreaterThan(0);
      expect(pkg.includes.length).toBeGreaterThan(0);
    }
    for (const item of cateringItems) {
      expect(item.priceCents).toBeGreaterThan(0);
    }
  });

  it('keeps serves ranges coherent', () => {
    for (const pkg of cateringPackages) {
      if (pkg.servesMin != null && pkg.servesMax != null) {
        expect(pkg.servesMax).toBeGreaterThanOrEqual(pkg.servesMin);
      }
    }
  });
});

describe('seo', () => {
  it('keeps titles and descriptions within search-result limits', () => {
    for (const [page, entry] of Object.entries(seo)) {
      expect(entry.title.length, `${page} title too long`).toBeLessThanOrEqual(70);
      expect(entry.description.length, `${page} description too long`).toBeLessThanOrEqual(320);
      expect(entry.description.length, `${page} description too short`).toBeGreaterThanOrEqual(50);
    }
  });

  it('gives every page a unique title', () => {
    const titles = Object.values(seo).map((entry) => entry.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('assets', () => {
  it('gives every non-decorative asset unique alt text', () => {
    const alts = Object.values(assets)
      .map((asset) => asset.alt)
      .filter((alt): alt is string => Boolean(alt));
    expect(new Set(alts).size).toBe(alts.length);
  });

  it('requires a poster on every video', () => {
    for (const [id, asset] of Object.entries(assets)) {
      if (asset.kind === 'video') {
        expect(asset.poster, `${id} has no poster`).toBeTruthy();
      }
    }
  });

  it('keeps status and path in agreement', () => {
    for (const [id, asset] of Object.entries(assets)) {
      if (asset.status === 'placeholder') {
        expect(asset.path, `${id} is a placeholder but has a path`).toBeNull();
      } else {
        expect(asset.path, `${id} is ${asset.status} but has no path`).toBeTruthy();
      }
    }
  });
});
