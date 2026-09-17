# October theme and staff access

## Seasonal art

The current Halloween / Día de los Muertos theme retains the restaurant's plum canvas,
marigolds, papel picado, warm orange actions and reduced-motion support. Pink/lilac ambient
light and three small transparent character illustrations reflect the supplied Hello Kitty,
Snoopy and Scream paint-and-sip flyers. These are decorative accents; they do not replace
flyers, change event information or appear when the seasonal look is off. Edge decorations
can still be switched off in Admin → Seasonal look.

Generated with the user's connected Higgsfield account, GPT Image 2.5, September 17, 2026:

- Snoopy: `60bf5ddd-a09a-489f-b541-1be90f700ade`
- Scream: `0a64c99f-b222-4119-b9f1-563574a4800f`
- Hello Kitty: `a784e5e8-8d54-4d11-a019-c996eed5d7a0`

Original PNGs were optimized to transparent WebP, up to 480px, under
`public/themes/halloween-dotd/characters/`. Two earlier room-background concepts were
superseded by the user's clarified direction and are not shipped.

## Free house nights

Oasis Fridays and Oasis Latin Saturdays are free and need no tickets. Public and working
content normalization applies this owner policy to legacy database rows. The occurrence
resolver also suppresses old per-date ticket links and paid overrides when a series is free.
Saving those two series persists the free policy. Separately published special events keep
prices, ticket links and reservations of their own.

## Jerry's first sign-in

1. Open https://oasis-website-mu.vercel.app/admin/login.
2. Enter `jerrysanchezpro@gmail.com` and choose **Email me a sign-in link**.
3. Open the email link in the same browser that requested it. No password is needed.
4. The first verified sign-in completes owner setup. Owner elevation is restricted to that
   exact designated email, requires Supabase's verified identity, cannot replace another owner
   and cannot reactivate a disabled profile. It does not use user-editable metadata as authority.

An unverified Auth identity can be prepared before the email arrives, but it is never treated
as an owner before email verification. Invalid/expired links return to login with a recovery
message. Supabase owns token expiry and rate limits. Password login remains available for
existing password users.

## Adding staff

Owner → **Team & permissions** → **Add a staff member**. Supply their name and email, and choose
Contributor (drafts) or Manager (publishing). Share the login page; they request their own link.
Creating the account sends no email and never chooses their password. Owners can change roles
or deactivate accounts in the existing list. Public signup is disabled in Supabase.

Supabase's default email service is limited to project-team recipients and has low sending
limits. Delivery must be verified for Jerry's mailbox too. Before onboarding other staff mailboxes, configure
custom SMTP in Supabase; account creation alone does not guarantee mail delivery to them.
No paid email plan or sender identity was invented or purchased.

## Supabase configuration

The existing project's site URL is `https://oasis-website-mu.vercel.app` and its exact allowed
callbacks are `https://oasis-website-mu.vercel.app/auth/callback` (returning staff) and
`https://oasis-website-mu.vercel.app/auth/activate` (first invitation). No wildcard callback is needed.
Default email templates remain in use. Public signup is disabled; anonymous sign-in stays off
and email confirmation stays on. No secrets were copied into the repository.

