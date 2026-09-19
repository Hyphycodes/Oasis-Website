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
    priceCents: 0,
    ticketPolicy: 'free',
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
    priceCents: 0,
    ticketPolicy: 'free',
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
 * One-off events, as the restaurant's Tickeri organizer page lists them.
 *
 *   https://www.tickeri.com/organizations/chsxwyl/oasis-events
 *
 * WHAT THIS IS FOR. Production reads events from the database, so this array is
 * not what a guest normally sees: it is the documented fallback `staticInput()`
 * in src/server/content/events.ts serves when no database is configured, and it
 * is the shape the whole calendar is reviewed in. The database is brought to
 * the same calendar by supabase/migrations/0019_tickeri_calendar_correction.sql
 * and 0020_internal_ticketing_for_remaining_events.sql, and kept current
 * afterwards by Admin -> Events -> "Check Tickeri", which reads the organizer
 * page directly. See docs/events-system.md -> "Reconciliation".
 *
 * `date` AND `startMinutes` ARE LOAD-BEARING, NOT DECORATIVE. An event's photo is
 * matched to it by provider id AND exact start instant — see importedFlyer() in
 * src/server/content/event-art.ts, which refuses a flyer whose recorded start
 * does not equal the event's, so that artwork printed with an old date cannot
 * survive a reschedule. An hour of drift therefore silently removes the photo.
 * Every start time below is the one recorded in src/content/imported-flyers.json
 * beside the flyer itself, and src/lib/events.test.ts asserts the two still
 * agree, so this cannot drift again unnoticed.
 *
 * EVERY `ticketUrl` IS NULL, AND THAT IS THE POINT. Oasis sells its own tickets;
 * no button on this website sends a guest to another site. Without a database
 * there are no tiers to sell from, so this fallback states the price and leaves
 * entry at the door rather than quietly handing customers to a third party. The
 * Tickeri page each event was read from is kept as `sourceUrl`, which is
 * provenance and is never rendered as a link. `src/lib/events.test.ts` asserts
 * it stays that way.
 *
 * `slug` is the live URL of the event page. Where a slug reads oddly — the
 * September 19 brunch is still `hello-kitty-fall-paint-lunch`, and October 18 is
 * still `feid-halloween-sunday-brunch` — it is because the restaurant re-themed
 * that night on Tickeri after the page had been published, and changing the slug
 * would break links already handed out.
 *
 * `priceText` mirrors the cheapest ticket tier in the database, and is what the
 * fallback shows in place of a live price. FIVE OF THEM ARE A $20 PLACEHOLDER —
 * the two Hello Kitty Halloween seatings, El Alfa, Bad Bunny and Drake — because
 * tickeri.com is unreachable from the build environment and their real prices
 * have never been read. They are flagged on the events themselves too, in the
 * admin-only `note`. Confirm them before the site takes real money.
 *
 * `flyerAssetId` is absent by design: the flyers live in the repo already, under
 * public/events/imported/<tickeri id>.jpg, indexed by imported-flyers.json.
 */
