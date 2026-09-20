import 'server-only';

import type { StaffNotification } from '@/content/staff-types';
import type { Db, Row } from '@/lib/db/types';
import { opsElevatedDb } from './db';

/**
 * The notification centre, and the one function that feeds it.
 *
 * `notify()` writes an in-app notification for each employee and, for the
 * kinds that deserve an inbox — a schedule going out, a decision on time
 * off, a new required training, an event assignment — hands an email to
 * the Oasis email service through `src/server/staff/emails.ts`. Push and
 * SMS are the same call with another channel later: nothing that raises a
 * notification knows how it is delivered.
 *
 * A notification never fails the action that raised it. A lost "your shift
 * changed" is logged and moved past; a lost shift is not acceptable.
 */

export type NotificationKind =
  | 'shift_created'
  | 'shift_changed'
  | 'shift_cancelled'
  | 'schedule_published'
  | 'time_off_decided'
  | 'swap_requested'
  | 'swap_claimed'
  | 'swap_decided'
  | 'training_assigned'
  | 'training_due'
  | 'document_expiring'
  | 'document_verified'
  | 'task_assigned'
  | 'task_mentioned'
  | 'announcement'
  | 'event_assignment'
  | 'incident_reported'
  | 'welcome';

export interface NotificationInput {
  employeeIds: string[];
  kind: NotificationKind;
  title: string;
  body?: string | null;
  href?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  /** Ask the email channel to carry this too. The service still decides. */
  email?: { subject: string; intro: string; cta: string } | null;
}

export interface NotificationChannel {
  deliver(notification: NotificationInput, employeeId: string): Promise<void>;
}

const channels: NotificationChannel[] = [];

/** Registered once at import by `emails.ts`; a push channel registers the same way. */
export function registerNotificationChannel(channel: NotificationChannel): void {
  if (!channels.includes(channel)) channels.push(channel);
}

export async function notify(input: NotificationInput): Promise<void> {
  // The email channel registers itself on import; importing lazily keeps the
  // email service out of every read path that only lists notifications.
  await import('./emails');
  const ids = [...new Set(input.employeeIds.filter(Boolean))];
  if (ids.length === 0) return;
  const db = opsElevatedDb();
  for (const employeeId of ids) {
    try {
      await db?.insert('staff_notifications', {
        employee_id: employeeId,
        kind: input.kind,
        title: input.title,
        body: input.body ?? null,
        href: input.href ?? null,
        entity_type: input.entityType ?? null,
        entity_id: input.entityId ?? null,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(`[notify] ${input.kind} for ${employeeId}: ${error instanceof Error ? error.message : String(error)}`);
    }
    for (const channel of channels) {
      try {
        await channel.deliver(input, employeeId);
      } catch (error) {
        console.warn(`[notify:channel] ${input.kind} for ${employeeId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

export function notificationFromRow(row: Row): StaffNotification {
  return {
    id: String(row.id),
    kind: String(row.kind),
    title: String(row.title),
    body: (row.body as string | null) ?? null,
    href: (row.href as string | null) ?? null,
    readAt: (row.read_at as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

export async function listNotifications(db: Db, employeeId: string, limit = 40): Promise<StaffNotification[]> {
  const rows = await db.list<Row>('staff_notifications', { where: { employee_id: employeeId }, orderBy: 'created_at', desc: true, limit });
  return rows.map(notificationFromRow);
}

export async function unreadCount(db: Db, employeeId: string): Promise<number> {
  const rows = await db.list<Row>('staff_notifications', { where: { employee_id: employeeId, read_at: null } });
  return rows.length;
}

export async function markNotificationsRead(db: Db, employeeId: string, ids: string[] | 'all'): Promise<void> {
  const rows = await db.list<Row>('staff_notifications', { where: { employee_id: employeeId, read_at: null } });
  const now = new Date().toISOString();
  for (const row of rows) {
    if (ids === 'all' || ids.includes(String(row.id))) await db.update('staff_notifications', String(row.id), { read_at: now });
  }
}
