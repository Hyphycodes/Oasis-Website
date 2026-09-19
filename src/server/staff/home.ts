import 'server-only';

import type { ChecklistRun, ShiftRequest, ShiftView, StaffAnnouncement, Task, TrainingAssignment } from '@/content/staff-types';
import type { Db } from '@/lib/db/types';
import { addDays, zonedDate, zonedInstant, zonedParts } from '@/lib/staff/time';
import { feedFor } from './announcements';
import { listRuns } from './checklists';
import { listShiftRequests } from './coverage';
import { listEventsBetween, type EventSummaryLite } from './events';
import { getSalesSummaries } from '@/server/ticketing/sales';
import { onboardingFor } from './requirements';
import { listShiftViews } from './schedule';
import type { StaffContext } from './session';
import { listTasks } from './tasks';
import { listAssignments, outstanding } from './training';
import { unreadCount } from './notifications';

/**
 * Everything the employee home screen answers, in one read.
 *
 *   Am I working today? What time, where, what position?
 *   What is on at Oasis today? Is there an event tonight?
 *   Is there anything I need to complete? Anything new?
 */
export interface StaffHome {
  greeting: string;
  today: string;
  todayShifts: ShiftView[];
  nextShift: ShiftView | null;
  upcoming: ShiftView[];
  tonight: (EventSummaryLite & { ticketsSold: number | null; myRole: string | null })[];
  tasks: Task[];
  announcements: StaffAnnouncement[];
  training: TrainingAssignment[];
  checklists: ChecklistRun[];
  openShifts: ShiftView[];
  coverage: ShiftRequest[];
  onboarding: { total: number; complete: number; stage: 'not_started' | 'in_progress' | 'ready' } | null;
  unreadNotifications: number;
  /** Shifts changed since the employee's last visit are surfaced as notifications; this is the count. */
  scheduleChanged: boolean;
}

export async function staffHome(db: Db, context: StaffContext, now = new Date()): Promise<StaffHome> {
  const timezone = context.location.timezone;
  const today = zonedDate(now, timezone);
  const hour = zonedParts(now, timezone).hour;
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const employee = context.employee;
  const dayStart = zonedInstant(today, 0, timezone);
  const dayEnd = zonedInstant(addDays(today, 1), 0, timezone);
  const horizon = zonedInstant(addDays(today, 14), 0, timezone);

  const [myShifts, events, tasks, announcements, training, checklists, openShifts, coverage, onboarding, unread] = await Promise.all([
    employee ? listShiftViews(db, { from: dayStart, to: horizon, employeeId: employee.id }) : Promise.resolve([] as ShiftView[]),
    listEventsBetween(db, dayStart, dayEnd, context.location.id),
    employee ? listTasks(db, { assignedTo: employee.id, open: true }, now) : Promise.resolve([] as Task[]),
    employee ? feedFor(db, employee, now) : Promise.resolve([] as StaffAnnouncement[]),
    employee ? listAssignments(db, { employeeId: employee.id, today }) : Promise.resolve([] as TrainingAssignment[]),
    employee ? listRuns(db, { onDate: today }) : Promise.resolve([] as ChecklistRun[]),
    listShiftViews(db, { from: dayStart, to: horizon, locationId: context.location.id, openOnly: true }),
    employee ? listShiftRequests(db, { status: ['open', 'claimed'] }) : Promise.resolve([] as ShiftRequest[]),
    employee && !employee.onboardingCompletedAt ? onboardingFor(db, employee.id, { today }) : Promise.resolve(null),
    employee ? unreadCount(db, employee.id) : Promise.resolve(0),
  ]);

  const sales = await getSalesSummaries(events.map((event) => event.id));
  const todayShifts = myShifts.filter((shift) => zonedDate(shift.startsAt, timezone) === today || (Date.parse(shift.startsAt) <= now.getTime() && Date.parse(shift.endsAt) > now.getTime()));
  const later = myShifts.filter((shift) => !todayShifts.includes(shift));
  const myEventIds = new Set(myShifts.map((shift) => shift.eventId).filter(Boolean));

  return {
    greeting,
    today,
    todayShifts,
    nextShift: todayShifts.find((shift) => Date.parse(shift.endsAt) > now.getTime()) ?? later[0] ?? null,
    upcoming: later.slice(0, 6),
    tonight: events.map((event) => ({
      ...event,
      ticketsSold: sales.get(event.id)?.ticketsSold ?? null,
      myRole: myEventIds.has(event.id) ? (myShifts.find((shift) => shift.eventId === event.id)?.positionName ?? null) : null,
    })),
    tasks: tasks.slice(0, 5),
    announcements: announcements.filter((entry) => (entry.requiresAck ? !entry.acknowledgedAt : !entry.readAt)).slice(0, 3),
    training: outstanding(training).slice(0, 4),
    checklists: checklists.filter((run) => run.status === 'open' && (run.assignedEmployeeId === employee?.id || (!run.assignedEmployeeId && (!run.locationId || run.locationId === context.location.id)))),
    openShifts: openShifts.filter((shift) => employee?.positionIds.includes(shift.positionId) ?? false).slice(0, 4),
    coverage: coverage.filter((request) => request.requestedBy !== employee?.id && request.status === 'open' && (employee?.positionIds.includes(request.shift.positionId) ?? false)).slice(0, 3),
    onboarding: onboarding ? { total: onboarding.total, complete: onboarding.complete, stage: onboarding.stage } : null,
    unreadNotifications: unread,
    scheduleChanged: false,
  };
}
