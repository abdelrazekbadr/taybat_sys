# 07 — Final Go-Live Checklist (Android Phase 1)

Ordered by dependency. Start the two long-lead items (Play closed test, hosting privacy pages) **first**.

## Long-lead — start day 1
- [ ] Create Google Play Developer account; begin **12-tester / 14-day closed test** plan.
- [ ] Host **Privacy Policy / Terms / Deletion** pages on `tayabat_web` (Vercel). Note the URLs.

## App / code
- [ ] Clear lint warnings: remove/finish `handleFacebook` (`login.tsx:90`); fix `stats.tsx:199` `useMemo` dep.
- [ ] Decide Phase 1 auth = **Email + Google** only; hide Facebook & Apple buttons.
- [ ] Add in-app **Privacy + Terms** links (onboarding/signup + account screen).
- [ ] `npm run typecheck && npm run lint && npm run test` all green.

## EAS / build config
- [ ] `eas init` → add `extra.eas.projectId` + `owner` to `app.json`.
- [ ] Fill `eas.json` production profile: `buildType: app-bundle`, `autoIncrement`, prod env vars (`USE_MOCK=false`, Supabase URL/key, Google web client ID).
- [ ] (Optional) `runtimeVersion` + `updates.url` for OTA hotfixes.
- [ ] `eas build -p android --profile preview` → install APK on a real device, smoke test.

## Signing & Google Sign-In
- [ ] Ship with **EAS/Play-managed keystore** — do NOT ship the debug-signed release.
- [ ] Collect **release + app-signing SHA‑1** (from `eas credentials` and Play App Signing).
- [ ] Create **Android OAuth client(s)** in Google Cloud with those SHA‑1 + package `com.tayabat.sys`.
- [ ] Reconcile web-client-ID project vs Firebase project (must be same GCP project).
- [ ] Add SHA‑1s in Firebase → re-download `google-services.json` (now has non-empty `oauth_client`).
- [ ] **Publish OAuth consent screen to Production** + add Privacy/Terms URLs.
- [ ] Verify Google login works on a **release/internal build** (no `DEVELOPER_ERROR 10`).

## Supabase
- [ ] `get_advisors(security)` → fix the **ERROR** (`community_stats` → `security_invoker`).
- [ ] Pin `search_path` on the 3 flagged functions.
- [ ] `REVOKE EXECUTE` on trigger-only + admin `SECURITY DEFINER` functions from `anon`/`authenticated`; verify user RPCs authorize via `auth.uid()`.
- [ ] Enable **leaked-password protection** + min password strength.
- [ ] Configure **custom SMTP**; verify Arabic verify/reset emails deliver.
- [ ] Whitelist redirect URLs / `taybatapp://` deep link.
- [ ] Enable backups / PITR; keep `service_role` server-side only.
- [ ] RLS spot-check: user A cannot read/modify user B's data.

## Play Console submission
- [ ] Store listing (Arabic): icon 512, feature graphic 1024×500, 4–8 screenshots, descriptions.
- [ ] Data safety form (email, name, **health data**, analytics) + Privacy URL + in-app & web deletion.
- [ ] Content rating, target audience, no-ads declaration.
- [ ] Upload AAB → Internal → Closed (≥12 testers, 14 days) → review **Pre-launch report** → Production **staged rollout**.

## Post-launch watch
- [ ] Android vitals (crashes/ANRs) + Firebase crash-free rate.
- [ ] Supabase dashboard usage vs free-tier limits.
- [ ] Auth success rate (Google + email verification deliverability).
