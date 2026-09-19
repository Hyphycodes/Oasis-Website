'use server';

import type { AttendanceStatus, ShiftStatus } from '@/content/staff-types';
import { addDays, formatDayShort, formatShiftRange, minutesFromClock, weekOf, zonedInstant } from '@/lib/staff/time';
import { recordOpsAudit } from '@/server/staff/audit';
import { withEmailDetails } from '@/server/staff/emails';
import { notify } from '@/server/staff/notifications';
import { claimOpenShift } from '@/server/staff/coverage';
import { clockIn, clockOut, copyWeek, correctAttendance, createShift, getShift, getShiftView, listShifts, publishWeek, repeatShift, setShiftStatus, updateShift, type ShiftInput } from '@/server/staff/schedule';
import { resolveLocation, locationMap } from '@/server/staff/locations';
import { fail, integer, isoDate, optional, runOps, savedOps, text, type ActionState } from './shared';

function shiftInputFrom(form: FormData): { input: ShiftInput; error: string | null } {
  const date = isoDate(optional(form, 'date'));
  const start = minutesFromClock(text(form, 'startTime'));
  const end = minutesFromClock(text(form, 'endTime'));
  const positionId = text(form, 'positionId');
  const locationId = text(form, 'locationId');
  if (!date) return { input: null as never, error: 'Pick a date.' };
  if (start === null || end === null) return { input: null as never, error: 'Enter a start and an end time.' };
  if (!positionId) return { input: null as never, error: 'Pick a position.' };
  if (!locationId) return { input: null as never, error: 'Pick a location.' };
  return {
    input: {
      locationId,
      employeeId: optional(form, 'employeeId'),
      positionId,
      date,
      startMinutes: start,
      endMinutes: end,
      eventId: optional(form, 'eventId'),
      note: optional(form, 'note'),
      status: (text(form, 'status') === 'published' ? 'published' : 'draft') as ShiftStatus,
    },
    error: null,
  };
}

async function tellEmployee(kind: 'shift_created' | 'shift_changed' | 'shift_cancelled', shiftId: string, note: string | null, wasEmployeeId: string | null = null): Promise<void> {
  const { opsReadDb } = await import('@/server/staff/db');
  const db = opsReadDb();
  if (!db) return;
  const view = await getShiftView(db, shiftId);
  if (!view) return;
  const when = `${formatDayShort(view.startsAt, view.locationTimezone)} · ${formatShiftRange(view.startsAt, view.endsAt, view.locationTimezone)}`;
  const targets = [view.employeeId, wasEmployeeId].filter((id): id is string => Boolean(id));
  if (targets.length === 0 || view.status === 'draft') return;
  const title = kind === 'shift_created' ? `New shift: ${when}` : kind === 'shift_cancelled' ? `Shift cancelled: ${when}` : `Shift changed: ${when}`;
  await notify(
    withEmailDetails(
      {
        employeeIds: targets,
        kind,
        title,
        body: note,
        href: '/staff/schedule',
        entityType: 'shift',
        entityId: shiftId,
        email: kind === 'shift_created' ? null : { subject: title, intro: kind === 'shift_cancelled' ? 'A manager cancelled one of your published shifts.' : 'A manager changed one of your published shifts.', cta: 'See my schedule' },
      },
      { details: [{ label: 'When', value: when }, { label: 'Position', value: view.positionName }, { label: 'Location', value: view.locationName }] },
    ),
  );
}

