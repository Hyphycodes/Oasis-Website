import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { EmptyState, StateChip } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getStaff } from '@/server/auth';
import { stateOf, type EditorialRow } from '@/server/content/editorial';
import { getEditableSections } from '@/server/content/pages';
import { canOpen } from '@/server/permissions';
import { PAGES } from './pages';

export const dynamic = 'force-dynamic';

/**
 * The Website section.
 *
 * Five named screens, not a Pages collection and not a block builder. Each one
 * mirrors the real sections that page already has, so choosing "Homepage" then
 * "After Dark" lands you on the words that appear in that band and nothing else.
 */
export default async function WebsitePage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'website')) {
    return (
      <AdminShell staff={staff} local={local} title="Website">
        <NoAccess what="the website pages" />
      </AdminShell>
    );
  }

  const db = getReadDb();
  const sections = db ? await getEditableSections(db) : [];
  const rows = db ? await db.list<Row>('page_sections') : [];
  const waitingByPage = new Map<string, number>();
  for (const row of rows) {
    if (stateOf(row as EditorialRow) !== 'changed') continue;
    const page = String(row.page);
    waitingByPage.set(page, (waitingByPage.get(page) ?? 0) + 1);
  }

  return (
    <AdminShell
      staff={staff}
      local={local}
      title="Website"
      description="The words and photographs on each page. Addresses, hours and phone numbers live in Settings, so they are only ever typed once."
    >
      {!db ? (
        <EmptyState>
          The content system is not connected, so pages are read from the built-in content.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {PAGES.map((page) => {
            const owned = sections.filter((section) => section.page === page.slug);
            const waiting = waitingByPage.get(page.slug) ?? 0;
            return (
              <li key={page.slug}>
                <Link
                  href={`/admin/website/${page.slug}`}
                  className="group flex h-full flex-col rounded-(--radius-md) border border-brown/20 bg-linen p-4 transition-colors hover:border-coral hover:bg-coral/5"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-[1.0625rem] font-semibold text-brown group-hover:text-clay">
                      {page.label}
                    </span>
                    {waiting > 0 ? <StateChip state="changed" /> : null}
                  </span>
                  <span className="mt-1 text-[0.875rem] text-brown-soft">{page.hint}</span>
                  <span className="mt-3 text-[0.8125rem] text-brown-soft">
                    {owned.length} {owned.length === 1 ? 'section' : 'sections'} · {page.route}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </AdminShell>
  );
}
