import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/server/actions/team';
import type { Staff } from '@/server/auth';
import { canOpen, ROLE_LABEL, type Section } from '@/server/permissions';
import { AdminNav } from './AdminNav';
import type { NavIconName } from './icons';
import { SaveStatusProvider } from './SaveStatus';
import { Notice } from './ui';

/**
 * The admin shell.
 *
 * Seven destinations, and an eighth only an Owner sees. That ceiling is the point:
 * a restaurant manager should be able to hold the whole tool in their head, and
 * every extra top-level item makes the five things they came to do harder to
 * find. "Website" is five named screens, not a pages collection.
 *
 * Everything a screen shares sits here rather than being repeated on each page:
 * the way back up a level, the link out to the real website, and the single
 * indicator that says a save worked.
 */

const NAV: {
  href: string;
  label: string;
  icon: NavIconName;
  section?: Section;
  ownerOnly?: boolean;
}[] = [
  { href: '/admin', label: 'Home', icon: 'home' },
  { href: '/admin/menu', label: 'Menu', icon: 'menu', section: 'menu' },
  { href: '/admin/events', label: 'Events', icon: 'events', section: 'events' },
  { href: '/admin/website', label: 'Pages', icon: 'pages', section: 'website' },
  { href: '/admin/theme', label: 'Seasonal look', icon: 'season', section: 'website' },
  { href: '/admin/media', label: 'Photos & videos', icon: 'photos', section: 'media' },
  { href: '/admin/settings', label: 'Hours & contact', icon: 'hours', section: 'settings' },
  { href: '/admin/team', label: 'Staff', icon: 'staff', ownerOnly: true },
];

export function AdminShell({
  staff,
  title,
  description,
  actions,
  /** The screen this one opened from, shown as a way back at the top. */
  backTo,
  local,
  children,
}: {
  staff: Staff;
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: { href: string; label: string };
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
    <SaveStatusProvider>
      <div className="min-h-dvh bg-ivory">
        <header className="sticky top-0 z-40 border-b border-teal/20 bg-teal shadow-[0_8px_30px_rgba(10,48,43,0.12)]">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <Link
              href="/admin"
              className="shrink-0 text-[1.0625rem] font-semibold text-linen transition-opacity hover:opacity-80"
            >
              Oasis
              <span className="ml-1 font-normal text-linen/60">admin</span>
            </Link>

            <AdminNav items={items.map(({ href, label, icon }) => ({ href, label, icon }))} />

            <div className="ml-auto flex items-center gap-2 text-[0.8125rem] sm:gap-3">
              {/* The way back to the website, and the most-used control after a
                  change — so it is a button, not a link buried among the others. */}
              <Link
                href="/"
                target="_blank"
                className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-linen/25 bg-linen/8 px-3.5 text-[0.875rem] font-semibold text-linen transition-colors hover:bg-linen/18 sm:px-4"
              >
                <span className="hidden sm:inline">View the website</span>
                <span className="sm:hidden">Website</span>
                <span aria-hidden="true">↗</span>
              </Link>

              {staff.source !== 'open' ? (
                <>
                  {/* Initials on a phone, the full name once there is room. Who
                      you are signed in as matters when a bar and a kitchen share
                      one tablet. */}
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linen/12 text-[0.75rem] font-semibold uppercase text-linen lg:hidden"
                    title={`${staff.name || staff.email} · ${ROLE_LABEL[staff.role]}`}
                  >
                    {initialsOf(staff.name || staff.email)}
                  </span>
                  <span className="hidden min-w-0 text-linen/65 lg:block">
                    <span className="block truncate">{staff.name || staff.email}</span>
                    <span className="block text-[0.75rem] text-linen/45">
                      {ROLE_LABEL[staff.role]}
                    </span>
                  </span>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="inline-flex min-h-10 items-center rounded-full px-2 text-linen/70 underline underline-offset-4 transition-colors hover:text-linen"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="admin-settle mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
          {backTo || local ? (
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {backTo ? (
                <Link
                  href={backTo.href}
                  className="inline-flex min-h-10 items-center gap-1.5 text-[0.875rem] font-semibold text-clay transition-colors hover:text-coral-deep"
                >
                  <span aria-hidden="true">←</span>
                  {backTo.label}
                </Link>
              ) : null}

              {local ? (
                <p className="rounded-full bg-brown/6 px-3 py-1.5 text-[0.8125rem] text-brown-soft">
                  Preview copy — changes here do not affect the live website.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="text-[length:var(--text-display-md)] font-semibold leading-tight tracking-[-0.02em] text-brown">
                {title}
              </h1>
              {description ? (
                <p className="measure mt-1.5 text-[0.9375rem] leading-relaxed text-brown-soft">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>

          <div className="mt-6">{children}</div>
        </main>
      </div>
    </SaveStatusProvider>
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

function initialsOf(who: string): string {
  const parts = who.split(/[\s@._-]+/).filter(Boolean);
  const first = parts[0]?.[0];
  if (!first) return '?';
  return (first + (parts[1]?.[0] ?? '')).toUpperCase();
}
