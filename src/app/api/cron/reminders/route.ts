import { NextResponse, type NextRequest } from 'next/server';
import { getTicketingClient } from '@/server/ticketing/db';
import { sendTicketEmail } from '@/server/ticketing/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The lifecycle emails, hourly.
 *
 * One route, one pass per stage, because the alternative — scheduling a send
 * per order at purchase time — means a cancelled event still emails everybody
 * "see you tonight". Reading the database every hour is how a cancellation
 * silences the rest of the sequence for free.
 *
 * Only the day-before reminder is ON. The other two are written, wired and
 * disabled: turning one on is `enabled: true` here, once the owner asks for
 * it. That is deliberate — an unasked-for email costs more goodwill than it
 * earns, and the sender reputation of a brand-new domain is not worth
 * spending on a "thanks for coming".
 */

interface Stage {
  /** Matches the email_log type, which is also how a repeat is prevented. */
  id: 'reminder' | 'tonight' | 'thanks';
  enabled: boolean;
  /** Hours from now: events starting inside this window are in scope. Negative = already happened. */
  window: [number, number];
  label: string;
}

const STAGES: Stage[] = [
  { id: 'reminder', enabled: true, window: [23, 25], label: 'the day before' },
  { id: 'tonight', enabled: false, window: [3, 5], label: 'a few hours before doors' },
  { id: 'thanks', enabled: false, window: [-36, -12], label: 'the morning after' },
];

const MAX_PER_RUN = 200;

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const client = getTicketingClient();
  if (!client) return NextResponse.json({ ok: false, message: 'Ticketing is not configured.' }, { status: 503 });

  const results: Record<string, number> = {};

  for (const stage of STAGES) {
    if (!stage.enabled) continue;

    const from = new Date(Date.now() + stage.window[0] * 3_600_000).toISOString();
    const to = new Date(Date.now() + stage.window[1] * 3_600_000).toISOString();
    const { data: events } = await client
      .from('event_occurrences')
      .select('id')
      .is('series_slug', null)
      .eq('ticketing_enabled', true)
      .gte('starts_at', from)
      .lte('starts_at', to);
    const eventIds = (events ?? []).map((row) => String(row.id));
    if (eventIds.length === 0) {
      results[stage.id] = 0;
      continue;
    }

    const { data: orders } = await client
      .from('orders')
      .select('id')
      .in('event_id', eventIds)
      .in('status', ['paid', 'partially_refunded'])
      .not('customer_email', 'is', null)
      .limit(MAX_PER_RUN);

    let sent = 0;
    for (const order of orders ?? []) {
      // The day-before stage keeps its own column, which predates this loop and
      // is claimed atomically — two overlapping runs cannot both send it.
      if (stage.id === 'reminder') {
        const claimed = await client
          .from('orders')
          .update({ reminder_sent_at: new Date().toISOString() })
          .eq('id', order.id)
          .is('reminder_sent_at', null)
          .select('id');
        if (!claimed.data?.length) continue;
      } else {
        const { data: already } = await client
          .from('email_log')
          .select('id')
          .eq('order_id', order.id)
          .eq('type', stage.id)
          .eq('status', 'sent')
          .limit(1);
        if (already?.length) continue;
      }

      // Nothing to remind someone about if every ticket is already used or void.
      if (stage.id !== 'thanks') {
        const { data: unused } = await client.from('tickets').select('id').eq('order_id', order.id).eq('status', 'valid').limit(1);
        if (!unused?.length) continue;
      }

      if (await sendTicketEmail(String(order.id), stage.id)) sent += 1;
    }
    results[stage.id] = sent;
  }

  return NextResponse.json({ ok: true, ...results });
}
