# Asset Slot Specifications

One row per media slot in the site. `npm run assets:check` enforces the geometry columns against
the actual files, so this document and the code cannot drift apart.

**Reading the columns**

- **Ratio** — enforced. A file whose pixels disagree with its registered ratio fails the build.
- **Min size** — the smallest file that will look right at 2× on the largest screen the slot
  renders on. Smaller files are accepted but flagged; they are never upscaled to pass.
- **Focal** — CSS `object-position`. This is what protects the subject when the slot crops
  differently at another breakpoint.
- **Safe area** — the region that must survive every crop.
- **Text in image** — `none` means the picture must carry no words. `brand` means the Oasis mark
  may appear. `date` is **forbidden on event artwork** and fails the build.

---

## Brand

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `brandLogo` | 1200:483 | 1200 × 483 | centre | full mark | `brand` | Rendered 70–80px wide. Vector preferred — see `ASSET-HANDOFF.md` §1. |
| `brandGrain` | 1:1 | 160 × 160 | — | — | `none` | Tiling texture, ≤ 14KB, drawn at 3% opacity over sand. Generated, not photographed. |

## Home

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `heroVideo` | 9:16 | 1080 × 1920 | 50% 50% | centre 70% | `brand` | Muted, looping, inline, no chrome. Max 3 MB. Audio must be stripped — it never plays. |
| `heroPoster` | 9:16 | 1080 × 1920 | 50% 50% | centre 70% | `brand` | Required. Painted before the video decodes, **and** it is the entire hero under reduced motion or Save-Data. Must be a strong frame on its own. |
| `plateTorta` | 4:5 | 1200 × 1500 | 50% 50% | plate rim | `none` | Homepage "Eat" cell. Crops to 2:3 above 1024px — keep the plate off the top and bottom eighths. |
| `cocktailPair` | 4:5 | 1200 × 1500 | 50% 50% | glass + rim | `none` | Homepage "Drink" cell and `/menu/cocktails`. |
| `roomAtmosphere` | 3:2 | 1800 × 1200 | 50% 50% | centre 80% | `brand` | Homepage "Stay out" cell. |
| `bartender` | 1:1 | 1200 × 1200 | 50% 40% | **head to waist** | `none` | Bar & brunch section. Focal is above centre so the crop never cuts through the eye line. |
| `diningRoom` | 1143:1728 | 1200 × 1800 | 50% 55% | seated guests | `brand` | Gallery lead. Portrait. |
| `backBar` | 1069:1600 | 1200 × 1800 | 50% 45% | bottle shelves | `none` | Gallery + `/menu/cocktails` aside. |
| `exteriorSign` | 4:3 | 1200 × 900 | 50% 50% | **whole sign** | `brand` | Gallery + `/visit`. The sign must never be clipped — it is the wayfinding cue. |

## Menu

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `brunchTable` | 4:5 | 1200 × 1500 | 50% 45% | plates | `none` | **Reserved.** Placed on `/menu/brunch` once a brunch menu exists. |

## Events

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `eventFridays` | 4:5 | 1200 × 1500 | 50% 45% | **avoid top-left 30%** | `none` 🚨 | The live date chip overlays the top-left corner. Artwork tagged `date` fails the build. |
| `eventLatinSaturdays` | 4:5 | 1200 × 1500 | 50% 45% | **avoid top-left 30%** | `none` 🚨 | Same. |
| `nightlifeCrowd` | 3:2 | 1800 × 1200 | 50% 40% | faces | `none` | **Reserved** for the After Dark band. Needs a genuine late-night frame; a daytime room shot would misrepresent it. |

## Catering & private events

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `cateringSpread` | 3:2 | 1800 × 1200 | 50% 50% | full spread | `none` | **Reserved** for the `/catering` header. |
| `cateringTray` | 1:1 | 1200 × 1200 | 50% 50% | tray edges | `none` | **Reserved** for package cards. |
| `privateEvents` | 3:2 | 1800 × 1200 | 50% 42% | table + guests | `none` | Homepage catering promo. |
| `birthdayCelebration` | 4:5 | 1200 × 1500 | 50% 40% | **faces + dessert** | `none` | `/private-events`. Focal above centre — this shot will have people in it. |

## Careers

| Slot | Ratio | Min size | Focal | Safe area | Text | Notes |
|---|---|---|---|---|---|---|
| `teamEnergy` | 3:2 | 1800 × 1200 | 50% 50% | the team | `brand` | `/careers` header aside. |

---

## Rules that apply to every slot

1. **Never upscale to pass the checker.** If the only available file is too small for a large
   placement, leave the slot as a placeholder. A branded empty field looks intentional; a blurry
   stretched photo looks broken.
2. **Never distort.** Crop to the ratio; do not squash to it.
3. **Faces are never cropped through the eye line.** That is what `focal` above 50% is for.
4. **Food is never cropped through the plate rim.**
5. **Decorative images carry `alt: null`**, which renders `alt=""` plus `aria-hidden`. This is a
   per-slot decision recorded in the registry, not a default.
6. **Two assets may not share alt text** — the checker treats duplicates as an error, because
   identical descriptions mean at least one of them is wrong.
7. **Video is muted, looping, inline, poster-backed, and has no player chrome.** It does not load
   at all under `prefers-reduced-motion`, under Save-Data, or on a 2G connection.
8. **File weight budgets are per-slot** (`maxBytes` in the registry) and enforced.

## Placeholder behaviour

A slot with no acceptable asset renders `<Placeholder>` — a flat field in the surrounding surface's
colour with the Oasis mark at 6–8% opacity, at the **exact registered aspect ratio**.

That last part is the point: layout is final before the photography exists, so dropping a real
image in later causes zero reflow and needs no design revisit.
