# Ticket email and the ticket pages

What a guest receives after paying, where it comes from, and how to set up the
sending domain. The schema behind it is in `docs/ticketing-schema.md`; the
payment flow is in `docs/ticketing.md`.

> **The email system itself — templates, the service, the delivery switch,
> the admin screen, Resend and webhook setup — is documented in
> [`docs/email-system.md`](./email-system.md).** This file covers the ticket
> pages, the token model and the lifecycle; the template details below have
> been superseded by React Email templates in `src/emails/`.

---

## The three surfaces

| Surface | Who holds it | What it is for |
|---|---|---|
| The email | The buyer | Arrives seconds after payment. Carries the first QR inline, the codes as text, the calendar file, and a link to everything. |
| `/tickets/<order number>?t=<signed link>` | The buyer | Every ticket in the order, each with its own QR. Resend, receipt, directions. Also reachable by entering the email on the order. |
| `/t/<ticket token>` | Whoever is using that ticket | One ticket. No login, no receipt, no other tickets. This is what the QR points at and what a buyer forwards to a friend. |

**The QR encodes the ticket's URL**, not a bare token. A guest who points a
camera at it out of habit lands on their own ticket instead of a meaningless
string, and the door reads the token back out of the URL
(`tokenFromScan`, `src/lib/tickets/link.ts`, tested both ways).

Nothing personal is inside the QR: the payload is `{tid, eid, v}` signed with
`TICKET_SIGNING_SECRET`. Name, email, price and order total are resolved from
the database afterwards, which is why a photographed QR leaks nothing.

## Why a forwarded ticket shows no money

`/t/<token>` deliberately omits the receipt. Four friends split a table; one of
them paid. The person holding the ticket needs the code, the date and the door —
not what anyone spent. The order number is shown because the door asks for it
when a phone has died.

## Security

- The token is the credential, so the page is rate limited (60 opens a minute per
  IP), `noindex, nofollow, nocache`, and sends `referrer: no-referrer` so the
  token cannot ride along to Google Maps in a `Referer` header.
- A bad token, an expired one and a ticket that does not exist all return the
  same not-found. The page never says which part was wrong.
- The order page needs the order's own 30-day signed link, or the email address
  on the order. An order number alone opens nothing.

## Setting up sending (Resend)

1. **Create the Resend account** and add a domain. Use a **subdomain**, e.g.
   `tickets.oasismexicankitchenbar.com`, so ticket delivery cannot damage the
   reputation of the restaurant's ordinary business email — or be damaged by it.
2. **Add the DNS records Resend shows you** at the registrar. There are three
   kinds and all three matter:
   - **SPF** — a `TXT` record on the subdomain saying Resend may send as it.
   - **DKIM** — a `TXT` (or `CNAME`) record carrying the signing key. This is the
     one that decides whether Gmail trusts the mail.
   - **DMARC** — a `TXT` record at `_dmarc.<subdomain>`. Start at
     `v=DMARC1; p=none; rua=mailto:<an address you read>` so you get reports
     without bouncing anything, and tighten to `p=quarantine` once reports are
     clean.
   Resend prints the exact values; copy them rather than typing them.
3. **Set the environment variables** in Vercel:
   - `RESEND_API_KEY` — the API key.
   - `ORDERS_FROM_EMAIL` — e.g. `tickets@tickets.oasismexicankitchenbar.com`.
     A `@resend.dev` address is refused in code: it would deliver, but from a
     domain the restaurant does not own.
   - `OWNER_ALERT_EMAIL` — where a dispute, a failed refund or an oversell
     alert goes. This should be a person, not a shared inbox nobody opens.
   - `EMAIL_REPLY_TO` — an address a human reads. A confused guest replying to
     a no-reply address is a guest who does not come.
4. **Switch guests on.** `EMAIL_DELIVERY_ENABLED=true`. Until then every guest
   email is logged as `skipped`; test emails from the admin still send.

Without these the site still works: tickets are issued, the ticket pages still
show their QRs, and each attempt is logged as `skipped` with the reason.

## The lifecycle

| When | Email | State |
|---|---|---|
| On payment | Confirmation, with QR | **On** |
| The day before | "See you tomorrow", with QR | **On** |
| 3–5 hours before doors | "Tonight" | Built, `enabled: false` |
| The morning after | "Thanks for coming" | Built, `enabled: false` |

All four are stages in `src/app/api/cron/reminders/route.ts`, which runs hourly
and **reads the database each time** rather than scheduling a send per order at
purchase. That is the whole reason it is shaped this way: a cancelled event
silences the rest of the sequence for free, where per-order scheduling would
cheerfully email everybody "see you tonight" about an event that is not
happening.

Turning one on is `enabled: true` on its stage. Repeats are prevented by
`orders.reminder_sent_at` for the day-before stage, and by `email_log` for the
other two — no stage that may never be used leaves a column behind.

## Every send is logged

`email_log` holds one row per attempt: type, recipient, the provider's message
id, and the error if it failed. "Did her ticket actually arrive?" is a
five-second lookup rather than a support thread. A send that could not even be
attempted (no API key, no address on the order, an unpaid order) is logged as
`skipped` with the reason, which is how a misconfiguration shows up as a fact
instead of a silence.

## Previewing a template without sending

`npm run email:dev` opens every template with sample data at
<http://localhost:3030>; the admin's Events → Emails screen previews against a
real event and sends a test to one address. Programmatically:

```ts
import { renderEmail } from '@/emails/render';
const { subject, html, text } = await renderEmail('ticket_confirmation', props);
```

Both the HTML and the plain-text alternative are built for every email. Each
shown QR is attached and referenced by `cid:`, so it renders when a client
blocks remote images — and the "View tickets" link is always there as the
path that works regardless.

## What is not built yet

Apple and Google Wallet passes. The token model is already compatible (one
signed token per ticket, resolvable server-side), and the ticket page says so
plainly instead of showing a button that does nothing.
