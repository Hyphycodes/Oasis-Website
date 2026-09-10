# Events upgrade — release QA

What was checked before this went out, what was found, what was fixed, and what is
knowingly still open.

Checked against a **production build** (`next build` + `next start`) except where noted, in
headless Chromium, at four sizes: 1440×900 wide desktop, 1280×800 laptop, 834×1112 tablet,
390×844 iPhone.

---

## Verdict

Ready to release. Six defects were found and fixed during this pass; three of them were real
bugs a visitor or the owner would have hit.

---

## What was found and fixed

| # | Severity | Found | Fix |
|---|---|---|---|
| 1 | **Broken** | Clicking a special event in the admin bounced back to the list instead of opening it. The list links with the resolved id (`one-time:tickeri:…`), the editor looked up the stored row id (`tickeri:…`). | The editor accepts both shapes. This was the owner's main path into an event and it never worked. |
| 2 | **Broken** | `/events/<slug>` 404'd for every standalone event. The homepage had started linking to them. | The detail route resolves standalone events, not only series. |
| 3 | Correctness | The lead event appeared twice in one page's structured data, and React warned about duplicate keys. | The listing deduplicates by id before rendering artwork and JSON-LD. |
| 4 | Accessibility | Every event picture was a link with no accessible name — a screen reader announced "link" and nothing else, and each one was an extra tab stop that went where the title link already goes. | The picture links are `aria-hidden` and out of the tab order. The title link carries the name. |
| 5 | Performance | 112px thumbnails were downloading 1600px files, and the header wordmark fetched a 384px image for a 70px slot on every page of the site. | Small variants of every key-art frame plus a real `srcset`; the wordmark declares its actual size. |
| 6 | Content | The events page was still headed "Friday and Saturday go later" over what is now a full calendar. | New static copy. Note: **if the copy was already saved in the admin, the saved copy still wins** — that is correct, and it is editable at Admin → Website → Events. |

## Navigation

Every internal link on the site was crawled from `/` to exhaustion: **13 pages, all 200, no
404s, no redirect loops.** That includes the five event pages, which are pre-rendered at build.
`sitemap.xml` lists all 13.

## Performance

Production build, cold load, network idle, then the full page scrolled to trigger every lazy
image.

| | LCP | CLS | Images |
|---|---|---|---|
| Home | 144–220 ms | **0** | 156–190 KB |
| /events | 268–308 ms | **0** | 68–174 KB |
| Event page | 108–176 ms | **0** | 8–14 KB |
| Menu | 128–220 ms | **0** | 15–28 KB |

- **Cumulative layout shift is 0 on every page at every size.** Nothing moves after it paints.
- **No oversized images anywhere** — checked as "natural width more than 2.2× the CSS width at
  this device pixel ratio" across all sixteen page/size combinations.
- First Load JS: **103 KB shared**, 111–114 KB on the heaviest public page. The events work added
  no client JavaScript at all: the calendar, the filter and the artwork are server-rendered, and
  the filter is plain links.
- All sixteen shipped key-art files together are **235 KB**, and each event's artwork is served at
  the size the slot actually needs.

Measured on a local loopback, so these are render times, not field times — treat them as a
comparison between pages rather than as what a phone on a bad connection will see. The things that
do carry over are CLS, the byte counts and the JS total.

## Accessibility

Across nine pages at desktop and phone: one `h1` per page, no heading-level jumps, `lang` and
`title` on every page, no image missing an `alt` attribute, and — after fix 4 — **no link or
button without an accessible name**.

- Decorative artwork is `alt=""`, and everything it would have conveyed (name, date, time, price,
  sold out) is real HTML text beside it.
- Sold out, free and postponed are **words with a border**, never a colour alone.
- Every ticket link says where it goes and that it opens in a new tab, in a screen-reader-only
  span.
- Primary controls are ≥44px. Inline links inside sentences and headings are smaller, which is the
  documented exception for links in a block of text.

Known and unchanged: the menu page's in-page category jump links are 20px tall. They pre-date this
work, they are inline text links, and they were left alone rather than restyled during an events
release.

## Event accuracy

**tickeri.com cannot be reached from this build environment** — its egress proxy answers 403 to the
domain, so the calendar could not be diffed against the source during this pass.

What could be verified, was:

| Event | Date on the site | Tickeri id | Ticket URL |
|---|---|---|---|
| Snoopy Paint & Sip Night | Thu 10 Sep 2026 | `82c16al40ueb` | matches its id |
| Junior H Paint & Sip | Thu 17 Sep 2026 | `nwn48quznb96` | matches its id |
| Scream Paint & Sip | Thu 8 Oct 2026 | `xvt4t4jbzvwf` | matches its id |

Each of the three was confirmed against its own Tickeri event page when it was seeded, and every
ticket link points at the event id it claims — a link cannot silently be pointing at a different
event.

**The rest of the calendar is not on the site yet, and this is the one thing to do after
deploying.** Admin → Events → **Check Tickeri now**. On Vercel the network is open and the sync
will bring in the remaining events with their real dates, prices, sold-out states and flyers. No
date was invented here: putting a wrong date on a restaurant's website is the defect this whole
system exists to prevent.

## Admin usability

Signed in as the owner and walked the eight tasks a non-technical person has to be able to do.
All eight are on one screen per event, in plain language, with no CSS, no colour pickers and no
ids.

| | Task | Where |
|---|---|---|
| 1 | Create an event | Events → **Add an event** |
| 2 | Upload the flyer or key art | the event → **Pictures** |
| 3 | Add the Tickeri URL | **Ticket link** |
| 4 | Feature it | **How this event looks** → Featured |
| 5 | Mark it sold out | **Is it on sale?** → Sold out |
| 6 | Schedule a hero takeover | **Hero takeover**, with dates |
| 7 | Preview | **Preview**, top right |
| 8 | Publish | **Save changes** / **Save as a draft** |

The Pictures card states the rule in the interface itself: *"The official flyer is this event's
real artwork and the website always shows it. Everything else is extra art… adding it never
changes or replaces the flyer."* The flyer slot is badged **OFFICIAL**, framed differently, cannot
be cleared, and needs a second deliberate action to replace.

## Tests

**230 tests across 14 files, all passing.** `npm run lint` and `tsc --noEmit` are clean.
The events rules are covered by pure unit tests rather than by rendering: homepage selection (7),
calendar shape (9), Tickeri parsing (13), plus the existing events and workflow suites.

---

## Open items, honestly

1. **Run the Tickeri sync after deploying.** The calendar is three events until it is run. See
   *Event accuracy* above.
2. **Two migrations must be applied** to the live Supabase project: `0004_site_themes.sql` and
   `0005_event_presentation.sql`. Until then the new columns are absent, every event reads with
   its defaults, and the site works but cannot be dressed up.
3. **The five Higgsfield frames are not in the repository.** They exist in the account's own
   Higgsfield library; the CDN is blocked from this build environment. Their ids and URLs are in
   `docs/event-visual-system.md`, and uploading one takes about a minute through the admin. Until
   then each event shows its generated composition, which is what is on the site now.
4. **October is one event.** The section is built, tested and renders correctly; it fills up when
   the sync brings in the rest of the month.
5. `/events` renders per request because it reads the filter from the URL. The content read behind
   it is still cached for five minutes, so what is paid is the render, not the data.
