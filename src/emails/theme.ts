/**
 * The Oasis email design system: tokens.
 *
 * Sampled from `src/app/globals.css` so an email is unmistakably the same
 * building as the website, then reduced to what email clients can actually
 * hold: flat hex colours, system font stacks, integer pixels. No web fonts,
 * no gradients, no CSS variables — Outlook and Gmail strip or ignore them.
 *
 * Two surfaces. `dark` is the website's evening (espresso), which is where a
 * ticket lives; `light` is the ivory the menu sits on, used by the editorial
 * direction and by the account emails. Every component takes a `surface`
 * and reads its colours from here, so a palette change is one edit.
 */

export type Surface = 'dark' | 'light';

export const COLORS = {
  ivory: '#fbf6ea',
  ivoryDeep: '#f3ead6',
  linen: '#fffbf0',
  sand: '#ddb892',
  sandDeep: '#cba47e',
  brown: '#6a3f05',
  brownSoft: '#8a5620',
  coral: '#e1553a',
  coralDeep: '#bd3d1e',
  clay: '#b4441c',
  onOrange: '#2a1203',
  obsidian: '#0d0805',
  espresso: '#1a1008',
  espressoLift: '#241708',
  nightText: '#f7eedc',
  nightSoft: '#c4ac8c',
  teal: '#0f2e2c',
  plum: '#2e1620',
  amber: '#e8a33d',
  amberBright: '#f5bd5f',
  success: '#2f5434',
  successSoft: '#dfeadf',
  warning: '#b4441c',
  danger: '#9b2c1b',
  dangerSoft: '#f6e1dc',
  white: '#ffffff',
} as const;

export const FONTS = {
  sans: "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', Times, serif",
  mono: "'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export interface Palette {
  /** The page behind the email. */
  page: string;
  /** The email's own ground. */
  surface: string;
  /** A card sitting on the surface. */
  raised: string;
  text: string;
  muted: string;
  /** Hairlines. */
  line: string;
  accent: string;
  /** Text on the accent fill. */
  onAccent: string;
  link: string;
}

export const PALETTE: Record<Surface, Palette> = {
  dark: {
    page: COLORS.obsidian,
    surface: COLORS.espresso,
    raised: COLORS.espressoLift,
    text: COLORS.nightText,
    muted: COLORS.nightSoft,
    line: '#3a2a18',
    accent: COLORS.amber,
    onAccent: COLORS.onOrange,
    link: COLORS.amberBright,
  },
  light: {
    page: COLORS.ivoryDeep,
    surface: COLORS.ivory,
    raised: COLORS.linen,
    text: COLORS.brown,
    muted: COLORS.brownSoft,
    line: '#e6d6bd',
    accent: COLORS.coral,
    onAccent: COLORS.onOrange,
    link: COLORS.clay,
  },
};

/** Width of the email column. 600 is the one number every client agrees on. */
export const CONTAINER_WIDTH = 600;
/** Side padding inside the column. */
export const GUTTER = 24;
/** The QR's rendered size. Large on purpose: it is scanned off a phone in a dark room. */
export const QR_SIZE = 220;

export const RADIUS = { sm: 6, md: 12, lg: 20 } as const;

/** Reset every text block starts from, so a client's own margins do not apply. */
export const TEXT_RESET = { margin: 0, padding: 0 } as const;
