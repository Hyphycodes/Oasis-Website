import type {
  SeasonalThemeSlug,
  ThemeConfig,
  ThemeDefinition,
  ThemeIntensity,
  ThemePreset,
  ThemeSlug,
} from './types';

/**
 * The themes that exist.
 *
 * Adding a theme later is: one entry here, one CSS file under
 * `src/themes/<slug>/`, artwork under `public/themes/<slug>/`, and the slug in
 * `THEME_SLUGS`. Nothing in the admin or the public site has to change.
 * See docs/halloween-dotd-theme.md → "Future theme creation".
 */

const HALLOWEEN_ART = '/themes/halloween-dotd';

export const HALLOWEEN_DEFAULTS: ThemeConfig = {
  options: { texture: true, glow: true, petals: true, edges: true, motion: true },
  intensity: 'standard',
  assets: {},
};

export const THEMES: Record<SeasonalThemeSlug, ThemeDefinition> = {
  'halloween-dotd': {
    slug: 'halloween-dotd',
    name: 'Halloween · Día de los Muertos',
    shortName: 'Día de los Muertos',
    description:
      'A late-October art direction: deep plum and near-black surfaces, candle amber, marigolds at the edges, papel picado overhead and slow drifting petals. The same Oasis underneath.',
    canvas: '#120a12',
    themeColor: '#120a12',
    assets: {
      heroBackground: {
        label: 'Hero background',
        hint: 'Optional photo or short video behind the headline. Leave empty to keep the Oasis reel.',
        accepts: 'image-or-video',
        defaultPath: null,
      },
      texture: {
        label: 'Background texture',
        hint: 'A tiling paper or plaster texture laid over the whole site at low strength.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/texture.webp`,
        defaultKind: 'image',
      },
      topDecoration: {
        label: 'Top decoration',
        hint: 'Hangs across the top of the hero. Ships as papel picado.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/papel-picado.webp`,
        defaultKind: 'image',
      },
      leftDecoration: {
        label: 'Left decoration',
        hint: 'Enters the hero from the left edge. Ships as a marigold cluster.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/marigold-left.webp`,
        defaultKind: 'image',
      },
      rightDecoration: {
        label: 'Right decoration',
        hint: 'Enters the hero from the right edge. Ships as a marigold cluster.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/marigold-right.webp`,
        defaultKind: 'image',
      },
      foregroundDecoration: {
        label: 'Foreground decoration',
        hint: 'Sits in the corners of the footer, in front of everything.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/foreground.webp`,
        defaultKind: 'image',
      },
      petals: {
        label: 'Floating petals',
        hint: 'One small transparent image, drifted slowly down the page many times over.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/petal.svg`,
        defaultKind: 'image',
      },
      divider: {
        label: 'Section divider',
        hint: 'The ornament between homepage sections.',
        accepts: 'image',
        defaultPath: `${HALLOWEEN_ART}/divider.webp`,
        defaultKind: 'image',
      },
    },
    defaults: HALLOWEEN_DEFAULTS,
  },
};

/** The admin's choice list, in display order. Default Oasis first. */
export const THEME_CHOICES: { slug: ThemeSlug; name: string; description: string }[] = [
  {
    slug: 'default',
    name: 'Default Oasis',
    description: 'The everyday look — warm ivory, sand and chile-coral. No seasonal layers.',
  },
  ...Object.values(THEMES).map((theme) => ({
    slug: theme.slug,
    name: theme.name,
    description: theme.description,
  })),
];

export function isSeasonalSlug(value: unknown): value is SeasonalThemeSlug {
  return typeof value === 'string' && value in THEMES;
}

export function isThemeSlug(value: unknown): value is ThemeSlug {
  return value === 'default' || isSeasonalSlug(value);
}

export function getThemeDefinition(slug: ThemeSlug): ThemeDefinition | null {
  return slug === 'default' ? null : THEMES[slug];
}

/**
 * What each intensity means, in numbers the admin never sees.
 *
 * Petal counts are elements in the DOM, so they are kept small; the multipliers
 * scale the base opacities set in the theme's CSS.
 */
export const PRESETS: Record<ThemeIntensity, ThemePreset> = {
  subtle: { petals: { desktop: 7, mobile: 3 }, glow: 0.6, texture: 0.55, vignette: 0.6, edges: 0.85 },
  standard: { petals: { desktop: 14, mobile: 6 }, glow: 1, texture: 1, vignette: 1, edges: 1 },
  full: { petals: { desktop: 22, mobile: 8 }, glow: 1.3, texture: 1.25, vignette: 1.15, edges: 1.1 },
};

export const INTENSITY_LABEL: Record<ThemeIntensity, { name: string; hint: string }> = {
  subtle: { name: 'Subtle', hint: 'A hint of the season. Fewer petals, softer glow.' },
  standard: { name: 'Standard', hint: 'The intended look.' },
  full: { name: 'Full', hint: 'Everything turned up for the week of the holiday.' },
};
