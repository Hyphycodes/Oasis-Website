import { qrSvgDataUrl } from './utils/qr';
import type {
  EmailBrand,
  EmailCustomer,
  EmailEvent,
  EmailOrder,
  EmailTicket,
  EventUpdateProps,
  RefundConfirmationProps,
  StaffInvitationProps,
  TicketConfirmationProps,
  StaffEmailProps,
} from './types';

/**
 * Realistic Oasis data for the previews and the tests.
 *
 * Nothing here is a real guest. The events are the restaurant's own paint
 * nights, with the flyers that ship in the repository, because a preview of
 * a ticket email with a grey placeholder for artwork tells you nothing about
 * whether the artwork works.
 *
 * Every awkward case the templates promise to handle has a fixture: a guest
 * with no name, an event with no artwork, a title that wraps three lines, a
 * single ticket, five tickets across two tiers, a refunded order, a
 * cancelled night.
 */

/** Where preview images load from. The live deployment, so the flyers really show. */
export const PREVIEW_ORIGIN = 'https://oasis-website-mu.vercel.app';

export const brand: EmailBrand = {
  name: 'Oasis Mexican Kitchen & Bar',
  shortName: 'Oasis',
  siteUrl: PREVIEW_ORIGIN,
  logoUrl: `${PREVIEW_ORIGIN}/media/brand/oasis-logo.png`,
  phone: '(815) 545-7556',
  supportEmail: 'tickets@oasismexicankitchenbar.com',
  eventsUrl: `${PREVIEW_ORIGIN}/events`,
  termsUrl: `${PREVIEW_ORIGIN}/legal/tickets`,
  instagramUrl: 'https://www.instagram.com/oasismexbar/',
};

const venue = {
  name: 'Oasis Mexican Kitchen & Bar',
  address: '1250 E. 9th St., Lockport, IL 60441',
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent('Oasis Mexican Kitchen & Bar, 1250 E 9th St, Lockport, IL 60441'),
};

export const screamPaintSip: EmailEvent = {
  id: 'evt_scream',
  title: 'Scream Paint & Sip',
  summary: 'Paint the mask, sip a margarita, keep the canvas.',
  startsAt: '2026-10-17T00:00:00.000Z', // Fri Oct 16, 7pm Chicago
  endsAt: '2026-10-17T03:00:00.000Z',
  doorsAt: '2026-10-16T23:30:00.000Z',
  venue,
  artworkUrl: `${PREVIEW_ORIGIN}/events/flyers/scream-paint-sip.jpg`,
  artworkWidth: 1080,
  artworkHeight: 1072,
  accentColor: '#b3241a',
  arrivalNote: 'Doors at 6:30. All materials are provided — just bring yourself. Seats are first come, first served.',
  agePolicy: '21+',
  refundPolicy: 'Tickets are non-refundable within 48 hours of the event. Before that, email us and we will make it right.',
  eventUrl: `${PREVIEW_ORIGIN}/events/scream-paint-sip`,
  status: 'scheduled',
};

export const snoopyPaintSip: EmailEvent = {
  ...screamPaintSip,
  id: 'evt_snoopy',
  title: 'Snoopy Paint & Sip Night',
  summary: 'A cosy fall night of painting, with brunch cocktails.',
  startsAt: '2026-11-08T01:00:00.000Z', // Sat Nov 7, 7pm
  endsAt: '2026-11-08T04:00:00.000Z',
  doorsAt: null,
  artworkUrl: `${PREVIEW_ORIGIN}/events/flyers/snoopy-paint-sip.jpg`,
  artworkWidth: 1080,
  artworkHeight: 1074,
  accentColor: '#c8862b',
  arrivalNote: null,
  agePolicy: 'all_ages',
  eventUrl: `${PREVIEW_ORIGIN}/events/snoopy-paint-sip`,
};

export const longTitleEvent: EmailEvent = {
  ...snoopyPaintSip,
  id: 'evt_long',
  title: 'Día de los Muertos Weekend: Live Mariachi, Sugar Skull Painting & Late-Night Tacos with DJ Nightbloom',
  artworkUrl: `${PREVIEW_ORIGIN}/events/flyers/hello-kitty-fall-paint-lunch.jpg`,
  artworkWidth: 1080,
  artworkHeight: 1083,
  venue: { ...venue, name: 'Oasis Mexican Kitchen & Bar — The Patio Tent (enter from the rear lot off 9th Street)' },
  agePolicy: '18+',
};

