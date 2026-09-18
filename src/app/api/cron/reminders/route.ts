import { NextResponse, type NextRequest } from 'next/server';
import { getTicketingClient } from '@/server/ticketing/db';
import { sendTicketEmail } from '@/server/ticketing/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hourly: the day-before reminder.
 *
 * Paid orders for events starting in 23 to 25 hours that have not had a
 * reminder, are not refunded or disputed, and still have an unused ticket.
 * `reminder_sent_at` is set before the send so a slow hour never doubles up.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const client = getTicketingClient();
  if (!client) return NextResponse.json({ ok: false, message: 'Ticketing is not configured.' }, { status: 503 });

  const from = new Date(Date.now() + 23 * 3_600_000).toISOString();
  const to = new Date(Date.now() + 25 * 3_600_000).toISOString();
  const { data: events } = await client
    .from('event_occurrences')
    .select('id')
    .is('series_slug', null)
    .eq('ticketing_enabled', true)
    .gte('starts_at', from)
    .lte('starts_at', to);
  const eventIds = (events ?? []).map((row) => String(row.id));
  if (eventIds.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const { data: orders } = await client
    .from('orders')
    .select('id')
    .in('event_id', eventIds)
    .in('status', ['paid', 'partially_refunded'])
    .is('reminder_sent_at', null)
    .not('customer_email', 'is', null)
    .limit(200);

  let sent = 0;
  for (const order of orders ?? []) {
    const { data: unused } = await client.from('tickets').select('id').eq('order_id', order.id).eq('status', 'valid').limit(1);
    if (!unused?.length) continue;
    const claimed = await client
      .from('orders')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', order.id)
      .is('reminder_sent_at', null)
      .select('id');
    if (!claimed.data?.length) continue;
    if (await sendTicketEmail(String(order.id), 'reminder')) sent += 1;
  }
  return NextResponse.json({ ok: true, sent, events: eventIds.length });
}