export async function saveShift(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const { input, error } = shiftInputFrom(form);
    if (error) return fail(error);
    const timezone = resolveLocation(await locationMap(db), input.locationId).timezone;
    const id = optional(form, 'id');
    const repeatWeeks = integer(form, 'repeatWeeks') ?? 0;
    if (id) {
      const { before, after } = await updateShift(db, id, input, timezone, context.staff);
      await recordOpsAudit(context.staff, 'shift.edited', 'shift', id, { before: before as never, after: after as never });
      if (after.status === 'published') {
        const changed = before.startsAt !== after.startsAt || before.endsAt !== after.endsAt || before.employeeId !== after.employeeId || before.positionId !== after.positionId;
        if (changed) await tellEmployee('shift_changed', id, after.note, before.employeeId !== after.employeeId ? before.employeeId : null);
      }
      return savedOps('Shift saved.');
    }
    if (repeatWeeks > 0) {
      const created = await repeatShift(db, input, Math.min(repeatWeeks, 26), timezone, context.staff);
      await recordOpsAudit(context.staff, 'shift.repeated', 'shift', created[0]?.id ?? null, { after: { count: created.length, ...input } as never });
      if (input.status === 'published') for (const shift of created) await tellEmployee('shift_created', shift.id, input.note);
      return savedOps(`${created.length} shifts added.`);
    }
    const shift = await createShift(db, input, timezone, context.staff);
    await recordOpsAudit(context.staff, 'shift.created', 'shift', shift.id, { after: shift as never });
    if (input.status === 'published') await tellEmployee('shift_created', shift.id, input.note);
    return savedOps(input.status === 'published' ? 'Shift published.' : 'Shift saved as a draft.');
  });
}

export async function cancelShift(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const id = text(form, 'id');
    const { before, after } = await setShiftStatus(db, id, 'cancelled', context.staff);
    await recordOpsAudit(context.staff, 'shift.cancelled', 'shift', id, { before: before as never, after: after as never });
    if (before.status === 'published') await tellEmployee('shift_cancelled', id, optional(form, 'reason'));
    return savedOps('Shift cancelled.');
  });
}

export async function publishSchedule(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const weekStart = isoDate(optional(form, 'weekStart'));
    const locationId = text(form, 'locationId');
    if (!weekStart || !locationId) return fail('Pick a week.');
    const location = resolveLocation(await locationMap(db), locationId);
    const from = zonedInstant(weekStart, 0, location.timezone);
    const to = zonedInstant(addDays(weekStart, 7), 0, location.timezone);
    const published = await publishWeek(db, locationId, from, to, context.staff);
    await recordOpsAudit(context.staff, 'schedule.published', 'schedule', `${locationId}:${weekStart}`, { after: { count: published.length } });
    if (published.length === 0) return savedOps('Nothing left to publish this week.');
    // One email per person, listing their shifts, rather than one per shift.
    const byEmployee = new Map<string, typeof published>();
    const all = await listShifts(db, { from, to, locationId });
    for (const shift of all) {
      if (!shift.employeeId) continue;
      byEmployee.set(shift.employeeId, [...(byEmployee.get(shift.employeeId) ?? []), shift]);
    }
    const week = weekOf(weekStart);
    const label = `${formatDayShort(zonedInstant(week[0]!, 12 * 60, location.timezone), location.timezone)} – ${formatDayShort(zonedInstant(week[6]!, 12 * 60, location.timezone), location.timezone)}`;
    const details = new Map<string, { headline: string; details: { label: string; value: string }[] }>();
    for (const [employeeId, shifts] of byEmployee) {
      details.set(employeeId, {
        headline: `Your schedule for ${label} is out.`,
        details: shifts.map((shift) => ({ label: formatDayShort(shift.startsAt, location.timezone), value: `${formatShiftRange(shift.startsAt, shift.endsAt, location.timezone)} · ${shift.positionId}` })),
      });
    }
    await notify(
      withEmailDetails(
        { employeeIds: [...byEmployee.keys()], kind: 'schedule_published', title: `Your schedule for ${label} is out`, href: '/staff/schedule', email: { subject: 'Schedule published', intro: `Your shifts for the week of ${label} at ${location.name}.`, cta: 'Open my schedule' } },
        details,
      ),
    );
    return savedOps(`${published.length} shifts published. Everyone scheduled has been told.`);
  });
}

