# Asset Handoff — What to send us

Everything below is what the website needs from Oasis to replace the temporary media.
Nothing here is urgent enough to block launch — the site works today — but every item makes it
better, and the first two sections are the ones that matter most.

**Where to send it:** any shared drive, Dropbox, or WeTransfer link works. Send originals, not
screenshots and not anything that has been through Instagram.

---

## 1. Brand files — highest priority

| What | Why we need it | Format |
|---|---|---|
| **The Oasis logo, original vector** | We currently have a 1200px PNG traced from the website. Vector means the logo is razor-sharp at any size, on any screen, forever. | `.ai`, `.eps`, `.svg`, or `.pdf` |
| **Logo variants** | A one-colour version for dark backgrounds, and the "O" mark on its own for the browser tab and social previews. | Same |
| **Brand fonts** | The current website uses two fonts (`aether` and `Neue Haas Unica`) that are rented through Wix and cannot legally move to the new site. If Oasis owns a licence for either, send the licence and we will use the real thing. If not, we are using a close free substitute and the site looks right either way. | Licence PDF or purchase receipt |

---

## 2. Food photography — biggest visible gap

**There is currently no photograph of any dish on the website.** Not one. The signature section on
the homepage is built as a typographic list precisely because there is nothing to show.

Please shoot these, in this order:

| Priority | Dish | Why |
|---|---|---|
| 1 | **Quesabirrias** with the consommé | The single most-ordered signature |
| 2 | **The Bizza** (birria pizza) | Unique to Oasis, nobody else has it |
| 3 | **Birria ramen** | The third signature |
| 4 | Fajitas arriving on the skillet | Sells the room, not just the plate |
| 5 | Carne asada / Mexican rib eye | The high-ticket plates |
| 6 | Street corn and esquites | The colour |
| 7 | A brunch plate | See §4 — brunch has no menu published either |

**How to shoot them** (a phone is genuinely fine if you follow this):

- Shoot in **portrait**, holding the phone vertically.
- Use daylight — near a window, mid-morning. Never the overhead lights, never flash.
- Shoot straight down or at about 30° from the table. Avoid eye-level.
- Fill the frame with the plate. We can crop in; we cannot crop out.
- Send the **original** file. Do not post it to Instagram first — that recompresses it.

---

## 3. Room, bar, and nightlife photography

| What | Notes |
|---|---|
| **A Friday or Saturday night on the floor** | We have no nightlife photography at all. The After Dark section and the events pages are running branded placeholders. This is the second-biggest gap after food. |
| The dining room, empty and lit for evening | We have a daytime shot only. |
| The bar with someone behind it working | We have a still-life of the back bar; we want people. |
| The building exterior, daytime and at night | Currently a frame lifted from your promo video. |
| A catering spread laid out | For the catering page. |
| A birthday celebration in progress — the LED show, the confetti | For the private-events page. |

Please get **written permission from anyone recognisable** in a photo before sending it to us.

---

## 4. Event artwork — one specific requirement

🚨 **Send flyers with NO DATE printed on the image.**

The current site pairs "Oasis Fridays" artwork that has an old date baked into the picture with a
live, correct date underneath it. Guests see two different dates and trust neither.

The new site draws every date from the calendar and prints it over the artwork as live text. That
only works if the artwork itself is undated. The build will **refuse to publish** artwork flagged
as containing a date.

- One undated flyer for **Oasis Fridays**
- One undated flyer for **Oasis Latin Saturdays**
- Portrait, 4:5, at least 1200 × 1500px

---

## 5. Business information

These are answers, not files, and several of them are blocking. The full list with sources is in
[`CONTENT-QUESTIONS.md`](./CONTENT-QUESTIONS.md).

**Blocking:**

1. **Which phone number is correct?** The website says (815) 545-7556; Toast says (815) 524-4188.
2. **What are the real hours?** The website says you open at 10am; Toast says 11am, and shows you
   closed 12pm–4pm on Mondays and Wednesdays.
3. **Base prices** for Taco Dinner, Fajitas, Quesadilla, Loaded Nachos, Oasis Fries, Caesar Salad,
   Taco Salad, Oasis Alfredo Pasta — and for the margaritas, beer, and wine.
4. **Which email addresses** should receive catering, private-event, and job enquiries? There is
   currently no email address published anywhere.

**Non-blocking but wanted:**

5. The brunch menu — dishes, descriptions, prices.
6. Do you have a **TikTok**? You clearly shoot vertical video. The current site links to
   `tiktok.com` itself, which goes nowhere.
7. Catering lead times, delivery radius, and minimum order.
8. Venue capacity and whether a private room or buyout is available.
9. The terms of the "$1 Taco Deal" and the lunch deal.

---

## 6. Naming and uploading

Name files so we can tell what they are without opening them:

```
oasis-quesabirrias-01.jpg
oasis-bizza-01.jpg
oasis-nightlife-friday-01.jpg
oasis-flyer-fridays-undated.png
```

Lower case, hyphens, no spaces, no `IMG_4821.HEIC`.

If you know where the important part of a photo is — "the face is on the left", "keep the
consommé in frame" — say so. We store a focal point per image so it crops correctly on phones
without cutting the good part off.

---

## 7. For the developer: replacing an asset

Four steps, no component changes.

1. Drop the file into the right folder under `public/media/` — `brand`, `home`, `menu`, `events`,
   `catering`, `careers`, or `video`.
2. Update the one entry in [`src/content/assets.ts`](../src/content/assets.ts): set `path`, the real
   `width`/`height`, the `ratio`, a `focal` point, honest `alt` text, and change `status` to
   `final`. (If the new file has the same name and dimensions as the old one, there is nothing to
   change at all.)
3. Run `npm run assets:check`. It verifies the dimensions against the actual pixels, the file
   weight, the alt text, and that nothing has been orphaned.
4. Run `npm run dev`, look at the affected pages, then build and deploy.

### Regenerating media

```bash
npm run assets:fetch                       # re-pull the current-site reference media
npx tsx scripts/generate-brand-assets.ts   # regenerate the paper-grain texture
```

Frames used as temporary media were extracted from the restaurant's own brand reel with ffmpeg,
for example:

```bash
ffmpeg -ss 2.0 -i media-originals/hero-loop.mp4 -frames:v 1 -vf "scale=720:-2" -q:v 6 public/media/home/hero-poster.jpg
```

Untouched masters live in `media-originals/`, which is git-ignored and never served.
