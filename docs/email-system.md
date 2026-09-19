# Email and communications

Every email Oasis sends — tickets, reminders, refunds, event changes, staff
invitations, sign-in links — and the system behind it: React Email templates,
one server-side service, Resend for delivery, `email_log` for the record, and
an admin screen to preview, test and inspect it all.

This document is the one to read before touching any of it. The older
`docs/ticketing-email.md` describes the ticket pages and the token model and
still applies.

---

## The one-minute version

```
Guest pays
  → Stripe webhook verifies payment_intent.succeeded (src/app/api/webhooks/stripe)
  → fulfill_order mints one `tickets` row per ticket, exactly once
  → emailService.sendTicketConfirmation(orderId)          src/server/email/service.ts
      → loads the order, the event, the artwork, signs one token per ticket
      → draws each QR as a PNG, attached inline (cid:)
      → renders src/emails/templates/TicketConfirmation.tsx with React Email
      → Resend delivers, from ORDERS_FROM_EMAIL
      → email_log records sent / failed / skipped, with the provider id
  → Resend webhook (src/app/api/webhooks/resend) marks it delivered / bounced
```

**Nothing reaches a guest until `EMAIL_DELIVERY_ENABLED=true`.** Deploying the
code does not send email. With the switch off, every guest email is written to
`email_log` as `skipped` with the reason, and the admin shows exactly that.

**See the emails:** `npm run email:dev`, then open <http://localhost:3030>.

---

## Staff operations email

Seven more templates, added with the employee operations system: **welcome to
the team**, **schedule published**, **shift changed**, **time-off decision**,
**training assigned**, **document expiring** and **event assignment**. They
share one component (`src/emails/components/StaffShell.tsx`) — a headline, a
sentence, a small table of facts, an optional manager note, one button — and go
out through `emailService.sendStaffNotice()`, so they land in `email_log` like
everything else and appear in the admin's Communications screen.

They are raised by `notify()` (`src/server/staff/notifications.ts`), not called
directly: email is one channel of the notification abstraction, and an employee
can turn their own off in their profile. Everything smaller — a task assigned,
an announcement posted, a swap claimed — stays in the app.

**They are `audience: 'staff'`, so the guest delivery switch does not gate
them.** See `docs/employee-operations.md` §Notifications and email.

---

## Where things live

```
src/emails/                         the design system — no database, no Next.js
├── theme.ts                        colours, fonts, sizes (from globals.css, made email-safe)
├── types.ts                        the props every template takes
├── registry.ts                     every email: id, name, trigger, log type, variants
├── render.tsx                      renderEmail(id, props) → { subject, html, text }
├── fixtures.ts                     realistic Oasis sample data for previews and tests
├── components/                     OasisEmailLayout, OasisHeader, OasisFooter, EventHero,
│                                   EventDetails, TicketCard (+ TicketList), QRCodeSection,
│                                   OrderSummary, VenueDetails, PrimaryButton, InfoRow,
│                                   NoticeBox, Block, AccountShell, TestBanner
├── templates/                      one file per email; each exports default, subject(), text()
├── previews/                       one file per preview scenario (what `email:dev` shows)
└── utils/                          format (dates, money), text (plain-text parts), qr (sync SVG)

src/server/email/                   the service — server only
├── config.ts                       every env var, the delivery guard, sender identity
├── transport.ts                    the only file that imports `resend`
├── log.ts                          email_log reads and writes (with pre-0018 fallback)
├── data.ts                         order / event / ticket records → template props
├── service.ts                      emailService.send…(), the guard, idempotency, previews, tests
├── auth-hook.ts                    Supabase auth event → which template, which link
├── settings.ts                     which optional emails are switched on
└── webhook-signature.ts            Standard Webhooks (Svix) signature check

src/app/api/webhooks/resend         delivery events in
src/app/api/webhooks/supabase-auth  Supabase asks us to send an auth email
src/app/admin/emails                Emails in the nav: every template, with its switch
src/app/admin/emails/sending        status, preview & test, the one manual send, the log
src/app/admin/emails/preview        the rendered email both screens frame
supabase/migrations/0018_…          the widened email_log
supabase/migrations/0024_…          email_settings: the on/off switches
```

The rule that keeps this maintainable: **templates never import from
`@/server` or `@/lib/db`**, and **nothing outside `src/server/email` imports
`resend`**. A template is a pure function of its props; the service is the
only door.

---

## The emails

