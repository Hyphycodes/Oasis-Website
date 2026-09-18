# Ticketing — the core

How Oasis sells a ticket without overselling, without trusting the browser, and
with books that balance. This covers the schema and the database functions; the
checkout, the email and the door are documented alongside their own code.

---

## Where events live

The brief calls the table `events`. Here, a ticketed event is a **standalone
`event_occurrences` row** (`series_slug is null`) and its id is `text`
(`tickeri:xxxx` for imported rows, a uuid string for ones made in the admin).
Every ticketing table therefore references `event_id text`.

Migration `0007_ticketing_core.sql` adds to `event_occurrences`:

| Column | Meaning |
|---|---|
| `ticketing_enabled` | The switch. Off = the page falls back to the outside link or the door. |
| `capacity` | Event-level seat cap. Null = bounded only by the tiers. |
| `age_policy` | `all_ages` · `18+` · `21+` |
| `refund_policy` | Shown at checkout and persisted onto every order as consent text. |
| `fee_display` | `inclusive` (default: the tier price is the price) or `itemized`. |
| `tax_rate_bps`, `service_fee_bps`, `service_fee_flat_cents` | Rates in basis points. **Tax stays 0 until the accountant confirms.** |
| `venue_address`, `doors_open_at` | Optional overrides. |

## Tables

`ticket_tiers` · `orders` · `order_items` · `tickets` · `ticket_holds` ·
`promo_codes` · `scans` · `waitlist` · `processed_stripe_events`

Three things to know:

- **Money is integer cents.** Every amount column is `int`. Format at the edge only.
- **`order_items` is a snapshot.** Tier name and unit price are copied at order time; renaming
  a tier later never rewrites a receipt.
- **`tickets (order_item_id, seq)` is unique.** That pair is what makes minting idempotent —
  a replayed webhook cannot insert a second ticket #1.

## Availability is computed, never stored

There is no `tickets_remaining` column. `tier_seats_taken(tier)` and `event_seats_taken(event)`
sum `order_items.seats` over paid orders **and pending orders whose hold has not expired**. An
expired pending order stops counting the moment it expires, whether or not cleanup has run —
`release_expired_holds()` (called at the top of every reservation and by the five-minute cron at
`/api/cron/release-holds`) is hygiene, not correctness.

**`get_event_availability(event_id)`** is the one read. It returns event totals and, per tier,
`{tier_id, name, price_cents, capacity, taken, available, on_sale, …}` where `available` is
bounded by both the tier's own cap and whatever the event has left. The public page, the admin,
the reservation path and the door all read it; nothing else counts seats.

## Reserving seats

`reserve_order(event_id, items, promo_code, hold_minutes, source)` does the whole thing in one
transaction:

1. `release_expired_holds()`.
2. `select … from event_occurrences where id = $1 for update` — every buyer of an event is
   serialised on that one row. At this scale it is simpler than per-tier locking, and enough.
3. Validate: event on sale and not past; each tier active, inside its sales window, within
   `min_per_order`/`max_per_order`, and `taken + requested ≤ capacity`; the event cap.
4. Price (below).
5. Insert `orders` (status `pending`, `expires_at = now() + hold_minutes`), `order_items`, `ticket_holds`.
6. Return the priced order as JSON.

It raises with a distinct message the API maps to plain language: `TIER_SOLD_OUT`, `TIER_CLOSED`,
`MAX_PER_ORDER`, `EVENT_SOLD_OUT`, `PROMO_INVALID`, and so on (`src/server/ticketing/db.ts`).

`fulfill_order(order_id, charge_id, paid_at)` marks the order paid, releases its holds and mints
one `tickets` row per ticket bought (a "Table of 4" is one ticket with `seats = 4`). Calling it
twice returns the same tickets and mints nothing.

Both functions are **execute-revoked from `anon` and `authenticated`**. Only the service role can
call them, from server code.

## Pricing

Implemented once in SQL (`price_order`, used by `reserve_order`) and mirrored in
`src/lib/pricing.ts` for optimistic display. If they disagree, SQL wins.

```
face      = Σ price × qty
discount  = promo ? (percent: round(face × v/100) | amount: min(v, face)) : 0
net       = face − discount

itemized  : service = round(net × fee_bps/10000) + flat
            tax     = round((net + service) × tax_bps/10000)
            total   = net + service + tax          subtotal = face

inclusive : total   = net                          ← the guest pays the listed price
            tax     = round(total × tax_bps / (10000 + tax_bps))
            service = round((total − tax) × fee_bps/10000) + flat
            subtotal = face − tax − service        ← so the row still balances
```

`round` is half-up. The database enforces `total = subtotal + service + tax − discount` on every
order row; the unit tests pin both modes, a half-cent tax, a promo larger than the subtotal and a
zero-price tier.

## Row Level Security

- `ticket_tiers`: public `select` where the event is published and the tier is active. Writes:
  Owner and Manager.
- `orders`, `order_items`, `tickets`, `ticket_holds`, `scans`, `processed_stripe_events`:
  **no public policies at all.** Only the service role reads or writes them.
- `promo_codes`: Owner and Manager.
- `waitlist`: public insert only.

`src/server/ticketing/db.ts` is the only place the service-role ticketing client is created. It
never falls back to the anon key; without the service key there is no ticketing and every caller
says so.

## Views for the admin

- `event_sales_summary` — per event: tickets sold, seats taken, checked in, gross, refunded,
  net, web vs door, orders, comps, last sale.
- `event_attendees` — per ticket: name, email, tier, code, order number, checked-in state.
  The door list and the CSV.

Both are `security_invoker`, so they carry the underlying tables' RLS: nothing for `anon`.

## Testing

- `npm test` covers the pricing mirror and the code helpers.
- `npx tsx scripts/hammer-reserve.ts` (needs the service key) fires 50 parallel reservations
  at a 10-seat tier and asserts exactly 10 sold. Run it after any change to `reserve_order`.
- `npm run seed:events` writes two sample events; against Supabase the paint night gets tiers
  and enough sample orders that the "n of 40 left" line shows.

Local development without Supabase has the tables' shapes in the file database but none of the
functions, so a ticketed event falls back to its outside link there.
