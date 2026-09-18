/**
 * Two fake, published events so the event pages can be developed without
 * touching real data.
 *
 *   npx tsx scripts/seed-events.ts
 *
 * Writes to Supabase when NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * are set, otherwise to the local development database file that `npm run dev`
 * reads. Rows are keyed by fixed ids, so running it twice updates rather than
 * duplicates. Nothing here is ever deleted.
 *
 *   sample-paint-night   a ticketed Paint & Sip, sold through an outside link,
 *                        marked sold out so the waitlist state can be seen
 *   sample-free-night    a free night: no ticket, no price, just show up
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { venueLocalIso } from '../src/lib/events';
import { buildRecords } from '../src/server/migration/records';

function inDays(days: number, minutes: number): string {
  const day = new Date(Date.now() + days * 86_400_000);
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(day);
  const [y, m, d] = iso.split('-').map(Number);
  return venueLocalIso(y!, m!, d!, minutes);
}

export const SAMPLE_EVENTS = [
  {
    id: 'sample-paint-night',
    series_slug: null,
    slug: 'sample-paint-night',
    title: 'Sample Paint & Sip Night',
    summary: 'Two hours of painting, drinks in hand. All materials included.',
    description:
      'A sample event for development. Every seat comes with a canvas and paints; the kitchen and the bar are open throughout.\n\nArrive fifteen minutes early to pick a seat. Parking is free behind the building.',
    starts_at: inDays(9, 19 * 60),
    ends_at: inDays(9, 22 * 60),
    status: 'sold-out',
    published: true,
    archived_at: null,
    draft: null,
    age_min: null,
    music_formats: [],
    venue_name: 'Oasis Mexican Kitchen & Bar',
    price_cents: 1000,
    ticket_url: 'https://www.tickeri.com/organizations/chsxwyl/oasis-events',
    flyer_asset_id: null,
    category: 'paint-sip',
    visual_preset: 'candy',
    treatment: 'standard',
    featured: false,
    priority: 0,
    source: 'manual',
  },
  {
    id: 'sample-free-night',
    series_slug: null,
    slug: 'sample-free-night',
    title: 'Sample Free Night',
    summary: 'No ticket, no cover. Music from nine.',
    description: 'A sample free event for development. Come in, grab a table and settle in.',
    starts_at: inDays(12, 21 * 60),
    ends_at: inDays(12, 26 * 60),
    status: 'free',
    published: true,
    archived_at: null,
    draft: null,
    age_min: 21,
    music_formats: ['Latin', 'Top 100'],
    venue_name: 'Oasis Mexican Kitchen & Bar',
    price_cents: 0,
    ticket_url: null,
    flyer_asset_id: null,
    category: 'nightlife',
    visual_preset: 'neon',
    treatment: 'standard',
    featured: false,
    priority: 0,
    source: 'manual',
  },
];

async function seedSupabase(url: string, key: string) {
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await client.from('event_occurrences').upsert(SAMPLE_EVENTS, { onConflict: 'id' });
  if (error) throw new Error(error.message);
  console.log(`Seeded ${SAMPLE_EVENTS.length} sample events into Supabase.`);
}

async function seedLocal() {
  const dir = path.join(process.cwd(), '.oasis-local');
  const file = path.join(dir, 'content.json');
  await mkdir(dir, { recursive: true });
  let tables: Record<string, Record<string, unknown>[]> = {};
  try {
    tables = JSON.parse(await readFile(file, 'utf8'));
  } catch {
    // First run: start from the same seed the dev server would have written.
    tables = buildRecords().tables as Record<string, Record<string, unknown>[]>;
  }
  const rows = (tables.event_occurrences ??= []);
  for (const sample of SAMPLE_EVENTS) {
    const index = rows.findIndex((row) => row.id === sample.id);
    const stamped = { ...sample, updated_at: new Date().toISOString() };
    if (index === -1) rows.push(stamped);
    else rows[index] = { ...rows[index], ...stamped };
  }
  await writeFile(file, JSON.stringify(tables, null, 2), 'utf8');
  console.log(`Seeded ${SAMPLE_EVENTS.length} sample events into ${path.relative(process.cwd(), file)}.`);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && key) await seedSupabase(url, key);
  else await seedLocal();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
