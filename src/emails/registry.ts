/**
 * Every email the system knows how to send, as data.
 *
 * The admin's Communications screen, the preview route and the delivery
 * log all read this one list, so adding an email is: a template, a line
 * here, and a method on the service. Nothing else has to learn about it.
 *
 * `logType` is what lands in `email_log.type`. `trigger` is the honest
 * state of the wiring — a template that exists but nothing sends yet says
 * so here, where the owner can see it, rather than looking finished.
 */

export type TemplateId =
  | 'ticket_confirmation'
  | 'event_reminder'
  | 'ticket_resend'
  | 'refund_confirmation'
  | 'event_update'
  | 'thanks_for_coming'
  | 'staff_invitation'
  | 'magic_link'
  | 'password_reset'
  | 'verify_email'
  | 'welcome';

export type EmailLogType =
  | 'confirmation'
  | 'reminder'
  | 'tonight'
  | 'resend'
  | 'refund'
  | 'event_update'
  | 'cancellation'
  | 'thanks'
  | 'staff_invitation'
  | 'magic_link'
  | 'password_reset'
  | 'verify_email'
  | 'welcome'
  | 'owner_alert';

export type EmailCategory = 'transactional' | 'account' | 'staff';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  /** One sentence, for the admin list. */
  description: string;
  category: EmailCategory;
  logType: EmailLogType;
  /** Needs a real event to preview and to send a test. */
  needsEvent: boolean;
  /** What actually causes a send, in plain words. */
  trigger: string;
  /** `live` = wired to a real trigger; `manual` = a staff action; `template` = built, nothing sends it yet. */
  wiring: 'live' | 'manual' | 'template' | 'off';
  /** Preview variants the admin can pick. */
  variants?: { id: string; label: string }[];
}

export const TICKET_DIRECTIONS = [
  { id: 'pass', label: 'B · Digital pass (default)' },
  { id: 'editorial', label: 'A · Editorial' },
  { id: 'poster', label: 'C · Poster' },
] as const;

export const EMAIL_TEMPLATES: TemplateInfo[] = [
  {
    id: 'ticket_confirmation',
    name: 'Ticket confirmation',
    description: 'The tickets, with a QR each, sent the moment a payment is confirmed.',
    category: 'transactional',
    logType: 'confirmation',
    needsEvent: true,
    trigger: 'Stripe webhook, once payment_intent.succeeded is verified server-side; also a free (promo) order the moment it is reserved.',
    wiring: 'live',
    variants: [...TICKET_DIRECTIONS],
  },
  {
    id: 'event_reminder',
    name: 'Event reminder',
    description: '“Tomorrow at Oasis”: the night, the door details, the tickets again.',
    category: 'transactional',
    logType: 'reminder',
    needsEvent: true,
    trigger: 'Hourly cron, 23–25 hours before the event starts, once per order. A “tonight” variant exists and is switched off.',
    wiring: 'live',
    variants: [
      { id: 'tomorrow', label: 'Tomorrow' },
      { id: 'tonight', label: 'Tonight (stage off)' },
    ],
  },
  {
    id: 'ticket_resend',
    name: 'Ticket resend',
    description: 'The tickets again, and nothing else, for someone who asked.',
    category: 'transactional',
    logType: 'resend',
    needsEvent: true,
    trigger: '“Email these to me again” on the tickets page, or Resend tickets on an order in Sales. Three per order per ten minutes.',
    wiring: 'live',
  },
  {
    id: 'refund_confirmation',
    name: 'Refund confirmation',
    description: 'The amount, where it is going, and which tickets stop working.',
    category: 'transactional',
    logType: 'refund',
    needsEvent: true,
    trigger: 'Stripe webhook on charge.refunded (full or partial), and a register refund marked in Sales.',
    wiring: 'live',
    variants: [
      { id: 'full', label: 'Whole order' },
      { id: 'partial', label: 'Some tickets' },
    ],
  },
  {
    id: 'event_update',
    name: 'Event update / cancellation',
    description: 'A time, date or venue change, a postponement, or a cancellation, with the change first.',
    category: 'transactional',
    logType: 'event_update',
    needsEvent: true,
    trigger: 'Cancel event in the editor emails every ticket holder automatically. Other changes are sent from this screen, to one event’s ticket holders, on purpose.',
    wiring: 'live',
    variants: [
      { id: 'cancelled', label: 'Cancelled' },
      { id: 'time_change', label: 'Time change' },
      { id: 'date_change', label: 'Date change' },
      { id: 'venue_change', label: 'Venue change' },
      { id: 'postponed', label: 'Postponed' },
      { id: 'info', label: 'Information update' },
    ],
  },
  {
    id: 'thanks_for_coming',
    name: 'Thanks for coming',
    description: 'The morning after. One thank you, one link to what is on next.',
    category: 'transactional',
    logType: 'thanks',
    needsEvent: true,
    trigger: 'A cron stage that is built and switched off (src/app/api/cron/reminders/route.ts).',
    wiring: 'off',
  },
  {
    id: 'staff_invitation',
    name: 'Staff invitation',
    description: 'Welcome to the team, your role, one button to accept and sign in.',
    category: 'staff',
    logType: 'staff_invitation',
    needsEvent: false,
    trigger: 'Add a staff member in Team. Delivered through Supabase Auth: branded when the auth email hook points at this site, otherwise Supabase’s own template.',
    wiring: 'live',
  },
  {
    id: 'magic_link',
    name: 'Sign-in link',
    description: 'The passwordless sign-in link for staff.',
    category: 'account',
    logType: 'magic_link',
    needsEvent: false,
    trigger: '“Email me a sign-in link” on the staff sign-in page, through the Supabase auth email hook.',
    wiring: 'live',
  },
  {
    id: 'password_reset',
    name: 'Password reset',
    description: 'Choose a new password, for the password fallback.',
    category: 'account',
    logType: 'password_reset',
    needsEvent: false,
    trigger: 'A password reset requested through Supabase Auth, through the auth email hook.',
    wiring: 'live',
  },
  {
    id: 'verify_email',
    name: 'Verify email',
    description: 'Confirm an address for a new account or a changed email.',
    category: 'account',
    logType: 'verify_email',
    needsEvent: false,
    trigger: 'A signup or email change in Supabase Auth, through the auth email hook.',
    wiring: 'live',
  },
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'Your account is ready. Held for the day guests have accounts.',
    category: 'account',
    logType: 'welcome',
    needsEvent: false,
    trigger: 'Nothing yet — there are no customer accounts. Template only.',
    wiring: 'template',
  },
];

export function templateInfo(id: string): TemplateInfo | null {
  return EMAIL_TEMPLATES.find((template) => template.id === id) ?? null;
}

export function isTemplateId(value: string): value is TemplateId {
  return EMAIL_TEMPLATES.some((template) => template.id === value);
}
