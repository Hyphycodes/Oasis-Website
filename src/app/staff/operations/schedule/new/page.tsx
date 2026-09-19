import { ShiftForm } from '@/components/staff/manage/ShiftForm';
import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Screen } from '@/components/staff/ui';
import { zonedDate } from '@/lib/staff/time';
import { listEmployees, listPositions } from '@/server/staff/employees';
import { eventOptionsFor, isDenied, staffPage } from '../../../_lib';

export const dynamic = 'force-dynamic';

export default async function NewShiftPage({ searchParams }: { searchParams: Promise<{ date?: string; location?: string; employee?: string }> }) {
  const page = await staffPage('schedule.manage');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const params = await searchParams;
  const locationId = context.locations.find((entry) => entry.id === params.location)?.id ?? context.location.id;
  const [employees, positions, events] = await Promise.all([listEmployees(db), listPositions(db), eventOptionsFor(db, context.location.timezone)]);
  return (
    <StaffShell context={context} unread={unread}>
      <Back href="/staff/operations/schedule" label="Schedule" />
      <Screen title="New shift">
        <ShiftForm shift={null} date={params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : zonedDate(new Date(), context.location.timezone)} employees={employees} positions={positions.filter((position) => position.active)} locations={context.locations} events={events} defaultLocationId={locationId} defaultEmployeeId={params.employee ?? null} />
      </Screen>
    </StaffShell>
  );
}
