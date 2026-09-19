import { StaffShell } from '@/components/staff/StaffShell';
import { Back, Button, Empty, Pill, Row, Screen, Section } from '@/components/staff/ui';
import { listAssignments, listModules, outstanding } from '@/server/staff/training';
import { isDenied, staffPage } from '../../_lib';

export const dynamic = 'force-dynamic';

/** The academy, for management: every module, how many are cleared, who is behind. */
export default async function AcademyPage() {
  const page = await staffPage('training.manage');
  if (isDenied(page)) return page.denied;
  const { context, db, unread } = page;
  const [modules, assignments] = await Promise.all([listModules(db, { includeDrafts: true }), listAssignments(db)]);
  const overdue = outstanding(assignments).filter((assignment) => assignment.overdue);
  return (
    <StaffShell context={context} unread={unread} wide>
      <Back href="/staff/operations" label="Operations" />
      <Screen title="Academy" lead={`${modules.filter((lesson) => lesson.status === 'published').length} published modules.`} actions={<Button href="/staff/operations/training/new" variant="primary">New module</Button>}>
        {overdue.length > 0 ? (
          <Section title="Overdue" count={overdue.length}>
            <div className="staff-panel px-4">
              {overdue.map((assignment) => (
                <Row key={assignment.id} href={`/staff/team/${assignment.employeeId}?tab=training`} title={`${assignment.employeeName} · ${assignment.module.title}`} detail={`Due ${assignment.dueOn}`} trailing={<Pill tone="bad">Overdue</Pill>} />
              ))}
            </div>
          </Section>
        ) : null}
        <Section title="Modules" count={modules.length}>
          {modules.length === 0 ? <Empty title="No modules yet." detail="Create the first one — Welcome to Oasis is a good start." /> : (
            <div className="staff-panel px-4">
              {modules.map((lesson) => {
                const mine = assignments.filter((assignment) => assignment.moduleId === lesson.id);
                const cleared = mine.filter((assignment) => assignment.status === 'completed' && !assignment.outdated).length;
                return (
                  <Row
                    key={lesson.id}
                    href={`/staff/operations/training/${lesson.id}`}
                    title={lesson.title}
                    detail={`${lesson.category.replace('_', ' ')} · v${lesson.version}${lesson.hasQuiz ? ` · quiz, pass ${lesson.passingScore}%` : ''}${lesson.appliesToPositions.length ? ` · ${lesson.appliesToPositions.join(', ')}` : ''}`}
                    meta={mine.length ? `${cleared} of ${mine.length} cleared` : 'Not assigned to anyone'}
                    trailing={
                      <span className="flex gap-1">
                        {lesson.required ? <Pill tone="accent">Required</Pill> : null}
                        {lesson.status !== 'published' ? <Pill tone={lesson.status === 'draft' ? 'neutral' : 'bad'}>{lesson.status}</Pill> : null}
                      </span>
                    }
                  />
                );
              })}
            </div>
          )}
        </Section>
      </Screen>
    </StaffShell>
  );
}
