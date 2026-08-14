# Oasis Mexican Kitchen & Bar

Website for Oasis Mexican Kitchen & Bar — 1250 E. 9th St., Lockport, IL 60441.

A rebuild of the restaurant's Wix site that preserves its warm cream/sand/orange/brown identity
while fixing the structural problems the old site had: an empty homepage, catering hidden inside
the ordering system, recurring event flyers showing stale dates, and menu items with no prices.

---

## Quick start

```bash
git clone https://github.com/Hyphycodes/Oasis-Website.git
cd Oasis-Website
npm install
npm run dev
```

Open <http://localhost:3000>. **No configuration is required** — the site serves typed content from
`src/content/` and every page works. Supabase is optional and only adds the admin area.

---

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Vitest |
| `npm run assets:check` | Validate the media registry against the actual files |
| `npm run content:seed` | Regenerate `supabase/seed.sql` from `src/content/` |
| `npm run assets:fetch` | Re-pull reference media from the current Wix site |
| **`npm run verify`** | **All of the above, in order. Run before every deploy.** |

---

## Architecture

Next.js 15 (App Router, React 19), TypeScript strict, Tailwind CSS v4, Supabase (optional),
Vitest.

```
src/
├── app/
│   ├── (site)/          public routes — one root layout, header, footer
│   ├── admin/           admin subtree; never bundled into a public page
│   ├── actions/         server actions (inquiry submission)
│   ├── globals.css      design tokens as CSS custom properties
│   └── sitemap.ts · robots.ts · opengraph-image.tsx
├── components/
│   ├── layout/          header, mobile drawer, footer, announcement bar
│   ├── primitives/      Band, Frame, Button, Display, Reveal, PageHeader
│   ├── media/           Asset, AssetVideo, Placeholder — registry-driven
│   ├── menu/ events/ home/ forms/ admin/
├── content/             ← THE SOURCE OF TRUTH
│   ├── site.ts          hours, address, phone, links, socials
│   ├── menu.ts          83 items across 3 menus
│   ├── events.ts        recurring series (no dates — see below)
│   ├── catering.ts      packages and trays
│   ├── pages.ts         section copy and per-page SEO
│   ├── assets.ts        media registry
│   └── resolve.ts       Supabase-with-static-fallback resolver
├── lib/                 events, hours, format, seo, supabase
└── middleware.ts        edge gate for /admin
```

### Three decisions worth knowing before you change anything

**1. Content resolves with a fallback.** Every public page reads through `src/content/resolve.ts`,
which tries Supabase (2.5s timeout, never throws) and falls back to the typed modules. The site
cannot go blank because the CMS is down, and it clones and runs with zero config. The same modules
generate the seed SQL, so the owner never re-enters content that was already captured.

**2. An event series has no date.** `EventSeries` carries a cadence and a start/end time in minutes.
Dates live only on generated occurrences and are rendered as HTML text over the artwork. A recurring
event therefore *cannot* display a stale date, because the series has no date to display. The asset
checker fails the build if series artwork is tagged as containing a date. This is the fix for the
single worst defect on the old site.

**3. `price_cents` is nullable on purpose.** `null` means "not published" and renders "Ask your
server" — never `$0`, never a silently missing row. Nine items are currently unpriced because the
restaurant has not published those prices anywhere. A database constraint requires a price or a
note.

### Media

Components request assets by semantic ID (`<Asset id="backBar" />`) and never by path. Replacing the
whole media package is a registry edit — see `docs/ASSET-HANDOFF.md`. `npm run assets:check` verifies
dimensions against the real pixels, file weights, alt text, orphans, and that no Wix URL is reachable
from runtime code.

Media is committed to the repository, so `git clone` restores the entire site including its pictures.
Untouched masters live in `media-originals/`, which is git-ignored and never served.

---

## Documentation

| Document | For |
|---|---|
| [`PLAN.md`](./PLAN.md) | Architecture, routes, data model, milestones |
| [`docs/OWNER-QUICK-START.md`](./docs/OWNER-QUICK-START.md) | **The restaurant owner — start here** |
| [`docs/ADMIN-GUIDE.md`](./docs/ADMIN-GUIDE.md) | Day-to-day editing, plain language |
| [`docs/CONTENT-QUESTIONS.md`](./docs/CONTENT-QUESTIONS.md) | **Unresolved business facts — read before launch** |
| [`docs/CLIENT-CONTENT-SIGNOFF.md`](./docs/CLIENT-CONTENT-SIGNOFF.md) | Owner's approval checklist |
| [`docs/SITE-AUDIT.md`](./docs/SITE-AUDIT.md) | What the old site did and what was wrong |
| [`docs/DESIGN-DIRECTION.md`](./docs/DESIGN-DIRECTION.md) | Tokens, type scale, motion, anti-patterns |
| [`docs/CONTENT-MODEL.md`](./docs/CONTENT-MODEL.md) | Schema and why it is shaped that way |
| [`docs/ASSET-MANIFEST.md`](./docs/ASSET-MANIFEST.md) · [`ASSET-SLOT-SPECS.md`](./docs/ASSET-SLOT-SPECS.md) · [`ASSET-HANDOFF.md`](./docs/ASSET-HANDOFF.md) | Media |
| [`docs/ENVIRONMENT.md`](./docs/ENVIRONMENT.md) | Environment variables, Supabase setup |
| [`docs/VISUAL-QA.md`](./docs/VISUAL-QA.md) | The design review and its findings |
| [`docs/MAINTENANCE.md`](./docs/MAINTENANCE.md) · [`LAUNCH-CHECKLIST.md`](./docs/LAUNCH-CHECKLIST.md) · [`BACKUP-AND-RECOVERY.md`](./docs/BACKUP-AND-RECOVERY.md) | Operations |

---

## Deployment

Not yet deployed. No hosting project exists and DNS has not been touched; the existing Wix site is
untouched and still live.

```bash
npm run verify
npx vercel link
npx vercel --prod
```

Set the environment variables from `docs/ENVIRONMENT.md` first. Full sequence in
`docs/LAUNCH-CHECKLIST.md`.

---

## Before launch

Four business facts are unresolved and are documented with their conflicting sources in
`docs/CONTENT-QUESTIONS.md`:

1. **Which phone number is correct?** The website says (815) 545-7556; Toast says (815) 524-4188.
2. **What are the real hours?** The two sources disagree on the opening time every day, and Toast
   shows a Monday/Wednesday midday closure the website does not mention.
3. **Base prices** for eight food items and the entire bar list.
4. **Which inbox** receives catering, private-event, and careers enquiries — no email address is
   published anywhere today.

The site launches without them, using the first-party website values and labelling them as
unconfirmed in the admin. It should not launch *permanently* without them.

---

## Licence

Private, © Oasis Mexican Kitchen & Bar. Fonts are Archivo under the SIL Open Font License.