export const oneTimeEvents: OneTimeEventSeed[] = [
  {
    id: 'tickeri:ly48t69ytbwh',
    slug: 'hello-kitty-fall-paint-lunch',
    title: 'Snoopy Chicago Bears Paint & Brunch',
    summary: 'A Snoopy Chicago Bears paint & brunch — canvas, mimosa and a photo station.',
    description:
      'A kid-friendly Saturday paint & brunch. The ticket covers the canvas, paints and brushes, a themed mimosa, chips and salsa and a photo station, and it holds your table. The full food and cocktail menu is open throughout. A 20% gratuity is added to Paint & Sip checks.',
    date: '2026-09-19',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 14 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/ly48t69ytbwh/snoopy-chicago-bears-paint-brunch',
    sourceEventId: 'ly48t69ytbwh',
  },
  {
    id: 'tickeri:mv6rr2tii5m5',
    slug: 'selena-quintanilla-paint-brunch',
    title: 'Selena Quintanilla Paint & Brunch',
    summary: 'Fall Selena-inspired paint & brunch — cozy vibes and Tejano classics.',
    description:
      'A Selena-inspired painting over brunch, with her records playing all afternoon. Kid friendly, no experience needed, and the full food and cocktail menu is open throughout. A 20% gratuity is added to Paint & Sip checks.',
    date: '2026-09-20',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 14 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/mv6rr2tii5m5/selena-quintanilla-paint-brunch',
    sourceEventId: 'mv6rr2tii5m5',
  },
  {
    id: 'tickeri:9s52lkdtlx32',
    slug: 'snoopy-paint-sip',
    title: 'Snoopy Paint & Sip',
    summary: 'Halloween pop-up paint & sip — sold out, join the waitlist.',
    description:
      'The night that opened the Halloween pop-up, brought back by demand. Instructor and painting supplies are included, with music, drinks and photo opportunities all evening. All ages.',
    date: '2026-09-24',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    status: 'sold-out',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/9s52lkdtlx32/snoopy-paint-sip',
    sourceEventId: '9s52lkdtlx32',
  },
  {
    id: 'tickeri:0b6uk2g80hsg',
    slug: 'scream-paint-brunch',
    title: 'Scream Paint & Brunch',
    summary: 'A spooky-cute paint & brunch with mimosas, chips & salsa.',
    description:
      'A spooky-cute Sunday paint & brunch. Canvas, paints and brushes, an instructor, a mimosa, chips and salsa and a photo station, and your ticket holds your table. No art skills needed. A 20% gratuity is added to Paint & Sip checks.',
    date: '2026-09-27',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 14 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/0b6uk2g80hsg/scream-paint-brunch',
    sourceEventId: '0b6uk2g80hsg',
  },
  {
    id: 'tickeri:hkfw1xqjh0p0',
    slug: 'hello-kitty-halloween-paint-sip',
    title: 'Hello Kitty Halloween Paint & Sip',
    summary: 'A Hello Kitty Halloween paint & sip — canvas and instructor included.',
    description:
      'A Hello Kitty Halloween painting session on the Sunday evening. Canvas, paints and an instructor are included; the kitchen and bar are open throughout. A 20% gratuity is added to Paint & Sip checks.',
    date: '2026-09-27',
    startMinutes: 18 * 60, // 18:00 venue-local
    endMinutes: 21 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/hkfw1xqjh0p0/hello-kitty-halloween-paint-sip',
    sourceEventId: 'hkfw1xqjh0p0',
  },
  {
    id: 'tickeri:d59jua699tbj',
    slug: 'michael-myres-paint-sip',
    title: 'Michael Myres Paint & Sip',
    summary: 'A Michael Myers–themed paint & sip — no experience needed.',
    description:
      'A Michael Myers–themed painting night. No experience needed — bring friends, a drink and some Halloween spirit. Kid friendly, with the full food and cocktail menu open throughout.',
    date: '2026-10-01',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$25',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/d59jua699tbj/michael-myres-paint-sip',
    sourceEventId: 'd59jua699tbj',
  },
  {
    id: 'tickeri:bw9gnwdladhw',
    slug: 'el-alfa-paint-sip-party',
    title: 'El Alfa Paint & Sip Party',
    summary: 'An El Alfa paint & sip party — dembow all night, canvas in hand.',
    description:
      'A late paint & sip built around El Alfa and dembow. Canvas, paints and an instructor are included, and the kitchen and bar stay open. A 20% gratuity is added to Paint & Sip checks.',
    date: '2026-10-02',
    startMinutes: 21 * 60, // 21:00 venue-local
    endMinutes: 24 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/bw9gnwdladhw/el-alfa-paint-sip-party',
    sourceEventId: 'bw9gnwdladhw',
  },
  {
    id: 'tickeri:a2wlpotqkbsa',
    slug: 'hello-kitty-halloween-sunday-brunch',
    title: 'Hello Kitty Halloween Sunday Brunch',
    summary: 'Hello Kitty Halloween brunch — mimosas, music and Halloween vibes.',
    description:
      'A Hello Kitty Halloween brunch: mimosas, brunch favourites, music and a fully decorated room. Come dressed for the occasion.',
    date: '2026-10-04',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 14 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/a2wlpotqkbsa/hello-kitty-halloween-sunday-brunch',
    sourceEventId: 'a2wlpotqkbsa',
  },
  {
    id: 'tickeri:ihart5g24vfj',
    slug: 'bad-bunny-un-halloween-sin-ti-paint-sip',
    title: 'Bad Bunny Un Halloween Sin Ti Paint & Sip',
    summary: 'A Bad Bunny \'Un Halloween Sin Ti\' paint & sip — canvas and instructor included.',
    description:
      'A Bad Bunny–themed Halloween painting session on the Sunday evening. Canvas, paints and an instructor are included; the kitchen and bar are open throughout.',
    date: '2026-10-04',
    startMinutes: 18 * 60, // 18:00 venue-local
    endMinutes: 21 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/ihart5g24vfj/bad-bunny-un-halloween-sin-ti-paint-sip',
    sourceEventId: 'ihart5g24vfj',
  },
  {
    id: 'tickeri:j2wyhgin40r2',
    slug: 'pumpkin-carving-paint-sip',
    title: 'Pumpkin Carving Paint & Sip',
    summary: 'Pumpkin carving night — tools and a pumpkin included, all skill levels.',
    description:
      'A pumpkin carving class: choose a design, take the tools and carve your own. The pumpkin and supplies are included, all skill levels are welcome, and it is a family event. Drinks, music and the full menu throughout.',
    date: '2026-10-07',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$35',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/j2wyhgin40r2/pumpkin-carving-paint-sip',
    sourceEventId: 'j2wyhgin40r2',
  },
  {
    id: 'tickeri:xvt4t4jbzvwf',
    slug: 'scream-paint-sip',
    title: 'Scream Paint & Sip',
    summary: 'Halloween Paint & Sip. Come dressed up. Doors at 7.',
    description:
      'The Halloween edition of Paint & Sip at Oasis: music, drinks, food and a canvas to take home. Costumes encouraged. All ages, seating available.',
    date: '2026-10-08',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'blood',
    featured: true,
    treatment: 'featured',
    priority: 10,
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/xvt4t4jbzvwf/scream-paint-sip',
    sourceEventId: 'xvt4t4jbzvwf',
  },
  {
    id: 'tickeri:6n2pu69eopzu',
    slug: 'halloween-brunch-w-scream',
    title: 'Halloween Brunch w/ Scream',
    summary: 'Halloween brunch with a live DJ and a Scream impersonator for photos.',
    description:
      'A fully decorated Halloween brunch with mimosas, a live DJ and food all afternoon. Costumes encouraged, kid friendly, and a Scream impersonator is on hand for photographs.',
    date: '2026-10-11',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 14 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/6n2pu69eopzu/halloween-brunch-w-scream',
    sourceEventId: '6n2pu69eopzu',
  },
  {
    id: 'tickeri:yy7aaovvp6fz',
    slug: 'drake-paint-sip-night',
    title: 'Drake Paint & Sip Night',
    summary: 'A Drake-themed paint & sip night — canvas and instructor included.',
    description:
      'A Drake-themed painting session on the Sunday evening. Canvas, paints and an instructor are included; the kitchen and bar are open throughout.',
    date: '2026-10-11',
    startMinutes: 18 * 60, // 18:00 venue-local
    endMinutes: 21 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/yy7aaovvp6fz/drake-paint-sip-night',
    sourceEventId: 'yy7aaovvp6fz',
  },
  {
    id: 'tickeri:4m2ambt0jv1e',
    slug: 'hello-kitty-paint-sip-oct',
    title: 'Hello Kitty Paint & Sip',
    summary: 'A spooky SAW-themed Hello Kitty paint & sip — all ages, family friendly.',
    description:
      'A Hello Kitty painting night with a SAW theme, in a fully decorated Halloween room. All ages and family friendly. Come dressed up — there are photographs to be taken.',
    date: '2026-10-15',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/4m2ambt0jv1e/hello-kitty-paint-sip',
    sourceEventId: '4m2ambt0jv1e',
  },
  {
    id: 'tickeri:xraeo6y9f6zu',
    slug: 'hello-kitty-halloween-paint-sip-oct',
    title: 'Hello Kitty Halloween Paint & Sip',
    summary: 'The later Hello Kitty Halloween seating — canvas and instructor included.',
    description:
      'The second, later seating of the Hello Kitty Halloween paint & sip on the same Thursday. Canvas, paints and an instructor are included; the kitchen and bar are open throughout.',
    date: '2026-10-15',
    startMinutes: 20 * 60, // 20:00 venue-local
    endMinutes: 23 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/xraeo6y9f6zu/hello-kitty-halloween-paint-sip',
    sourceEventId: 'xraeo6y9f6zu',
  },
  {
    id: 'tickeri:0q4w5wjxd5iv',
    slug: 'feid-halloween-sunday-brunch',
    title: 'Pumpkin Halloween Paint & Brunch',
    summary: 'Halloween brunch with a live DJ, mimosas and themed cocktails, 11am–4pm.',
    description:
      'A Halloween brunch from 11am to 4pm: food, mimosas, themed cocktails and a live DJ in a fully decorated room. Come dressed to impress.',
    date: '2026-10-18',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 16 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$10',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/0q4w5wjxd5iv/pumpkin-halloween-paint-brunch',
    sourceEventId: '0q4w5wjxd5iv',
  },
  {
    id: 'tickeri:th9oa33ur1ou',
    slug: 'chucky-x-hello-kitty-paint-sip',
    title: 'Chucky X Hello Kitty Paint & Sip',
    summary: 'Paint Chucky at this Halloween pop-up bar — instructor included.',
    description:
      'A Chucky painting night in the Halloween pop-up bar. An instructor takes you through it, so no skills are needed. All ages and kid friendly; spots are limited.',
    date: '2026-10-22',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/th9oa33ur1ou/chucky-x-hello-kitty-paint-sip',
    sourceEventId: 'th9oa33ur1ou',
  },
  {
    id: 'tickeri:c8ju6ei787qj',
    slug: 'puro-pinche-perreo-hosted-by-flames',
    title: 'Puro Pinche Perreo Hosted by Flames',
    summary: 'Reggaeton, corridos and guaracha all night with host FLAMES. 18+.',
    description:
      'Puro Pinche Perreo at Latin Saturdays, hosted by FLAMES: reggaeton, corridos, guaracha and the rest of the Latin hits, 9pm until 2am. 18+.',
    date: '2026-10-24',
    startMinutes: 21 * 60, // 21:00 venue-local
    endMinutes: 26 * 60,
    category: 'nightlife',
    visualPreset: 'marigold',
    priceText: '$10–$30',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/c8ju6ei787qj/puro-pinche-perreo-hosted-by-flames',
    sourceEventId: 'c8ju6ei787qj',
  },
  {
    id: 'tickeri:lmw4zcgl66qv',
    slug: 'selena-quintanilla-halloween-sunday-brunch',
    title: 'Selena Quintanilla Halloween Sunday Brunch',
    summary: 'Selena-inspired Halloween brunch — live DJ, mimosas and brunch favorites.',
    description:
      'A Selena-inspired Sunday Funday Halloween brunch from 11am to 4pm, with her hits and a live DJ all day, 99¢ mimosas, $20 mimosa pitchers and Mexican brunch favourites. The $5 reservation fee comes off your bill when you arrive.',
    date: '2026-10-25',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 16 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$5 reservation',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/lmw4zcgl66qv/selena-quintanilla-halloween-sunday-brunch',
    sourceEventId: 'lmw4zcgl66qv',
  },
  {
    id: 'tickeri:ov5g3wopots7',
    slug: 'thriller-halloween-costume-party',
    title: 'Thriller Halloween Costume Party',
    summary: 'Oasis\'s biggest Halloween costume party — Latin Saturdays after hours.',
    description:
      'The biggest Halloween costume party at Oasis, on Latin Saturdays after hours, 9pm until 2am. Dress to shock. Ladies 18+, men 21+.',
    date: '2026-10-31',
    startMinutes: 21 * 60, // 21:00 venue-local
    endMinutes: 26 * 60,
    category: 'nightlife',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/ov5g3wopots7/thriller-halloween-costume-party',
    sourceEventId: 'ov5g3wopots7',
  },
  {
    id: 'tickeri:v1tts4vt8xfw',
    slug: 'dia-de-los-muertos-sunday-brunch',
    title: 'Dia de los Muertos Sunday Brunch',
    summary: 'Día de los Muertos brunch with face painting, mimosas and margarita towers.',
    description:
      'A Día de los Muertos brunch from 11am to 4pm, with brunch favourites, music and a face painting service on site. $20 mimosa pitchers and $40 margarita towers. Reservations required; the $5 fee comes off your bill when you arrive.',
    date: '2026-11-01',
    startMinutes: 11 * 60, // 11:00 venue-local
    endMinutes: 16 * 60,
    category: 'brunch',
    visualPreset: 'marigold',
    priceText: '$5 reservation',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/v1tts4vt8xfw/dia-de-los-muertos-sunday-brunch',
    sourceEventId: 'v1tts4vt8xfw',
  },
  {
    id: 'tickeri:1r6x02r8uzu6',
    slug: 'hello-kitty-christmas-edition-paint-sip',
    title: 'Hello Kitty Christmas Edition Paint & Sip',
    summary: 'Kick off the holidays — Hello Kitty Christmas paint & sip with a DJ.',
    description:
      'The first of the Christmas nights: a Hello Kitty Christmas paint & sip with a DJ, chips and salsa and photo opportunities. A reservation is required and no art skills are needed.',
    date: '2026-11-05',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$30',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/1r6x02r8uzu6/hello-kitty-christmas-edition-paint-sip',
    sourceEventId: '1r6x02r8uzu6',
  },
  {
    id: 'tickeri:ckl3ja90j2m6',
    slug: 'grinch-paint-sip',
    title: 'Grinch Paint & Sip',
    summary: 'Paint the Grinch at this Christmas pop-up bar — instructor included.',
    description:
      'A Grinch painting night in the Christmas pop-up bar. An instructor takes you through it, so no skills are needed. Spots are limited.',
    date: '2026-11-12',
    startMinutes: 19 * 60, // 19:00 venue-local
    endMinutes: 22 * 60,
    category: 'paint-sip',
    visualPreset: 'marigold',
    priceText: '$20',
    ticketUrl: null,
    sourceUrl: 'https://www.tickeri.com/events/ckl3ja90j2m6/grinch-paint-sip',
    sourceEventId: 'ckl3ja90j2m6',
  },
];
