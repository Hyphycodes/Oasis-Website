import Image from 'next/image';
import Link from 'next/link';
import { getAsset } from '@/content/assets';
import { site } from '@/content/site';
import { MobileDrawer } from './MobileDrawer';
import { primaryNav } from './nav';

/**
 * Header.
 *
 * Two deliberate departures from the current site:
 *  1. Reserve and Order are given DIFFERENT visual weight. On the live site they
 *     are identical plain nav links, so neither reads as the primary action.
 *  2. The Wix cart badge and "Log In" control are gone. Nothing was ever sold
 *     through Wix Stores; both controls only ever created confusion.
 */
export function Header() {
  const logo = getAsset('brandLogo');

  return (
    <header className="sticky top-0 z-40 border-b border-brown/12 bg-cream/95 backdrop-blur-[2px]">
      <div className="mx-auto flex h-(--o-header-h) max-w-[1440px] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center"
          aria-label={`${site.name} — home`}
        >
          {/* Fixed-size, so width/height are the RENDERED size at 2x — not the
              intrinsic 1200px. Passing `sizes` here would make the browser pull
              the 3840px variant for a 70px slot, which is the exact defect the
              current Wix site has. */}
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
          <ul className="flex items-center gap-7">
            {primaryNav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className="inline-flex h-(--o-header-h) items-center text-[0.9375rem] font-medium tracking-[0.01em] text-brown transition-colors hover:text-clay"
                >
                  {item.label}
                </Link>

                {item.children ? (
                  <div className="invisible absolute left-0 top-full z-10 min-w-48 border border-brown/12 bg-linen py-2 opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                    <ul>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="flex min-h-11 items-center px-4 text-[0.9375rem] text-brown-soft transition-colors hover:bg-cream-deep hover:text-brown"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <a
            href={site.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center rounded-(--radius-md) px-3 text-[0.9375rem] font-medium text-brown transition-colors hover:text-clay sm:inline-flex"
          >
            Order online
            <span className="sr-only">(opens Toast in a new tab)</span>
          </a>
          <a
            href={site.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 items-center rounded-(--radius-md) bg-orange px-5 text-[0.9375rem] font-semibold tracking-[0.02em] text-on-orange transition-colors hover:bg-orange-deep sm:inline-flex"
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
