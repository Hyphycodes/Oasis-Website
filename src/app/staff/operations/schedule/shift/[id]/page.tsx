import { notFound } from 'next/navigation';
import { Comments } from '@/components/staff/Comments';
import { AttendanceForm } from '@/components/staff/manage/AttendanceForm';
import { ShiftForm } from '@/components/staff/manage/ShiftForm';
import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Screen, Section, Warning } from '@/components/staff/ui';
import { formatDayLong, formatRelative, zonedDate } from '@/lib/staff/time';
import { listComments } from '@/server/staff/comments';
import { listEmployees, listPositions } from '@/server/staff/employees';
import { getShiftView, shiftHistory } from '@/server/staff/schedule';
import { eventOptionsFor, isDenied, staffPage } from '../../../../_lib';

export const dynamic = 'force-dynamic';

export default async function EditShiftPage({ params }: { params: Promise<{ id: string }> }) {
  const page = await staffPage('schedule.manage');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const { id } = await params;
  const shift = await getShiftView(db, id, { withWarnings: true });
  if (!shift) notFound();
  const [employees, positions, events, history, comments] = await Promise.all([listEmployees(db), listPositions(db), eventOptionsFor(db, shift.locationTimezone), shiftHistory(db, shift.id), listComments(db, 'shift', shift.id, context.staff.id)]);
  return (
    <StaffShell context={context} unread={unread}>
      <Back href={`/staff/operations/schedule?week=${zonedDate(shift.startsAt, shift.locationTimezone)}`} label="Schedule" />
      <Screen title={shift.employeeName ?? 'Open shift'} eyebrow={`${formatDayLong(shift.startsAt, shift.locationTimezone)} · ${shift.positionName} · ${shift.status}`}>
        {shift.warnings.length > 0 ? (
          <div className="grid gap-2">
            {shift.warnings.map((warning) => (
              <Warning key={warning.kind}>{warning.message}</Warning>
            ))}
          </div>
        ) : null}
        <ShiftForm shift={shift} date={zonedDate(shift.startsAt, shift.locationTimezone)} employees={employees} positions={positions.filter((position) => position.active)} locations={context.locations} events={events} defaultLocationId={shift.locationId} />
        {shift.employeeId ? (
          <Section title="Attendance">
            <AttendanceForm shift={shift} />
          </Section>
        ) : null}
        {history.length > 0 ? (
          <Section title="History">
            <ul className="staff-panel px-4">
              {history.map((entry) => (
                <li key={entry.id} className="staff-row text-[0.875rem]">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold capitalize text-brown">{entry.reason}</span>
                    {entry.before && entry.after && entry.before.employeeId !== entry.after.employeeId ? (
                      <span className="block text-brown-soft">
                        {employees.find((employee) => employee.id === entry.before?.employeeId)?.displayName ?? 'Open'} → {employees.find((employee) => employee.id === entry.after?.employeeId)?.displayName ?? 'Open'}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-brown-soft">{formatRelative(entry.changedAt)}</span>
                </li>
              ))}
            </ul>
          </Section>
        ) : null}
        <Comments entityType="shift" entityId={shift.id} comments={comments} />
      </Screen>
    </StaffShell>
  );
}
