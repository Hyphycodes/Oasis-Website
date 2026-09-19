import { IncidentForm } from '@/components/staff/manage/MoreForms';
import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Screen } from '@/components/staff/ui';
import { listEmployees } from '@/server/staff/employees';
import { eventOptionsFor, isDenied, staffPage } from '../../_lib';

export const dynamic = 'force-dynamic';

export default async function NewIncidentPage() {
  const page = await staffPage('incidents.manage');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const [employees, events] = await Promise.all([listEmployees(db, { includeInactive: true }), eventOptionsFor(db, context.location.timezone, 30)]);
  return (
    <StaffShell context={context} unread={unread}>
      <Back href="/staff/incidents" label="Incidents" />
      <Screen title="Record an incident" lead="Facts, in order, while they are fresh. Attachments are stored privately.">
        <IncidentForm incident={null} employees={employees} locations={context.locations} events={events} defaultLocationId={context.location.id} />
      </Screen>
    </StaffShell>
  );
}
