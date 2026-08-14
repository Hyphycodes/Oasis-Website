import { describe, expect, it } from 'vitest';
import { eventSeries } from '@/content/events';
import { generateOccurrences, getUpcomingEvents } from './events';

const fridays = eventSeries.find((s) => s.slug === 'oasis-fridays')!;
const saturdays = eventSeries.find((s) => s.slug === 'oasis-latin-saturdays')!;

/** Weekday in the venue's timezone, not the test runner's. */
function venueWeekday(iso: string): number {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'short',
  }).format(new Date(iso));
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(label);
}

function venueHour(iso: string): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      hour12: false,
    }).format(new Date(iso)),
  );
}

describe('generateOccurrences', () => {
  it('only ever lands on the series weekday', () => {
    const occurrences = generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), 12);
    expect(occurrences.length).toBeGreaterThan(0);
    for (const occurrence of occurrences) {
      expect(venueWeekday(occurrence.startsAt)).toBe(5);
    }
  });

  it('starts at 10pm venue time regardless of daylight saving', () => {
    // Straddles the CDT -> CST change on the first Sunday in November.
    const occurrences = generateOccurrences(fridays, new Date('2026-10-20T12:00:00Z'), 6);
    for (const occurrence of occurrences) {
      expect(venueHour(occurrence.startsAt)).toBe(22);
    }
  });

  it('never produces an occurrence that ends before it starts', () => {
    for (const series of eventSeries) {
      for (const occurrence of generateOccurrences(series, new Date('2026-08-14T12:00:00Z'), 20)) {
        expect(new Date(occurrence.endsAt).getTime()).toBeGreaterThan(
          new Date(occurrence.startsAt).getTime(),
        );
      }
    }
  });

  it('runs a 10pm–2am night four hours long, crossing midnight', () => {
    const [first] = generateOccurrences(saturdays, new Date('2026-08-14T12:00:00Z'), 1);
    const hours =
      (new Date(first!.endsAt).getTime() - new Date(first!.startsAt).getTime()) / 3_600_000;
    expect(hours).toBe(4);
    expect(venueWeekday(first!.startsAt)).toBe(6);
    // Ends on the following day.
    expect(venueWeekday(first!.endsAt)).toBe(0);
  });

  it('generates the requested number of weeks', () => {
    expect(generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), 26)).toHaveLength(26);
  });

  it('stops at seriesEndsOn', () => {
    const bounded = { ...fridays, seriesEndsOn: '2026-09-05' };
    const occurrences = generateOccurrences(bounded, new Date('2026-08-14T12:00:00Z'), 26);
    expect(occurrences.length).toBeLessThan(5);
    for (const occurrence of occurrences) {
      expect(occurrence.startsAt < '2026-09-06').toBe(true);
    }
  });

  it('carries no date on the series itself — the whole stale-artwork guarantee', () => {
    for (const series of eventSeries) {
      expect(Object.keys(series)).not.toContain('date');
      expect(Object.keys(series)).not.toContain('startsAt');
    }
  });
});

describe('getUpcomingEvents', () => {
  it('returns events in chronological order', () => {
    const events = getUpcomingEvents(new Date('2026-08-14T12:00:00Z'), 10);
    const dates = events.map((event) => event.startsAt);
    expect([...dates].sort()).toEqual(dates);
  });

  it('keeps a night listed until it actually ends, not when it starts', () => {
    // 11:30pm on a Friday: the night is underway and must still be listed.
    const during = new Date('2026-08-15T04:30:00Z'); // 11:30pm Fri, Chicago
    const events = getUpcomingEvents(during, 5);
    const friday = events.find((event) => event.series.slug === 'oasis-fridays');
    expect(friday).toBeDefined();
    expect(new Date(friday!.startsAt).getTime()).toBeLessThan(during.getTime());
  });

  it('drops a night once it has ended', () => {
    // 3am Saturday: Friday's 2am close has passed.
    const after = new Date('2026-08-15T08:00:00Z');
    const events = getUpcomingEvents(after, 5);
    const stale = events.find(
      (event) => event.series.slug === 'oasis-fridays' && event.startsAt < '2026-08-15',
    );
    expect(stale).toBeUndefined();
  });

  it('interleaves both series', () => {
    const events = getUpcomingEvents(new Date('2026-08-14T12:00:00Z'), 6);
    const slugs = new Set(events.map((event) => event.series.slug));
    expect(slugs.size).toBe(2);
  });
});
