# Visual QA

Design review and quality audit of the implemented site.

- **Reviewed:** 2026-08-14
- **Method:** every public route rendered in real Chrome at 1440, 1280, 1024, 768, 430, 390 and
  360px, plus scripted audits for layout overflow, heading structure, alt text, link safety, touch
  targets and computed colour contrast. Reduced-motion verified with `--force-prefers-reduced-motion`.
- **Routes covered:** `/` · `/menu` · `/menu/cocktails` · `/menu/brunch` · `/events` ·
  `/events/[slug]` · `/catering` · `/private-events` · `/visit` · `/careers` · `/legal/privacy` ·
  404 · `/admin` and `/admin/login`.

**Result: all high- and medium-severity issues resolved.** Two low-severity items are accepted and
documented in §6.

### Tooling note

Headless Chrome on macOS enforces a minimum window width of roughly 500px, so captures below that
silently clip rather than reflow. Narrow-viewport review was done through a real browser viewport
instead. `scripts/qa-capture.sh` is documented accordingly — anyone re-running this review at 360 or
390 must use a real viewport, not a headless capture.

---

## 0. Third pass — cleaner, shorter, flatter (2026-08-14, later still)

The second pass was rejected as too tall, too loud, and too close to the original
site's palette. This pass restructures rather than shrinks.

### Navigation — now completely flat

| Check | Result |
|---|---|
| Desktop items | Menu · Events · Catering · Visit — four links, nothing else |
| Nested `<ul>` inside any nav item | **0** |
| Hidden/hover panels (`aria-haspopup`, `group-hover`, `invisible`) | **0** |
| Anything revealed on hover | **No** — hovered all four, nothing appeared |
| Links per nav item | 1 each — clicking navigates immediately |
| Mobile drawer | Flat list, no nested accordions |
| Duplicate labels in the drawer | **0** (previously "Catering" appeared as a heading *and* its own child) |

Private Events and Careers moved to the drawer and footer, which is where the
brief allows them.

### Menu — one page, three tabs

`/menu/cocktails` and `/menu/brunch` are gone as routes. Verified:

```
/menu/cocktails  →  308  →  /menu#cocktails
/menu/brunch     →  308  →  /menu#brunch
/menus           →  308  →  /menu
```

Behaviour, tested in a real viewport:

```
tabs .................... 3 — Food · Cocktails & Bar · Brunch
initial ................. Food, panel-food, 33 rows
click "Cocktails & Bar" . selected + panel-cocktails + 50 rows + hash #cocktails
click "Brunch" .......... selected + honest empty state + hash #brunch
ArrowLeft ............... moves selection AND focus to Cocktails & Bar
deep link /menu#brunch .. opens on Brunch
roving tabindex ......... exactly one tab focusable
aria wiring ............. tablist labelled; every tab ↔ panel cross-referenced
```

### Spacing — measured, not eyeballed

| Route | Before | After | Change |
|---|---|---|---|
| `/` | ~6,500px | **4,059px** | −38% |
| `/events` | 3,645px | **2,685px** | −26% |
| `/menu` intro block | ~950px | **401px** | −58% |
| `/events` intro block | 1,196px | **236px** | −80% |

Section rhythm token went from `clamp(4rem, 9vw, 10rem)` — up to **160px top and
bottom**, so 320px between two sections — to `clamp(3rem, 5.5vw, 7rem)`, landing
in the brief's 72–112px desktop band.

Two layout bugs were found while measuring, both the same root cause: `Asset` and
`AssetVideo` set `relative` (and `Asset` an aspect-ratio) on their own roots, so a
caller passing `absolute inset-0` lost the fight — same specificity, stylesheet
order decides. That silently sized the events hero to 3:2 of the full page width.
Both call sites now wrap, and `Asset` skips its intrinsic ratio when the caller
supplies a height.

### Homepage — six movements

1. Hero · 2. Action rail · 3. What we're known for · 4. Bar & brunch ·
5. After Dark preview · 6. Catering, celebrations and arrival

The hero is now **one** visual — the reel, full-bleed — instead of the reel beside
a near-identical taco-dipping still. Arrival merged into the catering movement,
and the footer no longer repeats the hours table.

### Signature trio — one birria, not three

| Slot | Item | Why |
|---|---|---|
| The signature | **Our Famous Quesabirrias** $16 | The one birria dish |
| From the kitchen | **Torta** $14 | Non-birria savoury, and the only other plated dish with real photography |
| From the bar | **Margarita** | The house cocktail; flavour list carries it because no Oasis system publishes a price |

