# Seasonal Theme System — Audit and Plan

**Date:** 2026-09-10 · **Scope:** add a switchable seasonal art-direction layer to the existing
Oasis website without redesigning it. First theme: *Halloween / Día de los Muertos*
(`halloween-dotd`).

This document is the audit that precedes any change. Nothing here was implemented when it was
written; the sections after §3 describe what *will* be built and where.

---

## 1. Existing architecture summary

| Concern | What exists |
|---|---|
| Framework | **Next.js 15.5** (App Router) · **React 19** · TypeScript strict (`noUncheckedIndexedAccess`) |
| Routing | `src/app/(site)/*` — public routes under one layout (`Header`, `main`, `Footer`); `src/app/admin/*` — admin subtree with its own layout, never bundled into a public page |
| Rendering | Server components by default. Public pages are **ISR**: `/` and `/events*` revalidate every 300s, `/menu` `/visit` `/catering` every 3600s. Admin pages are `force-dynamic`. |
| Styling | **Tailwind CSS v4** via `@tailwindcss/postcss`. All design tokens are declared once in `@theme {}` in `src/app/globals.css` and therefore exist as real CSS custom properties (`--color-ivory`, `--color-plum`, `--font-display`, `--radius-lg`, `--spacing-band` …). Utilities compile to `var(--color-*)`, which is what makes a token-level theme possible without touching components. No CSS modules, no styled-components. |
| Animation | No animation library. Motion is CSS only: one `.reveal` (IntersectionObserver, one-shot), one `.ticker` marquee, transitions. Global `prefers-reduced-motion` rule collapses all animation to 0.001ms. |
| Media | Registry-driven. Components request `<Asset id="backBar" />`; `src/content/assets.ts` is the typed registry, `src/content/media.ts` merges Supabase `media_assets` rows over it (2.5s timeout, never throws). `AssetVideo` (client) paints a poster first and skips the video under reduced motion, save-data, or narrow viewports. `npm run assets:check` fails the build on any unregistered file under `public/media/`. |
| Typography | `next/font/google`: Archivo (variable, `wdth` axis) as `--font-archivo`, Anton as `--font-anton`. `.display` / `.display-poster` classes. |
| Section primitives | `Band` (full-bleed colour field: ivory · ivory-deep · cream · linen · sand · teal · plum · espresso), `Frame` (1120/1440 max), `Reveal`, `Eyebrow`/`Display`/`Lead`, `Button`/`ButtonLink`/`ExternalButtonLink`, `PageHeader`. Sand bands carry `.grain` (a 160px paper texture at 3% multiply) — the only texture on the site today. |
| Global settings | `site_settings` singleton (`id = 'default'`, `payload jsonb`) — a **sparse override** of `src/content/site.ts`. Read via `getSiteSettings()` in `src/content/resolve.ts`. Announcements, special hours, page copy each have their own table. |
| Supabase | Optional. Postgres + Auth + Storage + RLS. Migrations in `supabase/migrations/000{1,2,3}_*.sql`. Seed generated from the typed content (`npm run content:seed`). Bucket `media` (public read, staff write). |
| Data access | One small `Db` interface (`src/lib/db/types.ts`: `list/get/insert/update/upsert/remove`) with two adapters: `SupabaseDb` and a file-backed `LocalDb` (dev/test only, refused in production). `PRIMARY_KEY` map must know every table. |
| Admin auth | `getStaff()` in `src/server/auth.ts` → Supabase Auth + `profiles` row, or local dev identities, or `OPEN_STAFF` while the admin gate is off (`ADMIN_REQUIRE_SIGN_IN` unset). Middleware gates `/admin/*` at the edge; every mutation calls `requireCapability()`; RLS and a publish trigger enforce it in the database. |
| Admin UI | `AdminShell` (teal header, 6 nav items + owner-only Staff), `Card`, `Notice`, `TaskLink`, `Label`/`TextInput`/`Select`/`Checkbox`, `ActionForm` + `SubmitButton` (useActionState, aria-live results, "See it on:" links). Settings screen at `/admin/settings` is the model for "one record, many forms". |
| Admin CRUD pattern | `'use server'` actions in `src/server/actions/*.ts` → `run(capability, job)` → zod parse → `db.upsert` → `done(message, area)` which `revalidatePath`s the affected public routes (`AFFECTED` table in `shared.ts`). |
| Uploads | `storeMediaFile()` (server, ≤8MB image / ≤25MB video → Supabase Storage or `public/media/uploads` locally) and `uploadMediaDirect()` (browser → Storage, for signed-in staff). Both end in a `media_assets` row keyed by `asset_id`. |
| Caching | ISR per route + `React.cache` per request. Admin saves revalidate by area. Public reads never read `draft`. |
| Breakpoints | Tailwind defaults (`sm` 640 · `lg` 1024 · `xl` 1280). Mobile is designed, not cropped: horizontal snap strips, drawer via portal. |
| Accessibility | AA-measured token pairs (documented in `docs/DESIGN-DIRECTION.md`), 44px targets, `sr-only` destination labels, focus rings, reduced-motion and reduced-transparency handled globally. |
| Deployment | Vercel assumed (`docs/LAUNCH-CHECKLIST.md`). `next.config.ts` allows Supabase Storage as an image host. Node 22. |

