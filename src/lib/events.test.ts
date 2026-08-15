import { describe, expect, it } from 'vitest';
import { eventSeries } from '@/content/events';
import type { EventSeries } from '@/content/types';
import {
  generateOccurrences,
  getSeriesOccurrences,
  getUpcomingEvents,
  ineligibleReason,
  nextEvent,
  nextPerSeries,
  ticketUrlForOccurrence,
  venueIsoDate,
  type EventInput,
  type OccurrenceRecord,
} from './events';

const fridays = eventSeries.find((s) => s.slug === 'oasis-fridays')!;
const saturdays = eventSeries.find((s) => s.slug === 'oasis-latin-saturdays')!;

function input(
  series: EventSeries[] = eventSeries,
  occurrences: OccurrenceRecord[] = [],
): EventInput {
  return { series, occurrences };
}

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

/** An override attached to one generated night. */
function override(partial: Partial<OccurrenceRecord> & { startsAt: string }): OccurrenceRecord {
  return { id: `o:${partial.startsAt}`, seriesSlug: 'oasis-fridays', ...partial };
}

describe('generateOccurrences', () => {
  it('only ever lands on the series weekday', () => {
    const occurrences = generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), [], 12);
    expect(occurrences.length).toBeGreaterThan(0);
    for (const occurrence of occurrences) {
      expect(venueWeekday(occurrence.startsAt)).toBe(5);
    }
  });

  it('starts at 10pm venue time regardless of daylight saving', () => {
    // Straddles the CDT -> CST change on the first Sunday in November.
    const occurrences = generateOccurrences(fridays, new Date('2026-10-20T12:00:00Z'), [], 6);
    for (const occurrence of occurrences) {
      expect(venueHour(occurrence.startsAt)).toBe(22);
    }
  });

  it('holds 10pm across the spring-forward transition too', () => {
    // Second Sunday in March 2027: 2am jumps to 3am.
    const occurrences = generateOccurrences(fridays, new Date('2027-03-01T12:00:00Z'), [], 4);
    for (const occurrence of occurrences) {
      expect(venueHour(occurrence.startsAt)).toBe(22);
    }
  });

  it('never produces an occurrence that ends before it starts', () => {
    for (const series of eventSeries) {
      for (const occurrence of generateOccurrences(
        series,
        new Date('2026-08-14T12:00:00Z'),
        [],
        20,
      )) {
        expect(new Date(occurrence.endsAt).getTime()).toBeGreaterThan(
          new Date(occurrence.startsAt).getTime(),
        );
      }
    }
  });

  it('runs a 10pm–2am night four hours long, crossing midnight', () => {
    const [first] = generateOccurrences(saturdays, new Date('2026-08-14T12:00:00Z'), [], 1);
    const hours =
      (new Date(first!.endsAt).getTime() - new Date(first!.startsAt).getTime()) / 3_600_000;
    expect(hours).toBe(4);
    expect(venueWeekday(first!.startsAt)).toBe(6);
    // Ends on the following day.
    expect(venueWeekday(first!.endsAt)).toBe(0);
  });

  it('generates the requested number of weeks', () => {
    expect(generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), [], 26)).toHaveLength(26);
  });

  it('stops at seriesEndsOn', () => {
    const bounded = { ...fridays, seriesEndsOn: '2026-09-05' };
    const occurrences = generateOccurrences(bounded, new Date('2026-08-14T12:00:00Z'), [], 26);
    expect(occurrences.length).toBeLessThan(5);
    for (const occurrence of occurrences) {
      expect(occurrence.startsAt < '2026-09-06').toBe(true);
    }
  });

  it('generates nothing while the series is paused', () => {
    const paused = { ...fridays, paused: true };
    expect(generateOccurrences(paused, new Date('2026-08-14T12:00:00Z'), [], 8)).toHaveLength(0);
  });

  it('produces one occurrence per date even when asked twice', () => {
    const first = generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), [], 8);
    const second = generateOccurrences(fridays, new Date('2026-08-14T12:00:00Z'), [], 8);
    const dates = [...first, ...second].map((event) => venueIsoDate(event.startsAt));
    // Same input, same dates — and within one run every date is distinct.
    expect(new Set(first.map((e) => venueIsoDate(e.startsAt))).size).toBe(first.length);
    expect(new Set(dates).size).toBe(first.length);
    expect(second.map((e) => e.id)).toEqual(first.map((e) => e.id));
  });

  it('carries no date on the series itself — the whole stale-artwork guarantee', () => {
    for (const series of eventSeries) {
      expect(Object.keys(series)).not.toContain('date');
      expect(Object.keys(series)).not.toContain('startsAt');
    }
  });
});

