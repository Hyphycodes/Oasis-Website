import type { Metadata, Viewport } from 'next';
import { Anton, Archivo } from 'next/font/google';
import { site } from '@/content/site';
import { seo } from '@/content/pages';
import { SITE_URL } from '@/lib/seo';
import './globals.css';

/**
 * Archivo, variable, with BOTH the weight and width axes.
 *
 * The width axis is what lets display type be genuinely expanded rather than
 * faux-stretched — see docs/DESIGN-DIRECTION.md §2.2 for why this substitutes for
 * the site's licensed `aether` / `neue-haas-unica-pro` pairing. One family, one
 * download, `display: swap` so text is never invisible while it loads.
 */
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--font-archivo',
});

/**
 * Anton — the display voice. Condensed, heavy, poster-scale.
 *
 * One weight, used only for marquee statements, event posters and After Dark,
 * so it stays a deliberate voice rather than a second body font. `display: swap`
 * means a slow font never blocks the headline from rendering.
 */
const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-anton',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: seo.home!.title,
    template: `%s`,
  },
  description: seo.home!.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  formatDetection: { telephone: true, address: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#FDF3DA',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
