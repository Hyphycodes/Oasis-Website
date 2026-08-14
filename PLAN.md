# PLAN.md — Oasis Mexican Kitchen & Bar Website Rebuild

Implementation plan derived from `docs/SITE-AUDIT.md`, `docs/CONTENT-QUESTIONS.md`,
`docs/ASSET-MANIFEST.md`, and `docs/DESIGN-DIRECTION.md`. Those four documents and this one agree;
where they overlap, this file names the concrete file, route, or component.

---

## 1. Architecture and stack

The repository was **empty** at the start of this project — there was no existing stack to extend.
The live site is Wix, which is a hosted platform, not a codebase.

| Layer | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15, App Router, React 19** | Server components keep menu/event content in the HTML (the current Wix menu is invisible without JS — a real SEO defect). Route-level metadata, sitemap, and OG image generation are first-class. |
| Language | **TypeScript, strict** | The content model is the product here. Types are what stop a recurring event from acquiring a hard-coded date. |
| Styling | **Tailwind CSS v4 + CSS custom properties** | Tokens live in `@theme` as real CSS variables, so the design system is inspectable in devtools and usable outside React. v4 needs no `tailwind.config.js`. |
| Content (public) | **Typed TS modules** under `src/content/` | Zero-dependency source of truth. The site builds and deploys with no backend at all. |
| Content (managed) | **Supabase** — Postgres + Auth + Storage + RLS | Single backend for auth, structured content, and media. Falls back to the TS modules when unreachable. |
| Forms | Server Actions → Supabase `inquiries` | No third-party form service. Behavior is honest and testable. |
| Testing | **Vitest** | Unit coverage on the data layer, where the real risk is. |
| Deployment | **Vercel** | Documented, not executed — see §10. |

### 1.1 The content resolution rule

This is the most important architectural decision in the project.

```
Component  →  src/content/resolve.ts  →  Supabase (if configured & reachable)
                                      →  src/content/*.ts   (always, as fallback)
```

Every public page reads content through `resolve.ts`. If Supabase env vars are absent, or the query
fails, or it times out, the resolver returns the typed static content instead. Consequences:

- The site **cannot go blank** because the CMS is down. (Prompt 05 reliability requirement.)
- The repo clones and runs with **zero configuration** — `npm i && npm run dev` works immediately.
- The static modules double as the **seed data**: `scripts/generate-seed.ts` emits
  `supabase/seed.sql` directly from them, so the owner never re-enters content that was already
  captured.

---

## 2. Route map

| Route | File | Rendering | Notes |
|---|---|---|---|
| `/` | `src/app/(site)/page.tsx` | Static + revalidate | Homepage |
| `/menu` | `src/app/(site)/menu/page.tsx` | Static + revalidate | Food menu |
| `/menu/cocktails` | `src/app/(site)/menu/cocktails/page.tsx` | Static + revalidate | Bar |
| `/menu/brunch` | `src/app/(site)/menu/brunch/page.tsx` | Static + revalidate | Honest empty state |
| `/events` | `src/app/(site)/events/page.tsx` | `revalidate = 300` | Upcoming occurrences |
| `/events/[slug]` | `src/app/(site)/events/[slug]/page.tsx` | `generateStaticParams` + revalidate | Series detail |
| `/catering` | `src/app/(site)/catering/page.tsx` | Static | Toast packages + inquiry form |
| `/private-events` | `src/app/(site)/private-events/page.tsx` | Static | Celebration inquiry form |
| `/visit` | `src/app/(site)/visit/page.tsx` | Static | Hours, address, directions |
| `/careers` | `src/app/(site)/careers/page.tsx` | Static | Application form |
| `/legal/privacy` | `src/app/(site)/legal/privacy/page.tsx` | Static | Required by the forms |
| `*` | `src/app/not-found.tsx` | Static | 404 |
| `/sitemap.xml` | `src/app/sitemap.ts` | — | |
| `/robots.txt` | `src/app/robots.ts` | — | |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Edge | Generated OG card |

### Admin

| Route | File | Notes |
|---|---|---|
| `/admin/login` | `src/app/admin/login/page.tsx` | Public |
| `/admin` | `src/app/admin/page.tsx` | Dashboard |
| `/admin/hours` · `/announcement` · `/menu` · `/events` · `/catering` · `/pages` · `/media` · `/inquiries` · `/seo` | `src/app/admin/*/page.tsx` | CRUD |

Admin is a **separate route group** with its own layout, so admin code never enters a public bundle.
`middleware.ts` gates `/admin/*` at the edge; every mutation re-checks role **server-side**.

