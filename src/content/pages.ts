import type { PageSection, PageSeo } from './types';

/**
 * Page copy, kept entirely out of presentation components.
 *
 * Voice reference: the current site's careers page — "Join the Oasis Familia",
 * "every shift is a fiesta", "works hard, plays hard, feels like familia". Warm,
 * plural, Spanish-inflected, unpretentious. That is the brand.
 *
 * Prohibited: "culinary excellence", "embark on a journey", "where flavor meets
 * passion", invented awards, invented statistics, invented testimonials.
 */

export const homeSections: PageSection[] = [
  {
    // Was "What we are known for: Birria, a torta, and a margarita" — a claim
    // that three items define a restaurant with 38 of them, and one the owner
    // never approved. This section now shows the range instead of ranking it.
    key: 'breadth',
    eyebrow: 'From the kitchen to the bar',
    heading: 'Come hungry. Stay awhile.',
    body: 'Tacos and plates from the kitchen, a bar built on tequila, and brunch on the weekend.',
    visible: true,
    variant: 'stagger',
  },
  {
    key: 'bar',
    eyebrow: 'Bar & brunch',
    heading: 'Margaritas by the tower.',
    body: 'A bar built on tequila, and the weekend brunch that fills the room by eleven.',
    visible: true,
    variant: 'editorial-right',
  },
  {
    key: 'after-dark',
    eyebrow: 'Oasis After Dark',
    // Deliberately NOT "becomes a club" — Oasis is a restaurant and bar that
    // goes late, and describing it as a nightclub misrepresents the business.
    heading: 'The room changes after ten.',
    // No door price here. It is stated once, on the event feature, and the
    // ticket page is what settles the final total.
    body: 'Dinner first, music after. Friday and Saturday go later — eighteen and up.',
    visible: true,
    variant: 'band',
  },
  {
    key: 'two-paths',
    eyebrow: 'Catering & celebrations',
    heading: 'Take it with you, or take over the room.',
    body: null,
    visible: true,
    variant: 'stagger',
  },
];

export const pageCopy = {
  home: {
    // Two short lines, one idea: the food, and what happens to the room later.
    // Set in the display face, so it works as a marquee statement rather than a
    // sentence. Truthful — no awards, no heritage, no invented claims.
    heroHeadlineLines: ['Dinner first.', 'Music after.'],
    heroBody:
      'Modern Mexican in Lockport — birria, tortas and margaritas by the tower, in a room that keeps going after the kitchen closes.',
  },

  menu: {
    eyebrow: 'Menu',
    heading: 'Everything we make.',
    // One sentence about the unified menu. The old line opened the page with an
    // operational disclaimer about unpriced items; that note now sits at the
    // foot of the one menu it actually concerns.
    body: 'Food, cocktails and weekend brunch — all in one place.',
    unpricedNote:
      'A few things on the bar list are priced by the pour or by the bottle. Where a price is not shown, ask your server — we would rather tell you than print a number that moves.',
  },

  cocktails: {
    eyebrow: 'Bar',
    heading: 'Cocktails, cervezas, and things built for the table.',
    body: 'Tequila-forward classics, shareable towers and pitchers, and a full beer and wine list.',
  },

  brunch: {
    eyebrow: 'Weekends',
    heading: 'Brunch, Saturday and Sunday.',
    body: 'Served 10am to 3pm.',
  },

  events: {
    eyebrow: 'Oasis After Dark',
    // Restaurant-and-bar language. Not "turns into a club". Covers the whole
    // calendar now, not only the two weekly nights.
    heading: 'Something on almost every night.',
    // Entry price, ID rules and fees belong on the event feature and the ticket
    // page — not in a hero that has to be right about all three forever.
    body: 'Paint nights, brunches, comedy and the weekly nights — dinner first, music after.',
  },

  catering: {
    eyebrow: 'Catering',
    heading: 'Trays, packages, and enough food for the whole office.',
    body: 'Order catering through our Toast page, or send us the details and we will help you build it.',
    note: 'Lead times, delivery, and minimums are set by the restaurant — send an inquiry and the team will confirm what works for your date.',
  },

  privateEvents: {
    eyebrow: 'Celebrations',
    heading: 'Birthdays, quinceañeras, and everything worth making noise about.',
    body: 'Tell us the date and the headcount, and someone from Oasis will get back to you with what we can do.',
  },

  visit: {
    eyebrow: 'Find us',
    // Deliberately NOT the street address. The address is a business fact and
    // lives once, in settings; a copy of it in an editable heading is a copy that
    // goes stale the day the restaurant moves or the suite number changes.
    heading: 'Come and find us.',
    body: 'Fresh Mexican flavors and a modern room in the heart of Lockport.',
  },

  careers: {
    eyebrow: 'Join the',
    heading: 'Oasis Familia',
    body: 'We are looking for passionate people to help us serve modern Mexican flavors and good vibes.',
    energyHeading: 'The Oasis energy',
    energyBody:
      'At Oasis, every shift is a fiesta. Expect a busy, high-energy environment where the music is always on point and teamwork is our secret sauce. We keep things fun and friendly, and the perks are hard to beat — great tips and staff meals to keep you going. Come join a crew that works hard, plays hard, and feels like familia.',
    perks: ['Flexible shifts', 'Staff meals', 'Vibrant atmosphere'],
    marquee: 'Good música • Great food • Bold vibes',
  },

  notFound: {
    heading: 'This one is off the menu.',
    body: 'The page you were looking for does not exist. Here is where everybody else is going.',
  },
} as const;

