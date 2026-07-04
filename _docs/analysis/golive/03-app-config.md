# 03 — App / EAS / Android Build Config

## Environment variables (dev vs prod)

Current `.env` is already production-ish (`EXPO_PUBLIC_USE_MOCK=false`, real Supabase URL/anon key, Google web client ID). `.env` values are **baked into the JS bundle at build time** — the anon key and web client ID are safe to expose (they are public by design). **Never** put the Supabase `service_role` key or any secret in an `EXPO_PUBLIC_*` var.

For EAS builds, define the same vars in the **production build profile** (or EAS "Environment Variables" in the dashboard) so cloud builds don't depend on your local `.env`:

```jsonc
// eas.json
{
  "cli": { "version": ">= 15.0.0", "appVersionSource": "remote" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },        // installable test build
      "env": { "EXPO_PUBLIC_USE_MOCK": "false" }
    },
    "production": {
      "autoIncrement": true,                      // bumps versionCode each build
      "android": { "buildType": "app-bundle" },   // .aab for Play
      "env": {
        "EXPO_PUBLIC_USE_MOCK": "false",
        "EXPO_PUBLIC_SUPABASE_URL": "https://mbbbdhyhtqkxakmblzmk.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "…anon…",
        "EXPO_PUBLIC_API_TIMEOUT": "30000",
        "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID": "770286311779-4ogmt2mgb5ooshmsu8ip2rb4vamqfpv1.apps.googleusercontent.com"
      }
    }
  },
  "submit": { "production": {} }
}
```

## app.json changes

1. **Add EAS project id** — run `eas init` (creates it) or add manually under `expo.extra`:
   ```jsonc
   "extra": { "eas": { "projectId": "<uuid-from-eas-init>" } },
   "owner": "<your-expo-account>"
   ```
2. **Add `runtimeVersion`** for expo-updates (`expo-updates` is already a dependency):
   ```jsonc
   "runtimeVersion": { "policy": "appVersion" },
   "updates": { "url": "https://u.expo.dev/<projectId>" }
   ```
   (Optional for Phase 1, but lets you push JS-only hotfixes without a Play re-review.)
3. **Android `versionCode`** — currently `1`. With `autoIncrement: true` + `appVersionSource: "remote"`, EAS manages it. Otherwise bump manually every upload.
4. **Facebook / Apple plugins** — the google-signin `iosUrlScheme` placeholder is fine to leave for Android-only builds but fix before iOS. Consider hiding Facebook login for Phase 1 (see [01](01-screen-scan.md)).
5. **Permissions sanity** — `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED` are declared and used by local reminders. No extra permissions needed. The Data Safety form must reflect them.

## Android native build

- **Preferred:** don't hand-edit `android/app/build.gradle`. Let EAS + the Expo prebuild manage signing (see [B1](02-blockers.md#b1--release-build-signed-with-the-debug-keystore-)). The committed `android/` folder's `release { signingConfig signingConfigs.debug }` is only used for local `expo run:android` and must **not** be used to produce the store AAB.
- **Target API level:** Expo SDK 54 / RN 0.81 targets Android 15 (API 35) by default, satisfying Play's current target-API requirement. Confirm `targetSdkVersion` after prebuild.
- **Proguard/shrink:** release minify flags are configurable; test a release build for missing-class crashes (reflection in Supabase/Reanimated) before shipping.

## Build & submit commands

```bash
npm i -g eas-cli
eas login
eas init                       # writes projectId
eas build -p android --profile preview      # internal APK to smoke-test on device
eas build -p android --profile production   # store AAB
eas submit -p android --latest              # upload AAB to Play (after Play app exists)
```

## Pre-build gates (run every release)
```bash
npm run typecheck && npm run lint && npm run test
```
Currently: typecheck ✅ clean; lint ⚠️ 2 warnings to clear (see [01](01-screen-scan.md)).
