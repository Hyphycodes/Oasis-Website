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
| Event has a flyer, no key art | The flyer is shown. It is always shown whole, never cropped. |
| Admin adds key art | The card gains a wider background. The flyer is untouched and still shown. |
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

Three events were verified against their own Tickeri event pages and are seeded in
`src/content/events.ts`, so they work with no database at all:

| Event | Date | Tickeri id |
|---|---|---|
| Snoopy Paint & Sip Night | 10 Sep 2026 | `82c16al40ueb` |
| Junior H Paint & Sip | 17 Sep 2026 | `nwn48quznb96` |
| Scream Paint & Sip | 8 Oct 2026 | `xvt4t4jbzvwf` |

**The rest of the calendar arrives by pressing "Check Tickeri now" on the deployed site.** It was
not seeded by hand because this build environment cannot reach tickeri.com — its egress proxy
refuses the domain — and inventing dates for events like Michael Myers Paint & Brunch, Selena,
Thriller or Día de los Muertos would have put wrong dates on a restaurant's website. The import
path is built, tested and documented instead; on Vercel it has ordinary outbound network access
and will bring the full calendar in, flyers included.

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
