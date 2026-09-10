import { getUpcomingEvents, takeoverIsLive, type EventInput } from './events';
import type { ResolvedEvent } from '@/content/types';

/**
 * Which events the homepage leads with.
 *
 * Pure, and separated from the components, because "what should be on the
 * homepage" is a rule the restaurant cares about and a rule worth testing. The
 * components only lay out what this returns.
 */

export interface HomepageEvents {
  /** The single event running a hero takeover right now, if any. */
  takeover: ResolvedEvent | null;
  /** The dominant event in the featured module. */
  lead: ResolvedEvent | null;
  /** Two supporting events beside it. Never repeats the lead. */
  supporting: ResolvedEvent[];
  /** The soonest thing on, for the hero's NEXT UP line. */
  next: ResolvedEvent | null;
}

/** A cancelled night is never advertised; it stays visible only on /events. */
function advertisable(event: ResolvedEvent): boolean {
  return event.status !== 'cancelled';
}

/**
 * Featured first, then whatever is soonest.
 *
 * Within the featured set the order is: takeover, then featured, then higher
 * priority, then sooner. A restaurant that has explicitly promoted something
 * expects to see it lead, and only after that does the calendar decide.
 */
function rank(event: ResolvedEvent): number {
  const { treatment, priority } = event.presentation;
  const base = treatment === 'takeover' ? 2000 : treatment === 'featured' ? 1000 : 0;
  return base + Math.max(0, Math.min(99, priority));
}

export function selectHomepageEvents(input: EventInput, now: Date): HomepageEvents {
  const upcoming = getUpcomingEvents(input, now, 40).filter(advertisable);

  const takeover = upcoming.find((event) => takeoverIsLive(event, now)) ?? null;

  // Sort a copy: `getUpcomingEvents` returns chronological order, which the
  // supporting slots and /events both still want.
  const promoted = [...upcoming].sort((a, b) => {
    const difference = rank(b) - rank(a);
    if (difference !== 0) return difference;
    return a.startsAt.localeCompare(b.startsAt);
  });

  const lead = promoted[0] ?? null;
  const supporting = promoted.filter((event) => event.id !== lead?.id).slice(0, 2);

  return {
    takeover,
    lead,
    supporting,
    // Soonest, not most promoted: "next up" is a promise about the calendar.
    next: upcoming[0] ?? null,
  };
}
