# Design Direction — Oasis Mexican Kitchen & Bar

This is a **preservation-and-refinement** brief. The current site already owns a genuinely good
palette and a good typographic posture. It does not own composition, hierarchy, or rhythm. This
document fixes the second set without touching the first.

---

## 1. Color

### 1.1 Sampled from the live site

Every value below was read from computed styles on <https://www.oasismexicankitchenbar.com/>.

| Live computed value | Hex | Role on the live site |
|---|---|---|
| `rgb(253, 243, 218)` | `#FDF3DA` | Header bar, light surfaces, text on dark |
| `color(srgb 0.8667 0.7216 0.5725)` | `#DDB892` | Hero field, section surfaces |
| `rgb(230, 92, 46)` | `#E65C2E` | Logo mark, primary buttons |
| `rgb(106, 63, 5)` | `#6A3F05` | Display headlines, body text |
| `rgb(168, 110, 63)` | `#A86E3F` | Nav links, secondary text |
| `rgb(0, 0, 0)` | `#000000` | Footer, dark surfaces |

### 1.2 Final tokens

Two tokens are **new**, and both exist to solve a measured accessibility failure, not to restyle
anything:

- `--o-clay` — a darkened burnt orange used **only** for orange text on light surfaces.
  Brand orange `#E65C2E` on cream measures **3.31:1**, which fails WCAG AA for body text. `#B4441C`
  measures **5.62:1** and passes. Buttons and large display type keep the true brand orange.
- `--o-espresso` — the "After Dark" surface. Pure `#000` is harsh next to cream and reads as a
  different brand. `#1A1008` is a near-black *derived from* the brown ramp, so the day-to-night
  transition feels like the same building at a different hour.

```
/* Base ramp — day */
--o-cream        #FDF3DA   base page surface
--o-cream-deep   #F6E9CB   subtle alternating band
--o-sand         #DDB892   primary warm surface
--o-sand-deep    #CBA47E   hover / pressed on sand
--o-linen        #FFFBF0   raised surface on cream

/* Ink */
--o-brown        #6A3F05   display + primary body text
--o-brown-soft   #A86E3F   secondary text, captions, meta
--o-brown-line   rgba(106,63,5,0.18)   hairline borders on light

/* Action */
--o-orange       #E65C2E   button fills, large display accents, focus ring
--o-orange-deep  #C94A22   button hover / pressed
--o-clay         #B4441C   orange TEXT on light surfaces (AA-safe)

/* Night ramp — obsidian is the true black level for After Dark */
--o-obsidian     #0D0805   After Dark base, event posters
--o-espresso     #1A1008   raised surface on obsidian
--o-espresso-lift #241708  raised surface again
--o-night-text   #F7EEDC   primary text on dark
--o-night-soft   #C4AC8C   secondary text on dark
--o-night-line   rgba(247,238,220,0.16)   hairline borders on dark

/* Accents */
--o-agave        #3F5D45   restrained tropical cue, from the greenery wall
--o-agave-light  #86A98C   the same on dark
--o-neon         #FFC53D   THE electric accent — dates, ticketing, After Dark only

/* Status */
--o-success      #2F5434   (darkened from #3E6B43: 3.35:1 on sand failed AA)
--o-warning      #B4441C
--o-danger       #9B2C1B
```

**On `--o-neon`.** The brief asks for "one electric nightlife accent used sparingly". It is an amber
rather than a borrowed cyan/magenta because the brand is warm — a foreign hue would read as a
generic nightclub template, which is exactly the failure mode to avoid. It measures 15.2:1 on
obsidian, and it appears only on event dates, ticket moments, and the After Dark band. If it starts
showing up on the menu page, it has stopped meaning anything.

### 1.3 Measured contrast