### Route mapping from the current site

| Current | New | Handling |
|---|---|---|
| `/menus` | `/menu` | 301 in `next.config.ts` |
| `/event-list` | `/events` | 301 |
| `/event-details/[wix-slug]` | `/events/[slug]` | 301 with slug normalization |
| `/join-our-team` | `/careers` | 301 |
| `/cart-page` | `/` | 301 — orphan Wix Stores route, deliberately retired |

---

## 3. Component map

Composition rules are enforced by having **no single generic `<Section>` card**. Each route gets a
distinct composition primitive — this is the structural answer to "don't repeat the split-image
template on every page."

```
src/components/
├── layout/
│   ├── AnnouncementBar.tsx   structured, scheduled, dismissible; content from CMS, never hard-coded
│   ├── Header.tsx            logo, nav, Reserve (primary) + Order (secondary)
│   ├── MobileDrawer.tsx      focus trap, Esc, scroll lock, restores focus
│   ├── Footer.tsx            hours, address, phone, real socials only, computed year
│   └── SkipLink.tsx
├── primitives/
│   ├── Band.tsx              full-bleed color band: cream | linen | sand | espresso
│   ├── Measure.tsx           reading-width constraint
│   ├── Editorial.tsx         asymmetric 7/5 or 5/7 split, bleed left|right
│   ├── Stagger.tsx           the anti-three-card grid: cells of differing size/offset/ratio
│   ├── Eyebrow.tsx
│   ├── Button.tsx            primary | secondary | ghost | on-dark; hover/focus/pressed
│   ├── ExternalLink.tsx      labels destination, rel="noopener noreferrer", icon
│   └── Reveal.tsx            one-shot reveal; no-ops under reduced motion
├── media/
│   ├── Asset.tsx             registry-driven <Image>: ratio, focal point, sizes, priority
│   ├── AssetVideo.tsx        muted/loop/inline, poster, reduced-motion → poster
│   └── Placeholder.tsx       branded neutral placeholder at exact geometry
├── home/                     Hero · ExperienceGrid · SignaturePreview · BarAndBrunch ·
│                             AfterDark · CateringPromo · Gallery · VisitStrip
├── menu/                     CategoryNav (sticky) · MenuSection · MenuItem · ModifierList · DietaryTags
├── events/                   EventCard · EventList · EventMeta · TicketCta · AddToCalendar · EventStatus
├── forms/                    InquiryForm · Field · Fieldset · FormStatus · Honeypot
└── admin/                    AdminShell · DataTable · EditorForm · PublishBar · ConfirmDialog ·
                              EmptyState · StatusPill · WarningList
```

---

## 4. Content / data model

Eight domains, deliberately separate. No JSON blobs.

```
site_settings      name, address, phones, hours[], temporary_closures[],
                   reservation_url, order_url, socials[], seo defaults
announcements      message, href, label, starts_at, ends_at, enabled, tone
menus              slug (food|cocktails|brunch), title, note, service_window
menu_categories    menu_id, name, sort, note
menu_items         category_id, name, description, price_cents (nullable),
                   price_note, dietary[], available, featured, sort
menu_modifiers     item_id, label, price_cents (nullable), sort
event_series       slug, title, description, cadence, age_min, music, venue,
                   artwork_asset, ticket_url, status
event_occurrences  series_id, starts_at, ends_at, price_cents, fee_cents,
                   status (scheduled|sold_out|cancelled|postponed|free), ticket_url
catering_packages  name, serves_min, serves_max, price_cents, includes[], sort
catering_items     name, price_cents, note, sort
page_sections      page, key, heading, body, visible, sort, variant
media_assets       asset_id, path, alt, width, height, ratio, focal, poster, status
inquiries          type, name, email, phone, payload jsonb, status, notes, created_at
profiles           user_id, role (owner|admin|editor), name
audit_log          actor, table, row_id, action, diff, at
```

### 4.1 The recurring-event rule

`event_series` holds **no date**. `event_occurrences` holds **only** dates. The public event card
renders its date from `occurrence.startsAt` as HTML text, in the venue's `America/Chicago` zone,
composited over the artwork rather than read from it. A series therefore *cannot* display a stale
date, because the series has no date to display. Constraints enforce `ends_at > starts_at`.

Occurrences are generated from `cadence` (`weekly:FRI` / `weekly:SAT`) at read time for a rolling
26-week window, so the calendar never runs out and no one maintains 21 rows by hand.