References: [Supabase passwordless email](https://supabase.com/docs/guides/auth/auth-email-passwordless)
and [SMTP limits](https://supabase.com/docs/guides/auth/auth-smtp).

## Expanded October world

Additional Higgsfield illustrations from the supplied Instagram references:

- Michael Myers painter: `e79a7c1b-9e7b-42e4-bef6-1bff11c08601`
- Selena-inspired roses and microphone: `c9616346-7192-47c0-b304-a5261efea4b7`
- Blue angel: `656a3948-5698-4b67-b8a6-7e0bfd26fe04`
- Pumpkin, ghost and bats: `e92ccd5b-64f7-484e-ac59-5c9faa6c00ad`
- Illustrated Selena: `91066f4c-c237-495a-82df-fc62fbc1afa2`
- Illustrated Junior H: `ad65f448-220e-4467-91a3-267c9ba3a64a`

All six join the original three companions. These are decorative musical tributes,
not announcements that either artist performs at Oasis. Original event facts remain intact.
Shared outside gutters, photo corners and different paired scenes distribute the collection
across public destinations. Mobile layouts reserve space; decoration does not cover controls.
The repeated marigold divider is retired. Warm floral details remain in the existing theme.

### First-invitation handling

The initial live sign-in attempt returned Supabase `signup_disabled` because an unconfirmed
identity cannot use the normal OTP sign-in path with public signup disabled. Unconfirmed,
preauthorized staff now receive an admin invitation; confirmed staff receive a normal magic link.
The activation page removes URL fragments immediately, establishes the provider session and
requires a server-verified email plus an active staff profile before continuing. Public signup
stays disabled, and no identity is manually marked verified.

## One continuous night

The October look no longer stacks coloured bands. Inside the theme, section surfaces
(ivory, cream, espresso, teal, sand-as-band) are nearly transparent, so the fixed candle
glow and a faint star field show through everywhere; each band keeps its tone as a
feathered elliptical pool that reaches full transparency inside the band, so two sections
never draw a line between them. The hero reel and the events opener photo are masked to
soft ellipses, the papel picado hangs in a darkened top zone and fades along its lower edge,
the marigolds sit a step back in brightness, and the After Dark rule, action rail and menu
tab edge are threads that fade at both ends. Characters bob on a slow `translate` loop that
respects reduced motion and the admin motion switch. Forms, the phone drawer, the sticky
menu nav and cards keep solid surfaces. Locally, `OASIS_THEME_FORCE=halloween-dotd` in
`.env.local` previews the theme without touching the admin schedule.

### Phones carry more of the cast

Below 1024px the hero has no room for a companion, so Snoopy leans up out of the action
rail instead (`ThemeRailGuest`, a child of the rail so the hero's clip never cuts him; the
rail's text ends before he starts at 375px). The between-section scenes are taller on
phones with near full-size guests, a wider orbit and bigger stars; a third scene
("celebration": Hello Kitty and the pumpkin) sits before the catering movement on every
width, Scream joins the social collage's corner, the footer trio grows, and the phone petal
field is denser (9 at standard, 12 at full). Nothing reserves layout space when the theme
is off.

### What was actually drawing the banner edges

The first pass at "one continuous night" thinned the surface tokens instead of removing
the surfaces. A translucent fill is not a soft fill: `background-color` covers a box evenly
and stops dead at its edge, so an 8–20% wash still drew a hard horizontal line wherever two
sections met — and the character scenes, sitting in the untinted gap between two tinted
rectangles, read as banners with an edge top and bottom.

Full-bleed surfaces now carry an `o-band` marker (the `Band` primitive plus the handful of
sections that do not use it) and clear their background entirely; only a feathered `::after`
pool carries the tone, and every pool reaches full transparency before any edge. The colour
tokens went back to real opaque surfaces, which is what the phone drawer, the menu's sticky
category nav, form fields and category tiles need — so no special-casing is required for them.

Two other fixes came out of the same pass. Petals moved behind the page content
(`z-index: -1`): with no rectangles left to hide them they are still visible everywhere, but
they no longer fall across a headline or a price. And every two-layer `mask-image` combined
with `mask-composite: intersect` was replaced by a single-layer radial — that pattern
composites the bottom layer against nothing and had been erasing the papel picado outright,
which only showed over brighter frames of the hero reel. Hero artwork keeps close to its own
colour now; the pocket of dark air above it (`.theme-hero::before`) does the setting-back, so
it no longer disappears depending on which frame is playing.

### Phones get a shorter read

The homepage ran 8.5 phone screens, and "What's on" alone was 1,927px of it, because each
supporting event put a near-square flyer across the full width before stating a single fact.
Those two cards are now rows on phones — flyer as a thumbnail, facts beside it — which is the
shape a list of dates wants. The lead event keeps its full poster, so the hierarchy is sharper
rather than flatter. With the scenes trimmed a little the page is 7.6 screens and the events
section is 1,228px.

## Homepage, condensed

The homepage was nine content bands and three seasonal scenes. It is now five bands and
two scenes, and on a phone it runs 6.1 screens instead of 8.5.

**The kitchen and the bar are one band.** "Come hungry. Stay awhile." (six category tiles in
a horizontal scroller) and "Margaritas by the tower." (two more photographs, its own headline,
its own two buttons) together spent about 1100px saying that Oasis serves food and drinks.
They are one band of four photographs that all fit on screen at once — no scroller, so nothing
is hidden behind a swipe — over a line carrying the bar-and-brunch facts and a single route to
the menu. The two tiles that were colour fields rather than photographs (Starters and Brunch,
neither of which has approved photography) are gone rather than padding the grid; brunch keeps
its hours on the facts line, where they are more use than a swatch was.

**Catering is no longer a section.** It was a headline, three packages with serving ranges,
a private-events blurb and a second photograph — about 1470px on a phone, ahead of the address.
Catering and private events are real parts of the business with their own pages, nav items and
footer links, so on the homepage they are one line each at the bottom of the closing block, and
arrival details lead it instead.

**Social is quieter.** Its heading was set up to 3.75rem, louder than the section above it that
sells a table; it now matches every other section. The three accounts were a stacked list
spelling out platform, handle and arrow each time, and are now one wrapping row of chips
labelled by @handle (or by platform where the "handle" is just the restaurant's name again,
as Facebook's is).

Every admin control still drives something visible. The `bar` section keeps its own eyebrow and
heading on the facts line rather than becoming a lone visibility toggle, and `two-paths` drives
the catering and celebration links in the closing block.

## Events lead, and the page sells two things

**The reel dissolves.** The hero's ellipse mask still had roughly half its opacity left where
it met the bottom edge, so the loop ended on a straight cut into the canvas. Its vertical
radius now reaches that edge exactly, and the scrim over it lets go early too — otherwise the
scrim simply becomes the hard edge instead.

**"On next" sits directly under the hero.** Oasis is a restaurant people already know how to
have dinner at; the reason to pick a particular night is what is on that night, and the
calendar was three sections down. One strip now names the soonest event, dates it, and offers
one way in — tickets where there are tickets, the night itself where there are none, because
the weekly nights are free and have nothing to sell. `selectHomepageEvents` had already been
returning a `next` event for exactly this and nothing had ever used it. The strip renders
nothing when nothing is upcoming, rather than advertising an empty calendar.

**Four general doors, not a menu in miniature.** "Quesabirrias / Plates & entrées / Margaritas
/ The bar" named two dishes and then split the bar in half, so a guest who wanted a drink had
to pick between two cards that both meant drinks. It is Tacos, Plates, Cocktails and Brunch —
what somebody actually arrives wanting, each landing on the part of the menu that answers it.
Brunch is a colour field because there is no approved brunch photograph and standing a taco
shot in for one would misrepresent a weekend morning; it carries its hours instead. The `bar`
section's default copy moved off "Margaritas by the tower." for the same reason the cards
changed — the Cocktails and Brunch cards now say both of those — and onto the one thing
neither card covers, which is that the drinks come by the tower and the pitcher.

**Celebrations replaced the social gallery.** Four photographs, a poster-scale headline and
three account links sold nothing. A birthday or a quinceañera is a room booked weeks ahead and
had no homepage presence beyond small print at the very bottom. The accounts are in the footer,
where a row of logos is enough. Every claim in the new section is one the restaurant already
publishes: capacities, minimums and room-hire terms stay absent, because they are not published
anywhere, they depend on the date, and the inquiry form is what settles them.

One placement note: the rail companion is taller than the action rail, so he leans up into the
"on next" strip above it. From 640px that strip's ticket button is aligned right, exactly where
his easel is, so the row reserves his footprint the same way the rail below it does.

## There is no brunch, and the page stopped saying so

The owner confirmed there is no separate brunch service and no brunch menu. The site had
carried an empty brunch tab since the rebuild, on the strength of the old Wix site's
structure, with an honest "being finalized" empty state behind it — see
docs/CONTENT-QUESTIONS.md §6, now answered. The tab, its slug, its admin label, its seeded
row, its homepage card and every line of copy advertising weekend brunch are gone. The menu
has exactly two rooms: Food, and Cocktails & Bar.

Brunch EVENTS are a different thing and stay. Ticketed paint-and-brunch nights are real and
keep their event category; what was removed is the claim that the kitchen runs a brunch
service with a menu of its own. `content.test.ts` now guards the rule rather than the old
empty state, so an empty tab cannot come back by accident.

## The top of the page, and what the homepage stopped claiming

Three changes, all removals.

**"Dinner first. Music after." is gone.** It sold the place as a running order — dinner, then
a night out — on a calendar whose paint nights start at seven and whose ticketed brunches run
at midday. The owner's own description is that it is all together and all the time, so the
hero says the kitchen is never the whole story instead of putting it first in a sequence.

**The "on next" strip is gone.** It named the soonest event, dated it and offered tickets
directly above a What's on section that leads with the same event, the same date and the same
ticket button. Two of everything inside one screen is what made the top of the page read as a
wall of things to tap. Events did not lose their place — What's on is still the first content
section, and it is where the detail belongs.

**"The room changes after ten" is gone.** It previewed Fridays and Latin Saturdays, which are
already the two supporting cards in What's on, and it promised a change of room at an hour the
calendar does not keep.

The menu cards went from four to two. Every previous version had overlapping categories —
Tacos beside Plates when a taco dinner IS a plate, Margaritas beside The bar when a margarita
comes FROM the bar — so which tile you picked depended on how you happened to describe what
you wanted. Food and Cocktails & Bar are the two rooms the menu actually has.

Companions now stand in open space rather than on artwork. One had been sitting across a third
of a menu card and hiding the end of its label, which is the one thing a category card exists
to show.

### Copy lives in the database, not in these defaults

`getPageCopy` reads `page_sections` and only falls back to `src/content/pages.ts` when there is
no row. Production has rows, so editing a default here does NOT change the live site — that is
why "Margaritas by the tower." survived a commit that had already replaced it. Either edit the
section in Admin → Website → Homepage, or refresh every seeded row from the repository with:

    npm run content:migrate -- --write

That command overwrites live copy with the repository's values, including any wording changed
in the admin, so the dry run (without `--write`) is the default for a reason. It never deletes,
so the retired `home:bar` and `home:after-dark` rows will still be listed in the admin even
though nothing renders them; hide or archive them there.

## Homepage refinement — hero hierarchy, utility row, character placement

A layout pass, not a redesign: same visual identity (marigolds, papel picado, characters,
photography, colours), reorganised so the top of the page reads as one clear decision
instead of four competing ones.

**Hero.** Headline is now "Good food. Good music. Stay awhile." — two short lines, three
parts of one night rather than a sequence (the previous "Dinner first. Music after." and
"Never just dinner." both still implied an order or led with a negation). Body copy is one
sentence. The button row is two things, not three: Reserve a table (filled, primary) and
Events (an underlined text link with an arrow, deliberately quieter — not a second button
of equal weight). Order online moved out entirely.

**Utility row** (`ActionRail`). Open status, Order online, Directions and the phone number
are one compact line with `·` separators, one notch quieter than the hero (smaller type,
lighter surface, plain text rather than buttons) — everything a visitor opens the site to
find, without it reading as a second action row. The street/locality text that used to
trail the row on wide screens is gone; the address still lives in Find us and the footer.

**Character placement.** Selena and Junior H — `ThemeWorld`'s "music" scene, the same pairing
`private-events/page.tsx` already uses for this reason — moved from a standalone strip
directly under the menu cards into the Celebrations section itself, below its grid. They now
read as that section's own flourish instead of a corridor between two unrelated ones. Hello
Kitty stays at the menu cards, but her placement was quietly wrong: anchored to the bottom of
her row with `height: auto`, she centred on the "See the full menu" button and her top edge
reached back up into the card caption above on the two-column grid — a smaller version of the
exact problem ("a companion parked over a photograph covers the thing it's selling") the
placement was written to avoid. She is anchored to the row's TOP now, so nothing above the
button is ever hers to cover.

**Spacing.** The hero's button row and its bottom padding both grew (not shrank) so Reserve,
Events and the utility row below have real air between them; "What's on" gained extra
top padding so it reads as the next section rather than a continuation of the hero cluster.

## The events calendar ran out of order

The page printed September, November, then October. October is the restaurant's biggest month
and is shown louder than the rest — a dark room, the seasonal framing, cards instead of rows —
but it got that treatment by being filtered OUT of the calendar and re-rendered after every
other month. A calendar has one job before any of the styling, and that is to run forwards.

`buildCalendar` was never at fault: `getUpcomingEvents` sorts by start time, so the months came
out in order and `event-calendar.test.ts` already asserted it. The reordering was entirely in
the page, which did `months.filter(isOctober)` and `months.filter(!isOctober)` and rendered the
second list first.

Months are now walked once, in order, and split into runs of the same treatment by
`groupMonthRuns` — consecutive ordinary months share one band rather than each paying for a
band's padding, and an October drops in at its own date with its own. Same two treatments, same
emphasis, right order. The grouping lives in `event-calendar.ts` rather than the page, with the
rest of the "which events, in what order, under which month" rules, and is tested there —
including the exact September/October/November case that was wrong.

The page's opener copy lost its "— dinner first, music after" tail for the same reason the
homepage headline did: it sells a running order the calendar does not keep, on a page whose
paint nights start at seven. "Brunches" stays: those are the ticketed Paint & Brunch and Sunday
events, which are real and on sale. It is the kitchen's brunch SERVICE that does not exist.

## "Celebrations" was saying itself twice, and the bunting had hard edges

**The repeat.** The homepage's closing block still carried its original eyebrow, "Catering &
celebrations," pointing at a single leftover link — "Feed the party — catering packages" —
because when the Celebrations section was split out into its own place on the page earlier,
this one word never got cleaned out of the block it left behind. A visitor scrolling past the
real "Birthdays & celebrations" section higher up would hit the word again at the very bottom,
attached to nothing celebratory. The default copy is now "Catering" / "Trays and packages for
the whole crew.", and — since the mismatch happened because `FindUs` had stopped rendering the
section's `heading` field at all while still typing the eyebrow — both fields now actually
render. A control an editor can type into and never see is worse than no control.

**The bunting.** `.theme-hero-top`'s mask only ever faded vertically; at any width ≥1100px
(`width: max(100%, 1100px)`, so effectively every desktop width) the string's own printed edges
landed exactly at the hero's left and right edges, showing a hard vertical cut where a finite
image stops. A real banner would still be hanging past the frame there; a finite image stopping
at a hard edge is a hard edge regardless of the excuse. It is one radial ellipse now — the same
fix as the hero reel and the events-opener photo before it — fading the string out before it
reaches either side, tuned so the ellipse's radius is under 50% of the element's own width (the
first attempt used 58%, which left the true edge only ~75% faded rather than gone).

## Real photography, not a fabricated one

`birthdayCelebration` was a placeholder — a plain branded box where the private-events page's
birthday photo should be. It now shows a real photograph: a server carrying two boards of tacos
through the dining room on a busy night, the OASIS greenery-wall sign and real guests behind
her. Sourced from the restaurant's own live site at oasismexicankitchenbar.com — downloaded and
hosted locally, never linked, since a Wix/Parastorage URL reaching production is what
`npm run assets:check` already refuses to ship — the same way every other real photograph on
this site was sourced.

Two AI-generated alternatives were tried first and both were rejected, for different reasons
worth recording. A festive dessert-and-confetti mood shot was honest (it made no claim about
being a specific real moment) but was dropped anyway once real photography turned up, since a
real photo of the actual place beats a generic one every time. A "private celebration table"
interior shot was rejected outright, before real photography was found: it invented wall murals
and signage that do not exist at Oasis, which is a materially different problem — not
atmosphere, but a false depiction of the specific venue, exactly what this project has been
careful never to publish.

Fixing the placeholder surfaced two real photographs — `bartender` and `margaritaTajin`, both
genuine frames from the Oasis brand reel — that `npm run assets:check` flagged as registered but
no longer rendered anywhere, left over from sections simplified away earlier in this project.
Rather than delete real client photography to quiet the checker, `margaritaTajin` now leads the
homepage's Cocktails & bar door (swapped in for `cocktailPour`, which stays in use on `/menu`),
and `bartender` sits as a second photograph inset into the Celebrations section's room shot —
tucked into the opposite corner from the seasonal companion so neither covers the other.

## The bunting over-corrected, and a second, different hard edge was still there

**The bunting, again.** The fix above traded one problem for another: pushing the mask's solid
color stop in to 38% and its radius down to 42% killed the vertical hard edge, but also faded
out most of the banner itself — it read as "almost gone" rather than softly bounded. The radius
still needs to stay under 50% (that part of the earlier fix was correct), but the solid stop was
the wrong lever to move that far. It now sits at 62%, with the radius nudged back up to 48%, so
the banner is fully opaque across nearly its whole width and only a narrow rim near the true
edge actually fades.

**A second, unrelated hard edge.** Screenshots of the "paint" scene (Chucky-the-painter and
Scream, sitting between the Events and Offerings sections) and the "music" scene (Selena and
Junior H, in Celebrations) both showed a sharp rectangular wash behind the characters — not the
bunting cutoff from above, a different bug in a different system. Every `.o-band` section
dissolves its own background into a soft pool via a radial-gradient `::after`, and every one of
those pools was written to fade all the way to `transparent` at its own edge. Two adjacent bands
both hitting literal zero at the seam between them let the page's always-on, fixed ambient glow
show through undimmed right at that seam — visually a brighter patch sandwiched between two
darker interiors, which reads as a box even though nothing is actually drawing one. Any
`ThemeWorld` scene or other content sitting at a band boundary sat inside that bright patch.

Fixed by giving all five pool gradients (base, ivory-deep, espresso, teal, sand) a low residual
opacity at their outer rim instead of true zero — each keeps roughly a fifth to a quarter of its
center strength at 100%, so the page's brightness floor stays continuous across band seams
instead of alternating between "inside a pool" and "in raw glow." Verified at both flagged
locations (paint scene, music scene), on `/private-events` and `/events` where the same scenes
recur, and at both desktop and mobile widths.
