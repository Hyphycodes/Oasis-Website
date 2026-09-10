# Environment Variables

No secret values appear in this file or anywhere else in the repository. `.env.example` lists names
and safe examples only.

**The site runs with none of these set.** Without Supabase it serves the typed content in
`src/content/`, and every public page works normally — see `PLAN.md` §1.1. The variables below turn
on the admin area, stored enquiries, and owner editing.

---

## Variables

| Name | Required | Secret | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | No | The canonical origin, e.g. `https://www.oasismexicankitchenbar.com`. Used for canonical URLs, the sitemap, and Open Graph URLs. See the resolution order below. |
| `NEXT_PUBLIC_SUPABASE_URL` | For admin | No | Supabase project URL, e.g. `https://abcdefgh.supabase.co`. Public by design — it is in the browser bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For admin | No | Supabase anon/publishable key. Public by design; it is constrained by Row Level Security, which is where access is actually enforced. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | **YES** | Bypasses RLS. Used only for server-side reads of published content during SSR. **Never** prefix this with `NEXT_PUBLIC_`. If omitted, the anon key is used instead and everything still works, because published content is readable by `anon` under RLS. |

### How the site URL is resolved

`src/lib/site-url.ts` tries these in order and uses the first one that parses as a real `http(s)`
URL:

1. `NEXT_PUBLIC_SITE_URL`
2. `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` (Vercel supplies it; a bare host, so `https://` is added)
3. `NEXT_PUBLIC_VERCEL_URL` / `VERCEL_URL` — the specific deployment
4. `https://www.oasismexicankitchenbar.com`

A value that is **blank, whitespace-only, malformed, or not http(s) is skipped**, not used. This
matters more than it looks: the origin feeds `metadataBase: new URL(...)` at module scope in the
root layout, so a throw there fails the entire production build during "Collecting page data" — it
does not just degrade one page.

> **This is a fixed bug, not a hypothetical.** A production deploy failed with
> `TypeError: Invalid URL … input: ''` because `NEXT_PUBLIC_SITE_URL` was defined in the hosting
> project but empty, and the old code used `??`, which only falls back on `null`/`undefined`.
> `src/lib/site-url.test.ts` locks the behaviour in with 12 cases.

Because Vercel's own variables are in the chain, a preview deployment emits its own canonical URLs
rather than claiming to be production, even if you never set `NEXT_PUBLIC_SITE_URL` for previews.

**Either set it to a full origin with the scheme, or delete the variable entirely. Do not leave it
present and blank** — that now falls back safely, but it also silently discards your intent.

### Why `NEXT_PUBLIC_*` keys are safe to expose

They identify the project; they do not grant access. Access is decided by the RLS policies in
`supabase/migrations/0001_init.sql`: anonymous visitors may read published content and insert an
enquiry, and nothing else. Reading enquiries, or writing any content, requires an authenticated user
with a row in `profiles`.

### Why the service-role key is different

It bypasses RLS entirely. It is imported only by `src/lib/supabase/server.ts`, which starts with
`import 'server-only'` — that makes it a **build error** for any client component to pull it in,
rather than a convention someone can forget.

---

## Local setup

```bash
cp .env.example .env.local
```

Then fill in the values from the Supabase dashboard: **Project Settings → API**.

`.env.local` is git-ignored. `.gitignore` ignores `.env` and `.env.*` and re-includes only
`.env.example`.

---

## Provisioning Supabase

