# Site Audit — Oasis Mexican Kitchen & Bar

Audit of the live Wix site at <https://www.oasismexicankitchenbar.com/>, its linked Toast
ordering/reservation surfaces, and the public event pages.

- **Audit date:** 2026-08-14
- **Method:** live browser inspection (rendered DOM, computed styles, network media, mobile +
  desktop widths), not source scraping.
- **Scope:** every reachable public route plus the Toast online-ordering site.

---

## 1. Existing page inventory

| # | Route | Title | Purpose | Notes |
|---|-------|-------|---------|-------|
| 1 | `/` | Your Mexican Restaurant in Lockport IL \| Oasis Mexican Kitchen & Bar | Homepage | Hero + a single "Find Us / Hours" block. Extremely thin. |
| 2 | `/menus` | Food Menu \| Oasis Mexican Kitchen & Bar | Menus | Wix "Restaurant Menus Showcase" app with three tabs: Food, Cocktail, Brunch. |
| 3 | `/event-list` | Events \| Oasis Mexican Kitchen & Bar | Events listing | Wix Events app. Two recurring series. |
| 4 | `/event-details/oasis-fridays-…` | Oasis Fridays | Event detail + ticketing | Wix Events checkout, $10 GA + $0.25 fee. |
| 5 | `/event-details/oasis-latin-saturdays-…` | Oasis Latin Saturdays | Event detail + ticketing | Same structure. |
| 6 | `/join-our-team` | Join Our Team | Careers | Wix Forms application form. Best-designed page on the site. |
| 7 | `/cart-page` | Cart | Wix Stores cart | **Orphan.** Nothing is sold through Wix Stores. |
| — | `tables.toasttab.com/restaurants/43040713-…/findTime` | Toast Tables | Reservations | External. Works. |
| — | `oasismexicanlockport.toast.site/order` | Toast Online Ordering | Ordering **and catering** | External. Works. Contains the full catering menu. |

**No route exists for:** catering, private events / celebrations, a dedicated visit/location page,
an about page, or a gallery.

---

## 2. What should be preserved

These are the elements that make the site read as *Oasis*. They carry forward unchanged in
intent, refined in execution.

### 2.1 Color language
Sampled from computed styles on the live site:

| Role | Live value | Where it appears |
|------|-----------|------------------|
| Cream | `rgb(253, 243, 218)` — `#FDF3DA` | Header bar, light page fields, text on dark |
| Sand / tan | `rgb(221, 184, 146)` — `#DDB892` | Hero field, section surfaces |
| Burnt orange | `rgb(230, 92, 46)` — `#E65C2E` | Logo mark, primary buttons, accents |
| Deep brown | `rgb(106, 63, 5)` — `#6A3F05` | Display headlines, primary body text |
| Muted brown | `rgb(168, 110, 63)` — `#A86E3F` | Secondary text, nav links |
| Near-black | `rgb(0, 0, 0)` | Nightlife/footer surfaces |

This warm cream → sand → orange → brown progression is the single most recognizable asset the
brand owns. **Preserve exactly.**

### 2.2 Typography posture
The live site uses two licensed families we cannot copy (`aether` for display, `neue-haas-unica-pro`
for UI). What matters is the *posture*, and that we can reproduce legitimately:

- Large, tightly-tracked, low-contrast grotesque display type in deep brown.
- Sentence case, not all-caps, for hero headlines.
- All-caps with wide tracking for section eyebrows (`FIND US`, `HOURS`, `STARTERS`).
- No serif anywhere. The identity is modern, not traditional-cantina.

### 2.3 Image treatment
- Restrained rounded corners on photography (live radius `24px` on the hero image; `12px`, `8px`,
  `4px` used elsewhere).
- Tall portrait crops for feature photography.
- No borders, no drop shadows on images.

### 2.4 Voice
The careers page carries the only genuinely good copy on the site — "Join the Oasis Familia",
"every shift is a fiesta", "works hard, plays hard, and feels like familia". Warm, plural,
Spanish-inflected, unpretentious. **This is the brand voice.** The homepage copy is not.

### 2.5 Working integrations
- Toast Tables reservations.
- Toast online ordering (which also carries catering).
- Wix Events ticketing at $10 GA. Ticket URLs must keep working until a replacement ticketing
  provider is chosen by the owner.

---

## 3. What should be corrected

### 3.1 Homepage is effectively empty — **high**
The rendered homepage contains a hero, a Find Us / Hours block, and a footer. That is the entire
page. Food, cocktails, brunch, events, nightlife, catering, and private celebrations — the actual
business — are invisible above the fold and mostly invisible below it too.

