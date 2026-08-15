import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { Card, EmptyState, Notice, StateChip, TaskLink } from '@/components/admin/ui';
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
      title="What do you want to update?"
      description={
        openState.open
          ? `You are open now — ${openState.label.toLowerCase()}.`
          : openState.label
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <TaskLink href="/admin/menu" title="Change a price" hint="Menu · edit it in the list" />
        <TaskLink
          href="/admin/menu"
          title="Mark something sold out"
          hint="Menu · one tap, guests see it straight away"
        />
        <TaskLink href="/admin/events" title="Add or edit an event" hint="Events · dates and tickets" />
        <TaskLink href="/admin/settings" title="Update hours" hint="Settings · including a holiday" />
        <TaskLink href="/admin/media" title="Replace a photo" hint="Photos · upload and swap" />
        <TaskLink href="/admin/website" title="Change a headline" hint="Website · and preview it" />
        {/* Enquiries are not in the top navigation — six destinations is the
            ceiling — so this is how you reach them. */}
        <TaskLink
          href="/admin/inquiries"
          title={
            waiting > 0
              ? `Read ${waiting} new ${waiting === 1 ? 'enquiry' : 'enquiries'}`
              : 'Read enquiries'
          }
          hint="Catering, celebrations and job applications"
        />
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
        <div className="mt-9">
          <Notice tone="success">Everything looks in order. Nothing needs your attention.</Notice>
        </div>
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
                    <span className="tabular w-28 shrink-0 text-[0.875rem] font-semibold text-brown">
                      {formatEventDate(event.startsAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-brown">
                      {event.title}
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