### Performance-sensitive areas

- Homepage hero: full-bleed `AssetVideo` with poster; LCP is the poster image.
- Homepage `Offerings`/`BarAndBrunch`: 8 `next/image` placements with `sizes`.
- Everything is server-rendered; the only client components on `/` are `AssetVideo`, `Reveal`,
  `MobileDrawer`. Any theme decoration must not add hydration-heavy JS.

---

## 2. Relevant file map

```
src/app/layout.tsx                     <html>/<body>, fonts, metadata, imports globals.css
src/app/(site)/layout.tsx              skip link · AnnouncementBar · Header · <main> · Footer · JSON-LD
src/app/(site)/page.tsx                Hero · ActionRail · Offerings · BarAndBrunch · AfterDark · CateringAndVisit
src/app/globals.css                    @theme tokens · base · components (.grain .display .reveal .ticker) · utilities
src/components/home/Hero.tsx           plum surface, AssetVideo, two scrims, headline + CTAs
src/components/home/*.tsx              the other four homepage movements (Band-based)
src/components/layout/Header.tsx       sticky, bg-ivory/95 + backdrop-blur
src/components/layout/MobileDrawer.tsx portal into <body>  ← outside any wrapper the site layout renders
src/components/layout/Footer.tsx       bg-plum
src/components/primitives/Band.tsx     surface → class map
src/components/media/{Asset,AssetVideo,Placeholder}.tsx
src/content/{site,pages,assets,media,resolve,types}.ts
src/lib/db/{index,types,local,supabase}.ts
src/lib/events.ts                      venue-time helpers (America/Chicago): venueLocalIso (private), venueIsoDate
src/server/auth.ts · permissions.ts    staff, capabilities, sections
src/server/actions/{shared,settings,media}.ts
src/server/media-files.ts              storeMediaFile / registerDirectMedia
src/server/migration/records.ts        the one content→table mapping (local seed + seed.sql + tests)
src/components/admin/{AdminShell,AdminNav,ui,ActionForm,Artwork}.tsx
src/app/admin/settings/*               the "one record, several cards" pattern to copy
src/app/admin/media/*                  UploadForm, library
supabase/migrations/0003_admin_backend.sql   latest migration; RLS + guard-trigger conventions
scripts/{check-assets,generate-seed}.ts
```

---

## 3. Existing data flow

```
request → (site)/layout  ─ getSiteSettings() ─┐
        → page.tsx       ─ getPageCopy(), getPublicEvents(), getCateringPackages()
                          └─► src/content/resolve.ts ─► getReadDb()
                                                      ├─ SupabaseDb (service client, RLS-bypassing READ of published rows)
                                                      ├─ LocalDb (.oasis-local/content.json, dev only)
                                                      └─ null → typed static modules (always the fallback)
<Asset id> → getMediaMap() → media_assets rows merged over src/content/assets.ts

admin form → server action → run('capability') → getWriteDb() (session client; RLS applies)
                                                 → zod → db.upsert → done() → revalidatePath(affected routes)
```

Two properties every new feature must preserve:

1. **Nothing public throws on a database problem.** Every read has a static fallback.
2. **A clean checkout renders identically with no environment variables.**

