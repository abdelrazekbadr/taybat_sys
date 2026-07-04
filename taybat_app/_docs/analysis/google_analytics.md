## What I added

| File                                                                                                                                     | Purpose                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [services/analytics/index.ts](vscode-webview://1nomgafinealjchan4s00c6d4hq6g88hpo5rc7r0gu4j3cjmml25/taybat_app/services/analytics/index.ts) | Analytics service —`trackEvent`, `trackScreen`, `setAnalyticsUser`, `setAnalyticsUserProps`, `setAnalyticsEnabled`. Typed `AnalyticsEvent` union, all wrapped in try/catch + logger (never breaks a user flow). |
| [hooks/useScreenTracking.ts](vscode-webview://1nomgafinealjchan4s00c6d4hq6g88hpo5rc7r0gu4j3cjmml25/taybat_app/hooks/useScreenTracking.ts)   | Auto-logs`screen_view` on every expo-router path change.                                                                                                                                                                   |
| [app/_layout.tsx](vscode-webview://1nomgafinealjchan4s00c6d4hq6g88hpo5rc7r0gu4j3cjmml25/taybat_app/app/_layout.tsx)                         | Mounts screen tracking, fires`app_open` once per cold start, syncs Firebase user-id on login/logout.                                                                                                                       |
| [app.json](vscode-webview://1nomgafinealjchan4s00c6d4hq6g88hpo5rc7r0gu4j3cjmml25/taybat_app/app.json)                                       | Added`@react-native-firebase/app` plugin, `expo-build-properties` (iOS `useFrameworks: static`), and `googleServicesFile` paths for both platforms.                                                                  |

---

## Steps to complete configuration

**1. Install dependencies**

```bash
cd taybat_app
npx expo install @react-native-firebase/app @react-native-firebase/analytics expo-build-properties
```

**2. Create a Firebase project & register the apps** (console.firebase.google.com)

* Add an **Android** app → package name **`com.tayabat.sys`** → download `google-services.json`
* Add an **iOS** app → bundle id **`com.tayabat.sys`** → download `GoogleService-Info.plist`

**3. Drop the config files at the project root** (next to `app.json`):

```
taybat_app/google-services.json
taybat_app/GoogleService-Info.plist
```

These paths match what I set in `app.json`. (`google-services.json` ships inside the APK and isn't a secret, but I'd still add both to `.gitignore` and commit `.example` copies so each dev supplies their own.)

**4. Rebuild native code** (Firebase can't run in Expo Go — you need a dev build):

```bash
npx expo prebuild --clean      # regenerates android/ + ios/ with the Firebase plugin
npm run android                # or: npm run ios
```

**5. Verify**

```bash
npm run typecheck && npm run lint
```

Then run the app and watch Firebase  **Analytics → DebugView** . To force events to appear instantly on Android:

```bash
adb shell setprop debug.firebase.analytics.app com.tayabat.sys
```

You should see `app_open` and `screen_view` immediately.

---

## Using it elsewhere

Add new events to the `AnalyticsEvent` union, then call from any store/screen:

```typescript
import { trackEvent } from '@/services/analytics';

trackEvent('meal_logged', { zone: dominantZone, meal_id: mealId });
```

One thing to confirm before you wire deeper: **do you want events tied to a real user id** (I currently pass `user.id` from Supabase on login)? If you'd rather keep analytics anonymous for privacy, say so and I'll drop the `setAnalyticsUser` call. Want me to also add `trackEvent` calls at the key business moments (meal logged, rating submitted, post created, login/signup), or leave that to you?
