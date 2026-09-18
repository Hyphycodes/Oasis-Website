# Roadmap — after launch

Kept deliberately short. Everything here was considered and left out of the build on purpose.

1. **Wallet passes** (Apple Wallet + Google Wallet). The biggest single "this feels expensive"
   upgrade, and it removes email-search-at-the-door entirely. Apple requires a paid Developer
   account and a pass-type certificate. `src/lib/tickets/` is laid out so a `wallet.ts` drops in
   beside `qr.ts` and `ics.ts`; the ticket page and the email both have a natural slot for a
   button.
2. **Tap to Pay on iPhone / Stripe Terminal** for real card sales at the door, in the same
   `orders` table with `source = 'door'`. Today the register takes the card and `/admin/door`
   records the sale.
3. **Post-event email**: thank-you, photos, and the next event. The whole reason for owning the
   customer list.
4. **Reserved tables** for bigger nights — a tier with `seats_per_ticket > 1` already covers most of it.
5. **Waitlist release**: when a refund frees a seat, email the `waitlist` automatically.
6. **SMS day-of reminders**, if no-shows turn out to be a real problem. Measure first.
