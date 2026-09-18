# Launch Checklist

Work top to bottom. Nothing here has been done yet — no hosting project exists, no DNS has been
touched, and the current Wix site is still live and untouched.

---

## 0. Before anything technical — owner sign-off

- [ ] `docs/CLIENT-CONTENT-SIGNOFF.md` completed by the owner
- [ ] **Phone number confirmed** — the website and Toast publish different numbers
- [ ] **Hours confirmed** — including whether the Monday/Wednesday midday closure on Toast is real
- [ ] **Base prices supplied** for the eight unpriced food items and the bar list
- [ ] **Destination inbox confirmed** for catering, private-event and careers enquiries

These four are the only genuine launch blockers. Everything else has an honest placeholder.

---

## 1. Repository

- [x] Code pushed to `github.com/Hyphycodes/Oasis-Website`
- [ ] At least two people have admin access to the repository
- [ ] `npm run verify` green on a clean clone:
      ```bash
      git clone https://github.com/Hyphycodes/Oasis-Website.git fresh && cd fresh
      npm install && npm run verify
      ```

---

## 2. Database (Supabase)

- [ ] Project created, region near Chicago
- [ ] **Plan decided** — free tier pauses after 7 idle days and has no point-in-time recovery
- [ ] Migration applied: `supabase/migrations/0001_init.sql`
- [ ] Seed loaded: `npm run content:seed && psql "$DATABASE_URL" -f supabase/seed.sql`
- [ ] Row counts sane: 3 menus, 10 categories, 83 items, 2 event series, 5 catering packages
- [ ] Owner account created in Authentication → Users
- [ ] Owner promoted:
      ```sql
      update public.profiles set role = 'owner', name = 'Owner name'
       where user_id = (select id from auth.users where email = 'owner@example.com');
      ```
- [ ] Manager accounts created (role `admin`)
- [ ] **RLS verified** — signed out, confirm you can read a menu and cannot read `inquiries`
- [ ] One manual backup downloaded and confirmed non-empty

---

## 3. Environment variables

Set in the hosting provider for **Production** and **Preview** separately.

- [ ] `NEXT_PUBLIC_SITE_URL` — the real domain in production; the preview URL in preview
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — marked **Sensitive**
- [ ] Confirm no secret is prefixed `NEXT_PUBLIC_`
- [ ] Confirm `.env.local` is not committed (`git ls-files | grep env` returns only `.env.example`)

---

## 4. Deploy a preview

```bash
npm run verify
npx vercel link
npx vercel                # preview, not production
```

- [ ] Preview builds
- [ ] Every route loads: `/` `/menu` `/menu/cocktails` `/menu/brunch` `/events`
      `/events/oasis-fridays` `/catering` `/private-events` `/visit` `/careers` `/legal/privacy`
- [ ] A nonsense URL renders the 404 page
- [ ] Legacy redirects work: `/menus` → `/menu`, `/event-list` → `/events`,
      `/join-our-team` → `/careers`, `/cart-page` → `/`,
      `/event-details/oasis-fridays-2026-08-14-22-00` → `/events/oasis-fridays`
- [ ] `/admin/login` loads; signing in works; the dashboard shows real counts
- [ ] Change a menu price in the admin → it appears on `/menu` within a minute
- [ ] Submit a catering enquiry → it appears in **Enquiries**
- [ ] Browser console is clean on every page
- [ ] `/robots.txt` and `/sitemap.xml` return the preview origin, not production

---

## 5. Domain, DNS, SSL

⚠️ **This is the step that takes the old site down. Do it deliberately, not on a Friday.**

- [ ] Confirm who controls `oasismexicankitchenbar.com` and that you can log in
- [ ] **Lower the DNS TTL to 300 seconds at least 24 hours beforehand** — this is what makes a fast
      rollback to Wix possible
- [ ] Record the current Wix DNS records somewhere safe before changing anything
- [ ] Add the domain in the hosting provider
- [ ] Point DNS at the new host
- [ ] Confirm `www` and apex both resolve and one redirects to the other consistently
- [ ] SSL certificate issued; `https://` works with no warning
- [ ] `http://` redirects to `https://`
- [ ] Restore the TTL to something normal once you are confident

