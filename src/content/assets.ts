/**
 * Central asset registry.
 *
 * Components request assets by semantic ID — <Asset id="signatureBirria" /> — and
 * never by file path. Replacing the entire media package is therefore either a
 * one-line change per entry, or dropping a same-named file into public/media/.
 *
 * Human-readable view: docs/ASSET-MANIFEST.md
 * Slot requirements:   docs/ASSET-SLOT-SPECS.md
 * Validation:          npm run assets:check
 */

export type AssetStatus = 'final' | 'temp-wix' | 'placeholder' | 'brand';
export type AssetKind = 'image' | 'video' | 'vector' | 'texture';

export interface AssetRecord {
  /** Path under /public, or null when the slot has no acceptable asset yet. */
  path: string | null;
  kind: AssetKind;
  /**
   * Alt text. `null` marks the asset as decorative — it renders alt="" plus
   * aria-hidden. This is an explicit decision per slot, not a blank default.
   */
  alt: string | null;
  width: number;
  height: number;
  /** `w:h`, validated against width/height by the checker. */
  ratio: string;
  /** CSS object-position. Protects faces and food when the crop changes. */
  focal: string;
  /** Narrow-viewport focal override, when the safe area moves. */
  focalMobile?: string;
  /** Required for kind: 'video'. */
  poster?: string;
  /** Asset ID rendered instead below 768px, when one exists. */
  mobileVariant?: string;
  status: AssetStatus;
  /** Where this asset appears. Drives the "registered but unused" check. */
  usage: string[];
  source?: { url: string; retrieved: string };
  /**
   * Set when the image has words baked into the pixels. A series artwork asset
   * tagged 'date' fails the build — recurring artwork must never be the
   * authoritative date source. See PLAN.md §4.1.
   */
  containsText?: 'none' | 'brand' | 'date';
  maxBytes?: number;
}