---

## 4. Proposed seasonal-theme architecture

The theme is a **token remap plus a small set of decorative layers**, switched by one attribute.
Components are not edited per theme.

```
src/themes/
  types.ts            ThemeSlug · ThemeDefinition · ThemeConfig · ThemeAssetSlot · ThemeSettingsRow
  registry.ts         THEMES — 'default' and 'halloween-dotd' (name, default assets, option defaults)
  schedule.ts         isThemeActiveAt(row, now)  — pure, unit-tested
  config.ts           parse/merge config: defaults ← stored config ← intensity presets
  resolve.ts          getActiveTheme() (server, React.cache, static fallback = default)
src/components/theme/
  ThemeRoot.tsx       server: <div data-theme="…" class="theme-root"> + html background <style>
                      + ThemeAttribute (tiny client effect so portals/drawer inherit the attribute)
  ThemeAtmosphere.tsx server: fixed background texture · ambient glow · vignette · petals (CSS only)
  ThemeHeroLayer.tsx  server: papel picado (top) · marigold left/right · haze — rendered inside Hero
  ThemeDivider.tsx    server: ornamental divider between chosen homepage sections; null on default
src/themes/halloween-dotd/
  theme.css           [data-theme="halloween-dotd"] { --color-ivory: … } token remap + effect CSS
public/themes/halloween-dotd/
  hero-bg.webp · texture.webp · marigold-left.svg · marigold-right.svg · papel-picado.svg
  petals.svg · divider.svg · glow.webp  (default art; each slot overridable from the admin)
```

### Why a token remap works here

Tailwind v4 emits `bg-ivory` as `background-color: var(--color-ivory)`. Redefining `--color-ivory`,
`--color-brown`, `--color-clay`, `--color-plum`, `--color-teal` … under `[data-theme="halloween-dotd"]`
recolours every Band, button, header, footer and card at once — including opacity variants, which
compile to `color-mix(... var(--color-plum) ...)`. The pairs are re-measured for AA in the theme
file (bone-on-plum, marigold-on-obsidian) because the roles swap: "brown on ivory" becomes "warm
ivory on very dark plum".

### Where the attribute lives

`(site)/layout.tsx` wraps chrome + main in `ThemeRoot`. The admin layout does not, so the admin is
never themed. `MobileDrawer` portals to `<body>`, so a 10-line client effect mirrors the attribute
onto `<html>` after hydration (removed on unmount) — the wrapper handles first paint, the mirror
handles portals.

### Decorative layers — rules

- All layers are `aria-hidden`, `pointer-events: none`, and positioned so they never sit over text.
- Motion is CSS keyframes only (drift, breathe, flicker at 6–40s periods); no scroll listeners, no
  cursor tracking. `prefers-reduced-motion` freezes petals and glow to a static frame.
- Mobile (`< 640px`): edge marigolds move to the hero's bottom corners at reduced scale, petal count
  drops from 18 to 7, no fixed foreground ornament, texture opacity reduced.
- `content-visibility`/`will-change` used sparingly; total added weight target < 250KB, all lazy
  except the hero layer.

### Activation logic

```
active theme =
  preview override (admin-only route)             else
  env OASIS_THEME_FORCE (non-production only)      else
  the enabled site_themes row whose schedule (if enabled) contains now, in America/Chicago  else
  'default'
```

---

## 5. Proposed database changes

New migration `supabase/migrations/0004_site_themes.sql`:

```sql
create table public.site_themes (
  slug             text primary key,            -- 'halloween-dotd'
  name             text not null,
  enabled          boolean not null default false,
  schedule_enabled boolean not null default false,
  start_at         timestamptz,
  end_at           timestamptz,
  config           jsonb not null default '{}'::jsonb,  -- { options, intensity, assets }
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  updated_by       uuid references auth.users (id) on delete set null,
  constraint site_themes_window check (start_at is null or end_at is null or end_at > start_at)
);
-- RLS: public read (the site reads it during SSR); write = can_publish() (Owner/Manager).
-- touch_updated_at trigger like every other table.
```

