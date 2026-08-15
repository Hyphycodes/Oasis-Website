import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { Card, EmptyState, Notice, StateChip } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import { getStaff, staffCan } from '@/server/auth';
import { getEditableMenus } from '@/server/content/menu';
import { canOpen } from '@/server/permissions';
import { AddItem } from './AddItem';
import { MenuRow } from './MenuRow';

export const dynamic = 'force-dynamic';

const TAB_LABEL: Record<string, string> = {
  food: 'Food',
  cocktails: 'Cocktails & Bar',
  brunch: 'Brunch',
};

/**
 * The menu manager.
 *
 * A dense, calm list rather than a grid of cards: this is a working document,
 * and someone scanning for "Queso Dip" is reading names down a column. Sections
 * are disclosures, so the page opens showing structure and you expand the one
 * you need — including with a keyboard, because `<details>` already does that
 * properly and a custom accordion would have to re-earn it.
 */
export default async function AdminMenuPage({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string; q?: string }>;
}) {
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

  const db = getReadDb();
  const menus = db ? await getEditableMenus(db) : [];
  const params = await searchParams;
  const active = menus.find((menu) => menu.slug === params.menu) ?? menus[0];
  const query = (params.q ?? '').trim().toLowerCase();
  const canPublish = staffCan(staff, 'content.publish');

  const waiting = menus
    .flatMap((menu) => menu.categories.flatMap((category) => category.items))
    .filter((item) => item.state === 'changed');

  return (
    <AdminShell
      staff={staff}
      local={local}
      title="Menu"
      description="Change a price, mark something sold out, or edit a dish. Prices and availability save straight away."
      actions={
        active ? (
          <Link
            href={active.slug === 'food' ? '/menu' : `/menu#${active.slug}`}
            target="_blank"
            className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
          >
            Preview {TAB_LABEL[active.slug]}
          </Link>
        ) : null
      }
    >
      {menus.length === 0 ? (
        <EmptyState>
          The menu editor is not available right now. Please try again in a moment.
        </EmptyState>
      ) : (
        <>
          {waiting.length > 0 && canPublish ? (
            <div className="mb-5">
              <Notice tone="warning">
                {waiting.length} {waiting.length === 1 ? 'change is' : 'changes are'} saved but not
                published: {waiting.slice(0, 3).map((item) => item.name).join(', ')}
                {waiting.length > 3 ? '…' : ''}
              </Notice>
            </div>
          ) : null}

          {/* Three menus, three tabs. Same control as the public page, so the
              mental model carries over. */}
          <nav aria-label="Which menu" className="mb-6">
            <ul className="grid max-w-lg grid-cols-3 gap-1 rounded-(--radius-md) border border-brown/20 p-1">
              {menus.map((menu) => {
                const selected = menu.slug === active?.slug;
                return (
                  <li key={menu.slug}>
                    <Link
                      href={`/admin/menu?menu=${menu.slug}`}
                      aria-current={selected ? 'page' : undefined}
                      className={`flex min-h-10 items-center justify-center rounded-(--radius-sm) px-2 text-center text-[0.8125rem] font-semibold leading-tight sm:text-[0.9375rem] ${
                        selected ? 'bg-coral text-on-orange' : 'text-brown-soft hover:bg-brown/8'
                      }`}
                    >
                      {TAB_LABEL[menu.slug] ?? menu.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <form className="mb-6 flex max-w-md items-center gap-2" role="search">
            <input type="hidden" name="menu" value={active?.slug ?? 'food'} />
            <label className="sr-only" htmlFor="menu-search">
              Search this menu
            </label>
            <input
              id="menu-search"
              name="q"
              type="search"
              defaultValue={params.q ?? ''}
              placeholder="Search for a dish"
              className="min-h-11 w-full rounded-(--radius-sm) border border-brown/25 bg-linen px-3 text-[0.9375rem] text-brown"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
            >
              Search
            </button>
          </form>

          {active ? (
            <div className="grid gap-4">
              {active.categories.length === 0 ? (
                <EmptyState>
                  {active.emptyState ??
                    'Nothing on this menu yet. Guests see a short note instead of an empty page.'}
                </EmptyState>
              ) : null}

              {active.categories.map((category) => {
                const items = query
                  ? category.items.filter((item) => item.name.toLowerCase().includes(query))
                  : category.items;
                if (query && items.length === 0) return null;
                const siblings = category.items.map((item) => item.id);

                return (
                  <details
                    key={category.id}
                    open={Boolean(query) || active.categories.length <= 4}
                    className="rounded-(--radius-md) border border-brown/15 bg-linen"
                  >
                    <summary className="flex min-h-14 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-[1.0625rem] font-semibold text-brown">
                      {category.name}
                      <span className="text-[0.8125rem] font-normal text-brown-soft">
                        {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                      </span>
                      {category.state !== 'published' ? <StateChip state={category.state} /> : null}
                      <Link
                        href={`/menu#${category.id}`}
                        target="_blank"
                        className="ml-auto text-[0.8125rem] font-normal text-clay underline underline-offset-4"
                      >
                        View on the website
                      </Link>
                    </summary>

                    <div className="border-t border-brown/12 px-4 pb-4">
                      <ul>
                        {items.map((item) => (
                          <MenuRow
                            key={item.id}
                            item={item}
                            siblings={siblings}
                            canPublish={canPublish}
                          />
                        ))}
                      </ul>
                      {canPublish ? <AddItem categoryId={category.id} /> : null}
                    </div>
                  </details>
                );
              })}
            </div>
          ) : null}

          {!canPublish ? (
            <div className="mt-6">
              <Card tone="quiet">
                <p className="text-[0.9375rem] leading-relaxed text-brown-soft">
                  Your account saves changes as drafts. A manager publishes them — your work is kept
                  either way.
                </p>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}
