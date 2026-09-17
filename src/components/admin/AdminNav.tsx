'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavIcon, type NavIconName } from './icons';

/**
 * The section switcher.
 *
 * Each destination carries a picture as well as a word. The word is what makes
 * it correct; the picture is what makes it findable on the second visit, when
 * somebody is looking for "the one with the camera" rather than reading eight
 * labels in a row.
 *
 * On a phone the row scrolls sideways, and the active item is scrolled into
 * view on arrival — otherwise the section you are in can sit off the edge of
 * the screen, which is the one thing a navigation must never do.
 */

export type AdminNavItem = { href: string; label: string; icon: NavIconName };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="order-3 -mx-1 w-full lg:order-none lg:mx-0 lg:w-auto">
      <ul className="flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                // The section you are in is scrolled to on arrival.
                ref={
                  active
                    ? (node) => {
                        node?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
                      }
                    : undefined
                }
                className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[0.875rem] font-semibold transition-colors duration-150 ${
                  active
                    ? 'bg-amber text-teal'
                    : 'text-linen/75 hover:bg-linen/12 hover:text-linen'
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
