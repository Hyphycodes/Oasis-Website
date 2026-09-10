import type { ThemeRecord, ThemeStatus } from './types';

/**
 * When a saved theme is actually on the website.
 *
 * Pure, so it is unit-tested against every combination. The instants are ISO
 * strings; converting the admin's Chicago wall-clock entries into instants is
 * the admin action's job (see src/lib/events.ts → venueLocalIso), so this file
 * never has to know about time zones at all.
 */

type Window = Pick<ThemeRecord, 'enabled' | 'scheduleEnabled' | 'startAt' | 'endAt'>;

export function themeStatusAt(record: Window, now: Date): ThemeStatus {
  if (!record.enabled) return 'off';
  if (!record.scheduleEnabled) return 'live';

  const start = record.startAt ? Date.parse(record.startAt) : Number.NEGATIVE_INFINITY;
  const end = record.endAt ? Date.parse(record.endAt) : Number.POSITIVE_INFINITY;
  const at = now.getTime();

  // A malformed date must fail closed: the default look, not a stuck theme.
  if (Number.isNaN(start) || Number.isNaN(end)) return 'off';
  if (at < start) return 'scheduled';
  if (at >= end) return 'ended';
  return 'live';
}

export function isThemeActiveAt(record: Window, now: Date): boolean {
  return themeStatusAt(record, now) === 'live';
}

export const STATUS_LABEL: Record<ThemeStatus, string> = {
  off: 'Off',
  live: 'Live now',
  scheduled: 'Scheduled',
  ended: 'Dates have passed',
};
