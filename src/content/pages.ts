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
    key: 'experience',
    eyebrow: 'What goes on here',
    heading: 'A kitchen, a bar, and a room that changes character after ten.',
    body: 'Lunch and dinner every day. Brunch on the weekend. Cocktails all night. And on Friday and Saturday the dining room turns into something else entirely.',
    visible: true,
    variant: 'stagger',
  },
  {
    key: 'signatures',
    eyebrow: 'Oasis originals',
    heading: 'The three you came for.',
    body: 'Everything on the menu is worth ordering. These are the ones people drive out to Lockport for.',
    visible: true,
    variant: 'editorial-left',
  },
  {
    key: 'bar',
    eyebrow: 'Bar & brunch',
    heading: 'Margaritas by the tower. Brunch on the weekend.',
    body: 'A full bar built around tequila, plus the shareables that show up at every good table — the tower, the pitchers, the jumbo cantarito.',
    visible: true,
    variant: 'editorial-right',
  },
  {
    key: 'after-dark',
    eyebrow: 'Oasis After Dark',
    heading: 'Friday and Saturday, the lights go down.',
    body: 'Two nights a week, doors at ten, eighteen and up. House and Top 100 on Friday. Reggaetón, corridos and guaracha on Saturday.',
    visible: true,
    variant: 'band',
  },
  {
    key: 'catering',
    eyebrow: 'Catering & celebrations',
    heading: 'Feed twenty. Or throw the whole party here.',
    body: 'Trays, packages and full spreads for pickup — or bring the celebration to us and let the team handle the rest.',
    visible: true,
    variant: 'editorial-left',
  },
  {
    key: 'gallery',
    eyebrow: 'The room',
    heading: 'Come see it.',
    body: null,
    visible: true,
    variant: 'plain',
  },
];

export const pageCopy = {
  home: {
    heroHeadlineLines: ['Modern Mexican.', 'Tropical Energy.'],
    heroBody:
      'Fresh, authentic flavors with a modern twist. Handcrafted cocktails, ice-cold cervezas, and a room that keeps going after the kitchen closes.',
  },

  menu: {
    eyebrow: 'The menu',
    heading: 'Everything we make.',
    body: 'Starters, entrees, specialty tacos and sides. Ask your server about anything that is not listed with a price — a few things move with the market.',
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
    heading: 'Two nights a week, this room turns into a club.',
    body: 'Eighteen and up, doors at ten, tickets ten dollars. Drinks are 21+ with valid ID.',
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
    heading: '1250 E. 9th St., Lockport.',
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
    title: 'Food Menu — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Starters, entrees, specialty tacos and sides at Oasis Mexican Kitchen & Bar in Lockport, IL. Quesabirrias, the Bizza, birria ramen, fajitas, carne asada and more.',
    ogAssetId: null,
  },
  cocktails: {
    title: 'Cocktails & Bar — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Margaritas, palomas, cantaritos, margarita towers and pitchers, plus a full beer and wine list at Oasis in Lockport, IL.',
    ogAssetId: null,
  },
  brunch: {
    title: 'Weekend Brunch — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Brunch served Saturday and Sunday, 10am to 3pm, at Oasis Mexican Kitchen & Bar in Lockport, IL.',
    ogAssetId: null,
  },
  events: {
    title: 'Events & Nightlife — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Oasis Fridays and Oasis Latin Saturdays. 18+, doors at 10pm, $10 general admission. House, Top 100, reggaetón, corridos and guaracha in Lockport, IL.',
    ogAssetId: null,
  },
  catering: {
    title: 'Catering — Oasis Mexican Kitchen & Bar, Lockport IL',
    description:
      'Taco trays, fajita trays, quesabirria trays and party packages serving 15–30 from Oasis Mexican Kitchen & Bar in Lockport, IL.',
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
