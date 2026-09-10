import { describe, expect, it } from 'vitest';
import { eventFromJsonLd, parseEventLinks, parseEvents, tickeriEventId } from './tickeri';
import { guessCategory } from './reconcile';

/**
 * Fixtures are shaped like the schema.org markup a ticketing page emits. The
 * point of these tests is the refusal cases: a parser that guesses a date is
 * worse than one that reports it could not read the page.
 */
const page = (payload: unknown) =>
  `<html><head><script type="application/ld+json">${JSON.stringify(payload)}</script></head><body></body></html>`;

const scream = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'SCREAM PAINT & SIP',
  url: 'https://www.tickeri.com/events/xvt4t4jbzvwf/scream-paint-sip',
  startDate: '2026-10-08T19:00:00-05:00',
  endDate: '2026-10-08T22:00:00-05:00',
  image: 'https://cdn.tickeri.com/flyers/scream.jpg',
  description: 'Paint, sip and dress up.',
  location: { '@type': 'Place', name: 'Oasis Mexican Kitchen & Bar' },
  offers: [{ '@type': 'Offer', price: '45', availability: 'https://schema.org/InStock' }],
};

describe('tickeriEventId', () => {
  it('takes the id out of an event URL', () => {
    expect(tickeriEventId('https://www.tickeri.com/events/xvt4t4jbzvwf/scream-paint-sip')).toBe(
      'xvt4t4jbzvwf',
    );
    expect(tickeriEventId('https://www.tickeri.com/organizations/chsxwyl/oasis-events')).toBeNull();
  });
});

describe('eventFromJsonLd', () => {
  it('reads a complete event', () => {
    const event = eventFromJsonLd(scream);
    expect(event).toMatchObject({
      sourceEventId: 'xvt4t4jbzvwf',
      title: 'SCREAM PAINT & SIP',
      venueName: 'Oasis Mexican Kitchen & Bar',
      flyerUrl: 'https://cdn.tickeri.com/flyers/scream.jpg',
      priceText: '$45',
      soldOut: false,
      cancelled: false,
    });
    expect(event?.startsAt).toBe(new Date('2026-10-08T19:00:00-05:00').toISOString());
  });

  it('refuses an event with no date rather than inventing one', () => {
    expect(eventFromJsonLd({ ...scream, startDate: undefined })).toBeNull();
    expect(eventFromJsonLd({ ...scream, startDate: 'sometime in October' })).toBeNull();
  });

  it('refuses an event with no name or no usable URL', () => {
    expect(eventFromJsonLd({ ...scream, name: undefined })).toBeNull();
    expect(eventFromJsonLd({ ...scream, url: 'https://www.tickeri.com/', '@id': undefined })).toBeNull();
  });

  it('reads sold out from the offers, and a range when tiers differ', () => {
    const soldOut = eventFromJsonLd({
      ...scream,
      offers: [{ price: '45', availability: 'https://schema.org/SoldOut' }],
    });
    expect(soldOut?.soldOut).toBe(true);

    const tiers = eventFromJsonLd({
      ...scream,
      offers: [{ price: '30', availability: 'InStock' }, { price: '55', availability: 'InStock' }],
    });
    expect(tiers?.priceText).toBe('$30–$55');
    // One tier still on sale means the event is not sold out.
    expect(tiers?.soldOut).toBe(false);
  });

  it('marks a cancelled event', () => {
    const off = eventFromJsonLd({ ...scream, eventStatus: 'https://schema.org/EventCancelled' });
    expect(off?.cancelled).toBe(true);
  });

  it('reports free entry as words', () => {
    const free = eventFromJsonLd({ ...scream, offers: [{ price: '0', availability: 'InStock' }] });
    expect(free?.priceText).toBe('Free');
  });
});

describe('parseEvents', () => {
  it('finds events nested in a @graph or an item list', () => {
    expect(parseEvents(page({ '@graph': [scream] }))).toHaveLength(1);
    expect(
      parseEvents(page({ '@type': 'ItemList', itemListElement: [{ item: scream }] })),
    ).toHaveLength(1);
  });

  it('survives a malformed block beside a good one', () => {
    const html = `<script type="application/ld+json">{not json}</script>${page(scream)}`;
    expect(parseEvents(html)).toHaveLength(1);
  });

  it('returns nothing for a page with no structured data', () => {
    expect(parseEvents('<html><body><h1>SCREAM · Oct 8</h1></body></html>')).toEqual([]);
  });

  it('de-duplicates the same event listed twice', () => {
    expect(parseEvents(page([scream, scream]))).toHaveLength(1);
  });
});

describe('parseEventLinks', () => {
  it('collects unique absolute event links', () => {
    const html = `
      <a href="/events/aaa111/one">One</a>
      <a href="/events/aaa111/one">One again</a>
      <a href="/events/bbb222/two?ref=x">Two</a>
      <a href="/organizations/chsxwyl/oasis-events">Org</a>`;
    expect(parseEventLinks(html)).toEqual([
      'https://www.tickeri.com/events/aaa111/one',
      'https://www.tickeri.com/events/bbb222/two',
    ]);
  });
});

describe('guessCategory', () => {
  it('files the obvious ones and leaves the rest alone', () => {
    expect(guessCategory('SCREAM PAINT & SIP')).toBe('paint-sip');
    expect(guessCategory('Michael Myers Paint & Brunch')).toBe('paint-sip');
    expect(guessCategory('Comedy Show Hosted by Ruben')).toBe('comedy');
    expect(guessCategory('PURO PINCHE PERREO LATIN SATURDAYS')).toBe('nightlife');
    expect(guessCategory('Something Entirely New')).toBeNull();
  });
});
