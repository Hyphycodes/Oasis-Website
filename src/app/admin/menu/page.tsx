import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, Card, EmptyState, Warning } from '@/components/admin/AdminShell';
import { getAllMenus } from '@/content/resolve';
import { getStaff } from '@/lib/supabase/auth';
import { MenuItemRow } from './MenuItemRow';

export const dynamic = 'force-dynamic';

export default async function AdminMenuPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const menus = await getAllMenus();
  const unpriced = menus.flatMap((menu) =>
    menu.categories.flatMap((c) => c.items.filter((i) => i.priceCents == null)),
  );

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Menus"
      description="Change a name, a price, a description, or mark something as sold out. Adding or removing whole dishes and sections needs a developer — that keeps the menu layout from breaking."
    >
      {unpriced.length > 0 ? (
        <div className="mb-6">
          <Warning>
            {unpriced.length} {unpriced.length === 1 ? 'item shows' : 'items show'} no price on the
            website. They currently read “{unpriced[0]?.priceNote}”. Adding a real price is the
            single biggest improvement you can make here.
          </Warning>
        </div>
      ) : null}

      <div className="grid gap-6">
        {menus.map((menu) => (
          <Card key={menu.slug} title={`${menu.title} menu`}>
            <p className="mb-4 text-[0.875rem] text-brown-soft">
              <Link
                href={menu.slug === 'food' ? '/menu' : `/menu/${menu.slug}`}
                className="text-clay underline underline-offset-4"
              >
                Preview this menu on the website
              </Link>
            </p>

            {menu.categories.length === 0 ? (
              <EmptyState>
                {menu.emptyState
                  ? `No dishes yet. The website tells guests: “${menu.emptyState.slice(0, 90)}…”`
                  : 'No dishes yet.'}
              </EmptyState>
            ) : (
              menu.categories.map((category) => (
                <section key={category.id} className="mt-6 first:mt-0">
                  <h3 className="border-b-2 border-brown/25 pb-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brown-soft">
                    {category.name}
                    <span className="tabular ml-2 font-normal normal-case tracking-normal">
                      {category.items.length} items
                    </span>
                  </h3>
                  <ul>
                    {category.items.map((item) => (
                      <MenuItemRow key={item.id} item={item} />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
