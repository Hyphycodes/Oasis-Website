import type { SiteSettings } from '@/content/types';
import { formatEventDateCompact, formatEventDateLong, formatPrice, formatTimeRangeCompact } from '@/lib/format';
import type { OrderRecord, TicketRecord } from '@/server/ticketing/orders';

/**
 * The ticket emails, as tables with inline styles.
 *
 * No flexbox, no grid, no stylesheet, no web font: the layout has to survive
 * Outlook. The QR sits on a solid white block with padding, so a dark-mode
 * client that inverts the page never inverts the code. More than four tickets
 * shows the first and links to the rest — email clients choke on a stack of
 * large images.
 */

export interface EmailEvent {
  title: string;
  startsAt: string;
  endsAt: string;
  venueName: string;
  address: string;
  directionsUrl: string;
  arrivalNote: string | null;
  refundPolicy: string | null;
}

export interface EmailTicket {
  ticket: TicketRecord;
  tierName: string;
  /** cid of the inline QR attachment. */
  cid: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const SURFACE = '#1a1008';
const RAISED = '#241708';
const TEXT = '#f7eedc';
const MUTED = '#c4ac8c';
const AMBER = '#e8a33d';
const FONT = 'Archivo, Helvetica, Arial, sans-serif';

function escape(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function shell(body: string, preheader: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>Your tickets</title>
</head>
<body style="margin:0;padding:0;background:${SURFACE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${SURFACE};">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SURFACE};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${SURFACE};font-family:${FONT};color:${TEXT};">
${body}
</table>
</td></tr>
</table>
</body>
</html>`;
}

function row(inner: string, padding = '0 16px 20px'): string {
  return `<tr><td style="padding:${padding};font-family:${FONT};color:${TEXT};">${inner}</td></tr>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${AMBER};border-radius:12px;">
<a href="${escape(href)}" style="display:inline-block;padding:14px 24px;font-family:${FONT};font-size:16px;font-weight:700;color:#2a1203;text-decoration:none;">${escape(label)}</a>
</td></tr></table>`;
}

function qrBlock(entry: EmailTicket, index: number, total: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;background:${RAISED};border-radius:16px;">
<tr><td align="center" style="padding:20px 16px 8px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:#ffffff;border-radius:12px;padding:12px;">
<img src="cid:${entry.cid}" width="240" height="240" alt="QR code for ticket ${escape(entry.ticket.code)}" style="display:block;width:240px;height:240px;border:0;">
</td></tr></table>
</td></tr>
<tr><td align="center" style="padding:0 16px 20px;font-family:${FONT};">
<div style="font-size:24px;font-weight:700;letter-spacing:2px;color:${TEXT};">${escape(entry.ticket.code)}</div>
<div style="margin-top:4px;font-size:14px;color:${MUTED};">${escape(entry.tierName)}${entry.ticket.seats > 1 ? ` · ${entry.ticket.seats} seats` : ''} · ${index + 1} of ${total}</div>
</td></tr>
</table>`;
}

function eventHeader(event: EmailEvent, headline: string): string {
  return row(
    `<div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${AMBER};font-weight:700;">Oasis Mexican Kitchen &amp; Bar</div>
<div style="margin-top:14px;font-size:30px;line-height:1.05;font-weight:700;color:${TEXT};">${escape(headline)}</div>
<div style="margin-top:18px;font-size:20px;font-weight:700;color:${TEXT};">${escape(event.title)}</div>
<div style="margin-top:6px;font-size:16px;color:${TEXT};">${escape(formatEventDateLong(event.startsAt))} · ${escape(formatTimeRangeCompact(event.startsAt, event.endsAt))}</div>
<div style="margin-top:4px;font-size:15px;color:${MUTED};">${escape(event.venueName)}<br>${escape(event.address)}</div>`,
    '28px 16px 24px',
  );
}

export function renderConfirmation({
  order,
  event,
  tickets,
  ticketsUrl,
  settings,
}: {
  order: OrderRecord;
  event: EmailEvent;
  tickets: EmailTicket[];
  ticketsUrl: string;
  settings: SiteSettings;
}): RenderedEmail {
  const shown = tickets.slice(0, tickets.length > 4 ? 1 : 4);
  const subject = `You're in — ${event.title}, ${formatEventDateCompact(event.startsAt)}`;
  const termsUrl = ticketsUrl.replace(/\/tickets\/.*$/, '/legal/tickets');

  const html = shell(
    [
      eventHeader(event, "You're in."),
      row(shown.map((entry, index) => qrBlock(entry, index, tickets.length)).join('')),
      tickets.length > 4
        ? row(`<div style="font-size:15px;color:${MUTED};">${tickets.length} tickets in this order. The first is above; the rest are on your tickets page.</div><div style="margin-top:12px;">${button(ticketsUrl, `Open all ${tickets.length} tickets`)}</div>`)
        : '',
      event.arrivalNote ? row(`<div style="font-size:15px;line-height:1.5;color:${TEXT};">${escape(event.arrivalNote)}</div>`) : '',
      row(
        `<div style="border-top:1px solid rgba(247,238,220,0.15);padding-top:18px;font-size:14px;line-height:1.6;color:${MUTED};">
Order <strong style="color:${TEXT};">${escape(order.orderNumber)}</strong> · ${escape(formatPrice(order.totalCents))}${order.items.map((item) => `<br>${item.quantity} × ${escape(item.tierName)}`).join('')}
${event.refundPolicy ? `<br><br>${escape(event.refundPolicy)}` : ''}
</div>`,
      ),
      row(button(ticketsUrl, 'Open my tickets')),
      row(`<div style="font-size:13px;line-height:1.6;color:${MUTED};">Show any of these codes at the door, on your phone or printed. <a href="${escape(event.directionsUrl)}" style="color:${AMBER};">Directions</a> · <a href="${escape(termsUrl)}" style="color:${AMBER};">Ticket terms</a> · ${escape(settings.phone.value)}</div>`, '0 16px 32px'),
    ].join(''),
    `${event.title} — ${formatEventDateLong(event.startsAt)}. Your tickets are inside.`,
  );

  const text = [
    "You're in.",
    '',
    event.title,
    `${formatEventDateLong(event.startsAt)} · ${formatTimeRangeCompact(event.startsAt, event.endsAt)}`,
    `${event.venueName}, ${event.address}`,
    '',
    'Your ticket codes:',
    ...tickets.map((entry, index) => `  ${entry.ticket.code}  (${entry.tierName}${entry.ticket.seats > 1 ? `, ${entry.ticket.seats} seats` : ''}, ${index + 1} of ${tickets.length})`),
    '',
    `Open your tickets (QR codes): ${ticketsUrl}`,
    '',
    ...(event.arrivalNote ? [event.arrivalNote, ''] : []),
    `Order ${order.orderNumber} · ${formatPrice(order.totalCents)}`,
    ...order.items.map((item) => `  ${item.quantity} × ${item.tierName}`),
    ...(event.refundPolicy ? ['', event.refundPolicy] : []),
    '',
    `Directions: ${event.directionsUrl}`,
    `Ticket terms: ${termsUrl}`,
    `Oasis Mexican Kitchen & Bar · ${settings.phone.value}`,
  ].join('\n');

  return { subject, html, text };
}

export function renderReminder({
  order,
  event,
  tickets,
  ticketsUrl,
  settings,
}: {
  order: OrderRecord;
  event: EmailEvent;
  tickets: EmailTicket[];
  ticketsUrl: string;
  settings: SiteSettings;
}): RenderedEmail {
  const shown = tickets.slice(0, tickets.length > 4 ? 1 : 4);
  const subject = `Tomorrow — ${event.title}, ${formatTimeRangeCompact(event.startsAt, event.endsAt)}`;
  const html = shell(
    [
      eventHeader(event, 'See you tomorrow.'),
      row(shown.map((entry, index) => qrBlock(entry, index, tickets.length)).join('')),
      tickets.length > 4 ? row(button(ticketsUrl, `Open all ${tickets.length} tickets`)) : '',
      row(`<div style="font-size:15px;line-height:1.6;color:${TEXT};">${escape(event.arrivalNote ?? 'Arrive a little early to pick your seat. Parking is free behind the building.')}</div>`),
      row(button(ticketsUrl, 'Open my tickets')),
      row(`<div style="font-size:13px;line-height:1.6;color:${MUTED};">Order ${escape(order.orderNumber)} · <a href="${escape(event.directionsUrl)}" style="color:${AMBER};">Directions</a> · ${escape(settings.phone.value)}</div>`, '0 16px 32px'),
    ].join(''),
    `${event.title} is tomorrow at ${formatTimeRangeCompact(event.startsAt, event.endsAt)}.`,
  );
  const text = [
    'See you tomorrow.',
    '',
    event.title,
    `${formatEventDateLong(event.startsAt)} · ${formatTimeRangeCompact(event.startsAt, event.endsAt)}`,
    `${event.venueName}, ${event.address}`,
    '',
    'Your ticket codes:',
    ...tickets.map((entry) => `  ${entry.ticket.code}  (${entry.tierName})`),
    '',
    `Open your tickets: ${ticketsUrl}`,
    event.arrivalNote ?? 'Arrive a little early to pick your seat.',
    '',
    `Order ${order.orderNumber} · Directions: ${event.directionsUrl} · ${settings.phone.value}`,
  ].join('\n');
  return { subject, html, text };
}

/**
 * Tonight, a few hours before doors. Scaffolding: no stage sends this yet
 * (see src/app/api/cron/reminders/route.ts). Kept short on purpose — it is
 * read standing up, on the way out of the house.
 */
export function renderTonight({
  order,
  event,
  tickets,
  ticketsUrl,
  settings,
}: {
  order: OrderRecord;
  event: EmailEvent;
  tickets: EmailTicket[];
  ticketsUrl: string;
  settings: SiteSettings;
}): RenderedEmail {
  const shown = tickets.slice(0, tickets.length > 4 ? 1 : 4);
  const subject = `Tonight — ${event.title}, doors ${formatTimeRangeCompact(event.startsAt, event.endsAt)}`;
  const html = shell(
    [
      eventHeader(event, 'Tonight.'),
      row(shown.map((entry, index) => qrBlock(entry, index, tickets.length)).join('')),
      row(`<div style="font-size:15px;line-height:1.6;color:${TEXT};">${escape(event.arrivalNote ?? 'Turn your screen brightness up before you reach the door — it is the one thing scanners struggle with.')}</div>`),
      row(button(ticketsUrl, 'Open my tickets')),
      row(`<div style="font-size:13px;line-height:1.6;color:${MUTED};">Order ${escape(order.orderNumber)} · <a href="${escape(event.directionsUrl)}" style="color:${AMBER};">Directions</a> · ${escape(settings.phone.value)}</div>`, '0 16px 32px'),
    ].join(''),
    `${event.title} is tonight.`,
  );
  const text = [
    'Tonight.',
    '',
    event.title,
    `${formatEventDateLong(event.startsAt)} · ${formatTimeRangeCompact(event.startsAt, event.endsAt)}`,
    `${event.venueName}, ${event.address}`,
    '',
    ...tickets.map((entry) => `  ${entry.ticket.code}  (${entry.tierName})`),
    '',
    `Open your tickets: ${ticketsUrl}`,
    `Directions: ${event.directionsUrl} · ${settings.phone.value}`,
  ].join('\n');
  return { subject, html, text };
}

/**
 * The morning after. Scaffolding, off by default: no QR, nothing to scan, one
 * thank you and one thing to do next. A review link is asked for once, here,
 * and never in the middle of a night out.
 */
export function renderThanks({
  event,
  settings,
  eventsUrl,
  reviewUrl,
}: {
  event: EmailEvent;
  settings: SiteSettings;
  eventsUrl: string;
  reviewUrl: string | null;
}): RenderedEmail {
  const subject = `Thanks for coming to ${event.title}`;
  const html = shell(
    [
      eventHeader(event, 'Thanks for coming.'),
      row(`<div style="font-size:15px;line-height:1.6;color:${TEXT};">It was good to have you in. Here is what is on next — and if you had a good night, a review genuinely helps a small restaurant.</div>`),
      row(button(eventsUrl, "What's on next")),
      reviewUrl ? row(`<div style="font-size:14px;line-height:1.6;color:${MUTED};"><a href="${escape(reviewUrl)}" style="color:${AMBER};">Leave a review</a></div>`) : '',
      row(`<div style="font-size:13px;line-height:1.6;color:${MUTED};">${escape(settings.name)} · ${escape(settings.phone.value)}</div>`, '0 16px 32px'),
    ].join(''),
    `Thanks for coming to ${event.title}.`,
  );
  const text = [
    'Thanks for coming.',
    '',
    `It was good to have you at ${event.title}.`,
    '',
    `What's on next: ${eventsUrl}`,
    ...(reviewUrl ? [`Leave a review: ${reviewUrl}`] : []),
    '',
    `${settings.name} · ${settings.phone.value}`,
  ].join('\n');
  return { subject, html, text };
}
