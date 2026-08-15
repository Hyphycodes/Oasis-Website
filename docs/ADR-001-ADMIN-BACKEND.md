# ADR-001 — Staff admin backend: extend Supabase rather than adopt Payload CMS

**Status:** accepted · **Date:** 2026-08-15

## Context

The brief recommends Payload CMS embedded in the Next.js app, on Postgres, with an
object-storage adapter — *"Confirm compatibility with the real repository before
committing to it… If the repository already has an established, secure content
platform that satisfies the required UX, drafts, role enforcement, versions, and
media behavior, extend it rather than forcing a second system."*

### What the audit found

| Concern | Already in the repository |
|---|---|
| Database | Supabase Postgres, `supabase/migrations/0001_init.sql` — 15 tables, typed, commented |
| Authentication | Supabase Auth + `@supabase/ssr`, edge middleware gate on `/admin` |
| Authorization | Row Level Security with `current_role()` / `can_edit()` / `can_administer()`, plus `requireRole()` in every server action |
| Audit trail | `audit_log` table with an `AFTER` trigger on all 13 editable tables |
| Admin UI | Nine screens under `/admin`, written in restaurant language, styled in the site's own design system |
| Public read layer | `src/content/resolve.ts` — Supabase when configured, typed static modules as fallback, `React.cache`d, 2.5s timeout |
| Object storage | Supabase Storage available in the same project |

### What was missing

Drafts, versions, restore, archive, a publish step, per-occurrence event
overrides, media upload, named page editors, special-hours exceptions, and a
Contributor role that genuinely cannot publish.

## Decision

**Extend the existing Supabase-backed platform.** Add the missing capabilities as
migrations plus a typed repository layer; do not introduce Payload.

### Why not Payload

1. **A second authentication system.** Payload ships its own users, sessions and
   access control. The repository's authorization boundary is Postgres RLS —
   enforced even if a server action forgets a check. Payload's access control runs
   in application code against its own tables, so adopting it means either running
   two identities or discarding RLS.
2. **A second migration system.** Payload manages its own schema. The existing
   `supabase/migrations/*.sql` would become a partial, drifting picture.
3. **The stock admin is explicitly ruled out.** The brief forbids exposing an
   unchanged CMS sidebar and forbids collection/document/block vocabulary. Payload's
   value is mostly its generated admin; configured away, what remains is an ORM and
   a draft engine — roughly 400 lines of migration here.
4. **Direct Postgres access.** Payload needs a connection string; the app currently
   talks to PostgREST over HTTPS. Pooler credentials would be a new production
   secret and a new failure mode.
5. **The fallback guarantee would be lost.** `resolve.ts` guarantees the public site
   renders from typed static content when the CMS is unreachable. Payload as the
   read path removes that.

### What is added instead

| Capability | Implementation |
|---|---|
| Draft / published / changed / archived | `draft jsonb` + `archived_at` on each editable table; live columns are what the public reads, `draft` is never read publicly |
| Contributor cannot publish | `BEFORE UPDATE` trigger rejects any change to a live column when `current_role() = 'editor'`; server actions check first, RLS and the trigger check independently |
| Version history + restore | `content_versions` — a JSON snapshot per publish, with actor and timestamp |
| Event occurrences | `event_occurrences` extended to a full override row and finally *read* by the selector (it existed but nothing consumed it) |
| Media | `media_assets` extended with title, tags, decorative, archived; Supabase Storage bucket for uploads; usage computed by reverse reference |
| Named page editors | `page_sections` (already present) plus `page_media` and `page_lists` |
| Special hours | `special_hours` table with date-scoped exceptions |

## The dual store, and why it exists

The write path is defined once against a small `Db` interface
(`src/lib/db/types.ts`) with two adapters:

- **`SupabaseDb`** — production and any environment with Supabase configured.
- **`LocalDb`** — a JSON file under `.oasis-local/`, used **only** when Supabase is
  not configured **and** `NODE_ENV !== 'production'`.

This is not a competing source of truth. `LocalDb` is a development and test
backend: it makes `git clone && npm install && npm run dev` produce a working
admin, and it is what the integration tests run against, so permissions, drafts,
publishing, versions and reference protection are all genuinely exercised without
Docker. In production the guard in `src/lib/db/index.ts` refuses to construct it,
and writes fail closed.

The seed for both is the same typed static content in `src/content/` that already
generates `supabase/seed.sql`, so there is exactly one origin for the real data.

## Consequences

- No new runtime dependency. The admin ships as application code in the site's own
  design system.
- RLS remains the authorization boundary, now with a column-level trigger for the
  publish restriction.
- Migrations stay in one place, in SQL, reviewable.
- The static-fallback guarantee survives: a Supabase outage degrades the public
  site to last-known-good typed content rather than taking it offline.
- Scheduled publishing is **not** implemented — it needs a scheduler this
  deployment does not have. The state is documented as deferred rather than faked.
