import { notFound, redirect } from 'next/navigation';
import { AdminShell, NoAccess } from '@/components/admin/AdminShell';
import { Card, EmptyState, HelpNote, LinkButton } from '@/components/admin/ui';
import { getReadDb, isLocalDb } from '@/lib/db';
import type { Row } from '@/lib/db/types';
import { formatEventDateCompact, formatPrice, formatTimeRangeCompact } from '@/lib/format';
import { getStaff, staffCan } from '@/server/auth';
import { occurrenceFromRow } from '@/server/content/events';
import { canOpen } from '@/server/permissions';
import { isTicketingConfigured } from '@/server/ticketing/db';
import { getSalesSummaries, listOrders } from '@/server/ticketing/sales';
import { RefundButton } from './RefundButton';
import { ResendTickets } from './ResendTickets';

export const dynamic = 'force-dynamic';

/**
 * Sales for one event: the numbers, then the orders.
 *
 * Kept to what a restaurant running four events a month needs — sold, gross,
 * net, web against door, who bought, whether they came in. No charts.
 */
export default async function SalesPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await getStaff();
  if (!staff) redirect('/admin/login');
  const local = isLocalDb();
  if (!canOpen({ role: staff.role, sections: staff.sections }, 'events')) {
    return (
      <AdminShell staff={staff} local={local} title="Sales">
        <NoAccess what="events" />
      </AdminShell>
    );
  }
  const [{ slug }, { q }] = await Promise.all([params, searchParams]);
  const id = decodeURIComponent(slug);
  const db = getReadDb();
  const row = db ? await db.get<Row>('event_occurrences', id) : null;
  if (!row) notFound();
  const event = occurrenceFromRow(row, 'working');

  const [summaries, orders] = await Promise.all([getSalesSummaries([id]), listOrders(id, q ?? '')]);
  const summary = summaries.get(id) ?? null;
  const canRefund = staffCan(staff, 'content.publish');

  return (
    <AdminShell
      staff={staff}
      local={local}
      title={event.title ?? 'Event'}
      description={`${formatEventDateCompact(event.startsAt)} · ${formatTimeRangeCompact(event.startsAt, event.endsAt ?? event.startsAt)}`}
      backTo={{ href: '/admin/events', label: 'Events' }}
      actions={
        <>
          <LinkButton href={`/admin/events/${encodeURIComponent(id)}/sales/export`} variant="secondary">Export CSV</LinkButton>
          <LinkButton href={`/admin/door?event=${encodeURIComponent(id)}`} variant="primary">Door</LinkButton>
        </>
      }
    >
      {!isTicketingConfigured() ? (
        <HelpNote>Ticket sales are not connected on this copy of the site, so there are no figures to show.</HelpNote>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Figure label="Sold" value={summary ? `${summary.ticketsSold}${summary.capacity ? ` / ${summary.capacity}` : ''}` : '0'} />
        <Figure label="Gross" value={formatPrice(summary?.grossCents ?? 0)} />
        <Figure label="Refunded" value={formatPrice(summary?.refundedCents ?? 0)} />
        <Figure label="Net" value={formatPrice(summary?.netCents ?? 0)} />
      </div>
      <p className="tabular mt-3 text-[0.9375rem] text-brown-soft">
        {formatPrice(summary?.webCents ?? 0)} online · {formatPrice(summary?.doorCents ?? 0)} at the door
        {summary?.compOrders ? ` · ${summary.compOrders} comped` : ''} · {summary?.checkedIn ?? 0} checked in
      </p>

      <Card
        title={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}
        action={
          <form className="flex gap-2" role="search">
            <label htmlFor="sales-q" className="sr-only">Search by name or email</label>
            <input
              id="sales-q"
              name="q"
              defaultValue={q ?? ''}
              placeholder="Name or email"
              className="min-h-10 rounded-(--radius-sm) border border-brown/25 bg-linen px-3 text-[0.9375rem] text-brown placeholder:text-brown-soft/60"
            />
            <button type="submit" className="inline-flex min-h-10 items-center rounded-(--radius-sm) border border-brown/25 px-3 text-[0.875rem] font-semibold text-brown">Search</button>
          </form>
        }
      >
        {orders.length === 0 ? (
          <EmptyState>{q ? 'Nobody matches that.' : 'No orders yet.'}</EmptyState>
        ) : (
          <ul className="divide-y divide-brown/10">
            {orders.map((order) => {
              const checkedIn = order.tickets.filter((ticket) => ticket.status === 'checked_in').length;
              return (
                <li key={order.id} className="grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center">
                  <p className="tabular text-[0.875rem] font-semibold text-brown">{order.orderNumber}</p>
                  <div className="min-w-0">
                    <p className="truncate text-[0.9375rem] text-brown">
                      {order.customerName || 'No name'}{' '}
                      <span className="text-brown-soft">{order.customerEmail ?? ''}</span>
                    </p>
                    <p className="tabular text-[0.8125rem] text-brown-soft">
                      {order.items.map((item) => `${item.quantity} × ${item.tierName}`).join(', ')} · {formatPrice(order.totalCents)}
                      {order.source !== 'web' ? ` · ${order.source}` : ''}
                      {order.paidAt ? ` · ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' }).format(new Date(order.paidAt))}` : ''}
                      {' · '}
                      {order.status === 'refunded' ? 'refunded' : order.status === 'disputed' ? 'disputed' : order.status === 'partially_refunded' ? `partly refunded (${formatPrice(order.refundedCents)})` : checkedIn > 0 ? `${checkedIn} of ${order.tickets.length} in` : 'not in yet'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status === 'paid' || order.status === 'partially_refunded' ? (
                      <ResendTickets orderNumber={order.orderNumber} email={order.customerEmail} />
                    ) : null}
                    {canRefund && order.status !== 'refunded' && order.status !== 'disputed' ? (
                      <RefundButton orderId={order.id} amount={formatPrice(order.totalCents - order.refundedCents)} />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </AdminShell>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="admin-raised rounded-(--radius-md) border border-brown/12 bg-linen px-4 py-3">
      <p className="text-[0.8125rem] font-semibold text-brown-soft">{label}</p>
      <p className="admin-figure mt-1 text-[clamp(1.75rem,3vw,2.25rem)] text-brown">{value}</p>
    </div>
  );
}
