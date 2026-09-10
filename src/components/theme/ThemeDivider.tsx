import { getActiveTheme } from '@/themes/resolve';

/**
 * An ornamental transition between two homepage movements.
 *
 * Renders nothing on the default look, so the placements in the page are inert
 * until a theme is on. Used twice on the homepage and nowhere else — the brief
 * asks for restraint, and a divider at every boundary is wallpaper.
 */
export async function ThemeDivider({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const theme = await getActiveTheme();
  if (!theme.definition || !theme.config.options.edges) return null;
  const divider = theme.assets.divider;
  if (!divider.path) return null;

  return (
    <div aria-hidden="true" className="theme-divider" data-tone={tone}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={divider.path} alt="" loading="lazy" decoding="async" />
    </div>
  );
}

/** Foreground artwork in the footer's corners. */
export async function ThemeFooterLayer() {
  const theme = await getActiveTheme();
  if (!theme.definition || !theme.config.options.edges) return null;
  const art = theme.assets.foregroundDecoration;
  if (!art.path) return null;

  return (
    <div aria-hidden="true" className="theme-footer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.path} alt="" className="theme-footer-left" loading="lazy" decoding="async" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={art.path} alt="" className="theme-footer-right" loading="lazy" decoding="async" />
    </div>
  );
}
