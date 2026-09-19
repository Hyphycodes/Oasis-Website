'use client';

import type { EmployeeSummary, LocationSummary, Position, ShiftView } from '@/content/staff-types';
import { clockFromMinutes, zonedDate, zonedMinutes } from '@/lib/staff/time';
import { cancelShift, saveShift } from '@/server/actions/staff/schedule';
import { ActionForm, Field, OneTap, Select, SubmitButton, TextArea, TextInput } from '@/components/staff/forms';

export interface EventOption {
  id: string;
  label: string;
}

/** Create or edit one shift. Repeating is a number of further weeks; copying a week is on the builder. */
export function ShiftForm({ shift, date, employees, positions, locations, events, defaultLocationId, defaultEmployeeId }: { shift: ShiftView | null; date: string; employees: EmployeeSummary[]; positions: Position[]; locations: LocationSummary[]; events: EventOption[]; defaultLocationId: string; defaultEmployeeId?: string | null }) {
  const timezone = shift?.locationTimezone ?? locations.find((location) => location.id === defaultLocationId)?.timezone ?? 'America/Chicago';
  const employeeId = shift?.employeeId ?? defaultEmployeeId ?? '';
  const eligible = (position: string) => employees.filter((employee) => employee.positionIds.includes(position));
  return (
    <div className="grid gap-6">
      <ActionForm action={saveShift} className="grid gap-4 sm:grid-cols-2">
        {shift ? <input type="hidden" name="id" value={shift.id} /> : null}
        <Field id="employeeId" label="Who" hint="Leave open to publish an open shift anyone eligible can pick up.">
          <Select id="employeeId" name="employeeId" defaultValue={employeeId}>
            <option value="">Open shift</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.displayName} · {employee.positionIds.join(', ')}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="positionId" label="Position">
          <Select id="positionId" name="positionId" defaultValue={shift?.positionId ?? positions[0]?.id ?? ''} required>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
                {eligible(position.id).length ? ` (${eligible(position.id).length})` : ''}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="date" label="Date">
          <TextInput id="date" name="date" type="date" defaultValue={shift ? zonedDate(shift.startsAt, timezone) : date} required />
        </Field>
        <Field id="locationId" label="Location">
          <Select id="locationId" name="locationId" defaultValue={shift?.locationId ?? defaultLocationId} required>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="startTime" label="Start">
          <TextInput id="startTime" name="startTime" type="time" defaultValue={shift ? clockFromMinutes(zonedMinutes(shift.startsAt, timezone)) : '17:00'} required />
        </Field>
        <Field id="endTime" label="End" hint="An end at or before the start means the next morning.">
          <TextInput id="endTime" name="endTime" type="time" defaultValue={shift ? clockFromMinutes(zonedMinutes(shift.endsAt, timezone)) : '01:00'} required />
        </Field>
        <Field id="eventId" label="Related event" hint="Optional. Shows on the employee’s shift.">
          <Select id="eventId" name="eventId" defaultValue={shift?.eventId ?? ''}>
            <option value="">None</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field id="status" label="Publish">
          <Select id="status" name="status" defaultValue={shift?.status === 'published' ? 'published' : shift?.status === 'cancelled' ? 'draft' : 'draft'}>
            <option value="draft">Save as a draft</option>
            <option value="published">Publish now (tells the employee)</option>
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field id="note" label="Note for the employee" hint="Optional.">
            <TextArea id="note" name="note" rows={2} maxLength={300} defaultValue={shift?.note ?? ''} />
          </Field>
        </div>
        {!shift ? (
          <Field id="repeatWeeks" label="Repeat weekly" hint="How many more weeks. 0 = just this one.">
            <TextInput id="repeatWeeks" name="repeatWeeks" type="number" min={0} max={26} defaultValue={0} inputMode="numeric" />
          </Field>
        ) : null}
        <div className="flex items-end sm:col-span-2">
          <SubmitButton>{shift ? 'Save shift' : 'Add shift'}</SubmitButton>
        </div>
      </ActionForm>
      {shift && shift.status !== 'cancelled' ? (
        <div className="border-t border-brown/12 pt-4">
          <OneTap action={cancelShift} fields={{ id: shift.id }} variant="danger" confirm="Cancel this shift? The employee will be told.">
            Cancel shift
          </OneTap>
        </div>
      ) : null}
    </div>
  );
}