export const noArtworkEvent: EmailEvent = {
  ...screamPaintSip,
  id: 'evt_noart',
  title: 'Salsa Night with Orquesta Luna',
  summary: null,
  artworkUrl: null,
  artworkWidth: null,
  artworkHeight: null,
  accentColor: null,
  arrivalNote: null,
  eventUrl: `${PREVIEW_ORIGIN}/events/salsa-night`,
};

export const cancelledEvent: EmailEvent = { ...screamPaintSip, status: 'cancelled' };

export const customer: EmailCustomer = { email: 'maria@example.com', firstName: 'María', fullName: 'María Delgado' };
export const anonymousCustomer: EmailCustomer = { email: 'guest@example.com', firstName: null, fullName: null };

function ticket(index: number, tierName: string, seats = 1, status: EmailTicket['status'] = 'valid'): EmailTicket {
  const code = ['7KX4-9QZM', 'B2NR-T8HD', 'M4JC-5VWP', 'Q9DF-2LKA', 'Z6HT-8NMB'][index] ?? `TK${index}0-AB${index}C`;
  const ticketUrl = `${PREVIEW_ORIGIN}/t/t1.preview${index}.sig`;
  return {
    id: `ticket_${index}`,
    code,
    tierName,
    seats,
    status,
    attendeeName: null,
    qrSrc: qrSvgDataUrl(ticketUrl),
    ticketUrl,
  };
}

function order(orderNumber: string, items: EmailOrder['items'], totalCents: number, extra: Partial<EmailOrder> = {}): EmailOrder {
  return {
    orderNumber,
    items,
    subtotalCents: items.reduce((sum, item) => sum + item.subtotalCents, 0),
    serviceFeeCents: 0,
    taxCents: 0,
    discountCents: 0,
    totalCents,
    refundedCents: 0,
    paidAt: '2026-10-02T19:14:00.000Z',
    ticketsUrl: `${PREVIEW_ORIGIN}/tickets/${orderNumber}?t=o1.preview.sig`,
    paymentMethod: 'Visa ending 4242',
    ...extra,
  };
}

export const singleTicketOrder = order('OAS-7KX49', [{ tierName: 'Painter', quantity: 1, unitPriceCents: 4500, subtotalCents: 4500 }], 4500);
export const singleTicket: EmailTicket[] = [ticket(0, 'Painter')];

export const threeTicketOrder = order('OAS-B2NRT', [{ tierName: 'Painter', quantity: 3, unitPriceCents: 4500, subtotalCents: 13500 }], 13500);
export const threeTickets: EmailTicket[] = [ticket(0, 'Painter'), ticket(1, 'Painter'), ticket(2, 'Painter')];

export const multiTierOrder = order(
  'OAS-M4JC5',
  [
    { tierName: 'Painter', quantity: 2, unitPriceCents: 4500, subtotalCents: 9000 },
    { tierName: 'Table of 4 (VIP)', quantity: 1, unitPriceCents: 16000, subtotalCents: 16000 },
    { tierName: 'Just Watching', quantity: 2, unitPriceCents: 1500, subtotalCents: 3000 },
  ],
  28000,
  { discountCents: 2000, subtotalCents: 30000, serviceFeeCents: 0, taxCents: 0, paymentMethod: 'Apple Pay · Visa ending 0091' },
);
export const multiTierTickets: EmailTicket[] = [
  ticket(0, 'Painter'),
  ticket(1, 'Painter'),
  ticket(2, 'Table of 4 (VIP)', 4),
  ticket(3, 'Just Watching'),
  ticket(4, 'Just Watching'),
];

export const itemizedOrder = order(
  'OAS-Q9DF2',
  [{ tierName: 'Painter', quantity: 2, unitPriceCents: 4500, subtotalCents: 9000 }],
  9876,
  { serviceFeeCents: 540, taxCents: 336, subtotalCents: 9000 },
);

export const ticketConfirmation: TicketConfirmationProps = {
  brand,
  customer,
  event: screamPaintSip,
  order: threeTicketOrder,
  tickets: threeTickets,
};

export const refund: RefundConfirmationProps = {
  brand,
  customer,
  event: screamPaintSip,
  order: { ...threeTicketOrder, refundedCents: 13500 },
  refundCents: 13500,
  tickets: threeTickets.map((entry) => ({ ...entry, status: 'refunded' as const, qrSrc: null })),
  full: true,
  status: 'processing',
  reason: null,
};