`site_settings.payload` is *not* reused: it is a sparse override of business facts, and a theme
carries a schedule and per-theme asset slots that would turn the singleton into a second schema.
One row per theme keeps "add another theme later" a data change.

Also required: `PRIMARY_KEY.site_themes = 'slug'`, seed row in `records.ts` (disabled, empty
config), `generate-seed.ts` ORDER + `config` in `JSONB_COLUMNS`.

Asset overrides reference `media_assets.asset_id` (uploaded through the existing media pipeline),
not raw URLs, so alt/decorative rules, archiving protection and the Photos library all keep working.

---

## 6. Proposed admin UI changes

- New nav item **Website theme** → `/admin/theme` (section `website`; publishing needs
  `content.publish`, which Contributors lack — they get the read-only view).
- One screen, in workflow order:
  1. **Which look is the website wearing?** — radio cards: *Default Oasis* / *Halloween · Día de los
     Muertos*, with a live status line ("Live now", "Scheduled for Oct 15 – Nov 3", "Off").
  2. **Preview** button → `/admin/theme/preview` (renders the real public pages with the theme forced
     on; staff-only, `noindex`, never cached).
  3. **Effects** — five on/off switches (background texture, ambient glow, floating petals,
     decorative edges, motion) and an intensity choice (Subtle / Standard / Full).
  4. **Dates** — "Only between these dates" toggle with start/end date-time in Chicago time.
  5. **Artwork** — eight optional slots, each showing the current image (default or override), an
     upload control, and "Use the default again".
  6. **Publish** / **Switch back to Default Oasis**.
- Dashboard `TaskLink` "Website theme" so it is discoverable; a "Needs attention" line when a
  scheduled theme's window has ended but it is still enabled.

No CSS values, positions, speeds or opacities are exposed.

---

## 7. Proposed frontend changes

| File | Change |
|---|---|
| `src/app/(site)/layout.tsx` | resolve theme; wrap in `ThemeRoot`; render `ThemeAtmosphere` |
| `src/app/(site)/page.tsx` | two `ThemeDivider` placements (after Offerings, before After Dark) |
| `src/components/home/Hero.tsx` | one `ThemeHeroLayer` child; hero background asset slot |
| `src/components/layout/MobileDrawer.tsx` | portal root inherits `data-theme` |
| `src/app/globals.css` | no token changes; the theme file is imported by the site layout |
| `src/lib/events.ts` | export `venueLocalIso` for schedule conversion |

Everything else is additive.

---

## 8. Files likely to be modified

`src/app/(site)/layout.tsx` · `src/app/(site)/page.tsx` · `src/components/home/Hero.tsx` ·
`src/components/layout/MobileDrawer.tsx` · `src/lib/db/types.ts` · `src/lib/events.ts` ·
`src/server/actions/shared.ts` (new `theme` area) · `src/server/migration/records.ts` ·
`scripts/generate-seed.ts` · `src/components/admin/AdminShell.tsx` (nav) · `src/app/admin/page.tsx`
(task link) · `src/server/content/attention.ts` · `next.config.ts` (nothing expected) ·
`docs/ADMIN-GUIDE.md` (pointer to the new doc).

## 9. New files likely to be created

`src/themes/{types,registry,schedule,config,resolve}.ts` · `src/themes/schedule.test.ts` ·
`src/themes/halloween-dotd/theme.css` · `src/components/theme/{ThemeRoot,ThemeAttribute,ThemeAtmosphere,ThemeHeroLayer,ThemeDivider}.tsx` ·
`src/app/admin/theme/{page.tsx,ThemeManager.tsx,preview/[[...path]]/page.tsx}` ·
`src/server/actions/theme.ts` · `src/server/content/theme.ts` ·
`supabase/migrations/0004_site_themes.sql` · `public/themes/halloween-dotd/*` ·
`scripts/generate-theme-art.ts` (produces the default artwork deterministically) ·
`docs/seasonal-theme-admin.md` · `docs/halloween-dotd-theme.md`.

---

## 10. Risks or conflicts discovered

1. **`MobileDrawer` renders through a portal into `<body>`**, outside any wrapper the site layout
   can render. Solved by mirroring the attribute onto `<html>` client-side (see §4).
2. **`body` background is ivory in `globals.css`.** Overscroll would flash ivory on a dark theme.
   `ThemeRoot` emits a one-rule `<style>` for `html` when a theme is active.
