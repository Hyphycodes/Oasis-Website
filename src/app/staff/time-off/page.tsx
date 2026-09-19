import { ActionForm, Field, OneTap, SubmitButton, TextArea, TextInput } from '@/components/staff/forms';
import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Empty, Pill, Screen, Section } from '@/components/staff/ui';
import { formatDateRange, formatRelative } from '@/lib/staff/time';
import { cancelTimeOff, submitTimeOff } from '@/server/actions/staff/timeoff';
import { listTimeOff } from '@/server/staff/timeoff';
import { isDenied, staffPage } from '../_lib';

export const dynamic = 'force-dynamic';

const TONE = { pending: 'accent', approved: 'good', denied: 'bad', cancelled: 'neutral' } as const;

export default async function TimeOffPage() {
  const page = await staffPage('timeoff.request');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const employee = context.employee;
  const requests = employee ? await listTimeOff(db, { employeeId: employee.id }) : [];
  const today = new Date().toISOString().slice(0, 10);

  return (
    <StaffShell context={context} unread={unread}>
      <Back href="/staff/schedule" label="Schedule" />
      <Screen title="Time off">
        <Section title="Request time off">
          <div className="staff-panel px-4 py-4">
            <ActionForm action={submitTimeOff} className="grid gap-4 sm:grid-cols-2">
              {(state) => (
                <>
                  <Field id="startsOn" label="First day" error={state.errors?.startsOn}>
                    <TextInput id="startsOn" name="startsOn" type="date" min={today} required />
                  </Field>
                  <Field id="endsOn" label="Last day" hint="Same as the first for one day." error={state.errors?.endsOn}>
                    <TextInput id="endsOn" name="endsOn" type="date" min={today} />
                  </Field>
                  <Field id="reason" label="Reason" hint="Optional.">
                    <TextInput id="reason" name="reason" maxLength={120} placeholder="Wedding, travel, appointment…" />
                  </Field>
                  <Field id="note" label="Anything else" hint="Optional.">
                    <TextArea id="note" name="note" rows={2} maxLength={500} />
                  </Field>
                  <div className="sm:col-span-2">
                    <SubmitButton>Send request</SubmitButton>
                  </div>
                </>
              )}
            </ActionForm>
          </div>
        </Section>
        <Section title="Your requests" count={requests.length}>
          {requests.length === 0 ? (
            <Empty title="No requests yet." />
          ) : (
            <div className="staff-panel px-4">
              {requests.map((request) => (
                <div key={request.id} className="staff-row">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.9375rem] font-semibold text-brown">{formatDateRange(request.startsOn, request.endsOn)}</span>
                    <span className="block text-[0.8125rem] text-brown-soft">
                      {request.reason ?? 'No reason given'} · asked {formatRelative(request.createdAt)}
                    </span>
                    {request.decisionNote ? <span className="mt-1 block text-[0.875rem] text-brown">“{request.decisionNote}”</span> : null}
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Pill tone={TONE[request.status]}>{request.status}</Pill>
                    {request.status === 'pending' ? (
                      <OneTap action={cancelTimeOff} fields={{ id: request.id }} variant="quiet" quiet>
                        Withdraw
                      </OneTap>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </Screen>
    </StaffShell>
  );
}