export const partialRefund: RefundConfirmationProps = {
  ...refund,
  order: { ...multiTierOrder, refundedCents: 4500 },
  refundCents: 4500,
  tickets: [{ ...multiTierTickets[1]!, status: 'refunded', qrSrc: null }],
  full: false,
  status: 'completed',
  reason: 'One painter could not make it — refunded at the register.',
};

export const cancellation: EventUpdateProps = {
  brand,
  customer,
  event: cancelledEvent,
  order: threeTicketOrder,
  tickets: threeTickets.map((entry) => ({ ...entry, status: 'void' as const, qrSrc: null })),
  kind: 'cancelled',
  previous: null,
  message: 'Our instructor is unwell and we could not find a replacement in time. We are sorry — the next Scream night is already on the calendar and we would love to see you there.',
  refundCents: 13500,
};

export const timeChange: EventUpdateProps = {
  brand,
  customer,
  event: { ...screamPaintSip, startsAt: '2026-10-17T01:00:00.000Z', endsAt: '2026-10-17T04:00:00.000Z', doorsAt: '2026-10-17T00:30:00.000Z' },
  order: threeTicketOrder,
  tickets: threeTickets,
  kind: 'time_change',
  previous: { startsAt: screamPaintSip.startsAt, endsAt: screamPaintSip.endsAt, doorsAt: screamPaintSip.doorsAt },
  message: 'The kitchen is fully booked for a private party until 7:30, so we are starting an hour later. Your tickets are unchanged.',
  refundCents: null,
};

export const dateChange: EventUpdateProps = {
  ...timeChange,
  event: { ...screamPaintSip, startsAt: '2026-10-24T00:00:00.000Z', endsAt: '2026-10-24T03:00:00.000Z', doorsAt: '2026-10-23T23:30:00.000Z' },
  kind: 'date_change',
  previous: { startsAt: screamPaintSip.startsAt, endsAt: screamPaintSip.endsAt },
  message: null,
};

export const postponed: EventUpdateProps = {
  ...timeChange,
  event: { ...screamPaintSip, status: 'postponed' },
  kind: 'postponed',
  previous: null,
  message: 'We are moving this night to November. Your tickets carry over automatically; if the new date does not work, reply and we will refund you.',
};

export const staffInvitation: StaffInvitationProps = {
  brand,
  name: 'Alex Rivera',
  email: 'alex@example.com',
  role: 'Manager',
  invitedBy: 'Jerry',
  acceptUrl: `${PREVIEW_ORIGIN}/auth/activate#preview`,
  expiresInHours: 24,
};

/* ---------------------------------------------------------- staff operations */

const staffBase = {
  brand,
  name: 'Carlos Mendoza',
  email: 'carlos@example.com',
};

export const staffWelcome: StaffEmailProps = {
  ...staffBase,
  headline: 'Welcome to Oasis, Carlos.',
  intro: 'Alex added you to the Oasis team as a Bartender at Oasis Lockport. Everything you need for work — your schedule, training, tasks and documents — is in the Oasis staff app.',
  details: [
    { label: 'Position', value: 'Bartender' },
    { label: 'Location', value: 'Oasis Lockport' },
    { label: 'Start date', value: 'Friday, October 2' },
  ],
  note: 'Finish your onboarding checklist before your first shift. It takes about twenty minutes.',
  actionUrl: `${PREVIEW_ORIGIN}/staff/onboarding`,
  actionLabel: 'Start onboarding',
};

