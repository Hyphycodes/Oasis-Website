# Seasonal look — how the admin controls it

The website can wear a seasonal look on top of its everyday design. Today there is one:
**Halloween · Día de los Muertos**. It is switched on, scheduled, tuned and dressed from the admin;
nobody has to touch code.

Open **Admin → Seasonal look** (`/admin/theme`). Only a Manager or the Owner can change anything
there; a Contributor sees the settings but cannot publish them.

---

## The workflow

1. **Choose the look.** Two cards: *Default Oasis* and *Halloween · Día de los Muertos*. The chip in
   the corner says what the seasonal look is doing right now: *Off*, *Live now*, *Scheduled*, or
   *Dates have passed*.
2. **Preview it.** "Preview Día de los Muertos" opens the real website pages with the look applied,
   in a new tab, with a bar along the bottom to jump between pages and to compare with Default.
   Only signed-in staff can open it; guests never see it and nothing is cached.
3. **Pick the effects.** Five switches — background texture, ambient glow, floating petals,
   decorative edges, motion — and a strength: *Subtle*, *Standard* or *Full*. That is the whole
   control surface. There are no colour pickers, opacities or speeds to get wrong.
4. **Set dates, or don't.** Leave "Only between these dates" off and the look is on from the moment
   you publish until you switch it off. Turn it on and set a start and/or an end; the website
   changes itself on those dates, in restaurant time (Chicago), with no one needing to remember.
5. **Publish.** One button. The message says exactly what happened and links to the homepage.

"Switch back to Default Oasis right now" takes the look off without losing any of the settings, so
it can go straight back on later.

## Artwork

At the bottom of the screen the look's artwork is laid out piece by piece: hero background,
background texture, top decoration (papel picado), left and right decorations (marigolds),
foreground decoration (footer corners), floating petal, section divider.

- Every piece ships with built-in artwork and is marked **Built-in**.
- **Choose a replacement** uploads your own image into that slot (the hero background also takes a
  short video). It goes into *Photos & videos* like any other file, tagged *Theme*, and the slot
  is marked **Yours**.
- **Use the built-in artwork** puts the shipped piece back. The file stays in the library.
- Nothing is required. A slot you never touch keeps the built-in piece, and a replacement that is
  later archived falls back to the built-in piece on its own (the screen says so).

The hero background is the one slot whose built-in value is *nothing*: the everyday Oasis reel stays,
and the look decorates around it. Upload something only if you want to replace the reel for the
season.

## What guests see

- With the look off, the website is exactly its everyday self. No seasonal file is loaded, no
  seasonal style applies.
- With the look on, every public page changes together: colours, the hero, the ornaments between
  homepage sections, the footer. The admin itself never changes.
- Visitors who have asked their device for reduced motion get the look with nothing moving. The
  Motion switch does the same thing for everyone.
- Changes reach guests within about a minute of publishing; the pages are cached for speed and
  are refreshed on publish.

## Dashboard

The dashboard's "Needs attention" list warns when the look is switched on but its dates have
passed (guests are seeing Default Oasis), and notes when a scheduled look is about to start.

---

## For developers

### Where it lives

| What | Where |
|---|---|
| Data | `site_themes` — one row per theme (`supabase/migrations/0004_site_themes.sql`) |
| Model | `src/themes/types.ts`, `src/themes/registry.ts` |
| Resolution | `src/themes/resolve.ts` — `getActiveTheme()`, cached per request, static fallback |
| Scheduling | `src/themes/schedule.ts` (+ tests) |
| Admin screen | `src/app/admin/theme/page.tsx`, `ThemeManager.tsx` |
| Preview route | `src/app/admin/theme/preview/[[...path]]/page.tsx` |
| Actions | `src/server/actions/theme.ts` (`saveTheme`, `deactivateThemes`, `uploadThemeAsset`, `clearThemeAsset`) |
| Public rendering | `src/components/theme/*`, `src/components/layout/SiteChrome.tsx` |

### The row

```
slug              'halloween-dotd'
enabled           the admin chose this look
schedule_enabled  only show it inside the window
start_at, end_at  timestamptz; entered in America/Chicago, stored as instants
config            { options: {texture,glow,petals,edges,motion}, intensity, assets: {slot: asset_id} }
```

Active = `enabled` and (not scheduled, or now inside the window). Malformed dates fail closed to
Default Oasis. Only one theme can be enabled at a time; choosing one disables the others in the
same save.

### Applying the migration

The migration must be applied to the production Supabase project before the admin can save (the
public site is unaffected either way — a missing table reads as "no theme"):

```bash
supabase db push        # or paste supabase/migrations/0004_site_themes.sql into the SQL editor
```

`npm run content:migrate -- --write` seeds the disabled `halloween-dotd` row; the local development
database seeds it automatically.

### Validation

`saveTheme` accepts only a known theme slug, a known intensity, boolean options, ISO-parsable dates
with `end > start`, and at least one bound when scheduling. `uploadThemeAsset` accepts only slots
the theme declares and only the media kinds each slot declares, and stores a `media_assets` id —
never a URL typed by hand. Whatever ends up in `config` is normalised on every read
(`src/themes/config.ts`), so an unexpected value can never take the site down.

### Preview

`/admin/theme/preview/<page>?theme=<slug>` renders the real page components inside the real chrome
with the requested theme forced on for that request (`setThemeOverride`). It is `force-dynamic`,
`noindex`, and gated by `getStaff()`. The public pages stay statically cached because no public
route reads a preview flag.

### What was verified

The full admin workflow — publish, schedule, validation, switch-back, artwork replace and reset —
was driven through the real forms with a browser and checked against the public HTML. The record
is in `docs/halloween-dotd-theme.md` → "QA record".

### Developer switch

`OASIS_THEME_FORCE=halloween-dotd` in `.env.local` forces the look on in development. It is
ignored in production builds.
