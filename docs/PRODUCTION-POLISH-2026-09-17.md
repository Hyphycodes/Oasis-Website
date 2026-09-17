# Oasis production audit and release — September 17, 2026

## Findings

The repository and Vercel production were both on `ff1d1e7`. Next.js 15, React 19,
Supabase content/auth/storage, and a file-backed local development adapter were already present.
The public design and substantial menu were retained. This is a repair and completion of the
existing product, not a replacement CMS.

Production's first homepage response promoted September 16 while `/events` already promoted
September 17. The recurring weekly dates were September 18/19 on that visit, but independent ISR
responses could disagree. Production `/admin` also opened with owner authority without sign-in.
Inquiry failures fell back to logs and still told visitors staff would follow up.

Other confirmed defects: drafts filtered out of their own event list; resolved `one-time:` IDs
passed to save actions instead of stored IDs; postponed events could become the calendar lead;
completed event pages continued selling tickets; UTC overrides matched the wrong local day;
empty event-series tables resurrected seed data; brunch had no category-creation control;
modifier drafts changed the live menu; the homepage's booking/phone links bypassed settings;
menu-page heading edits were ignored; TikTok was missing and Facebook used an obsolete link.

## Changes

- Public pages and sitemap use request-time rendering, including hours, themes and announcements.
  Event dates are generated in America/Chicago and filtered against real end timestamps.
- Cancelled/postponed events never lead promotions. Completed detail URLs stay readable without
  ticket/calendar calls to action. Empty databases stay empty; event read failures do not resurrect
  cancelled seed content. CMS HTTP reads have a timeout.
- Production requires staff authentication even if `ADMIN_REQUIRE_SIGN_IN=false`. Local roles
  remain available in development. A signed-in account without a staff profile can reach login
  without an `/admin` redirect loop.
- Forms report success only after database persistence, keep inputs on failure and handle network
  exceptions. Local forms use the same local inbox staff can inspect. Dates reject yesterday in
  Chicago and impossible calendar dates. No email delivery is claimed or configured.
- Events: visible drafts, correct editor IDs, duplicate as draft, archive, create/pause recurring
  nights, weekday/end-date/default-ticket controls, editable one-off prices/music, validated dates
  and times, real timestamps/UUIDs for new writes.
- Menu: category creation/edit/order, including empty brunch; hidden new dishes; preserved dietary
  selections; staged add-ons instead of publishing them from draft saves. Multi-row modifier writes
  attempt restoration on failure; they are not a Postgres transaction.
- Visual: stronger After Dark photography, a venue photo/social section, full official flyers,
  verified account links and editable TikTok. Existing photography, palette and positioning retained.
- Dependency patch upgrades and PostCSS override remove the advisories reported by npm audit.

## Social and flyer sources

Verified from the restaurant's own [Linktree](https://linktr.ee/OasisMexBar):
[Instagram @oasismexbar](https://www.instagram.com/oasismexbar/),
[TikTok @oasislockport](https://www.tiktok.com/@oasislockport), and
[Facebook](https://www.facebook.com/profile.php?id=61582541071820).
The Instagram profile was readable in the browser; an authenticated feed integration is not configured. The site therefore links to
real accounts and uses existing restaurant photography; it does not fabricate social posts.

Downloaded 24 official flyers from the [Oasis Tickeri calendar](https://www.tickeri.com/organizations/chsxwyl/oasis-events).
`src/content/imported-flyers.json` records each exact event URL, provider ID, start time, dimensions
and retrieval date. Images are optimized and served locally from `public/events/imported/`.
An existing CMS-uploaded flyer wins. A downloaded fallback only matches the same event ID AND
start time, so rescheduling cannot silently retain its old flyer. This adds artwork to matching
existing events; it does not auto-publish unreviewed events or overwrite staff content.

## Production access and staff setup

The user confirmed staff accounts still need setup. Vercel's connector confirms the project and
Git deployment, but the local Vercel CLI and dashboard session are not authenticated. No production
Supabase credentials are present in this checkout. Existing database content was not replaced or reseeded.

An authorized owner must finish these steps in the existing Supabase project:

1. Create/invite their staff user in Supabase Authentication. Set a password through Supabase's
   own UI or recovery flow; never put passwords in this repository.
2. Create the matching row in `public.profiles`, with `user_id` equal to the auth user's UUID,
   `role = 'owner'`, `active = true`, and an appropriate `name` (`sections = '{}'` for full access).
3. Confirm the Vercel production variables `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` belong to that existing project.
4. Sign in at `/admin/login`, verify menu/events/media editing, and confirm a catering and a
   private-event test submission appear in `/admin/inquiries`. The app currently stores leads;
   staff must check this inbox. Email notifications require an owner-approved recipient/provider.
5. Use Admin → Events → Check Tickeri to review new events and import any additional flyers.

Do not run a seed import against the live database as a setup shortcut. Preserve existing content.

## Verification

Automated coverage includes Chicago dates, DST, midnight events, cancellation/postponement,
empty event data, form persistence/failure/honeypot/date validation, brunch categories, hidden
items, drafts/duplication, and deferred modifiers. The reproducible browser script is
`scripts/qa-browser.mjs`; `QA_MUTATE=true` is refused on non-local origins.

The browser audit checks all public routes at 1440, 360, 390 and 430 pixels, headings, canonical
metadata, overflow, menu tabs and arrow keys, malformed hashes, mobile drawer Escape/focus,
legacy redirects, 404s, local forms and admin routes. Screenshots/reports are written outside the
repository to `/tmp/oasis-browser-qa` by default.

## Still requires restaurant information

- Staff account setup and a responsible inbox reviewer; optional email destination/provider.
- Actual brunch items/prices and missing published bar prices. No items or prices were invented.
- Evergreen Friday/Saturday artwork: existing weekly flyers contain historical August dates.
  They remain explicitly captioned as series artwork beside generated current dates.
- Confirm disputed late closing times against actual operations (see CONTENT-QUESTIONS.md).

## Next three improvements

1. Complete staff onboarding and add reliable inquiry email notifications after choosing the inbox.
2. Add real brunch/bar pricing and evergreen weekly flyers through the admin.
3. Replace remaining extracted video frames with a short food/nightlife photo shoot, and connect
   a consent-aware Instagram feed only if an authorized account integration is available.

### Release checks completed

- 249 tests in 17 files; lint, TypeScript, production build and asset registry passed.
- npm audit: zero reported vulnerabilities.
- 44 route/viewport checks passed with zero JavaScript errors, plus local staff and form workflows.
- Both production inquiry types were submitted with clearly labeled synthetic QA data, read back
  from the real inbox, and marked Done with a note that no booking or reply is needed.
- Official social links and Wix/Tickeri event pages were checked in a browser. Toast reservation
  and ordering destinations are confirmed by the restaurant's Linktree, but Cloudflare returned
  403 to the automated browser; completing those provider flows was not verified.
- New social photography was inspected at desktop and phone sizes; all four images loaded.
- Staff sign-in with a real production account remains unverified until accounts are created.
