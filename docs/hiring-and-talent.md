# Contact, hiring and local talent

Three public pages, two inbound pipelines and one admin section. This is the
document to read before touching any of it.

---

## The one-minute version

```
A guest opens /contact
  → VISIT: the address, whether Oasis is open, the hours, and one control that
    opens Apple Maps, Google Maps or Waze
  → WORK AT OASIS: only the roles somebody switched on, with one way in
  → CREATE WITH OASIS: the invitation to local DJs, artists and performers

Somebody applies                      Somebody sends their work
  /careers → job_applications           /talent → talent_submissions
  → résumé to the private bucket        → photos to the private bucket
  → confirmation to them                → confirmation to them (if they left an email)
  → "somebody wrote in" to Oasis        → "somebody wrote in" to Oasis
  → /admin/hiring                       → /admin/talent
                                        → "Add to the contractor roster"
                                        → contractors (migration 0022)
```

**Nothing on the website claims Oasis is hiring.** Every opening ships
switched off. The careers page says so honestly and still takes an open
application, which is a real thing a restaurant does. See
`src/content/careers.ts`.

---

## Routes

| Route | For |
|---|---|
| `/contact` | The hub. Visit, work, create — condensed, in that order, with one way into each. |
| `/visit` | The full location page: the same address card and hours, plus booking, the room and the socials. |
| `/careers` | What is open, and a two-minute application. |
| `/talent` | "Here's what I do" — a one-minute form for DJs, artists, performers and ideas. |
| `/admin/hiring` | Applicants, opened in place, filtered by status and role. |
| `/admin/hiring/openings` | The roles, as a list of switches. |
| `/admin/talent` | The talent book: cards, not rows. |
| `/admin/talent/[id]` | One profile, with their links and photographs. |
| `/admin/files/[...path]` | The only way a résumé or a talent photograph is ever served. |

`Visit` stays the item in the top navigation, because somebody tapping the top
of a restaurant's website is trying to come and eat. `/contact` is in the
mobile drawer, the footer, and the foot of every page in this family.

---

## The three things worth knowing before you change anything

### 1. An opening ships OFF, and the title is never taken from the form

`job_openings.active` defaults to `false`, the nine standard restaurant roles
are inserted inactive by migration 0026, and `getPublicOpenings()` filters to
active-and-not-archived. A site with no database at all shows **no** openings,
because the typed fallback is the same nine inactive rows.

When somebody applies, the server re-reads the opening by id and stores its
real title. A form posting `position=General Manager` cannot invent a job.

### 2. A public insert never asks Postgres to return the row

`anon` may insert into `job_applications` and `talent_submissions` and may
never read them back. A `RETURNING` clause — which is what `db.insert()` does
— is therefore refused, and an application that was really stored would be
reported to the applicant as a failure. `storeSubmission()` in
`src/app/actions/apply.ts` is a plain insert with no select, and there is a
test that pins it.

### 3. Files belong to the person who sent them

Résumés and talent photographs go to the **private** `applications` bucket,
never to the public `media` one. The stored name is ours — a uuid plus an
extension derived from a MIME type we accepted — so a file called
`../../etc/passwd` cannot become a path. Staff see one through
`/admin/files/...`, which checks the signed-in account and then either
redirects to a five-minute signed URL or streams the local development copy.
`isSubmissionPath()` is the guard; `src/server/uploads.test.ts` is the proof.

An upload that fails **never** costs somebody their application. The row is
saved either way and the admin says the file did not arrive.

---

## Where things live

```
src/content/careers.ts          JobOpening, employment labels, applicant statuses,
                                the nine starter roles (all inactive)
src/content/talent.ts           the twelve disciplines, the statuses, the map onto
                                contractors.service_type, link prettifying
src/lib/submissions.ts          zod schemas, phone/email/link normalising, upload limits
src/lib/visit.ts                VisitLocation and the Apple/Google/Waze deep links
src/server/rate-limit.ts        the shared window every public form uses
src/server/uploads.ts           the private bucket: store, sign, guard
src/server/content/hiring.ts    reads: public openings, admin openings, applicants
src/server/content/talent.ts    reads: the talent book
src/app/actions/apply.ts        the two PUBLIC submissions
src/server/actions/hiring.ts    admin writes: openings and applicant status
src/server/actions/talent.ts    admin writes: status, notes, "add to the roster"
src/components/visit/           LocationCard, DirectionsButton, MoreWays
src/components/careers/         OpeningList
src/components/forms/           ApplyForm, TalentForm, FileField, useSubmission
src/emails/templates/people/    application received, talent received, the internal alert
supabase/migrations/0026_…      the three tables, their RLS, the private bucket
```

---

## Multi-location

`buildVisitLocations()` returns a **list**, and both `/contact` and `/visit`
map over it. Lockport is the only Oasis today; adding a second one is a row in
`locations`, a second entry from that function, and nothing else — the pages
do not change. An opening and an application both carry a `location_id`.

The one thing a second location genuinely needs beyond that is its own hours,
which live once in site settings today because there is one restaurant.
`buildVisitLocations` is where that becomes per-location without touching a
component.

---

## Email

Three templates, all built on the same notice shell as the staff emails
(`src/emails/components/StaffShell.tsx`, which is why `footerReason` exists —
an applicant is not on the staff rota and must not be told they are).

| Template | To | Switch |
|---|---|---|
| `application_received` | the applicant | none, on purpose |
| `talent_received` | the person, when they left an email | none, on purpose |
| `submission_alert` | `OWNER_ALERT_EMAIL` | **Somebody wrote in**, default on |

The two confirmations answer something a person just did, so they follow the
same rule as a ticket receipt: the code never offers to withhold them. They
are `audience: 'guest'`, so they wait behind `EMAIL_DELIVERY_ENABLED` like
every other guest email — and **the success panel reads the result**. It only
says "a copy is on its way to your inbox" when the service reports `sent`. See
`docs/email-system.md`.

---

## The bridge to the contractor roster

`contractors` and `contractor_bookings` (migration 0022) already run every DJ,
painter and photographer Oasis pays. A talent submission is how somebody
*gets* there, so `addToContractors` creates the roster row, copies their pitch
and links into its notes, and sets `talent_submissions.contractor_id`. From
then on the booking, the rate and the W-9 live where they always did, in
`/staff/contractors`.

It is a manager action (`content.publish`), and it is idempotent: a second
press finds the link and does nothing.

---

## Permissions

`people` is a section in `src/server/permissions.ts`, so a Contributor can be
restricted to it or away from it like any other. Reading and updating an
applicant or a talent profile is `inquiries.manage` — the same capability as
the enquiry inbox, because it is the same job. Editing an opening is
`content.edit`; archiving one is `content.archive`; putting somebody on the
contractor roster is `content.publish`.

Row Level Security is the real boundary: `anon` may insert and nothing else,
`public.can_edit()` may read and update, and **neither table has a delete
policy** — somebody applied for a job here, and that is a business record.

---

## What was removed

The old `/careers` form wrote a `careers` enquiry into `inquiries`. Nothing
produces a new one: a job application has its own table, its own statuses and
its own screen. `InquiryType` keeps the value so the enquiries inbox still
renders the historical rows, and `SCHEMAS` is a `Partial` with two entries.

The `careers:positions` page list is gone for the same reason — a position
people can apply for has a description, a location and an on/off switch, none
of which a list of strings can carry.
