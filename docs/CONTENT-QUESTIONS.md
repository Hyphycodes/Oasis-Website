# Content Questions — Oasis Mexican Kitchen & Bar

Every business fact that is **conflicting, missing, stale, or unverified**, with its exact source.

**Rule applied throughout:** where the first-party website and a third-party surface disagree, the
website value is used provisionally and marked `PROVISIONAL` in the codebase. Nothing in this file
has been approved by the owner. No value here should be treated as verified until the owner signs
off in `CLIENT-CONTENT-SIGNOFF.md`.

**Captured:** 2026-08-14

### Sources referenced

- **[W]** <https://www.oasismexicankitchenbar.com/> (first-party website, Wix)
- **[T-ORDER]** <https://oasismexicanlockport.toast.site/order> (Toast online ordering)
- **[T-TABLE]** <https://tables.toasttab.com/restaurants/43040713-bf74-449f-bd19-00594dd956fa/findTime>
- **[EV-F]** <https://www.oasismexicankitchenbar.com/event-details/oasis-fridays-2026-08-14-22-00>
- **[EV-S]** <https://www.oasismexicankitchenbar.com/event-details/oasis-latin-saturdays-2026-08-15-22-00>

---

## 1. Phone number — CONFLICT ⚠️ (blocking)

| Source | Value |
|---|---|
| [W] footer, every page | **(815) 545-7556** |
| [T-ORDER] location block | **(815) 524-4188** |

Two entirely different numbers, both presented as *the* restaurant's number.

- **Provisional value used:** `(815) 545-7556` (first-party website).
- **Question for owner:** Which number should the website publish? Is the other a second line
  (kitchen / takeout / events)? If both are live, which is for reservations and which for takeout?
- **Blocking because:** it is also the number embedded in `LocalBusiness` structured data and
  `tel:` links.

---

## 2. Hours of operation — CONFLICT ⚠️ (blocking)

| Day | [W] website | [T-ORDER] Toast | Agrees? |
|---|---|---|---|
| Monday | 10:00 AM – 10:00 PM | 11:00 AM – 12:00 PM, **then** 4:00 PM – 10:00 PM | ❌ |
| Tuesday | 10:00 AM – 10:00 PM | 11:00 AM – 10:00 PM | ❌ open time |
| Wednesday | 10:00 AM – 10:00 PM | 11:00 AM – 12:00 PM, **then** 4:00 PM – 10:00 PM | ❌ |
| Thursday | 10:00 AM – 10:00 PM | 11:00 AM – 10:00 PM | ❌ open time |
| Friday | 10:00 AM – 1:00 AM | 11:00 AM – 1:00 AM | ❌ open time |
| Saturday | 10:00 AM – 1:00 AM | 11:00 AM – 1:00 AM | ❌ open time |
| Sunday | 10:00 AM – 9:00 PM | 11:00 AM – 9:00 PM | ❌ open time |

Three separate problems:

1. **Opening time differs every day** — 10 AM on the website, 11 AM on Toast.
2. **Monday and Wednesday show a mid-day closure on Toast** (closed 12 PM – 4 PM) that the website
   does not mention. If real, guests arriving at 1 PM on a Monday find a closed restaurant.
3. **Friday/Saturday close at 1 AM**, but [EV-F] and [EV-S] sell tickets to events running until
   2 AM (and one field says 5 AM — see §5). The published hours do not describe the venue's actual
   late-night operation.

- **Provisional values used:** the [W] website hours, exactly as published, with **no** mid-day
  closure.
- **Questions for owner:**
  - Do you open at 10 AM or 11 AM?
  - Is there a real Monday/Wednesday midday closure?
  - What are the true Friday/Saturday closing times — kitchen close and venue close may differ, and
    if so we should publish both.
  - Are there separate brunch hours, happy-hour hours, or kitchen-vs-bar hours?
- **Holiday hours:** never published anywhere. Completely unknown.

---

## 3. Menu items with no base price — MISSING (blocking for the affected items)

These items show modifier upcharges but no base price on [W] `/menus`.

### Food

