import 'server-only';

/**
 * Where the confirmation email will be sent from.
 *
 * Wired in the ticket-delivery branch. Until then, nothing goes out — but
 * the webhook already calls these after its commit, so adding the mailer is
 * a change to this file and to nothing else. Both must never throw: an email
 * failure is queued, never a reason for a paid order to look unpaid.
 */
export async function sendOrderConfirmation(orderId: string): Promise<void> {
  void orderId;
}

export async function alertOwner(subject: string, body: string): Promise<void> {
  console.warn(`[alert] ${subject}\n${body}`);
}
