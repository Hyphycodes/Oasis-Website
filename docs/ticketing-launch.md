# Going live with ticketing

Phase 06 of the brief: what is proven, what still has to be done by hand, and
the order to do it in. The environment checklist it depends on is in
`docs/LAUNCH-CHECKLIST.md` §9; the setup page at **/admin/setup** shows which
of those are actually connected right now.

---

## What the tests prove

Run with `npm test`. These are the ones that exist because the money or the
door depends on them.

| Rule | Where |
|---|---|
| Five deliveries of the same Stripe event produce one order, two tickets, one email | `src/server/ticketing/webhook.test.ts` |
| A payment landing after the hold lapsed, with the seats gone, is refunded in full and issues nothing | same |
| A refund that itself fails leaves the order pending and alerts the owner rather than silently keeping the money | same |
| A total too small to charge is cancelled, not left half-made | `src/app/api/checkout/reserve/route.test.ts` |
| Reserve still hands back an order number when card payments are off, so checkout is never a dead end | same |
| A ticket token carries no personal data, cannot be re-pointed at another event, and differs per ticket | `src/lib/ticketing/tokens.test.ts` |
| A QR's URL resolves to the same ticket however a scanner app mangles it | `src/lib/tickets/link.test.ts` |
| The earlier of two offline scans is the one that counts, whichever syncs first | `src/server/ticketing/check-in.test.ts` |
| Pricing, fees and promos in both fee modes | `src/lib/ticketing/fees.test.ts`, `src/server/ticketing/offer.test.ts` |

## What was proven against the real database

Run on the live project on 18 September 2026, in one transaction that rolled
itself back (`supabase/tests/ticketing-walkthrough.sql`):

- four tickets issued from one order, every code distinct
- a ticket checks in once; the second attempt changes nothing
- a replayed fulfilment mints no extra ticket
- a paid order creates exactly one customer, and the same person buying again
  does not create a second
- a tracking-only promo code attributes the sale and discounts nothing
- **an anonymous caller reads zero orders, zero tickets and zero customers**

Nothing was left behind: no test event, order, ticket, customer, scan or code.

## What the tests cannot prove, and what to run instead

**Concurrency.** Two simultaneous checkouts for the last seat need two real
connections, which a unit test does not have. The proof is
`npx tsx scripts/hammer-reserve.ts` with the service key: fifty parallel
reservations against a ten-seat tier, expecting exactly ten to succeed. **Run it
once against production before the first real event**, and again after any
change to `reserve_order`.

**RLS for a signed-in door-role account.** The anonymous case is proven above.
The door-role case needs a real session; it is on the manual list below.

---

## The manual script

Against Stripe **test mode**, using the seeded `Test Event — $1`
(`supabase/seeds/test-event.sql`). It is seeded unpublished — publish it while
you test and put it back afterwards:

```sql
update public.event_occurrences set published = true  where id = 'test:dollar-event';
-- …run the script…
update public.event_occurrences set published = false where id = 'test:dollar-event';
```

1. **Buy one ticket.** Check the email arrives in under ten seconds, open the
   ticket page from it, scan the QR with a phone camera — it should open that
   one ticket — then scan it at `/admin/scan`. Green.
2. **Buy four.** Four distinct QRs. Open one ticket's own link and send it to
   somebody else's phone; check each of the four scans separately.
3. **Screenshot a QR and scan it twice.** Green, then amber with the time of the
   first scan. As door staff, confirm **Let them in anyway** is not offered.
4. **Scan a ticket from another event.** Amber, "wrong event" — not red.
5. **Abandon a checkout.** Leave the page at the payment step; after twelve
   minutes the seat is back on sale.
6. **Refund an order.** Tickets void, the scanner says "Refunded", the guest is
   told.
7. **Comp somebody** at the door and check them in.
8. **Record a cash door sale** and watch the door dashboard count move.
9. **Turn off the wifi mid-session**, scan five, turn it back on: all five
   appear server-side with the times you actually scanned them.
10. **Search by name** and check somebody in with a "dead phone".
11. **Cancel a test event with three orders**: all refunded, all notified.
12. **Sign in as a door-role account** and confirm: no revenue anywhere, no
    customer emails, no override, no refund button.

## The dry run at the bar

Before any real event. Bring five phones.

- Real staff, the real doorway, the real lighting, the real wifi.
- Issue test tickets to each staff member's own email.
- Hand the scanner to somebody who has never seen it and say nothing. Watch
  where they hesitate — it is almost always the camera permission prompt.
- Try a cracked screen, 20% brightness, a screen protector, and a phone at 3%.
- Time it: how many people per minute can one door handle?
- Stand at the door and check the venue wifi actually reaches it.

## Go-live, in order

1. Stripe to live mode; live keys in Vercel; test keys removed.
2. Live webhook endpoint registered, verified with a real $1 purchase that is
   then refunded.
3. Apple Pay domain verified in live mode.
4. Resend domain verified; SPF, DKIM and DMARC passing; a real send lands in the
   inbox at Gmail, Apple Mail and Outlook — not spam.
5. Bank account connected, and a payout confirmed after that first $1.
6. Adrian has owner access; staff accounts created with the right roles.
7. `docs/door-scanner.md` printed and at the door.
8. `npx tsx scripts/hammer-reserve.ts` run once against production.
9. Database backups confirmed on.
10. **Launch on a small event, not the big one.** A thirty-person Paint & Sip is
    where you find out the door staff cannot find the permission prompt. A
    sold-out music night is not.
11. Decide explicitly whether Tickeri runs in parallel for the first event.

## If it breaks at the door

In this order: **Search** by name, then type the code by hand, then paper —
write names down and let people in. Every scan is logged, and the admin can
reconcile in the morning. A queue outside the door costs more than a list.

## After the first real event

Write a short retro in `docs/`: what broke, how long the line got, what staff
complained about, what Adrian asked for that does not exist yet. That document
is what decides the next phase — not this one.
