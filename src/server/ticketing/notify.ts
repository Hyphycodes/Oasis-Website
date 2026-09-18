import 'server-only';

import { sendOwnerAlert, sendTicketEmail } from './email/send';

/**
 * What the webhook calls after its commit. Neither may throw: an email
 * failure is logged in `email_log` and retried from the tickets page or the
 * admin, never surfaced as a failed payment.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  await sendTicketEmail(orderId, 'confirmation');
}

export async function alertOwner(subject: string, body: string): Promise<void> {
  console.warn(`[alert] ${subject}\n${body}`);
  await sendOwnerAlert(subject, body);
}
