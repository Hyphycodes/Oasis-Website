import { NextResponse, type NextRequest } from 'next/server';
import { ticketQrPng } from '@/lib/tickets/qr';
import { signTicketToken, verifyOrderToken } from '@/lib/ticketing/tokens';
import { getTicketingClient } from '@/server/ticketing/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tickets/[id]/qr.png?t=<order token>
 *
 * The QR encodes a signed payload, not the bare code. It is served only to
 * someone holding the order's signed link, and cached privately forever: a
 * ticket's QR never changes.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = request.nextUrl.searchParams.get('t') ?? '';
  const orderId = token ? verifyOrderToken(token) : null;
  if (!orderId) return new NextResponse('Not found', { status: 404 });

  const client = getTicketingClient();
  if (!client) return new NextResponse('Not available', { status: 503 });
  const { data } = await client.from('tickets').select('id, order_id, event_id').eq('id', id).maybeSingle();
  if (!data || data.order_id !== orderId) return new NextResponse('Not found', { status: 404 });

  const png = await ticketQrPng(signTicketToken(String(data.id), String(data.event_id)));
  return new NextResponse(new Uint8Array(png), {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'private, max-age=31536000, immutable',
    },
  });
}
