import { StaffShell } from '@/components/staff/StaffShell';
import { Button, Chips, Empty, Pill, Row, Screen, Section } from '@/components/staff/ui';
import { formatRelative } from '@/lib/staff/time';
import { listRuns } from '@/server/staff/checklists';
import { listTasks } from '@/server/staff/tasks';
import { zonedDate } from '@/lib/staff/time';
import { isDenied, staffPage } from '../_lib';

export const dynamic = 'force-dynamic';

/** My tasks, fast: open first, overdue at the top, done folded away. */
export default async function TasksPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const page = await staffPage('tasks.view_self');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const { show } = await searchParams;
  const employee = context.employee;
  const now = new Date();
  const [tasks, runs] = await Promise.all([
    employee ? listTasks(db, { assignedTo: employee.id, includeDone: true }, now) : Promise.resolve([]),
    listRuns(db, { onDate: zonedDate(now, context.location.timezone), locationId: context.location.id }),
  ]);
  const open = tasks.filter((task) => task.status !== 'done');
  const done = tasks.filter((task) => task.status === 'done');
  const shown = show === 'done' ? done : open;
  const checklists = runs.filter((run) => !run.assignedEmployeeId || run.assignedEmployeeId === employee?.id);

  return (
    <StaffShell context={context} unread={unread}>
      <Screen title="Tasks" actions={context.isManager ? <Button href="/staff/operations/tasks/new" variant="primary">New task</Button> : undefined}>
        <Chips
          items={[
            { href: '/staff/tasks', label: 'Open', active: show !== 'done', count: open.length },
            { href: '/staff/tasks?show=done', label: 'Done', active: show === 'done', count: done.length },
            ...(context.isManager ? [{ href: '/staff/operations/tasks', label: 'Everyone’s', active: false }] : []),
          ]}
        />
        {checklists.length > 0 ? (
          <Section title="Checklists today">
            <div className="staff-panel px-4">
              {checklists.map((run) => (
                <Row key={run.id} href={`/staff/checklists/${run.id}`} title={run.title} detail={`${run.done} of ${run.total} done`} trailing={run.status !== 'open' ? <Pill tone="good">{run.status === 'verified' ? 'Verified' : 'Complete'}</Pill> : null} icon="check" />
              ))}
            </div>
          </Section>
        ) : null}
        <Section title={show === 'done' ? 'Done' : 'Open'}>
          {shown.length === 0 ? (
            <Empty title={show === 'done' ? 'Nothing finished yet.' : 'No open tasks.'} detail={show === 'done' ? undefined : 'Nothing needs you right now.'} />
          ) : (
            <div className="staff-panel px-4">
              {shown.map((task) => (
                <Row
                  key={task.id}
                  href={`/staff/tasks/${task.id}`}
                  title={task.title}
                  detail={[task.dueAt ? `Due ${formatRelative(task.dueAt)}` : null, task.eventTitle, task.assignedByName ? `from ${task.assignedByName}` : null].filter(Boolean).join(' · ')}
                  trailing={
                    task.status === 'done' ? <Pill tone="good">Done</Pill> : task.overdue ? <Pill tone="bad">Overdue</Pill> : task.status === 'blocked' ? <Pill tone="warn">Blocked</Pill> : task.status === 'in_progress' ? <Pill tone="accent">In progress</Pill> : task.priority === 'urgent' ? <Pill tone="bad">Urgent</Pill> : task.priority === 'high' ? <Pill tone="warn">High</Pill> : null
                  }
                />
              ))}
            </div>
          )}
        </Section>
      </Screen>
    </StaffShell>
  );
}