| Email | Template | Sent by | Log type |
|---|---|---|---|
| Ticket confirmation | `TicketConfirmation` (3 directions) | Stripe webhook after payment; the reserve route for a free (promo) order | `confirmation` |
| Event reminder | `EventReminder` | Hourly cron, 23–25h before doors; a `tonight` stage exists and is off | `reminder`, `tonight` |
| Ticket resend | `TicketResend` | "Email these to me again" on the tickets page; Resend tickets in Sales | `resend` |
| Refund confirmation | `RefundConfirmation` | Stripe webhook on `charge.refunded` (full or partial); a register refund in Sales | `refund` |
| Event update / cancellation | `EventUpdate` | Cancel event (automatic, every ticket holder); other changes from Communications | `event_update`, `cancellation` |
| Thanks for coming | `ThanksForComing` | A cron stage that is built and switched off | `thanks` |
| Staff invitation | `StaffInvitation` | Add a staff member in Team → Supabase invite → the auth hook (below) | `staff_invitation` |
| Sign-in link | `MagicLink` | Staff sign-in page → Supabase → the auth hook | `magic_link` |
| Password reset | `PasswordReset` | Supabase recovery → the auth hook | `password_reset` |
| Verify email | `VerifyEmail` | Supabase signup / email change → the auth hook | `verify_email` |
| Welcome | `Welcome` | Nothing yet — there are no customer accounts. Template only. | `welcome` |
| Owner alert | plain text | Disputes, failed refunds, oversells, cancellations | `owner_alert` |

### The three ticket-confirmation directions

Same data, same components, three compositions. Pick with `direction` on the
template, or in production with `EMAIL_TICKET_DIRECTION`:

- **`pass`** — *default.* Espresso ground, flyer beside a date block, one
  pass-shaped card per ticket with a perforation above the QR.
- **`editorial`** — ivory ground, serif headline, the flyer framed small,
  generous space. Restaurant stationery.
- **`poster`** — the flyer edge to edge, the headline on a band in the
  flyer's own colour, then the tickets.

All three are in the preview under *ticket-confirmation*. Change the default
in `src/emails/templates/TicketConfirmation.tsx` (`DEFAULT_TICKET_DIRECTION`)
once you have decided.

### Multiple tickets

One to four tickets: a card each, so a group of three has three codes on one
screen at the door. Five or more: the first card, an "Open all N tickets"
button to the tickets page, and every remaining code as a link. The limit is
`INLINE_TICKET_LIMIT` in `TicketCard.tsx`.

Each ticket's QR encodes its own signed link (`/t/<token>`), which is also
what the door scans — see `docs/ticketing-email.md`. A guest forwards one
link to one friend; the order page still shows all of them to the buyer.

### QR codes

Generated programmatically, always. In a sent email each QR is a PNG drawn by
`qrcode` from the signed ticket link and attached inline (`cid:`), so it shows
even when a client blocks remote images and never relies on a data URL Gmail
would strip. In the preview server and the admin preview the same payload is
drawn as an inline SVG, synchronously, by `src/emails/utils/qr.ts`. Nothing
sensitive is in the QR: the payload is `{ticket id, event id}` signed with
`TICKET_SIGNING_SECRET`; a forged one fails offline at the door.

### Design rules the templates follow

- 600px column, tables, inline styles, no web fonts, no gradients. Padding is
  on `<td>`s (`Block`), never on a table, because Outlook.
- Dark (espresso) surface for event and ticket emails; ivory for money and
  account emails. Amber button on dark, coral on ivory — the website's rule.
- The QR always sits on a white block, so a dark-mode client cannot invert it,
  and the code is printed under it in monospace.
- Every email has a written plain-text part (`text()` in each template) with
  the codes in it verbatim.
- Dates and times format through `src/lib/format.ts`, the website's own
  formatter, in `America/Chicago`.

---

## Previewing

```bash
npm run email:dev        # http://localhost:3030 — every scenario, live reload
npm run email:export     # static HTML for every scenario into .email-previews/
```

The sidebar is `src/emails/previews/`: the three ticket-confirmation
directions, a single ticket, five tickets across three tiers, a long event
name, missing artwork, no customer name, itemised fees, a test send; both
reminders; the resend; a full and a partial refund; a cancellation, a time
change, a date change, a postponement; the staff invitation; the four account
emails; thanks for coming. Add a scenario by adding a file there.

Preview artwork loads from the live deployment
(`PREVIEW_ORIGIN` in `fixtures.ts`), so the flyers really show.

