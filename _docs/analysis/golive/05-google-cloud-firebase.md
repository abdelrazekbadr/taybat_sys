# 05 — Google Cloud Console + Firebase

Two Google surfaces are involved:
- **Firebase project** `al-tayabatcom-123b4` (number `379067998392`) — hosts Analytics + `google-services.json`.
- **Google Cloud project** (same project, linked) — hosts the **OAuth consent screen** and **OAuth client IDs** used by Google Sign‑In.

Current state from `google-services.json`: package `com.tayabat.sys`, **`oauth_client: []` (empty)**. The Web Client ID used by the app (`770286311779-…apps.googleusercontent.com`) belongs to project number `770286311779`, which is **different** from the Firebase project number `379067998392`. ⚠️ Reconcile this — the web client ID and the Android app should live in the **same** Google Cloud project, or Google Sign‑In token validation will mismatch.

## Google Sign‑In SHA‑1 (the release-login blocker)

Native Google Sign‑In (`@react-native-google-signin`) checks the app's **signing certificate SHA‑1** against an **Android OAuth client** in Google Cloud. Steps:

1. **Get the release SHA‑1:**
   - EAS-managed signing: `eas credentials` → Android → view the build credentials' SHA‑1, **and**
   - Play App Signing SHA‑1: Play Console → your app → Setup → **App signing** → copy the **SHA‑1** of both the *upload* key and the *app signing* key.
   - Register **all** of them (upload key, app signing key, and your debug key for local testing).
2. **Create an Android OAuth client** in Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID → Android:
   - Package name: `com.tayabat.sys`
   - SHA‑1: each fingerprint from step 1 (add multiple clients / entries as needed).
3. In **Firebase Console** → Project settings → Your Android app → **Add fingerprint** (same SHA‑1s). Then **re-download `google-services.json`** and replace the file in the repo — it should now contain a populated `oauth_client`.
4. Keep passing the **Web Client ID** to `GoogleSignin.configure({ webClientId })` (this is correct — Supabase `signInWithIdToken` validates the ID token's audience = web client ID). The Android OAuth client just authorizes the app; you do not reference it in code.
5. Rebuild the release AAB and test Google login on a **device install of the release/internal build** (not the dev client).

> If login still returns `DEVELOPER_ERROR (code 10)`: the running APK's signature isn't among the registered SHA‑1s (most common with Play App Signing — you forgot the *app signing* key SHA‑1).

## OAuth consent screen → publish to Production

Google Cloud → APIs & Services → **OAuth consent screen**:
- **User type:** External.
- **Publishing status:** move from *Testing* → **In production** (otherwise only test users can log in — a silent production login failure).
- App name, support email, app logo.
- **Authorized domains** + **Privacy Policy URL** + **Terms of Service URL** (needs the hosted URLs from [02/B3](02-blockers.md)).
- Scopes: only `email`, `profile`, `openid` — these are non-sensitive, so Google's verification is typically fast/automatic.

## Firebase Analytics
- `@react-native-firebase/analytics` is integrated; typed events in `services/analytics/index.ts` (`app_open`, `login`, `sign_up`, `meal_logged`, …). No extra config beyond a valid `google-services.json`.
- Verify events land in Firebase **DebugView** on a release build (`adb shell setprop debug.firebase.analytics.app com.tayabat.sys`).
- Decide analytics **consent** for the Data Safety form — you collect app-usage + a pseudonymous user id (`setUserId`). Declare it.
- No **FCM / push** setup is required for Phase 1 (notifications are local-only; no device token registration exists in the code).

## Facebook (only if you keep it in Phase 1)
- Facebook Login must be a **Live** app (not Development) or only app admins/testers can log in.
- Requires Facebook App Review for `public_profile`/`email` and a hosted Privacy Policy + Data Deletion URL.
- **Recommendation:** hide Facebook for Phase 1 to drop this external review from the critical path (the handler is already unused — see [01](01-screen-scan.md)).
