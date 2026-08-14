import type { Menu, MenuItem } from './types';

/**
 * Menu content captured 2026-08-14 from https://www.oasismexicankitchenbar.com/menus
 *
 * Rules applied:
 *  - Prices are the FIRST-PARTY website prices. Where Toast disagrees, the website
 *    wins and the conflict is logged (docs/CONTENT-QUESTIONS.md §4).
 *  - `priceCents: null` means the base price is not published anywhere first-party.
 *    It is NOT filled in from Toast, and it is NOT rendered as $0 or hidden.
 *  - Spelling normalized only where the intended meaning is certain (§13).
 *  - Nothing here is invented: no ingredients, no allergens, no dietary claims
 *    beyond what the restaurant itself states.
 */

const MARKET = 'Ask your server';

/** Shorthand for an item whose base price the restaurant has not published. */
function unpriced(
  partial: Omit<MenuItem, 'priceCents' | 'priceNote' | 'available' | 'featured' | 'dietary'> &
    Partial<Pick<MenuItem, 'dietary' | 'featured' | 'available'>>,
): MenuItem {
  return {
    dietary: [],
    featured: false,
    available: true,
    ...partial,
    priceCents: null,
    priceNote: MARKET,
  };
}

/* ========================================================================== */
/* FOOD                                                                       */
/* ========================================================================== */

