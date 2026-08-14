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