---

## 6. Production deploy

```bash
npx vercel --prod
```

- [ ] Production URL live
- [ ] `NEXT_PUBLIC_SITE_URL` is the real domain — check a canonical tag in view-source
- [ ] Reservation button opens Toast Tables
- [ ] Order Online opens the Toast ordering site
- [ ] "Order catering on Toast" reaches the catering menu
- [ ] Ticket links work
- [ ] `tel:` link dials the right number on a real phone
- [ ] "Get directions" opens Maps at the right address

---

## 7. Search engines

- [ ] `/robots.txt` allows crawling and disallows `/admin`
- [ ] `/sitemap.xml` lists all 12 public routes with the production origin
- [ ] Google Search Console: property added, ownership verified, sitemap submitted
- [ ] Bing Webmaster Tools (optional)
- [ ] Google Business Profile updated to the new URL
- [ ] Facebook and Instagram bio links updated
- [ ] Structured data passes <https://search.google.com/test/rich-results> — check `Restaurant`
      on `/`, `Menu` on `/menu`, `Event` on `/events/oasis-fridays`
- [ ] Share the URL in a private message to check the Open Graph card renders

---

## 8. Final QA on the real domain

- [ ] Desktop: Chrome, Safari, Firefox
- [ ] Mobile: iOS Safari and Android Chrome, on a **real phone**, not a simulator
- [ ] Mobile menu opens, traps focus, closes on Escape
- [ ] Full keyboard pass on the homepage — visible focus everywhere, no traps
- [ ] Every form: submit empty, submit invalid, submit valid
- [ ] Hours show correctly for the current time of day
- [ ] Event dates are the correct upcoming Friday and Saturday
- [ ] Footer copyright shows the current year
- [ ] `npm run assets:check` green

---

## 9. Analytics — only if you actually add it

Nothing is configured. If you add analytics:

- [ ] Install it
- [ ] **Update `/legal/privacy` in the same commit** — it currently states there is no tracking, and
      that is why there is no cookie banner
- [ ] Add a consent mechanism if the tool sets non-essential cookies

Do not tick these unless the work is genuinely done. A privacy page that lies is worse than no
analytics.

---

## 10. Handover

- [ ] Owner has signed in to `/admin` themselves, at least once, while you watched
- [ ] Owner has `docs/OWNER-QUICK-START.md`
- [ ] Managers have `docs/ADMIN-GUIDE.md`
- [ ] Owner knows enquiries are **not** emailed and the page must be checked daily
- [ ] Owner has the photography list from `docs/ASSET-HANDOFF.md`
- [ ] Rollback procedure explained and written down
- [ ] Written down: domain registrar, hosting account, Supabase account, and who can log in to each
- [ ] Wix subscription decision made — **do not cancel while ticket links point there**

---

## Rollback

**Bad deploy, DNS already switched** — Vercel → Deployments → last good → Promote to Production.
About a minute.

**Something fundamentally wrong, need the old site back** — repoint DNS to the Wix records you saved
in step 5. This is why the TTL is lowered first and why the Wix subscription stays active through
launch week.

**Bad database migration** — restore a Supabase backup. Export `inquiries` first; you will lose
anything written since the backup.


---

## 9. Ticketing — before the first real ticket sells

### Stripe (account owner; not code)

Work through `docs/stripe-setup.md`. In short:

- [ ] Business verification complete, bank account connected, payouts scheduled
- [ ] Public business name, support email and phone set — they appear on the receipt
- [ ] Statement descriptor `OASIS MEXICAN` (the site adds the suffix `OASIS EVENT`)
- [ ] Payment methods on: card, Apple Pay, Google Pay, Link, Cash App Pay; Klarna/Affirm off
- [ ] **Payment method domain registered** for the live domain, or Apple Pay will not appear
- [ ] Webhook endpoint live at `/api/webhooks/stripe`, subscribed to the five events, signing secret in Vercel for Production
- [ ] Radar default rules on; dispute notification email set
- [ ] No test-mode key left in the Production environment

### Domain and email

