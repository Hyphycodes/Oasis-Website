# The event visual system

How an event looks on this website: where the pictures come from, what each one is for, what the
rules are, and how to change any of it without touching code.

---

## The rule everything else obeys

**The official flyer is the event's artwork. Website art is secondary and never replaces it.**

| | Official flyer | Website key art |
|---|---|---|
| Whose it is | The restaurant's / the promoter's | The website's |
| What it is | The image the event was actually promoted with | Atmosphere behind the type |
| How it's shown | Whole. `object-fit: contain`, always | Cropped freely, `cover` |
| Can a sync overwrite it | No — write-once, only into an empty slot | n/a |
| Can an upload overwrite it | Only via a second, explicit "Replace the official flyer" | Yes, freely |
| Can it be cleared | No | Yes |

A flyer prints its own name, date, price and age line around its edges. Cropping it throws that
information away, so it is never cropped anywhere on the site. The enforcement points are listed in
`docs/events-system.md`.

---

## The two sources of website art

### 1. Higgsfield — cinematic photography

Five key-art frames were generated with the Higgsfield MCP (`generate_image_batch`, model
`gpt_image_2`, 16:9, 2688×1520). They are photographic where the shipped compositions are
graphic, and they are the better artwork.

**They are not in this repository.** The build environment's egress proxy refuses Higgsfield's
asset CDN:

```
$ curl https://d8j0ntlcm91z4.cloudfront.net/...
curl: (56) CONNECT tunnel failed, response 403
```

The images exist and are finished — they are in the account's own Higgsfield library. Getting the
pixels into the repo from here would have meant hand-relaying about 340 KB of base64 through a
chat transcript, which was attempted once and produced a file of the correct length that was
visually corrupted. Shipping a corrupted image would have been worse than shipping none.

**To put them on the site** (about a minute each, no code): open the URL, save the PNG, then
Admin → Events → the event → **Pictures** → *Website key art*. Uploading there does not touch the
flyer.

| Event | Generation id | Download |
|---|---|---|
| Scream Paint & Sip | `3c42bcbe-8428-4381-b4b9-f087d3bf5f83` | `…/hf_20260910_180537_3c42bcbe-8428-4381-b4b9-f087d3bf5f83.png` |
| Snoopy Paint & Sip Night | `9534e7b6-7480-4761-bbc3-8a4f9c910c8b` | `…/hf_20260910_180537_9534e7b6-7480-4761-bbc3-8a4f9c910c8b.png` |
| Junior H Paint & Sip | `a85e6538-d65f-4879-8c70-9f5728090e5d` | `…/hf_20260910_180537_a85e6538-d65f-4879-8c70-9f5728090e5d.png` |
| Oasis Fridays | `9782f1a6-2540-4cde-a4ef-e544e90afb4d` | `…/hf_20260910_180537_9782f1a6-2540-4cde-a4ef-e544e90afb4d.png` |
| Oasis Latin Saturdays | `6c25e002-7d9b-46bc-a5ba-fd7cb586eaec` | `…/hf_20260910_180537_6c25e002-7d9b-46bc-a5ba-fd7cb586eaec.png` |

Base: `https://d8j0ntlcm91z4.cloudfront.net/user_39tnLWld3uPWKBWqBiWWZ0QWDWR/`

They are also listed under Generations in the Higgsfield app, newest first.

#### What was asked for, and what was deliberately not

Every prompt is an **environment in the event's palette** — a lit room, a bar, a dance floor —
composed with empty space in the lower left for the headline. Every one ends with the same
negatives:

> `NO text, NO words, NO lettering, NO logos, NO people, NO faces, NO brand marks.`

- **No copy in the picture.** The name, date, time and price are HTML text on top. Type baked into
  an image cannot be selected, translated, read by a screen reader, corrected when a time changes,
  or re-cropped for a phone.
- **No characters.** Snoopy, Ghostface, Michael Myers, Chucky, Hello Kitty and the rest are other
  people's copyrights. The flyers may show them because the promoter licensed them; the website's
  own generated art must not. So the Scream frame is *a dark studio with a landline off the hook*,
  and the Snoopy frame is *a warm pastel studio* — the mood of the night without the character.
- **No invented sponsors.** No logos, no brand marks, no fake partner walls.
- **No recognisable faces.** Silhouettes and motion blur only.

Full prompt text is stored with each generation in Higgsfield.

### 2. Shipped compositions — what the site uses today

`scripts/generate-event-art.ts` renders every file in `public/events/` from code. This is what is
on the site right now, and the fallback for any event with no uploaded key art.

```bash
npx tsx scripts/generate-event-art.ts
```

Deterministic: same seed, same bytes, so the art is reviewable in a diff like any other source, and
regenerating never produces a surprise.

