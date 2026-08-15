# Admin Guide

For the Oasis team. No technical knowledge assumed.

---

## Getting in

Go to **/admin**. There is no password on it at the moment — you go straight in, with full access.

That is deliberate while the site is being built, so you can use the admin without accounts being
set up first. **Before the website goes to a public address, ask your developer to turn sign-in back
on.** Until then, anyone who knows the address can change the website.

Everything needed for sign-in already exists — accounts, roles, the rules about who can publish —
it is only the gate that is switched off. Turning it on is one line
(`src/server/admin-access.ts`) or one environment variable (`ADMIN_REQUIRE_SIGN_IN=true`).

If you see *"The content system is not connected yet"*, the developer has not finished the setup.
The website is still working normally for guests; only editing is unavailable.

---

## Seeing your changes on the website

Two ways, on every screen:

- **View the website →** at the top right, and again at the bottom of every page.
- After you publish something, the message tells you exactly which pages changed and links to
  them — those open in a new tab, so the admin stays where you left it.

Individual sections also have their own preview: *Preview Food* on the menu, *View on the website*
on a section, *Preview the page* in Website.

---

## The six places you can go

| | What lives there |
|---|---|
| **Dashboard** | What needs your attention, what is on this week, what changed recently |
| **Menu** | Prices, sold-out, descriptions, sections, adding a dish |
| **Events** | Friday and Saturday nights, ticket links, one-off events |
| **Website** | The words and photographs on each page |
| **Photos** | Every picture, where each one is used, uploading new ones |
| **Settings** | Address, phone, hours, holidays, ordering and booking links, the banner |

Owners also see **Team & permissions**.

Enquiries — catering, celebrations and job applications — are reached from the Dashboard.

---

## Who can do what

While the admin is open, everyone has Owner access — there is no account to attach a role to. The
table below is what applies once sign-in is turned on.

| | Owner | Manager | Contributor |
|---|---|---|---|
| Edit anything and save a draft | ✅ | ✅ | ✅ |
| Publish a change to the website | ✅ | ✅ | ❌ |
| Take something off the website | ✅ | ✅ | ❌ |
| Put an earlier version back | ✅ | ✅ | ❌ |
| Upload a photo | ✅ | ✅ | ✅ |
| Change the restaurant details and hours | ✅ | ✅ | ❌ |
| Change staff accounts | ✅ | ❌ | ❌ |

A Contributor's work is never lost. It is saved as a draft and shows up on the Dashboard as
"waiting to be published", and a manager publishes it.

These limits are enforced by the database, not just hidden in the screen. Someone who knows their
way around a browser still cannot publish from a Contributor account.

---

## The five states a change can be in

| | What guests see |
|---|---|
| **Live** | Exactly this |
| **Draft waiting** | The *old* version — your change is saved but not out yet |
| **Draft** | Nothing; it has never been published |
| **Off the website** | Nothing, but everything is kept and can come back |

There is no scheduled publishing yet — see "Not built" at the end.

---

## The things you will actually do

### Change a price

Menu → find the dish → type the new price → **Save**. It is on the website within a minute.
You do not need to open the dish.

If the price is not a number — "Ask your server", "Market price" — change the dropdown next to it
instead. That removes the number entirely, so an old price can never be left showing.

### Mark something sold out

Menu → find the dish → the second dropdown → **Sold out today** → **Apply**.

- **Sold out today** — guests still see it, greyed out, labelled *Currently unavailable*.
- **Hidden from guests** — it disappears from the website but stays here, so you can bring it back.

### Add a dish

Menu → open a section → type the name at the bottom → **Add**. It starts **hidden**, so you can
fill in the price and description before anybody sees it. Switch it to *On the menu* when it is
ready.

### Change one Friday or Saturday

Events → **Repeating nights** → open the night → the dates are on the right. Open a date and change
only that night: its ticket link, its artwork, its price, or mark it cancelled.

Everything you leave blank stays the same as usual. **Use the usual details** puts a night fully
back to normal.

Cancelling one night never touches the others. A cancelled night stays on the website for two weeks
so anyone holding a ticket finds out, and it is never shown as "what's on".

### Add ticket links for the next few weeks

Events → the night → **Ticket links** → paste one per line:

```
2026-08-21 https://…
2026-08-28 https://…
```

### Add a one-off event

Events → **Repeating nights** → *Add a one-off event*. It saves as a draft. Publish it from the
**Drafts** tab when the details are final.

### Update hours, or close for a holiday

Settings → **Opening hours** for the normal week. For a one-off, use **Holidays and one-off
changes**: pick the date, say what it is, and guests see it on the day. Past dates drop off on
their own.

A closing time earlier than the opening time means *after midnight* — 10:00 to 01:00 is a
fifteen-hour day, and that is what Friday and Saturday are.

### Change a headline

Website → pick the page → each panel is a real section of that page. Change the words, then
**Save and publish**, or **Save as a draft** and use **Preview the page** first.

### Replace a photo

Photos → open the photo. There are two swaps, because there are two kinds of placement:

- **Swap this photo** — for pictures somebody chose, like a flyer on an event. It asks whether you
  mean here only or everywhere, because those are different things.
- **Change the photo in this slot** — for pictures the design places itself, like the six tiles on
  the homepage. The shape and the crop stay exactly as they are; only the picture changes, and it
  changes everywhere the design uses that slot.

Either way the description travels with the picture, so the words never end up describing the
photograph you just replaced.

Changed your mind? **Earlier versions** on the same page puts the old one straight back.

### Undo something

Open the dish or the section → **Earlier versions** → **Bring this back**. It returns as a draft,
so you can look at it before it goes live.

---

## Why some things are refused

- **"Your account can save drafts…"** — you are a Contributor. Your work is saved; ask a manager.
- **"Still in use in 2 places…"** — the photo is on the website. Swap it there first.
- **"Add a short description…"** — a photo needs alt text so screen readers can describe it, or an
  explicit *decorative* tick.
- **"A ticket link has to start with https://"** — a link without it does not work for guests.

---

## What the admin does not touch

- **Toast** — the ordering menu and table bookings live on Toast. This website links to them. A
  price changed here does **not** change Toast, and vice versa.
- **Ticket sales** — tickets are sold on your ticketing site. The admin stores which link each
  night points at, nothing more.
- **Where enquiries are delivered** — the form fields, spam protection and delivery are fixed.
  You can edit the *choices* in a dropdown (Website → Careers → positions, for example).
- **The design** — you choose the words and the photograph in a slot. You cannot move a section,
  add one, or change how a page is laid out. That is what keeps the site from drifting.

---

## Not built (deliberately, and honestly)

- **Scheduled publishing.** There is nothing running at 9am to publish for you, and a "scheduled"
  button that silently never fires would be worse than not offering it. Publish when you are ready.
- **Deleting things.** Staff archive; nothing is deleted. Archived content is kept and can come
  back.
- **Uploading video.** Videos need a poster frame and a matching crop, so they are placed by your
  developer. Send them the file.
