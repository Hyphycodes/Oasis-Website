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
| `NEXT_PUBLIC_SITE_URL` | Recommended | No | The canonical origin, e.g. `https://www.oasismexicankitchenbar.com`. Used for canonical URLs, the sitemap, and Open Graph URLs. Defaults to the production domain, so a preview deployment without it will emit production canonicals. |
| `NEXT_PUBLIC_SUPABASE_URL` | For admin | No | Supabase project URL, e.g. `https://abcdefgh.supabase.co`. Public by design — it is in the browser bundle. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For admin | No | Supabase anon/publishable key. Public by design; it is constrained by Row Level Security, which is where access is actually enforced. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | **YES** | Bypasses RLS. Used only for server-side reads of published content during SSR. **Never** prefix this with `NEXT_PUBLIC_`. If omitted, the anon key is used instead and everything still works, because published content is readable by `anon` under RLS. |

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
2. Apply the schema. Either paste `supabase/migrations/0001_init.sql` into the SQL editor, or:
   ```bash
   supabase link --project-ref <ref>
   supabase db push
   ```
3. Load the content that was already captured from the live site:
   ```bash
   npm run content:seed     # regenerates supabase/seed.sql from src/content/
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   Or paste `supabase/seed.sql` into the SQL editor. It is written as upserts, so running it twice
   is safe.
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

## Roles

| Role | Can do |
|---|---|
| `owner` | Everything, including settings, SEO, and changing other people's roles |
| `admin` | All content, settings, and SEO |
| `editor` | Menus, events, hours, announcements, enquiries |

New signups become `editor`. Elevation is a deliberate act by an owner or admin — there is no
self-service path to a higher role.

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
| **File uploads from the admin** | Photo slots have fixed shapes and focal points; direct upload would break the crops. `/admin/media` tells the manager exactly what to send and to whom instead. |

---

## Rotating a key

1. Supabase dashboard → **Project Settings → API → Reset**.
2. Update the value in the hosting provider and in your local `.env.local`.
3. Redeploy.

If a service-role key is ever committed or pasted somewhere public, rotate it immediately —
rewriting git history is not sufficient, because the old value must be assumed compromised.