export const seo: Record<string, PageSeo> = {
  home: {
    title: 'Oasis Mexican Kitchen & Bar — Modern Mexican in Lockport, IL',
    description:
      'Modern Mexican kitchen and bar in Lockport, IL. Birria, quesabirrias, handcrafted cocktails, weekend brunch, and 18+ nightlife Friday and Saturday. Reserve a table or order online.',
    ogAssetId: null,
  },
  menu: {
    title: 'Menu — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Food, cocktails and weekend brunch at Oasis Mexican Kitchen & Bar in Lockport, IL. Quesabirrias, the Bizza, birria ramen, fajitas, carne asada, margaritas and towers.',
    ogAssetId: null,
  },
  events: {
    title: 'Events & Nightlife — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'What is on at Oasis in Lockport, IL: Paint & Sip nights, brunches, comedy, and Oasis Fridays and Latin Saturdays every week. Tickets, dates and times for every event.',
    ogAssetId: null,
  },
  catering: {
    title: 'Catering — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Taco trays, fajita trays, quesabirria trays and party packages serving 15–30 from Oasis Mexican Kitchen & Bar in Lockport, IL. Order and see pricing on Toast.',
    ogAssetId: null,
  },
  privateEvents: {
    title: 'Private Events & Celebrations — Oasis Mexican Kitchen & Bar',
    description:
      'Host your birthday, quinceañera or team celebration at Oasis Mexican Kitchen & Bar in Lockport, IL. Send an inquiry and our team will follow up.',
    ogAssetId: null,
  },
  visit: {
    title: 'Visit — Oasis Mexican Kitchen & Bar, 1250 E. 9th St., Lockport IL',
    description:
      'Hours, address, directions and phone for Oasis Mexican Kitchen & Bar at 1250 E. 9th St., Lockport, IL 60441.',
    ogAssetId: null,
  },
  careers: {
    title: 'Join Our Team — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Now hiring at Oasis Mexican Kitchen & Bar in Lockport, IL. Flexible shifts, staff meals, and a crew that feels like familia.',
    ogAssetId: null,
  },
  privacy: {
    title: 'Privacy — Oasis Mexican Kitchen & Bar',
    description: 'How Oasis Mexican Kitchen & Bar handles information submitted through this website.',
    ogAssetId: null,
  },
};
