import { notFound } from 'next/navigation';
import { TicketBox } from '@/components/events/TicketBox';
import { Band, Frame } from '@/components/primitives/Band';
import type { TicketOffer } from '@/lib/ticketing/offer';

/**
 * Development only: the ticket box in every state, with made-up offers.
 *
 * In-house tiers need Supabase's functions, which the local file database
 * does not have, so this is how the stepper, the total and the scarcity line
 * get looked at on a phone before any money exists. 404 in production.
 */
export const dynamic = 'force-dynamic';

const TIERS: Extract<TicketOffer, { kind: 'tiers' }> = {
  kind: 'tiers',
  eventId: 'dev',
  remaining: 9,
  capacity: 40,
  tiers: [
    { id: 'a', name: 'Adult', description: 'Canvas, paints and an apron.', priceCents: 1000, seatsPerTicket: 1, minPerOrder: 0, maxPerOrder: 8, available: 9, onSale: true },
    { id: 'k', name: 'Kid (12 and under)', description: 'A smaller canvas and a juice.', priceCents: 600, seatsPerTicket: 1, minPerOrder: 0, maxPerOrder: 6, available: 9, onSale: true },
    { id: 't', name: 'Table of 4', description: 'Four seats together.', priceCents: 3600, seatsPerTicket: 4, minPerOrder: 0, maxPerOrder: 2, available: 8, onSale: true },
  ],
};

export default function DevTicketBoxPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <Band surface="espresso" size="sm">
      <Frame>
        <div className="grid gap-8 lg:grid-cols-2">
          <TicketBox offer={TIERS} eventId="dev" eventSlug="dev" eventTitle="Dev event" />
          <TicketBox offer={{ ...TIERS, remaining: 0 }} eventId="dev" eventSlug="dev" eventTitle="Dev event" />
        </div>
      </Frame>
    </Band>
  );
}
