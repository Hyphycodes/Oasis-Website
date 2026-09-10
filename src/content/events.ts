import type { EventSeries, OneTimeEventSeed } from './types';

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
      'Oasis Fridays is an 18+ Friday night party at Oasis. Expect a high-energy night of House, Top 100 and some Hip-Hop, with dancing, drinks and late-night energy.',
    cadence: { kind: 'weekly', weekday: 5 },
    startMinutes: 22 * 60, // 10:00 PM
    endMinutes: 26 * 60, // 2:00 AM next day
    ageMin: 18,
    ageNote: 'Drinks 21+ with valid ID.',
    musicFormats: ['House', 'Top 100', 'Hip-Hop'],
    venueName: 'Oasis Mexican Kitchen & Bar',
    artworkAssetId: null,
    // The owner-supplied flyer prints "Friday, August 7th". It is the only
    // approved Fridays artwork, so it is featured as series artwork and the
    // printed date is captioned beside it — never presented as the next date,
    // which is always rendered from a generated occurrence.
    flyerAssetId: 'flyerFridays',
    flyerPrintedDate: 'August 7th',
    // null = compose the correct per-night URL. A single series-level link cannot
    // be right for every date, and the date-less slug resolved to the WRONG
    // event entirely. See ticketUrlForOccurrence in src/lib/events.ts.
    ticketUrl: null,
    priceCents: 1000,
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
    artworkAssetId: null,
    // Prints "Saturday, August 8th". Captioned, exactly as Fridays is.
    flyerAssetId: 'flyerLatinSaturdays',
    flyerPrintedDate: 'August 8th',
    ticketUrl: null,
    priceCents: 1000,
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

/**
 * One-off events, captured from the restaurant's Tickeri calendar.
 *
 * WHY THESE THREE AND NOT THE WHOLE CALENDAR: every row here was verified
 * against its own Tickeri event page — the id in `ticketUrl` is the real one, so
 * the button sells a ticket to the event the card describes. The rest of the
 * calendar is imported by Admin → Events → "Check Tickeri", which reads the
 * organizer page directly and is the supported way to keep this current. Dates
 * are not guessed here; see docs/events-system.md → "Reconciliation".
 *
 * `flyerAssetId` is null because the flyers live on Tickeri and are downloaded
 * into the media library by that same import, which fills the OFFICIAL flyer
 * slot once and never overwrites it afterwards.
 */
export const oneTimeEvents: OneTimeEventSeed[] = [
  {
    id: 'tickeri:82c16al40ueb',
    slug: 'snoopy-paint-sip-night',
    title: 'Snoopy Paint & Sip Night',
    summary: 'Paint a Snoopy canvas, drinks in hand. All supplies included.',
    description:
      'A guided Paint & Sip evening at Oasis. Every seat comes with a canvas and paints; the kitchen and the bar are open throughout. No experience needed.',
    date: '2026-09-10',
    startMinutes: 19 * 60,
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'candy',
    ticketUrl: 'https://www.tickeri.com/events/82c16al40ueb/snoopy-paint-sip-night',
    sourceEventId: '82c16al40ueb',
  },
  {
    id: 'tickeri:nwn48quznb96',
    slug: 'junior-h-paint-sip',
    title: 'Junior H Paint & Sip',
    summary: 'Corridos on the speakers, a canvas in front of you.',
    description:
      'A Paint & Sip night built around the music of Junior H. Canvas and paints included, kitchen and bar open, seating is limited.',
    date: '2026-09-17',
    startMinutes: 19 * 60,
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'gold',
    ticketUrl: 'https://www.tickeri.com/events/nwn48quznb96/junior-h-paint-sip',
    sourceEventId: 'nwn48quznb96',
  },
  {
    id: 'tickeri:xvt4t4jbzvwf',
    slug: 'scream-paint-sip',
    title: 'Scream Paint & Sip',
    summary: 'Halloween Paint & Sip. Come dressed up. Doors at 7.',
    description:
      'The Halloween edition of Paint & Sip at Oasis: music, drinks, food and a canvas to take home. Costumes encouraged. All ages, seating available.',
    date: '2026-10-08',
    startMinutes: 19 * 60,
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'blood',
    featured: true,
    treatment: 'featured',
    priority: 10,
    ticketUrl: 'https://www.tickeri.com/events/xvt4t4jbzvwf/scream-paint-sip',
    sourceEventId: 'xvt4t4jbzvwf',
  },
];