### 3.2 SEO-first headline — **high**
`Your Mexican Restaurant in Lockport IL` is a keyword string, not a headline. It tells a visitor
nothing they did not already know from clicking the link. Supporting copy ("Bold tastes, good vibes
& tropical ambiance") is closer, but sits under a dead headline.

### 3.3 Catering is invisible — **high**
Oasis has a fully-built catering program with six named packages and real prices, sitting inside
the Toast ordering site where no visitor will find it:

| Package | Serves | Price |
|---|---|---|
| Fiesta Pack | 15–20 | $245 |
| Tradición Pack | 25–30 | $365 |
| Fajita Fiesta | 25–30 | $395 |
| Birria Lovers Pack | 20–25 | $310 |
| Office Lunch Pack | 20–25 | $295 |

Plus à-la-carte trays ($15–$165). Nothing in the site navigation mentions catering at all.

### 3.4 Brunch menu is published but empty — **high**
`/menus` → Brunch tab renders "Served Saturday and Sundays 10am to 3pm", a "Brunch Plates" heading,
and then nothing. Brunch is in the nav-level menu structure with zero items behind it.

### 3.5 Generic social links — **high**
Four of six footer social icons point at platform homepages, not Oasis accounts:

- `facebook.com/OasisMexicanKitchenandBar/` ✅ real
- `instagram.com/oasismexbar/` ✅ real
- `youtube.com` ❌ platform homepage
- `x.com` ❌ platform homepage
- `linkedin.com` ❌ platform homepage
- `tiktok.com` ❌ platform homepage

### 3.6 Conflicting hours — **high**
The website and the Toast ordering site disagree on opening time every single day, and Toast shows
a mid-day closure Monday and Wednesday that the website does not mention at all. Full comparison in
`CONTENT-QUESTIONS.md` §2.

### 3.7 Two different phone numbers — **high**
Website footer: **(815) 545-7556**. Toast ordering site: **(815) 524-4188**. Both are presented as
the restaurant's number. See `CONTENT-QUESTIONS.md` §1.

### 3.8 Event end times contradict their own descriptions — **medium**
`Oasis Latin Saturdays` prose says "10 PM–2 AM"; the structured Time & Location field says
`10:00 PM – 5:00 AM`. `Oasis Fridays` prose and structured data agree (10 PM–2 AM). One of the
Saturday values is wrong.

Separately, both events run past 1 AM while the published Friday/Saturday restaurant hours end at
1 AM — the venue's late-night operation is not represented in its own hours.

### 3.9 Menu items with no base price — **medium**
Nine items on the public food and cocktail menus show only modifier upcharges, never a base price.
A guest reading "Taco Dinner … Sour Cream $0.50" cannot tell what the dinner costs. Full list in
`CONTENT-QUESTIONS.md` §3.

### 3.10 Website and Toast prices disagree — **medium**
Seven items are priced differently on the marketing menu than in the ordering system, including
Oasis Wings ($18 vs $16) and Torta ($14 vs $16). Full table in `CONTENT-QUESTIONS.md` §4.

### 3.11 Menu copy errors — **low**
- `Veggie: Grilled peppers, onions, tomatoe` → *tomato*
- `comes with side of console` → *consommé*
- `topped with pickle red onions` → *pickled red onions*
- `Ceaser Salad` (Toast) → *Caesar Salad*
- `Upgrade to our Fajita Salad - grilled pe` → description truncated mid-word
- `substitute for shrimp` appears as a modifier label with no price on Oasis Alfredo Pasta
- `PINA COLADA` → *Piña Colada*; `OASIS OLD FASHION` → *Old Fashioned*
- `Tampiqueña` spelled `Tampiquena` on Toast

### 3.12 Orphan Wix commerce chrome — **medium**
The header carries a `Log In` control and a cart badge (`0`) linking to `/cart-page`. Nothing is
sold through Wix Stores; ordering happens on Toast. Both controls are pure confusion — a guest who
clicks "Log In" gets a Wix member signup for a restaurant that has no member program.

### 3.13 Stale copyright — **low**
Footer reads `© 2024` on a site being audited in 2026. Should be computed, not typed.

### 3.14 Missing alt text — **medium**
Every gallery image on the homepage has `alt=""`. The logo is the only image with a real
description (`Oasis-Mexican-Kitchen-&-Bar-logo`). Decorative-vs-informative has not been decided;
everything is simply blank.

---

## 4. Conversion and usability problems

| Problem | Impact |
|---|---|
| **Reserve and Order are visually identical nav links.** Two very different intents (book a table for tonight vs. get food now) are given identical weight as plain text links. | Both underperform. Neither reads as the primary action. |
| **The hero has one CTA pair — "Book Table" and "Our Events" — and no ordering path.** Online ordering is only reachable from a text nav link. | Takeout revenue path is the weakest link on the page. |
| **No path to catering exists at all.** | An entire revenue line is unreachable from the website. |
| **No path to book a private celebration exists.** | Birthday/quinceañera/office-party demand has nowhere to land; the only related content is a $35 "Birthday Celebration" add-on buried in the cocktail menu. |
| **Events require two clicks and a Wix checkout to learn a price.** The listing shows date + venue but not price, age limit, or music format. | Guests who care about "is it 18+?" and "how much?" bounce before finding out. |
| **Menu is a single scrolling wall.** Food menu has 5 sections and ~40 items with no category navigation. | On mobile this is a 12+ screen scroll to reach Sides. |
| **Hours are shown only in the footer.** | The most-asked question about a restaurant is answered last on every page. |
| **"Get Directions" and "Call Now" exist only in the footer.** | Fine, but they are the highest-intent actions on mobile and deserve better placement. |

---

## 5. Mobile-specific observations

- The header collapses to a hamburger, but the cart badge and Log In control are retained inside
  the drawer — carrying the orphan-commerce confusion into the most space-constrained surface.
- The hero image is a **portrait** crop (`805×1206` served) sitting beside the headline on desktop.
  On narrow widths it stacks above the headline and consumes most of the first screen, pushing both
  CTAs below the fold.
- The lunch-deal creative is served as a `968×1726` JPEG derived from a `.mov` file
  (`OASIS_LUNCH_DEAL_REEL_mov.jpeg`) — a vertical reel still, used as a static image.
- Menu tab navigation (Food / Cocktail / Brunch) is a horizontal row that does not stick; once
  scrolled past, switching menus requires scrolling back to the top.
- Modifier lists (`Sour Cream $0.50`, `Guacamole $0.50`, `Avocado Slices $0.50`) render as
  full-width rows identical in weight to actual dishes, making the mobile menu read as ~90 items
  instead of ~40.
- Tap targets on footer social icons are small and tightly spaced.

---

## 6. Accessibility observations

| Finding | Severity |
|---|---|
| All content images carry `alt=""` — including the homepage gallery photographs, which are informative, not decorative. | High |
| Social links use `aria-label="Social Bar item"` for all six icons — indistinguishable to a screen reader, and four of them go to the wrong destination anyway. | High |
| Heading structure on `/menus` uses styled text rather than a consistent `h1 → h2 → h3` outline; category names and dish names sit at visually different but semantically flat levels. | Medium |
| The hero headline in sand-on-sand context: deep brown `#6A3F05` on sand `#DDB892` measures ≈ 5.0:1 — passes AA for large text, marginal for body copy at that pairing. Body copy must not reuse it at small sizes. | Medium |
| Burnt orange `#E65C2E` on cream `#FDF3DA` measures ≈ 3.3:1 — **fails AA for normal text.** Currently used for small link text. | High |
| Menu tabs are clickable text without discernible `role="tab"` semantics or keyboard affordance. | Medium |
| `Skip to Main Content` link is present. ✅ | — |
| Video has no captions or controls; it is decorative and muted, which is acceptable, but no `prefers-reduced-motion` handling is evident. | Medium |

---

## 7. Performance observations

- **The logo is served at its full `3780×1523` native resolution** into a header slot roughly
  120px wide. This is the single largest avoidable payload on every page.
- The hero video (`video.wixstatic.com/…/720p/mp4/file.mp4`) loads with **no poster attribute**,
  so the hero area is empty until the first frame decodes.
- Wix ships its full framework, Wix Stores (cart), Wix Members (login), Wix Events, and the
  Restaurant Menus Showcase OOI app on pages that need at most one of them.
- Homepage gallery images are served at `147px` wide with `blur_2` applied as LQIP placeholders and
  then replaced — reasonable behavior, but the full-size replacements are `805×1206`, larger than
  the rendered slot at most breakpoints.
- Menus are rendered by a client-side OOI app; menu content is not present until JavaScript
  executes. Menu items are effectively invisible to any consumer that does not run JS.

---

## 8. Content inventory captured

Fully captured and carried into the rebuild as seed data (see `PLAN.md` §4):

- **Food menu** — 5 categories, 38 items with descriptions, prices, and modifiers.
- **Cocktail menu** — 6 categories, 47 entries including beer, wine, and non-alcoholic.
- **Catering menu (from Toast)** — 13 à-la-carte trays + 5 named packages with prices and contents.
- **Events** — 2 recurring series with schedule, age limit, music format, price, and description.
- **Careers** — full page copy and form field set.
- **Business facts** — address, both phone numbers, both hours sets, reservation URL, order URL,
  real social handles.

**Not captured because it does not exist:** brunch menu items, private-events content, any
about/story content, any verified reviews or testimonials, any press or awards.
