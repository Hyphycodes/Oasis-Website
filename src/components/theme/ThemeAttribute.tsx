'use client';

import { useEffect } from 'react';

/**
 * Mirrors the active theme onto <html> after hydration.
 *
 * The site layout wraps everything it renders in a `data-theme` element, which
 * is what paints the first frame. Two things live OUTSIDE that wrapper: the
 * mobile drawer, which portals into <body>, and the overscroll area. Custom
 * properties set on <html> reach both. The attribute is removed on unmount, so
 * navigating to the admin — which shares the root layout — never inherits it.
 */
export function ThemeAttribute({ slug, motion }: { slug: string; motion: 'on' | 'off' }) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = { theme: root.dataset.theme, motion: root.dataset.motion };
    root.dataset.theme = slug;
    root.dataset.motion = motion;
    return () => {
      if (previous.theme) root.dataset.theme = previous.theme;
      else delete root.dataset.theme;
      if (previous.motion) root.dataset.motion = previous.motion;
      else delete root.dataset.motion;
    };
  }, [slug, motion]);

  return null;
}
