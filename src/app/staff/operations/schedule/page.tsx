import Link from 'next/link';
import { OneTap } from '@/components/staff/forms';
import { ShiftRow } from '@/components/staff/ShiftCard';
import { StaffShell } from '@/components/staff/StaffShell';
import { Button, Chips, Empty, Pill, Screen, Section } from '@/components/staff/ui';
import { addDays, formatDate, weekOf, zonedDate, zonedInstant } from '@/lib/staff/time';
import { copySchedule, publishSchedule } from '@/server/actions/staff/schedule';
import { listEmployees } from '@/server/staff/employees';
import { listShiftViews } from '@/server/staff/schedule';
import { listTimeOff } from '@/server/staff/timeoff';
import { isDenied, staffPage } from '../../_lib';

export const dynamic = 'force-dynamic';

/**
 * The schedule builder: one week at one location, day by day, drafts and
 * all, with warnings on the row. Publish sends the week; copy drafts it
 * into the next.
 */
export default async function ScheduleBuilderPage({ searchParams }: { searchParams: Promise<{ week?: string; location?: string; by?: string }> }) {
  const page = await staffPage('schedule.manage');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const params = await searchParams;
  const location = context.locations.find((entry) => entry.slug === params.location || entry.id === params.location) ?? context.location;
  const timezone = location.timezone;
  const today = zonedDate(new Date(), timezone);
  const anchor = params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week) ? params.week : today;
  const days = weekOf(anchor);
  const weekStart = days[0]!;
  const from = zonedInstant(weekStart, 0, timezone);
  const to = zonedInstant(addDays(weekStart, 7), 0, timezone);
  const byPerson = params.by === 'person';
  const [shifts, employees, timeOff] = await Promise.all([
    listShiftViews(db, { from, to, locationId: location.id, includeDrafts: true, includeCancelled: false }, { withWarnings: true }),
    listEmployees(db, { locationId: location.id }),
    listTimeOff(db, { status: 'approved', from: weekStart }),
  ]);
  const drafts = shifts.filter((shift) => shift.status === 'draft').length;
  const issues = shifts.filter((shift) => shift.warnings.length > 0).length;
  const open = shifts.filter((shift) => !shift.employeeId).length;
  const query = `week=${weekStart}&location=${location.slug}${byPerson ? '&by=person' : ''}`;

  return (
    <StaffShell context={context} unread={unread} wide>
      <Screen
        title="Schedule"
        eyebrow={location.name}
        lead={`${formatDate(weekStart, 'short')} – ${formatDate(days[6]!, 'short')}`}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <Button href={`/staff/operations/schedule?week=${addDays(weekStart, -7)}&location=${location.slug}${byPerson ? '&by=person' : ''}`} small>
              ←
            </Button>
            <Button href={`/staff/operations/schedule?location=${location.slug}${byPerson ? '&by=person' : ''}`} small>
              This week
            </Button>
            <Button href={`/staff/operations/schedule?week=${addDays(weekStart, 7)}&location=${location.slug}${byPerson ? '&by=person' : ''}`} small>
              →
            </Button>
            <Button href={`/staff/operations/schedule/new?date=${weekStart}&location=${location.id}`} variant="primary" small>
              + Shift
            </Button>
          </div>
        }
      >
        <Chips
          items={[
            { href: `/staff/operations/schedule?week=${weekStart}&location=${location.slug}`, label: 'By day', active: !byPerson },
            { href: `/staff/operations/schedule?week=${weekStart}&location=${location.slug}&by=person`, label: 'By person', active: byPerson },
            ...context.locations.filter((entry) => entry.id !== location.id).map((entry) => ({ href: `/staff/operations/schedule?week=${weekStart}&location=${entry.slug}`, label: entry.shortName, active: false })),
            { href: '/staff/operations/coverage', label: 'Requests', active: false },
            { href: '/staff/operations/time-off', label: 'Time off', active: false },
          ]}
        />

        <div className="staff-panel flex flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 text-[0.875rem] text-brown-soft">
          <span>
            <strong className="text-brown">{shifts.length}</strong> shifts
          </span>
          <span>
            <strong className={drafts ? 'text-warning' : 'text-brown'}>{drafts}</strong> unpublished
          </span>
          <span>
            <strong className={open ? 'text-warning' : 'text-brown'}>{open}</strong> open
          </span>
          <span>
            <strong className={issues ? 'text-warning' : 'text-brown'}>{issues}</strong> with warnings
          </span>
          <span className="ml-auto flex flex-wrap gap-2">
            {drafts > 0 ? (
              <OneTap action={publishSchedule} fields={{ weekStart, locationId: location.id }} confirm={`Publish ${drafts} shifts? Everyone scheduled will be told.`}>
                Publish week
              </OneTap>
            ) : null}
            <OneTap action={copySchedule} fields={{ weekStart, locationId: location.id }} variant="secondary" confirm="Copy every shift this week into next week as drafts?">
              Copy to next week
            </OneTap>
          </span>
        </div>

        {shifts.length === 0 ? <Empty title="No shifts this week yet." detail="Add one, or copy last week forward." action={<Button href={`/staff/operations/schedule?week=${addDays(weekStart, -7)}&location=${location.slug}`}>Go to last week</Button>} /> : null}

        {byPerson ? (
          <div className="grid gap-4">
            {[...employees, null].map((employee) => {
              const mine = shifts.filter((shift) => (employee ? shift.employeeId === employee.id : !shift.employeeId));
              if (mine.length === 0 && !employee) return null;
              const off = employee ? timeOff.filter((request) => request.employeeId === employee.id && request.startsOn <= days[6]! && request.endsOn >= weekStart) : [];
              return (
                <Section key={employee?.id ?? 'open'} title={employee ? employee.displayName : 'Open shifts'} count={mine.length} action={employee ? <Link href={`/staff/operations/schedule/new?date=${weekStart}&location=${location.id}&employee=${employee.id}`} className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">+ Shift</Link> : undefined}>
                  {off.length > 0 ? <p className="mb-1 text-[0.8125rem] text-warning">Time off approved: {off.map((request) => `${request.startsOn} – ${request.endsOn}`).join(', ')}</p> : null}
                  {mine.length === 0 ? (
                    <p className="text-[0.875rem] text-brown-soft">Not scheduled this week.</p>
                  ) : (
                    <div className="staff-panel px-4">
                      {mine.map((shift) => (
                        <ShiftRow key={shift.id} shift={shift} href={`/staff/operations/schedule/shift/${shift.id}`} />
                      ))}
                    </div>
                  )}
                </Section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4">
            {days.map((day) => {
              const mine = shifts.filter((shift) => zonedDate(shift.startsAt, timezone) === day);
              const off = timeOff.filter((request) => day >= request.startsOn && day <= request.endsOn);
              return (
                <Section key={day} title={`${day === today ? 'Today · ' : ''}${formatDate(day)}`} count={mine.length} action={<Link href={`/staff/operations/schedule/new?date=${day}&location=${location.id}`} className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">+ Shift</Link>}>
                  {off.length > 0 ? (
                    <p className="mb-1 flex flex-wrap gap-1.5 text-[0.8125rem] text-brown-soft">
                      Off: {off.map((request) => <Pill key={request.id}>{request.employeeName}</Pill>)}
                    </p>
                  ) : null}
                  {mine.length === 0 ? (
                    <p className="text-[0.875rem] text-brown-soft">Nobody scheduled.</p>
                  ) : (
                    <div className="staff-panel px-4">
                      {mine.map((shift) => (
                        <ShiftRow key={shift.id} shift={shift} href={`/staff/operations/schedule/shift/${shift.id}`} showEmployee showDate={false} />
                      ))}
                    </div>
                  )}
                </Section>
              );
            })}
          </div>
        )}
        <p className="text-[0.8125rem] text-brown-soft">
          Week of {formatDate(weekStart, 'short')} · <Link href={`/staff/operations/schedule?${query}`} className="underline underline-offset-4">link to this view</Link>
        </p>
      </Screen>
    </StaffShell>
  );
}
