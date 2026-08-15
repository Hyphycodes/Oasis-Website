import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { Card, EmptyState, Notice, StateChip } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getUpcomingEvents, ineligibleReason, venueIsoDate } from '@/lib/events';
import { formatEventDateLong, formatPrice, formatTimeRange } from '@/lib/format';
import { getStaff, staffCan } from '@/server/auth';
import { getEditableEvents } from '@/server/content/events';
import { canOpen } from '@/server/permissions';
import { NewOneTimeEvent } from './NewOneTimeEvent';
import { OccurrencePublish } from './OccurrencePublish';

export const dynamic = 'force-dynamic';

type Tab = 'upcoming' | 'series' | 'drafts' | 'past' | 'cancelled';

const TABS: { id: Tab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'series', label: 'Repeating nights' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
];

/**
 * Events.
 *
 * The list leads with date and readiness, because the question this screen exists
 * to answer is "is Friday ready to sell". A row that is missing its ticket link
 * or its artwork says so in the row, rather than looking identical to one that is
 * fine.
 */
export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; window?: string }>;
}) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'events')) {
    return (
      <AdminShell staff={staff} local={local} title="Events">
        <NoAccess what="events" />
      </AdminShell>
    );
  }

  const db = getReadDb();
  const params = await searchParams;
  const tab = (TABS.find((t) => t.id === params.tab)?.id ?? 'upcoming') as Tab;
  const now = new Date();
  const canPublish = staffCan(staff, 'content.publish');

  const events = db ? await getEditableEvents(db) : { series: [], occurrences: [] };
  const overrides = db ? await db.list<Row>('event_occurrences', { orderBy: 'starts_at' }) : [];

  const upcoming = getUpcomingEvents(events, now, 40);
  // A month by default. Forty rows of "Friday, then Saturday, then Friday" is a
  // list nobody reads; the next four weeks is the window a restaurant works in.
  const windowDays = params.window === '7' ? 7 : params.window === 'all' ? null : 30;
  const horizon = windowDays ? now.getTime() + windowDays * 86_400_000 : Infinity;

  const visible = upcoming.filter((event) => new Date(event.startsAt).getTime() <= horizon);
  const drafts = visible.filter((event) => !event.published);
  const cancelled = visible.filter((event) => event.status === 'cancelled');
  const ready = visible.filter((event) => event.published && event.status !== 'cancelled');

  const past = overrides
    .filter((row) => String(row.starts_at).slice(0, 10) < venueIsoDate(now.toISOString()))
    .slice(-15)
    .reverse();

  return (
    <AdminShell
      staff={staff}
      local={local}
      title="Events"
      description="Your Friday and Saturday nights repeat on their own, so the dates on the website are always right. Change one night when you need to."
      actions={
        <Link
          href="/events"
          target="_blank"
          className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
        >
          View on the website
        </Link>
      }
    >
      {!db ? (
        <EmptyState>
          The content system is not connected, so events are read from the built-in content.
        </EmptyState>
      ) : (
        <>
          <nav aria-label="Which events" className="mb-5">
            <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TABS.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/admin/events?tab=${entry.id}`}
                    aria-current={entry.id === tab ? 'page' : undefined}
                    className={`inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-(--radius-sm) px-3 text-[0.9375rem] font-semibold ${
                      entry.id === tab
                        ? 'bg-teal text-amber'
                        : 'text-brown-soft hover:bg-brown/8 hover:text-brown'
                    }`}
                  >
                    {entry.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {tab === 'upcoming' ? (
            <>
              <div className="mb-4 flex flex-wrap gap-2 text-[0.8125rem]">
                <span className="inline-flex min-h-11 items-center text-brown-soft">Show:</span>
                {[
                  { label: 'Next 7 days', value: '7' },
                  { label: 'Next 30 days', value: '30' },
                  { label: 'Everything', value: 'all' },
                ].map((filter) => (
                  <Link
                    key={filter.label}
                    href={`/admin/events?tab=upcoming&window=${filter.value}`}
                    aria-current={(params.window ?? '30') === filter.value ? 'true' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-(--radius-sm) border px-3 font-medium ${
                      (params.window ?? '30') === filter.value
                        ? 'border-clay text-clay'
                        : 'border-brown/25 text-brown-soft'
                    }`}
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>

              <Card title={`${ready.length} night${ready.length === 1 ? '' : 's'} coming up`}>
                {ready.length === 0 ? (
                  <EmptyState>Nothing scheduled in this period.</EmptyState>
                ) : (
                  <ReadinessTable events={ready} canPublish={canPublish} now={now} />
                )}
              </Card>
            </>
          ) : null}

          {tab === 'series' ? (
            <div className="grid gap-4">
              {events.series.map((series) => {
                const next = ready.filter((event) => event.seriesSlug === series.slug);
                return (
                  <Card
                    key={series.slug}
                    title={series.title}
                    action={
                      <Link
                        href={`/admin/events/${series.slug}`}
                        className="inline-flex min-h-11 items-center rounded-(--radius-sm) bg-coral px-4 text-[0.9375rem] font-semibold text-on-orange"
                      >
                        Edit this night
                      </Link>
                    }
                  >
                    <dl className="grid gap-x-8 gap-y-2 text-[0.9375rem] sm:grid-cols-2">
                      <Row label="Repeats">
                        {series.cadence.kind === 'weekly'
                          ? `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][series.cadence.weekday]}`
                          : 'One-off'}
                      </Row>
                      <Row label="Time">
                        {String(Math.floor(series.startMinutes / 60)).padStart(2, '0')}:
                        {String(series.startMinutes % 60).padStart(2, '0')} to{' '}
                        {String(Math.floor((series.endMinutes % 1440) / 60)).padStart(2, '0')}:
                        {String(series.endMinutes % 60).padStart(2, '0')}
                      </Row>
                      <Row label="Music">{series.musicFormats.join(' · ') || '—'}</Row>
                      <Row label="Entry">
                        {series.priceCents != null ? formatPrice(series.priceCents) : 'At the door'}
                      </Row>
                      <Row label="Next dates">
                        {next
                          .slice(0, 3)
                          .map((event) => venueIsoDate(event.startsAt))
                          .join(', ') || 'None'}
                      </Row>
                      <Row label="Artwork">{series.flyerAssetId ?? 'None yet'}</Row>
                    </dl>
                    {series.paused ? (
                      <div className="mt-4">
                        <Notice tone="warning">
                          Paused — no new dates are being put on the website.
                        </Notice>
                      </div>
                    ) : null}
                  </Card>
                );
              })}

              {canPublish ? <NewOneTimeEvent /> : null}
            </div>
          ) : null}

          {tab === 'drafts' ? (
            <Card title="Drafts">
              {drafts.length === 0 ? (
                <EmptyState>No drafts. Everything you have made is either live or archived.</EmptyState>
              ) : (
                <ReadinessTable events={drafts} canPublish={canPublish} now={now} />
              )}
            </Card>
          ) : null}

          {tab === 'cancelled' ? (
            <Card title="Cancelled nights">
              {cancelled.length === 0 ? (
                <EmptyState>Nothing is cancelled.</EmptyState>
              ) : (
                <>
                  <Notice tone="info">
                    A cancelled night stays on the website for two weeks so anyone holding a ticket
                    finds out. It is never offered as “what’s on”.
                  </Notice>
                  <div className="mt-4">
                    <ReadinessTable events={cancelled} canPublish={canPublish} now={now} />
                  </div>
                </>
              )}
            </Card>
          ) : null}

          {tab === 'past' ? (
            <Card title="Past nights you changed">
              {past.length === 0 ? (
                <EmptyState>
                  Nothing here. Ordinary repeating nights are not stored one by one — only nights you
                  changed are kept.
                </EmptyState>
              ) : (
                <ul className="divide-y divide-brown/12">
                  {past.map((row) => (
                    <li key={String(row.id)} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                      <span className="tabular w-28 shrink-0 text-[0.875rem] font-semibold text-brown">
                        {String(row.starts_at).slice(0, 10)}
                      </span>
                      <span className="min-w-0 flex-1 text-[0.9375rem] text-brown">
                        {String(row.title ?? row.series_slug ?? 'Night')}
                      </span>
                      <span className="text-[0.8125rem] text-brown-soft">{String(row.status)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-brown/10 py-1.5">
      <dt className="text-brown-soft">{label}</dt>
      <dd className="text-right text-brown">{children}</dd>
    </div>
  );
}

/**
 * The readiness table.
 *
 * Date, time, tickets, artwork, state — the five things that decide whether a
 * night can be sold. Problems are words, not a red dot.
 */
function ReadinessTable({
  events,
  canPublish,
  now,
}: {
  events: import('@/content/types').ResolvedEvent[];
  canPublish: boolean;
  now: Date;
}) {
  return (
    <ul className="divide-y divide-brown/12">
      {events.map((event) => {
        const problem = ineligibleReason(event, now);
        const date = venueIsoDate(event.startsAt);
        return (
          <li key={event.id} className="grid gap-2 py-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="tabular shrink-0 text-[0.9375rem] font-semibold text-brown">
                {formatEventDateLong(event.startsAt)}
              </span>
              <span className="tabular shrink-0 text-[0.8125rem] text-brown-soft">
                {formatTimeRange(event.startsAt, event.endsAt)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-brown">
                {event.title}
              </span>
              <StateChip
                state={
                  event.archivedAt
                    ? 'archived'
                    : !event.published
                      ? 'draft'
                      : event.overriddenFields.length
                        ? 'changed'
                        : 'published'
                }
              />
              {event.seriesSlug ? (
                <Link
                  href={`/admin/events/${event.seriesSlug}?date=${date}`}
                  className="shrink-0 text-[0.8125rem] font-semibold text-clay underline underline-offset-4"
                >
                  Change this night
                </Link>
              ) : null}
              {canPublish && !event.published && event.overrideId ? (
                <OccurrencePublish id={event.overrideId} published={false} />
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem]">
              {problem ? (
                <span className="font-semibold text-warning">{problem}</span>
              ) : null}
              {!event.ticketUrl ? (
                <span className="font-semibold text-danger">No ticket link</span>
              ) : (
                <span className="text-brown-soft">Tickets set</span>
              )}
              <span className="text-brown-soft">
                {event.flyerAssetId ? 'Artwork set' : 'No artwork'}
                {event.overriddenFields.includes('flyerAssetId') ? ' (this night only)' : ''}
              </span>
              {event.overriddenFields.length > 0 ? (
                <span className="text-clay">
                  Changed for this night: {event.overriddenFields.join(', ')}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
