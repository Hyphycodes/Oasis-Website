import { NextResponse, type NextRequest } from 'next/server';
import { getTicketingClient } from '@/server/ticketing/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hygiene, every five minutes: expired pending orders become canceled and
 * their holds are released. Availability never depended on this running —
 * an expired hold stops counting the moment it expires — so a missed run
 * costs nothing but tidiness.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`. With no secret set the
 * route refuses, so it cannot be hit by a stranger on a preview deployment.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const client = getTicketingClient();
  if (!client) return NextResponse.json({ ok: false, message: 'Ticketing is not configured.' }, { status: 503 });

  const { data, error } = await client.rpc('release_expired_holds');
  if (error) {
    console.error('[cron] release_expired_holds failed:', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, released: data ?? 0 });
}