export const schedulePublished: StaffEmailProps = {
  ...staffBase,
  headline: 'Your schedule for Sep 28 – Oct 4 is out.',
  intro: 'Three shifts this week at Oasis Lockport.',
  details: [
    { label: 'Fri Oct 2', value: '5:00 PM – Close · Bartender' },
    { label: 'Sat Oct 3', value: '8:30 PM – 2:30 AM · Bartender · Oasis Latin Saturdays' },
    { label: 'Sun Oct 4', value: '4:00 PM – 10:00 PM · Bartender · Bad Bunny Paint & Sip' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/staff/schedule`,
  actionLabel: 'Open my schedule',
};

export const shiftChanged: StaffEmailProps = {
  ...staffBase,
  headline: 'Your Saturday shift moved.',
  intro: 'A manager changed one of your published shifts.',
  details: [
    { label: 'Was', value: 'Sat Oct 3 · 8:30 PM – 2:30 AM · Bartender' },
    { label: 'Now', value: 'Sat Oct 3 · 7:00 PM – 2:30 AM · Bartender' },
    { label: 'Location', value: 'Oasis Lockport' },
  ],
  note: 'Doors open earlier for Latin Saturdays this week. Thanks for coming in early.',
  actionUrl: `${PREVIEW_ORIGIN}/staff/schedule`,
  actionLabel: 'See the shift',
};

export const timeOffDecision: StaffEmailProps = {
  ...staffBase,
  headline: 'Your time off is approved.',
  intro: 'Alex approved your request. It is on the schedule, and you will not be scheduled for those days.',
  details: [
    { label: 'Dates', value: 'Wed Oct 14 – Thu Oct 15' },
    { label: 'Decided by', value: 'Alex' },
  ],
  note: 'Enjoy it.',
  actionUrl: `${PREVIEW_ORIGIN}/staff/time-off`,
  actionLabel: 'View my requests',
};

export const trainingRequired: StaffEmailProps = {
  ...staffBase,
  headline: 'New training: Door & QR scanner.',
  intro: 'A required module was assigned to you. It takes about 15 minutes and ends with a short quiz.',
  details: [
    { label: 'Module', value: 'Door & QR scanner' },
    { label: 'Due', value: 'Friday, October 9' },
    { label: 'Passing score', value: '80%' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/staff/training`,
  actionLabel: 'Start training',
};

export const documentExpiring: StaffEmailProps = {
  ...staffBase,
  headline: 'Your BASSET card expires soon.',
  intro: 'Upload the renewed card before it expires so you stay cleared to work the bar.',
  details: [
    { label: 'Document', value: 'BASSET / alcohol service' },
    { label: 'Expires', value: 'Friday, October 30' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/staff/documents`,
  actionLabel: 'Upload the new card',
};

export const eventAssignment: StaffEmailProps = {
  ...staffBase,
  headline: 'You are working Bad Bunny Paint & Sip.',
  intro: 'Alex put you on the door for Sunday’s event.',
  details: [
    { label: 'Event', value: 'Bad Bunny Paint & Sip' },
    { label: 'When', value: 'Sun Oct 4 · 5:00 PM – 10:00 PM' },
    { label: 'Role', value: 'Door' },
    { label: 'Doors', value: '6:00 PM' },
  ],
  note: 'Scanner phones are charging at the host stand. Wristbands are in the office.',
  actionUrl: `${PREVIEW_ORIGIN}/staff/schedule`,
  actionLabel: 'See the night',
};

/* ------------------------------------------------------- hiring and talent */

export const applicationReceived: StaffEmailProps = {
  brand,
  name: 'Marisol Reyes',
  email: 'marisol@example.com',
  headline: 'We have your application.',
  intro:
    'Thanks for putting your name in. Somebody at Oasis reads every one of these, and we will get in touch if it looks like a fit. If you would rather talk to a person, call us on (815) 545-7556.',
  details: [
    { label: 'Applied for', value: 'Bartender' },
    { label: 'Reference', value: 'JOB-260920-4K2P' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/events`,
  actionLabel: 'See what is on at Oasis',
  footerReason: 'Sent to marisol@example.com because an application was sent from the Oasis website.',
};

export const talentReceived: StaffEmailProps = {
  brand,
  name: 'DJ Nieve',
  email: 'nieve@example.com',
  headline: 'We got it.',
  intro:
    'Thanks for showing us what you do. We will have a proper look and reach out if something feels like a fit — a night, a wall, a set, whatever suits. No news does not mean no: we keep everybody on this list.',
  details: [
    { label: 'You sent', value: 'Open-format Latin sets — reggaetón, cumbia, a bit of house late.' },
    { label: 'Reference', value: 'TAL-260920-9XQ1' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/events`,
  actionLabel: 'See what is on at Oasis',
  footerReason: 'Sent to nieve@example.com because you sent your work through the Oasis website.',
};

export const submissionAlert: StaffEmailProps = {
  brand,
  name: null,
  email: 'owner@example.com',
  headline: 'Somebody sent their work.',
  intro: 'DJ Nieve — open-format Latin sets, reggaetón and cumbia',
  details: [
    { label: 'Does', value: 'Open-format Latin sets — reggaetón, cumbia, a bit of house late.' },
    { label: 'Books as', value: 'dj' },
    { label: 'Reach them', value: '(815) 555-0142 · nieve@example.com' },
    { label: 'Links', value: 'https://www.instagram.com/djnieve/' },
    { label: 'Photos', value: '2 attached' },
  ],
  note: null,
  actionUrl: `${PREVIEW_ORIGIN}/admin/talent`,
  actionLabel: 'Open the talent book',
  footerReason: 'Sent to the Oasis alert address. Turn it off in Emails.',
};
