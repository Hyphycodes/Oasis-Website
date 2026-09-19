# Events at Oasis — the system

Events are a first-class thing this website owns. Tickeri sells the tickets; Oasis owns how an
event is found, described and presented. This document covers the data model, the admin, and how
the calendar is kept in step with Tickeri.

---

## The one rule that shapes everything

**The official flyer is the event's artwork, and nothing may take it away.**

Every event has a `flyer` slot holding the real flyer it was promoted with. Website key art —
wide backgrounds, phone crops, cut-out foreground layers — lives in *separate* slots and is
secondary. Consequences, all enforced in code rather than by convention:

| Situation | What happens |
|---|---|
| Event has a flyer | **The flyer is the artwork.** It is the subject of every card, shown large and whole, never cropped. |
| Admin adds key art | The key art drops BEHIND the flyer, blurred, as atmosphere. The flyer is untouched and still the subject. |
| Event has key art and no flyer | The key art carries the card by itself. |
| A flyer ships in the repo for this slug | It fills an EMPTY flyer slot only. An uploaded or imported flyer always wins. |
| Tickeri sync runs and the flyer slot is empty | The official flyer is downloaded into it, once. |
| Tickeri sync runs and a flyer already exists | Nothing. A sync will never replace a flyer. |
| Admin uploads to the flyer slot on an event that has one | Refused, until they press "Replace the official flyer" — a second, deliberate action. |
| Admin tries to clear the flyer | Refused. It can be replaced, never emptied. |
| Editing a date, price or ticket link | The artwork columns are not in the patch at all. |

Where it lives: `src/content/event-presentation.ts` (`ART_SLOT_SPEC[...].official`),
`src/server/actions/event-presentation.ts` (the guard), `src/server/events/reconcile.ts` (the
write-once import).

---

## The data model

The existing shape is unchanged, because it is the right one:

- **`event_series`** — a recurring night. Carries **no date**. Fridays and Latin Saturdays are
  series; their dates are generated from `cadence` at read time, so a recurring event *cannot*
  display a stale date. (`PLAN.md` §4.1.)
- **`event_occurrences`** — a dated row. Two jobs: an override that makes one night of a series
  different, and, with `series_slug = null`, a **standalone event**. Every Tickeri event is one of
  these.

Migration `0005_event_presentation.sql` adds presentation and import columns to both tables:

```
category            nightlife | paint-sip | brunch | comedy | special
price_text          what entry costs, in words
key_art_asset_id            ← website art. NOT the flyer.
key_art_mobile_asset_id     ← website art
foreground_asset_id         ← website art
visual_preset       marigold | bone | blood | candy | neon | midnight | gold
featured            boolean
priority            tie-break inside a treatment, higher wins
treatment           standard | featured | takeover
takeover_start_at   } required when treatment = 'takeover', and end > start,
takeover_end_at     } checked by the database, so a takeover can never get stuck on

-- event_occurrences only
source              manual | tickeri
source_event_id     Tickeri's own id — the reconcile key, uniquely indexed
source_url
synced_at
```

`flyer_asset_id` already existed and this migration does not touch it.

### How presentation resolves

Occurrence over series over defaults, field by field
(`mergePresentation` in `src/lib/events.ts`). Featuring one Friday does not require restating what
that night inherits, and does not feature every other Friday. A series-level feature *does* reach
every night, because the series value is the base.

### Types

`EventPresentation` and `EventProvenance` in `src/content/types.ts`; the vocabulary
(categories, presets, treatments, artwork slots) in `src/content/event-presentation.ts`, declared
once and shared by the database, the admin, the public pages and the artwork script.

---

## The admin

**Admin → Events.**

| Screen | Does |
|---|---|
| `/admin/events` | Everything upcoming, the special events list, drafts, cancelled nights, and the Tickeri check |
| `/admin/events/one/<id>` | One special event: its facts, how it looks, its pictures |
| `/admin/events/<slug>` | A recurring series and its individual nights |

A special event's screen is three cards in the order a person fills them in:

1. **The event** — name, date, doors, finish, short line, description, ticket link, on-sale state
   (on sale / sold out / free / postponed / cancelled), minimum age, venue. Publish or save as a
   draft.
2. **How this event looks** — kind of event, what it costs in words, a colour from seven named
   presets, and how big on the homepage (Standard / Featured / Hero takeover, with a takeover
   window in restaurant time). No CSS, no colour pickers, no numbers except a same-day tie-break.
3. **Pictures** — four slots. The official flyer is marked *Official*, framed differently, and
   protected as described above. The other three are optional website art.

Everything obeys the existing permission model: a Contributor sees the screens and cannot publish.

### The eight things a non-technical person can do

