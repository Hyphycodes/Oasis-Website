import { describe, expect, it } from 'vitest';
import type Stripe from 'stripe';
import { handleStripeEvent, type StoredOrder, type WebhookStore } from './webhook';

function memoryStore(order: StoredOrder) {
  const state = {
    order: { ...order },
    tickets: 0,
    holdsReleased: 0,
    ticketStatus: 'valid' as string,
    logs: [] as string[],
  };
  const store: WebhookStore = {
    async findOrderByPaymentIntent(id) {
      return state.order.stripePaymentIntentId === id ? state.order : null;
    },
    async fulfill(_id, _charge, _paidAt) {
      // Mirrors fulfill_order: a second call mints nothing.
      if (state.order.status === 'paid') return { minted: 0 };
      state.order.status = 'paid';
      state.tickets = 2;
      return { minted: 2 };
    },
    async setStatus(_id, status, patch) {
      state.order.status = status;
      if (patch && typeof patch.refunded_cents === 'number') state.order.refundedCents = patch.refunded_cents;
    },
    async releaseHolds() {
      state.holdsReleased += 1;
    },
    async voidTickets(_id, status) {
      state.ticketStatus = status;
    },
    log(message) {
      state.logs.push(message);
    },
  };
  return { store, state };
}

const baseOrder: StoredOrder = {
  id: 'order-1',
  orderNumber: 'OAS-TEST1',
  status: 'pending',
  totalCents: 2000,
  refundedCents: 0,
  stripePaymentIntentId: 'pi_1',
};

function event(type: string, object: Record<string, unknown>): Stripe.Event {
  return { id: `evt_${type}`, type, created: 1_700_000_000, data: { object } } as unknown as Stripe.Event;
}

function effects() {
  const calls = { confirmations: 0, alerts: [] as string[] };
  return {
    calls,
    effects: {
      async sendConfirmation() {
        calls.confirmations += 1;
      },
      async alertOwner(subject: string) {
        calls.alerts.push(subject);
      },
    },
  };
}

describe('handleStripeEvent', () => {
  it('payment_intent.succeeded pays the order, mints once, emails once', async () => {
    const { store, state } = memoryStore(baseOrder);
    const fx = effects();
    const pi = { id: 'pi_1', latest_charge: 'ch_1' };
    const first = await handleStripeEvent(event('payment_intent.succeeded', pi), store, fx.effects);
    const replay = await handleStripeEvent(event('payment_intent.succeeded', pi), store, fx.effects);
    expect(first).toMatchObject({ handled: true, action: 'paid' });
    expect(replay).toMatchObject({ handled: true, action: 'paid' });
    expect(state.order.status).toBe('paid');
    expect(state.tickets).toBe(2);
    expect(fx.calls.confirmations).toBe(1);
  });

  it('a failing email never fails the webhook', async () => {
    const { store, state } = memoryStore(baseOrder);
    const outcome = await handleStripeEvent(
      event('payment_intent.succeeded', { id: 'pi_1', latest_charge: 'ch_1' }),
      store,
      { sendConfirmation: async () => { throw new Error('smtp down'); }, alertOwner: async () => {} },
    );
    expect(outcome.handled).toBe(true);
    expect(state.order.status).toBe('paid');
    expect(state.logs.some((line) => line.includes('confirmation email failed'))).toBe(true);
  });

  it('payment_intent.payment_failed fails the order and releases holds', async () => {
    const { store, state } = memoryStore(baseOrder);
    const fx = effects();
    await handleStripeEvent(
      event('payment_intent.payment_failed', { id: 'pi_1', last_payment_error: { message: 'Card declined' } }),
      store,
      fx.effects,
    );
    expect(state.order.status).toBe('failed');
    expect(state.holdsReleased).toBe(1);
  });

  it('payment_intent.canceled cancels and releases, but never un-pays', async () => {
    const { store, state } = memoryStore({ ...baseOrder, status: 'paid' });
    const fx = effects();
    const outcome = await handleStripeEvent(event('payment_intent.canceled', { id: 'pi_1' }), store, fx.effects);
    expect(outcome).toMatchObject({ action: 'ignored-already-paid' });
    expect(state.order.status).toBe('paid');

    const pending = memoryStore(baseOrder);
    await handleStripeEvent(event('payment_intent.canceled', { id: 'pi_1' }), pending.store, fx.effects);
    expect(pending.state.order.status).toBe('canceled');
    expect(pending.state.holdsReleased).toBe(1);
  });

  it('charge.refunded in full voids every ticket; partial flags the owner', async () => {
    const full = memoryStore({ ...baseOrder, status: 'paid' });
    const fx = effects();
    await handleStripeEvent(event('charge.refunded', { payment_intent: 'pi_1', amount_refunded: 2000 }), full.store, fx.effects);
    expect(full.state.order.status).toBe('refunded');
    expect(full.state.ticketStatus).toBe('refunded');

    const partial = memoryStore({ ...baseOrder, status: 'paid' });
    await handleStripeEvent(event('charge.refunded', { payment_intent: 'pi_1', amount_refunded: 500 }), partial.store, fx.effects);
    expect(partial.state.order.status).toBe('partially_refunded');
    expect(partial.state.order.refundedCents).toBe(500);
    expect(partial.state.ticketStatus).toBe('valid');
    expect(fx.calls.alerts[0]).toMatch(/Partial refund/);
  });

  it('charge.dispute.created voids tickets and alerts the owner', async () => {
    const { store, state } = memoryStore({ ...baseOrder, status: 'paid' });
    const fx = effects();
    await handleStripeEvent(event('charge.dispute.created', { payment_intent: 'pi_1', reason: 'fraudulent' }), store, fx.effects);
    expect(state.order.status).toBe('disputed');
    expect(state.ticketStatus).toBe('void');
    expect(fx.calls.alerts[0]).toMatch(/Chargeback/);
  });

  it('unknown events are logged and ignored', async () => {
    const { store, state } = memoryStore(baseOrder);
    const outcome = await handleStripeEvent(event('customer.created', {}), store, effects().effects);
    expect(outcome.handled).toBe(false);
    expect(state.logs[0]).toContain('ignored customer.created');
  });
});
