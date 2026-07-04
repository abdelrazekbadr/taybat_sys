# 04 — Supabase: Dev → Production

Project: `mbbbdhyhtqkxakmblzmk` (region as configured). 24 public tables, **all with RLS enabled ✅**.

## Decision: one project or split dev/prod?

For **Phase 1** the pragmatic path is **keep the single project** and harden it — you already have real data (7 profiles, 170 user_meals, 86 meals, etc.) and content seeded. Creating a separate prod project means re-seeding meals/topics/config and re-registering all OAuth. 

**Do add a safety net instead:**
- Enable **Point-in-Time Recovery / daily backups** (Pro plan) before launch — free tier only keeps limited backups.
- Use a **Supabase branch** (`create_branch`) for schema experiments so you never test DDL against live data.
- Keep the `service_role` key server-side only (it is not in the app — verified). Rotate it if it was ever shared.

> Budget note (from project memory): stay on free-tier-friendly query patterns — date-windowed time-series (≤90d for `user_meals`), 5-min store cache, refetch only on pull-to-refresh. Launch traffic shouldn't blow the free tier, but watch the dashboard usage after release.

## Security advisors — fix before real users

`get_advisors(security)` results (full remediation links in the linter docs):

### ERROR (1)
- **`community_stats` is a `SECURITY DEFINER` view.** It runs with the creator's rights and bypasses the querying user's RLS. Recreate it as `SECURITY INVOKER` (Postgres 15+: `ALTER VIEW public.community_stats SET (security_invoker = true);`) and confirm the underlying tables' RLS still returns the right rows. → linter `0010`.

### WARN — function search_path mutable (3)
`match_documents`, `set_updated_at`, `sync_profile_after_weekly_rating` have a mutable `search_path`. Pin it:
```sql
ALTER FUNCTION public.set_updated_at() SET search_path = '';
-- repeat for each; fully-qualify table refs inside the function body
```
→ linter `0011`.

### WARN — SECURITY DEFINER functions executable by `anon` / `authenticated` (many)
`apply_admin_policy_to_public_rls_tables`, `create_notification_from_post`, `delete_day_point_event`, `delete_user_account`, `get_user_membership`, `handle_new_user`, `record_point_event`, `sync_post_love_count`, `sync_profile_after_weekly_rating`.

- Trigger-only functions (`handle_new_user`, `set_updated_at`, `sync_*`, `create_notification_from_post`, `sync_post_love_count`) should **not** be callable via the REST RPC endpoint. `REVOKE EXECUTE ... FROM anon, authenticated;` (triggers still fire).
- `apply_admin_policy_to_public_rls_tables` is admin-only — **must** be revoked from `anon`/`authenticated` (currently callable by anyone → privilege risk).
- User-facing RPCs (`delete_user_account`, `record_point_event`, `delete_day_point_event`, `get_user_membership`) can stay callable by `authenticated`, but **revoke `anon`** and verify each one authorizes via `auth.uid()` internally so a user can't act on another user's data.
→ linters `0028` / `0029`.

### WARN — Leaked password protection disabled
Auth → Policies → enable **"Leaked password protection"** (checks HaveIBeenPwned) and set a sensible minimum password strength. → auth password-security docs.

Re-run `get_advisors` after fixes; target **0 ERROR**.

## Auth configuration for production

1. **Site URL & Redirect URLs** (Auth → URL Configuration): add the app deep-link scheme `taybatapp://` and any reset/verify redirect. Facebook OAuth uses PKCE `exchangeCodeForSession` (`lib/supabase.ts` `flowType: 'pkce'`) — its redirect must be whitelisted.
2. **Email templates** — confirm the **verify email** and **reset password** templates are **Arabic RTL** and branded. Users hit these in `verify-email.tsx` / `reset-*.tsx`.
3. **Custom SMTP (important).** Supabase's built-in email is rate-limited (~a few messages/hour) and **not for production** — signups will silently fail to receive OTP/verification at volume. Configure a real SMTP provider (Resend, SendGrid, AWS SES, Postmark) under Auth → SMTP. Verify your sending domain (SPF/DKIM) to avoid spam folders.
4. **Rate limits** — review Auth → Rate Limits for signup/OTP to balance abuse protection vs. real users.
5. **Providers** — Google enabled (uses `signInWithIdToken`). If keeping Facebook, its App ID/Secret live only in the Supabase dashboard (per `facebook_auth_setup_guide.md`) and the Facebook app must be **Live**, not Dev.

## Storage
- Confirm buckets used for avatars/community images have **RLS/policies** (public-read where intended, authenticated-write scoped to owner). Set a max file size and allowed MIME types.
- If images are user-uploaded, consider an image size/transform limit to protect free-tier bandwidth.

## Post-migration verification
```text
✅ get_advisors(security) → 0 ERROR
✅ Sign up with a fresh email → receives verification via custom SMTP
✅ Google sign-in on a RELEASE build succeeds (ties to SHA-1, see 05)
✅ Delete account (account.tsx → delete_user_account) removes the row + auth user
✅ Community love-count realtime still works
✅ A user cannot read/modify another user's user_meals / ratings (RLS spot check)
```
