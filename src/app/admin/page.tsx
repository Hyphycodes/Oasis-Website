import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ArtworkSourceNote, ArtworkThumb, artworkSourceOf } from '@/components/admin/Artwork';
import { Card, EmptyState, Notice, StateChip, TaskLink } from '@/components/admin/ui';
import { getMediaMap } from '@/content/media';
import { getSiteSettings } from '@/content/resolve';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getUpcomingEvents, ineligibleReason, venueIsoDate } from '@/lib/events';
import { formatEventDate, formatEventTime } from '@/lib/format';
import { getOpenState } from '@/lib/hours';
import { getStaff } from '@/server/auth';
import { getAttention, getRecentChanges, TABLE_LABEL } from '@/server/content/attention';
import { getEditableEvents } from '@/server/content/events';

export const dynamic = 'force-dynamic';

/**
 * Dashboard.
 *
 * It opens with what you came to do, not with numbers. Then the things that are
 * actually wrong, each linked to the field that fixes it. Then tonight. There are
 * no charts: a restaurant manager opening this on a Friday afternoon needs to
 * know whether anything is broken and what is on, and nothing else.
 */
export default async function AdminDashboard() {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const now = new Date();
  const db = getReadDb();
  const settings = await getSiteSettings();

  const [attention, recent, events, inquiries] = db
    ? await Promise.all([
        getAttention(db, now),
        getRecentChanges(db),
        getEditableEvents(db),
        db.list<Row>('inquiries', { where: { status: 'new' } }),
      ])
    : [[], [], { series: [], occurrences: [] }, []];

  const waiting = inquiries.length;

  const upcoming = getUpcomingEvents(events, now, 5);
  // One lookup for the whole list — the thumbnails are what let staff tell a
  // Friday from a Saturday at a glance.
  const media = await getMediaMap();
  const openState = getOpenState(
    settings.hours.value,
    settings.temporaryClosures,
    now,
    settings.timeZone,
  );

  const blocking = attention.filter((entry) => entry.severity === 'blocking');
  const rest = attention.filter((entry) => entry.severity !== 'blocking');

  return (
    <AdminShell
      staff={staff}
      local={isLocalDb()}
      title="What would you like to change?"
      description={
        openState.open
          ? `You are open now — ${openState.label.toLowerCase()}.`
          : openState.label
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TaskLink
          href="/admin/events?new=1"
          number="1"
          title="Add an event"
          hint="Add the date, photo and details in one place"
        />
        <TaskLink
          href="/admin/menu"
          number="2"
          title="Update the menu"
          hint="Change a price, description or sold-out item"
        />
        <TaskLink
          href="/admin/media?upload=1"
          number="3"
          title="Add a photo or video"
          hint="Choose a file and the site handles the rest"
        />
        <TaskLink
          href="/admin/settings"
          number="4"
          title="Hours & contact"
          hint="Update opening times, holidays and contact details"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.875rem]">
        <Link href="/admin/website" className="font-semibold text-clay underline underline-offset-4">
          Change page words or pictures
        </Link>
        <Link href="/admin/theme" className="font-semibold text-clay underline underline-offset-4">
          Dress the website for the season
        </Link>
        <Link href="/admin/inquiries" className="font-semibold text-clay underline underline-offset-4">
          {waiting > 0
            ? `Read ${waiting} new ${waiting === 1 ? 'enquiry' : 'enquiries'}`
            : 'Read enquiries'}
        </Link>
      </div>

      {attention.length > 0 ? (
        <section className="mt-9">
          <h2 className="text-[1.0625rem] font-semibold text-brown">Needs attention</h2>
          <div className="mt-4 grid gap-2.5">
            {[...blocking, ...rest].map((entry) => (
              <Notice
                key={entry.id}
                tone={
                  entry.severity === 'blocking'
                    ? 'danger'
                    : entry.severity === 'warning'
                      ? 'warning'
                      : 'info'
                }
                action={
                  <Link
                    href={entry.href}
                    className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap text-[0.875rem] font-semibold underline underline-offset-4"
                  >
                    {entry.actionLabel}
                  </Link>
                }
              >
                {entry.message}
              </Notice>
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-9 text-[0.9375rem] text-brown-soft">
          Nothing needs attention right now.
        </p>
      )}

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <Card
          title="Coming up"
          action={
            <Link href="/admin/events" className="text-[0.875rem] text-clay underline underline-offset-4">
              All events
            </Link>
          }
        >
          {upcoming.length === 0 ? (
            <EmptyState>Nothing on the calendar.</EmptyState>
          ) : (
            <ul className="divide-y divide-brown/12">
              {upcoming.map((event) => {
                const problem = ineligibleReason(event, now);
                return (
                  <li key={event.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <ArtworkThumb
                      asset={event.flyerAssetId ? (media[event.flyerAssetId] ?? null) : null}
                    />
                    <span className="tabular w-24 shrink-0 text-[0.875rem] font-semibold text-brown">
                      {formatEventDate(event.startsAt)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.9375rem] text-brown">
                        {event.title}
                      </span>
                      <ArtworkSourceNote source={artworkSourceOf(event)} />
                    </span>
                    <span className="tabular text-[0.8125rem] text-brown-soft">
                      {formatEventTime(event.startsAt)}
                    </span>
                    {problem ? (
                      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-warning">
                        {problem}
                      </span>
                    ) : !event.ticketUrl ? (
                      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-danger">
                        No tickets
                      </span>
                    ) : (
                      <StateChip state="published" />
                    )}
                    <Link
                      href={`/admin/events/${event.seriesSlug ?? ''}`}
                      className="text-[0.8125rem] text-clay underline underline-offset-4"
                    >
                      Edit
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recently changed">
          {recent.length === 0 ? (
            <EmptyState>No changes yet. Everything is as it was set up.</EmptyState>
          ) : (
            <ul className="divide-y divide-brown/12">
              {recent.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-3">
                  <span className="text-[0.9375rem] text-brown">
                    {TABLE_LABEL[entry.table] ?? entry.table} · {entry.rowId}
                  </span>
                  <span className="text-[0.8125rem] text-brown-soft">
                    {entry.actorName}, {venueIsoDate(entry.at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
