# /events — the entertainment calendar

What a guest sees when they want to know what is on, and the decisions behind it.

---

## The shape of the page

| | Section | Why it is there |
|---|---|---|
| 1 | Intro | One line about what a night here is. Admin-editable copy. |
| 2 | Filter | Only when there is more than one kind of night on. |
| 3 | Next up | The soonest event, its flyer beside the facts. |
| 4 | The calendar | Every special event, in date order, grouped by month. |
| 5 | October | The restaurant's biggest month, as its own dark room. |
| 6 | Every week | Fridays and Latin Saturdays, once each, linking to their own pages. |
| 7 | Reserve | The kitchen is open before the music starts. |

Past events disappear on their own. Everything comes from `buildCalendar` →
`getUpcomingEvents` → `ineligibleReason`, which drops anything already finished, unpublished,
archived, paused or cancelled. There is no archive to prune and no date anyone has to remember to
change.

---

## The one decision worth explaining

**The calendar is the special events. The weekly nights are a fixture.**

Oasis Fridays and Oasis Latin Saturdays are generated from a cadence, not entered by hand. Listing
them as dated rows produces around ninety near-identical lines running into next spring — a wall
nobody reads, made of dates nobody has confirmed. That list was removed from this page once
before, for exactly that reason.

So:

- a recurring night appears **once**, in *Every week*, with its next date and a link to its own
  page, where its real schedule lives;
- the month-by-month calendar carries the events that actually differ from one another;
- a line under the lead — *"Plus Oasis Fridays and Oasis Latin Saturdays every week"* — makes sure
  a short calendar never implies the place is dark.

Both are on. Only one of them is news.

---

## Hierarchy

Three sizes, because a calendar where every night is a large card is a calendar with no opinion.

| Component | Where | What it carries |
|---|---|---|
| `EventBanner` | Next up | The flyer beside the facts: name at display size, long date, time range, summary, ticket button, price, venue |
| `EventCard` | October | Art on top, name, date, two-line summary, ticket link, price |
| `EventRow` | Every other month | Date block, thumbnail, name, one-line summary, status, price, ticket button |

`EventRow` sets the date as its own block on the left, the way a calendar reads, so the column
scans as dates first and names second.

---

## The filter

Plain links to `/events?kind=paint-sip`, not a JavaScript widget.

Filtering is a navigation: the result is a different set of events and it deserves a URL somebody
can send to a friend. It costs the page no JavaScript, it works before and after hydration, and it
is a `<nav>` with `aria-current` on the active chip.

Two rules keep it from being noise:

- **A filter that would show nothing is not offered.** We know in advance that it is empty; an
  empty result is a dead end a guest has to back out of.
- **Fewer than two kinds of night on the calendar is not a choice.** The whole control disappears.

Each chip carries its own count.

The trade-off: reading a search parameter makes the page render per request rather than being
served from the static cache. The underlying content read is still cached (`revalidate = 300`), so
what is paid is the render, not the data.

---

## Event pages

`/events/<slug>` serves two different things, and tries them in that order:

1. **A recurring series** — `oasis-fridays`, `oasis-latin-saturdays`. Its own page shape: the
   series flyer, its next date, and its next six confirmed nights.
2. **A standalone event** — `scream-paint-sip` and everything imported from Tickeri. Rendered by
   `EventDetail`.

A standalone event page carries, in this order: key art with the name over it; a cancellation
notice if there is one, before anything that could read as an invitation; the description; date,
time, entry, age and where, as a definition list; the ticket button pointing at that event's own
Tickeri URL; add to calendar; and **the official flyer, whole**, captioned so nobody has to
reconcile a printed date against a live one.

**A standalone event page is deliberately not filtered through `getUpcomingEvents`.** A cancelled
event, and one that finished an hour ago, still resolves. Someone holding a ticket arrives on that
page to find out what happened, and a 404 is the worst possible answer. Drafts and archived events
stay unreachable.

### Share and search

- `generateMetadata` builds a real title and description per event, and sets the **event's own key
  art** — falling back to its flyer — as the absolute Open Graph and Twitter image, so a shared
  link shows the event and not the restaurant's house photograph.
- `generateStaticParams` pre-renders both the series slugs and the seeded standalone slugs.
- Every event listed on `/events` and every event page emits schema.org `Event` structured data.
  The listing deduplicates first: the lead appears twice on the page, and search engines should
  see it once.

---

## What is admin-editable, and what is not

| Thing | Where |
|---|---|
| The intro eyebrow, heading and body | Admin → Website → Events |
| Which event leads the page | Admin → Events → the event → *How this event looks* → Featured / Hero takeover |
| The order of two same-day events | the same card, *Priority* |
| Which filter chip an event answers to | the same card, *Kind of event* |
| Its colour | the same card, seven named presets |
| Its artwork | the event's *Pictures* card |
| The month headings, the October section, the hierarchy | code — they follow from the data |

The intro copy lives in the CMS with a static fallback in `src/content/pages.ts`. **If the copy
was saved in the admin before this page became a full calendar, the saved copy still wins** — it is
supposed to. Edit it in Admin → Website → Events.

---

## Testing

`src/lib/event-calendar.test.ts` covers the rules, not the markup: date-ordered month grouping,
October flagged, the lead kept in its own month, filter counts taken from the unfiltered calendar,
a cancelled night left out, a recurring night collapsed to one entry and kept out of the month
list, and an empty calendar that is empty rather than broken.
