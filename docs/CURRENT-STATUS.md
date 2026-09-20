# Oasis — current status

**The source of truth for what this repository actually does today.** If a
document elsewhere disagrees with this one, this one is right and the other
needs updating.

Last updated: 20 September 2026.

Production: <https://oasis-website-mu.vercel.app/> · Supabase project
`yrfvnqgybbvbkwonvycw` · Vercel project `oasis-website`.

---

## LIVE

Deployed, in use, and working without further setup.

### The public website

| What | Where | Notes |
|---|---|---|
| Home, menu, events, catering, private events, visit, contact, careers, talent, legal | `src/app/(site)/` | Every page works with **no configuration at all** — content falls back to the typed modules in `src/content/` if Supabase is unreachable. |
| The menu | `/menu` | 83 items across food, cocktails and brunch. Nine are unpriced on purpose and render "Ask your server", never `$0`. |
| Events | `/events`, `/events/[slug]` | Recurring series carry a cadence, never a date, so a weekly night cannot display a stale one. 23 dated events on the calendar. |
| Seasonal look | admin → Seasonal look | The Halloween / Día de los Muertos theme, with scheduling and reduced-motion support. |
| Media | `src/content/assets.ts` | Semantic ids, committed to the repository, checked against the real pixels by `npm run assets:check`. |

### Contact, hiring and local talent

| What | Where | Notes |
|---|---|---|
| Contact | `/contact` | Visit, work, create — in that order, with one way into each. The address itself is the directions control and opens Apple Maps, Google Maps or Waze. |
| Work at Oasis | `/careers` | Only the roles somebody switched on, and a two-minute application with an optional résumé. **Every role ships switched off**, so the page says so honestly and still takes an open application. |
| Create with Oasis | `/talent` | A one-minute form for local DJs, artists, performers and ideas. Email *or* phone, and nothing else is required. |
| The People section | `/admin/hiring`, `/admin/hiring/openings`, `/admin/talent` | Applicants opened in place, roles as a list of switches, and a visual talent book. "Add to the contractor roster" promotes somebody into the roster the staff app already books from. |
| Private uploads | `applications` bucket, `/admin/files/...` | A résumé and a talent photograph are never public: the bucket is private and staff get a five-minute signed URL through a gate that checks the account first. |

Full reference: [`docs/hiring-and-talent.md`](./hiring-and-talent.md).

### Ticketing, checkout and the door

| What | Where | Notes |
|---|---|---|
| In-house ticket sales | `/events/[slug]/checkout` | Tiers, promo codes, holds, fees in two display modes. Availability is computed from orders, never stored as a counter. |
| Stripe payment | `src/app/api/webhooks/stripe` | Idempotent: five deliveries of one event produce one order. A payment that lands after the seats are gone is refunded in full. |
| QR tickets | `/t/[token]`, `/tickets/[orderNumber]` | One signed link per ticket; the token carries no personal data and cannot be re-pointed at another event. |
| The door | `/admin/door`, `/admin/scan` | Camera scanning, search by name or order, a live count, and manager-only judgement calls. First scan wins, whichever syncs first. |
| Sales and customers | `/admin/events/[slug]/sales`, `/admin/customers` | Orders, refunds, promoter attribution, dispute evidence, CSV export. |
| Proven against the live database | `supabase/tests/ticketing-walkthrough.sql` | Ran 18 September 2026 and rolled itself back. An anonymous caller reads zero orders, tickets or customers. |

### The admin

`/admin` — events (and the door, customers, emails), menu, hubs, look (seasonal
theme, photos), people (applicants, job openings, talent), visit (hours, pages,
enquiries), team. Drafts and publishing, version
history and restore, archive, media upload, and a Contributor role that
genuinely cannot publish — enforced by a database trigger, not a hidden button.

### Staff sign-in

Passwordless email links through Supabase Auth, with branded Oasis emails when
the auth hook is pointed at this site. Owner elevation is restricted to one
designated address and requires a verified identity.

### Database

Migrations `0001`–`0026` are applied to the live project, confirmed 20 September
2026. Row Level Security is the authorisation boundary throughout; orders,
tickets, holds, scans and the email log have no public policies at all.

