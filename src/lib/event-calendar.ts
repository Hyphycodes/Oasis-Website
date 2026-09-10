import { getUpcomingEvents, venueIsoDate, type EventInput } from './events';
import type { ResolvedEvent } from '@/content/types';
import type { EventCategory } from '@/content/event-presentation';
import { CATEGORY_FILTERS } from '@/content/event-presentation';

/**
 * The shape of the events page.
 *
 * Pure, and separate from the page, because "which events are on, in what
 * order, under which month" is a rule the restaurant cares about — and because
 * a calendar that quietly drops or duplicates a night is the kind of bug that
 * is invisible in a screenshot and obvious to a guest standing at the door.
 */

export type CategoryFilter = EventCategory | 'all';

export interface EventMonth {
  /** `2026-10`. Venue-local, so a 1am event belongs to the night before. */
  key: string;
  label: string;
  /** October is the restaurant's biggest month and gets its own treatment. */
  isOctober: boolean;
  events: ResolvedEvent[];
}

export interface Calendar {
  /** The single event the page opens with. */
  lead: ResolvedEvent | null;
  /** The recurring nights that run underneath all of this, one entry each. */
  weekly: ResolvedEvent[];
  /**
   * Every event in date order, grouped by month — the lead included.
   *
   * It appears twice on the page, once as the banner and once in its month.
   * That is deliberate: dropping it leaves a hole in the calendar, and in the
   * common case where the lead is the only event in the restaurant's biggest
   * month, dropping it deletes that month's section entirely.
   */
  months: EventMonth[];
  /** How many events each filter would show. A chip that leads nowhere is not offered. */
  counts: Record<CategoryFilter, number>;
  /** Events matching the current filter, lead included. */
  total: number;
}

const MONTH_NAME = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** `2026-10` → `October 2026`. Built from the key rather than re-parsed, so it
 *  cannot disagree with the grouping it labels. */
export function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const name = MONTH_NAME[Number(month) - 1];
  return name ? `${name} ${year}` : key;
}

/**
 * Featured first, then whatever is soonest — the same order the homepage uses,
 * so the event a guest saw promoted there is the one that opens this page.
 */
function rank(event: ResolvedEvent): number {
  const { treatment, priority } = event.presentation;
  const base = treatment === 'takeover' ? 2000 : treatment === 'featured' ? 1000 : 0;
  return base + Math.max(0, Math.min(99, priority));
}

function matches(event: ResolvedEvent, filter: CategoryFilter): boolean {
  if (filter === 'all') return true;
  return event.presentation.category === filter;
}

/**
 * The calendar is the SPECIAL events. The weekly nights are a fixture.
 *
 * Oasis Fridays and Oasis Latin Saturdays are generated from cadence, so
 * listing them as dated rows produces ninety-odd near-identical lines running
 * into next spring — a wall nobody reads, made of dates nobody has confirmed.
 * That list was removed from this page once before, for exactly that reason.
 *
 * So a recurring night appears here as itself, once, in `weekly`, linking to
 * its own page where its real schedule lives; and the month-by-month calendar
 * carries the events that actually differ from one another. Both are "on"; only
 * one of them is news.
 *
 * Cancelled and unpublished nights are excluded upstream by `ineligibleReason`,
 * the same rule the rest of the site uses, so a night that is off cannot appear
 * here and nowhere else. A guest holding a ticket for a cancelled night learns
 * about it on that event's own page, which does still render and does say so.
 */
export function buildCalendar(
  input: EventInput,
  now: Date,
  filter: CategoryFilter = 'all',
): Calendar {
  // A horizon rather than everything: recurring nights are generated from
  // cadence and would otherwise run forever, and publishing a year of dates
  // nobody has checked turns a calendar into a promise.
  const upcoming = getUpcomingEvents(input, now, 90);

  // One entry per recurring series: its next night, which is the only date on
  // it anybody needs from this page.
  const weekly: ResolvedEvent[] = [];
  const seenSeries = new Set<string>();
  for (const event of upcoming) {
    if (!event.seriesSlug || seenSeries.has(event.seriesSlug)) continue;
    seenSeries.add(event.seriesSlug);
    weekly.push(event);
  }

  const special = upcoming.filter((event) => event.seriesSlug === null);

  const counts = { all: special.length } as Record<CategoryFilter, number>;
  for (const category of CATEGORY_FILTERS) {
    counts[category] = special.filter((event) => event.presentation.category === category).length;
  }

  const visible = special.filter((event) => matches(event, filter));

  const promoted = [...visible].sort((a, b) => {
    const difference = rank(b) - rank(a);
    if (difference !== 0) return difference;
    return a.startsAt.localeCompare(b.startsAt);
  });
  const lead = promoted[0] ?? null;

  const months: EventMonth[] = [];
  for (const event of visible) {
    const key = venueIsoDate(event.startsAt).slice(0, 7);
    const last = months[months.length - 1];
    if (last && last.key === key) {
      last.events.push(event);
    } else {
      months.push({ key, label: monthLabel(key), isOctober: key.endsWith('-10'), events: [event] });
    }
  }

  return { lead, weekly, months, counts, total: visible.length };
}