export const foodMenu: Menu = {
  slug: 'food',
  title: 'Food',
  note: null,
  emptyState: null,
  categories: [
    {
      id: 'starters',
      name: 'Starters',
      note: null,
      items: [
        {
          id: 'oasis-wings',
          name: 'Oasis Wings',
          description: '8 wings of your choice of sauce, with ranch.',
          priceCents: 1800,
          priceNote: null,
          modifierGroupLabel: 'Sauce',
          modifiers: [
            { label: 'Mole', priceCents: null },
            { label: 'Mango Habanero', priceCents: null },
            { label: 'Buffalo', priceCents: null },
            { label: 'BBQ', priceCents: null },
          ],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'queso-dip',
          name: 'Queso Dip',
          description: 'Queso dip with chorizo & chips: messy, cheesy, and absolutely necessary.',
          priceCents: 900,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'crispy-shrimps',
          name: 'Crispy Shrimps',
          description: 'Golden-fried shrimp served over a fresh spring mix salad.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'street-corn',
          name: 'Street Corn',
          description:
            'Four grilled mini corn cobs with creamy mayo, topped with Cotija cheese and Tajín.',
          priceCents: 1000,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        unpriced({
          id: 'quesadilla',
          name: 'Quesadilla',
          description:
            'Melted cheese in a warm tortilla, served with a side salad of lettuce, tomato & sour cream.',
          modifierGroupLabel: 'Add',
          modifiers: [
            { label: 'Add meat', priceCents: 400 },
            { label: 'Upgrade to dinner', priceCents: 200 },
          ],
          dietary: ['vegetarian'],
        }),
        unpriced({
          id: 'loaded-nachos',
          name: 'Loaded Nachos',
          description:
            'Crispy chips topped with nacho cheese, mozzarella, beans, lettuce, tomato, guacamole, sour cream, and jalapeño.',
          modifierGroupLabel: 'Add',
          modifiers: [{ label: 'Meat', priceCents: 400 }],
          dietary: ['vegetarian'],
        }),
        unpriced({
          id: 'oasis-fries',
          name: 'Oasis Fries',
          description:
            'Fries smothered in nacho cheese, jalapeño, mozzarella, guacamole & sour cream.',
          modifierGroupLabel: 'Add',
          modifiers: [{ label: 'Meat', priceCents: 400 }],
          dietary: ['vegetarian'],
        }),
        {
          id: 'guacamole',
          name: 'Guacamole',
          description:
            'A blend of fresh onion, jalapeño, tomato, cilantro, and lime, served with tortilla chips.',
          priceCents: 1200,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian', 'vegan'],
          available: true,
          featured: false,
        },
        unpriced({
          id: 'caesar-salad',
          name: 'Caesar Salad',
          description:
            'Crisp romaine tossed in creamy Caesar dressing, topped with seasoned croutons and fresh grated Parmesan.',
          modifierGroupLabel: 'Add 8oz',
          modifiers: [
            { label: 'Chicken', priceCents: 400 },
            { label: 'Shrimp', priceCents: 600 },
          ],
          dietary: ['vegetarian'],
        }),
      ],
    },

    {
      id: 'entrees',
      name: 'Entrees',
      note: null,
      items: [
        unpriced({
          id: 'taco-dinner',
          name: 'Taco Dinner',
          description:
            'Three street tacos with your choice of meat and toppings, served with rice and beans.',
          modifierGroupLabel: 'Choice of meat',
          modifiers: [
            { label: 'Steak', priceCents: null },
            { label: 'Tinga', priceCents: null },
            { label: 'Grilled Chicken', priceCents: null },
            { label: 'Ground Beef', priceCents: null },
            { label: 'Pastor', priceCents: null },
            { label: 'Birria', priceCents: null },
            { label: 'Carnitas', priceCents: null },
            { label: 'Veggie — grilled peppers, onions, tomato', priceCents: null },
            { label: 'Sour Cream', priceCents: 50 },
            { label: 'Guacamole', priceCents: 50 },
            { label: 'Avocado Slices', priceCents: 50 },
          ],
        }),
        unpriced({
          id: 'taco-salad',
          name: 'Taco Salad',
          description:
            'Crisp lettuce layered with seasoned beans, shredded cheese, fresh tomato, and sour cream, topped with your choice of meat and served in a golden crispy tortilla bowl.',
          modifierGroupLabel: 'Add',
          modifiers: [{ label: 'Upgrade to Fajita Salad', priceCents: 200 }],
        }),
        {
          id: 'birria-ramen',
          name: 'Birria Ramen',
          description: 'A fusion of ramen noodles with flavorful birria, cilantro, onion and cheese.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: true,
        },
        {
          id: 'bizza',
          name: 'Our Famous Bizza',
          description:
            'Our unique birria pizza creation, topped with cilantro and onion. Comes with a side of consommé.',
          priceCents: 2000,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: true,
        },
        {
          id: 'burrito-dinner',
          name: 'Burrito Dinner',
          description:
            'A hearty burrito filled with rice, beans, lettuce, cheese, tomato, sour cream and your choice of meat.',
          priceCents: 1400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'enchiladas-dinner',
          name: 'Enchiladas Dinner',
          description:
            'Stuffed with your choice of meat, smothered in green, poblano, mole or red sauce.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: 'Sauce',
          modifiers: [
            { label: 'Green', priceCents: null },
            { label: 'Poblano', priceCents: null },
            { label: 'Mole', priceCents: null },
            { label: 'Red', priceCents: null },
          ],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'poblano-pasta',
          name: 'Poblano Pasta',
          description:
            'Grilled chicken in a rich poblano sauce finished with ricotta salata. Shrimp substitution available.',
          priceCents: 2000,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        unpriced({
          id: 'oasis-alfredo',
          name: 'Oasis Alfredo Pasta',
          description:
            'Creamy alfredo pasta tossed with a hint of Mexican spice, topped with grilled chicken and fresh Parmesan. Shrimp substitution available.',
          modifierGroupLabel: null,
          modifiers: [],
        }),
        unpriced({
          id: 'fajitas',
          name: 'Fajitas',
          description:
            'Sizzling skillet of grilled bell peppers and onions with your choice of protein. Comes with rice, beans, lettuce, tomato, guacamole, sour cream and warm tortillas.',
          modifierGroupLabel: 'Choice of protein',
          modifiers: [
            { label: 'Steak', priceCents: null },
            { label: 'Chicken', priceCents: null },
            { label: 'Shrimp', priceCents: null },
            { label: 'Combo', priceCents: 400 },
          ],
        }),
        {
          id: 'carne-asada',
          name: 'Carne Asada',
          description:
            'Tender skirt steak served with rice and refried beans, grilled jalapeño and onions, with warm tortillas, sour cream, guacamole, lettuce and tomato.',
          priceCents: 3400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'tampiquena',
          name: 'Tampiqueña Dinner',
          description:
            'Tender skirt steak served with a mole cheese enchilada topped with sour cream and sesame seeds. Served with rice, refried beans, grilled jalapeño and onions, with warm tortillas, sour cream, guacamole, lettuce and tomato.',
          priceCents: 3600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'mexican-rib-eye',
          name: 'Mexican Rib Eye',
          description:
            '16oz premium ribeye, flame-grilled and topped with herb butter. Served with street corn, rice, refried beans, grilled jalapeño and onions, with warm tortillas.',
          priceCents: 4000,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          // Flagged OUT OF STOCK on Toast at capture time. CONTENT-QUESTIONS.md §4.
          available: false,
          featured: false,
        },
        {
          id: 'torta',
          name: 'Torta',
          description:
            'Traditional Mexican sandwich on toasted telera bread with refried beans, lettuce, tomato, sour cream, avocado, mayo and melted cheese with your choice of meat.',
          priceCents: 1400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
      ],
    },

    {
      id: 'specialty-tacos',
      name: 'Specialty Tacos',
      note: null,
      items: [
        {
          id: 'quesabirrias',
          name: 'Our Famous Quesabirrias',
          description:
            'Three cheesy, crispy tacos filled with slow-braised birria beef and melted cheese, served with a side of rich consommé for dipping.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: true,
        },
        {
          id: 'tinga-tacos',
          name: 'Tinga Tacos',
          description:
            'Two spicy shredded chicken tacos with tomato and sour cream, topped with lettuce and queso fresco.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['spicy'],
          available: true,
          featured: false,
        },
        {
          id: 'arrachera-tacos',
          name: 'Arrachera Tacos',
          description:
            'Two tender, juicy skirt steak tacos seasoned and seared just like the taquerías in Mexico. Served on tortillas with onion, cilantro and salsa.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'carnitas-tacos',
          name: 'Carnitas Tacos',
          description:
            'Two slow-cooked tacos topped with pickled red onions, cilantro and a squeeze of lime.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'shrimp-tacos',
          name: 'Shrimp Tacos',
          description: 'Two crispy shrimp tacos with fresh turnip slaw, chipotle aioli and tangy lime.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'fish-tacos',
          name: 'Fish Tacos',
          description:
            'Two crispy battered fish tacos with fresh turnip slaw, chipotle aioli and tangy lime.',
          priceCents: 1600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
      ],
    },

    {
      id: 'sides',
      name: 'Sides',
      note: null,
      items: [
        {
          id: 'los-esquites',
          name: 'Los Esquites',
          description: 'Corn kernels with mayo, chili powder, Cotija cheese and lime.',
          priceCents: 600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        {
          id: 'side-rice',
          name: 'Rice',
          description: null,
          priceCents: 300,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        {
          id: 'side-beans',
          name: 'Beans',
          description: null,
          priceCents: 300,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        {
          id: 'side-fries',
          name: 'Fries',
          description: null,
          priceCents: 600,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        {
          id: 'side-salad',
          name: 'Salad',
          description: null,
          priceCents: 500,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
      ],
    },
  ],
};

/* ========================================================================== */
/* COCKTAILS & BAR                                                            */
/* ========================================================================== */

/** Beer/wine/soda are listed by name only — no prices are published anywhere. */
function listOnly(id: string, name: string): MenuItem {
  return {
    id,
    name,
    description: null,
    priceCents: null,
    priceNote: MARKET,
    modifierGroupLabel: null,
    modifiers: [],
    dietary: [],
    available: true,
    featured: false,
  };
}

export const cocktailMenu: Menu = {
  slug: 'cocktails',
  title: 'Cocktails & Bar',
  note: null,
  emptyState: null,
  categories: [
    {
      id: 'classic-cocktails',
      name: 'Classic Cocktails',
      note: null,
      items: [
        unpriced({
          id: 'margarita',
          name: 'Margarita',
          description:
            'Cazadores tequila, triple sec and fresh lime juice, served over ice or frozen.',
          modifierGroupLabel: 'Flavors',
          modifiers: [
            { label: 'Lime', priceCents: null },
            { label: 'Mango', priceCents: null },
            { label: 'Strawberry', priceCents: null },
            { label: 'Cucumber', priceCents: null },
            { label: 'Pineapple', priceCents: null },
            { label: 'Spicy', priceCents: null },
          ],
          featured: true,
        }),
        {
          id: 'blood-orange-paloma',
          name: 'Blood Orange Paloma',
          description:
            'Tequila, fresh lime, grapefruit soda and blood orange for a bright citrus finish, with a Tajín rim.',
          priceCents: 1200,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'cafe-de-horchata',
          name: 'Café de Horchata',
          description:
            'A smooth blend of bold coffee and creamy horchata, delivering a rich martini-style sip.',
          priceCents: 1200,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'cantarito',
          name: 'Cantarito',
          description:
            'Tequila, fresh citrus juices and grapefruit soda served with a bold chili-lime rim.',
          priceCents: 1200,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'mangonada',
          name: 'Mangonada',
          description:
            'Fresh mango purée, lime and tequila layered with chamoy and a Tajín rim — sweet, tangy and vibrant.',
          priceCents: 1400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: true,
        },
        {
          id: 'mojito',
          name: 'Mojito',
          description: 'Fresh mint, lime juice, sugar, rum and soda water — crisp, light and refreshing.',
          priceCents: 1300,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'oasis-old-fashioned',
          name: 'Oasis Old Fashioned',
          description:
            'House bourbon served over a large ice cube with orange peel — smooth, smoky and subtly sweet.',
          priceCents: 1400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'pina-colada',
          name: 'Piña Colada',
          description:
            'Creamy coconut, pineapple juice and white rum blended smooth and topped with pineapple. Also available frozen.',
          priceCents: 1200,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'espresso-martini',
          name: 'Espresso Martini',
          description: 'Premium vodka, fresh espresso and coffee liqueur finished with a silky foam top.',
          priceCents: 1400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'sangria',
          name: 'Sangria',
          description:
            'Red wine, fresh citrus and seasonal fruit with a splash of liqueur — lightly sweet, smooth and refreshing.',
          priceCents: 1100,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
      ],
    },

    {
      id: 'shareables',
      name: 'Fiesta Shareables',
      note: 'Built for the table.',
      items: [
        unpriced({
          id: 'margarita-tower',
          name: 'Margarita Tower',
          description:
            'An oversized cocktail served in our signature tower — bold, refreshing and made to share with the table.',
          modifierGroupLabel: 'Flavors',
          modifiers: [
            { label: 'Lime', priceCents: null },
            { label: 'Strawberry', priceCents: null },
            { label: 'Mango', priceCents: null },
            { label: 'Pineapple', priceCents: null },
            { label: 'Peach', priceCents: null },
          ],
          featured: true,
        }),
        unpriced({
          id: 'pitchers',
          name: 'Pitchers',
          description:
            'Your favorite margarita served in a generous, shareable pitcher. Sangria pitcher $38.',
          modifierGroupLabel: 'Flavors',
          modifiers: [
            { label: 'Lime', priceCents: null },
            { label: 'Strawberry', priceCents: null },
            { label: 'Mango', priceCents: null },
            { label: 'Jalapeño', priceCents: null },
            { label: 'Pineapple', priceCents: null },
            { label: 'Peach', priceCents: null },
            { label: 'Cucumber', priceCents: null },
          ],
        }),
        {
          id: 'jumbo-cantarito',
          name: 'Jumbo Cantarito',
          description:
            'A jumbo-sized mix of premium tequila, fresh lime, orange and grapefruit juices topped with sparkling citrus soda and a Tajín rim — bright, refreshing and built for sharing.',
          priceCents: 9900,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
      ],
    },

    {
      id: 'celebrations',
      name: 'Celebrations',
      note: 'Ask your server when you book — the team sets it up.',
      items: [
        unpriced({
          id: 'birthday-celebration',
          name: 'Birthday Celebration',
          description:
            'A signature birthday dessert, the staff birthday song and your choice of song, a high-energy LED show from our team, and a confetti popper.',
          modifierGroupLabel: 'Add champagne',
          modifiers: [
            { label: 'Moët mini bottle', priceCents: 3500 },
            { label: 'Moët 750ml', priceCents: 15000 },
          ],
          featured: true,
        }),
      ],
    },

    {
      id: 'beer-seltzers',
      name: 'Beer & Seltzers',
      note: 'Seltzer flavors vary based on availability.',
      items: [
        listOnly('beer-corona', 'Corona'),
        listOnly('beer-modelo-especial', 'Modelo Especial'),
        listOnly('beer-modelo-negra', 'Modelo Negra'),
        listOnly('beer-dos-equis', 'Dos Equis'),
        listOnly('beer-pacifico', 'Pacifico'),
        listOnly('beer-victoria', 'Victoria'),
        listOnly('beer-heineken', 'Heineken'),
        listOnly('beer-stella', 'Stella Artois'),
        listOnly('beer-bud-light', 'Bud Light'),
        listOnly('beer-miller-lite', 'Miller Lite'),
        listOnly('beer-coors-light', 'Coors Light'),
        listOnly('beer-busch-light', 'Busch Light'),
        listOnly('beer-ultra', 'Michelob Ultra'),
        listOnly('seltzer-high-noon', 'High Noon'),
        listOnly('seltzer-white-claw', 'White Claw'),
        listOnly('beer-na-corona', 'Corona Non-Alcoholic (21+)'),
        listOnly('cider-angry-orchard', 'Angry Orchard'),
        listOnly('craft-blue-moon', 'Blue Moon'),
      ],
    },

    {
      id: 'wine',
      name: 'Wine',
      note: null,
      items: [
        listOnly('wine-cabernet', 'Cabernet'),
        listOnly('wine-pinot-noir', 'Pinot Noir'),
        listOnly('wine-merlot', 'Merlot'),
        listOnly('wine-chardonnay', 'Chardonnay'),
        listOnly('wine-sauvignon-blanc', 'Sauvignon Blanc'),
        listOnly('wine-pinot-grigio', 'Pinot Grigio'),
        listOnly('wine-moscato', 'Moscato'),
      ],
    },

    {
      id: 'beverages',
      name: 'Non-Alcoholic',
      note: null,
      items: [
        listOnly('na-pepsi', 'Pepsi'),
        listOnly('na-diet-pepsi', 'Diet Pepsi'),
        listOnly('na-sprite', 'Sprite'),
        listOnly('na-dr-pepper', 'Dr. Pepper'),
        listOnly('na-lemonade', 'Lemonade'),
        listOnly('na-brisk', 'Brisk Sweet / Unsweet Iced Tea'),
        {
          id: 'na-jarritos',
          name: 'Jarritos',
          description: 'Flavors vary based on availability.',
          priceCents: 400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'na-horchata',
          name: 'Horchata',
          description: null,
          priceCents: 400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [{ label: 'Refill', priceCents: 100 }],
          dietary: ['vegetarian'],
          available: true,
          featured: false,
        },
        {
          id: 'na-jamaica',
          name: 'Jamaica',
          description: null,
          priceCents: 400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [{ label: 'Refill', priceCents: 100 }],
          dietary: ['vegetarian', 'vegan'],
          available: true,
          featured: false,
        },
        {
          id: 'na-coffee',
          name: 'Coffee',
          description: null,
          priceCents: 500,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
        {
          id: 'na-red-bull',
          name: 'Red Bull',
          description: null,
          priceCents: 400,
          priceNote: null,
          modifierGroupLabel: null,
          modifiers: [],
          dietary: [],
          available: true,
          featured: false,
        },
      ],
    },
  ],
};

/* ========================================================================== */
/* BRUNCH                                                                     */
/* ========================================================================== */

/**
 * The live site publishes a brunch tab with a service window and a "Brunch Plates"
 * heading — and zero items behind it. Nothing is invented here. The page states the
 * service window and says the menu is being finalized.
 * See docs/CONTENT-QUESTIONS.md §6.
 */
export const brunchMenu: Menu = {
  slug: 'brunch',
  title: 'Brunch',
  note: 'Served Saturday and Sunday, 10am to 3pm.',
  emptyState:
    'The full brunch menu is being finalized with the kitchen. Brunch is served every Saturday and Sunday from 10am to 3pm — call us or come in and ask what the kitchen is running this weekend.',
  categories: [],
};

export const menus = { food: foodMenu, cocktails: cocktailMenu, brunch: brunchMenu } as const;

export const allMenus: Menu[] = [foodMenu, cocktailMenu, brunchMenu];

/** Featured items for the homepage signature preview. Real items only. */
export const signatureItemIds = ['quesabirrias', 'bizza', 'birria-ramen'] as const;