---

## BUILT BUT NEEDS CONFIGURATION

The code is written, tested and deployed. Each of these needs a value, a switch
or an answer from the restaurant before it does anything.

| What | What it needs | Where |
|---|---|---|
| **Guest email** — tickets, reminders, refunds, event changes | `RESEND_API_KEY`, `ORDERS_FROM_EMAIL`, and **`EMAIL_DELIVERY_ENABLED=true`**. Off by default: deploying the code does not send. With it off, every guest email is logged as `skipped` with the reason. | `docs/email-system.md` |
| **Card payments** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`. `/admin/setup` shows which are connected right now. | `docs/stripe-setup.md` |
| **Ticket QR signing** | `TICKET_SIGNING_SECRET`, 32+ random characters. Without it the ticket pages answer *not found* rather than a 500. | `docs/ticketing.md` |
| **Delivery reports and branded auth email** | `RESEND_WEBHOOK_SECRET`, `SUPABASE_AUTH_HOOK_SECRET`. | `docs/email-system.md` |
| **Staff mailboxes** | Supabase's default mailer only reaches project-team addresses. Custom SMTP is needed before inviting staff on other mailboxes. | `docs/OCTOBER-THEME-AND-LOGIN.md` |
| **Five placeholder ticket prices** | Five events carry a **$20 placeholder** and say so in an admin note. Their real Tickeri prices were never readable from this environment. Confirm before taking real money. | commit `3bf05fc`, `docs/ticketing.md` |
| **Four unresolved business facts** | Which phone number, the real hours, eight food prices and the whole bar list, and which inbox receives enquiries. The site launches on the first-party values and labels them unconfirmed. | `docs/CONTENT-QUESTIONS.md` |

---

## EMPLOYEE OPERATIONS

**New, and applied to the live database 19 September 2026.** The staff system at
`/staff`: the employee app and the manager surfaces. Full architecture in
[`docs/employee-operations.md`](./employee-operations.md).

### What is built

| Area | State |
|---|---|
| **Schema** — 35 tables, RLS on every one, 6 column guards, a private file bucket | Written in `0021_staff_roles.sql` and `0022_employee_operations.sql`. **Applied.** `supabase/tests/employee-operations-rls.sql` ran against the live project and was silent; the `employee-files` bucket is confirmed private. |
| **Locations** | Lockport is a row; events backfilled; shifts, tasks, incidents, announcements and employees all carry one. The owner gets an all-locations view. |
| **Employees** | Profiles, positions (11), multiple locations, emergency contact, uniform, language, status, manager, the private photo. |
| **Onboarding** | A 12-item checklist that ships as a starting point, progress per person, and a manager dashboard of not started / in progress / ready. |
| **Documents & certifications** | One requirements primitive for policies, uploads, external forms, manager verification and training. Expiry computed at read time; missing / expiring / expired / awaiting verification across the team. |
| **Training academy** | Modules with text, video, image, checklist and link sections; quizzes graded server-side against a manager-only answer key; versioning that can re-require everyone; "who is cleared to work the door". |
| **Scheduling** | Draft and published shifts, repeats, copy-a-week, publish-a-week, open shifts, warnings for availability, approved time off and overlaps — warnings never block. |
| **Availability & time off** | Employee-owned weekly pattern and one-off days; requests, approvals, and the rule that nobody approves their own. |
| **Coverage** | Give up, swap, ask for cover, pick up an open shift. A manager approves; the shift history keeps who had it. |
| **Attendance** | Optional clock in and out, late / left early / absent / excused, manager correction. Not payroll, and no geofencing. |
| **Tasks & checklists** | Fast task list with comments; reusable checklist templates run per day, shift or event, with photo and note lines. |
| **Event staffing** | Assign a role, and the shift is created and the person told. Readiness flags a door assignment without scanner training. The same board renders on the admin event page. |
| **Contractors** | DJs, instructors, photographers; rates, W-9 status, bookings, deposits and payment state. |
| **Announcements & notifications** | Targeted by location and position, optional acknowledgement with who-has-read; an in-app notification centre with a pluggable channel abstraction. |
| **Incidents & manager notes** | Manager-only, with no employee policy at all. |
| **Emails** | Seven staff templates through the existing React Email design system and Resend service. The one that needs a clock — a certificate lapsing in thirty days — runs in the existing hourly cron. |
| **Audit** | Every management action on staff data, with before and after. |
| **Tests** | 181 new tests: the capability matrix cell by cell, scheduling conflicts, zoned time, and the domain workflows. Plus `supabase/tests/employee-operations-rls.sql`, which proves the access rules against real RLS. |

### What it needs to go live

1. ~~Apply `0021` then `0022` to the Supabase project~~ — done.
2. ~~Run `supabase/tests/employee-operations-rls.sql` and confirm it is silent~~
   — done, silent.
3. ~~Confirm the `employee-files` bucket is **private** in Supabase Storage~~ —
   confirmed.
4. Add the first manager, configure the requirements, write the first training
   modules, then add the team.

The full sequence is in `docs/employee-operations.md` §Going live.

### What it deliberately is not

Payroll. Geofenced clock-in. A chat product. Generated legal forms — the
checklist is a set of slots Oasis fills, and nothing here asserts what any
jurisdiction requires.

---

## NEXT

In rough order of value.

1. **Walk one real employee through onboarding end to end.** The migrations are
   applied; add the first manager and the team next, per
   `docs/employee-operations.md` §Going live steps 4–7.
2. **Answer the four content questions** (`docs/CONTENT-QUESTIONS.md`). The site
   should not launch permanently on unconfirmed hours and a disputed phone
   number.
3. **Confirm the five placeholder ticket prices** before those events sell.
4. **Turn guest email on** (`EMAIL_DELIVERY_ENABLED=true`) once the sending
   domain is verified and one real ticket has been bought and received.
5. **Custom SMTP in Supabase**, so staff invitations reach mailboxes outside the
   project team.
6. **Wallet passes** (Apple and Google) — the biggest "this feels expensive"
   upgrade to ticketing, and it removes email-search-at-the-door.

---

## FUTURE

Considered, and deliberately left out for now.

- **The Oasis iPhone app.** The staff system was built for it: typed domain
  functions, plain-JSON view models, a pure authorisation matrix, instants with
  a location timezone, and a notification channel abstraction that APNs plugs
  into. What is missing is a token exchange, route handlers and a device-token
  table — not a data-model change.
- **Joliet.** The operational half is ready: a location is a row. The public
  site still describes one restaurant, because it is one restaurant, and those
  pages want their own pass when that changes.
- **Tap to Pay on iPhone / Stripe Terminal** at the door, in the same `orders`
  table with `source = 'door'`.
- **Post-event email** — thank you, photos, and what is on next. The template
  exists and the cron stage is written and switched off.
- **Waitlist release**: when a refund frees a seat, email the waitlist.
- **SMS day-of reminders**, if no-shows turn out to be a real problem. Measure
  first.
- **Shift bidding, labour forecasting, tip pooling.** Each wants a real
  conversation with the restaurant before any of it is built.

---

## Where to read more

| Document | For |
|---|---|
| [`docs/employee-operations.md`](./employee-operations.md) | **The staff system** — architecture, routes, data model, security, going live |
| [`docs/ticketing.md`](./ticketing.md) · [`ticketing-schema.md`](./ticketing-schema.md) · [`stripe-setup.md`](./stripe-setup.md) | Ticketing, the schema, and payments |
| [`docs/email-system.md`](./email-system.md) | Every email, the service, and the delivery switch |
| [`docs/ADMIN-GUIDE.md`](./ADMIN-GUIDE.md) · [`OWNER-QUICK-START.md`](./OWNER-QUICK-START.md) | Day-to-day, in plain language |
| [`docs/ENVIRONMENT.md`](./ENVIRONMENT.md) · [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) | Variables and the launch sequence |
| [`docs/CONTENT-QUESTIONS.md`](./CONTENT-QUESTIONS.md) | The unresolved business facts |
| [`docs/DESIGN-DIRECTION.md`](./DESIGN-DIRECTION.md) | Tokens, type, motion, anti-patterns |
| [`docs/runbook.md`](./runbook.md) · [`door-scanner.md`](./door-scanner.md) | Running a night |
