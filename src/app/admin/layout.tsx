import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Oasis Admin',
  // The admin area must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin is a separate route subtree with its own layout and its own components,
 * so none of this code is reachable from — or bundled into — a public page.
 * The shared root layout supplies <html>, <body>, and the font.
 *
 * `data-admin-look` is the one attribute that moves the whole admin into the
 * site's night palette (see admin.css). The appearance branch will make it
 * follow the public site's look; today it is always the evening.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-admin-look="evening" className="min-h-screen bg-ivory text-brown">
      {children}
    </div>
  );
}
