import 'server-only';

import type { Db } from '@/lib/db/types';
import { listContractors } from './contractors';
import { listEmployees } from './employees';
import { listEventsBetween } from './events';
import { listEventAssignments } from './staffing';

/**
 * One search box for a manager: people, phones, emails, positions,
 * contractors, and who is working an upcoming event.
 */
export interface SearchHit {
  kind: 'employee' | 'contractor' | 'event';
  id: string;
  title: string;
  detail: string;
  href: string;
}

export async function staffSearch(db: Db, query: string, now = new Date()): Promise<SearchHit[]> {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  const [employees, contractors, events] = await Promise.all([
    listEmployees(db, { query: needle, includeInactive: true }),
    listContractors(db, { query: needle, includeInactive: true }),
    listEventsBetween(db, now.toISOString(), new Date(now.getTime() + 60 * 86_400_000).toISOString()),
  ]);
  const hits: SearchHit[] = employees.slice(0, 8).map((employee) => ({
    kind: 'employee',
    id: employee.id,
    title: employee.fullName || employee.displayName,
    detail: [employee.positionIds.join(', '), employee.phone, employee.email].filter(Boolean).join(' · '),
    href: `/staff/team/${employee.id}`,
  }));
  for (const contractor of contractors.slice(0, 5)) {
    hits.push({ kind: 'contractor', id: contractor.id, title: contractor.name, detail: [contractor.serviceType, contractor.phone, contractor.email].filter(Boolean).join(' · '), href: `/staff/contractors/${contractor.id}` });
  }
  for (const event of events) {
    const matchesTitle = event.title.toLowerCase().includes(needle);
    const assignments = matchesTitle ? [] : await listEventAssignments(db, event.id);
    const matchesStaff = assignments.some((assignment) => assignment.employeeName.toLowerCase().includes(needle));
    if (matchesTitle || matchesStaff) {
      hits.push({ kind: 'event', id: event.id, title: event.title, detail: matchesStaff ? `Staffed by ${assignments.filter((a) => a.employeeName.toLowerCase().includes(needle)).map((a) => a.employeeName).join(', ')}` : event.startsAt.slice(0, 10), href: `/staff/events/${encodeURIComponent(event.id)}` });
    }
  }
  return hits;
}