export const assets = {
  /* ---------------------------------------------------------------- brand */
  brandLogo: {
    path: '/media/brand/oasis-logo.png',
    kind: 'image',
    alt: 'Oasis Mexican Kitchen & Bar',
    width: 1200,
    height: 483,
    ratio: '1200:483',
    focal: '50% 50%',
    status: 'brand',
    usage: ['Header', 'Footer', 'OG image'],
    source: {
      url: 'https://static.wixstatic.com/media/75d74a_8a9adb90bedf4c779d3dc455bc1793cf~mv2.png',
      retrieved: '2026-08-14',
    },
    containsText: 'brand',
    maxBytes: 120_000,
  },
  brandGrain: {
    path: '/media/brand/paper-grain.png',
    kind: 'texture',
    alt: null,
    width: 160,
    height: 160,
    ratio: '1:1',
    focal: '50% 50%',
    status: 'final',
    usage: ['Sand surfaces (.grain)'],
    maxBytes: 14_000,
  },

  /* ----------------------------------------------------------------- home */
  /**
   * The hero source is a VERTICAL 9:16 brand reel, not a 16:9 loop — which is why
   * the hero media frame is portrait rather than a letterboxed landscape crop.
   * Re-encoded locally from 7.0 MB to 2.4 MB, audio stripped (it plays muted).
   */
  heroVideo: {
    path: '/media/video/hero-loop.mp4',
    kind: 'video',
    alt: null, // Decorative background loop; the headline carries the meaning.
    width: 720,
    height: 1280,
    ratio: '9:16',
    focal: '50% 50%',
    poster: '/media/home/hero-poster.jpg',
    status: 'temp-wix',
    usage: ['Homepage hero'],
    source: {
      url: 'https://video.wixstatic.com/video/75d74a_90dc1ee0e44347af94832b32fbc6709e/720p/mp4/file.mp4',
      retrieved: '2026-08-14',
    },
    maxBytes: 3_000_000,
  },
  heroPoster: {
    path: '/media/home/hero-poster.jpg',
    kind: 'image',
    alt: null,
    width: 720,
    height: 1280,
    ratio: '9:16',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['Hero poster', 'Reduced-motion hero', 'Save-Data hero'],
    maxBytes: 120_000,
  },
  /**
   * The highest-resolution photograph the restaurant currently has online. The
   * Wix filename gave no hint of its contents; it is the back bar.
   */
  backBar: {
    path: '/media/home/back-bar.jpg',
    kind: 'image',
    alt: 'The back bar at Oasis, stocked with tequila, whiskey and vodka under warm light',
    width: 1069,
    height: 1600,
    ratio: '1069:1600',
    focal: '50% 45%',
    status: 'temp-wix',
    usage: ['Homepage gallery', '/menu/cocktails'],
    source: {
      url: 'https://static.wixstatic.com/media/75d74a_0ceee05515384b0b9ec2501681efd0b2~mv2.jpeg',
      retrieved: '2026-08-14',
    },
    maxBytes: 420_000,
  },
  exteriorSign: {
    path: '/media/home/exterior-sign.jpg',
    kind: 'image',
    alt: 'The Oasis Mexican Restaurant sign on the building exterior',
    width: 720,
    height: 540,
    ratio: '4:3',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['Homepage gallery', '/visit'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    containsText: 'brand',
    maxBytes: 200_000,
  },
  /**
   * The Wix filename claims this is a lunch-deal reel still; it is in fact the
   * best photograph the restaurant has — a full dining room at service, with the
   * greenery wall and rattan pendants. Named and described for what it shows.
   */
  diningRoom: {
    path: '/media/home/dining-room.jpg',
    kind: 'image',
    alt: 'The Oasis dining room full at service, under rattan pendant lights, with the greenery wall behind',
    width: 1143,
    height: 1728,
    ratio: '1143:1728',
    focal: '50% 55%',
    status: 'temp-wix',
    usage: ['Homepage gallery'],
    source: {
      url: 'https://static.wixstatic.com/media/75d74a_b8e2fa52eb7746fc8a0a306ffc98978d~mv2.jpeg',
      retrieved: '2026-08-14',
    },
    maxBytes: 380_000,
  },
  plateTorta: {
    path: '/media/menu/plate-torta.jpg',
    kind: 'image',
    alt: 'A torta served with rice, refried beans and salsa',
    width: 720,
    height: 900,
    ratio: '4:5',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['Homepage experience grid'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    maxBytes: 220_000,
  },
  roomAtmosphere: {
    path: '/media/home/room-atmosphere.jpg',
    kind: 'image',
    alt: 'The Oasis dining room, with the greenery wall and rattan pendant lights',
    width: 720,
    height: 480,
    ratio: '3:2',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['Homepage experience grid'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    maxBytes: 200_000,
  },
  bartender: {
    path: '/media/home/gallery-02.jpg',
    kind: 'image',
    alt: 'A bartender holding a freshly made margarita',
    width: 720,
    height: 720,
    ratio: '1:1',
    focal: '50% 40%',
    status: 'temp-wix',
    usage: ['Homepage bar & brunch section'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    maxBytes: 200_000,
  },

  /* ----------------------------------------------------------------- menu */
  cocktailPair: {
    path: '/media/menu/cocktail-pair.jpg',
    kind: 'image',
    alt: 'A margarita with a Tajín rim being finished at the bar',
    width: 720,
    height: 900,
    ratio: '4:5',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['Homepage bar & brunch section', '/menu/cocktails'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    maxBytes: 220_000,
  },
  brunchTable: {
    path: null,
    kind: 'image',
    alt: 'A brunch table at Oasis',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    focal: '50% 45%',
    status: 'placeholder',
    usage: ['/menu/brunch'],
    maxBytes: 420_000,
  },

  /* --------------------------------------------------------------- events */
  nightlifeCrowd: {
    path: null,
    kind: 'image',
    alt: 'A busy night on the floor at Oasis',
    width: 1800,
    height: 1200,
    ratio: '3:2',
    focal: '50% 40%',
    status: 'placeholder',
    usage: ['Homepage After Dark', '/events hero'],
    containsText: 'none',
    maxBytes: 480_000,
  },
  eventFridays: {
    path: null,
    kind: 'image',
    alt: 'Oasis Fridays',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    focal: '50% 45%',
    status: 'placeholder',
    usage: ['Oasis Fridays card and detail page'],
    // MUST stay 'none' or 'brand'. 'date' fails the build: recurring artwork can
    // never be the authoritative date source.
    containsText: 'none',
    maxBytes: 420_000,
  },
  eventLatinSaturdays: {
    path: null,
    kind: 'image',
    alt: 'Oasis Latin Saturdays',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    focal: '50% 45%',
    status: 'placeholder',
    usage: ['Latin Saturdays card and detail page'],
    containsText: 'none',
    maxBytes: 420_000,
  },

  /* ------------------------------------------------- catering & private */
  cateringSpread: {
    path: null,
    kind: 'image',
    alt: 'Catering trays laid out for a party',
    width: 1800,
    height: 1200,
    ratio: '3:2',
    focal: '50% 50%',
    status: 'placeholder',
    usage: ['/catering hero', 'Homepage catering promo'],
    maxBytes: 480_000,
  },
  cateringTray: {
    path: null,
    kind: 'image',
    alt: 'A full tray of tacos ready for pickup',
    width: 1200,
    height: 1200,
    ratio: '1:1',
    focal: '50% 50%',
    status: 'placeholder',
    usage: ['/catering package cards'],
    maxBytes: 380_000,
  },
  privateEvents: {
    path: null,
    kind: 'image',
    alt: 'A celebration table set up at Oasis',
    width: 1800,
    height: 1200,
    ratio: '3:2',
    focal: '50% 42%',
    status: 'placeholder',
    usage: ['/private-events hero', 'Homepage catering promo'],
    maxBytes: 480_000,
  },
  birthdayCelebration: {
    path: null,
    kind: 'image',
    alt: 'The Oasis team bringing out a birthday dessert',
    width: 1200,
    height: 1500,
    ratio: '4:5',
    focal: '50% 40%',
    status: 'placeholder',
    usage: ['/private-events birthday block'],
    maxBytes: 420_000,
  },

  /* --------------------------------------------------- careers & visit */
  teamEnergy: {
    path: '/media/careers/team-energy.jpg',
    kind: 'image',
    alt: 'A server carrying a tray of drinks through the dining room',
    width: 720,
    height: 480,
    ratio: '3:2',
    focal: '50% 50%',
    status: 'temp-wix',
    usage: ['/careers'],
    source: {
      url: 'Frame from the Oasis brand reel (see heroVideo)',
      retrieved: '2026-08-14',
    },
    maxBytes: 200_000,
  },
} as const satisfies Record<string, AssetRecord>;

export type AssetId = keyof typeof assets;

export function getAsset(id: AssetId): AssetRecord {
  return assets[id];
}

/** Aspect ratio as a CSS `aspect-ratio` value. */
export function ratioToCss(record: Pick<AssetRecord, 'ratio'>): string {
  return record.ratio.replace(':', ' / ');
}