1. **Create an event** — Events → Add an event.
2. **Upload flyer / key art** — the event's Pictures card.
3. **Add the Tickeri URL** — Ticket link on the facts card.
4. **Feature it** — How this event looks → Featured.
5. **Mark sold out** — facts card → Is it on sale? → Sold out.
6. **Schedule a hero takeover** — How this event looks → Hero takeover, with dates.
7. **Preview** — the Preview button, top right of the event.
8. **Publish** — Save changes (or Save as a draft).

---

## The homepage

A visitor should learn two things immediately: Oasis is a modern Mexican restaurant, and there is
always something on. The homepage says the second thing in three places.

**Navigation.** `Events` is the second item in the primary nav on desktop and in the mobile
drawer. It is a plain link, like every other nav item.

**The hero.** The action hierarchy is Reserve a table (primary) → Explore events (strong
secondary) → Order online (tertiary, a text link). Above the headline is one quiet line of place,
and nothing else. A live NEXT UP pill sat there and made the hero busy: it competed with the
headline for the first thing the eye hit, and repeated what the What's on section says a screen
below. The calendar lives further down the page, behind *Explore events*.

**What's on.** The next three things on, in date order. The lead takes its own row — its flyer
beside the facts — and the two after it sit side by side beneath. Not three equal cards, because a
headliner and two ordinary nights are not equally loud; and not a promoted card out of sequence,
because a calendar out of order is simply wrong. An "All events" link sits in the section header.

Which events appear is decided by `selectHomepageEvents` in `src/lib/event-feature.ts` — pure, and
covered by seven tests:

| Rule | Behaviour |
|---|---|
| Lead | The **soonest** event |
| Supporting | The next two after it, in date order |
| Order | Strictly chronological. `featured` and `priority` separate two events starting at the same moment and decide nothing else |
| Takeover | Promoted in the hero, on its schedule. It does not jump the calendar below |
| Cancelled | Never advertised anywhere on the homepage; still listed on `/events` |

**Why it is strictly chronological.** The module used to lead with whatever was
most promoted, which put a featured October event above two nights happening
that week — three cards reading October, September, September. A guest reads a
row of events as a sequence in time, and being wrong about that costs more than
any promotion is worth. Promoting an event *above* the calendar is what a hero
takeover is for, and that has its own scheduled window.

### Hero takeovers

An event with `treatment: 'takeover'` and a window containing right now lends the hero its **website
key art**, its title and its summary, and puts its ticket button first. It never removes the
navigation, the Reserve action, the Explore events action or the restaurant's identity, and it
reverts on its own the moment the window ends — there is nothing to remember and nothing to undo.

The takeover borrows key art only. The official flyer is *not* stretched across a 16:9 hero; it
belongs to the event's own card and page, where it is shown whole.

### Global look versus event look

The seasonal theme owns the **global** environment: plum, near-black, candle glow, marigolds,
papel picado, antique gold. An individual event's colour comes from its own preset and is scoped
to that event's card, its detail page and — during a takeover only — the hero. A character or theme
belonging to one event never leaks into the food, catering or location sections.

---

## Reconciliation with Tickeri

**Admin → Events → "Check Tickeri now".**

It reads the organizer page at
`https://www.tickeri.com/organizations/chsxwyl/oasis-events` and each event page it links to,
takes the schema.org `Event` data those pages publish, and writes rows Oasis owns.

Rules, all deliberate:

- **Never during a page render.** The public events page always renders from our own rows. If
  Tickeri is down, the website does not notice. The sync is a button a person presses.
- **It refuses to guess.** A page with no machine-readable event data is reported as unreadable.
  It will not infer a date from prose. A wrong date is the defect this codebase exists to prevent.
- **Match, don't duplicate.** Rows carry `source_event_id`; running it twice updates.
- **Facts are theirs, presentation is ours.** A sync may correct the name, date, finish time,
  description, venue, price, sold-out state and ticket link. It never touches category, colour,
  featured, priority, treatment or the takeover window.
- **The flyer is write-once**, as above.
- **Nothing is deleted.** An event Tickeri has stopped listing is *reported*, so a person decides.
  A transient Tickeri outage can never empty the events page.
- New events land as drafts unless the admin ticks "Put new events straight on the website".

The parser is `src/server/events/tickeri.ts` (pure, 13 tests over saved fixtures); the writer is
`src/server/events/reconcile.ts`; the action is `syncTickeri`.

### What is currently imported

The whole published calendar is seeded in `src/content/events.ts` and applied to the database by
`supabase/migrations/0019_tickeri_calendar_correction.sql` — 23 nights from 19 September to
12 November 2026, each keyed to its Tickeri id, with its official flyer already in the repo under
`public/events/imported/<tickeri id>.jpg` and indexed by `src/content/imported-flyers.json`.

