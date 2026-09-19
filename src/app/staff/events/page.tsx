import Link from 'next/link';
import { StaffShell } from '@/components/staff/StaffShell';
import { Empty, Pill, Screen } from '@/components/staff/ui';
import { STAFFING_ROLE_LABEL } from '@/content/staff-types';
import { formatClockShort, formatDayLong } from '@/lib/staff/time';
import { getSalesSummaries } from '@/server/ticketing/sales';
import { listEventsBetween } from '@/server/staff/events';
import { eventStaffing } from '@/server/staff/staffing';
import { isDenied, staffPage } from '../_lib';

export const dynamic = 'force-dynamic';

/** Upcoming events and how staffed each one is. */
export default async function StaffEventsPage() {
  const page = await staffPage('events.staff');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const now = new Date();
  const events = await listEventsBetween(db, new Date(now.getTime() - 6 * 3_600_000).toISOString(), new Date(now.getTime() + 45 * 86_400_000).toISOString());
  const [staffing, sales] = await Promise.all([Promise.all(events.map((event) => eventStaffing(db, event.id))), getSalesSummaries(events.map((event) => event.id))]);
  return (
    <StaffShell context={context} unread={unread} wide>
      <Screen title="Events" lead="The next six weeks. Tap a night to staff it.">
        {events.length === 0 ? <Empty title="No events coming up." detail="Events are created in the admin; staffing happens here once they exist." /> : null}
        <div className="grid gap-2">
          {events.map((event, index) => {
            const board = staffing[index];
            const sold = sales.get(event.id)?.ticketsSold ?? null;
            return (
              <Link key={event.id} href={`/staff/events/${encodeURIComponent(event.id)}`} className="staff-panel block px-4 py-3.5 active:bg-brown/6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[1rem] font-semibold text-brown">{event.title}</p>
                    <p className="mt-0.5 text-[0.875rem] text-brown-soft">
                      {formatDayLong(event.startsAt, context.location.timezone)} · {event.doorsAt ? `doors ${formatClockShort(event.doorsAt, context.location.timezone)}` : formatClockShort(event.startsAt, context.location.timezone)}
                      {sold !== null ? ` · ${sold} sold` : ''}
                      {!event.published ? ' · unpublished' : ''}
                    </p>
                  </div>
                  {board && board.gaps.length > 0 ? <Pill tone="warn">{board.gaps.map((role) => STAFFING_ROLE_LABEL[role]).join(', ')}</Pill> : <Pill tone="good">Staffed</Pill>}
                </div>
                {board && board.assignments.length + board.bookings.length > 0 ? (
                  <p className="mt-2 text-[0.8125rem] text-brown-soft">
                    {[...board.assignments.map((assignment) => `${STAFFING_ROLE_LABEL[assignment.role]}: ${assignment.employeeName}`), ...board.bookings.map((booking) => `${booking.role}: ${booking.contractorName}`)].join(' · ')}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </Screen>
    </StaffShell>
  );
}
