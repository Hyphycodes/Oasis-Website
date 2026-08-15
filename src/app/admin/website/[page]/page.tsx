import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { EmptyState, Notice } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getStaff, staffCan } from '@/server/auth';
import { listVersions, stateOf, type EditorialRow } from '@/server/content/editorial';
import { getEditableSections } from '@/server/content/pages';
import { canOpen } from '@/server/permissions';
import { PAGES } from '../pages';
import { ListEditor, SectionEditor } from './SectionEditor';

export const dynamic = 'force-dynamic';

/** Which slots on which page carry a photograph the design can actually place. */
const MEDIA_SLOTS = new Set(['home:hero']);

export default async function WebsitePageEditor({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
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

  const { page } = await params;
  const meta = PAGES.find((entry) => entry.slug === page);
  if (!meta) notFound();

  const db = getReadDb();
  if (!db) notFound();

  const sections = await getEditableSections(db, page);
  const rows = await db.list<Row>('page_sections');
  const stateById = new Map(rows.map((row) => [String(row.id), stateOf(row as EditorialRow)]));

  const lists = (await db.list<Row>('page_lists')).filter((row) => row.page === page);
  const media = await db.list<Row>('media_assets', { orderBy: 'asset_id' });
  const mediaOptions = media
    .filter((row) => row.path && !row.archived_at)
    .map((row) => ({ id: String(row.asset_id), label: String(row.title ?? row.asset_id) }));

  const canPublish = staffCan(staff, 'content.publish');
  const versionsById = new Map(
    await Promise.all(
      sections.map(
        async (section) => [section.id, await listVersions(db, 'page_sections', section.id)] as const,
      ),
    ),
  );

  return (
    <AdminShell
      staff={staff}
      local={local}
      title={meta.label}
      description="Each panel below is a real section of this page, in the order it appears."
      actions={
        <>
          <Link
            href="/admin/website"
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
          >
            All pages
          </Link>
          <Link
            href={meta.route}
            target="_blank"
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
          >
            Preview the page
          </Link>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="grid gap-4">
          {sections.length === 0 && lists.length === 0 ? (
            <EmptyState>There is nothing editable on this page yet.</EmptyState>
          ) : null}

          {sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              state={stateById.get(section.id) ?? 'published'}
              canPublish={canPublish}
              mediaOptions={mediaOptions}
              allowsMedia={MEDIA_SLOTS.has(section.id)}
              versions={versionsById.get(section.id) ?? []}
            />
          ))}

          {lists.map((row) => (
            <ListEditor
              key={String(row.id)}
              id={String(row.id)}
              label={String(row.label)}
              items={((row.draft as Row)?.items as string[]) ?? ((row.items as string[]) ?? [])}
              canPublish={canPublish}
              state={stateOf(row as EditorialRow)}
            />
          ))}
        </div>

        <aside className="grid gap-4">
          <Notice tone="info">
            Business details — address, phone, hours, ordering and booking links — are in Settings.
            They are typed once and appear everywhere.
          </Notice>
          {page === 'home' ? (
            <Notice tone="info">
              The dishes and the event dates on the homepage are pulled from the Menu and Events
              sections. Change them there and the homepage follows.
            </Notice>
          ) : null}
          {!canPublish ? (
            <Notice tone="info">
              Your account saves changes as drafts. A manager publishes them.
            </Notice>
          ) : null}
        </aside>
      </div>
    </AdminShell>
  );
}