### Palette — beyond cream/tan/brown/black

| Role | Token | Where |
|---|---|---|
| Warm ivory | `#FBF6EA` | Default page surface, replacing cream |
| Deep plum / oxblood | `#2E1620` | Hero ground, footer, Latin Saturday |
| Midnight teal / agave | `#0F2E2C` | After Dark, events intro, Friday |
| Chile-coral | `#E1553A` | Every primary action |
| Golden amber | `#E8A33D` | Dates, Friday accent, highlights |

Friday leans **teal + amber**, Latin Saturday leans **plum + coral** — related, not
identical, exactly as the brief specifies.

Three contrast failures surfaced from the new palette and were fixed at token
level rather than per component:

| Pair | Before | After |
|---|---|---|
| Button label on coral | 4.41 ❌ | **4.72** ✅ (coral lightened to `#E1553A`) |
| Coral type on teal | 3.61 ❌ | **5.93** ✅ (new `--color-coral-light`) |
| Coral type on plum | 4.20 ❌ | **6.89** ✅ (same token) |

### Language

`turns into a club` → **`The room changes after ten.`**
`Two nights a week this room turns into a club` → **`Dinner first, music after.`**
The Oasis Fridays description said `a nightclub atmosphere` — the restaurant's own
wording — now `late-night energy`, flagged in `CONTENT-QUESTIONS.md` §13 for the
owner to confirm or restore.

### Third-pass verification

```
Routes × widths: 8 @1440 · 7 @320 · 7 @390 · 3 @768   = 25 combinations
Horizontal overflow ...................... 0
WCAG AA contrast failures ................ 0
Exactly one <h1> ......................... 25/25
Heading-level jumps ...................... 0
<img> missing alt ........................ 0
"#" links / missing noopener ............. 0 / 0
```

Mobile nav at 320×700 — flat list, no duplicate labels, full-height panel, focus
trap, Escape, focus restore, scroll lock and restore, no overflow: **all pass**.

```
npm run lint ✅   npm run typecheck ✅   npm test ✅ 58
npm run assets:check ✅   npm run build ✅   git diff --check ✅
```

---

## 0. Second pass — art-direction rebuild (2026-08-14, later)

A follow-up brief judged the first build "structurally competent, but still the old site inside a
cleaner beige template" and listed nine concrete audit findings. Every one was checked against the
real implementation; **five were genuine defects I had introduced**, two were already correct, and
two needed a decision rather than a fix.

### Findings verified against the deployed site

| # | Reported | Verdict | Action |
|---|---|---|---|
| 1 | Mobile nav shows only a `MENU` header, links invisible at ~390px | ✅ **REAL — and reproduced at 320px.** The drawer panel measured **72px tall**. The header carries `backdrop-blur`, and `backdrop-filter` establishes a containing block for fixed-position descendants — so the drawer's `position: fixed` resolved against the 72px header, not the viewport, clipping every link inside it. | Drawer now renders through a **portal into `<body>`**, so no ancestor paint context can trap it. Panel is full height; all 12 links laid out and visible. |
| 2 | Oasis Fridays "Buy tickets" opens a page titled *Oasis Latin Saturdays* | ✅ **REAL.** `/event-details/oasis-fridays` does not 404 — it silently serves the Saturdays page. I had invented that slug by stripping the date suffix. | Ticket URLs are now **composed per occurrence** (`…-2026-08-21-22-00`). Verified against four dates incl. 2026-12-25; each resolves to the correct event. Every ticket button is labelled with its own date. |
| 3 | Event end times disagree, 2:00am vs 5:00am | ✅ Real on the source site | Already resolved to 2am and logged; unchanged. |
| 4 | Site shows (815) 545-7556, Toast shows (815) 524-4188 | ✅ Real | Already flagged as blocking; unchanged. |
| 5 | Website and Toast hours differ | ✅ Real | Already flagged as blocking; unchanged. |
| 6 | Toast shows `Currently not accepting online orders` | ✅ Confirmed twice, an hour apart, on a Thursday afternoon inside opening hours | Not a schedule. Flagged to the owner as a probable Toast configuration problem — it is Toast's setting, not the website's. |
| 7 | Website burrito $14 vs Toast $13 | ❌ **Not a discrepancy.** Toast lists *two* burritos: `Burrito Dinner $14` (matches the site exactly) and a separate à-la-carte `BURRITO $13`. | No change. Recorded so the comparison is not repeated. |
| 8 | `Ask your server` used where a Toast price exists | ✅ Real, and it read as unfinished across a third of the menu | Eight food items now carry the price Oasis publishes on its own Toast page, marked in source. The bar list stays unpriced because *no* Oasis system publishes those. |
| 9 | `Oasis photography for this slot has not been supplied yet.` exposed on production | ✅ **REAL — confirmed live on `/`, `/events`, `/private-events`.** It was `sr-only`, so invisible to sighted users but read aloud to screen readers and present in the rendered DOM. | Removed entirely. Internal pipeline state never appears in user-facing output. |

