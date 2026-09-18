import { NextResponse } from 'next/server';
import { getStaff, staffCan } from '@/server/auth';
import { disputeEvidence } from '@/server/ticketing/insight';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[orderId]/evidence — everything Stripe's dispute form asks
 * for, as text to paste. Manager and owner only: it contains the customer's
 * details and what they paid.
 */
export async function GET(_request: Request, context: { params: Promise<{ orderId: string }> }) {
  const staff = await getStaff();
  if (!staff || !staffCan(staff, 'content.publish')) return NextResponse.json({ ok: false }, { status: 403 });

  const { orderId } = await context.params;
  const evidence = await disputeEvidence(orderId);
  if (!evidence) return NextResponse.json({ ok: false, message: 'That order could not be found.' }, { status: 404 });
  return NextResponse.json({ ok: true, evidence }, { headers: { 'cache-control': 'no-store' } });
}
