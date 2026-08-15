import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/server/actions/team';
import type { Staff } from '@/server/auth';
import { canOpen, ROLE_LABEL, type Section } from '@/server/permissions';
import { Notice } from './ui';

/**
 * The admin shell.
 *
 * Six destinations, and a seventh only an Owner sees. That ceiling is the point:
 * a restaurant manager should be able to hold the whole tool in their head, and
 * every extra top-level item makes the five things they came to do harder to
 * find. "Website" is five named screens, not a pages collection.
 */

const NAV: { href: string; label: string; section?: Section; ownerOnly?: boolean }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/menu', label: 'Menu', section: 'menu' },
  { href: '/admin/events', label: 'Events', section: 'events' },
  { href: '/admin/website', label: 'Website', section: 'website' },
  { href: '/admin/media', label: 'Photos', section: 'media' },
  { href: '/admin/settings', label: 'Settings', section: 'settings' },
  { href: '/admin/team', label: 'Team & permissions', ownerOnly: true },
];

export function AdminShell({
  staff,
  title,
  description,
  actions,
  local,
  children,
}: {
  staff: Staff;
  title: string;
  description?: string;
  actions?: ReactNode;
  /** True when edits are going to the local development file, not a real backend. */
  local: boolean;
  children: ReactNode;
}) {
  const items = NAV.filter((item) => {
    if (item.ownerOnly) return staff.role === 'owner';
    if (!item.section) return true;
    return canOpen({ role: staff.role, sections: staff.sections }, item.section);
  });

  return (
    <div className="min-h-dvh bg-ivory">
      <header className="border-b border-brown/15 bg-linen">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="text-[1.0625rem] font-semibold text-brown">
            Oasis admin
          </Link>

          <nav aria-label="Admin sections" className="order-3 w-full sm:order-none sm:w-auto">
            <ul className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-sm) px-3 text-[0.9375rem] font-medium text-brown-soft transition-colors hover:bg-brown/8 hover:text-brown"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-4 text-[0.8125rem]">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center whitespace-nowrap font-medium text-clay underline underline-offset-4"
            >
              View live site
            </Link>
            <span className="hidden text-brown-soft sm:inline">
              {staff.name || staff.email} · {ROLE_LABEL[staff.role]}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center text-brown-soft underline underline-offset-4"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-9">
        {local ? (
          <div className="mb-6">
            <Notice tone="warning">
              You are on the local development copy. Changes are saved to a file on this machine and
              are not on the real website.
            </Notice>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[length:var(--text-display-md)] font-semibold leading-tight tracking-[-0.02em] text-brown">
              {title}
            </h1>
            {description ? (
              <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-brown-soft">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>

        <div className="mt-7">{children}</div>
      </main>
    </div>
  );
}

/** Contributors see this instead of a section they are not allowed to open. */
export function NoAccess({ what }: { what: string }) {
  return (
    <Notice tone="info">
      Your account does not have access to {what}. If you need it, ask the owner to add it to your
      account.
    </Notice>
  );
}
