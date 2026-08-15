# Asset Manifest — Oasis Mexican Kitchen & Bar

Every media slot in the site, its source, and its replacement status.

The machine-readable source of truth is [`src/content/assets.ts`](../src/content/assets.ts); this is
the human-readable view plus the provenance record for temporary media. Geometry is verified
against the actual files by `npm run assets:check`, so the two cannot silently disagree.

- **Captured:** 2026-08-14
- **Method:** direct fetch of the Wix CDN original (transformation path stripped) plus frame
  extraction from the restaurant's own brand reel. Optimized locally with sharp/ffmpeg.
- **Production hotlinks nothing.** Remote URLs below are provenance only; the checker fails the
  build if `wixstatic.com` or `parastorage.com` appears anywhere in runtime code.

### Status legend

| Status | Meaning |
|---|---|
| `brand` | Brand mark. Replace only with an official export. |
| `final` | Generated locally and considered done. |
| `temp-wix` | Local copy of current-site media. Works, but is a second-generation encode. Replace with the original. |
| `placeholder` | No acceptable asset exists. Renders the branded neutral placeholder at exact slot geometry. |

---

## 1. Registered assets

| ID | File | Type | Dimensions | Ratio | Status |
|---|---|---|---|---|---|
| `brandLogo` | `brand/oasis-logo.png` | image | 1200 × 483 | 1200:483 | `brand` |
| `brandGrain` | `brand/paper-grain.png` | texture | 160 × 160 | 1:1 | `final` |
| `heroVideo` | `video/hero-loop.mp4` | video | 720 × 1280 | 9:16 | `temp-wix` |
| `heroPoster` | `home/hero-poster.jpg` | image | 720 × 1280 | 9:16 | `temp-wix` |
| `backBar` | `home/back-bar.jpg` | image | 1069 × 1600 | 1069:1600 | `temp-wix` |
| `exteriorSign` | `home/exterior-sign.jpg` | image | 720 × 540 | 4:3 | `temp-wix` |
| `diningRoom` | `home/dining-room.jpg` | image | 1143 × 1728 | 1143:1728 | `temp-wix` |
| `plateTorta` | `menu/plate-torta.jpg` | image | 720 × 900 | 4:5 | `temp-wix` |
| `roomAtmosphere` | `home/room-atmosphere.jpg` | image | 720 × 480 | 3:2 | `temp-wix` |
| `bartender` | `home/gallery-02.jpg` | image | 720 × 720 | 1:1 | `temp-wix` |
| `dishQuesabirria` | `menu/quesabirria.jpg` | image | 720 × 900 | 4:5 | `temp-wix` |
| `consommeDip` | `menu/consomme-dip.jpg` | image | 720 × 900 | 4:5 | `temp-wix` |
| `cocktailPour` | `menu/cocktail-pour.jpg` | image | 720 × 900 | 4:5 | `temp-wix` |
| `margaritaTajin` | `menu/margarita-tajin.jpg` | image | 720 × 720 | 1:1 | `temp-wix` |
| `roomCrowd` | `home/room-crowd.jpg` | image | 720 × 480 | 3:2 | `temp-wix` |
| `cocktailPair` | `menu/cocktail-pair.jpg` | image | 720 × 900 | 4:5 | `temp-wix` |
| `flyerFridays` | `events/oasis-fridays-flyer.jpg` | image | 1080 × 1080 | 1:1 | `final` |
| `flyerLatinSaturdays` | `events/oasis-latin-saturdays-flyer.jpg` | image | 1080 × 1080 | 1:1 | `final` |
| `privateEvents` | — | image | 1800 × 1200 | 3:2 | `placeholder` |
| `birthdayCelebration` | — | image | 1200 × 1500 | 4:5 | `placeholder` |
| `teamEnergy` | `careers/team-energy.jpg` | image | 720 × 480 | 3:2 | `temp-wix` |

**Totals:** 21 registered — 1 `brand`, 3 `final`, 15 `temp-wix`, 2 `placeholder`.

The two flyers are owner-supplied artwork, re-encoded from the original PNGs to
1080 × 1080 JPEG. Both are tagged `containsText: 'date'`, which bars them from the
authoritative `artworkAssetId` slot and requires a declared `flyerPrintedDate` on
the series so the printed date is always captioned. See
[`ASSET-HANDOFF.md`](./ASSET-HANDOFF.md) §4.

