# Maintenance

Who is responsible for what, and how to fix things.

---

## Who handles what

### The hosting provider (Vercel, assumed)

Servers, SSL certificate issuance and renewal, CDN, DDoS protection, build infrastructure,
deployment history and rollback, runtime logs.

**Not their problem:** your content, your domain registration, your database.

### The database provider (Supabase)

Postgres hosting, automatic backups, authentication, uptime.

⚠️ **A free-tier project pauses after 7 days with no activity.** Guests would not notice — the site
falls back to its built-in content — but the admin would stop working and enquiries would stop being
stored. Decide free vs Pro before launch. See `BACKUP-AND-RECOVERY.md`.

### Whoever registered the domain

DNS records, renewal, WHOIS. **Write down where `oasismexicankitchenbar.com` is registered and who
can log in.** This is the single hardest thing to recover if that person is unavailable, and it is
not recorded anywhere in this repository because it cannot be.

### Toast

Reservations, online ordering, catering orders, payment. All external. If ordering breaks, that is
Toast, not this website.

### Wix

Currently still serves the live site and the event ticketing. **Do not cancel the Wix subscription
until a replacement ticketing path exists** — the ticket links point there.

---

## Routine updates

### Monthly

```bash
npm outdated
npm audit
```

Patch and minor updates:

```bash
npm update
npm run verify        # lint + typecheck + test + assets + build
```

If `verify` is green, deploy.

### Major updates (Next.js, React, Tailwind)

Do these deliberately, one at a time, never during a busy week.

```bash
git checkout -b upgrade/next-16
npm install next@latest react@latest react-dom@latest
npm run verify
```

Then check the homepage, `/menu`, `/events` and `/admin` in a browser before merging. `npm run
verify` catches compile and content errors; it does not catch a layout that has moved.

### Security updates

`npm audit` reporting **high** or **critical** in a runtime dependency — patch within a week.
Anything in `devDependencies` only is far less urgent; those never reach a visitor.

#### Known remaining advisories

`npm audit` currently reports **3 high** findings, all of which resolve only by moving to Next 16:

| Package | Issue | Assessment |
|---|---|---|
| `postcss` 8.4.31, bundled inside `next` | XSS via unescaped `</style>` in stringify output (CVSS 6.1) | Build-time only. It processes our own stylesheets, never visitor input, so there is no path to exploitation here. |
| `sharp` 0.34.5, bundled inside `next` | libvips CVEs | Used by Next's image optimiser. All images are first-party files committed to this repo; no user upload path exists. |
| `next` | Inherits the two above | — |

The project's **direct** `sharp` dependency is on the patched 0.35.3.

These are worth clearing at the next planned maintenance window by upgrading to Next 16 — a major
version, so do it deliberately with a full browser pass, not alongside a content change.

#### Node version

`engines.node` is pinned to `22.x` and `.nvmrc` says `22`. This is deliberate: an open-ended
`>=20.0.0` lets the host silently jump to a new Node major and turns a working build into a broken
one with no change on our side.

---

## Rolling back a bad deployment

**Fastest path — about a minute, no rebuild:**

1. Vercel dashboard → **Deployments**.
2. Find the last known-good deployment.
3. **⋯ → Promote to Production**.

Or from the CLI:

```bash
npx vercel rollback
```

**Then fix the cause.** A rollback is not a fix; the next deploy will reintroduce the problem.

**If a database migration was part of the bad deploy**, rolling back the code is not enough — the
schema is still changed. Restore a Supabase backup as well, and expect to lose data written since
that backup. This is why migrations are applied deliberately and separately from routine deploys.

---

## Monitoring

Currently: **runtime logs only** (Vercel → Deployments → Runtime Logs). There is no uptime monitor
and no error tracking.

Reasonable additions, in order of value:

1. **An uptime monitor** — UptimeRobot's free tier pings the homepage every 5 minutes and emails you
   if it stops answering. Highest value for the least effort.
2. **Error tracking** — Sentry's free tier catches server errors before a guest reports them.
3. **Analytics** — Vercel Analytics is one line. ⚠️ **If you add it, update `/legal/privacy` in the
   same change.** That page currently states plainly that there is no tracking, which is why there
   is no cookie banner. Leaving it stale would make the site's own privacy statement false.

---

## What needs a developer

| Change | Owner can do it | Why |
|---|---|---|
| Hours, specials, prices, dish descriptions, sold-out, event status, enquiries | ✅ | Built for it |
| New dish or new menu section | ❌ | Ordering and layout need care |
| New page | ❌ | Route, metadata, sitemap |
| Photo swap | ❌ | Each slot has a fixed shape and focal point |
| Business name, address, phone | ❌ | Also affects structured data and Google listings |
| One-off event (not a recurring night) | ❌ | Data entry in the events table |
| Colours, fonts, spacing, layout | ❌ | Deliberately not editable — this is what protects the design |
| Adding analytics | ❌ | Requires a privacy-page change in the same commit |

---

## Common tasks

**Change a menu price outside the admin**

```bash
# edit src/content/menu.ts, then
npm run content:seed
psql "$DATABASE_URL" -f supabase/seed.sql
```

**Add a new photo**

1. Drop the file in the right folder under `public/media/`.
2. Update the one entry in `src/content/assets.ts` — `path`, real `width`/`height`, `ratio`,
   `focal`, honest `alt`, `status: 'final'`.
3. `npm run assets:check`
4. `npm run dev`, look at the affected pages, then deploy.

**Add a one-off event**

```sql
insert into public.event_occurrences (series_slug, starts_at, ends_at, status, price_cents)
values ('oasis-fridays', '2026-12-31T22:00:00-06:00', '2027-01-01T04:00:00-06:00', 'scheduled', 2500);
```

**Grant someone admin access**

Supabase → Authentication → Add user, then:

```sql
update public.profiles set role = 'admin', name = 'Their name'
 where user_id = (select id from auth.users where email = 'them@example.com');
```

New accounts start as `editor` by design.

**See who changed what**

```sql
select at, actor, table_name, row_id, action, diff
  from public.audit_log
 order by at desc limit 50;
```

---

## Health check, every quarter

- [ ] `npm outdated` and `npm audit`
- [ ] Reservation and ordering links still work
- [ ] Owner can still sign in to `/admin`
- [ ] Download a Supabase backup and confirm it is not empty
- [ ] Hours are still correct, including holidays
- [ ] `npm run assets:check` — has the photography gap closed?
- [ ] Re-read `CONTENT-QUESTIONS.md` — has the owner answered the blocking four yet?
