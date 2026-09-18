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

---

## Checkout (Stripe)

```
event page ─ POST /api/checkout/reserve ─▶ reserve_order (12-minute hold)
                                          ▶ stripe.paymentIntents.create(amount from the DB, idempotencyKey = order id)
                                          ◀ { orderNumber, clientSecret, summary, expiresAt }
/events/[slug]/checkout?order=OAS-XXXXX     Express Checkout Element + Payment Element, our own name/email fields,
                                            consent line persisted to orders.consent_text before confirmPayment
Stripe webhook ─ POST /api/webhooks/stripe ─▶ processed_stripe_events insert (idempotency) ─▶ fulfill_order ─▶ email
/tickets/[orderNumber]?t=<signed token>      polls /api/orders/[n]/status until paid, then QR per ticket
```

- The browser never sends an amount. `reserve` accepts tier ids and quantities and is
  `strict()`-validated; the total on the PaymentIntent is read back from the reserved order.
- `/api/webhooks/stripe` is the only place an order becomes paid. The redirect never fulfils.
  Signature is verified on the raw body; the event id is inserted into `processed_stripe_events`
  first, so a replay returns 200 before touching an order. Handled: `payment_intent.succeeded`
  (pay + mint + email), `payment_intent.payment_failed` (fail + release), `payment_intent.canceled`
  (cancel + release), `charge.refunded` (full → void every ticket; partial → flag the owner),
  `charge.dispute.created` (disputed, tickets void, owner alerted). `src/server/ticketing/webhook.ts`
  is pure and tested against an in-memory store.
- A free order (promo to $0) is fulfilled straight from `reserve` through the same
  `fulfill_order`, with no Stripe involved.
- Tickets pages open with a 30-day HMAC token (`src/lib/ticketing/tokens.ts`) or the email on the
  order. QR PNGs (`/api/tickets/[id]/qr.png`) need the same token and encode a signed
  `t1.<payload>.<sig>` string, so a forged QR fails offline.
- The five-minute cron also cancels the PaymentIntents of expired pending orders, so a stale
  checkout tab cannot charge a card for seats that were given back.
- Rate limits use `rate_limit_hit` (migration `0008`) and fail open.

---

## Delivery and the door

**Email** (Resend, from the restaurant's own domain — `ORDERS_FROM_EMAIL` on `resend.dev` is
refused). Sent after the webhook commits; never allowed to fail it. Table layout, inline styles,
no web fonts. One QR per ticket as an inline `cid:` attachment on a solid white block (dark-mode
safe); more than four tickets shows the first and links to the rest. Plain-text alternative
carries the codes and the tickets URL. An `.ics` with the address and a two-hour alarm is
attached. Every attempt is in `email_log`. Resend: `POST /api/orders/[n]/resend` from the tickets
page (signed link) or the admin, three per order per ten minutes. Reminder: hourly cron, 23–25
hours before doors, skipped for refunded or fully checked-in orders, `reminder_sent_at` set first.

**Scanner** — `/admin/scan?event=…`, full screen, staff session required (the existing auth).
Camera on an explicit tap. `BarcodeDetector` where available, `@zxing/browser` otherwise. The
verdict is the whole screen in one colour for two seconds: green "Welcome in · Adult · 1 of 2",
amber "Already scanned at 12:14pm by …" with "Let them in anyway", red "Not valid here" with the
reason. Chime and haptics on by default, mute in the header. Manual code entry at the bottom.

`POST /api/scan` verifies the HMAC first (a forgery never reaches the database), then the event,
then the ticket's state, then one atomic `update … where checked_in_at is null returning *` — zero
rows is a duplicate, which is what makes two phones safe. Every outcome is a `scans` row.

**Offline**: on load the scanner fetches `/api/scan/manifest` — every ticket's id, a sha256 of
its signed QR payload, a sha256 of its code, tier, status — into IndexedDB. If `/api/scan` fails
or exceeds 2.5s the scan is validated against that set, shown green with an "offline" mark, and
queued; the queue flushes on reconnect. Server-side check-in time wins; a duplicate discovered on
flush is logged, not surfaced.

**Door sales and comps** — `/admin/door`: pick a tier and quantity, cash or card at the register
or a comp with a reason. Goes through `reserve_order(source='door'|'comp')` and `fulfill_order`
like a web sale, so capacity stays honest, then checks the tickets in on the spot. Comps carry
`total_cents = 0` with the discount absorbing the price. Web and door revenue are separate columns
in `event_sales_summary`.

The `Permissions-Policy` header allows the camera for same-origin pages so `/admin/scan` can use it.

---

## The admin

- **Home** (`/admin`) is a money screen: a time-aware greeting, one "Up next" card with sold /
  capacity, money collected, seats left and the last sale (from `event_sales_summary`), a
  one-line week total, three compact errands, the next few events, and one quiet housekeeping
  sentence linking to `/admin/tidy`. The only things that get a band at the top are problems that
  cost money right now: an event on sale with nothing priced, and an event that started half an
  hour ago with no check-ins.
- **Tidy** (`/admin/tidy`) lists housekeeping with a one-tap fix where one exists (take a past
  event off the calendar, put a dish back) and a link where it does not.
- **Sales** (`/admin/events/<event id>/sales`): sold, gross, refunded, net, web vs door, the
  orders with search, a refund per order (Stripe, with the webhook doing the state change; door
  and comp orders are marked directly), and a CSV of the attendees.
- **Five sections.** Events (with Door), Menu, Look (seasonal look, photos), Visit (hours, pages,
  enquiries), Team. Active section is an amber underline; on a phone the five are a bottom bar.
- **The palette** is the public site's night: `src/app/admin/admin.css` remaps the admin's tokens
  under `data-admin-look="evening"`, so every screen moved at once without a component changing.
  Amber is the one accent and is spent on the one action per screen; links are text, underlined.
