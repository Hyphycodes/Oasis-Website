import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/server/actions/team';
import type { Staff } from '@/server/auth';
import { canOpen, ROLE_LABEL, type Section } from '@/server/permissions';
import { AdminNav } from './AdminNav';
import { Notice } from './ui';

/**
 * The admin shell.
 *
 * Seven destinations, and an eighth only an Owner sees. That ceiling is the point:
 * a restaurant manager should be able to hold the whole tool in their head, and
 * every extra top-level item makes the five things they came to do harder to
 * find. "Website" is five named screens, not a pages collection.
 */

const NAV: { href: string; label: string; section?: Section; ownerOnly?: boolean }[] = [
  { href: '/admin', label: 'Home' },
  { href: '/admin/menu', label: 'Menu', section: 'menu' },
  { href: '/admin/events', label: 'Events', section: 'events' },
  { href: '/admin/website', label: 'Pages', section: 'website' },
  { href: '/admin/theme', label: 'Seasonal look', section: 'website' },
  { href: '/admin/media', label: 'Photos & videos', section: 'media' },
  { href: '/admin/settings', label: 'Hours & contact', section: 'settings' },
  { href: '/admin/team', label: 'Staff', ownerOnly: true },
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
      <header className="sticky top-0 z-40 border-b border-teal/20 bg-teal shadow-[0_8px_30px_rgba(10,48,43,0.12)]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/admin" className="shrink-0 text-[1.0625rem] font-semibold text-linen">
            Oasis
            <span className="ml-1 font-normal text-linen/60">admin</span>
          </Link>

          <AdminNav items={items.map(({ href, label }) => ({ href, label }))} />

          <div className="ml-auto flex items-center gap-3 text-[0.8125rem]">
            {/* The way back to the website, and the most-used control after a
                change — so it is a button, not a link buried among the others. */}
            <Link
              href="/"
              className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-linen/25 bg-linen/8 px-4 text-[0.875rem] font-semibold text-linen transition-colors hover:bg-linen/15"
            >
              View the website
              <span aria-hidden="true">→</span>
            </Link>

            {staff.source !== 'open' ? (
              <>
                <span className="hidden text-linen/65 xl:inline">
                  {staff.name || staff.email} · {ROLE_LABEL[staff.role]}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="inline-flex min-h-10 items-center text-linen/70 underline underline-offset-4"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 sm:py-9">
        {local ? (
          <p className="mb-5 rounded-full bg-brown/5 px-4 py-2 text-[0.8125rem] text-brown-soft">
            Preview copy — changes here do not affect the live website.
          </p>
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
