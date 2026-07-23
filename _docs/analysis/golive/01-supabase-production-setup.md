# Supabase Production Setup — clone dev config without retyping

Source project (dev): `mbbbdhyhtqkxakmblzmk` (`taybat-app-dev`) — this is what `taybat_app`'s `.env` currently points at (`EXPO_PUBLIC_USE_MOCK=false`).
Target: `bmyachyraddxekojqnoi` (`taybat-app-prod`) — a **separate** Supabase project (own URL/keys/billing), already created, region `eu-central-1`, status `ACTIVE_HEALTHY`.

There is no local `supabase/` CLI folder in this repo — the 34 migrations applied to the dev project live only as history on the remote project (applied ad hoc over time, not tracked as files here). The original plan was to `supabase db dump` the schema and push it once — see **Current status** below for why that changed.

---

## Current status (2026-07-11)

- **Projects**: both real, both confirmed via `supabase projects list` — `taybat-app-dev` (`mbbbdhyhtqkxakmblzmk`, linked) and `taybat-app-prod` (`bmyachyraddxekojqnoi`, `ACTIVE_HEALTHY`, not yet linked).
- **MCP config**: `.mcp.json`, `.claude/settings.json`, `taybat_app/.mcp.json`, and `taybat_app/.claude/settings.json` all already have both `supabase` (dev) and `supabase-prod` entries pointing at `https://mcp.supabase.com/mcp?project_ref=<ref>`. Verified by reading all four files directly — matches.
- **CLI login**: working, via `HOME=<repo>/.supabase-cli-home npx -y supabase <cmd>` (a cached, pre-authenticated CLI home — Homebrew install was blocked in this environment, this wrapper works instead).
- **`supabase db dump --linked` is genuinely blocked here**: it needs Docker to pull a version-matched `pg_dump` image, and even though a `docker` binary is present in this environment, the CLI can't reach `/var/run/docker.sock` — confirmed by actually running it, not assumed.
- **Fallback used instead**: the full schema was reconstructed via direct SQL introspection (`pg_policies`, `pg_get_functiondef`, `pg_get_triggerdef`, `pg_indexes`, `information_schema` columns) against dev, and written to [`schema.sql`](schema.sql) in this folder — every table, constraint, index, function, trigger, and RLS policy, byte-accurate as of this date (not hand-guessed). This is what gets applied to prod instead of a CLI dump.
- **Not yet done**: `schema.sql` has **not been applied to prod yet**. This session's Supabase MCP tools are bound to dev only — the already-configured `supabase-prod` MCP server isn't loaded until the Claude Code session restarts (MCP servers connect at session start, not hot-reloaded from config changes mid-session). **Restart/reopen the session, then continue this checklist** — schema push, cron jobs, extensions, realtime, seed data, and the advisor check can all run automatically at that point.
- **`taybat_app/.env.production`** created with the prod URL + publishable key (gitignored, matches `.env`'s pattern). Google OAuth client ID is a placeholder carried over from dev — see the TODO in that file and §7 below.
- **Reference/config data** (meals, meal_items, health goals/conditions, library topics, membership config/tiers/rules, public_config — everything except real user data) generated the same way, via `format('%L', ...)` against the live rows so Arabic text/quoting is exact, into [`seed-data.sql`](seed-data.sql). Deliberately excludes `profiles`/`user_meals`/`users_ratings`/`community_posts`/etc. — prod launches with zero real users, per your call.
- ⚠️ **`seed-data.sql` has image URLs pointing at dev's storage bucket** (`https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/...`) — `public_config.meal_img_url`, `health_goals.image`, `health_conditions.image`, `library_topics.image_url`. Functional as-is (dev's bucket is public), but prod would be permanently hot-linking dev's storage. See the note at the top of `seed-data.sql` for the fix (copy files to prod's bucket, then find/replace the project ref in the URLs) — worth doing before real traffic, not blocking for initial testing.
- Storage bucket creation and Auth/SMTP/email settings remain manual regardless (§5, §7) — no tool, mine or Supabase's, can do those.

---

## Your checklist — everything, in order