- [ ] Real custom domain on the site. `oasis-website-mu.vercel.app` is fine for a menu; it is not fine for a checkout page — it costs conversions and complicates Apple Pay
- [ ] Resend sending domain verified (SPF, DKIM, ideally DMARC) on that domain; `ORDERS_FROM_EMAIL` is a real address there
- [ ] Test confirmation sent to a Gmail, an iCloud and an Outlook address; none in spam; QR scannable in each (`POST /api/orders/<n>/resend` from the admin sales page)

### Environment variables (Production and Preview)

- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `TICKET_SIGNING_SECRET` (32+ random characters; never reuse across environments)
- [ ] `CRON_SECRET`
- [ ] `RESEND_API_KEY`, `ORDERS_FROM_EMAIL`, `OWNER_ALERT_EMAIL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` present — orders and tickets are unreadable without it

### Legal and policy

- [ ] Refund policy confirmed by the owner. The default on every new event is "full refund up to 48 hours before, after that we move you to another date"; edit it per event in the editor. It is shown at checkout and kept on every order
- [ ] Ticket terms page reviewed: `/legal/tickets` (linked from checkout and every ticket email)
- [ ] Privacy page reviewed: `/legal/privacy` now covers checkout and Stripe
- [ ] **Accountant confirms** whether these admissions are taxable in Lockport and whether ticket revenue is recorded apart from food and beverage. `tax_rate_bps` stays 0 until then — it is a per-event setting, not a migration

### Money math worth knowing

On Stripe's standard US online rate of 2.9% + 30¢ (the editor shows this live per ticket type):

| All-in ticket | Stripe fee | You keep | Effective rate |
| --- | --- | --- | --- |
| $10 | $0.59 | $9.41 | 5.9% |
| $12 | $0.65 | $11.35 | 5.4% |
| $15 | $0.74 | $14.26 | 4.9% |
| $25 | $1.03 | $23.98 | 4.1% |
| 2 × $10 in one order | $0.88 | $19.12 | 4.4% |

The 30¢ is charged per order, not per ticket, so anything that encourages two tickets in one order
improves margin more than raising prices does. Disputes cost $15 each regardless of outcome, which
is why the descriptor and the refund policy matter more than they seem to.

### Operational readiness

- [ ] One staff member has walked the door flow on their own phone, scanning a real ticket, before a live event (`/admin/door` → Start scanning)
- [ ] Airplane-mode scan tested once: open the scanner online, switch wifi off, scan, switch it on, confirm the check-in synced
- [ ] Attendee CSV printed the morning of the first ticketed event. Once
- [ ] Owner knows where to find sales, resend a ticket, refund an order, and comp someone in — `docs/runbook.md`
- [ ] `npx tsx scripts/hammer-reserve.ts` run against production once with the service key, to prove the 10-seat test passes there too

## 10. Getting off Tickeri without a scary weekend

1. **Pick the smallest upcoming event** as the first in-house sale — the one where 15 tickets is a normal night.
2. **Run both for that one event.** Keep the Tickeri listing live; turn ticketing on for the same event here and point Instagram at the site link. Compare conversion and support volume.
3. Build the door list from both sources — the scanner handles website tickets, and the Tickeri list stays on a phone or on paper. This is the only awkward event.
4. **Then cut over.** New events are website-only. Don't create new Tickeri listings. The Tickeri sync in the admin can stay for the tail.
5. Let existing Tickeri events run out naturally rather than migrating anyone's ticket. Those events keep their outside link: every event carries a `ticket_url`, and an event with ticketing off and a link simply sends the guest there.
6. Once the last one clears, replace the Tickeri links in the Instagram bio and Linktree, and archive the account rather than deleting it — the historical sales records are worth keeping.

## After launch, in rough priority order

See `docs/roadmap.md`: wallet passes, Tap to Pay at the door, the post-event email, reserved tables,
waitlist release, SMS reminders.

## The two things most likely to go wrong

**Emails in spam.** Nothing destroys trust as fast as a paid ticket that never arrives. Verify the
domain properly, send from a real address at that domain, and the resend button is in front of the
guest on the confirmation page so they can fix it themselves.

**Doors open and the wifi is down.** Test the offline scan path before the first event, not after
the first bad night.
