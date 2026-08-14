# Admin Guide

For the Oasis team. No technical knowledge assumed.

---

## Signing in

Go to **yoursite.com/admin**. Enter your email and password.

If you have forgotten your password, ask whoever set up your account to reset it — there is no
self-service reset, on purpose.

If you see *"The content system is not connected yet"*, the developer has not finished the setup.
The website is still working normally for guests; only editing is unavailable.

---

## What you can change, and what you cannot

**You can change:**

- The announcement bar at the top of every page
- Opening hours
- Menu item names, prices, descriptions, and whether something is sold out
- Event status, ticket price, and ticket link
- Enquiry status and internal notes

**You cannot change** (by design — this is what stops the site from breaking):

- Fonts, colours, spacing, or layout
- Adding or deleting whole menu sections
- The address, business name, or phone number
- Uploading photos directly

Anything in the second list, ask your developer. Most take a few minutes.

---

## The dashboard

The first page after signing in. It shows:

- **Today** — whether you are open right now, and this week's hours
- **This week** — the next few event nights
- **Enquiries** — how many messages are waiting for a reply
- **Things worth a look** — specific problems, each linking to the page that fixes it

That last section is worth reading whenever you sign in. It flags things like a dish with no price
or a menu with nothing on it.

---

## Announcement bar

The thin coloured strip across the very top of every page. Use it for a special, an event, or a
temporary notice.

1. Go to **Announcement bar**.
2. Type your message. Keep it to one short sentence — it has to fit on a phone.
3. Optionally add a link and the text for the button.
4. Optionally set a start and end date. Leave both blank to run it until you switch it off.
5. Pick a colour: **orange** for specials, **dark** for events and nightlife.
6. Tick **Show this on the website**.
7. Click **Save changes**.

A live preview at the top shows exactly how it will look before you save.

**Remember to switch it off when the special ends.** An expired promotion is worse than none — or
set an end date and it turns itself off.

---

## Hours

1. Go to **Hours & closures**.
2. Set the opening and closing time for each day, or tick **Closed**.
3. Click **Save hours**.

**For nights that run past midnight**, set the closing time to the small hours — opens 10:00, closes
01:00. The website works out that it means the next day.

Hours appear in the footer of every page, on the Visit page, and in Google search results, so this
is one of the highest-impact things on the site.

---

## Menus

1. Go to **Menus**.
2. Find the dish and click **Edit**.
3. Change the name, price, or description.
4. Click **Save**.

**Prices:** type numbers only — `16` or `16.50`, no dollar sign. Leave the price blank for anything
that changes with the market; the website then shows whatever you put in *"What to show instead of a
price"* (usually "Ask your server").

**Sold out?** Untick **Available**. The dish stays on the menu, greyed out, so guests know it exists
and is off tonight. Tick it back when it returns.

**Featured** marks a dish as an Oasis original.

Adding a brand-new dish, or a whole new section, needs your developer — that keeps the menu layout
from breaking.

---

## Events

Your Friday and Saturday nights repeat automatically. **You never add dates one by one.** The
website works out the next 26 weeks and always shows the right ones.

To change something:

1. Go to **Events**.
2. Pick the night.
3. Change the **status** — sold out, cancelled, free entry, postponed.
4. Change the **ticket price** or **ticket link** if they have moved.
5. Click **Save**.

Cancelled nights stay visible on the website for two weeks so guests who were planning to come are
not surprised by a silent disappearance.

**About flyers:** send your developer a flyer with **no date printed on it**. The website prints the
date itself, in text, over the artwork. That is why the old problem — a flyer showing one date and
the listing showing another — cannot happen any more.

---

## Enquiries

Catering requests, private-event requests, and job applications from the website all land here.

1. Go to **Enquiries**. New ones are open by default.
2. Read the details — the date, headcount, and everything they filled in.
3. Reply by clicking their email or phone number.
4. Set the status to **Working on it**, then **Done**.
5. Add internal notes. Only your team sees them.

**Nobody is emailed automatically.** Email notification is not set up, so check this page daily.
Guests are told exactly this when they submit — the website never claims to have emailed you.

---

## Photos

**Photos** is a read-only list of every photo slot on the website and which ones are still empty.

You cannot upload here. Each slot has a fixed shape and a focal point so the picture crops correctly
on phones; uploading straight in would break those crops. Send photos to your developer instead —
the list on this page tells you exactly what is needed and what size.

Most valuable to shoot first: **quesabirrias**, **the Bizza**, and **a Friday or Saturday night on
the floor**. There is currently no photograph of any dish anywhere on the website.

Shooting tips are in `docs/ASSET-HANDOFF.md` — a phone is genuinely fine if you shoot in portrait,
near a window, with the overhead lights off.

---

## Previewing changes

Every editing page has a **Preview on the website** link. Changes appear within about a minute.

If you do not see a change, wait a minute and refresh. If it is still missing after five, tell your
developer.

---

## Who can do what

| | Owner | Manager | Staff |
|---|---|---|---|
| Menus, events, hours, announcements, enquiries | ✅ | ✅ | ✅ |
| Settings and business details | ✅ | ✅ | — |
| Adding and removing user accounts | ✅ | ✅ | — |

New accounts start as **Staff**. An owner or manager raises that deliberately.

---

## If something goes wrong

**A change did not save.** Look for the red message next to the Save button — it says what was
wrong. Most often it is a price typed with a dollar sign, or a link missing `https://`.

**You saved something you did not mean to.** Change it back and save again. Every change is logged
with who made it and when, so nothing is lost.

**The website looks broken.** Contact your developer immediately. Do not try to fix it from here —
nothing in this admin can break the website's appearance.

**You are locked out.** Ask another owner or manager to reset your password.
