import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Oasis Admin',
  // The admin area must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin is a separate route subtree with its own layout and its own components,
 * so none of this code is reachable from — or bundled into — a public page.
 * The shared root layout supplies <html>, <body>, and the font.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
