import { assets, type AssetRecord } from '@/content/assets';
import { cateringItems, cateringPackages } from '@/content/catering';
import { eventOverrides, eventSeries } from '@/content/events';
import { allMenus } from '@/content/menu';
import { homeSections, pageCopy, seo } from '@/content/pages';
import { announcements, site } from '@/content/site';
import type { Row } from '@/lib/db/types';

/**
 * The single content mapping.
 *
 * Every current source file in `src/content/` is mapped to its destination table
 * and columns exactly once, here. Three things consume it:
 *
 *   1. the local development database, as its seed
 *   2. `npm run content:migrate`, which upserts into Supabase
 *   3. the migration tests, which assert the counts and the transformations
 *
 * Because it is one mapping, "what the admin edits" and "what the public site
 * falls back to" cannot describe different content. Every row carries the record's
 * real public identifier as its key — `quesabirrias`, `oasis-fridays`, `starters` —
 * so running the migration twice updates rather than duplicates.
 */

export type Tables = Record<string, Row[]>;

export interface MigrationReport {
  counts: Record<string, number>;
  transformed: string[];
  skipped: string[];
  invalid: string[];
}

/** Menu items whose price the restaurant genuinely does not publish anywhere. */
function priceMode(item: { priceCents: number | null; priceNote: string | null }): string {
  if (item.priceCents != null) return 'fixed';
  return /market/i.test(item.priceNote ?? '') ? 'market' : 'ask-server';
}

