/**
 * Where Oasis operates.
 *
 * The database has a `locations` table (migration 0022) and every operational
 * record — a shift, a task, an event, an incident — can point at one. This
 * module is the typed fallback the site and the staff app use when the
 * database is unavailable or a row has no location yet: Lockport, the first
 * and so far only Oasis. Adding Joliet is a row, not a code change.
 */

export interface Location {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  street: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  timezone: string;
  phone: string | null;
  active: boolean;
  sort: number;
}

/** The id migration 0022 gives Lockport. Fixed so seeds and tests can refer to it. */
export const LOCKPORT_LOCATION_ID = '0a515000-0000-4000-8000-000000000001';

export const lockport: Location = {
  id: LOCKPORT_LOCATION_ID,
  slug: 'lockport',
  name: 'Oasis Lockport',
  shortName: 'Lockport',
  street: '1250 E. 9th St.',
  locality: 'Lockport',
  region: 'IL',
  postalCode: '60441',
  timezone: 'America/Chicago',
  phone: '(815) 545-7556',
  active: true,
  sort: 0,
};

/** The location a record with no location_id belongs to. */
export const DEFAULT_LOCATION = lockport;

export const staticLocations: Location[] = [lockport];

export function locationAddress(location: Location): string {
  return [location.street, [location.locality, location.region].filter(Boolean).join(', '), location.postalCode]
    .filter(Boolean)
    .join(', ')
    .replace(', ,', ',');
}