### 4.2 Nullable prices

`price_cents` is nullable **on purpose**. A null price renders "Market price — ask your server", it
does not render `$0` and it does not silently omit the row. The admin dashboard lists every null
price as a warning. This is the structural answer to audit finding §3.9.

---

## 5. Asset strategy

Registry at `src/content/assets.ts`, typed `AssetId → AssetRecord`. Components request
`<Asset id="signatureBirria" />` and never a file path. Replacement is a one-line registry change or
a same-named file drop. Full spec: `docs/ASSET-SLOT-SPECS.md`, provenance: `docs/ASSET-MANIFEST.md`.

`scripts/check-assets.ts` fails the build on: missing files, wrong ratio, oversize weight, missing
poster, missing/duplicate alt, unused registry entries, unregistered files in `public/media`, and
any `wixstatic.com` reference in build output.

---

## 6. CMS and admin strategy

- **Auth:** Supabase Auth, email + password. Session via `@supabase/ssr` cookies.
- **Roles:** `owner` (everything incl. users and SEO), `admin` (all content), `editor` (menus,
  events, hours, announcements, inquiries — not settings or users).
- **Authorization:** Postgres **RLS** is the enforcement point. Every table has explicit policies
  keyed on `profiles.role`. Hidden UI is never treated as authorization. The service-role key is
  used only inside server-only modules and is never imported into a client component.
- **Boundaries:** structured fields and approved layout variants only. No page builder, no raw
  HTML, no CSS, no font/color controls. Rich text is a small, sanitized subset (bold, italic, link).
- **Revalidation:** mutations call `revalidateTag()` for the affected domain, so public pages
  update within one request without a redeploy.

---

## 7. SEO

Per-route `metadata`, canonical URLs from `NEXT_PUBLIC_SITE_URL`, OG images, `sitemap.ts`,
`robots.ts`. JSON-LD: `Restaurant` (with `openingHoursSpecification`, `hasMenu`, `geo`),
`Menu`/`MenuSection`/`MenuItem`, and `Event` per occurrence — all built **only** from verified
facts. SEO strings live in metadata, never in the visible headline: the hero says
"Modern Mexican. Tropical Energy." while the `<title>` carries the Lockport keyword.

---

## 8. Accessibility

Semantic landmarks, one `h1` per route, visible `2px` orange focus rings with offset, focus-trapped
drawer, labelled inputs with `aria-describedby` errors, 44×44 touch targets, `prefers-reduced-motion`
honored in CSS, no information by color alone (event status carries text + icon, not just hue).

---

## 9. Analytics

**None configured.** No script, no consent banner, no cookie notice — because there is nothing to
consent to. `docs/MAINTENANCE.md` documents how to add Vercel Analytics later. The site will not
claim analytics it does not have.

---

## 10. Deployment

Vercel, framework preset `nextjs`. Env vars in `docs/ENVIRONMENT.md`, names-only in `.env.example`.

Deployment is **prepared, not executed**: no Vercel project is created, no DNS is touched, and the
existing Wix site is not disturbed. Commands are documented in `docs/LAUNCH-CHECKLIST.md`. The one
authorized external action in this project is pushing the repository to
`github.com/Hyphycodes/Oasis-Website`.

---

## 11. Milestones (build order)

| # | Milestone | Gate |
|---|---|---|
| 1 | Discovery docs | ✅ this document + four in `docs/` |
| 2 | Design system + homepage | Homepage passes visual inspection at 1440/1024/768/390/360 |
| 3 | Public routes | Every route complete; forms honest; metadata present |
| 4 | Asset system | Registry drives every placement; checker passes; no Wix in output |
| 5 | CMS + admin | Manager can edit specials, hours, menus, events, media, inquiries |
| 6 | Visual QA | `docs/VISUAL-QA.md`; all high/medium issues resolved |
| 7 | Handoff | README + 4 handoff docs; `npm run verify` green; push to `main` |

---

## 12. Known risks

| Risk | Mitigation |
|---|---|
| No food photography exists | Placeholders at exact geometry; layout is final, pixels are pending |
| Blocking content conflicts (phone, hours, prices) | Documented in `CONTENT-QUESTIONS.md`; website values used provisionally and labelled |
| Wix event ticketing is the only ticket path | Ticket URL is a per-occurrence field; swapping providers is a data edit |
| Brunch menu is empty | Honest empty state; nothing invented |
| Owner is non-technical | `OWNER-QUICK-START.md` in plain language; destructive actions confirm |
