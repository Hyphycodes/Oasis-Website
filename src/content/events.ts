import type { EventSeries } from './types';

/**
 * Event series captured 2026-08-14 from the live event-detail pages.
 *
 * CRITICAL: a series carries NO date. Occurrences are generated from `cadence` in
 * src/lib/events.ts and the visible date is always rendered from the occurrence as
 * HTML text. A recurring series therefore cannot show a stale date, because it has
 * no date to show. See PLAN.md §4.1.
 */
export const eventSeries: EventSeries[] = [
  {
    slug: 'oasis-fridays',
    title: 'Oasis Fridays',
    summary: 'House, Top 100 and Hip-Hop. 18+, doors at 10.',
    description:
      'Oasis Fridays is an 18+ Friday night party at Oasis. Expect a high-energy night of House, Top 100 and some Hip-Hop, with dancing, drinks and a nightclub atmosphere.',
    cadence: { kind: 'weekly', weekday: 5 },
    startMinutes: 22 * 60, // 10:00 PM
    endMinutes: 26 * 60, // 2:00 AM next day
    ageMin: 18,
    ageNote: 'Drinks 21+ with valid ID.',
    musicFormats: ['House', 'Top 100', 'Hip-Hop'],
    venueName: 'Oasis Mexican Kitchen & Bar',
    artworkAssetId: 'eventFridays',
    ticketUrl: 'https://www.oasismexicankitchenbar.com/event-details/oasis-fridays',
    priceCents: 1000,
    feeCents: 25,
    status: 'scheduled',
    seriesEndsOn: null,
  },
  {
    slug: 'oasis-latin-saturdays',
    title: 'Oasis Latin Saturdays',
    summary: 'Reggaetón, corridos and guaracha. 18+, doors at 10.',
    description:
      'Latin Saturdays at Oasis. Dance to reggaetón, corridos and guaracha in a high-energy room with great music, drinks and late-night vibes. 18+.',
    cadence: { kind: 'weekly', weekday: 6 },
    startMinutes: 22 * 60,
    // The live page contradicts itself: the description says 2 AM, the structured
    // field says 5 AM. 2 AM is used — it matches the prose, matches Fridays, and is
    // consistent with a 1 AM published bar close. See CONTENT-QUESTIONS.md §5.1.
    endMinutes: 26 * 60,
    ageMin: 18,
    ageNote: 'Drinks 21+ with valid ID.',
    musicFormats: ['Reggaetón', 'Corridos', 'Guaracha'],
    venueName: 'Oasis Mexican Kitchen & Bar',
    artworkAssetId: 'eventLatinSaturdays',
    ticketUrl: 'https://www.oasismexicankitchenbar.com/event-details/oasis-latin-saturdays',
    priceCents: 1000,
    feeCents: 25,
    status: 'scheduled',
    seriesEndsOn: null,
  },
];

/**
 * One-time events and per-date overrides (a cancelled night, a sold-out night, a
 * guest DJ). Empty today — the restaurant publishes none. The machinery exists so
 * that adding one is a data edit, not a code change.
 */
export const eventOverrides: {
  seriesSlug: string;
  /** ISO date, venue-local, e.g. '2026-08-21'. */
  date: string;
  status?: 'sold-out' | 'cancelled' | 'postponed' | 'free';
  ticketUrl?: string;
  priceCents?: number | null;
}[] = [];
