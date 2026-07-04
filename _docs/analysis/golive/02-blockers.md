# 02 — Hard Blockers

These will either **prevent the build**, **break login in production**, or **get the submission rejected**. Fix all before submitting to Play.

## B1 — Release build signed with the debug keystore 🔴
`android/app/build.gradle` → `release { signingConfig signingConfigs.debug }`.
A debug-signed AAB **cannot be uploaded to Play** (and would be insecure).

**Fix (recommended — EAS-managed signing):**
- Build with EAS: `eas build -p android --profile production`. EAS generates and securely stores an **upload keystore** for you; you never touch `build.gradle`.
- Enroll in **Google Play App Signing** (default for new apps) so Google holds the app signing key.

**If you build locally instead:** generate your own keystore, wire `signingConfigs.release` to it via `~/.gradle/gradle.properties` (never commit the keystore or passwords). EAS is strongly recommended for Phase 1.

## B2 — Google Sign‑In will fail on the release build (`DEVELOPER_ERROR` code 10) 🔴
`google-services.json` has `"oauth_client": []` — **no Android OAuth client** registered. `AuthRepositorySupabase.ts:118` even documents code 10 = SHA‑1/webClientId mismatch.

Native Google Sign‑In validates the app's **signing SHA‑1** against an Android OAuth client in Google Cloud. The debug SHA‑1 (if any) will not match the release/EAS signing key.

**Fix:** register the **release SHA‑1** (from EAS credentials or Play App Signing) as an Android OAuth client, re-download `google-services.json`. Full steps in [05-google-cloud-firebase.md](05-google-cloud-firebase.md#google-sign-in-sha-1).

## B3 — No hosted Privacy Policy URL 🔴
Google Play **requires** a publicly reachable Privacy Policy URL. You have the content at:
- `_docs/_doc_technical/app-privacy/PRIVACY.md`
- `_docs/_doc_technical/app-privacy/TERMS.md`
- `_docs/_doc_technical/app-privacy/DELETION.md`

…but it is **not hosted** and **not linked in-app**.

**Fix:** host all three (the `tayabat_web` site on Vercel is the natural home — e.g. `/privacy`, `/terms`, `/account-deletion`). Then:
- Add the Privacy URL to Play Console → App content.
- Add the account-deletion URL to Play Console → Data safety → Deletion.
- Link Privacy + Terms in the app (onboarding/signup + account screen).

## B4 — OAuth consent screen in "Testing" mode 🔴 (verify)
If the Google Cloud **OAuth consent screen** is in *Testing*, only whitelisted accounts can sign in — production users get "app not verified / access blocked."

**Fix:** publish the consent screen to **Production**, add Privacy + Terms URLs and the app logo. For basic email/profile scopes, Google verification is usually lightweight. See [05](05-google-cloud-firebase.md).

## B5 — Missing EAS `projectId` + empty production build profile 🔴
- `app.json` has **no** `extra.eas.projectId` → `eas build`/OTA updates won't be linked to a project.
- `eas.json` → `"production": {}` is empty: no `android.buildType`, no `autoIncrement`, no production env vars (`EXPO_PUBLIC_USE_MOCK=false`, Supabase URL/key, Google web client ID).

**Fix:** run `eas init` (writes `projectId`), then fill the production profile. Details in [03-app-config.md](03-app-config.md).

## B6 — Supabase security ERROR advisor 🟠
`get_advisors(security)` returns **1 ERROR**: `public.community_stats` is a `SECURITY DEFINER` view (bypasses RLS of the querying user). Plus multiple WARN-level items. Not a Play blocker but a real data-exposure risk to fix before real users. See [04-supabase.md](04-supabase.md).

## B7 — iOS Google URL scheme placeholder (Phase 2, note now) ⚪
`app.json` → google-signin `iosUrlScheme: "com.googleusercontent.apps.REPLACE_WITH_YOUR_REVERSED_IOS_CLIENT_ID"` is a placeholder, and there is **no `GoogleService-Info.plist`**. Irrelevant to Android Phase 1, but must be fixed before any iOS build.
