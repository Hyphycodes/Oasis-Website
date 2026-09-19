import Link from 'next/link';
import { CalendarMonth, CalendarWeek, ShiftChip } from '@/components/staff/Calendar';
import { StaffShell } from '@/components/staff/StaffShell';
import { Button, Chips, Empty, Screen } from '@/components/staff/ui';
import { addDays, formatDate, weekOf, zonedDate, zonedInstant } from '@/lib/staff/time';
import { listShiftViews } from '@/server/staff/schedule';
import { listTimeOff } from '@/server/staff/timeoff';
import { isDenied, staffPage } from '../_lib';

export const dynamic = 'force-dynamic';

/** My schedule: a week, day by day, with the month a tap away. */
export default async function MySchedulePage({ searchParams }: { searchParams: Promise<{ week?: string; view?: string }> }) {
  const page = await staffPage('schedule.view_self');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const params = await searchParams;
  const timezone = context.location.timezone;
  const today = zonedDate(new Date(), timezone);
  const anchor = params.week && /^\d{4}-\d{2}-\d{2}$/.test(params.week) ? params.week : today;
  const monthView = params.view === 'month';
  const days = monthView ? Array.from({ length: 35 }, (_, index) => addDays(weekOf(anchor)[0]!, index)) : weekOf(anchor);
  const from = zonedInstant(days[0]!, 0, timezone);
  const to = zonedInstant(addDays(days[days.length - 1]!, 1), 0, timezone);
  const employee = context.employee;
  const [shifts, timeOff] = employee ? await Promise.all([listShiftViews(db, { from, to, employeeId: employee.id }), listTimeOff(db, { employeeId: employee.id, status: 'approved', from: days[0] })]) : [[], []];
  const byDay = new Map(days.map((day) => [day, shifts.filter((shift) => zonedDate(shift.startsAt, timezone) === day)]));
  const previous = addDays(days[0]!, monthView ? -35 : -7);
  const next = addDays(days[0]!, monthView ? 35 : 7);
  const hasAny = shifts.length > 0;

  return (
    <StaffShell context={context} unread={unread}>
      <Screen
        title="Schedule"
        lead={`${formatDate(days[0]!, 'short')} – ${formatDate(days[days.length - 1]!, 'short')}`}
        actions={
          <div className="flex items-center gap-1.5">
            <Button href={`/staff/schedule?week=${previous}${monthView ? '&view=month' : ''}`} small>
              ←
            </Button>
            <Button href={`/staff/schedule${monthView ? '?view=month' : ''}`} small>
              Today
            </Button>
            <Button href={`/staff/schedule?week=${next}${monthView ? '&view=month' : ''}`} small>
              →
            </Button>
          </div>
        }
      >
        <Chips
          items={[
            { href: `/staff/schedule?week=${anchor}`, label: 'Week', active: !monthView },
            { href: `/staff/schedule?week=${anchor}&view=month`, label: 'Month', active: monthView },
            { href: '/staff/schedule/coverage', label: 'Up for grabs', active: false },
            { href: '/staff/time-off', label: 'Time off', active: false },
            { href: '/staff/availability', label: 'Availability', active: false },
          ]}
        />
        {!employee ? <Empty title="No schedule of your own." detail="You are signed in as a manager without an employee profile." /> : null}
        {employee && !hasAny ? <Empty title={monthView ? 'No shifts this month.' : 'No shifts this week.'} detail="You’re off — enjoy it." /> : null}
        {employee && hasAny && monthView ? (
          <CalendarMonth weeks={[0, 1, 2, 3, 4].map((week) => days.slice(week * 7, week * 7 + 7))} today={today}>
            {(day) => {
              const mine = byDay.get(day) ?? [];
              const off = timeOff.find((request) => day >= request.startsOn && day <= request.endsOn);
              if (mine.length === 0) return off ? <span className="text-[0.6875rem] text-brown-soft">Off</span> : null;
              return (
                <>
                  {mine.slice(0, 2).map((shift) => (
                    <ShiftChip key={shift.id} shift={shift} href={`/staff/schedule/shift/${shift.id}`} label={shift.positionName} />
                  ))}
                  {mine.length > 2 ? <span className="text-[0.6875rem] text-brown-soft">+{mine.length - 2} more</span> : null}
                </>
              );
            }}
          </CalendarMonth>
        ) : null}
        {employee && hasAny && !monthView ? (
          <CalendarWeek days={days} today={today}>
            {(day) => {
              const mine = byDay.get(day) ?? [];
              const off = timeOff.find((request) => day >= request.startsOn && day <= request.endsOn);
              if (mine.length === 0) return <p className="text-[0.8125rem] text-brown-soft">{off ? 'Time off (approved)' : 'Off'}</p>;
              return mine.map((shift) => <ShiftChip key={shift.id} shift={shift} href={`/staff/schedule/shift/${shift.id}`} label={shift.positionName} />);
            }}
          </CalendarWeek>
        ) : null}
        <p className="text-[0.8125rem] text-brown-soft">
          Need a day? <Link href="/staff/time-off" className="font-semibold text-brown underline underline-offset-4">Request time off</Link> or <Link href="/staff/availability" className="font-semibold text-brown underline underline-offset-4">update your availability</Link>.
        </p>
      </Screen>
    </StaffShell>
  );
}