| Item | What is shown | Base price on [T-ORDER] |
|---|---|---|
| Quesadilla | `Add meat $4`, `Upgrade to dinner $2` | $10.00 |
| Loaded Nachos | `Meat $4` | $12.00 |
| Oasis Fries | `Meat $4` | $12.00 |
| Caesar Salad | `Add 8oz: Chicken $4`, `Shrimp $6` | $12.00 (listed as "Ceaser Salad") |
| Taco Dinner | meat choices + `Sour Cream $0.50` etc. | $14.00 |
| Taco Salad | `Upgrade to our Fajita Salad… $2` | $16.00 |
| Fajitas | `combo $4` | $26.00 |
| Oasis Alfredo Pasta | `substitute for shrimp` (no price) | $20.00 |

### Cocktails / bar — no price anywhere

| Item | What is shown | Notes |
|---|---|---|
| MARGARITA | six flavors, no price | The house cocktail has no published price. |
| MARGARITA TOWER | five flavors, no price | |
| PITCHERS | flavors listed; only `Sangria Pitcher $38` priced | Margarita pitcher price unknown. |
| All beer (17 SKUs) | no prices | Imported / Domestic / Seltzer / Cider / Craft |
| All wine (7 SKUs) | no prices | |
| Fountain soda | no prices | $3.00 on [T-ORDER] |

- **Provisional treatment:** the site renders these as **"Market price — ask your server"** rather
  than silently omitting the price row or inventing a number. Toast prices are **not** copied onto
  the marketing menu, because Toast prices are takeout prices and may legitimately differ from
  dine-in (see §4).
- **Question for owner:** please supply dine-in base prices for every item above, or confirm the
  Toast price applies to dine-in too.

---

## 4. Website vs Toast price conflicts — CONFLICT ⚠️

| Item | [W] website | [T-ORDER] Toast | Δ |
|---|---|---|---|
| Oasis Wings | $18 (each sauce) | $16.00 | −$2 |
| Torta | $14 | $16.00 (as "Torta Dinner") | +$2 |
| Crispy Shrimps | $16 | $16.00 | — ✅ |
| Queso Dip | $9 | $9.00 | — ✅ |
| Street Corn | $10 | $10.00 | — ✅ |
| Guacamole | $12 | $12.00 | — ✅ |
| Los Esquites | $6 | not listed | ? |
| Burrito Dinner | $14 | $14.00 | — ✅ |
| Birria Ramen | $16 | $16.00 | — ✅ |
| Bizza | $20 | $20.00 | — ✅ |

- **Provisional values used:** the [W] website prices.
- **Question for owner:** is the difference intentional (dine-in vs takeout pricing), or is one
  surface stale? If pricing is intentionally different, the website should say so once, clearly.

### Items on Toast but absent from the public menu

These are being sold but are not advertised. Should they appear on the website menu?

`Birria Fries $14` · `Birria Nachos $17` · `Flauta Dinner $15` ·
`Camarones a la Diabla $24` · `Veggie Taco Dinner $16` · full **Kids menu** (6 items @ $10) ·
**À-la-carte** (single enchilada $3.50, single specialty taco $5.50, arrachera taco $6.00,
burrito $13.00) · numerous sides (Cebollitas $3.50, Side of Consommé $1.25, Pico de Gallo 8oz
$4.00, Carrots en Vinagre 8oz $3.00, Chips & Salsa Takeout $6.00, Mixed Tortillas $3.00).

### Out of stock

`Mexican Rib Eye` is flagged **OUT OF STOCK** on [T-ORDER] but shows as normally available on [W].

---

## 5. Event details — CONFLICT ⚠️ and UNVERIFIED

### 5.1 Latin Saturdays end time contradicts itself

| Field on [EV-S] | Value |
|---|---|
| Description prose | "every Saturday from **10 PM–2 AM**" |
| Structured Time & Location | "Aug 15, 2026, 10:00 PM – Aug 16, 2026, **5:00 AM**" |

One is wrong. `Oasis Fridays` has no such conflict (prose and structured data both say 10 PM–2 AM).

- **Provisional value used:** **10:00 PM – 2:00 AM** for both series (the prose value, consistent
  across both events, and consistent with a 1 AM published bar close).
- **Question for owner:** what time do Friday and Saturday nights actually end?

### 5.2 Verified event facts (carried forward as-is)

