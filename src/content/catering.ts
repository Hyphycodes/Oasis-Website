import type { CateringItem, CateringPackage } from './types';

/**
 * Catering content captured 2026-08-14 from the CATERING MENU section of
 * https://oasismexicanlockport.toast.site/order
 *
 * This program is fully built and completely invisible on the current website —
 * it exists only inside the Toast ordering flow. Every price and inclusion below
 * is quoted from Toast verbatim. Nothing is invented, and no lead time, delivery
 * radius, or minimum is stated because none is published.
 * See docs/CONTENT-QUESTIONS.md §7.
 */

export const cateringPackages: CateringPackage[] = [
  {
    id: 'fiesta-pack',
    name: 'Fiesta Pack',
    servesMin: 15,
    servesMax: 20,
    priceCents: 24500,
    includes: [
      '40 tacos — steak, chicken, pastor or mix',
      'Rice & beans (half tray)',
      'Chips & salsa (½ gallon)',
      'Red & green salsa included',
    ],
  },
  {
    id: 'tradicion-pack',
    name: 'Tradición Pack',
    servesMin: 25,
    servesMax: 30,
    priceCents: 36500,
    includes: [
      '80 tacos (two trays of 40)',
      'Rice & beans (full tray)',
      'Chips & salsa (1 gallon)',
      'Red & green salsa included',
    ],
  },
  {
    id: 'fajita-fiesta',
    name: 'Fajita Fiesta',
    servesMin: 25,
    servesMax: 30,
    priceCents: 39500,
    includes: [
      'Fajitas, full tray — steak, chicken or mix',
      'Rice & beans (full tray)',
      'Tortillas',
      'Chips & salsa (1 gallon)',
      'Red & green salsa included',
    ],
  },
  {
    id: 'birria-lovers-pack',
    name: 'Birria Lovers Pack',
    servesMin: 20,
    servesMax: 25,
    priceCents: 31000,
    includes: [
      'Quesabirria tacos (40 pieces)',
      'Rice & beans (full tray)',
      'Chips & salsa (½ gallon)',
      '½ gallon consommé',
    ],
  },
  {
    id: 'office-lunch-pack',
    name: 'Office Lunch Pack',
    servesMin: 20,
    servesMax: 25,
    priceCents: 29500,
    includes: [
      'Poblano pasta with chicken',
      '40 tacos — chicken, pastor or steak',
      'Chips & salsa (½ gallon)',
    ],
  },
];

export const cateringItems: CateringItem[] = [
  {
    id: 'tray-40-tacos',
    name: 'Tray of 40 tacos',
    priceCents: 12000,
    note: 'Steak, chicken, pastor or mix. All toppings included — lettuce, cheese, tomato, onion, cilantro and limes. Includes 1 pint each of red & green salsa.',
  },
  {
    id: 'tray-40-half-burritos',
    name: 'Tray of 40 half burritos',
    priceCents: 16500,
    note: 'Includes 1 pint each of red & green salsa.',
  },
  {
    id: 'tray-40-quesabirria',
    name: 'Tray of 40 quesabirria tacos',
    priceCents: 13500,
    note: 'Includes 1 gallon of consommé.',
  },
  {
    id: 'fajitas-full-tray',
    name: 'Fajitas — full tray',
    priceCents: 16000,
    note: 'Includes 1 pint each of red & green salsa.',
  },
  {
    id: 'fajitas-half-tray',
    name: 'Fajitas — half tray',
    priceCents: 8500,
    note: 'Includes 1 pint each of red & green salsa.',
  },
  {
    id: 'poblano-pasta-tray',
    name: 'Poblano pasta with chicken',
    priceCents: 11000,
    note: 'Serves 20–25.',
  },
  { id: 'rice-full-tray', name: 'Rice — full tray', priceCents: 6000, note: null },
  { id: 'rice-half-tray', name: 'Rice — half tray', priceCents: 3200, note: null },
  { id: 'beans-full-tray', name: 'Beans — full tray', priceCents: 6000, note: null },
  { id: 'beans-half-tray', name: 'Beans — half tray', priceCents: 3200, note: null },
  {
    id: 'chips-salsa-catering',
    name: 'Chips & salsa',
    priceCents: 3000,
    note: 'Includes ½ gallon of salsa.',
  },
  { id: 'salsa-half-gallon', name: '½ gallon salsa', priceCents: 2000, note: null },
  { id: 'consomme-half-gallon', name: '½ gallon consommé', priceCents: 1500, note: null },
];

/**
 * Private events. Only the Birthday Celebration is verified — it is sold on the
 * cocktail menu. Capacity, room names, buyout pricing and F&B minimums are NOT
 * published anywhere and are NOT invented here.
 * See docs/CONTENT-QUESTIONS.md §8.
 */
export const birthdayCelebration = {
  name: 'Birthday Celebration',
  includes: [
    'A signature birthday dessert',
    'The staff birthday song, plus your choice of song',
    'A high-energy LED show from our team',
    'A confetti popper',
  ],
  addOns: [
    { label: 'Moët mini bottle', priceCents: 3500 },
    { label: 'Moët 750ml', priceCents: 15000 },
  ],
};

export const privateEventTypes = [
  'Birthday',
  'Quinceañera',
  'Graduation',
  'Corporate / team',
  'Rehearsal dinner',
  'Other celebration',
] as const;
