import type { Announcement, SiteSettings } from './types';

const RESERVATION_URL =
  'https://tables.toasttab.com/restaurants/43040713-bf74-449f-bd19-00594dd956fa/findTime';

const ORDER_URL = 'https://oasismexicanlockport.toast.site/order';

/**
 * Verified business facts, captured 2026-08-14 from the live site and Toast.
 *
 * Values marked `provisional: true` are DISPUTED between sources. The first-party
 * website value is used, per the project working rules. Every one of them is
 * documented in docs/CONTENT-QUESTIONS.md with the conflicting source.
 */
export const site: SiteSettings = {
  name: 'Oasis Mexican Kitchen & Bar',
  shortName: 'Oasis',
  tagline: 'Modern Mexican. Tropical Energy.',

  street: '1250 E. 9th St.',
  locality: 'Lockport',
  region: 'IL',
  postalCode: '60441',
  country: 'US',
  geo: null, // Not published first-party. Not guessed. See CONTENT-QUESTIONS.md §10.

  phone: {
    value: '(815) 545-7556',
    provisional: true,
    note: 'CONTENT-QUESTIONS.md §1 — Toast publishes (815) 524-4188 instead.',
  },
  altPhone: {
    value: '(815) 524-4188',
    provisional: true,
    note: 'CONTENT-QUESTIONS.md §1 — recorded, not published, pending owner confirmation.',
  },
  email: null, // No email address exists on any Oasis surface. CONTENT-QUESTIONS.md §10.

  timeZone: 'America/Chicago',

  hours: {
    value: [
      { day: 0, ranges: [{ openMinutes: 600, closeMinutes: 1260 }] }, // Sun 10a–9p
      { day: 1, ranges: [{ openMinutes: 600, closeMinutes: 1320 }] }, // Mon 10a–10p
      { day: 2, ranges: [{ openMinutes: 600, closeMinutes: 1320 }] }, // Tue
      { day: 3, ranges: [{ openMinutes: 600, closeMinutes: 1320 }] }, // Wed
      { day: 4, ranges: [{ openMinutes: 600, closeMinutes: 1320 }] }, // Thu
      { day: 5, ranges: [{ openMinutes: 600, closeMinutes: 1500 }] }, // Fri 10a–1a
      { day: 6, ranges: [{ openMinutes: 600, closeMinutes: 1500 }] }, // Sat 10a–1a
    ],
    provisional: true,
    note: 'CONTENT-QUESTIONS.md §2 — Toast shows an 11am open every day plus a Mon/Wed midday closure.',
  },

  temporaryClosures: [],

  reservationUrl: RESERVATION_URL,
  orderUrl: ORDER_URL,
  // Toast serves the catering menu from the same ordering site, under CATERING MENU.
  cateringOrderUrl: ORDER_URL,
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Oasis Mexican Kitchen & Bar, 1250 E 9th St, Lockport, IL 60441'),

  // Only accounts that actually exist. The live site also links youtube.com,
  // x.com, linkedin.com and tiktok.com — all platform homepages, not Oasis
  // accounts. Those are deliberately dropped. CONTENT-QUESTIONS.md §9.
  socials: [
    {
      platform: 'facebook',
      handle: 'OasisMexicanKitchenandBar',
      url: 'https://www.facebook.com/OasisMexicanKitchenandBar/',
    },
    {
      platform: 'instagram',
      handle: '@oasismexbar',
      url: 'https://www.instagram.com/oasismexbar/',
    },
  ],

  priceRange: '$$',
  cuisine: ['Mexican', 'Bar'],
};

/**
 * Announcements ship DISABLED.
 *
 * Two promotions are referenced on the live site — a "$1 Taco Deal" and a lunch
 * deal (the homepage's largest asset is literally named OASIS_LUNCH_DEAL_REEL.mov)
 * — but neither has published days, times, or terms anywhere. The bar is built and
 * scheduled; it is not filled with an invented offer.
 * See docs/CONTENT-QUESTIONS.md §12.
 */
export const announcements: Announcement[] = [
  {
    id: 'lunch-deal',
    message: 'Lunch deal — details to be confirmed by the restaurant.',
    href: null,
    linkLabel: null,
    startsAt: null,
    endsAt: null,
    enabled: false,
    tone: 'default',
  },
];

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
