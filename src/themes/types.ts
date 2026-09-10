/**
 * The seasonal theme model.
 *
 * A theme is an art-direction layer over the existing Oasis design: a remap of
 * the design tokens plus a handful of decorative layers. It is switched by ONE
 * attribute on the public site's root wrapper, and it is configured by a
 * restaurant admin through a small set of creative options — never through CSS
 * values.
 *
 * Everything the admin, the database row, the public site and the artwork
 * script agree on is declared here, once.
 */

export const THEME_SLUGS = ['default', 'halloween-dotd'] as const;
export type ThemeSlug = (typeof THEME_SLUGS)[number];
/** Every theme except the untouched Oasis look. */
export type SeasonalThemeSlug = Exclude<ThemeSlug, 'default'>;

export const DEFAULT_THEME: ThemeSlug = 'default';

/**
 * The artwork slots a theme exposes to the admin. Each is optional: a missing
 * override falls back to the theme's shipped default (or to nothing at all for a
 * slot whose default is "keep what the site already shows").
 */
export const THEME_ASSET_SLOTS = [
  'heroBackground',
  'texture',
  'topDecoration',
  'leftDecoration',
  'rightDecoration',
  'foregroundDecoration',
  'petals',
  'divider',
] as const;
export type ThemeAssetSlot = (typeof THEME_ASSET_SLOTS)[number];

/** The five understandable switches. Nothing lower-level is ever exposed. */
export const THEME_OPTIONS = ['texture', 'glow', 'petals', 'edges', 'motion'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export const THEME_INTENSITIES = ['subtle', 'standard', 'full'] as const;
export type ThemeIntensity = (typeof THEME_INTENSITIES)[number];

/** What the admin saves. Stored as JSON in `site_themes.config`. */
export interface ThemeConfig {
  options: Record<ThemeOption, boolean>;
  intensity: ThemeIntensity;
  /** Slot → `media_assets.asset_id` of an uploaded override. */
  assets: Partial<Record<ThemeAssetSlot, string>>;
}

export interface ThemeAssetSpec {
  label: string;
  hint: string;
  /** What the admin may upload into this slot. */
  accepts: 'image' | 'video' | 'image-or-video';
  /** Shipped artwork under /public, or null when the slot defaults to "nothing". */
  defaultPath: string | null;
  /** Kind of the shipped default, when there is one. */
  defaultKind?: 'image' | 'video';
}

export interface ThemeDefinition {
  slug: ThemeSlug;
  name: string;
  /** Short form for chips and the admin nav. */
  shortName: string;
  description: string;
  /** The colour that should paint behind everything, including overscroll. */
  canvas: string;
  /** Browser-chrome colour for phones. */
  themeColor: string;
  assets: Record<ThemeAssetSlot, ThemeAssetSpec>;
  defaults: ThemeConfig;
}

/** One `site_themes` row, typed. */
export interface ThemeRecord {
  slug: SeasonalThemeSlug;
  enabled: boolean;
  scheduleEnabled: boolean;
  /** ISO instants. Entered by the admin in the restaurant's timezone. */
  startAt: string | null;
  endAt: string | null;
  config: ThemeConfig;
  updatedAt: string | null;
}

/** The pre-set values an intensity chooses. Internal — never shown to the admin. */
export interface ThemePreset {
  /** Petal elements rendered on desktop / on phones. */
  petals: { desktop: number; mobile: number };
  /** Multipliers applied to the theme's base opacities. */
  glow: number;
  texture: number;
  vignette: number;
  /** Scale of the edge decorations. */
  edges: number;
}

export interface ResolvedThemeAsset {
  path: string | null;
  kind: 'image' | 'video';
  /** True when the admin replaced the shipped default. */
  overridden: boolean;
}

/** Everything the public site needs to render a theme, fully defaulted. */
export interface ResolvedTheme {
  slug: ThemeSlug;
  /** Null only for the default Oasis look, which has no definition to render. */
  definition: ThemeDefinition | null;
  config: ThemeConfig;
  preset: ThemePreset;
  assets: Record<ThemeAssetSlot, ResolvedThemeAsset>;
  /** How this theme came to be active. Surfaced in preview and in the admin. */
  source: 'default' | 'manual' | 'scheduled' | 'preview' | 'forced';
}

/** The admin's status line, derived from a record and the current time. */
export type ThemeStatus = 'off' | 'live' | 'scheduled' | 'ended';