### Media re-audit — the biggest win

The brief required a photography-led design, and I had been treating the hero video as a single
asset. It is a **20-second brand reel** covering the whole restaurant. Re-examined frame by frame,
it yielded five images that had previously been branded placeholders:

| New asset | Source | Replaces |
|---|---|---|
| `dishQuesabirria` | 12.8s | placeholder |
| `consommeDip` | 15.45s — the dip shot the brief explicitly asks for | placeholder |
| `cocktailPour` | 6.4s | placeholder |
| `margaritaTajin` | 9.0s | placeholder |
| `roomCrowd` | 14.0s | placeholder |

Placeholder slots went from **8 to 2**. Both survivors (`privateEvents`, `birthdayCelebration`)
have no honest source in the library.

### What changed in the design

| Area | Before | Now |
|---|---|---|
| Type | Archivo alone at many sizes — competent, one-note | **Anton + Archivo.** A condensed poster display voice for marquee statements, posters and After Dark; Archivo for everything that must be read |
| Hero | 50/50 sand split, one rounded rectangle floating in the right half | Full-height **media mosaic**, edge to edge: video + the consommé dip, with the type panel as one column of three. Media makes the composition |
| First viewport | Headline, copy, two buttons | Adds the **next event with its live date and price**, and a utility rail with open/closed state, directions and phone |
| Signatures | Three placeholder photo boxes | Real quesabirria photography; the two undocumented dishes get **typographic posters** rather than a photo of something else |
| Event artwork | Empty branded placeholder | **Composed posters** — night, music, age, door, price, all live data. Cannot go stale, cannot be empty |
| Day→night | Abrupt espresso band with a 1px rule | **Graded band** cream → sand → obsidian, the type voice changes with it, and the electric accent appears for the first time |
| Catering | One combined block | **Two explicit paths** — "Feed the party" (prices) vs "Bring the party here" (the room) |
| Page length | 8 sections, the restaurant described three times | 6 sections, each earning its height with real photography or real data |

### Colour additions

`--o-obsidian #0D0805` (true black level), `--o-agave #3F5D45` (from the greenery wall),
`--o-neon #FFC53D` — one electric accent, amber rather than a borrowed cyan so it reads as heat
rather than a generic nightclub palette. 15.2:1 on obsidian, used only on dates, tickets and the
After Dark band.

### Second-pass verification

```
Routes × widths audited: 11 × 1440  +  9 × {320, 390, 768}   = 38 combinations
Horizontal overflow ...................... 0
WCAG AA contrast failures ................ 0
Exactly one <h1> ......................... 38/38
Heading-level jumps ...................... 0
<img> missing alt ........................ 0
Placeholder "#" links .................... 0
target=_blank without noopener ........... 0
Missing-photography copy in output ....... 0
```

Mobile navigation acceptance, run at **320×700** — all ten steps from the brief:

```
links visibly present (not just in DOM) .. ✅ 12 links, full geometry
background covered ....................... ✅ scrim covers viewport
focus enters the menu .................... ✅
tab through every item ................... ✅ 13 tabbable, focus never escapes
tab wraps last → first ................... ✅
Escape closes ............................ ✅
focus returns to trigger ................. ✅
body scroll locked, then restored ........ ✅
navigation closes the menu ............... ✅ (route-change effect)
no horizontal overflow ................... ✅ scrollWidth 320 = clientWidth
```

```
npm run lint        ✅   npm run typecheck   ✅
npm test            ✅ 58 passed             npm run assets:check ✅
npm run build       ✅ 26 routes             git diff --check ✅ clean
```

---

## 1. Issues found and fixed