| # | Step | Status | Who does it | Where |
| --- | --- | --- | --- | --- |
| 1 | Install Supabase CLI, run `supabase login` | ✅ Done | — | Terminal |
| 2 | Dump schema from dev | ⚠️ Blocked by Docker → done differently: reconstructed via SQL introspection instead, see [`schema.sql`](schema.sql) | — | — |
| 3 | Create the new prod project | ✅ Done — `taybat-app-prod` / `bmyachyraddxekojqnoi`, `ACTIVE_HEALTHY` | **You** (already done) | Dashboard |
| 4 | Apply `schema.sql` to prod | ⏳ Ready, blocked on prod MCP tools loading | Me, once session is restarted with `supabase-prod` linked | Supabase MCP |
| 5 | Confirm extensions enabled (`pgcrypto`, `uuid-ossp`, `vector`, `pg_cron`) | Included in `schema.sql` §1 | Me, next session | Supabase MCP |
| 6 | Recreate the 2 pg_cron jobs | Included in `schema.sql` §10 | Me, next session | Supabase MCP |
| 7 | Recreate storage bucket `taybat_app_assets` + policies (§5) | ⏳ Ready — `storage.buckets`/`storage.objects` policies are real Postgres tables, doable via SQL like everything else | Me, next session | Supabase MCP |
| 8 | Enable realtime on `app_notifications` + `community_posts` | Included in `schema.sql` §9 | Me, next session | Supabase MCP |
| 9 | Auth: providers, redirect URLs, SMTP, email templates (§7 table) | ❌ Not started — secrets aren't readable by any tool | **You only** | Dashboard → Authentication |
| 10 | Seed reference/config data (meals, health goals, membership tiers, etc.) (§8) | ✅ [`seed-data.sql`](seed-data.sql) generated, ready — ⚠️ has dev storage URLs, see status note above | Me, next session | Supabase MCP |
| 11 | `taybat_app/.env.production` with prod URL + publishable key | ✅ Done — see file (gitignored) | — | Repo |
| 12 | Run the smoke test checklist (§10) | Not started | You, in the app | Device/simulator |
| 13 | Run `get_advisors` (security + performance) on prod before real traffic | Not started | Me, next session | Supabase MCP |

**What's actually left for you to do by hand: step 7 (storage bucket) and step 9 (Auth/SMTP/email).** Everything else is either done or queued up ready to run the moment you restart/reopen this Claude Code session — the `supabase-prod` MCP server is already correctly configured in all 4 config files, it just needs a fresh session to connect. Say the word after restarting and I'll apply `schema.sql`, seed the reference data, and run the advisor check in one pass.

---

## 0. Prereqs

```bash
npm install -g supabase   # or: brew install supabase/tap/supabase
supabase login
```

You'll need the dev project's ref (`mbbbdhyhtqkxakmblzmk`) and, after step 2, the new prod project's ref.

---

## 1. Dump the current schema from dev

```bash
supabase link --project-ref mbbbdhyhtqkxakmblzmk
supabase db dump --linked -f _docs/analysis/golive/schema.sql
```

This captures everything as DDL: tables, columns, constraints/indexes (including the `uq_weekly_ratings_user_period` unique constraint), RLS policies, functions, triggers, views, extensions declarations.