describe('occurrence overrides', () => {
  const now = new Date('2026-08-14T12:00:00Z');

  it('applies a ticket URL to one night only', () => {
    const events = getUpcomingEvents(
      input(eventSeries, [
        override({ startsAt: '2026-08-21', ticketUrl: 'https://tickets.example.com/aug21' }),
      ]),
      now,
    );
    const overridden = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-21');
    const untouched = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-28');

    expect(overridden!.ticketUrl).toBe('https://tickets.example.com/aug21');
    expect(overridden!.overriddenFields).toContain('ticketUrl');
    expect(untouched!.ticketUrl).toBe(
      ticketUrlForOccurrence('oasis-fridays', untouched!.startsAt),
    );
    expect(untouched!.overriddenFields).toHaveLength(0);
  });

  it('applies artwork to one night without touching the series flyer', () => {
    const events = getUpcomingEvents(
      input(eventSeries, [override({ startsAt: '2026-08-21', flyerAssetId: 'flyerLatinSaturdays' })]),
      now,
    );
    const overridden = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-21')!;
    const untouched = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-28')!;

    expect(overridden.flyerAssetId).toBe('flyerLatinSaturdays');
    // A night with its own artwork does not inherit the series' printed-date
    // caption, because that caption describes a different picture.
    expect(overridden.flyerPrintedDate).toBeNull();
    expect(untouched.flyerAssetId).toBe(fridays.flyerAssetId);
    expect(untouched.flyerPrintedDate).toBe(fridays.flyerPrintedDate);
  });

  it('cancelling one night leaves every later night scheduled', () => {
    const events = getUpcomingEvents(
      input(eventSeries, [override({ startsAt: '2026-08-21', status: 'cancelled' })]),
      now,
    );
    const cancelled = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-21');
    const later = events.filter(
      (e) => e.seriesSlug === 'oasis-fridays' && venueIsoDate(e.startsAt) > '2026-08-21',
    );

    expect(cancelled!.status).toBe('cancelled');
    expect(later.length).toBeGreaterThan(0);
    for (const event of later) expect(event.status).toBe('scheduled');
  });

  it('changing a series default does not wipe an existing override', () => {
    const occurrences = [override({ startsAt: '2026-08-21', priceCents: 2500 })];
    const cheaper = eventSeries.map((s) =>
      s.slug === 'oasis-fridays' ? { ...s, priceCents: 500 } : s,
    );

    const events = getUpcomingEvents(input(cheaper, occurrences), now);
    const overridden = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-21')!;
    const inherited = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-28')!;

    expect(overridden.priceCents).toBe(2500);
    expect(inherited.priceCents).toBe(500);
  });

  it('records exactly which fields were overridden, for the admin to label', () => {
    const events = getUpcomingEvents(
      input(eventSeries, [
        override({ startsAt: '2026-08-21', priceCents: 2000, title: 'Fridays × Guest DJ' }),
      ]),
      now,
    );
    const overridden = events.find((e) => venueIsoDate(e.startsAt) === '2026-08-21')!;
    expect(overridden.overriddenFields.sort()).toEqual(['priceCents', 'title']);
    expect(overridden.title).toBe('Fridays × Guest DJ');
    // Everything not overridden is still inherited.
    expect(overridden.musicFormats).toEqual(fridays.musicFormats);
  });

  it('composes a dated ticket URL per night, never a bare series slug', () => {
    const events = getSeriesOccurrences(input(), 'oasis-fridays', now, 3);
    const urls = events.map((e) => e.ticketUrl);
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) {
      expect(url).toMatch(/\/event-details\/oasis-fridays-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}$/);
    }
  });
});

describe('one-time events', () => {
  const now = new Date('2026-08-14T12:00:00Z');

  const standalone: OccurrenceRecord = {
    id: 'nye-2026',
    seriesSlug: null,
    slug: 'new-years-eve',
    title: 'New Year’s Eve at Oasis',
    startsAt: '2026-12-31T03:00:00.000Z',
    endsAt: '2026-12-31T09:00:00.000Z',
    published: true,
    musicFormats: ['Latin', 'Top 100'],
    ageMin: 21,
    flyerAssetId: 'nye-artwork',
  };

  it('appears alongside the recurring nights', () => {
    const events = getUpcomingEvents(input(eventSeries, [standalone]), now);
    const found = events.find((e) => e.id === 'one-time:nye-2026');
    expect(found).toBeDefined();
    expect(found!.seriesSlug).toBeNull();
    expect(found!.title).toBe('New Year’s Eve at Oasis');
    expect(found!.musicFormats).toEqual(['Latin', 'Top 100']);
    expect(found!.flyerAssetId).toBe('nye-artwork');
  });

  it('stays out of the public list while it is a draft', () => {
    const draft = { ...standalone, published: false };
    const events = getUpcomingEvents(input(eventSeries, [draft]), now);
    expect(events.find((e) => e.id === 'one-time:nye-2026')).toBeUndefined();
    expect(ineligibleReason({ ...events[0]!, published: false }, now)).toBe(
      'Draft — not on the website yet',
    );
  });
});

