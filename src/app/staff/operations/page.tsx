import Link from 'next/link';
import { OneTap } from '@/components/staff/forms';
import { ShiftRow } from '@/components/staff/ShiftCard';
import { StaffShell } from '@/components/staff/StaffShell';
import { Button, Chips, Empty, Pill, Row, Screen, Section, Stat } from '@/components/staff/ui';
import { STAFFING_ROLE_LABEL } from '@/content/staff-types';
import { formatClockShort, formatDate, formatDateRange, formatDayShort, formatRelative, formatShiftRange } from '@/lib/staff/time';
import { decideCoverage } from '@/server/actions/staff/coverage';
import { decideTimeOffRequest } from '@/server/actions/staff/timeoff';
import { managerDashboard } from '@/server/staff/dashboard';
import { isDenied, staffPage } from '../_lib';

export const dynamic = 'force-dynamic';

/**
 * Today, for a manager. The owner sees every location; a manager their own.
 * Each number is a thing to do, and each is a link to where it is done.
 */
export default async function OperationsPage({ searchParams }: { searchParams: Promise<{ location?: string }> }) {
  const page = await staffPage('schedule.view_team');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const { location: locationParam } = await searchParams;
  const all = context.isOwner && locationParam === 'all';
  const chosen = locationParam && locationParam !== 'all' ? context.locations.find((entry) => entry.id === locationParam || entry.slug === locationParam) : null;
  const locations = all ? context.locations : [chosen ?? context.location];
  const dashboard = await managerDashboard(db, locations);
  const multi = context.locations.length > 1;

  return (
    <StaffShell context={context} unread={unread} wide>
      <Screen title={all ? 'All locations' : locations[0]!.name} eyebrow="Operations" lead={formatDate(dashboard.today)} actions={<Button href="/staff/operations/schedule" variant="primary">Build schedule</Button>}>
        {multi ? (
          <Chips
            items={[
              ...context.locations.map((location) => ({ href: `/staff/operations?location=${location.slug}`, label: location.shortName, active: !all && locations[0]!.id === location.id })),
              ...(context.isOwner ? [{ href: '/staff/operations?location=all', label: 'All', active: all }] : []),
            ]}
          />
        ) : null}

        {dashboard.days.map((day) => (
          <div key={day.location.id} className="grid gap-5">
            {all ? <h2 className="display text-[1.5rem] leading-none text-brown">{day.location.name}</h2> : null}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <Stat value={day.scheduled.length} label="scheduled today" href={`/staff/operations/schedule?location=${day.location.slug}`} />
              <Stat value={day.events.length} label={day.events.length === 1 ? 'event' : 'events'} href="/staff/events" />
              <Stat value={day.openShifts.length} label="open shifts" href={`/staff/operations/schedule?location=${day.location.slug}`} tone={day.openShifts.length ? 'warn' : undefined} />
              <Stat value={day.callOffs.length} label={day.callOffs.length === 1 ? 'call-off' : 'call-offs'} href="/staff/operations/coverage" tone={day.callOffs.length ? 'bad' : undefined} />
              <Stat value={day.overdueTasks.length} label="overdue tasks" href="/staff/operations/tasks" tone={day.overdueTasks.length ? 'warn' : undefined} />
              <Stat value={day.draftCount} label="unpublished shifts" href={`/staff/operations/schedule?location=${day.location.slug}`} tone={day.draftCount ? 'warn' : undefined} />
            </div>

            {day.events.length > 0 ? (
              <Section title="Tonight">
                <div className="grid gap-2">
                  {day.events.map((event) => (
                    <Link key={event.id} href={`/staff/events/${encodeURIComponent(event.id)}`} className="staff-panel block px-4 py-3.5 active:bg-brown/6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[1.0625rem] font-semibold text-brown">{event.title}</p>
                          <p className="mt-0.5 text-[0.875rem] text-brown-soft">
                            {event.doorsAt ? `Doors ${formatClockShort(event.doorsAt, day.location.timezone)}` : `Starts ${formatClockShort(event.startsAt, day.location.timezone)}`}
                            {event.ticketsSold !== null ? ` · ${event.ticketsSold} tickets sold` : ''}
                          </p>
                        </div>
                        {event.gaps.length > 0 ? <Pill tone="warn">{event.gaps.length} unfilled</Pill> : <Pill tone="good">Staffed</Pill>}
                      </div>
                      <ul className="mt-2 grid gap-0.5 text-[0.875rem] sm:grid-cols-2">
                        {event.staffing.map((entry, index) => (
                          <li key={index} className="text-brown">
                            <span className="text-success">✓</span> {STAFFING_ROLE_LABEL[entry.role]}: {entry.name}
                          </li>
                        ))}
                        {event.gaps.map((role) => (
                          <li key={role} className="text-warning">
                            ⚠ {STAFFING_ROLE_LABEL[role]} unassigned
                          </li>
                        ))}
                      </ul>
                    </Link>
                  ))}
                </div>
              </Section>
            ) : null}

            {day.scheduleIssues.length > 0 ? (
              <Section title="Schedule issues" count={day.scheduleIssues.length}>
                <div className="staff-panel px-4">
                  {day.scheduleIssues.map((shift) => (
                    <ShiftRow key={shift.id} shift={shift} href={`/staff/operations/schedule/shift/${shift.id}`} showEmployee showDate={false} />
                  ))}
                </div>
              </Section>
            ) : null}

            {day.checklists.length > 0 ? (
              <Section title="Checklists today">
                <div className="staff-panel px-4">
                  {day.checklists.map((run) => (
                    <Row key={run.id} href={`/staff/checklists/${run.id}`} title={run.title} detail={`${run.done} of ${run.total}${run.assignedEmployeeName ? ` · ${run.assignedEmployeeName}` : ''}`} trailing={run.status === 'verified' ? <Pill tone="good">Verified</Pill> : run.status === 'complete' ? <Pill tone="accent">Verify</Pill> : null} />
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        ))}

        {dashboard.pendingTimeOff.length > 0 ? (
          <Section title="Time-off requests" count={dashboard.pendingTimeOff.length} action={<Link href="/staff/operations/time-off" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            <div className="staff-panel px-4">
              {dashboard.pendingTimeOff.slice(0, 4).map((request) => (
                <div key={request.id} className="staff-row flex-wrap">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-semibold text-brown">
                      {request.employeeName} · {formatDateRange(request.startsOn, request.endsOn)}
                    </span>
                    <span className="block text-[0.8125rem] text-brown-soft">{request.reason ?? 'No reason given'} · {formatRelative(request.createdAt)}</span>
                  </span>
                  {request.employeeId !== context.employee?.id ? (
                    <span className="flex gap-2">
                      <OneTap action={decideTimeOffRequest} fields={{ id: request.id, decision: 'approved' }} variant="secondary">
                        Approve
                      </OneTap>
                      <OneTap action={decideTimeOffRequest} fields={{ id: request.id, decision: 'denied' }} variant="quiet">
                        Deny
                      </OneTap>
                    </span>
                  ) : (
                    <span className="text-[0.8125rem] text-brown-soft">Yours — another manager decides</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {dashboard.coverage.length > 0 ? (
          <Section title="Shift requests" count={dashboard.coverage.length} action={<Link href="/staff/operations/coverage" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            <div className="staff-panel px-4">
              {dashboard.coverage.slice(0, 4).map((request) => (
                <div key={request.id} className="staff-row flex-wrap">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-semibold text-brown">
                      {request.requestedByName} · {formatDayShort(request.shift.startsAt, request.shift.locationTimezone)} {formatShiftRange(request.shift.startsAt, request.shift.endsAt, request.shift.locationTimezone)} · {request.shift.positionName}
                    </span>
                    <span className="block text-[0.8125rem] text-brown-soft">{request.claimedByName ? `${request.claimedByName} wants it` : 'Nobody has claimed it yet'}</span>
                  </span>
                  {request.claimedBy || request.kind === 'give_up' ? (
                    <span className="flex gap-2">
                      <OneTap action={decideCoverage} fields={{ id: request.id, decision: 'approved' }} variant="secondary">
                        Approve
                      </OneTap>
                      <OneTap action={decideCoverage} fields={{ id: request.id, decision: 'denied' }} variant="quiet">
                        Deny
                      </OneTap>
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Training" action={<Link href="/staff/operations/training" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">Academy</Link>}>
            {dashboard.trainingOverdue.length === 0 ? (
              <p className="text-[0.875rem] text-brown-soft">{dashboard.trainingOutstanding ? `${dashboard.trainingOutstanding} in progress, none overdue.` : 'Everyone is caught up.'}</p>
            ) : (
              <div className="staff-panel px-4">
                {dashboard.trainingOverdue.slice(0, 5).map((assignment) => (
                  <Row key={assignment.id} href={`/staff/team/${assignment.employeeId}?tab=training`} title={`${assignment.employeeName} · ${assignment.module.title}`} detail={`Due ${assignment.dueOn}`} trailing={<Pill tone="bad">Overdue</Pill>} />
                ))}
              </div>
            )}
          </Section>
          <Section title="Documents" action={<Link href="/staff/operations/documents" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            {dashboard.documentsExpired.length + dashboard.documentsExpiring.length + dashboard.documentsSubmitted.length === 0 ? (
              <p className="text-[0.875rem] text-brown-soft">Nothing expiring, nothing waiting.</p>
            ) : (
              <div className="staff-panel px-4">
                {dashboard.documentsSubmitted.slice(0, 3).map((item) => (
                  <Row key={`${item.employeeId}-${item.type.id}`} href={`/staff/team/${item.employeeId}?tab=documents`} title={`${dashboard.employees.find((employee) => employee.id === item.employeeId)?.displayName ?? 'Employee'} · ${item.type.title}`} detail="Uploaded, needs verifying" trailing={<Pill tone="accent">Verify</Pill>} />
                ))}
                {dashboard.documentsExpired.slice(0, 3).map((item) => (
                  <Row key={`${item.employeeId}-${item.type.id}`} href={`/staff/team/${item.employeeId}?tab=documents`} title={`${dashboard.employees.find((employee) => employee.id === item.employeeId)?.displayName ?? 'Employee'} · ${item.type.title}`} detail={`Expired ${item.expiresOn}`} trailing={<Pill tone="bad">Expired</Pill>} />
                ))}
                {dashboard.documentsExpiring.slice(0, 3).map((item) => (
                  <Row key={`${item.employeeId}-${item.type.id}`} href={`/staff/team/${item.employeeId}?tab=documents`} title={`${dashboard.employees.find((employee) => employee.id === item.employeeId)?.displayName ?? 'Employee'} · ${item.type.title}`} detail={`Expires ${item.expiresOn}`} trailing={<Pill tone="warn">Expiring</Pill>} />
                ))}
              </div>
            )}
          </Section>
          <Section title="Onboarding" action={<Link href="/staff/operations/onboarding" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            {dashboard.onboarding.length === 0 ? (
              <p className="text-[0.875rem] text-brown-soft">No new hires in progress.</p>
            ) : (
              <div className="staff-panel px-4">
                {dashboard.onboarding.map((entry) => (
                  <Row key={entry.employee.id} href={`/staff/team/${entry.employee.id}?tab=onboarding`} title={entry.employee.displayName} detail={`${entry.complete} of ${entry.total} complete`} trailing={<Pill tone={entry.stage === 'ready' ? 'good' : entry.stage === 'in_progress' ? 'accent' : 'neutral'}>{entry.stage === 'ready' ? 'Ready' : entry.stage === 'in_progress' ? 'In progress' : 'Not started'}</Pill>} />
                ))}
              </div>
            )}
          </Section>
          <Section title="Contractors" action={<Link href="/staff/contractors" className="text-[0.8125rem] font-semibold text-brown-soft underline underline-offset-4">All</Link>}>
            {dashboard.contractorsUnpaid.length === 0 && dashboard.contractorsUpcoming.length === 0 ? (
              <p className="text-[0.875rem] text-brown-soft">No bookings coming up.</p>
            ) : (
              <div className="staff-panel px-4">
                {dashboard.contractorsUnpaid.slice(0, 3).map((booking) => (
                  <Row key={booking.id} href={`/staff/contractors/${booking.contractorId}`} title={`${booking.contractorName} · ${booking.eventTitle ?? booking.role}`} detail="Past booking, not fully paid" trailing={<Pill tone="warn">Unpaid</Pill>} />
                ))}
                {dashboard.contractorsUpcoming.slice(0, 4).map((booking) => (
                  <Row key={booking.id} href={`/staff/contractors/${booking.contractorId}`} title={`${booking.contractorName} · ${booking.eventTitle ?? booking.role}`} detail={booking.startsAt ? formatDayShort(booking.startsAt, context.location.timezone) : undefined} trailing={<Pill tone={booking.status === 'confirmed' ? 'good' : 'neutral'}>{booking.status}</Pill>} />
                ))}
              </div>
            )}
          </Section>
        </div>
        {dashboard.days.every((day) => day.events.length === 0 && day.scheduled.length === 0) ? <Empty title="A quiet day." detail="Nothing scheduled and no events. The schedule builder is one tap away." /> : null}
      </Screen>
    </StaffShell>
  );
}
