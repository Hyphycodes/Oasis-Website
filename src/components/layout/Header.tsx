import Image from 'next/image';
import Link from 'next/link';
import { getAsset } from '@/content/assets';
import { getSiteSettings } from '@/content/resolve';
import { MobileDrawer } from './MobileDrawer';
import { primaryNav } from './nav';

/**
 * Header.
 *
 * Completely flat: every item is a plain link that navigates on click. There is
 * no hover menu, no flyout and no disclosure anywhere in this component, so
 * clicking `Menu` goes to /menu and clicking `Catering` goes to /catering —
 * which is what a visitor expects a top-level nav item to do.
 *
 * Reserve and Order keep different visual weight; on the live Wix site they are
 * identical plain links, so neither reads as the primary action.
 */
export async function Header() {
  const logo = getAsset('brandLogo');
  // Ordering and booking links come from settings, so changing one in the admin
  // changes every button on the site at once.
  const site = await getSiteSettings();

  return (
    <header className="sticky top-0 z-40 border-b border-brown/12 bg-ivory/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-(--o-header-h) max-w-[1600px] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center"
          aria-label={`${site.name} — home`}
        >
          {/* Fixed-size, so width/height are the RENDERED size at 2x — not the
              intrinsic 1200px. Passing `sizes` here would make the browser pull
              the 3840px variant for a 70px slot. */}
          <Image
            src={logo.path!}
            alt={site.name}
            width={280}
            height={Math.round((280 * logo.height) / logo.width)}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-8">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-(--o-header-h) items-center text-[0.9375rem] font-medium tracking-[0.01em] text-brown transition-colors hover:text-coral"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={site.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center rounded-(--radius-md) px-3 text-[0.9375rem] font-medium text-brown transition-colors hover:text-coral sm:inline-flex"
          >
            Order online
            <span className="sr-only">(opens Toast in a new tab)</span>
          </a>
          <a
            href={site.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center rounded-(--radius-md) bg-coral px-5 text-[0.9375rem] font-semibold tracking-[0.02em] text-on-orange transition-colors hover:bg-coral-deep sm:inline-flex"
          >
            Reserve
            <span className="sr-only">(opens Toast in a new tab)</span>
          </a>
          <MobileDrawer reservationUrl={site.reservationUrl} orderUrl={site.orderUrl} />
        </div>
      </div>
    </header>
  );
}