| # | Severity | Route(s) | Breakpoint | Issue | Fix | Status |
|---|---|---|---|---|---|---|
| 1 | **High** | All | All | `--o-brown-soft` (`#A86E3F`, sampled from the live site) measures **3.83:1** on cream — an AA failure at body size, on the site's most-used secondary text colour. 202 individual failures across 8 routes. | Darkened to `#8A5620` (5.54:1). Warmth preserved. | ✅ Fixed |
| 2 | **High** | Hero, `/visit`, `/careers`, `/private-events`, `/menu/cocktails`, catering form, 404 | All | Secondary ink on the **sand** surface measures 2.28–3.31:1, and `--o-clay` measures 3.0:1. Sand is a mid-tone; it cannot carry a lighter secondary. | Added an unlayered `.on-sand` rule stepping secondary ink up to full brown (4.84:1). Applied via `Band surface="sand"` so it cannot be forgotten when a component moves band. | ✅ Fixed |
| 3 | **High** | All buttons | All | Primary button label `#3B1A08` on brand orange measured **4.44:1** — just under AA. | Darkened to `#2A1203` (5.03:1). | ✅ Fixed |
| 4 | **Medium** | `/`, `/visit` | All | The "Open now" indicator (`#3E6B43`) measured 3.35:1 on sand. | Darkened `--o-success` to `#2F5434` (4.64:1 on sand, 7.78:1 on cream). | ✅ Fixed |
| 5 | **High** | All | All | The logo was requested at the **3840px** variant for a 70px slot — the exact performance defect flagged on the live site (`SITE-AUDIT.md` §7). Caused by passing `sizes` on a fixed-size image. | Removed `sizes`; `width`/`height` now describe the rendered size at 2×. Chrome now fetches the 640px variant. | ✅ Fixed |
| 6 | **Medium** | `/` | 1440 | Hero headline broke mid-sentence into four lines (`Modern / Mexican. / Tropical / Energy.`) — an accidental wrap, not a designed one. | Reduced `--text-display-xl` and widened the type column to 7 of 12. Each sentence now holds one line from 360px up, enforced with `white-space: nowrap`. | ✅ Fixed |
| 7 | **Medium** | `/` | ≥1024 | Experience grid ran 5/4/3 columns; the third cell rendered at ~260×173px and read as an afterthought rather than a composition. | Recomposed as one tall portrait cell plus two stacked landscape cells, offset down. Unequal by construction, so it cannot read as a three-card row. | ✅ Fixed |
| 8 | **Medium** | `/` | All | `cocktailPair` appeared in both the experience grid and the bar section; `bartender` appeared in both the bar section and the gallery. Repetition reads as a thin library. | Each image now appears once. Bar section uses `bartender`; gallery uses `diningRoom`, `backBar`, `exteriorSign`. | ✅ Fixed |
| 9 | **High** | All | All | **Two assets were named and alt-texted wrongly.** `storefront-sign.jpg` is a photograph of the back bar; `lunch-deal-reel.jpg` is the full dining room. Both had confidently wrong alt text — worse than none. | Renamed to `back-bar.jpg` and `dining-room.jpg` with accurate alt text. Recorded in `ASSET-MANIFEST.md` §2. | ✅ Fixed |
| 10 | **Medium** | `/` | All | The homepage signature section rendered three branded placeholders in a row — no photography exists for those dishes. Read as unfinished. | Rebuilt as a typographic numbered list. More editorial than a photo grid would have been, and honest. | ✅ Fixed |
| 11 | **Medium** | `/events`, `/` | All | Event artwork placeholders rendered in sand on the espresso band — read as broken images rather than reserved slots. | `Placeholder` and `Asset` now take a `tone`; dark surfaces get an espresso-toned placeholder. | ✅ Fixed |
| 12 | **Medium** | All | 360–768 | Footer navigation, footer legal links, header dropdown items, the logo link, and inline "Get directions" / "Add to calendar" links were under 44px tall. | `min-h-11` on all of them. | ✅ Fixed |
| 13 | **Low** | `/` | ≥1024 | Left column of the experience grid ended ~430px above the right, leaving an unbalanced void. | Left cell crops to 2:3 above 1024px; right column offset reduced from `mt-20` to `mt-14`. | ✅ Fixed |
| 14 | **Low** | `/` | All | Hero video source is **9:16 vertical**, not 16:9 — it was being rendered into a landscape frame and heavily cropped. | Hero media frame is portrait. Registry corrected to 9:16. Video enabled on mobile, since the source is already the mobile orientation. | ✅ Fixed |
| 15 | **Medium** | `/` | All | Hero video shipped at **7.02 MB** with an unused AAC audio track (it plays muted). | Re-encoded to **2.41 MB** — H.264 CRF 30, audio stripped, `+faststart`. Poster is now a real frame instead of a colour field. | ✅ Fixed |

