import Link from 'next/link';
import type { ReactNode } from 'react';
import { signOut } from '@/app/admin/actions';
import type { Role } from '@/lib/supabase/auth';

const NAV: { href: string; label: string; adminOnly?: boolean }[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/announcement', label: 'Announcement bar' },
  { href: '/admin/hours', label: 'Hours & closures' },
  { href: '/admin/menu', label: 'Menus' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/catering', label: 'Catering' },
  { href: '/admin/inquiries', label: 'Enquiries' },
  { href: '/admin/media', label: 'Photos' },
  { href: '/admin/settings', label: 'Settings', adminOnly: true },
];

const ROLE_LABEL: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Manager',
  editor: 'Staff',
};

export function AdminShell({
  children,
  role,
  name,
  email,
  title,
  description,
}: {
  children: ReactNode;
  role: Role;
  name: string;
  email: string;
  title: string;
  description?: string;
}) {
  const isAdmin = role === 'owner' || role === 'admin';

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-8 lg:flex-row lg:gap-12 lg:px-8">
      <aside className="lg:w-56 lg:shrink-0">
        <Link href="/admin" className="block text-[1.125rem] font-semibold text-brown">
          Oasis admin
        </Link>
        <p className="mt-1 text-[0.8125rem] text-brown-soft">
          {name || email} · {ROLE_LABEL[role]}
        </p>

        <nav aria-label="Admin sections" className="mt-6">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {NAV.filter((item) => !item.adminOnly || isAdmin).map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 w-full items-center rounded-(--radius-md) px-3 text-[0.9375rem] font-medium text-brown-soft transition-colors hover:bg-brown/8 hover:text-brown"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 border-t border-brown/15 pt-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-[0.875rem] text-brown-soft underline underline-offset-4"
          >
            View the website
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center text-[0.875rem] text-brown-soft underline underline-offset-4"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <h1 className="text-[length:var(--text-display-md)] font-semibold leading-none tracking-[-0.025em] text-brown [font-variation-settings:'wdth'_104]">
          {title}
        </h1>
        {description ? (
          <p className="measure mt-3 text-[0.9375rem] leading-relaxed text-brown-soft">
            {description}
          </p>
        ) : null}
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="rounded-(--radius-md) border border-brown/15 bg-linen p-5">
      {title ? <h2 className="text-[1.0625rem] font-semibold text-brown">{title}</h2> : null}
      <div className={title ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-(--radius-md) border border-dashed border-brown/25 px-5 py-8 text-center text-[0.9375rem] text-brown-soft">
      {children}
    </p>
  );
}

export function Warning({
  tone = 'warning',
  children,
}: {
  tone?: 'warning' | 'danger' | 'success';
  children: ReactNode;
}) {
  const border = {
    warning: 'border-warning',
    danger: 'border-danger',
    success: 'border-success',
  }[tone];
  const text = { warning: 'text-warning', danger: 'text-danger', success: 'text-success' }[tone];

  return (
    <p className={`rounded-(--radius-md) border-2 ${border} bg-linen px-4 py-3 text-[0.9375rem] ${text}`}>
      {children}
    </p>
  );
}
