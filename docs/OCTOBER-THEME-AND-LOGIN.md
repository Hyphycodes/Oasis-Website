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
