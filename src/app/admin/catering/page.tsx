import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, Card } from '@/components/admin/AdminShell';
import { getCateringItems, getCateringPackages } from '@/content/resolve';
import { site } from '@/content/site';
import { formatPrice, formatPriceRange } from '@/lib/format';
import { getStaff } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';

export default async function AdminCateringPage() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const [packages, items] = await Promise.all([getCateringPackages(), getCateringItems()]);

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title="Catering"
      description="What the website shows on the catering page. These prices came from your Toast catering menu — if you change them on Toast, tell your developer so the website matches."
    >
      <div className="grid gap-6">
        <Card title="Party packages">
          <ul className="divide-y divide-brown/12">
            {packages.map((pkg) => (
              <li key={pkg.id} className="flex flex-wrap items-baseline justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9375rem] font-medium text-brown">{pkg.name}</p>
                  <p className="mt-0.5 text-[0.8125rem] text-brown-soft">
                    Serves {formatPriceRange(pkg.servesMin, pkg.servesMax)} ·{' '}
                    {pkg.includes.length} items included
                  </p>
                </div>
                <p className="tabular shrink-0 font-semibold text-brown">
                  {formatPrice(pkg.priceCents)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="By the tray">
          <ul className="divide-y divide-brown/12">
            {items.map((item) => (
              <li key={item.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <p className="text-[0.9375rem] text-brown">{item.name}</p>
                <p className="tabular shrink-0 font-semibold text-brown">
                  {formatPrice(item.priceCents)}
                </p>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Where orders go">
          <p className="text-[0.9375rem] leading-relaxed text-brown-soft">
            The “Order catering on Toast” button sends guests to your Toast page. The enquiry form
            on the catering page sends messages to{' '}
            <Link href="/admin/inquiries" className="text-clay underline underline-offset-4">
              Enquiries
            </Link>
            .
          </p>
          <p className="mt-3 break-all text-[0.8125rem] text-brown-soft">{site.cateringOrderUrl}</p>
        </Card>
      </div>
    </AdminShell>
  );
}
