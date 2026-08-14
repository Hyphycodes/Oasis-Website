import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, Card, EmptyState, Warning } from '@/components/admin/AdminShell';
import { assets } from '@/content/assets';
import { allMenus } from '@/content/menu';
import { getAllMenus, getAnnouncements } from '@/content/resolve';
import { site } from '@/content/site';
import { getUpcomingEvents } from '@/lib/events';
import { formatEventDate, formatEventTime } from '@/lib/format';
import { getOpenState, groupHours } from '@/lib/hours';
import { getStaff } from '@/lib/supabase/auth';
import { getServiceClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Dashboard.
 *
 * Designed around what a restaurant manager actually needs to know when they open
 * this page: are we open, what is on tonight, is anything about to go wrong, and
 * has anyone messaged us. Warnings are specific and actionable — each one links
 * to the exact thing that needs fixing.
 */
export default async function AdminDashboard() {
  const staff = await getStaff();

  if (!staff) {
    // Configured but no profile row, or signed out entirely.
    redirect('/admin/login');
  }

  const now = new Date();
  const [menus, announcements] = await Promise.all([getAllMenus(), getAnnouncements()]);
  const events = getUpcomingEvents(now, 4);
  const openState = getOpenState(site.hours.value, site.temporaryClosures, now, site.timeZone);
  const todayHours = groupHours(site.hours.value);

  // --- warnings, computed from real content ---------------------------------
  const allItems = menus.flatMap((menu) =>
    menu.categories.flatMap((category) => category.items.map((item) => ({ menu, item }))),
  );
  const missingPrice = allItems.filter(({ item }) => item.priceCents == null);
  const missingDescription = allItems.filter(
    ({ item }) => !item.description && item.priceCents != null,
  );
  const unavailable = allItems.filter(({ item }) => !item.available);
  const emptyMenus = menus.filter((menu) => menu.categories.length === 0);
  const placeholderAssets = Object.entries(assets).filter(
    ([, asset]) => asset.status === 'placeholder',
  );
  const liveAnnouncement = announcements.find((a) => a.enabled);

  // Inquiries only exist when a backend is connected.
  let newInquiries = 0;
  if (isSupabaseConfigured()) {
    const supabase = getServiceClient();
    if (supabase) {
      const { count } = await supabase
        .from('inquiries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new');
      newInquiries = count ?? 0;
    }
  }

  return (
    <AdminShell
      role={staff.role}
      name={staff.name}
      email={staff.user.email ?? ''}
      title={`Good to see you${staff.name ? `, ${staff.name.split(' ')[0]}` : ''}.`}
      description="Everything you can change on the website is in the menu on the left. Changes go live within a few minutes."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Today">
          <p className={`text-[1.25rem] font-semibold ${openState.open ? 'text-success' : 'text-brown'}`}>
            {openState.label}
          </p>
          <dl className="mt-4 space-y-1.5 text-[0.875rem]">
            {todayHours.map((group) => (
              <div key={group.label} className="flex justify-between gap-4">
                <dt className="text-brown-soft">{group.label}</dt>
                <dd className="tabular text-brown">{group.value}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/admin/hours"
            className="mt-4 inline-flex min-h-11 items-center text-[0.875rem] text-clay underline underline-offset-4"
          >
            Change hours
          </Link>
        </Card>

        <Card title="This week">
          {events.length === 0 ? (
            <EmptyState>Nothing on the calendar.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <li key={event.id} className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9375rem] text-brown">{event.series.title}</span>
                  <span className="tabular shrink-0 text-[0.8125rem] text-brown-soft">
                    {formatEventDate(event.startsAt)} · {formatEventTime(event.startsAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/events"
            className="mt-4 inline-flex min-h-11 items-center text-[0.875rem] text-clay underline underline-offset-4"
          >
            Manage events
          </Link>
        </Card>

        <Card title="Enquiries">
          {isSupabaseConfigured() ? (
            <>
              <p className="text-[2rem] font-semibold leading-none text-brown">{newInquiries}</p>
              <p className="mt-2 text-[0.875rem] text-brown-soft">
                {newInquiries === 1 ? 'new message' : 'new messages'} waiting for a reply
              </p>
              <Link
                href="/admin/inquiries"
                className="mt-4 inline-flex min-h-11 items-center text-[0.875rem] text-clay underline underline-offset-4"
              >
                Open enquiries
              </Link>
            </>
          ) : (
            <EmptyState>
              Enquiries are recorded in the server log until the content system is connected.
            </EmptyState>
          )}
        </Card>
      </div>

      <section className="mt-8">
        <h2 className="text-[1.0625rem] font-semibold text-brown">Things worth a look</h2>
        <div className="mt-4 grid gap-3">
          {!liveAnnouncement ? (
            <Warning>
              The announcement bar is switched off. Turn it on to promote a special or an event —{' '}
              <Link href="/admin/announcement" className="underline underline-offset-4">
                announcement bar
              </Link>
              .
            </Warning>
          ) : null}

          {missingPrice.length > 0 ? (
            <Warning>
              {missingPrice.length} menu {missingPrice.length === 1 ? 'item has' : 'items have'} no
              price and currently show “{missingPrice[0]?.item.priceNote}” on the website —{' '}
              <Link href="/admin/menu" className="underline underline-offset-4">
                add prices
              </Link>
              .
            </Warning>
          ) : null}

          {emptyMenus.length > 0 ? (
            <Warning>
              The {emptyMenus.map((m) => m.title).join(' and ')} menu has no dishes on it. The page
              tells guests it is being finalised —{' '}
              <Link href="/admin/menu" className="underline underline-offset-4">
                add dishes
              </Link>
              .
            </Warning>
          ) : null}

          {unavailable.length > 0 ? (
            <Warning tone="warning">
              {unavailable.length}{' '}
              {unavailable.length === 1 ? 'dish is marked' : 'dishes are marked'} unavailable:{' '}
              {unavailable
                .slice(0, 3)
                .map(({ item }) => item.name)
                .join(', ')}
              . Guests still see them, greyed out.
            </Warning>
          ) : null}

          {missingDescription.length > 0 ? (
            <Warning>
              {missingDescription.length} priced{' '}
              {missingDescription.length === 1 ? 'item has' : 'items have'} no description.
            </Warning>
          ) : null}

          {placeholderAssets.length > 0 ? (
            <Warning>
              {placeholderAssets.length} photo slots are still showing the Oasis placeholder. Send
              photos to your developer — the list is in{' '}
              <Link href="/admin/media" className="underline underline-offset-4">
                photos
              </Link>
              .
            </Warning>
          ) : null}

          {!isSupabaseConfigured() ? (
            <Warning tone="warning">
              The content system is not connected, so the website is serving its built-in content
              and nothing you change here will save. A developer needs to finish the setup in
              docs/ENVIRONMENT.md.
            </Warning>
          ) : null}
        </div>
      </section>

      <section className="mt-8">
        <Card title="What is on the website right now">
          <dl className="grid gap-x-8 gap-y-3 text-[0.9375rem] sm:grid-cols-2">
            <div className="flex justify-between gap-4">
              <dt className="text-brown-soft">Dishes and drinks</dt>
              <dd className="tabular text-brown">{allItems.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brown-soft">Menus</dt>
              <dd className="tabular text-brown">{allMenus.length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brown-soft">Event nights coming up</dt>
              <dd className="tabular text-brown">{getUpcomingEvents(now).length}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-brown-soft">Phone number shown</dt>
              <dd className="tabular text-brown">{site.phone.value}</dd>
            </div>
          </dl>
        </Card>
      </section>
    </AdminShell>
  );
}