3. **ISR + preview.** Reading `searchParams`/`cookies()` in the site layout would make every public
   page dynamic. Preview therefore lives on its own dynamic admin route instead of a query param
   on the public site.
4. **Token remap touches the admin if applied to `<html>` at SSR time.** Scoping to the site
   wrapper avoids it; the client mirror only exists while a public page is mounted.
5. **`assets:check` fails on unregistered files under `public/media/`.** Theme art therefore lives
   under `public/themes/`, outside the registry's walk, and is validated by its own list.
6. **`on-sand` / grain rules** assume a light sand surface; on the theme, sand becomes a deep
   burgundy and `.grain` multiply becomes invisible — harmless, and the theme adds its own texture.
7. **The Supabase project referenced by `next.config.ts` (`yrfvnqgybbvbkwonvycw`) is not reachable
   from this environment**, so the migration is delivered as a file and must be applied with the
   documented procedure (`docs/ENVIRONMENT.md`). Until then the theme falls back to *Default
   Oasis*, and the local dev database seeds the row automatically.
8. **Hero LCP.** The hero-background slot must not replace the poster with a heavier file; theme
   layers over the hero are SVG/CSS and load after the poster.
9. **Logo is tan/gold on transparent** — it works on the dark header without modification.
10. No AI image-generation credits are available in this environment; default artwork is authored
    as layered vector/raster files by script, with admin slots for the restaurant to replace them
    with photography later.

---

## 11. Recommended implementation order

1. **Engine** — types, registry, schedule (+tests), resolve with static fallback, `ThemeRoot`,
   token remap CSS, `ThemeAtmosphere` skeleton, env override for local proof. Default site must be
   byte-for-byte unchanged with no theme active.
2. **Admin** — migration, `PRIMARY_KEY`, seed, server actions (save / publish / switch off /
   asset override / clear), `/admin/theme` screen, preview route, dashboard link, docs.
3. **Halloween / Día de los Muertos** — artwork generation script, hero layer, dividers, petals,
   glow, photo treatment, mobile rules, `docs/halloween-dotd-theme.md`.
4. **QA & polish** — visual pass at 1440 / 1280 / 834 / 390, reduced-motion, console, hydration,
   contrast re-measure, weight budget, dead-code sweep, docs update, "Future theme creation".

---

## 12. Implementation notes (added after the build)

Everything in §4–§11 was built as described, with these deviations, all in the direction of
fewer touch points:

- **`MobileDrawer` was not modified.** Mirroring `data-theme` onto `<html>` (`ThemeAttribute`)
  makes the custom properties reach the portal by inheritance, so the drawer needed no change.
- **`SiteChrome`** (`src/components/layout/SiteChrome.tsx`) holds what the site layout used to
  render, so the preview route can reuse it. The layout itself is now four lines plus
  `generateViewport` for the phone theme colour.
- **`ThemeFooterLayer`** lives in `ThemeDivider.tsx` (both are "ornament" components); the footer
  gained `relative isolate overflow-hidden` and one child.
- **Foreground decoration** renders in a strip *under* the footer's legal line at `lg+`, not over
  content — the only place a corner ornament could sit beside nothing.
- **Preview** is `/admin/theme/preview/<page>?theme=<slug>`, exactly as planned; the request-scoped
  override is a `React.cache` cell (`setThemeOverride`).
- **Parallax** uses CSS scroll-driven animations behind `@supports`, so there is still no scroll
  listener anywhere in the public bundle.
- The theme stylesheet (~9 KB gzipped with the rest of the CSS) is imported by the site layout and
  therefore present on the default site, where nothing matches it. Loading it conditionally would
  require a client-side stylesheet swap and a flash; inert CSS was the cheaper trade.
- `scripts/migrate-content.ts` and `scripts/generate-seed.ts` learned the new table; `seed.sql`
  was regenerated.
- The Supabase project in this environment's MCP connection is a different project from the one
  the site is configured against (§10.7 stands): **migration 0004 must be applied by hand** before
  the admin can publish the theme. Until then the public site is unaffected.

QA record: see `docs/halloween-dotd-theme.md` → "QA record".