| Pair | Ratio | Verdict |
|---|---|---|
| `--o-brown` on `--o-cream` | 8.42:1 | AAA |
| `--o-brown` on `--o-sand` | 4.98:1 | AA (large + body ≥ 16px passes AA 4.5) |
| `--o-brown-soft` on `--o-cream` | 5.54:1 | AA — darkened from `#A86E3F` (3.83:1), which failed |
| `--o-brown-soft` on `--o-sand` | 3.31:1 | ❌ — `.on-sand` steps it up to `--o-brown` |
| `--o-orange` on `--o-cream` | 3.31:1 | ❌ **never** for text — fills and ≥ 36px display only |
| `--o-clay` on `--o-cream` | 5.62:1 | AA — this is the orange-text token |
| `--o-cream` on `--o-orange` | 3.31:1 | ⚠️ button label uses `--o-on-orange` `#2A1203` (5.03:1) |
| `--o-neon` on `--o-obsidian` | 15.2:1 | AAA |
| `--o-night-text` on `--o-espresso` | 15.1:1 | AAA |
| `--o-night-soft` on `--o-espresso` | 8.6:1 | AAA |
| `--o-orange` on `--o-espresso` | 4.57:1 | AA |

**Rule:** orange never carries small text on a light field. On dark it may.

### 1.4 Day-to-night transition

The site is warm and light from the header through the bar section. It goes dark exactly once, at
**Oasis After Dark**, and returns to light for arrival.

The transition **is** a gradient, and that is the point — an abrupt dark rectangle reads as a
different website, not a later hour. It is:

1. A graded band, cream → sand → obsidian, over 96–128px of dedicated height. The page darkens the
   way a room does at closing time.
2. The type voice changes with it: Archivo above, Anton poster type below.
3. `--o-neon` appears for the first time, on the dates and the ticket actions.
4. One marquee ticker on the obsidian, carrying the weekly line — the only motion of its kind on
   the site, and every fact in it is also stated as static text.

The dark band is used on the homepage After Dark section, the `/events` hero, and event detail
heroes. **Nowhere else.** If darkness appears on `/menu` or `/catering` it stops being a signal.

---

## 2. Typography

### 2.1 Licensing situation

The live site uses:

- **`aether`** — display. Wix-hosted, licensed to the Wix site. Not redistributable.
- **`neue-haas-unica-pro`** — UI. Adobe Fonts (Typekit). Web-only license, tied to the Wix account.

Neither font file may be copied into this repository. There is no legitimate path to reusing them
without the owner purchasing a separate self-hosting license.

**Requested from the owner** in `ASSET-HANDOFF.md`: confirmation of whether Oasis holds any font
licenses, and the original logo vector (the logo wordmark is the one place the true brand
letterforms genuinely matter).

### 2.2 The pairing

Two voices with distinct jobs, not one face at many sizes. Both Open Font License, both
self-hosted through `next/font/google`.

| Voice | Face | Job |
|---|---|---|
| **Display** | **Anton** | Marquee statements, event posters, After Dark, section openers. Condensed, heavy, poster-scale, uppercase. This is the "electric" voice. |
| **Text** | **Archivo** (variable, wght + wdth) | Everything that must be read: menus, prices, body, forms, navigation. The "kitchen" voice. |

Anton is deliberately a single weight used in a single register. It is what makes an event poster
read as a poster and a headline read as a statement, and keeping it out of body copy is what keeps
it from becoming a second body font.

Why not one family for both: the previous build used Archivo alone at many sizes, which produced a
competent but one-note page — every heading was body copy scaled up. The brief's requirement that
"typography does meaningful work" is not satisfiable with a single grotesque.

Why Archivo for the text voice:

- It is a grotesque in the same family tree as Neue Haas Unica — same tall x-height, same open
  apertures, same low stroke contrast. Set side by side at display size the substitution is
  close enough that the page still reads as the same brand.
- The variable **width axis (62–125)** is available where a wider or narrower cut helps, without
  faux-stretching.
- It has true tabular figures, which the menu price column and event date column both need.
- One family, two axes — no second face means no muddy grotesque-on-grotesque pairing, and one
  font download instead of two.

