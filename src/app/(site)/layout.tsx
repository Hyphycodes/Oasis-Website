import { activeAnnouncement, AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getAnnouncements } from '@/content/resolve';
import { JsonLd, restaurantJsonLd } from '@/lib/seo';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const announcements = await getAnnouncements();
  const announcement = activeAnnouncement(announcements, new Date());

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-(--radius-md) focus:bg-orange focus:px-4 focus:py-2.5 focus:font-semibold focus:text-on-orange"
      >
        Skip to main content
      </a>
      <AnnouncementBar announcement={announcement} />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <JsonLd data={restaurantJsonLd()} />
    </>
  );
}