| Field | Oasis Fridays | Oasis Latin Saturdays |
|---|---|---|
| Cadence | Every Friday | Every Saturday |
| Start | 10:00 PM | 10:00 PM |
| Age | 18+ (drinks 21+) | 18+ |
| Music | House, Top 100, some Hip-Hop | Reggaetón, Corridos, Guaracha |
| Ticket | $10.00 GA + $0.25 service fee | $10.00 GA + $0.25 service fee |
| Dates published | 21 dates | 21 dates |

### 5.3 Unverified event questions

- The Fridays description says the party is "at **Oasis Music Ent.**" — is that a separate
  promoter/entity name that should appear publicly, or a leftover?
- Is there a dress code? Not published anywhere.
- Is there table/bottle service? The cocktail menu has a `JUMBO CANTARITO $99` and a
  `Moët 750ml $150`, which imply yes, but nothing says so.
- Do the 21 published dates have an end date, or is the series open-ended?
- Are there ever cover-free nights, guest DJs, or one-off events? The current system has no
  concept of a one-time event.

---

## 6. Brunch — MISSING (blocking)

[W] `/menus` → Brunch tab publishes:

> "Served Saturday and Sundays 10am to 3pm"
> **Brunch Plates**
> *(no items)*

The brunch menu is structurally present and completely empty.

- **Provisional treatment:** the rebuilt `/menu/brunch` page states the brunch service window and
  says the menu is being finalized. It does **not** invent dishes.