In the admin, **Emails** is its own section in the nav, with two screens.

**Emails → All emails** (`/admin/emails`) is the same renderer as a wall:
every template and every version of the ones that have versions, drawn
small, with its subject line, filtered by audience and optionally shown as a
test send. Click one for it full size, with ← → through the rest. It needs
no terminal, so it is the one to reach for after changing the header, the
footer or the palette; `email:dev` is still where the awkward scenarios
above live. Each tile also carries its switch — see below.

**Emails → Sending & log** (`/admin/emails/sending`) previews one template
against a **real event** (artwork, name, date, time, venue) with a stand-in
guest and order, sends that exact preview to one address as a test, makes
the one manual send there is, and lists what went out.

---

## Switching an email on or off

Ten emails have a switch, on their tile in **Emails**; a Manager or the
Owner may flip it. Each one writes a row in `email_settings`, which the
service and the hourly cron read at send time — so a switch takes effect on
the next pass, not on the next deployment.

| Switch | Ships |
|---|---|
| Event reminder — the day before | **On** |
| Event reminder — a few hours before doors | Off |
| Thanks for coming — the morning after | Off |
| The seven staff operations emails | **On** |

Everything else says **Always on** and has no switch at all: a ticket
confirmation, a resend, a refund, an event change, a staff invitation and
the four account emails answer something a person just did, and there is no
version of this admin that quietly withholds a receipt or a sign-in link.
Stopping *all* guest email is a different control — `EMAIL_DELIVERY_ENABLED`
in the environment, shown on Sending & log.

Three fallbacks make the switch safe: a missing row means the shipped
default, a `email_settings` that cannot be read means the shipped default,
and a read that throws means on. A settings outage can never be the reason
somebody's reminder did not arrive.

---

## Sending a test email

1. Sign in to the admin as a Manager or the Owner.
2. **Emails → Sending & log** → *Preview & test*.
3. Pick the email, the version, the event. The frame is the real rendering.
4. Enter the address (yours by default) → **Send test email**.

The subject starts `[TEST]`, the email carries a banner, and the log row is
marked as a test. It needs `RESEND_API_KEY` and `ORDERS_FROM_EMAIL`; it does
**not** need `EMAIL_DELIVERY_ENABLED`, because nothing about it reaches a guest.
It cannot be sent to more than one address, and nothing on that screen can
email all customers.

---

## Safety: the delivery guard

`src/server/email/config.ts` reads everything; `service.ts` enforces it in one
function (`deliver`). Three audiences:

| Audience | Emails | Needs |
|---|---|---|
| **guest** | confirmation, reminder, resend, refund, event update, cancellation, thanks | mailer configured **and** `EMAIL_DELIVERY_ENABLED=true` |
| **staff** | test sends, staff invitation, auth emails | mailer configured |
| **internal** | owner alerts | mailer configured and `OWNER_ALERT_EMAIL` |

`EMAIL_REDIRECT_ALL_TO=<address>` sends every *guest* email to that address
instead, with `[for <original>]` in the subject. Use it on a preview
deployment that has real orders in it.

Every skip is logged with its reason, so a misconfiguration shows up as a fact
in Communications rather than as silence.

---

## Reliability

- **Once per order.** `sendTicketConfirmation` checks `email_log` for a `sent`
  confirmation before rendering; a replayed Stripe event, a retried job or a
  double call sends nothing. (The webhook is already de-duplicated by
  `processed_stripe_events`; this is the second lock.) A deliberate resend is a
  different email type.
- **Never fails the payment.** The webhook calls the service after its commit,
  inside a try; the service never throws. A mailer outage is a `failed` row,
  retried from the tickets page or the admin.
- **A cancellation and its refund** do not produce two emails: the refund
  email stands down when a cancellation email has gone for the order.
- **A partial refund** announces only the amount that moved in that Stripe
  event; a replayed event announces nothing.
- **Missing or bad address**, unpaid order, missing event, missing signing
  secret: each is a logged skip with its reason.
- **`X-Entity-Ref-ID`** is set per logical email, so the provider
  de-duplicates a retried send of the same confirmation.
- **Pre-0018 database.** The log writer retries in the older shape if a column
  or a check is missing, so a send is recorded before the migration runs.

---

## The admin: Events → Emails

- **Status** — sending configured? guests switched on? delivery reports?
  staff sign-in emails branded? Each with the variable to set.
