import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { getActiveTheme } from '@/themes/resolve';
import '@/themes/halloween-dotd/theme.css';

/** Phone browser chrome matches the seasonal canvas while a theme is on. */
export async function generateViewport(): Promise<Viewport> {
  const theme = await getActiveTheme();
  return theme.definition ? { themeColor: theme.definition.themeColor } : {};
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const theme = await getActiveTheme();
  return <SiteChrome theme={theme}>{children}</SiteChrome>;
}
