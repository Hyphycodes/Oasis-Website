'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AdminNavItem = { href: string; label: string };

export function AdminNav({ items }: { items: AdminNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="order-3 w-full lg:order-none lg:w-auto">
      <ul className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const active =
            item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[0.875rem] font-semibold transition-colors ${
                  active
                    ? 'bg-amber text-teal'
                    : 'text-linen/80 hover:bg-linen/10 hover:text-linen'
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
