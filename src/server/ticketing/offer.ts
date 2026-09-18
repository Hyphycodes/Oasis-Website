import 'server-only';

import type { ResolvedEvent } from '@/content/types';
import type { TicketOffer } from '@/lib/ticketing/offer';

/**
 * The ticket offer for an event, as the public site sees it.
 *
 * Today every ticketed event is sold through an outside link, so an offer is
 * derived from the event alone. When in-house ticketing lands, an event with
 * `ticketing_enabled` gets a `tiers` offer read from `get_event_availability`,
 * and this is the only function that has to learn about it — the page, the
 * ticket box, the sticky bar and the tiles all read the offer.
 */
export function offerFor(event: ResolvedEvent): TicketOffer {
  const soldOut = event.status === 'sold-out';
  const free =
    event.status === 'free' ||
    event.priceCents === 0 ||
    event.series?.ticketPolicy === 'free';
  if (free) return { kind: 'free' };

  if (event.ticketUrl) {
    return {
      kind: 'external',
      url: event.ticketUrl,
      label: event.ticketLabel,
      priceCents: event.priceCents,
      priceText: event.presentation.priceText,
      soldOut,
    };
  }

  return { kind: 'door', priceCents: event.priceCents, priceText: event.presentation.priceText, soldOut };
}

/** Offers for a list, keyed by event id. One code path, however many events. */
export async function offersFor(events: ResolvedEvent[]): Promise<Map<string, TicketOffer>> {
  return new Map(events.map((event) => [event.id, offerFor(event)]));
}

export async function getTicketOffer(event: ResolvedEvent): Promise<TicketOffer> {
  return offerFor(event);
}
