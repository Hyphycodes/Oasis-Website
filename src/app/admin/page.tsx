import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';
import { ArtworkSourceNote, ArtworkThumb, artworkSourceOf } from '@/components/admin/Artwork';
import { Card, EmptyState, LinkButton, StateChip, TaskLink } from '@/components/admin/ui';
import { getMediaMap } from '@/content/media';
import { getSiteSettings } from '@/content/resolve';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { getUpcomingEvents, ineligibleReason } from '@/lib/events';
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
 *
 * Those problems used to arrive as one coloured banner each — eleven of them on
 * a busy week, stacked full-width above everything else, so the screen opened as
 * a wall of red and the four errands were pushed off the bottom. They are one
 * list now, in one card, worst first, with everything past the fourth folded
 * away. Nothing is lost; it just stops shouting.
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

  const urgent = attention.filter((entry) => entry.severity === 'blocking').length;
  const shown = attention.slice(0, 4);
  const folded = attention.slice(4);

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
          icon="events"
          title="Add an event"
          hint="Add the date, photo and details in one place"
        />
        <TaskLink
          href="/admin/menu"
          icon="menu"
          title="Update the menu"
          hint="Change a price, description or sold-out item"
        />
        <TaskLink
          href="/admin/media?upload=1"
          icon="photos"
          title="Add a photo or video"
          hint="Choose a file and the site handles the rest"
        />
        <TaskLink
          href="/admin/settings"
          icon="hours"
          title="Hours & contact"
          hint="Update opening times, holidays and contact details"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.875rem]">
        <Link
          href="/admin/website"
          className="font-semibold text-clay underline underline-offset-4 hover:text-coral-deep"
        >
          Change page words or pictures
        </Link>
        <Link
          href="/admin/theme"
          className="font-semibold text-clay underline underline-offset-4 hover:text-coral-deep"
        >
          Dress the website for the season
        </Link>
        <Link
          href="/admin/inquiries"
          className="font-semibold text-clay underline underline-offset-4 hover:text-coral-deep"
        >
          {waiting > 0
            ? `Read ${waiting} new ${waiting === 1 ? 'enquiry' : 'enquiries'}`
            : 'Read enquiries'}
        </Link>
      </div>

      <div className="mt-8">
        {attention.length > 0 ? (
          <Card
            title="Needs attention"
            action={
              <span className="text-[0.8125rem] text-brown-soft">
                {urgent > 0
                  ? `${urgent} to fix now · ${attention.length} in total`
                  : `${attention.length} ${attention.length === 1 ? 'thing' : 'things'}`}
              </span>
            }
          >
            <ul className="divide-y divide-brown/12">
              {shown.map((entry) => (
                <AttentionRow key={entry.id} entry={entry} />
              ))}
            </ul>

            {folded.length > 0 ? (
              <details className="mt-1 border-t border-brown/12">
                <summary className="inline-flex min-h-11 cursor-pointer items-center text-[0.875rem] font-semibold text-clay">
                  Show the other {folded.length}
                </summary>
                <ul className="divide-y divide-brown/12 border-t border-brown/12">
                  {folded.map((entry) => (
                    <AttentionRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </details>
            ) : null}
          </Card>
        ) : (
          <Card>
            <p className="flex items-center gap-2.5 text-[0.9375rem] text-brown">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/12 text-[0.75rem] font-bold text-success"
              >
                ✓
              </span>
              Everything is in order — nothing needs attention right now.
            </p>
          </Card>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card
          title="Coming up"
          action={
            <Link
              href="/admin/events"
              className="text-[0.875rem] text-clay underline underline-offset-4 hover:text-coral-deep"
            >
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
                  <li key={event.id} className="flex items-center gap-3 py-3">
                    <ArtworkThumb
                      asset={event.flyerAssetId ? (media[event.flyerAssetId] ?? null) : null}
                    />
                    {/* The name gets its own line rather than a share of one.
                        On a phone the old row clipped it to "Oasis Fri…". */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.9375rem] text-brown">{event.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem]">
                        <span className="tabular font-semibold text-brown">
                          {formatEventDate(event.startsAt)}
                        </span>
                        <span className="tabular text-brown-soft">
                          {formatEventTime(event.startsAt)}
                        </span>
                        <ArtworkSourceNote source={artworkSourceOf(event)} />
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
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
                        className="text-[0.8125rem] text-clay underline underline-offset-4 hover:text-coral-deep"
                      >
                        Edit
                      </Link>
                    </div>
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
                  <span className="min-w-0 flex-1 text-[0.9375rem] text-brown">
                    {/* The label is what a person typed; the row id is a uuid.
                        Show the uuid only when there is nothing better. */}
                    {entry.label || `${TABLE_LABEL[entry.table] ?? entry.table} · ${entry.rowId}`}
                  </span>
                  <span className="text-[0.8125rem] text-brown-soft">
                    {entry.actorName}, {changedOn(entry.at)}
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

/**
 * "Mon, Sep 14" rather than a timestamp — and never a crash.
 *
 * A version row with a missing or malformed `at` would otherwise take the whole
 * dashboard down through Intl, which is a poor trade for one line of a history
 * list.
 */
function changedOn(at: string): string {
  const when = new Date(at);
  return Number.isNaN(when.getTime()) ? 'earlier' : formatEventDate(at);
}

const SEVERITY = {
  blocking: { word: 'Fix now', chip: 'border-danger/45 bg-danger/8 text-danger' },
  warning: { word: 'Soon', chip: 'border-warning/45 bg-warning/8 text-warning' },
  info: { word: 'Note', chip: 'border-brown/25 bg-brown/6 text-brown-soft' },
} as const;

function severityOf(value: string) {
  return value in SEVERITY ? SEVERITY[value as keyof typeof SEVERITY] : SEVERITY.info;
}

/**
 * One thing that wants doing.
 *
 * Severity is a word in a chip, not a colour wash across the whole row — the
 * same rule the state chips follow, and the reason eleven of these in a column
 * still read as a list rather than as an emergency.
 */
function AttentionRow({
  entry,
}: {
  entry: { id: string; severity: string; message: string; href: string; actionLabel: string };
}) {
  const severity = severityOf(entry.severity);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3">
      <span
        className={`inline-flex w-16 shrink-0 items-center justify-center rounded-(--radius-sm) border px-1.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] ${severity.chip}`}
      >
        {severity.word}
      </span>
      <p className="min-w-0 flex-1 basis-64 text-[0.9375rem] leading-relaxed text-brown">
        {entry.message}
      </p>
      <LinkButton href={entry.href} variant="quiet">
        {entry.actionLabel} →
      </LinkButton>
    </li>
  );
}
