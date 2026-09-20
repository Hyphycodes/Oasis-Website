import type { Row } from '@/lib/db/types';
import { LOCKPORT_LOCATION_ID } from './locations';

/**
 * Working at Oasis.
 *
 * An opening is admin-managed data (migration 0026). This module is the typed
 * side of it: the shape the site reads, the labels, and the starter roles the
 * database ships with — every one of them switched OFF.
 *
 * Nothing here claims Oasis is hiring. The public page shows only the openings
 * somebody has turned on, and says so plainly when that list is empty, because
 * a careers page advertising nine roles a restaurant is not filling is the same
 * dishonesty as an event flyer with last year's date on it.
 */

export type EmploymentType = 'full_time' | 'part_time' | 'either' | 'seasonal';

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  either: 'Full or part-time',
  seasonal: 'Seasonal',
};

export const EMPLOYMENT_TYPES: EmploymentType[] = ['either', 'full_time', 'part_time', 'seasonal'];

export interface JobOpening {
  id: string;
  locationId: string | null;
  title: string;
  /** One sentence under the title, or null. Never invented. */
  summary: string | null;
  employmentType: EmploymentType;
  active: boolean;
  sort: number;
  archivedAt: string | null;
}

export type ApplicationStatus =
  | 'new'
  | 'reviewing'
  | 'contacted'
  | 'interview'
  | 'hired'
  | 'passed'
  | 'archived';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'new',
  'reviewing',
  'contacted',
  'interview',
  'hired',
  'passed',
  'archived',
];

/** Plain words. "Passed" is the kindest honest label for a no. */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  contacted: 'Contacted',
  interview: 'Interview',
  hired: 'Hired',
  passed: 'Passed',
  archived: 'Archived',
};

export interface JobApplication {
  id: string;
  reference: string;
  openingId: string | null;
  position: string;
  locationId: string | null;
  name: string;
  email: string;
  phone: string | null;
  availability: string | null;
  experience: string | null;
  resumePath: string | null;
  resumeName: string | null;
  notes: string | null;
  status: ApplicationStatus;
  staffNotes: string | null;
  createdAt: string;
}

/**
 * What somebody picks when nothing on the list is their job.
 *
 * It is not stored as an opening — it is the absence of one — so it lives here
 * as a constant both the form and the server agree on.
 */
export const OPEN_APPLICATION = 'Something else';

export function employmentLabel(type: EmploymentType): string {
  return EMPLOYMENT_LABEL[type] ?? EMPLOYMENT_LABEL.either;
}

/**
 * The roles the database starts with, all inactive.
 *
 * Titles only: the sentence under each one is the restaurant's to write, and a
 * plausible-sounding description written here would be a claim about a job
 * nobody at Oasis has described. Mirrors the insert at the end of migration
 * 0026 — same ids, so seeding twice changes nothing.
 */
export const staticJobOpenings: JobOpening[] = [
  ['0a515000-0000-4000-8000-000000000101', 'Server', 'either', 10],
  ['0a515000-0000-4000-8000-000000000102', 'Bartender', 'either', 20],
  ['0a515000-0000-4000-8000-000000000103', 'Host', 'part_time', 30],
  ['0a515000-0000-4000-8000-000000000104', 'Line cook', 'full_time', 40],
  ['0a515000-0000-4000-8000-000000000105', 'Prep cook', 'either', 50],
  ['0a515000-0000-4000-8000-000000000106', 'Busser', 'part_time', 60],
  ['0a515000-0000-4000-8000-000000000107', 'Dishwasher', 'either', 70],
  ['0a515000-0000-4000-8000-000000000108', 'Door / security', 'part_time', 80],
  ['0a515000-0000-4000-8000-000000000109', 'Event staff', 'part_time', 90],
].map(([id, title, employmentType, sort]) => ({
  id: String(id),
  locationId: LOCKPORT_LOCATION_ID,
  title: String(title),
  summary: null,
  employmentType: employmentType as EmploymentType,
  active: false,
  sort: Number(sort),
  archivedAt: null,
}));

/** The same rows as database rows, for the local database and the SQL seed. */
export const REFERENCE_JOB_OPENINGS: Row[] = staticJobOpenings.map((opening) => ({
  id: opening.id,
  location_id: opening.locationId,
  title: opening.title,
  summary: opening.summary,
  employment_type: opening.employmentType,
  active: opening.active,
  sort: opening.sort,
}));