export function buildRecords(): { tables: Tables; report: MigrationReport } {
  const tables: Tables = {};
  const transformed: string[] = [];
  const skipped: string[] = [];
  const invalid: string[] = [];

  const put = (table: string, rows: Row[]) => {
    tables[table] = rows;
  };

  /* ------------------------------------------------------------- settings */

  // The payload is EMPTY on purpose. It is a sparse override of the typed
  // defaults in src/content/site.ts, so an untouched install renders exactly what
  // the static modules say and nothing is duplicated into the database.
  put('site_settings', [{ id: 'default', payload: {} }]);

  put(
    'announcements',
    announcements.map((a) => ({
      id: a.id,
      message: a.message,
      href: a.href,
      link_label: a.linkLabel,
      starts_at: a.startsAt,
      ends_at: a.endsAt,
      enabled: a.enabled,
      tone: a.tone,
    })),
  );

  put(
    'special_hours',
    site.temporaryClosures.map((closure) => ({
      id: closure.id,
      on_date: closure.date,
      closed: closure.allDay,
      ranges: [],
      note: closure.reason,
    })),
  );

  /* ----------------------------------------------------------------- menu */

  const menus: Row[] = [];
  const categories: Row[] = [];
  const items: Row[] = [];
  const modifiers: Row[] = [];

  allMenus.forEach((menu, menuIndex) => {
    menus.push({
      slug: menu.slug,
      title: menu.title,
      note: menu.note,
      empty_state: menu.emptyState,
      sort: menuIndex,
      draft: null,
      archived_at: null,
    });

    menu.categories.forEach((category, categoryIndex) => {
      categories.push({
        id: category.id,
        menu_slug: menu.slug,
        name: category.name,
        note: category.note,
        sort: categoryIndex,
        draft: null,
        archived_at: null,
      });

      category.items.forEach((item, itemIndex) => {
        if (item.priceCents == null && !item.priceNote) {
          invalid.push(`menu_items:${item.id} — no price and no note`);
          return;
        }

        const mode = priceMode(item);
        if (mode !== 'fixed') {
          transformed.push(`menu_items:${item.id} — price_mode "${mode}" from priceNote`);
        }

        items.push({
          id: item.id,
          category_id: category.id,
          name: item.name,
          description: item.description,
          price_mode: mode,
          price_cents: mode === 'fixed' ? item.priceCents : null,
          price_note: mode === 'fixed' ? null : item.priceNote,
          modifier_group_label: item.modifierGroupLabel,
          dietary: item.dietary,
          availability: item.available ? 'available' : 'unavailable',
          availability_note: null,
          available: item.available,
          featured: item.featured,
          media_asset_id: null,
          sort: itemIndex,
          draft: null,
          archived_at: null,
        });

        item.modifiers.forEach((modifier, modifierIndex) => {
          modifiers.push({
            // Deterministic, so re-running the migration updates the same row
            // rather than appending a second copy of every add-on.
            id: `${item.id}:${modifierIndex}`,
            item_id: item.id,
            label: modifier.label,
            price_cents: modifier.priceCents,
            sort: modifierIndex,
          });
        });
      });
    });
  });

  put('menus', menus);
  put('menu_categories', categories);
  put('menu_items', items);
  put('menu_modifiers', modifiers);

  /* --------------------------------------------------------------- events */

  put(
    'event_series',
    eventSeries.map((series, index) => ({
      slug: series.slug,
      title: series.title,
      summary: series.summary,
      description: series.description,
      cadence:
        series.cadence.kind === 'weekly' ? `weekly:${series.cadence.weekday}` : 'one-time',
      start_minutes: series.startMinutes,
      end_minutes: series.endMinutes,
      age_min: series.ageMin,
      age_note: series.ageNote,
      music_formats: series.musicFormats,
      venue_name: series.venueName,
      artwork_asset_id: series.artworkAssetId,
      flyer_asset_id: series.flyerAssetId,
      flyer_printed_date: series.flyerPrintedDate,
      ticket_url: series.ticketUrl,
      ticket_policy: 'required',
      price_cents: series.priceCents,
      status: series.status,
      paused: false,
      series_ends_on: series.seriesEndsOn,
      sort: index,
      draft: null,
      archived_at: null,
    })),
  );

  put(
    'event_occurrences',
    eventOverrides.map((override) => ({
      id: `${override.seriesSlug}:${override.date}`,
      series_slug: override.seriesSlug,
      starts_at: override.date,
      ends_at: override.date,
      status: override.status ?? 'scheduled',
      ticket_url: override.ticketUrl ?? null,
      price_cents: override.priceCents ?? null,
      published: true,
      draft: null,
      archived_at: null,
    })),
  );

  /* ------------------------------------------------------------- catering */

  put(
    'catering_packages',
    cateringPackages.map((pkg, index) => ({
      id: pkg.id,
      name: pkg.name,
      serves_min: pkg.servesMin,
      serves_max: pkg.servesMax,
      price_cents: pkg.priceCents,
      includes: pkg.includes,
      sort: index,
      draft: null,
      archived_at: null,
    })),
  );

  put(
    'catering_items',
    cateringItems.map((item, index) => ({
      id: item.id,
      name: item.name,
      price_cents: item.priceCents,
      note: item.note,
      sort: index,
      draft: null,
      archived_at: null,
    })),
  );

  /* ---------------------------------------------------------------- pages */

  const sections: Row[] = homeSections.map((section, index) => ({
    id: `home:${section.key}`,
    page: 'home',
    key: section.key,
    eyebrow: section.eyebrow,
    heading: section.heading,
    body: section.body,
    visible: section.visible,
    variant: section.variant,
    media_asset_id: null,
    cta_label: null,
    cta_href: null,
    sort: index,
    draft: null,
    archived_at: null,
  }));

  // The route openers are the same kind of record — an eyebrow, a heading and a
  // sentence, in a slot the design already has. Naming them here is what lets the
  // Website section edit them without inventing a page builder.
  const openers: [string, { eyebrow?: string; heading: string; body?: string }][] = [
    ['menu', pageCopy.menu],
    ['events', pageCopy.events],
    ['catering', pageCopy.catering],
    ['private-events', pageCopy.privateEvents],
    ['visit', pageCopy.visit],
    ['careers', pageCopy.careers],
  ];

  openers.forEach(([page, copy], index) => {
    sections.push({
      id: `${page}:opener`,
      page,
      key: 'opener',
      eyebrow: copy.eyebrow ?? null,
      heading: copy.heading,
      body: copy.body ?? null,
      visible: true,
      variant: 'plain',
      media_asset_id: null,
      cta_label: null,
      cta_href: null,
      sort: index,
      draft: null,
      archived_at: null,
    });
  });

  sections.push({
    id: 'home:hero',
    page: 'home',
    key: 'hero',
    eyebrow: 'Lockport, Illinois',
    heading: pageCopy.home.heroHeadlineLines.join(' '),
    body: pageCopy.home.heroBody,
    visible: true,
    variant: 'band',
    media_asset_id: 'heroVideo',
    cta_label: null,
    cta_href: null,
    sort: -1,
    draft: null,
    archived_at: null,
  });

  put('page_sections', sections);

  put(
    'page_seo',
    Object.entries(seo).map(([page, entry]) => ({
      page,
      title: entry.title,
      description: entry.description,
      og_asset_id: entry.ogAssetId,
    })),
  );

  // The safe editable option lists. Locked-down form mechanics — validation,
  // spam protection, delivery — are deliberately NOT here.
  put('page_lists', [
    {
      id: 'careers:positions',
      page: 'careers',
      key: 'positions',
      label: 'Positions people can apply for',
      items: [
        'Server',
        'Bartender',
        'Host',
        'Line cook',
        'Prep cook',
        'Dishwasher',
        'Busser',
        'Something else',
      ],
      draft: null,
      archived_at: null,
    },
    {
      id: 'careers:perks',
      page: 'careers',
      key: 'perks',
      label: 'Perks listed on the careers page',
      items: [...pageCopy.careers.perks],
      draft: null,
      archived_at: null,
    },
    {
      id: 'private-events:types',
      page: 'private-events',
      key: 'types',
      label: 'Celebration types in the enquiry form',
      items: [
        'Birthday',
        'Quinceañera',
        'Graduation',
        'Corporate / team',
        'Rehearsal dinner',
        'Other celebration',
      ],
      draft: null,
      archived_at: null,
    },
  ]);

  /* ---------------------------------------------------------------- media */

  put(
    'media_assets',
    Object.entries(assets as Record<string, AssetRecord>).map(([id, asset]) => {
      if (!asset.path && asset.status !== 'placeholder') {
        invalid.push(`media_assets:${id} — no file but status "${asset.status}"`);
      }
      if (!asset.path) skipped.push(`media_assets:${id} — reserved slot, no file yet`);

      return {
        asset_id: id,
        path: asset.path,
        // A null alt in the registry is an explicit "decorative" decision, and it
        // has to survive as one — not as missing alt text somebody later "fixes".
        alt: asset.alt,
        decorative: asset.alt === null,
        title: id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase()),
        kind: asset.kind === 'vector' ? 'image' : asset.kind,
        width: asset.width,
        height: asset.height,
        ratio: asset.ratio,
        focal: asset.focal,
        poster: asset.poster ?? null,
        status: asset.status,
        tags: mediaTags(id, asset),
        size_bytes: null,
        mime: null,
        duration_seconds: null,
        draft: null,
        archived_at: null,
      };
    }),
  );

  const counts = Object.fromEntries(
    Object.entries(tables).map(([table, rows]) => [table, rows.length]),
  );

  return { tables, report: { counts, transformed, skipped, invalid } };
}

/** The small controlled tag list from the brief, assigned from real placement. */
function mediaTags(id: string, asset: AssetRecord): string[] {
  const tags = new Set<string>();
  const usage = asset.usage.join(' ').toLowerCase();
  const key = id.toLowerCase();

  if (asset.status === 'brand' || key.startsWith('brand')) tags.add('Brand');
  if (/menu\//.test(asset.path ?? '') || /dish|plate|birria|consomme/.test(key)) tags.add('Food');
  if (/cocktail|margarita|bar/.test(key)) tags.add('Drinks');
  if (/flyer|event/.test(key) || /event/.test(usage)) tags.add('Events');
  if (/room|dining|hero/.test(key)) tags.add('Room');
  if (/exterior/.test(key)) tags.add('Exterior');
  if (/team|bartender|careers/.test(key) || /careers/.test(usage)) tags.add('Team');

  return [...tags];
}
