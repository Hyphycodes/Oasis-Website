import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { StoredOrder, WebhookStore } from './webhook';

/** The webhook's store, backed by the service-role client. */
export function supabaseWebhookStore(client: SupabaseClient): WebhookStore {
  return {
    async findOrderByPaymentIntent(paymentIntentId) {
      const { data } = await client
        .from('orders')
        .select('id, order_number, status, total_cents, refunded_cents, stripe_payment_intent_id')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .maybeSingle();
      if (!data) return null;
      return {
        id: String(data.id),
        orderNumber: String(data.order_number),
        status: String(data.status),
        totalCents: Number(data.total_cents),
        refundedCents: Number(data.refunded_cents ?? 0),
        stripePaymentIntentId: (data.stripe_payment_intent_id as string | null) ?? null,
      } satisfies StoredOrder;
    },
    async fulfill(orderId, chargeId, paidAt) {
      const { data, error } = await client.rpc('fulfill_order', {
        p_order_id: orderId,
        p_charge_id: chargeId,
        p_paid_at: paidAt.toISOString(),
      });
      if (error) throw new Error(error.message);
      return { minted: Number((data as { minted?: number } | null)?.minted ?? 0) };
    },
    async setStatus(orderId, status, patch = {}) {
      const { error } = await client.from('orders').update({ status, ...patch }).eq('id', orderId);
      if (error) throw new Error(error.message);
    },
    async releaseHolds(orderId) {
      await client.from('ticket_holds').update({ released_at: new Date().toISOString() }).eq('order_id', orderId).is('released_at', null);
    },
    async voidTickets(orderId, status) {
      const { error } = await client.from('tickets').update({ status }).eq('order_id', orderId).neq('status', 'checked_in');
      if (error) throw new Error(error.message);
      // A checked-in ticket that is later refunded or disputed is still recorded
      // as such, so the door list tells the truth about who was let in.
      await client.from('tickets').update({ status }).eq('order_id', orderId).eq('status', 'checked_in');
    },
    log(message) {
      console.warn(`[stripe] ${message}`);
    },
  };
}
