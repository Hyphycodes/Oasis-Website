'use server';

import type { IncidentCategory } from '@/content/staff-types';
import { recordOpsAudit } from '@/server/staff/audit';
import { saveIncident } from '@/server/staff/incidents';
import { employeeFilePath, fileProblem, storeEmployeeFile } from '@/server/staff/storage';
import { fail, list, optional, runOps, savedOps, text, type ActionState } from './shared';

const CATEGORIES: IncidentCategory[] = ['guest', 'injury', 'security', 'equipment', 'payment', 'alcohol', 'other'];

export async function saveIncidentAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  return runOps('incidents.manage', async ({ db, context }) => {
    const summary = text(form, 'summary');
    if (!summary) return fail('Say what happened in one line.');
    const category = text(form, 'category') as IncidentCategory;
    const followUp = text(form, 'followUpStatus');
    const occurredAt = optional(form, 'occurredAt') ?? new Date().toISOString();
    const attachments: string[] = [];
    for (const file of form.getAll('attachments')) {
      if (!(file instanceof File) || file.size === 0) continue;
      const problem = fileProblem(file);
      if (problem) return fail(problem);
      const stored = await storeEmployeeFile(employeeFilePath('house', 'incidents', file.name), file);
      if ('error' in stored) return fail(stored.error);
      attachments.push(stored.path);
    }
    const id = optional(form, 'id');
    const { before, after } = await saveIncident(db, id, {
      occurredAt: occurredAt.length === 16 ? new Date(occurredAt).toISOString() : occurredAt,
      locationId: optional(form, 'locationId') ?? context.location.id,
      eventId: optional(form, 'eventId'),
      category: CATEGORIES.includes(category) ? category : 'other',
      summary,
      description: optional(form, 'description'),
      actionsTaken: optional(form, 'actionsTaken'),
      followUpStatus: ['open', 'monitoring', 'closed'].includes(followUp) ? (followUp as 'open' | 'monitoring' | 'closed') : 'open',
      employeeIds: list(form, 'employeeIds'),
      attachmentPaths: attachments,
    }, context.staff);
    await recordOpsAudit(context.staff, id ? 'incident.edited' : 'incident.recorded', 'incident', String(after.id), { before, after: { ...after, description: undefined, actions_taken: undefined } });
    return { ...savedOps(id ? 'Incident updated.' : 'Incident recorded.'), affected: [`/staff/incidents/${String(after.id)}`] };
  });
}
