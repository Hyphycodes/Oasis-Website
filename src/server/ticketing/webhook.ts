import type Stripe from 'stripe';

/**
 * What a Stripe event does to an order.
 *
 * Pure: every database effect goes through `WebhookStore`, so the branches
 * can be tested against an in-memory double with no Stripe and no Postgres.
 * The route handler verifies the signature, records the event id (that insert
 * is the idempotency guard) and then calls `handleStripeEvent`.
 *
 * This is the ONLY place an order becomes paid. The success redirect never
 * fulfils. Email goes out after the store has committed and may never make
 * the webhook fail.
 */

export interface StoredOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalCents: number;
  refundedCents: number;
  stripePaymentIntentId: string | null;
}

export interface WebhookStore {
  findOrderByPaymentIntent(paymentIntentId: string): Promise<StoredOrder | null>;
  /** `fulfill_order`: mark paid, mint tickets exactly once. */
  fulfill(orderId: string, chargeId: string | null, paidAt: Date): Promise<{ minted: number }>;
  setStatus(orderId: string, status: string, patch?: Record<string, unknown>): Promise<void>;
  releaseHolds(orderId: string): Promise<void>;
  voidTickets(orderId: string, status: 'void' | 'refunded'): Promise<void>;
  log(message: string): void;
}

export interface WebhookEffects {
  sendConfirmation(orderId: string): Promise<void>;
  alertOwner(subject: string, body: string): Promise<void>;
}

export type WebhookOutcome =
  | { handled: true; action: string; orderId?: string }
  | { handled: false; reason: string };

function paymentIntentId(value: string | Stripe.PaymentIntent | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function chargeId(pi: Stripe.PaymentIntent): string | null {
  const latest = pi.latest_charge;
  if (!latest) return null;
  return typeof latest === 'string' ? latest : latest.id;
}

export async function handleStripeEvent(
  event: Stripe.Event,
  store: WebhookStore,
  effects: WebhookEffects,
): Promise<WebhookOutcome> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      const order = await store.findOrderByPaymentIntent(pi.id);
      if (!order) return { handled: false, reason: `no order for ${pi.id}` };
      const { minted } = await store.fulfill(order.id, chargeId(pi), new Date(event.created * 1000));
      store.log(`paid ${order.orderNumber}, minted ${minted}`);
      // After the commit, and never allowed to fail the webhook.
      if (minted > 0) {
        try {
          await effects.sendConfirmation(order.id);
        } catch (error) {
          store.log(`confirmation email failed for ${order.orderNumber}: ${String(error)}`);
        }
      }
      return { handled: true, action: 'paid', orderId: order.id };
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      const order = await store.findOrderByPaymentIntent(pi.id);
      if (!order) return { handled: false, reason: `no order for ${pi.id}` };
      if (order.status === 'paid') return { handled: true, action: 'ignored-already-paid', orderId: order.id };
      const reason = pi.last_payment_error?.message ?? pi.last_payment_error?.code ?? 'unknown';
      await store.setStatus(order.id, 'failed', { notes: `Payment failed: ${reason}` });
      await store.releaseHolds(order.id);
      store.log(`failed ${order.orderNumber}: ${reason}`);
      return { handled: true, action: 'failed', orderId: order.id };
    }

    case 'payment_intent.canceled': {
      const pi = event.data.object;
      const order = await store.findOrderByPaymentIntent(pi.id);
      if (!order) return { handled: false, reason: `no order for ${pi.id}` };
      if (order.status === 'paid') return { handled: true, action: 'ignored-already-paid', orderId: order.id };
      await store.setStatus(order.id, 'canceled');
      await store.releaseHolds(order.id);
      return { handled: true, action: 'canceled', orderId: order.id };
    }

    case 'charge.refunded': {
      const charge = event.data.object;
      const piId = paymentIntentId(charge.payment_intent);
      if (!piId) return { handled: false, reason: 'refund without a payment intent' };
      const order = await store.findOrderByPaymentIntent(piId);
      if (!order) return { handled: false, reason: `no order for ${piId}` };
      const refunded = charge.amount_refunded;
      const full = refunded >= order.totalCents;
      await store.setStatus(order.id, full ? 'refunded' : 'partially_refunded', {
        refunded_cents: refunded,
        ...(full ? {} : { notes: 'Partial refund from Stripe. Tickets left valid; decide which to void.' }),
      });
      // A full refund voids every ticket. A partial one voids none on its own —
      // the admin decides which — and is flagged.
      if (full) await store.voidTickets(order.id, 'refunded');
      else await effects.alertOwner(`Partial refund on ${order.orderNumber}`, `Stripe refunded ${refunded} cents of ${order.totalCents}. Decide which tickets to void in the admin.`);
      return { handled: true, action: full ? 'refunded' : 'partially_refunded', orderId: order.id };
    }

    case 'charge.dispute.created': {
      const dispute = event.data.object;
      const piId = paymentIntentId(dispute.payment_intent);
      if (!piId) return { handled: false, reason: 'dispute without a payment intent' };
      const order = await store.findOrderByPaymentIntent(piId);
      if (!order) return { handled: false, reason: `no order for ${piId}` };
      await store.setStatus(order.id, 'disputed', { notes: `Disputed: ${dispute.reason ?? 'no reason given'}` });
      await store.voidTickets(order.id, 'void');
      await effects.alertOwner(
        `Chargeback on ${order.orderNumber}`,
        `A guest disputed ${order.totalCents} cents. Their tickets are void and will scan red. Respond in the Stripe Dashboard.`,
      );
      return { handled: true, action: 'disputed', orderId: order.id };
    }

    default:
      store.log(`ignored ${event.type}`);
      return { handled: false, reason: `unhandled ${event.type}` };
  }
}
