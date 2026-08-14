# Backup and Recovery

What is backed up, by whom, and how to get things back.

---

## What exists, and where

| Thing | Lives in | Backed up by |
|---|---|---|
| Website code | GitHub — `Hyphycodes/Oasis-Website` | GitHub, plus every developer's clone |
| Photos and video | `public/media/` **in the git repository** | Same as the code |
| Menus, events, hours, settings | Supabase Postgres | Supabase automatic backups |
| Enquiries | Supabase Postgres | Supabase automatic backups |
| User accounts | Supabase Auth | Supabase automatic backups |
| Original media masters | `media-originals/`, git-ignored, **local only** | ⚠️ Nothing — see below |

**Media is committed to git.** That is a deliberate choice for a site this size: the whole site,
including its pictures, restores from a single `git clone`. There is no separate media store to
forget about.

⚠️ **`media-originals/` is not backed up.** It holds untouched masters that are never served. If the
developer's machine dies, they are gone — but they are re-fetchable with `npm run assets:fetch` as
long as the old Wix site is still up. Once the restaurant supplies real originals, keep them
somewhere durable (a shared drive), not only in that folder.

---

## Supabase backups

Automatic, and the retention depends on the plan:

| Plan | Backups | Point-in-time recovery |
|---|---|---|
| Free | Daily, 7 days | No |
| Pro | Daily, 7 days | Yes, 7 days (add-on) |

**Free-tier caveat:** a Supabase project with no activity for 7 days is **paused**. Because the
public site falls back to its built-in content, guests would not notice — but the admin would stop
working and enquiries would stop being stored. If Oasis is on the free tier, either sign in
occasionally or move to Pro before launch.

### Taking a manual backup

Before anything risky — a migration, a bulk edit — take one:

```bash
supabase db dump --db-url "$DATABASE_URL" -f backup-$(date +%Y%m%d).sql
```

Or **Dashboard → Database → Backups → Download**.

Keep these somewhere other than the developer's laptop.

---

## Recovery

### The website is down but the database is fine

Almost certainly a bad deployment. Roll back — see `MAINTENANCE.md`. Takes about a minute.

### The database is down or unreachable

**Guests see a working website.** Every public page falls back to the content in `src/content/`,
which is the same content that seeded the database. Menus, hours, events, and catering all render.

What stops working: the admin area, and storing new enquiries. The forms still accept submissions
and write them to the server log, and the confirmation message says exactly that rather than
claiming an email went out.

This is by design — see `PLAN.md` §1.1. There is no "site down for maintenance" state.

### Someone deleted or broke content

1. **Check the audit log first.** Every change is recorded with who, when, and a JSON diff:
   ```sql
   select at, actor, table_name, row_id, action, diff
     from public.audit_log
    order by at desc
    limit 50;
   ```
   Often you can read the old value straight out of `diff` and retype it.
2. If the damage is broad, restore the seed content — it puts everything back to the state captured
   from the live site:
   ```bash
   npm run content:seed
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```
   Statements are upserts, so this overwrites the seeded rows and leaves anything the owner added
   alone.
3. For anything worse, restore a Supabase backup. **This loses everything since that backup**,
   including enquiries — export those first:
   ```sql
   select * from public.inquiries order by created_at desc;
   ```

### Enquiries were lost

Check the Supabase backup first. If the loss predates the backup, check the hosting provider's
runtime logs — every enquiry is also written there, including a reference number, whether or not
the database write succeeded.

### The repository is lost

```bash
git clone https://github.com/Hyphycodes/Oasis-Website.git
npm install
npm run dev
```

That is the whole recovery. Code, media, migrations, and seed data are all in the repository.

---

## Recovery targets

| Scenario | Time to recover | Data lost |
|---|---|---|
| Bad deployment | ~1 minute | None |
| Database unreachable | 0 — site keeps serving | New enquiries not stored (logged instead) |
| Content edited wrongly | 5–15 minutes | None (audit log) |
| Database restore from backup | 15–30 minutes | Up to 24 hours |
| Repository restore | 5 minutes | None |

---

## Before launch

- [ ] Decide free tier vs Pro. Free means no point-in-time recovery **and** a project that pauses
      after 7 idle days.
- [ ] Take one manual backup and confirm it downloads.
- [ ] Confirm at least two people can sign in to the Supabase dashboard, so access does not depend
      on one person.
- [ ] Confirm at least two people have admin access to the GitHub repository.
- [ ] Write down where the domain is registered and who can log in — that is the single hardest
      thing to recover if the person who bought it is unavailable.

## Every quarter

- [ ] Download a manual backup and check it is not empty.
- [ ] Confirm the owner can still sign in to `/admin`.
- [ ] Confirm the reservation and ordering links still work.
- [ ] Check `npm outdated` for security updates.
