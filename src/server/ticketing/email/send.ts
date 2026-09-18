import 'server-only';

import { Resend } from 'resend';
import { getSiteSettings } from '@/content/resolve';
import { standaloneEvents } from '@/lib/events';
import { absoluteUrl } from '@/lib/site-url';
import { buildIcs } from '@/lib/tickets/ics';
import { ticketLink } from '@/lib/tickets/link';
import { ticketQrPng } from '@/lib/tickets/qr';
import { signOrderToken, signTicketToken } from '@/lib/ticketing/tokens';
import { getPublicEvents } from '@/server/content/events';
import { getTicketingClient } from '@/server/ticketing/db';
import { getOrderById, isPaidStatus, type OrderRecord } from '@/server/ticketing/orders';
import { renderConfirmation, renderReminder, renderThanks, renderTonight, type EmailEvent, type EmailTicket } from './templates';

/**
 * Sending, and the record of having sent.
 *
 * Every attempt lands in `email_log` with the provider id or the error, so
 * "I never got my ticket" is a five-second lookup. Nothing here throws to a
 * caller: a failure is logged and reported as `false`.
 */

export type EmailType = 'confirmation' | 'resend' | 'reminder' | 'tonight' | 'thanks' | 'owner_alert';

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key ? new Resend(key) : null;
}

function fromAddress(): string | null {
  const from = process.env.ORDERS_FROM_EMAIL?.trim();
  if (!from || /resend\.dev$/i.test(from)) return null;
  return `Oasis Mexican Kitchen & Bar <${from}>`;
}

async function log(entry: {
  orderId: string | null;
  type: EmailType;
  to: string | null;
  providerId?: string | null;
  status: 'sent' | 'failed' | 'skipped';
  error?: string | null;
}): Promise<void> {
  const client = getTicketingClient();
  if (!client) return;
  await client.from('email_log').insert({
    order_id: entry.orderId,
    type: entry.type,
    to_email: entry.to,
    provider_id: entry.providerId ?? null,
    status: entry.status,
    error: entry.error ?? null,
  });
}

async function eventFor(order: OrderRecord): Promise<EmailEvent | null> {
  const [input, settings] = await Promise.all([getPublicEvents(), getSiteSettings()]);
  const event = standaloneEvents(input.occurrences).find((entry) => entry.overrideId === order.eventId);
  if (!event) return null;
  const address = event.ticketing.venueAddress?.trim() || `${settings.street}, ${settings.locality}, ${settings.region} ${settings.postalCode}`;
  return {
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    venueName: event.venueName,
    address,
    directionsUrl: settings.directionsUrl,
    arrivalNote: event.ageNote?.trim() || null,
    refundPolicy: order.consentText ?? event.ticketing.refundPolicy,
  };
}

/** One order's ticket email, with its QRs inline and the calendar file attached. */
export async function sendTicketEmail(orderId: string, type: 'confirmation' | 'resend' | 'reminder' | 'tonight' | 'thanks'): Promise<boolean> {
  const order = await getOrderById(orderId);
  if (!order) return false;
  const to = order.customerEmail;
  if (!to || !isPaidStatus(order.status)) {
    await log({ orderId, type, to, status: 'skipped', error: !to ? 'no email on order' : `order is ${order.status}` });
    return false;
  }

  const mailer = resend();
  const from = fromAddress();
  if (!mailer || !from) {
    await log({ orderId, type, to, status: 'skipped', error: 'RESEND_API_KEY or ORDERS_FROM_EMAIL not set' });
    return false;
  }

  const event = await eventFor(order);
  if (!event) {
    await log({ orderId, type, to, status: 'failed', error: 'event not found' });
    return false;
  }

  const settings = await getSiteSettings();
  const live = order.tickets.filter((ticket) => ticket.status !== 'void' && ticket.status !== 'refunded');
  const ticketsUrl = absoluteUrl(`/tickets/${order.orderNumber}?t=${encodeURIComponent(signOrderToken(order.id))}`);

  const entries: EmailTicket[] = live.map((ticket, index) => ({
    ticket,
    tierName: order.items.find((item) => item.id === ticket.orderItemId)?.tierName ?? 'Ticket',
    cid: `qr${index + 1}`,
  }));
  const inline = entries.slice(0, entries.length > 4 ? 1 : 4);
  const qrs = await Promise.all(
    inline.map(async (entry) => ({
      filename: `${entry.ticket.code}.png`,
      content: await ticketQrPng(ticketLink(signTicketToken(entry.ticket.id, order.eventId))),
      contentType: 'image/png',
      contentId: entry.cid,
    })),
  );

  const rendered =
    type === 'reminder'
      ? renderReminder({ order, event, tickets: entries, ticketsUrl, settings })
      : type === 'tonight'
        ? renderTonight({ order, event, tickets: entries, ticketsUrl, settings })
        : type === 'thanks'
          // The review link becomes a site setting when this stage is switched
          // on; until then the email simply does not ask for one.
          ? renderThanks({ event, settings, eventsUrl: absoluteUrl('/events'), reviewUrl: null })
          : renderConfirmation({ order, event, tickets: entries, ticketsUrl, settings });
  const ics = buildIcs({
    uid: `${order.orderNumber}@oasismexicankitchenbar.com`,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    location: `${event.venueName}, ${event.address}`,
    description: `Order ${order.orderNumber}. Tickets: ${live.map((ticket) => ticket.code).join(', ')}. ${ticketsUrl}`,
    url: ticketsUrl,
  });

  try {
    const { data, error } = await mailer.emails.send({
      from,
      to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      headers: { 'X-Entity-Ref-ID': `${order.orderNumber}-${type}` },
      attachments: [
        ...qrs,
        { filename: 'oasis-event.ics', content: Buffer.from(ics, 'utf8'), contentType: 'text/calendar' },
      ],
    });
    if (error) {
      await log({ orderId, type, to, status: 'failed', error: error.message });
      return false;
    }
    await log({ orderId, type, to, status: 'sent', providerId: data?.id ?? null });
    return true;
  } catch (error) {
    await log({ orderId, type, to, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

/** A plain note to the owner. Never throws. */
export async function sendOwnerAlert(subject: string, body: string): Promise<boolean> {
  const to = process.env.OWNER_ALERT_EMAIL?.trim();
  const mailer = resend();
  const from = fromAddress();
  if (!to || !mailer || !from) {
    await log({ orderId: null, type: 'owner_alert', to: to ?? null, status: 'skipped', error: 'owner email or mailer not configured' });
    return false;
  }
  try {
    const { data, error } = await mailer.emails.send({ from, to, subject: `[Oasis tickets] ${subject}`, text: body });
    await log({ orderId: null, type: 'owner_alert', to, status: error ? 'failed' : 'sent', providerId: data?.id ?? null, error: error?.message ?? null });
    return !error;
  } catch (error) {
    await log({ orderId: null, type: 'owner_alert', to, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}