Five of those nights are inserted as **drafts** (`published = false`, `ticketing_enabled = false`):
El Alfa (2 Oct), Bad Bunny (4 Oct), Drake (11 Oct) and the two extra Hello Kitty Halloween seatings
(27 Sep, 15 Oct). Their flyers, titles, times and ticket links are known; their tier prices are not,
so their button sends the guest to Tickeri and a staff member publishes once they have checked the
detail. Everything else is published with the prices migration 0013 read off Tickeri.

Keeping it current afterwards is still **"Check Tickeri now"** on the deployed site, which reads the
organizer page directly. This build environment cannot reach tickeri.com — its egress proxy refuses
the domain — so nothing here is read live from a sandbox; the calendar above comes from the capture
already committed to the repo, cross-checked against the times each event states in its own
description.

### A wrong start time takes the photo away, silently

This is the trap worth knowing about, because the page that suffers it does not look broken.

`importedFlyer()` in `src/server/content/event-art.ts` will only show an event's official flyer when
the start instant recorded beside that flyer **exactly** equals the event's own start. That is
deliberate: artwork printed with a date must not outlive a reschedule. The side effect is that a
start time which is merely an hour out does not surface as an error — the event still lists, still
sells, and simply renders with no photograph, with nothing saying why.

Ten events were in exactly that state before 0019: every brunch read 12:00 instead of 11:00 and both
late nights read 22:00 instead of 21:00, so ten event pages had quietly lost their flyers. Six of
those ten state their own time in their own description ("Saturday, September 19th at 11AM",
"from 11AM–4PM", "9PM – 2AM") and all six agreed with the flyer capture rather than with the table.

`src/lib/events.test.ts` now asserts that every seeded event resolves to the exact instant its flyer
was filed under, and names the event in the failure message. A start time cannot drift out of
agreement again without a test going red.

---

## Adding an event by hand

Events → **Add an event** → name, date, doors, finish, a picture, the ticket link → *Add to
website*. Then open it and set how it looks. Everything is editable afterwards; nothing has to be
right first time.

## Applying the migration

```bash
supabase db push     # or paste supabase/migrations/0005_event_presentation.sql into the SQL editor
```

Until it is applied, the new columns are absent and every event reads with its defaults — the site
works, it simply cannot be dressed up. The local development database applies it automatically.

---

## The event page (September 2026 rebuild)

`/events/<slug>` is **one band** — for a standalone event and for a weekly series alike. Everything
a guest needs in order to decide is inside it: name, when, the flyer, the price with a way to pay,
what to expect, and how to get here. Nothing is held back behind a scroll. Every fact still has
exactly one home:

| Fact | Home |
|---|---|
| Date, time, town | The facts row under the title, separated by thin rules |
| Price and sale state | The ticket box (and, on a phone, the sticky bar) |
| Age, music | The small row under the short description |
| Anything that needs a sentence | "What to expect", under the same title |
| Address, directions, calendar | "Getting here", at the foot of the words |

The old hero, the `DATE / TIME / ENTRY / AGE / WHERE` grid and the repeated title are gone, not
restyled — and so are the separate "What to expect" and "Getting here" bands that used to sit a
screen further down.

**The layout** is five blocks in two columns (`.event-grid` in `event-page.css`). The columns are
independent: each is sized by its own content, so a short description cannot open a hole under the
title and a long one cannot push the ticket box down the page. On a phone the two column wrappers
dissolve (`display: contents`) and the same five blocks stack in the order a guest reads them —
flyer, name and date, tickets, the detail, the address. With no flyer the words take a narrower
measure and the ticket box keeps its own column.

A series page uses the same grid: the artwork and every upcoming date on one side, what the night
is and when the next one runs on the other. Six weeks of dates sit in two columns on a desktop, so
the schedule is as tall as the flyer beside it rather than a screen of its own.

**The offer.** `src/server/ticketing/offer.ts` turns an event into a `TicketOffer`
(`src/lib/ticketing/offer.ts`): `external` (Tickeri), `free`, `door`, or — once in-house
ticketing is on — `tiers` with live availability. The ticket box, the sticky bar, the calendar tiles
and the JSON-LD all read the offer; none of them computes a price.

**Sold out** replaces the button with a waitlist. `POST /api/waitlist` writes to `waitlist`
(migration `0006`), public insert only, one row per email per event.

**Past, cancelled, postponed** events keep their page and open with one quiet sentence, then
what is coming up. There is never a broken buy button.

**Share cards.** A landscape flyer is the card. A square one is composed by
`app/(site)/events/[slug]/opengraph-image.tsx`: the flyer whole on the right, the name and date
on the brand surface.

**Sample data.** `npm run seed:events` writes two fake published events — one sold out through an
outside link, one free — to the local development database (or to Supabase when the service key is
set), so every state can be seen without touching real events.

**Decorations** on the event page live in one `aria-hidden` layer clipped to the section, at most
four, pinned to the section's own padding so none can sit under a word or inside the ticket box.
They stop moving on phones and under reduced motion.