**Not captured by a plain dump** — handled in later steps:
- `pg_cron` job *registrations* (they're rows in `cron.job`, not DDL)
- Storage bucket config (buckets live in `storage.buckets`, a data table, not schema)
- Auth provider / URL / email-template settings (dashboard/Management-API only, no SQL representation)
- Vault secrets

Don't commit `schema.sql` if it ends up containing anything sensitive — treat it as a local working file.

---

## 2. Create the new production project

Dashboard → New Project → pick the region closest to your actual users. Note down:
- Project ref
- DB password
- `anon` / publishable key (→ `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- Project URL (→ `EXPO_PUBLIC_SUPABASE_URL`)

---

## 3. Push the schema to the new project

```bash
supabase link --project-ref <NEW_PROD_REF>
supabase db push -f _docs/analysis/golive/schema.sql
```

(Equivalently: paste `schema.sql` into the new project's SQL Editor and run it once.)

If extensions don't come through automatically, enable them explicitly — these are the ones actually in use on dev (everything else in `list_extensions` is just available-but-uninstalled, ignore it):

```sql
create extension if not exists pgcrypto;      -- gen_random_uuid() etc.
create extension if not exists "uuid-ossp";
create extension if not exists vector;         -- pgvector, used by public.documents.embedding
create extension if not exists pg_cron;
```

`plpgsql`, `pg_stat_statements`, and `supabase_vault` are on by default in every Supabase project — no action needed.

---

## 4. Recreate the pg_cron jobs

Not in the dump. Current dev jobs (verified from `cron.job`):

```sql
select cron.schedule(
  'cleanup-old-notifications',
  '0 3 * * *',
  $$DELETE FROM public.app_notifications WHERE created_at < NOW() - INTERVAL '90 days'$$
);

select cron.schedule(
  'vacuum-app-notifications',
  '30 3 * * *',
  $$VACUUM ANALYZE public.app_notifications$$
);
```

---

## 5. Recreate the storage bucket

`storage.buckets` and `storage.objects` policies are ordinary Postgres tables/policies under the hood — no Dashboard click-through needed, this can run as SQL like everything else:

```sql
insert into storage.buckets (id, name, public, file_size_limit)
values ('taybat_app_assets', 'taybat_app_assets', true, 1048576);
```

Then mirror the `storage.objects` policies from dev's `storage_policies_posts_folder` migration — query dev's actual policies first (`select * from pg_policies where schemaname = 'storage'`) rather than guessing, since policy text should come from introspection like the rest of this doc, then `create policy ...` the same statements against prod.

---

## 6. Enable realtime on the same tables

```sql
alter publication supabase_realtime add table public.app_notifications;
alter publication supabase_realtime add table public.community_posts;
```

(Confirmed on dev: only these two tables are in the `supabase_realtime` publication.)

---

## 7. Auth configuration (manual — dashboard/Management API only, not SQL)

**Why this step can't be automated:** OAuth client IDs/secrets, SMTP settings, and email template HTML are not stored anywhere in the Postgres database — confirmed directly by listing every table in the `auth` schema, there is no config/settings table. They live inside Supabase's Auth (GoTrue) service, editable only via the Dashboard or the Management API. No tool (mine or Supabase's own "duplicate project" feature, which doesn't exist) can copy them — this has to be read from dev's Dashboard and re-typed into prod's Dashboard by hand. The checklist below exists so that's a 10-minute copy-paste instead of a hunt through every settings page.

Go to **Authentication** in the dev project's Dashboard and note each of these, then set the same in the new prod project:

| Screen | Field | Note |
| --- | --- | --- |
| Providers → Email | Enabled, "Confirm email" toggle | |
| Providers → (each OAuth provider actually wired up, e.g. Google/Apple) | Enabled toggle, Client ID | Redirect URI shown here must be added to the OAuth app's console (Google Cloud Console / Apple Developer) for the **prod** callback URL too |
| Providers → (same) | Client Secret | **Not re-copyable** — most consoles show this once, write-only after saving. Practical fix: generate a **new** OAuth client (or a new secret on the same client) specifically for prod rather than trying to "copy" dev's secret. This is also better practice — dev and prod shouldn't share OAuth credentials. |
| URL Configuration | Site URL | Must be the prod app's URL/scheme, not dev's — don't just copy this one verbatim |
| URL Configuration | Redirect URLs | Add prod's deep link / callback URLs (e.g. `taybat://...`), keep dev's separate if you keep both projects live |
| Emails → SMTP Settings | Enable Custom SMTP, Host, Port, User | |
| Emails → SMTP Settings | Password | Same as OAuth secrets — typically write-only after saving. Use your SMTP provider's dashboard to generate a fresh credential for prod, don't try to extract dev's. |
| Emails → SMTP Settings | Sender email / Sender name | |
| Emails → Templates | Confirm signup, Magic link, Change email, Reset password | Copy the HTML/subject for each one you've customized — these ARE just visible text in the dashboard (unlike secrets), so literal copy-paste works here |
| Settings | OTP expiry, JWT expiry, Refresh token rotation | Match dev unless you deliberately want prod different |

There's a trigger on `auth.users` (`on_auth_user_created` → `handle_new_user()`) that creates the matching `public.profiles` row on signup — this comes through in the schema dump automatically since it's DDL. Just verify it fired correctly in step 10's smoke test.

---

## 8. Seed reference/config data (not user data)

These tables are app configuration, not per-user data — copy their **rows**, not just schema, so the app has meals/goals/config to show on day one:

```
meals, meal_items, meal_item_categories, health_goals, health_conditions,
library_topics, library_topic_items,
membership_config, membership_point_rules, membership_tiers,
public_config
```

```bash
supabase db dump --linked --data-only -f _docs/analysis/golive/seed-data.sql \
  -t public.meals -t public.meal_items -t public.meal_item_categories \
  -t public.health_goals -t public.health_conditions \
  -t public.library_topics -t public.library_topic_items \
  -t public.membership_config -t public.membership_point_rules -t public.membership_tiers \
  -t public.public_config
```

Then run `seed-data.sql` against the new prod project (SQL Editor, or `supabase db push -f seed-data.sql` after linking to prod).

**Do NOT copy** user-scoped tables — `profiles`, `user_meals`, `users_ratings`, `community_posts`, `post_reactions`, `user_follows`, `user_point_events`, `notification_reads`, `meal_favorites`, `user_preferences`, `membership_leaderboard_cache`, `documents`. Production starts empty of real user activity.

---

## 9. Point the app at prod

New `.env` (or `.env.production`) for `taybat_app`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<NEW_PROD_REF>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<new anon/publishable key>
EXPO_PUBLIC_USE_MOCK=false
```

---

## 10. Smoke test before opening to real users

- [ ] Sign up a fresh test account → confirm `handle_new_user()` created a `public.profiles` row
- [ ] Complete profile → `plan_start_date` gets set
- [ ] Log a meal → RLS allows the owner to insert/read, blocks reading another user's rows
- [ ] Submit a weekly rating → confirm the `uq_weekly_ratings_user_period` unique constraint exists and behaves (this is the exact constraint behind the "حدث خطأ في الخادم" duplicate-key bug fixed on 2026-07-11 for a dev test account — worth explicitly re-testing here)
- [ ] `select * from cron.job;` → both jobs present and `active = true`
- [ ] Upload/view an image via `taybat_app_assets` bucket
- [ ] Post to community → realtime update arrives on a second device/session
- [ ] Run `get_advisors` (security **and** performance) against the new project and clear anything flagged before real traffic — RLS is enabled project-wide on dev, confirm it carried over identically

---

## Appendix — current dev project inventory (2026-07-11)

**Tables** (all with RLS enabled): `documents`, `profiles`, `meals`, `meal_items`, `user_preferences`, `meal_favorites`, `user_meals`, `users_ratings`, `community_posts`, `post_reactions`, `user_follows`, `meal_item_categories`, `health_goals`, `health_conditions`, `library_topics`, `library_topic_items`, `app_notifications`, `notification_reads`, `membership_config`, `membership_point_rules`, `membership_tiers`, `user_point_events`, `membership_leaderboard_cache`, `public_config`.

**Extensions actually installed**: `pgcrypto`, `uuid-ossp`, `vector` (pgvector — backs `documents.embedding`), `pg_cron`, plus the always-on `plpgsql`, `pg_stat_statements`, `supabase_vault`.

**Functions** (`public` schema — `*` = `SECURITY DEFINER`, review these specifically for `search_path` pinning during the advisor check):
`apply_admin_policy_to_public_rls_tables`*, `create_notification_from_post`*, `delete_day_point_event`*, `delete_user_account`*, `get_community_stats`*, `get_user_membership`*, `handle_new_user`*, `is_admin`, `match_documents`, `record_point_event`*, `set_updated_at`, `sync_post_love_count`*, `sync_profile_after_weekly_rating`*.

**Triggers**: `on_auth_user_created` on `auth.users` → `handle_new_user()`.

**pg_cron jobs**: `cleanup-old-notifications` (daily 03:00), `vacuum-app-notifications` (daily 03:30).

**Storage buckets**: `taybat_app_assets` (public, 1 MB limit, no MIME restriction).

**Realtime-enabled tables**: `public.app_notifications`, `public.community_posts`.

**Edge functions**: none currently deployed.

**Migrations applied on dev** (34 total, remote-only history — not present as local files in this repo): schema evolved from `add_sequence_to_meals_and_meal_items` (2026-05-30) through `fix_community_stats_security_definer_view` (2026-07-04). Full list available via the Supabase MCP `list_migrations` tool if needed for reference.