describe('getUpcomingEvents', () => {
  it('returns events in chronological order', () => {
    const events = getUpcomingEvents(input(), new Date('2026-08-14T12:00:00Z'), 10);
    const dates = events.map((event) => event.startsAt);
    expect([...dates].sort()).toEqual(dates);
  });

  it('keeps a night listed until it actually ends, not when it starts', () => {
    // 11:30pm on a Friday: the night is underway and must still be listed.
    const during = new Date('2026-08-15T04:30:00Z'); // 11:30pm Fri, Chicago
    const events = getUpcomingEvents(input(), during, 5);
    const friday = events.find((event) => event.seriesSlug === 'oasis-fridays');
    expect(friday).toBeDefined();
    expect(new Date(friday!.startsAt).getTime()).toBeLessThan(during.getTime());
  });

  it('drops a night once it has ended', () => {
    // 3am Saturday: Friday's 2am close has passed.
    const after = new Date('2026-08-15T08:00:00Z');
    const events = getUpcomingEvents(input(), after, 5);
    const stale = events.find(
      (event) => event.seriesSlug === 'oasis-fridays' && venueIsoDate(event.startsAt) === '2026-08-14',
    );
    expect(stale).toBeUndefined();
  });

  it('interleaves both series', () => {
    const events = getUpcomingEvents(input(), new Date('2026-08-14T12:00:00Z'), 6);
    const slugs = new Set(events.map((event) => event.seriesSlug));
    expect(slugs.size).toBe(2);
  });

  it('lists two events on the same day in start order', () => {
    const sameDay: OccurrenceRecord = {
      id: 'early-set',
      seriesSlug: null,
      title: 'Early set',
      // 6pm Friday, before the 10pm Fridays door.
      startsAt: '2026-08-21T23:00:00.000Z',
      endsAt: '2026-08-22T01:00:00.000Z',
      published: true,
    };
    const events = getUpcomingEvents(input(eventSeries, [sameDay]), new Date('2026-08-21T12:00:00Z'));
    const friday = events.findIndex((e) => e.seriesSlug === 'oasis-fridays');
    const early = events.findIndex((e) => e.id === 'one-time:early-set');
    expect(early).toBeGreaterThan(-1);
    expect(early).toBeLessThan(friday);
  });

  it('returns nothing once the series has ended', () => {
    const finished = eventSeries.map((s) => ({ ...s, seriesEndsOn: '2026-08-01' }));
    expect(getUpcomingEvents(input(finished), new Date('2026-08-14T12:00:00Z'))).toHaveLength(0);
  });
});

/**
 * The selector the homepage and /events both call.
 *
 * Each of these is a way the live site was, or could be, wrong. They are asserted
 * one at a time so a failure names the exact rule that broke.
 */