- **Questions for owner:** what are the brunch items, descriptions, and prices? Is brunch
  Saturday **and** Sunday 10 AM–3 PM? Does brunch include bottomless mimosas or a drink program?
  (Note: the brunch window starts at 10 AM, which is consistent with the website's 10 AM opening
  and **inconsistent** with Toast's 11 AM opening — see §2.)

---

## 7. Catering — UNVERIFIED SCOPE

Full catering menu exists on [T-ORDER] with real prices (see `SITE-AUDIT.md` §3.3). It is carried
into the rebuilt `/catering` page verbatim.

- **Questions for owner:**
  - Is delivery offered, or is catering pickup-only? Toast is configured for takeout.
  - What lead time is required for each package?
  - Is there a minimum order or a delivery radius?
  - Are the Toast catering prices current?
  - Do you want catering inquiries by form, by phone, or straight to the Toast catering menu?

---

## 8. Private events / celebrations — MISSING

Oasis clearly hosts celebrations — the cocktail menu sells a **Birthday Celebration** experience
(signature dessert, staff birthday song, personalized song choice, LED show, confetti popper) with
a **Moët mini bottle at $35** and a **Moët 750ml at $150**. But there is no private-events page,
no capacity information, and no buyout information anywhere.

- **Provisional treatment:** `/private-events` is built as a genuine inquiry page using only the
  verified Birthday Celebration content. **No** capacity numbers, minimums, room names, or package
  tiers are invented.
- **Questions for owner:**
  - What is the venue capacity — seated and standing?
  - Is there a private or semi-private room? What does it hold?
  - Is a full buyout available? What does it cost / minimum?
  - Are there food & beverage minimums?
  - Which event types do you actively want (quinceañeras, birthdays, corporate, rehearsal dinners)?
  - Is the Birthday Celebration price the $35 Moët mini, or is the experience itself priced
    separately? The current menu layout is ambiguous.

---

## 9. Social accounts — PARTIALLY WRONG ⚠️

| Platform | Live link on [W] | Status |
|---|---|---|
| Facebook | `facebook.com/OasisMexicanKitchenandBar/` | ✅ Real account |
| Instagram | `instagram.com/oasismexbar/` | ✅ Real account |
| YouTube | `youtube.com` | ❌ Platform homepage |
| X | `x.com` | ❌ Platform homepage |
| LinkedIn | `linkedin.com` | ❌ Platform homepage |
| TikTok | `tiktok.com` | ❌ Platform homepage |

- **Provisional treatment:** the rebuilt footer links **only** Facebook and Instagram. Dead
  platform links are removed rather than carried forward.
- **Question for owner:** do real TikTok / YouTube accounts exist? TikTok in particular is likely
  given the vertical reel content already in use (`OASIS_LUNCH_DEAL_REEL.mov`).

---

## 10. Business identity — UNVERIFIED

| Field | Provisional value | Source | Confidence |
|---|---|---|---|
| Public name | Oasis Mexican Kitchen & Bar | [W] | High |
| Legal entity | *unknown* | — | — |
| Street | 1250 E. 9th St. | [W] (`1250 e. 9th St.`) | High — casing normalized |
| City/State/ZIP | Lockport, IL 60441 | [W] + [T-ORDER] | High |
| Cuisine | Modern Mexican | [W] | High |
| Price band | $$ | inferred from menu | Medium |
| Contact email | *none published anywhere* | — | **Missing** |

- **Question for owner:** there is **no email address anywhere on the site or on Toast.** Catering,
  private-event, and careers inquiries need a destination. Which inbox should receive each?

---

## 11. Payments and fees — VERIFIED BUT UNPUBLISHED

[T-ORDER] discloses: *"If you use a credit card, this establishment will charge an additional
**2.75%** to help offset processing costs."*

This surcharge is disclosed at Toast checkout but nowhere on the website.

- **Question for owner:** does the 2.75% card surcharge apply to dine-in as well? If so, Illinois
  disclosure practice favors stating it on the menu page. Currently **not** published on the
  rebuilt site pending your answer.

---

## 12. Recurring promotions — UNVERIFIED

Two promotions are referenced only in passing and never explained:

1. **`$1 Taco Deal`** — appears once, as a parenthetical on the beverage menu:
   *"Refills +.50 (During $1 Taco Deal)"*. No day, no time, no terms.
2. **Lunch deal** — the homepage's largest creative asset is literally named
   `OASIS_LUNCH_DEAL_REEL.mov`, but no lunch-deal text exists anywhere on the site.

- **Provisional treatment:** neither promotion is published on the rebuilt site. The announcement
  bar is built and ready for them, but ships **disabled** rather than carrying an invented offer.
- **Questions for owner:** what are the actual terms, days, and times for each?

---

## 13. Copy corrections applied

Applied only where the intended meaning is certain:

| Original | Corrected |
|---|---|
| `Veggie: Grilled peppers, onions, tomatoe` | `tomato` |
| `comes with side of console` | `consommé` |
| `topped with pickle red onions` | `pickled red onions` |
| `PINA COLADA` | `Piña Colada` |
| `OASIS OLD FASHION` | `Oasis Old Fashioned` |
| `Ceaser Salad` (Toast) | `Caesar Salad` |
| `Tampiquena` (Toast) | `Tampiqueña` |
| `1/2 CONSOMME GALON` | `½ Gallon Consommé` |
| `1250 e. 9th St.` | `1250 E. 9th St.` |

**Deliberately not corrected** (brand names / uncertain intent):

- **`Bizza`** — the birria pizza. Intentional brand coinage, kept.
- **`Our Famous Quesabirrias`** — kept as written.
- **`Oasis Familia`** — kept.

### Truncated source text — needs owner input

- Taco Salad: `Upgrade to our Fajita Salad - grilled pe` — cuts off mid-word. Almost certainly
  "grilled peppers and onions", but that is an assumption, so the fragment is **not** published.
- Oasis Alfredo Pasta: `substitute for shrimp` appears twice, once in the description and once as
  a priceless modifier. Substitution price unknown.

---

## 14. Summary — blocking vs non-blocking

**Blocking (site should not launch until answered):**

1. Which phone number is correct? (§1)
2. What are the real hours, including the Monday/Wednesday midday closure question? (§2)
3. Base prices for the 8 food items and the entire bar list. (§3)
4. Which inbox receives catering, private-event, and careers inquiries? (§10)

**Non-blocking (site launches with an honest placeholder):**

5. Brunch menu items (§6) — page states "menu being finalized".
6. Latin Saturdays end time (§5.1) — 2 AM used, consistent with Fridays.
7. Website-vs-Toast price differences (§4) — website prices used.
8. Private-event capacity and packages (§8) — nothing invented.
9. TikTok/YouTube handles (§9) — dead links removed.
10. `$1 Taco Deal` and lunch-deal terms (§12) — announcement bar ships disabled.
11. Card-surcharge disclosure (§11) — not published.
