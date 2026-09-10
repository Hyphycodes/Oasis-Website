import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { EventPresentationEditor, type ArtSlotState } from '@/components/admin/EventPresentation';
import { Card, Notice } from '@/components/admin/ui';
import { EVENT_ART_SLOTS } from '@/content/event-presentation';
import { getMediaMap } from '@/content/media';
import { getSiteSettings } from '@/content/resolve';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { formatEventDateLong, formatEventTime } from '@/lib/format';
import { getStaff, staffCan } from '@/server/auth';
import { canOpen } from '@/server/permissions';
import { occurrenceFromRow } from '@/server/content/events';
import { venueLocalParts } from '@/themes/schedule';
import { OneOffFacts } from './OneOffFacts';

export const dynamic = 'force-dynamic';

/** Which stored column backs each artwork slot. */
const ART_COLUMN = {
  flyer: 'flyer_asset_id',
  keyArt: 'key_art_asset_id',
  keyArtMobile: 'key_art_mobile_asset_id',
  foreground: 'foreground_asset_id',
} as const;

/**
 * One special event, on one screen.
 *
 * The facts first — what it is, when, what it costs, where the tickets are —
 * then how it looks, then its pictures. That is the order somebody actually
 * fills a thing in, and it means the useful half of the page is above the fold
 * even on a phone.
 */
export default async function OneOffEventPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');

  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'events')) {
    return (
      <AdminShell staff={staff} local={local} title="Event">
        <NoAccess what="events" />
      </AdminShell>
    );
  }

  const db = getReadDb();
  if (!db) notFound();

  const { id } = await params;
  const eventId = decodeURIComponent(id);
  const row = await db.get<Row>('event_occurrences', eventId);
  if (!row) notFound();

  const record = occurrenceFromRow(row, 'working');
  const [media, settings] = await Promise.all([getMediaMap(), getSiteSettings()]);
  const canPublish = staffCan(staff, 'content.publish');

  const art: ArtSlotState[] = EVENT_ART_SLOTS.map((slot) => {
    const assetId = row[ART_COLUMN[slot]] as string | null;
    const asset = assetId ? media[assetId] : null;
    return { slot, path: asset?.path ?? null, filled: Boolean(assetId) };
  });

  const presentation = record.presentation ?? null;
  const start = venueLocalParts(record.startsAt, settings.timeZone);
  const end = venueLocalParts(record.endsAt ?? record.startsAt, settings.timeZone);

  return (
    <AdminShell
      staff={staff}
      local={local}
      title={record.title ?? 'Event'}
      description={`${formatEventDateLong(record.startsAt)} · ${formatEventTime(record.startsAt)}`}
      actions={
        <>
          {record.slug ? (
            <Link
              href={`/events/${record.slug}`}
              target="_blank"
              className="inline-flex min-h-11 items-center rounded-(--radius-sm) border border-brown/30 px-4 text-[0.9375rem] font-semibold text-brown"
            >
              Preview ↗
            </Link>
          ) : null}
          <Link
            href="/admin/events"
            className="inline-flex min-h-11 items-center text-[0.9375rem] font-semibold text-clay underline underline-offset-4"
          >
            All events
          </Link>
        </>
      }
    >
      <div className="grid gap-5">
        {record.provenance?.source === 'tickeri' ? (
          <Notice tone="info">
            This event came from Tickeri. Checking Tickeri again can correct its date, price,
            sold-out state and ticket link — it never changes the artwork or how the event looks
            here.
          </Notice>
        ) : null}

        {record.published === false ? (
          <Notice tone="warning">
            This event is a draft. Guests cannot see it until it is published.
          </Notice>
        ) : null}

        <Card title="The event">
          <OneOffFacts
            id={eventId}
            canPublish={canPublish}
            published={record.published !== false}
            facts={{
              title: record.title ?? '',
              summary: record.summary ?? '',
              description: record.description ?? '',
              date: start.date,
              startTime: start.time,
              endTime: end.time,
              ticketUrl: record.ticketUrl ?? '',
              status: record.status ?? 'scheduled',
              ageMin: record.ageMin === null ? '' : String(record.ageMin),
              venueName: record.venueName ?? '',
            }}
          />
        </Card>

        {presentation ? (
          <EventPresentationEditor
            table="event_occurrences"
            id={eventId}
            title={record.title ?? 'this event'}
            presentation={presentation as never}
            art={art}
            takeover={{
              start: venueLocalParts(presentation.takeoverStartAt ?? null, settings.timeZone),
              end: venueLocalParts(presentation.takeoverEndAt ?? null, settings.timeZone),
            }}
            canPublish={canPublish}
          />
        ) : null}
      </div>
    </AdminShell>
  );
}