describe('nextEvent', () => {
  const base = input();

  it('is null when there is nothing to show', () => {
    const finished = eventSeries.map((s) => ({ ...s, seriesEndsOn: '2026-08-01' }));
    expect(nextEvent(input(finished), new Date('2026-08-14T12:00:00Z'))).toBeNull();
  });

  it('returns the upcoming night before it starts', () => {
    const event = nextEvent(base, new Date('2026-08-21T15:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-21');
  });

  it('keeps the night in progress as the answer', () => {
    // 12:30am Saturday, Chicago — Friday's night runs to 2am.
    const event = nextEvent(base, new Date('2026-08-22T05:30:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-21');
  });

  it('advances once the night has ended', () => {
    // 3am Saturday, Chicago.
    const event = nextEvent(base, new Date('2026-08-22T08:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-28');
  });

  /**
   * The exact defect the August 15, 2026 live-site audit found: the homepage and
   * the Events page were both still calling Friday, August 14 the next Friday.
   */
  it('never returns August 14 as next on August 15, 2026', () => {
    const august15 = new Date('2026-08-15T14:00:00Z'); // 9am Saturday, Chicago
    const event = nextEvent(base, august15, 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-21');
    expect(new Date(event.endsAt).getTime()).toBeGreaterThan(august15.getTime());

    // And no surface anywhere can produce it either.
    for (const upcoming of getUpcomingEvents(base, august15)) {
      expect(new Date(upcoming.endsAt).getTime()).toBeGreaterThan(august15.getTime());
    }
  });

  it('skips a cancelled nearest occurrence and offers the one after it', () => {
    const withCancellation = input(eventSeries, [
      override({ startsAt: '2026-08-21', status: 'cancelled' }),
    ]);
    const event = nextEvent(withCancellation, new Date('2026-08-16T12:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-28');
  });

  it('still LISTS the cancelled night, so a ticket-holder is told', () => {
    const withCancellation = input(eventSeries, [
      override({ startsAt: '2026-08-21', status: 'cancelled' }),
    ]);
    const listed = getUpcomingEvents(withCancellation, new Date('2026-08-16T12:00:00Z')).find(
      (e) => venueIsoDate(e.startsAt) === '2026-08-21',
    );
    expect(listed?.status).toBe('cancelled');
  });

  it('keeps a sold-out night as next, because it is still happening', () => {
    const soldOut = input(eventSeries, [override({ startsAt: '2026-08-21', status: 'sold-out' })]);
    const event = nextEvent(soldOut, new Date('2026-08-16T12:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-21');
    expect(event.status).toBe('sold-out');
  });

  it('skips a draft occurrence', () => {
    const draft = input(eventSeries, [override({ startsAt: '2026-08-21', published: false })]);
    const event = nextEvent(draft, new Date('2026-08-16T12:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-28');
  });

  it('skips an archived occurrence', () => {
    const archived = input(eventSeries, [
      override({ startsAt: '2026-08-21', archivedAt: '2026-08-15T00:00:00.000Z' }),
    ]);
    const event = nextEvent(archived, new Date('2026-08-16T12:00:00Z'), 'oasis-fridays')!;
    expect(venueIsoDate(event.startsAt)).toBe('2026-08-28');
  });

  it('returns nothing for a paused series', () => {
    const paused = eventSeries.map((s) =>
      s.slug === 'oasis-fridays' ? { ...s, paused: true } : s,
    );
    expect(nextEvent(input(paused), new Date('2026-08-16T12:00:00Z'), 'oasis-fridays')).toBeNull();
    // The other series is unaffected.
    expect(
      nextEvent(input(paused), new Date('2026-08-16T12:00:00Z'), 'oasis-latin-saturdays'),
    ).not.toBeNull();
  });

  it('returns nothing for an archived series', () => {
    const archived = eventSeries.map((s) =>
      s.slug === 'oasis-fridays' ? { ...s, archivedAt: '2026-08-01T00:00:00.000Z' } : s,
    );
    expect(
      nextEvent(input(archived), new Date('2026-08-16T12:00:00Z'), 'oasis-fridays'),
    ).toBeNull();
  });

  it('gives one next night per series, in series order', () => {
    const nights = nextPerSeries(base, new Date('2026-08-16T12:00:00Z'));
    expect(nights.map((n) => n.seriesSlug)).toEqual(['oasis-fridays', 'oasis-latin-saturdays']);
  });

  /** Belt and braces: no eligible event may ever be in the past, at any instant. */
  it('never returns a finished night, sampled across a year', () => {
    for (let week = 0; week < 52; week += 1) {
      const now = new Date(Date.UTC(2026, 7, 14, 12) + week * 7 * 86_400_000);
      for (const slug of ['oasis-fridays', 'oasis-latin-saturdays']) {
        const event = nextEvent(base, now, slug);
        if (!event) continue;
        expect(new Date(event.endsAt).getTime()).toBeGreaterThan(now.getTime());
        expect(event.status).not.toBe('cancelled');
        expect(event.published).toBe(true);
      }
    }
  });
});

describe('ineligibleReason', () => {
  const now = new Date('2026-08-16T12:00:00Z');
  const event = nextEvent(input(), now, 'oasis-fridays')!;

  it('names the reason rather than just hiding the row', () => {
    expect(ineligibleReason(event, now)).toBeNull();
    expect(ineligibleReason({ ...event, published: false }, now)).toMatch(/draft/i);
    expect(ineligibleReason({ ...event, archivedAt: 'now' }, now)).toBe('Archived');
    expect(ineligibleReason({ ...event, status: 'cancelled' }, now)).toBe('Cancelled');
    expect(ineligibleReason(event, new Date('2027-01-01T00:00:00Z'))).toBe('Already finished');
    expect(ineligibleReason({ ...event, title: '  ' }, now)).toBe('No name');
  });
});