**Explicitly rejected:** Inter (the default AI-website tell), any ornamental serif (clashes with a
modern identity that has never used a serif), and any script/handwritten face (the "Mexican
restaurant" cliché the current brand has correctly avoided).

### 2.3 Type scale

Fluid via `clamp()`. Widths given as the `wdth` axis value.

| Token | Size | Weight | Width | Tracking | Leading | Use |
|---|---|---|---|---|---|---|
| `display-xl` | `clamp(3rem, 9vw, 7.5rem)` | 600 | 108 | −0.035em | 0.92 | Hero headline |
| `display-lg` | `clamp(2.5rem, 6vw, 4.5rem)` | 600 | 106 | −0.03em | 0.95 | Section openers |
| `display-md` | `clamp(2rem, 4vw, 3rem)` | 600 | 104 | −0.025em | 1.0 | Sub-sections |
| `heading` | `clamp(1.375rem, 2vw, 1.75rem)` | 600 | 100 | −0.015em | 1.15 | Card + dish titles |
| `eyebrow` | `0.75rem` | 600 | 112 | **+0.18em** | 1.0 | `FIND US`, `STARTERS` — uppercase |
| `body-lg` | `clamp(1.0625rem, 1.4vw, 1.25rem)` | 400 | 100 | 0 | 1.6 | Lead paragraphs |
| `body` | `1rem` | 400 | 100 | 0 | 1.65 | Default |
| `body-sm` | `0.9375rem` | 400 | 100 | 0 | 1.55 | Dish descriptions |
| `caption` | `0.8125rem` | 500 | 100 | +0.01em | 1.4 | Meta, footnotes |
| `price` | `1rem` | 600 | 100 | 0 | 1 | Menu prices — **tabular** |
| `nav` | `0.9375rem` | 500 | 100 | +0.01em | 1 | Header links |
| `button` | `0.9375rem` | 600 | 104 | +0.02em | 1 | All buttons |

**Measure:** body copy capped at `62ch`; lead paragraphs at `48ch`; display headlines at `14ch`
so the wrap points are chosen, not accidental.

**Deliberate wraps:** the hero headline is authored with explicit break control rather than left to
the browser — `Modern Mexican.` / `Tropical Energy.` breaks after the first sentence at every width
above 480px, and stacks to four lines below it. No headline is allowed to produce an orphan.

**Numerals:** `font-variant-numeric: tabular-nums` on prices, times, and dates so the menu's price
column and the events list's time column align optically.

---

## 3. Grid, spacing, radius, border

### 3.1 Grid

12 columns, `1.5rem` gutter, `1440px` max content width with a `1120px` reading width for
text-dominant sections. Full-bleed permitted for hero media, the After Dark band, and the gallery.

**Asymmetry is the rule.** The default section is *not* centered. Editorial sections use a 7/5 or
5/7 split with the image column bleeding to one page edge. Centered composition is reserved for
exactly two places: the After Dark band opener and the 404 page.

### 3.2 Spacing scale

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160` (px).

Section rhythm is fluid: `clamp(4rem, 9vw, 10rem)` vertical padding, with adjacent sections of the
same surface color collapsing to a single step so bands don't double up.

### 3.3 Radius

The live site uses `24px` on hero photography and `4–12px` on small controls. Preserved:

```
--o-r-sm    4px    inputs, tags, small chips
--o-r-md    12px   buttons, small media
--o-r-lg    24px   feature photography  ← the brand's signature radius
--o-r-full  999px  only the two circular icon buttons
```

**Sections are never rounded.** Cards are used sparingly and are square-cornered with a hairline
border — the rounded corner belongs to *photography*, which is what distinguishes this from the
rounded-everything template look.

### 3.4 Borders and texture

- Hairlines only: `1px solid var(--o-brown-line)`. No 2px+ decorative borders.
- **No drop shadows anywhere.** Depth comes from surface color change (cream → linen → sand), not
  from blur. This is the single most effective anti-template rule in this document.
- Texture: one asset only — a low-opacity (3%) warm paper grain on the sand surfaces, applied as a
  tiled PNG under 8KB. It is what stops large flat sand fields from looking like a CSS swatch. It
  is disabled under `prefers-reduced-transparency`.

---

## 4. Motion

| Behavior | Spec |
|---|---|
| Section reveal | opacity 0→1, `translateY(12px)` → 0, 480ms, `cubic-bezier(0.22, 1, 0.36, 1)`, **once**, fired at 15% viewport intersection |
| Image crop reveal | `clip-path` inset 8% → 0 on the same curve, hero + feature photography only |
| Button hover | background 140ms linear; no scale, no lift |
| Button pressed | `translateY(1px)` |
| Link hover | underline `text-underline-offset` 3px → 5px, 120ms |
| Mobile drawer | slide from right, 260ms, focus trapped, `Esc` closes, background scroll locked |
| Hero video | autoplay, muted, loop, `playsinline`, poster always present |

**`prefers-reduced-motion: reduce`** — all reveals resolve instantly to their final state, the
`clip-path` animation is removed, and the hero video is replaced by its poster image. This is a real
media query in CSS, not a JS check, so it applies before first paint.

**Reveal budget:** at most **four** reveal-animated elements per viewport. Beyond that the page
reads as a scroll demo rather than a restaurant.

---

## 5. Photography direction

- **Crops are intentional and documented per slot** (`ASSET-SLOT-SPECS.md`), with a focal point
  stored in the asset registry so a replacement photo re-crops correctly without touching CSS.
- Faces are never cropped through the eye line. Food is never cropped through the plate rim.
- Portrait `4:5` for feature dishes, `3:2` landscape for room/atmosphere, `9:16` for reel stills,
  `21:9` for the full-bleed band.
- No stock photography. No AI-generated food. If a slot has no acceptable asset, it renders a
  **branded neutral placeholder at the exact slot geometry** — a sand field with the Oasis mark at
  6% opacity — so the layout is final and only the pixels are pending.

---

## 6. Explicit anti-patterns

These are prohibited in this codebase. Each maps to a specific failure the brief names.

| ❌ Prohibited | Why | What is done instead |
|---|---|---|
| Centered hero with overlay text | The default AI-site composition | Editorial split: type left, full-bleed media right, media bleeding off the page edge |
| Gradient-filled headline text | Reads as 2021 SaaS | Solid `--o-brown`; hierarchy from size, width axis, and tracking |
| Glassmorphism / backdrop blur | No basis in the brand | Solid surfaces from the palette |
| Drop shadows | Creates fake depth, flattens the palette | Surface color changes and hairlines |
| Everything a pill | Template tell | Pills reserved for the two circular icon buttons; everything else `12px` |
| Three identical feature cards | The single most recognizable AI layout | Staggered editorial grid — three cells at different sizes, offsets, and aspect ratios |
| Rounded card around every section | Turns a page into a settings screen | Sections are full-bleed color bands; cards are rare and square |
| Decorative icon set | Icons that illustrate nothing | Icons only where they carry meaning: external-link, direction, phone, close, chevron |
| Decorative gradients / blobs / glows | No brand basis | Flat palette + the paper grain |
| Palm leaves, sombreros, cacti, papel picado | The cliché the current brand correctly avoided | Nothing |
| Fake metrics ("10,000 tacos served") | Invented facts | Omitted |
| Fake testimonials or press | Invented facts | A real gallery instead |
| "Culinary excellence", "embark on a journey", "where flavor meets passion" | Generic luxury filler | The careers page's real voice — warm, plural, direct |
| Repeating split-image/text on every page | Monotony | Each route gets a distinct composition — see `PLAN.md` §3 |
| Scroll hijack, parallax, cursor effects, floating animation | Motion for its own sake | The four behaviors in §4, nothing else |
| Default framework component styling | Reads as unfinished | Every control is tokenized; no unstyled defaults ship |

---

## 7. Success test

The design is right if a regular Oasis guest, shown the new homepage without warning, says
*"they redid the website"* — and not *"is this the same restaurant?"*
