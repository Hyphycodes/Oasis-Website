/**
 * Generates supabase/seed.sql from the static content modules.
 *
 * The point: the owner never re-enters content that was already captured from the
 * live site. The TypeScript modules are the source of truth for the initial data,
 * and this script projects them into SQL so the database starts populated and
 * correct on day one.
 *
 * Run: npm run content:seed
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assets } from '../src/content/assets';
import { cateringItems, cateringPackages } from '../src/content/catering';
import { eventSeries } from '../src/content/events';
import { allMenus } from '../src/content/menu';
import { homeSections, seo } from '../src/content/pages';
import { announcements, site } from '../src/content/site';

const ROOT = path.resolve(import.meta.dirname, '..');

/** SQL literal. Everything goes through here — nothing is interpolated raw. */
function sql(value: unknown): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return `'{}'`;
    return `array[${value.map((v) => sql(v)).join(', ')}]::text[]`;
  }
  if (typeof value === 'object') return `${sql(JSON.stringify(value))}::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

const lines: string[] = [
  '-- GENERATED FILE — do not edit by hand.',
  '-- Produced by `npm run content:seed` from src/content/*.ts',
  '--',
  '-- Re-running is safe: every statement is an upsert keyed on the primary key,',
  '-- so seeding a database that the owner has already edited will overwrite the',
  '-- seeded rows and leave anything they added alone.',
  '',
  'begin;',
  '',
];

// ------------------------------------------------------------- settings ----
lines.push('-- Site settings -------------------------------------------------------');
lines.push(
  `insert into public.site_settings (id, payload) values ('default', ${sql({
    phone: site.phone,
    altPhone: site.altPhone,
    hours: site.hours,
    reservationUrl: site.reservationUrl,
    orderUrl: site.orderUrl,
    socials: site.socials,
  })})`,
  '  on conflict (id) do update set payload = excluded.payload;',
  '',
);

// --------------------------------------------------------- announcements ----
lines.push('-- Announcements -------------------------------------------------------');
lines.push('-- Ships DISABLED: the restaurant references promotions but publishes no terms.');
lines.push('-- See docs/CONTENT-QUESTIONS.md §12.');
for (const announcement of announcements) {
  lines.push(
    `insert into public.announcements (id, message, href, link_label, starts_at, ends_at, enabled, tone)`,
    `  values (gen_random_uuid(), ${sql(announcement.message)}, ${sql(announcement.href)}, ${sql(
      announcement.linkLabel,
    )}, ${sql(announcement.startsAt)}, ${sql(announcement.endsAt)}, ${sql(
      announcement.enabled,
    )}, ${sql(announcement.tone)})`,
    '  on conflict do nothing;',
  );
}
lines.push('');

// ------------------------------------------------------------------ menus ----
lines.push('-- Menus ---------------------------------------------------------------');
allMenus.forEach((menu, menuIndex) => {
  lines.push(
    `insert into public.menus (slug, title, note, empty_state, sort) values (${sql(menu.slug)}, ${sql(
      menu.title,
    )}, ${sql(menu.note)}, ${sql(menu.emptyState)}, ${menuIndex})`,
    '  on conflict (slug) do update set title = excluded.title, note = excluded.note, empty_state = excluded.empty_state, sort = excluded.sort;',
  );

  menu.categories.forEach((category, categoryIndex) => {
    lines.push(
      `insert into public.menu_categories (id, menu_slug, name, note, sort) values (${sql(
        `${menu.slug}:${category.id}`,
      )}, ${sql(menu.slug)}, ${sql(category.name)}, ${sql(category.note)}, ${categoryIndex})`,
      '  on conflict (id) do update set name = excluded.name, note = excluded.note, sort = excluded.sort;',
    );

    category.items.forEach((item, itemIndex) => {
      lines.push(
        `insert into public.menu_items (id, category_id, name, description, price_cents, price_note, modifier_group_label, dietary, available, featured, sort)`,
        `  values (${sql(`${menu.slug}:${item.id}`)}, ${sql(`${menu.slug}:${category.id}`)}, ${sql(
          item.name,
        )}, ${sql(item.description)}, ${sql(item.priceCents)}, ${sql(item.priceNote)}, ${sql(
          item.modifierGroupLabel,
        )}, ${sql(item.dietary)}, ${sql(item.available)}, ${sql(item.featured)}, ${itemIndex})`,
        '  on conflict (id) do update set name = excluded.name, description = excluded.description,',
        '    price_cents = excluded.price_cents, price_note = excluded.price_note,',
        '    modifier_group_label = excluded.modifier_group_label, dietary = excluded.dietary,',
        '    available = excluded.available, featured = excluded.featured, sort = excluded.sort;',
      );

      if (item.modifiers.length > 0) {
        lines.push(
          `delete from public.menu_modifiers where item_id = ${sql(`${menu.slug}:${item.id}`)};`,
        );
        item.modifiers.forEach((modifier, modifierIndex) => {
          lines.push(
            `insert into public.menu_modifiers (item_id, label, price_cents, sort) values (${sql(
              `${menu.slug}:${item.id}`,
            )}, ${sql(modifier.label)}, ${sql(modifier.priceCents)}, ${modifierIndex});`,
          );
        });
      }
    });
  });
  lines.push('');
});

// ----------------------------------------------------------------- events ----
lines.push('-- Event series -------------------------------------------------------');
lines.push('-- NOTE: no dates here. Occurrences are generated from cadence at read time.');
eventSeries.forEach((series, index) => {
  const cadence = series.cadence.kind === 'weekly' ? `weekly:${series.cadence.weekday}` : 'one-time';
  lines.push(
    `insert into public.event_series (slug, title, summary, description, cadence, start_minutes, end_minutes, age_min, age_note, music_formats, venue_name, artwork_asset_id, ticket_url, price_cents, fee_cents, status, series_ends_on, sort)`,
    `  values (${sql(series.slug)}, ${sql(series.title)}, ${sql(series.summary)}, ${sql(
      series.description,
    )}, ${sql(cadence)}, ${series.startMinutes}, ${series.endMinutes}, ${sql(series.ageMin)}, ${sql(
      series.ageNote,
    )}, ${sql(series.musicFormats)}, ${sql(series.venueName)}, ${sql(
      series.artworkAssetId,
    )}, ${sql(series.ticketUrl)}, ${sql(series.priceCents)}, ${sql(series.feeCents)}, ${sql(
      series.status,
    )}::public.event_status, ${sql(series.seriesEndsOn)}, ${index})`,
    '  on conflict (slug) do update set title = excluded.title, summary = excluded.summary,',
    '    description = excluded.description, cadence = excluded.cadence,',
    '    start_minutes = excluded.start_minutes, end_minutes = excluded.end_minutes,',
    '    age_min = excluded.age_min, age_note = excluded.age_note,',
    '    music_formats = excluded.music_formats, artwork_asset_id = excluded.artwork_asset_id,',
    '    ticket_url = excluded.ticket_url, price_cents = excluded.price_cents,',
    '    fee_cents = excluded.fee_cents, status = excluded.status, sort = excluded.sort;',
  );
});
lines.push('');

// --------------------------------------------------------------- catering ----
lines.push('-- Catering -----------------------------------------------------------');
cateringPackages.forEach((pkg, index) => {
  lines.push(
    `insert into public.catering_packages (id, name, serves_min, serves_max, price_cents, includes, sort)`,
    `  values (${sql(pkg.id)}, ${sql(pkg.name)}, ${sql(pkg.servesMin)}, ${sql(
      pkg.servesMax,
    )}, ${pkg.priceCents}, ${sql(pkg.includes)}, ${index})`,
    '  on conflict (id) do update set name = excluded.name, serves_min = excluded.serves_min,',
    '    serves_max = excluded.serves_max, price_cents = excluded.price_cents,',
    '    includes = excluded.includes, sort = excluded.sort;',
  );
});
cateringItems.forEach((item, index) => {
  lines.push(
    `insert into public.catering_items (id, name, price_cents, note, sort) values (${sql(
      item.id,
    )}, ${sql(item.name)}, ${item.priceCents}, ${sql(item.note)}, ${index})`,
    '  on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents, note = excluded.note, sort = excluded.sort;',
  );
});
lines.push('');

// ---------------------------------------------------------- page sections ----
lines.push('-- Page sections ------------------------------------------------------');
homeSections.forEach((section, index) => {
  lines.push(
    `insert into public.page_sections (page, key, eyebrow, heading, body, visible, variant, sort)`,
    `  values ('home', ${sql(section.key)}, ${sql(section.eyebrow)}, ${sql(
      section.heading,
    )}, ${sql(section.body)}, ${sql(section.visible)}, ${sql(section.variant)}, ${index})`,
    '  on conflict (page, key) do update set eyebrow = excluded.eyebrow, heading = excluded.heading,',
    '    body = excluded.body, visible = excluded.visible, variant = excluded.variant, sort = excluded.sort;',
  );
});
lines.push('');

lines.push('-- Page SEO -----------------------------------------------------------');
for (const [page, entry] of Object.entries(seo)) {
  lines.push(
    `insert into public.page_seo (page, title, description, og_asset_id) values (${sql(page)}, ${sql(
      entry.title,
    )}, ${sql(entry.description)}, ${sql(entry.ogAssetId)})`,
    '  on conflict (page) do update set title = excluded.title, description = excluded.description, og_asset_id = excluded.og_asset_id;',
  );
}
lines.push('');

// ------------------------------------------------------------ media assets ----
lines.push('-- Media assets -------------------------------------------------------');
for (const [id, asset] of Object.entries(assets)) {
  lines.push(
    `insert into public.media_assets (asset_id, path, alt, width, height, ratio, focal, poster, status)`,
    `  values (${sql(id)}, ${sql(asset.path)}, ${sql(asset.alt)}, ${asset.width}, ${asset.height}, ${sql(
      asset.ratio,
    )}, ${sql(asset.focal)}, ${sql('poster' in asset ? asset.poster : null)}, ${sql(asset.status)})`,
    '  on conflict (asset_id) do update set path = excluded.path, alt = excluded.alt,',
    '    width = excluded.width, height = excluded.height, ratio = excluded.ratio,',
    '    focal = excluded.focal, poster = excluded.poster, status = excluded.status;',
  );
}
lines.push('');

lines.push('commit;');
lines.push('');

async function main() {
  const target = path.join(ROOT, 'supabase', 'seed.sql');
  await writeFile(target, lines.join('\n'));

  const counts = {
    menus: allMenus.length,
    categories: allMenus.reduce((sum, m) => sum + m.categories.length, 0),
    items: allMenus.reduce((sum, m) => sum + m.categories.reduce((s, c) => s + c.items.length, 0), 0),
    series: eventSeries.length,
    cateringPackages: cateringPackages.length,
    cateringItems: cateringItems.length,
    sections: homeSections.length,
    seo: Object.keys(seo).length,
    assets: Object.keys(assets).length,
  };

  console.log('Wrote supabase/seed.sql');
  for (const [key, value] of Object.entries(counts)) {
    console.log(`  ${key.padEnd(18)} ${value}`);
  }

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
