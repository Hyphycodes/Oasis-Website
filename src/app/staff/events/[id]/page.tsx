import { notFound } from 'next/navigation';
import { Comments } from '@/components/staff/Comments';
import { EventStaffingPanel } from '@/components/staff/EventStaffingPanel';
import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Button, Screen } from '@/components/staff/ui';
import { listComments } from '@/server/staff/comments';
import { listEmployees } from '@/server/staff/employees';
import { locationMap, resolveLocation } from '@/server/staff/locations';
import { eventStaffing } from '@/server/staff/staffing';
import { contextCan } from '@/server/staff/session';
import { isDenied, staffPage } from '../../_lib';

export const dynamic = 'force-dynamic';

export default async function StaffEventPage({ params }: { params: Promise<{ id: string }> }) {
  const page = await staffPage('events.staff');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const { id } = await params;
  const eventId = decodeURIComponent(id);
  const staffing = await eventStaffing(db, eventId);
  if (!staffing) notFound();
  const [employees, comments, locations] = await Promise.all([listEmployees(db), listComments(db, 'event_staffing', eventId, context.staff.id), locationMap(db)]);
  const timezone = resolveLocation(locations, staffing.event.locationId).timezone;
  return (
    <StaffShell context={context} unread={unread} wide>
      <Back href="/staff/events" label="Events" />
      <Screen title={staffing.event.title} eyebrow="Staffing" actions={<Button href={`/admin/events/one/${encodeURIComponent(eventId)}`} small>Event in admin</Button>}>
        <EventStaffingPanel staffing={staffing} employees={employees} timezone={timezone} canStaff={contextCan(context, 'events.staff')} />
        <Comments entityType="event_staffing" entityId={eventId} comments={comments} />
      </Screen>
    </StaffShell>
  );
}