---

## 2. Anti-template review

Each prohibited pattern from the brief, and what the site does instead.

| Pattern | Present? | Notes |
|---|---|---|
| Generic centred hero | ❌ | Editorial 7/5 split; type on a solid sand field, media bleeding right. Centring appears only on the 404, where there is nothing to compose against. |
| Gradient headline text | ❌ | Solid `--o-brown` throughout. Hierarchy from size, the variable **width axis**, and tracking. |
| Glass cards / backdrop blur | ❌ | Only a 2px `backdrop-blur` behind the sticky header and category nav, for legibility over scrolling content. |
| Drop shadows | ❌ | **Zero `box-shadow` in the codebase.** Depth is surface colour change plus hairlines. |
| Excessive pill buttons | ❌ | `12px` radius on buttons. `rounded-full` only on the two circular social icons. |
| Identical three-column feature cards | ❌ | Fixed as issue #7 — one tall cell plus two stacked, offset. |
| Rounded card around every section | ❌ | Sections are full-bleed colour bands. The `24px` radius belongs to **photography**, which is the live site's own signature. |
| Random decorative icons | ❌ | Five icons total: external-link, hamburger, close, Facebook, Instagram. Each carries meaning. |
| Decorative gradients / blobs / glows | ❌ | None. One texture: a 160px paper grain at 3% over sand. |
| Palm leaves, sombreros, cacti | ❌ | None. |
| Fake metrics | ❌ | No statistics anywhere. |
| Fake testimonials or press | ❌ | No verified reviews exist, so none are shown. A restrained gallery instead. |
| Generic luxury copy | ❌ | Guarded by a test — `content.test.ts` fails on "culinary excellence", "embark on a journey", "where flavor meets passion". |
| Repetitive split-image sections | ❌ | Each route has a distinct composition: `/menu` sticky-nav list · `/events` espresso band · `/catering` editorial price table · `/visit` three-column info · `/careers` display-type perk list. |
| Too many animations | ❌ | Four behaviours total (§4). ≤4 revealed elements per viewport. |
| Default framework styling | ❌ | Every control is tokenised. |
| Machine-generated copy | ❌ | Voice taken from the restaurant's own careers page. |

---

## 3. Accessibility

Scripted across all 12 public routes at 360/390/768/1024/1440.

| Check | Result |
|---|---|
| Colour contrast (WCAG AA, computed from rendered styles incl. alpha blending) | **0 failures** across all routes |
| Exactly one `<h1>` per route | ✅ 12/12 |
| No skipped heading levels | ✅ 0 jumps |
| Every `<img>` has an `alt` attribute | ✅ 0 missing |
| Decorative images | `alt=""` + `aria-hidden`, decided per slot in the registry |
| Links with no accessible name | ✅ 0 |
| Placeholder `#` links | ✅ 0 |
| `target="_blank"` without `rel="noopener"` | ✅ 0 |
| External destinations announced | ✅ Every one carries "(opens Toast / Google Maps / … in a new tab)" |
| Horizontal overflow | ✅ `scrollWidth === clientWidth` on every route at every width |
| Touch targets ≥ 44px | ✅ except inline prose links, which WCAG 2.5.8 exempts |
| Skip link | ✅ Present, visible on focus |
| Focus indicator | ✅ 2px orange ring, 3px offset (4px on dark) |
| Status conveyed by colour alone | ✅ None — open/closed, sold-out and cancelled all carry text |
| Form labels | ✅ All `<label for>`; errors wired via `aria-describedby`; `aria-invalid` set |
| Form error summary | ✅ `role="alert"`, focus moved to it |
| Form success | ✅ `role="status"`, focus moved to it |

### Mobile drawer — verified interactively

```
role="dialog"        aria-modal="true"     aria-label="Site menu"
aria-expanded        false → true → false
body scroll          visible → hidden → visible
focus on open        moves into the panel ("Close menu")
Tab from last item   wraps to first        ✅ trap holds
Escape               closes and restores focus to the trigger ✅
Route change         closes the drawer (no stranded-open on back/forward)
```

### Reduced motion

Verified with `--force-prefers-reduced-motion`. All content renders at its final state — nothing is
stranded invisible. The hero video does not load at all; the poster is the entire treatment. The
reveal initial state is never applied, so a failed observer cannot hide content.

