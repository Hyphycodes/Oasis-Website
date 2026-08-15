import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { getReadDb, isLocalDb } from '@/lib/db';
import { getStaff, staffCan } from '@/server/auth';
import { listVersions } from '@/server/content/editorial';
import { getEditableMenus } from '@/server/content/menu';
import { canOpen } from '@/server/permissions';
import { ItemEditor } from './ItemEditor';

export const dynamic = 'force-dynamic';

export default async function MenuItemPage({ params }: { params: Promise<{ item: string }> }) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'menu')) {
    return (
      <AdminShell staff={staff} local={local} title="Menu">
        <NoAccess what="the menu" />
      </AdminShell>
    );
  }

  const { item: itemId } = await params;
  const db = getReadDb();
  if (!db) notFound();

  const menus = await getEditableMenus(db);
  const found = menus
    .flatMap((menu) => menu.categories.flatMap((category) => category.items.map((i) => ({ menu, category, item: i }))))
    .find((entry) => entry.item.id === itemId);

  if (!found) notFound();

  const versions = await listVersions(db, 'menu_items', itemId);

  return (
    <AdminShell
      staff={staff}
      local={local}
      title={found.item.name}
      description={`${found.menu.title} · ${found.category.name}`}
      actions={
        <>
          <Link
            href={`/admin/menu?menu=${found.menu.slug}`}
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
          >
            Back to the menu
          </Link>
          <Link
            href={`/menu#${found.category.id}`}
            target="_blank"
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
          >
            View on the website
          </Link>
        </>
      }
    >
      <ItemEditor
        item={found.item}
        categories={found.menu.categories}
        versions={versions}
        canPublish={staffCan(staff, 'content.publish')}
        archived={found.item.state === 'archived'}
      />
    </AdminShell>
  );
}