**How a frame is built** — the way a photograph of a lit room is built, in this order:

1. **Ground** — a vertical gradient from the event's colour lifted toward its accent, down to near
   black.
2. **Key** — a radial glow at the light source, placed off-centre from the seed.
3. **Back wall** — the plane the silhouettes stand against, so the frame has depth rather than fog.
4. **Silhouette** — the motif, in near-black. A shape only reads as a silhouette if it is darker
   than what is behind it.
5. **Haze** — soft elliptical bands, in front of the silhouette, so the air reads as nearer.
6. **Bokeh** — 54 defocused discs, bright at the rim. This is the layer that makes a dark frame
   read as a photograph instead of a gradient.
7. **Floor**, then **vignette**.
8. **Light**, rendered as a separate layer and blurred by a twentieth of the frame width before
   being composited with `screen`. A gradient polygon reads as a shape; the same polygon softened
   until no edge survives reads as air with light in it.
9. **Grain**, a real noise raster composited with `overlay` — a thousand SVG circles would be a
   megabyte of markup and would band under WebP.

**Motifs**

| Motif | What it is | Used by |
|---|---|---|
| `easels` | Canvases on easels receding in one-point perspective | Paint & Sip nights |
| `lanterns` | Hanging bulbs on drop cords | Fridays |
| `palms` | Filled, fringed fronds on a drooping spine | Latin Saturdays |
| `papel` | Papel picado, cuts punched as a real mask so light comes through | Celebrations |
| `arches` | A Moorish arcade — one dark wall with lit openings cut out of it | Comedy |
| `curtain` | A parted stage curtain | Nightlife |

**Presets** are the seven named colours in `src/content/event-presentation.ts`. The art and the
card's accent read from the same table, so they match by construction rather than by memory.

---

## The files

| | Wide | Upright |
|---|---|---|
| Size | 1600 × 900 | 900 × 1125 |
| Used for | Cards, page headers, hero takeovers | Phones, and any frame taller than it is wide |
| Format | WebP, quality 72 | WebP, quality 70 |

`public/events/<slug>.webp` and `public/events/<slug>-tall.webp`.

**16 files, 200 KB in total** — every event's artwork costs less than a single ordinary hero
photograph. Uploaded art (flyers, and any key art added through the admin) is served through the
existing asset pipeline and is not part of this budget.

`src/content/event-art-defaults.ts` maps a slug to its shipped files. An event with no uploaded key
art picks up the file named after its slug automatically; `generic-nightlife`,
`generic-celebration` and `generic-comedy` are spares any future event can be pointed at.

---

## How it is delivered

`EventArt` (`src/components/events/EventArt.tsx`) composes the layers and `event-art.css` styles
them. Decisions worth knowing:

- **A plain `<picture>`, not `next/image`,** for the backdrop. These are decorative files already
  shipped at their final size, and `<picture>` is the only way to art-direct a different *crop*
  without downloading both files.
- **The upright crop is chosen by the shape of the frame, not the width of the screen.** In the
  homepage's lead card the artwork is as tall as the column beside it, so on a 1440px display that
  frame is portrait too. Feeding a 16:9 file to a portrait frame throws away most of the
  composition.
- **Everything below the fold is `loading="lazy"` and `fetchPriority="low"`.** Only a live hero
  takeover is eager.
- **No WebGL, no canvas, no animation library.** The art is static files; the only motion is CSS,
  and all of it is inside `prefers-reduced-motion` guards.
- **Decorative layers are `aria-hidden` and `pointer-events: none`.** The foreground layer is the
  one thing allowed to lean outside its card, and it never intercepts a tap.
- **Every fact is HTML text.** Nothing a guest needs — name, date, time, price, sold out — exists
  only inside a picture.
- **Nothing ever crops the flyer.** Where key art is present the flyer becomes an upright card in
  the corner, lit and complete; where it is absent the flyer *is* the composition.
- **No artwork at all** is still a designed object: the event's name set as poster type in its own
  accent, ruled top and bottom. That is what a card looks like the day an event is announced and
  before the flyer arrives, which is a normal day.

---

## Changing any of it, without code

Admin → Events → the event → **Pictures**.

| Slot | Meaning |
|---|---|
| **Official flyer** | The real flyer. Marked *Official*, framed in amber, protected. |
| Website key art | Wide background. Replaces the shipped composition for this event. |
| Website key art (phone) | Upright crop. |
| Foreground | Optional cut-out that leans out of the frame. |

**How this event looks** on the same screen sets the colour preset, which retints the shipped
composition, the accent, the glow and the buttons together.

## Adding a shipped composition for a new event

Add one line to `EVENTS` in `scripts/generate-event-art.ts` — slug, preset, motif, seed — and
re-run it. The site finds the files by slug; nothing else needs editing.