---

## 2. Provenance — temporary media

### Fetched from the Wix CDN

| Local file | Source | Retrieved |
|---|---|---|
| `brand/oasis-logo.png` | `static.wixstatic.com/media/75d74a_8a9adb90bedf4c779d3dc455bc1793cf~mv2.png` (3780 × 1523) | 2026-08-14 |
| `home/back-bar.jpg` | `static.wixstatic.com/media/75d74a_0ceee05515384b0b9ec2501681efd0b2~mv2.jpeg` | 2026-08-14 |
| `home/dining-room.jpg` | `static.wixstatic.com/media/75d74a_b8e2fa52eb7746fc8a0a306ffc98978d~mv2.jpeg` | 2026-08-14 |
| `video/hero-loop.mp4` | `video.wixstatic.com/video/75d74a_90dc1ee0e44347af94832b32fbc6709e/720p/mp4/file.mp4` | 2026-08-14 |

> **Two Wix filenames were misleading and are corrected here.**
> `…0ceee055…` is served as the homepage hero image but is actually a photograph of the **back
> bar**, not the storefront. `…b8e2fa52…` is named `OASIS_LUNCH_DEAL_REEL_mov.jpeg` but is a
> photograph of the **full dining room at service** — and it is the best image the restaurant
> currently has anywhere. Both are now named and alt-texted for what they show, not for what the
> file was called.

### Extracted from the brand reel

`heroVideo` is a 20-second vertical brand reel that turned out to cover several slots. These frames
are the restaurant's own footage, not stock:

| Local file | Timestamp | Shows |
|---|---|---|
| `home/hero-poster.jpg` | 2.0s | Taco boards carried through the room |
| `home/exterior-sign.jpg` | 0.6s | The exterior OASIS sign |
| `home/room-atmosphere.jpg` | 14.0s | Dining room, greenery wall, rattan pendants |
| `home/gallery-02.jpg` | 11.2s | Bartender holding a margarita |
| `menu/cocktail-pair.jpg` | 8.2s | A margarita being finished, Tajín rim |
| `menu/plate-torta.jpg` | 3.4s | A torta with rice and beans |
| `careers/team-energy.jpg` | 16.0s | A server carrying a tray of drinks |

Exact ffmpeg commands are in [`ASSET-HANDOFF.md`](./ASSET-HANDOFF.md) §7.

### Video re-encode

The source loop was **7.02 MB** with an unused AAC audio track. Re-encoded locally to **2.41 MB**
(H.264, CRF 30, audio stripped, `+faststart`), and the poster is a real frame rather than a colour
field. It plays muted, so the audio track was pure waste.

Untouched masters are kept in `media-originals/`, which is git-ignored and never served.

---

## 3. Known limitations

| Limitation | Consequence | Action |
|---|---|---|
| **No food photography of the three signature dishes** | The homepage signature section is typographic by design rather than photographic. | `ASSET-HANDOFF.md` §2 |
| **No nightlife photography** | The After Dark band and both event cards run branded placeholders. | `ASSET-HANDOFF.md` §3 |
| **Reel frames are 720px wide** | Fine for the slots they occupy (all render ≤ 500px wide at 1×), below target for anything larger. They are **not** upscaled to pass the checker. | Replace with originals |
| **The logo is raster, not vector** | Served at 2× the rendered size. Sharp today, but not future-proof. | `ASSET-HANDOFF.md` §1 |
| **Event flyers have dates baked in** | Which is why none are used. The registry would reject them: artwork tagged `containsText: 'date'` fails the build. | Request undated exports |
| **No mobile-specific video** | Not needed — the source is already 9:16, so it is the mobile orientation. | None |

---

## 4. What the checker enforces

`npm run assets:check` fails the build on:

- a registry entry pointing at a missing file
- dimensions or aspect ratio disagreeing with the actual pixels
- file weight over the entry's `maxBytes` budget
- a video with no poster, or a poster file that does not exist
- duplicate alt text across two assets
- a registered **file** that no component renders (dead weight)
- a file in `public/media/` that no registry entry claims (orphan)
- recurring-event artwork tagged `containsText: 'date'`
- any `wixstatic.com` / `parastorage.com` reference in runtime code

It warns (without failing) on reserved placeholder slots not yet placed in a page, and on assets
marked decorative, so both stay visible rather than being forgotten.
