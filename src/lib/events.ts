import { eventOverrides, eventSeries } from '@/content/events';
import type { EventOccurrence, EventSeries, ResolvedEvent } from '@/content/types';

/**
 * Occurrence generation.
 *
 * A series has no dates. Occurrences are computed from `cadence` for a rolling
 * window, so the calendar never runs out and nobody maintains 21 rows by hand —
 * and, critically, so no date can ever be baked into artwork or copy.
 * See PLAN.md §4.1.
 */

const DEFAULT_WEEKS = 26;
const TZ = 'America/Chicago';

/**
 * Builds an ISO string for a venue-local wall-clock time on a given date.
 * Resolves the America/Chicago offset for that specific date, so CST/CDT
 * transitions do not shift a 10pm door time to 9pm or 11pm.
 */
function venueLocalIso(year: number, month: number, day: number, minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  // Start from the intended wall clock as if it were UTC, then correct by the
  // zone's actual offset at that moment.
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMinutes = tzOffsetMinutes(new Date(naive));
  const corrected = new Date(naive - offsetMinutes * 60_000);

  // Re-resolve once: the correction can cross a DST boundary.
  const settled = new Date(naive - tzOffsetMinutes(corrected) * 60_000);
  return settled.toISOString();
}

function tzOffsetMinutes(date: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    timeZoneName: 'shortOffset',
  }).formatToParts(date);
  const name = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT-6';
  const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(name);
  if (!match) return -360;
  const sign = match[1] === '-' ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

function venueDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    isoDate: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

export function generateOccurrences(
  series: EventSeries,
  from: Date,
  weeks = DEFAULT_WEEKS,
): EventOccurrence[] {
  if (series.cadence.kind !== 'weekly') return [];

  const occurrences: EventOccurrence[] = [];
  const target = series.cadence.weekday;
  const cursor = new Date(from.getTime());

  // Walk back to the start of the current venue-local day so an event happening
  // *right now* is still counted as upcoming until it actually ends.
  cursor.setUTCHours(cursor.getUTCHours() - 12);

  for (let i = 0; i < weeks * 7 + 7; i += 1) {
    const probe = new Date(cursor.getTime() + i * 86_400_000);
    const parts = venueDateParts(probe);
    if (parts.weekday !== target) continue;

    if (series.seriesEndsOn && parts.isoDate > series.seriesEndsOn) break;

    const startsAt = venueLocalIso(parts.year, parts.month, parts.day, series.startMinutes);
    const endsAt = venueLocalIso(parts.year, parts.month, parts.day, series.endMinutes);

    // A series must never publish an occurrence whose end precedes its start.
    if (new Date(endsAt) <= new Date(startsAt)) continue;

    const override = eventOverrides.find(
      (o) => o.seriesSlug === series.slug && o.date === parts.isoDate,
    );

    occurrences.push({
      id: `${series.slug}:${parts.isoDate}`,
      seriesSlug: series.slug,
      startsAt,
      endsAt,
      status: override?.status ?? series.status,
      ticketUrl: override?.ticketUrl ?? series.ticketUrl,
      priceCents: override?.priceCents !== undefined ? override.priceCents : series.priceCents,
      feeCents: series.feeCents,
    });

    if (occurrences.length >= weeks) break;
  }

  return occurrences;
}

/**
 * Upcoming occurrences across every series, soonest first.
 * An event is "past" only once it has ENDED — a Friday night still shows on the
 * listing at 1am Saturday, which is exactly when someone is checking their phone.
 */
export function getUpcomingEvents(now: Date, limit?: number): ResolvedEvent[] {
  const resolved = eventSeries
    .flatMap((series) =>
      generateOccurrences(series, now).map((occurrence) => ({ ...occurrence, series })),
    )
    .filter((event) => new Date(event.endsAt).getTime() > now.getTime())
    .filter((event) => event.status !== 'cancelled' || isSoon(event.startsAt, now))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return typeof limit === 'number' ? resolved.slice(0, limit) : resolved;
}

/** Cancelled nights stay visible for two weeks so guests are not surprised. */
function isSoon(iso: string, now: Date): boolean {
  return new Date(iso).getTime() - now.getTime() < 14 * 86_400_000;
}

export function getSeries(slug: string): EventSeries | undefined {
  return eventSeries.find((s) => s.slug === slug);
}

export function getSeriesOccurrences(slug: string, now: Date, limit = 8): ResolvedEvent[] {
  const series = getSeries(slug);
  if (!series) return [];
  return generateOccurrences(series, now)
    .filter((o) => new Date(o.endsAt).getTime() > now.getTime())
    .slice(0, limit)
    .map((o) => ({ ...o, series }));
}

export function getAllSeries(): EventSeries[] {
  return eventSeries;
}

/** Human label for a status. Never conveyed by color alone. */
export const STATUS_LABEL: Record<string, string> = {
  scheduled: '',
  'sold-out': 'Sold out',
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  free: 'Free entry',
};

/** Google Calendar link. Uses occurrence data, never artwork. */
export function addToCalendarUrl(event: ResolvedEvent): string {
  const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.series.title,
    dates: `${stamp(event.startsAt)}/${stamp(event.endsAt)}`,
    details: event.series.description,
    location: `${event.series.venueName}, 1250 E 9th St, Lockport, IL 60441`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