---

## 4. Motion audit

| Behaviour | Where | Respects reduced motion |
|---|---|---|
| Section reveal, 480ms, once | ≤4 per viewport | ✅ Resolved instantly in CSS |
| Button background, 140ms | All buttons | ✅ |
| Link underline offset, 120ms | Text links | ✅ |
| Drawer slide, 260ms | Mobile nav | ✅ |

No parallax, no scroll hijacking, no cursor effects, no continuous floating, no scroll-linked
animation.

---

## 5. Performance

| Check | Result |
|---|---|
| First Load JS (shared) | 105 kB |
| Largest route | `/` and `/careers` — 117 kB |
| Admin code in public bundles | ✅ None — separate route subtree |
| Hero video weight | 2.41 MB, down from 7.02 MB |
| Video on mobile / Save-Data / 2G | Not loaded; poster only |
| Layout shift from media | ✅ None — every slot has a registry aspect ratio, including placeholders |
| Responsive image sizing | ✅ `sizes` on every non-fixed image |
| Below-fold media | ✅ `loading="lazy"` by default; `priority` only on above-fold |
| Font loading | One variable family, self-hosted via `next/font`, `display: swap` |
| Third-party scripts | ✅ **Zero.** No analytics, no maps embed, no tag manager |
| Total media weight | 3.9 MB, of which the video is 2.4 MB |

---

## 6. Accepted, not fixed

| Item | Severity | Why it is accepted |
|---|---|---|
| Reel-derived images are 720px wide | Low | They fill slots rendering ≤500px at 1×, so they are sharp in place. Upscaling to hit a nominal target would make them blurry — the manifest records the limitation and `ASSET-HANDOFF.md` requests originals. |
| 8 slots show branded placeholders | Low | No acceptable photography exists. The placeholder renders at the exact slot geometry, so layout is final and only pixels are pending. Inventing or sourcing stock food photography is explicitly out of scope. |
| Inline prose links under 44px | Low | WCAG 2.5.8 exempts targets inline in a sentence. Making them 44px tall would break line rhythm. |
| Ticket links still point at Wix | Low | It is the only working ticketing path today. `ticket_url` is a per-occurrence field, so switching providers is a data edit, not a code change. |

---

## 7. Content integrity

| Check | Result |
|---|---|
| Invented facts | ✅ None. Prices, hours, events and catering are quoted from first-party sources. |
| Stale dates in recurring artwork | ✅ **Structurally impossible.** A series has no date column; dates are generated per occurrence and composited as live HTML. Artwork tagged `containsText: 'date'` fails the build. |
| Missing menu prices disguised | ✅ No. Nine unpriced items render "Ask your server", never `$0` and never a blank row. A DB constraint requires a price or a note. |
| Conflicting hours or phone across pages | ✅ One source of truth; footer, `/visit` and JSON-LD all read it. |
| Copyright year | ✅ Computed. (The live site still reads "© 2024".) |
| Generic social links | ✅ Removed. Only the real Facebook and Instagram accounts remain. Guarded by a test. |
| Placeholder text or dev labels | ✅ None. Guarded by a test. |
| Dead CTAs | ✅ 0 `#` links; all 12 internal routes return 200. |
| Unverified facts labelled | ✅ Phone and hours carry `provisional: true`; the admin shows a warning until the owner confirms. |

---

## 8. Automated checks

```
npm run lint        ✅ 0 problems
npm run typecheck   ✅ 0 errors
npm test            ✅ 46 passed
npm run assets:check ✅ registry consistent, no Wix references in runtime code
npm run build       ✅ 27 routes
```

Tests that specifically defend this review:

- `events.test.ts` — occurrences always land on the right weekday, hold 10pm across the CDT→CST
  transition, never end before they start, and a night stays listed until it *ends* rather than when
  it starts.
- `hours.test.ts` — past-midnight closes, day grouping, open/closed state, schema.org output.
- `content.test.ts` — no unpriced-and-unexplained items, no banned marketing phrases, no platform
  homepages posing as social accounts, no invented email or coordinates, no date field on a series.

---

## 9. Verdict

The site reads as custom, restrained and editorial. The palette and photography treatment are
recognisably the current Oasis; the composition, typography, hierarchy and information architecture
are not. Every prohibited pattern is absent, contrast passes AA everywhere, and the two structural
problems the audit identified — stale recurring dates and invisible catering — are fixed in the data
model rather than papered over in the UI.

The remaining gap is photography, not design.