1. Create a project at [supabase.com](https://supabase.com). Pick a region near Chicago —
   `us-east-1` or `us-central`.
2. Apply the schema, **in order**. Either paste each file into the SQL editor, or:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
   | Migration | What it adds |
   |---|---|
   | `0001_init.sql` | Tables, RLS, audit log |
   | `0002_event_flyers.sql` | Series flyers with a declared printed date; drops the ticket fee |
   | `0003_admin_backend.sql` | Drafts, versions, occurrence overrides, media fields, special hours, the publish guard, the storage bucket |
   | `0004_site_themes.sql` | The seasonal look: one row per theme, schedule, creative options and artwork overrides. See `docs/seasonal-theme-admin.md` |

3. Load the content that was captured from the live site:
   ```bash
   npm run content:migrate            # dry run: reports counts, writes nothing
   npm run content:migrate -- --write # applies it, then verifies the counts
   ```
   Every row is keyed by its real identifier, so this is idempotent — running it twice updates
   rather than duplicates, and running it against a half-migrated database finishes the job. It
   never deletes and never publishes a draft.

   `npm run content:seed` still regenerates `supabase/seed.sql` if you prefer to paste SQL.
4. Create the owner account: **Authentication → Users → Add user**, with a real email and a strong
   password.
5. Promote that user, because the signup trigger assigns the least-privileged role by design:
   ```sql
   update public.profiles
      set role = 'owner', name = 'Owner name'
    where user_id = (select id from auth.users where email = 'owner@example.com');
   ```
6. Sign in at `/admin/login`.

---

## The admin is currently open

**There is no sign-in on `/admin` right now.** Anyone who can reach the URL has full access, and
with Supabase configured, writes use the service key — because with no account there is no role for
Row Level Security to check. That is the honest consequence of turning the gate off, not an
oversight.

It is fine on a local machine. It is not fine on a public address.

| To require sign-in | Where |
|---|---|
| Without a code change (**use this in a deployment**) | `ADMIN_REQUIRE_SIGN_IN=true` |
| In code | `OPEN_ADMIN = false` in `src/server/admin-access.ts`, and the matching `OPEN_ADMIN_DEFAULT` in `src/middleware.ts` |

The environment variable wins over the constant, so turning it on in production cannot be undone by
redeploying an older commit. Nothing was removed to open the gate: accounts, roles, RLS and the
publish guard are all still there and start working again the moment it closes.

| Name | Required | Secret | Purpose |
|---|---|---|---|
| `ADMIN_REQUIRE_SIGN_IN` | Before launch | No | `true` puts the password back on `/admin` |

---

## Roles

The stored values are `owner` / `admin` / `editor`; the admin shows them as **Owner**, **Manager**
and **Contributor**.

| Role | Can do |
|---|---|
| `owner` | Everything, including staff accounts, roles and connected services |
| `admin` | Edit and publish all content, settings and media |
| `editor` | Edit anything allowed and save it as a **draft** — never publish |

New signups become `editor`. Only an **owner** can change a role: under the 0001 policy a manager
could change roles, including their own, which is the classic way an account quietly becomes an
owner. `0003_admin_backend.sql` closes it.

The Contributor restriction is enforced three times over, independently:

1. `requireCapability` in every server action, before a database handle is even obtained;
2. Row Level Security;
3. a `BEFORE UPDATE` trigger that rejects any change to a live column when the caller cannot
   publish — so it holds for a direct PostgREST call, not only for a server action that remembered
   to check.

---

## Deployment

Set the same variables in your hosting provider (Vercel: **Settings → Environment Variables**).
Mark `SUPABASE_SERVICE_ROLE_KEY` as **Sensitive**.

Set `NEXT_PUBLIC_SITE_URL` per environment so a preview deployment does not emit production
canonical URLs and confuse search engines.

---

## What is deliberately NOT configured

| Not configured | Consequence |
|---|---|
| **Email delivery** | No mailer exists, so nothing in the UI claims an email was sent. Enquiries are stored in the database, or written to the server log when Supabase is absent — and the confirmation message says which. Adding email means adding a provider **and** updating the wording in `src/components/forms/FormShell.tsx`. |
| **Analytics** | No script, no cookie banner — there is nothing to consent to. `/legal/privacy` states this plainly and must be updated in the same change if analytics is ever added. |
| **Error monitoring** | Not set up. Vercel captures runtime logs. |
| **Scheduled publishing** | There is no scheduler in this deployment. A "scheduled" state that silently never fires is worse than not offering one, so the admin has Draft / Published / Changed / Archived and says so. |
| **Video upload from the admin** | Video needs a poster frame and a matching crop. Images upload normally; video is refused with an explanation and placed by a developer. |

---

## Rolling back

Nothing in this system deletes content, which is what makes a rollback cheap.

| If | Do this |
|---|---|
| A published change is wrong | Admin → the record → **Earlier versions** → **Bring this back**. It returns as a draft; publish it. |
| A migration import went wrong | Re-run `npm run content:migrate -- --write`. It is idempotent and restores every value from the repository. |
| The database is unreachable or misconfigured | Nothing to do. `src/content/resolve.ts` serves the typed static content and every public page keeps working; the admin says it is not connected. |
| The whole cutover needs reverting | Unset `NEXT_PUBLIC_SUPABASE_URL`. The site returns to serving `src/content/` exactly as it did before any of this existed. |

The static modules in `src/content/` are never deleted by the migration, and they remain both the
seed and the fallback — which is precisely why that last row is a one-variable change.

---

## Local development without Supabase

`git clone && npm install && npm run dev` gives you a **working admin** with no configuration. With
no Supabase configured and outside a production build, the app uses a JSON file under
`.oasis-local/`, seeded from the same typed content that seeds Supabase, and `/admin/login` offers
one account per role so permissions can actually be tried.

It is git-ignored, the admin shows a banner saying where the data lives, and
`src/lib/db/index.ts` refuses to construct it in production — writes fail closed instead. See
[`ADR-001-ADMIN-BACKEND.md`](./ADR-001-ADMIN-BACKEND.md).

---

## Rotating a key

1. Supabase dashboard → **Project Settings → API → Reset**.
2. Update the value in the hosting provider and in your local `.env.local`.
3. Redeploy.

If a service-role key is ever committed or pasted somewhere public, rotate it immediately —
rewriting git history is not sufficient, because the old value must be assumed compromised.