- **Preview & test** — above.
- **Tell ticket holders about a change** — a time, date or venue change, a
  postponement, or news, to the paid orders of **one** event, after a
  confirmation tick. Change the event in the editor first; the email shows
  the event as it now stands. Cancellation is not here: cancelling in the
  editor emails everyone automatically.
- **Every email the site sends** — the registry, with what triggers each and
  whether it is wired, on request, built-but-off, or template only.
- **Recent sends** — the last 60 rows of `email_log`.

On an event's **Sales** screen, each order now shows *Ticket email: sent /
delivered / skipped — reason / failed — reason*.

---

## Delivery records (`email_log`)

Migration `0018_email_delivery_records.sql` widens the 0009 table:

| Column | Meaning |
|---|---|
| `type` | `confirmation`, `reminder`, `tonight`, `resend`, `refund`, `event_update`, `cancellation`, `thanks`, `staff_invitation`, `magic_link`, `password_reset`, `verify_email`, `welcome`, `owner_alert` |
| `status` | `sent`, `failed`, `skipped`, then from the webhook: `delivered`, `delayed`, `bounced`, `complained` |
| `to_email`, `order_id`, `event_id`, `template`, `subject` | what and to whom (no body is stored) |
| `provider_id` | Resend's id — how the webhook finds the row |
| `error`, `provider_status` | why it failed / what Resend reported |
| `is_test` | a staff test send |
| `created_at`, `delivered_at`, `last_event_at` | when |

Apply it in Supabase → SQL editor (paste the file) or `supabase db push`.

---

## Setting up Resend — what you have to do

1. **Create the Resend account** (resend.com) for the restaurant.
2. **Add a sending domain.** Use a subdomain so ticket mail can never damage
   the restaurant's ordinary email reputation, or be damaged by it:
   `tickets.oasismexicankitchenbar.com` (recommended) — or the root domain if
   you would rather guests see `@oasismexicankitchenbar.com`.
3. **Add the DNS records Resend shows you** at the registrar. Copy them, do not
   retype:
   - **SPF** — a `TXT` on the sending domain (`v=spf1 include:amazonses.com ~all`
     or as shown).
   - **DKIM** — the `TXT`/`CNAME` record(s) with the signing key. This is what
     makes Gmail trust the mail.
   - **DMARC** — a `TXT` at `_dmarc.tickets.oasismexicankitchenbar.com`. Start
     with `v=DMARC1; p=none; rua=mailto:<an address you read>` and tighten to
     `p=quarantine` once reports are clean.
   - Resend may also show an **MX** record for the subdomain (for bounce
     handling). Add it.
   Wait for the domain to read **Verified** in Resend.
4. **Create an API key** (Resend → API Keys, "Sending access" is enough).
5. **Decide the sender addresses** (see below) and create any mailbox you
   want replies to land in.
6. **Add the Resend webhook** (Resend → Webhooks → Add):
   - URL: `https://<your domain>/api/webhooks/resend`
   - Events: `email.sent`, `email.delivered`, `email.delivery_delayed`,
     `email.bounced`, `email.complained` (opens and clicks are ignored on
     purpose).
   - Copy its **signing secret** (`whsec_…`) into `RESEND_WEBHOOK_SECRET`.
7. **Set the environment variables** in Vercel (below), redeploy, send yourself
   a test from Communications, check the inbox and the spam folder.
8. **Only then** set `EMAIL_DELIVERY_ENABLED=true` and redeploy.

### Sender addresses to decide

| Variable | Suggested | Purpose |
|---|---|---|
| `ORDERS_FROM_EMAIL` | `tickets@tickets.oasismexicankitchenbar.com` | The From address on every email. Must be on the verified domain. |
| `EMAIL_FROM_NAME` | `Oasis Mexican Kitchen & Bar` (default) | The From name. |
| `EMAIL_REPLY_TO` | `hello@oasismexicankitchenbar.com` (a mailbox a person reads) | Where a reply goes. Also shown in the footer as the support address. Without it, replies go to the From address. |
| `OWNER_ALERT_EMAIL` | the owner's own address | Disputes, failed refunds, oversells, cancellations. |

---

## Vercel environment variables

Add to **Production** (and Preview if you want previews to send):

