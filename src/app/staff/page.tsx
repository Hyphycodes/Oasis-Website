import Link from 'next/link';
import { ShiftHero, ShiftRow } from '@/components/staff/ShiftCard';
import { StaffShell } from '@/components/staff/StaffShell';
import { Button, Empty, Pill, Progress, Row, Section, Stat } from '@/components/staff/ui';
import { formatClockShort, formatDayShort, formatRelative } from '@/lib/staff/time';
import { staffHome } from '@/server/staff/home';
import { isDenied, staffPage } from './_lib';

export const dynamic = 'force-dynamic';

/**
 * Home. It answers, in order: am I working today, what is on tonight, what
 * needs me. Then the rest. Nothing here is a card for its own sake.
 */
export default async function StaffHomePage() {
  const page = await staffPage('staff.view_self');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const home = await staffHome(db, context);
  const first = (context.employee?.displayName ?? context.staff.name ?? '').split(/\s+/)[0] ?? '';
  const today = home.todayShifts[0] ?? null;
  const later = home.todayShifts.slice(1);

  return (
    <StaffShell context={context} unread={unread}>
      <div className="grid gap-7">
        <div>
          <h1 className="display text-[clamp(1.75rem,6vw,2.5rem)] leading-none text-brown">
            {home.greeting}
            {first ? `, ${first}` : ''}.
          </h1>
          {!context.employee ? (
            <p className="mt-2 text-[0.9375rem] text-brown-soft">You are signed in as a manager without an employee profile, so there is no shift of your own here. Everything else is in More.</p>
          ) : null}
        </div>

        {home.onboarding && home.onboarding.stage !== 'ready' ? (
          <Link href="/staff/onboarding" className="staff-panel block border-amber/40 px-4 py-3.5">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-amber">Onboarding</p>
            <div className="mt-2">
              <Progress value={home.onboarding.complete} max={home.onboarding.total} />
            </div>
            <p className="mt-2 text-[0.875rem] text-brown-soft">Finish this before your first shift. Tap to continue.</p>
          </Link>
        ) : null}

        {context.employee ? (
          today ? (
            <div className="grid gap-2">
              <ShiftHero shift={today} label={Date.parse(today.startsAt) <= Date.now() && Date.parse(today.endsAt) > Date.now() ? 'On now' : 'Today'} href={`/staff/schedule/shift/${today.id}`} />
              {later.map((shift) => (
                <ShiftRow key={shift.id} shift={shift} href={`/staff/schedule/shift/${shift.id}`} showDate={false} />
              ))}
            </div>
          ) : (
            <div className="staff-panel px-5 py-4">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-brown-soft">Today</p>
              <p className="mt-1 text-[1.125rem] font-semibold text-brown">You’re off today.</p>
              {home.nextShift ? (
                <p className="mt-1 text-[0.9375rem] text-brown-soft">
                  Next up: {formatDayShort(home.nextShift.startsAt, home.nextShift.locationTimezone)}, {formatClockShort(home.nextShift.startsAt, home.nextShift.locationTimezone)} · {home.nextShift.positionName}
                </p>
              ) : (
                <p className="mt-1 text-[0.9375rem] text-brown-soft">Nothing on your schedule yet.</p>
              )}
            </div>
          )
        ) : null}

        {home.tonight.length > 0 ? (
          <Section title="At Oasis today">
            <div className="grid gap-2">
              {home.tonight.map((event) => (
                <div key={event.id} className="staff-panel px-4 py-3">
                  <p className="text-[1rem] font-semibold text-brown">{event.title}</p>
                  <p className="mt-0.5 text-[0.875rem] text-brown-soft">
                    {event.doorsAt ? `Doors ${formatClockShort(event.doorsAt, context.location.timezone)}` : `Starts ${formatClockShort(event.startsAt, context.location.timezone)}`}
                    {event.ticketsSold !== null ? ` · ${event.ticketsSold} tickets sold` : ''}
                    {event.myRole ? ` · You: ${event.myRole}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {home.announcements.length > 0 ? (
          <Section title="New announcements" action={<Link href="/staff/announcements" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            <div className="grid gap-2">
              {home.announcements.map((entry) => (
                <Link key={entry.id} href="/staff/announcements" className={`staff-panel block px-4 py-3 ${entry.kind === 'urgent' ? 'border-warning/50' : ''}`}>
                  <p className="flex items-center gap-2 text-[0.9375rem] font-semibold text-brown">
                    {entry.kind === 'urgent' ? <Pill tone="warn">Urgent</Pill> : null}
                    {entry.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.875rem] text-brown-soft">{entry.body}</p>
                  {entry.requiresAck ? <p className="mt-1 text-[0.75rem] font-semibold text-amber">Needs your acknowledgement</p> : null}
                </Link>
              ))}
            </div>
          </Section>
        ) : null}

        {context.employee ? (
          <Section title="Tasks" count={home.tasks.length} action={<Link href="/staff/tasks" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            {home.tasks.length === 0 ? (
              <Empty title="No open tasks." detail="Nothing needs you right now." />
            ) : (
              <div className="staff-panel px-4">
                {home.tasks.map((task) => (
                  <Row key={task.id} href={`/staff/tasks/${task.id}`} title={task.title} detail={task.dueAt ? `Due ${formatRelative(task.dueAt)}${task.eventTitle ? ` · ${task.eventTitle}` : ''}` : task.eventTitle} trailing={task.overdue ? <Pill tone="bad">Overdue</Pill> : task.priority === 'urgent' || task.priority === 'high' ? <Pill tone="warn">{task.priority}</Pill> : null} />
                ))}
              </div>
            )}
          </Section>
        ) : null}

        {home.checklists.length > 0 ? (
          <Section title="Checklists today">
            <div className="staff-panel px-4">
              {home.checklists.map((run) => (
                <Row key={run.id} href={`/staff/checklists/${run.id}`} title={run.title} detail={`${run.done} of ${run.total} done${run.assignedEmployeeName ? ` · ${run.assignedEmployeeName}` : ''}`} trailing={run.done === run.total && run.total > 0 ? <Pill tone="good">Complete</Pill> : null} />
              ))}
            </div>
          </Section>
        ) : null}

        {context.employee && home.training.length > 0 ? (
          <Section title="Training" action={<Link href="/staff/training" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            <div className="staff-panel px-4">
              {home.training.map((assignment) => (
                <Row key={assignment.id} href={`/staff/training/${assignment.moduleId}`} title={assignment.module.title} detail={assignment.dueOn ? `Due ${assignment.dueOn}` : assignment.module.estimatedMinutes ? `About ${assignment.module.estimatedMinutes} min` : undefined} trailing={assignment.overdue ? <Pill tone="bad">Overdue</Pill> : assignment.outdated ? <Pill tone="warn">New version</Pill> : assignment.module.required ? <Pill tone="accent">Required</Pill> : null} />
              ))}
            </div>
          </Section>
        ) : null}

        {context.employee ? (
          <Section title="Coming up" action={<Link href="/staff/schedule" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">Schedule</Link>}>
            {home.upcoming.length === 0 ? (
              <Empty title="No shifts coming up." detail="You’re off — enjoy it." />
            ) : (
              <div className="staff-panel px-4">
                {home.upcoming.map((shift) => (
                  <ShiftRow key={shift.id} shift={shift} href={`/staff/schedule/shift/${shift.id}`} />
                ))}
              </div>
            )}
          </Section>
        ) : null}

        {home.openShifts.length > 0 || home.coverage.length > 0 ? (
          <Section title="Up for grabs" action={<Link href="/staff/schedule/coverage" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">See all</Link>}>
            <div className="staff-panel px-4">
              {home.coverage.map((request) => (
                <ShiftRow key={request.id} shift={{ ...request.shift, employeeName: request.requestedByName }} href="/staff/schedule/coverage" showEmployee />
              ))}
              {home.openShifts.map((shift) => (
                <ShiftRow key={shift.id} shift={shift} href="/staff/schedule/coverage" />
              ))}
            </div>
          </Section>
        ) : null}

        {context.isManager ? (
          <Section title="Manage" action={<Link href="/staff/operations" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">Full dashboard</Link>}>
            {home.managerToday ? (
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat value={home.managerToday.scheduled} label="scheduled today" href={`/staff/operations/schedule`} />
                <Stat value={home.managerToday.events} label={home.managerToday.events === 1 ? 'event tonight' : 'events tonight'} href="/staff/events" />
                <Stat value={home.managerToday.openShifts} label="open shifts" href="/staff/operations/schedule" tone={home.managerToday.openShifts ? 'warn' : undefined} />
                <Stat value={home.managerToday.overdueTasks} label="overdue tasks" href="/staff/operations/tasks" tone={home.managerToday.overdueTasks ? 'warn' : undefined} />
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button href="/staff/operations" variant="primary">Today’s operations</Button>
              <Button href="/staff/team">Team</Button>
              <Button href="/staff/operations/schedule">Build schedule</Button>
            </div>
          </Section>
        ) : null}
      </div>
    </StaffShell>
  );
}