export async function copySchedule(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const weekStart = isoDate(optional(form, 'weekStart'));
    const locationId = text(form, 'locationId');
    if (!weekStart || !locationId) return fail('Pick a week.');
    const location = resolveLocation(await locationMap(db), locationId);
    const copied = await copyWeek(db, locationId, weekStart, location.timezone, context.staff);
    await recordOpsAudit(context.staff, 'schedule.copied', 'schedule', `${locationId}:${weekStart}`, { after: { count: copied } });
    return savedOps(copied === 0 ? 'Nothing to copy from that week.' : `${copied} shifts copied to next week as drafts. Check them, then publish.`);
  });
}

export async function saveAttendance(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const id = text(form, 'id');
    const status = text(form, 'attendanceStatus') as AttendanceStatus;
    const { before, after } = await correctAttendance(db, id, {
      clockInAt: optional(form, 'clockInAt'),
      clockOutAt: optional(form, 'clockOutAt'),
      breakMinutes: integer(form, 'breakMinutes') ?? 0,
      attendanceStatus: ['not_tracked', 'on_time', 'late', 'absent', 'left_early', 'excused'].includes(status) ? status : 'not_tracked',
      note: optional(form, 'note'),
    }, context.staff);
    await recordOpsAudit(context.staff, 'attendance.corrected', 'shift', id, { before: before as never, after: after as never });
    return savedOps('Attendance saved.');
  });
}

/** The employee's own clock. Allowed from an hour before the shift until an hour after. */
export async function clockShift(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.view_self', async ({ db, context }) => {
    const employee = context.employee;
    if (!employee) return fail('Your account is not set up as an employee yet.');
    const shift = await getShift(db, text(form, 'id'));
    if (!shift || shift.employeeId !== employee.id) return fail('That shift is not yours.');
    const now = new Date();
    const direction = text(form, 'direction');
    if (direction === 'in') {
      if (shift.clockInAt) return fail('You are already clocked in.');
      if (now.getTime() < Date.parse(shift.startsAt) - 60 * 60_000) return fail('You can clock in from an hour before your shift.');
      await clockIn(db, shift, now);
      return savedOps('Clocked in. Have a good one.');
    }
    if (!shift.clockInAt) return fail('Clock in first.');
    if (shift.clockOutAt) return fail('You are already clocked out.');
    await clockOut(db, shift, now);
    return savedOps('Clocked out. Thanks for tonight.');
  });
}

export async function confirmFirstShift(): Promise<ActionState> {
  return runOps('schedule.view_self', async ({ db, context }) => {
    const employee = context.employee;
    if (!employee) return fail('Your account is not set up as an employee yet.');
    await db.update('employees', employee.id, { first_shift_confirmed_at: new Date().toISOString() });
    return savedOps('First shift confirmed. See you there.');
  });
}

export async function pickUpOpenShift(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('coverage.request', async ({ db, context }) => {
    const employee = context.employee;
    if (!employee) return fail('Your account is not set up as an employee yet.');
    const shift = await getShift(db, text(form, 'id'));
    if (!shift || shift.employeeId || shift.status !== 'published') return fail('That shift is no longer open.');
    if (!employee.positionIds.includes(shift.positionId)) return fail('That shift is for a position you are not set up for.');
    await claimOpenShift(db, employee.id, shift.id);
    return savedOps('Asked for it. A manager will confirm and it will show on your schedule.');
  });
}

export async function updateShiftStatus(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('schedule.manage', async ({ db, context }) => {
    const id = text(form, 'id');
    const status = text(form, 'status') as ShiftStatus;
    if (!['draft', 'published', 'cancelled'].includes(status)) return fail('Unknown status.');
    const { before, after } = await setShiftStatus(db, id, status, context.staff);
    await recordOpsAudit(context.staff, `shift.${status}`, 'shift', id, { before: before as never, after: after as never });
    if (status === 'published' && before.status !== 'published') await tellEmployee('shift_created', id, after.note);
    if (status === 'cancelled' && before.status === 'published') await tellEmployee('shift_cancelled', id, null);
    return savedOps(status === 'published' ? 'Published.' : status === 'cancelled' ? 'Cancelled.' : 'Back to draft.');
  });
}