| Name | Required for | Notes |
|---|---|---|
| `RESEND_API_KEY` | any sending | Secret. |
| `ORDERS_FROM_EMAIL` | any sending | On the verified domain. `@resend.dev` is refused in code. |
| `EMAIL_FROM_NAME` | optional | Default "Oasis Mexican Kitchen & Bar". |
| `EMAIL_REPLY_TO` | recommended | A read mailbox. |
| `OWNER_ALERT_EMAIL` | alerts | A person. |
| `EMAIL_DELIVERY_ENABLED` | **emailing guests** | `true` to switch guest email on. Anything else is off. |
| `EMAIL_REDIRECT_ALL_TO` | optional, staging | Every guest email goes here instead. Never set in production. |
| `EMAIL_TICKET_DIRECTION` | optional | `pass` (default), `editorial` or `poster`. |
| `RESEND_WEBHOOK_SECRET` | delivery reports | From the Resend webhook. |
| `SUPABASE_AUTH_HOOK_SECRET` | branded staff emails | From the Supabase hook (below). |
| `TICKET_SIGNING_SECRET` | any ticket email | Already required by ticketing; no ticket link can be signed without it. |

Never commit any of these. `.env.example` lists the names.

---

## Staff and account emails: the Supabase auth hook

Staff sign in through Supabase Auth (passwordless links, invitations, the
password fallback). There are **no customer accounts**; the Welcome template
exists for the day there are. Rather than build a second auth system, the
branded versions are delivered through Supabase's **Send Email hook**: once
it is configured, Supabase stops sending its own emails and POSTs this site
the user and a one-time token, and the site renders and sends the Oasis
template. The links are Supabase's own verify links, so `/auth/callback` and
`/auth/activate` are unchanged.

To turn it on:

1. Supabase → Authentication → **Hooks** → *Send Email* → Enable.
2. Type **HTTPS**, URL `https://<your domain>/api/webhooks/supabase-auth`.
3. Generate the secret Supabase offers (it looks like `v1,whsec_…`) and put it
   in Vercel as `SUPABASE_AUTH_HOOK_SECRET`. Redeploy.
4. Send yourself a sign-in link from `/admin/login` and check it arrives as an
   Oasis email.

Until then Supabase's default templates are used, and everything still works.
The hook needs `RESEND_API_KEY` and `ORDERS_FROM_EMAIL`; it does **not** need
`EMAIL_DELIVERY_ENABLED` (a staff member who cannot sign in is worse than an
unbranded email). Supported actions: `invite`, `magiclink`, `recovery`,
`signup`, `email_change`. Anything else returns an error to Supabase, which
surfaces it rather than losing the email.

**Adding a staff member** (Team → Add) now creates the account *and* sends the
invitation through Supabase (`inviteUserByEmail`) — branded with the hook,
plain without. The message on screen says which.

---

## What is wired, what is not

**Wired to real triggers:** ticket confirmation (Stripe webhook and free
orders), reminder (cron), resend (page and admin), refund (webhook and
register), cancellation (event editor), event updates (Communications, per
event), staff invitation and sign-in emails (via the auth hook once
configured), owner alerts.

**Built, switched off:** the "tonight" reminder and "thanks for coming" stages
in `src/app/api/cron/reminders/route.ts` (`enabled: false`).

**Template only:** Welcome (no customer accounts exist).

**Not built:** Apple/Google Wallet passes; automatic detection of a
date/time edit in the event editor (send the update from Communications on
purpose instead — an accidental edit should not email a room).

---

## Adding an email

1. Props in `src/emails/types.ts`.
2. A template in `src/emails/templates/` exporting `default`, `subject`, `text`.
3. A line in `src/emails/registry.ts` (id, name, trigger, `logType`).
4. `render.tsx`: add it to `TemplateProps` and `MODULES`.
5. A preview file in `src/emails/previews/`.
6. The log type in the 0018 check constraint (a new migration).
7. A `send…` method on the service that decides the audience.
8. If it is optional, a line in `EMAIL_SWITCHES` and a `switchedOn` check in
   that method. If somebody is owed it, deliberately neither.

---

## Tests

- `src/emails/templates.test.tsx` — every template renders with the fixtures;
  every code is in the HTML and the text; the awkward inputs render; the
  multi-ticket rule holds.
- `src/server/email/service.test.ts` — the guard, the redirect, once-per-order,
  attachments, skips, provider failure, refund/cancellation interplay,
  previews, alerts.
- `src/server/email/webhooks.test.ts` — the signature scheme and the auth-hook
  mapping.
- `src/server/ticketing/webhook.test.ts` — refund emails from Stripe events,
  replay safety, a failing email never failing the webhook.
