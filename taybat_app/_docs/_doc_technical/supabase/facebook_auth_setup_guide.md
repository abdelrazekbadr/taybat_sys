# Facebook Login — Complete Setup Guide (Zero → Working)

**App:** Al-Taybat · **Updated:** 2026-06-10
**Audience:** Junior developer with NO prior Meta/Facebook developer experience.
**Official reference:** https://supabase.com/docs/guides/auth/social-login/auth-facebook

> The app code is **already implemented** (see [facebook_auth_technical.md](facebook_auth_technical.md)).
> This guide covers everything OUTSIDE the code: Meta account, Meta app, Supabase
> dashboard, and the device build. Follow the parts in order — each part depends
> on the previous one.

---

## Values You Will Need (copy-paste reference)

| Name | Value | Where it's used |
|---|---|---|
| Supabase project ref | `mbbbdhyhtqkxakmblzmk` | building the callback URL |
| Supabase callback URL | `https://mbbbdhyhtqkxakmblzmk.supabase.co/auth/v1/callback` | Meta Console (Part 2) |
| App deep link | `taybatapp://auth/callback` | Supabase URL Configuration (Part 3) |
| iOS Bundle ID | `com.tayabat.sys` | Meta Console platforms (Part 2) |
| Android Package | `com.tayabat.sys` | Meta Console platforms (Part 2) |
| Facebook **App ID** | you'll get it in Part 1 | Supabase dashboard ONLY |
| Facebook **App Secret** | you'll get it in Part 1 | Supabase dashboard ONLY — **never** in app code or `.env` |

---

## PART 1 — Create the Meta (Facebook) Developer Account & App

### 1.1 Create a Meta developer account

1. You need a normal, real **Facebook account** first (https://www.facebook.com).
   - Use a real account — Facebook bans fake/throwaway accounts quickly, and a
     banned account kills the developer app with it.
2. Go to **https://developers.facebook.com**.
3. Click **Get Started** (top right).
4. Log in with your Facebook account.
5. Accept the developer terms, verify your account:
   - Confirm your **email**.
   - Add and confirm a **phone number** (required for creating apps).
6. Choose role: **Developer** → Finish.

You now have a Meta developer account.

### 1.2 Create the app

1. Go to **https://developers.facebook.com/apps/**.
2. Click **Create App**.
3. When asked **"What do you want your app to do?"** (use case), choose:
   **"Authenticate and request data from users with Facebook Login"** → **Next**.
4. App name: `Al-Taybat` · App contact email: your team email → **Next** → **Create App**.
5. Re-enter your Facebook password if prompted.

You land on the app dashboard. Note the **App ID** shown at the top of the page.

### 1.3 Configure Facebook Login settings

1. In the **left sidebar** → **Facebook Login** → **Settings**
   (if you don't see it: **Add Product** → **Facebook Login** → **Set Up** → choose **Other**).
2. Make sure these toggles are **ON** (they are by default):
   - **Client OAuth Login** → Yes
   - **Web OAuth Login** → Yes
3. In **Valid OAuth Redirect URIs**, paste **exactly**:
   ```
   https://mbbbdhyhtqkxakmblzmk.supabase.co/auth/v1/callback
   ```
   ⚠️ No trailing slash, no typos — Facebook matches this string exactly.
4. Click **Save Changes** (bottom right).

### 1.4 Enable the `email` permission (critical)

Without this, Facebook will not return the user's email and Supabase login fails.

1. Left sidebar → **Use Cases**.
2. Find **"Authentication and account creation"** → click **Customize** (or **Edit**).
3. In the permissions list find **email**:
   - If it shows **"Ready for testing"** → done.
   - If not, click **Add** next to it.
4. `public_profile` should also be listed (it's automatic).

### 1.5 Register the mobile platforms

1. Left sidebar → **App Settings** → **Basic**.
2. Scroll to the bottom → **+ Add Platform**.
3. Add **iOS**:
   - **Bundle ID:** `com.tayabat.sys`
4. Click **+ Add Platform** again → add **Android**:
   - **Google Play Package Name:** `com.tayabat.sys`
   - **Class Name:** leave default or `com.tayabat.sys.MainActivity`
   - **Key Hashes:** required for the *native* Facebook SDK — our flow goes through
     the **browser**, so you can leave it empty for now. If Facebook insists,
     generate the debug one:
     ```bash
     keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore \
       -storepass android -keypass android | openssl sha1 -binary | openssl base64
     ```
5. **Save Changes**. If Facebook warns the package isn't on Google Play yet, choose
   the option to proceed anyway / disable Play Store verification.

### 1.6 Get your credentials

1. Still in **App Settings → Basic**:
2. Copy **App ID**.
3. Next to **App Secret** click **Show** (re-enter password) → copy it.

> 🔒 **App Secret rule:** it goes ONLY into the Supabase dashboard (Part 3).
> Never put it in app code, `.env`, git, Slack, or screenshots.

### 1.7 Add test users (required while app is in Development Mode)

A new Meta app starts in **Development Mode**: ONLY people listed with a role on
the app can log in. Everyone else gets *"App not active"*.

1. Left sidebar → **App Roles** → **Roles**.
2. Under **Testers** → **Add Testers** → enter the Facebook username/profile link
   of each teammate who will test.
3. Each tester must **accept the invite**: they log into Facebook →
   https://developers.facebook.com/requests/ → accept.

---

## PART 2 — Configure Supabase Dashboard

### 2.1 Enable the Facebook provider

1. Open https://supabase.com/dashboard/project/mbbbdhyhtqkxakmblzmk/auth/providers
2. Find **Facebook** in the provider list → expand it.
3. Toggle **Enable Sign in with Facebook** → ON.
4. **Facebook client ID** → paste the **App ID** from step 1.6.
5. **Facebook secret** → paste the **App Secret** from step 1.6.
6. Click **Save**.

### 2.2 Register the app deep link (redirect URL)

Supabase only redirects to URLs on its allowlist. Our app's deep link must be there.

1. Open https://supabase.com/dashboard/project/mbbbdhyhtqkxakmblzmk/auth/url-configuration
2. Under **Redirect URLs** click **Add URL** and add:
   ```
   taybatapp://auth/callback
   ```
   (If Google OAuth setup already added it, skip — it must appear exactly once.)
3. **Save**.

---

## PART 3 — App Build & Environment

### 3.1 Environment

No Facebook env var is needed — the App ID/Secret live only in Supabase.
Just make sure the app runs in Supabase mode in `.env`:

```env
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_SUPABASE_URL=https://mbbbdhyhtqkxakmblzmk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key from dashboard → Settings → API>
```

### 3.2 Rebuild the dev client (one time)

`expo-web-browser` is a **native module** — a JS reload is not enough after it was
added. Rebuild once:

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

(For EAS builds: `eas build --profile development --platform android` etc.)

---

## PART 4 — Test It

1. Launch the app → **Login** screen → tap the **Facebook** button.
2. ✅ The system browser opens with the Facebook login page.
3. Log in with a **Tester account** (Part 1.7) — your own developer account works too.
4. Facebook asks consent ("Al-Taybat will receive your name and email") → **Continue**.
5. ✅ Browser closes, app navigates to **complete-profile** (first login) or **home**.

**Verify in Supabase:** Dashboard → **Authentication → Users** — a new user appears
with **Provider = facebook** and a real email.

### Test checklist

```
[ ] Facebook button opens the browser
[ ] Cancel / close browser → Arabic message "تم إلغاء تسجيل الدخول", no crash
[ ] Successful login → navigates to complete-profile (first time)
[ ] Re-login same account → goes straight to main (no duplicate profile row)
[ ] Supabase dashboard shows user with provider=facebook and email present
[ ] EXPO_PUBLIC_USE_MOCK=true still works (mock login, no browser)
```

---

## PART 5 — Going to Production (when you're ready to launch)

While in **Development Mode** only Testers can log in. To open it to everyone:

1. **Business verification / Data handling questions:** Meta Console →
   **App Settings → Basic** — fill **Privacy Policy URL** (required) and app icon.
2. **App Review:** `email` and `public_profile` are *standard access* permissions —
   they normally do **not** need a review for login-only use, but the app must be
   switched to **Live Mode**:
   - Top of the Meta dashboard → toggle **App Mode: Development → Live**.
3. After going Live, any Facebook user can sign in.
4. For Android release builds, add the **release key hash** in
   **Settings → Basic → Android** (same `keytool` command as 1.5 but with your
   release keystore) — only needed if you later adopt the native FB SDK; the
   browser flow used here does not check key hashes.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "App not active" page in browser | App in Dev Mode & user isn't a Tester | Add user in **App Roles → Testers** (they must accept the invite) |
| "URL blocked" error from Facebook | Redirect URI mismatch | **Facebook Login → Settings → Valid OAuth Redirect URIs** must contain exactly `https://mbbbdhyhtqkxakmblzmk.supabase.co/auth/v1/callback` |
| Browser opens, login OK, then nothing returns to the app | Deep link not allowlisted in Supabase | Add `taybatapp://auth/callback` in **Auth → URL Configuration → Redirect URLs** |
| `exchangeCodeForSession` fails / "code verifier" error | Supabase client not in PKCE mode | `lib/supabase.ts` must have `flowType: 'pkce'` (already done in code) |
| User email is `null` in Supabase | `email` permission missing | **Use Cases → Authentication** → ensure `email` says "Ready for testing"; user may also have denied it — have them re-login and grant email |
| "Provider is not enabled" from Supabase | Facebook toggle off or wrong project | Enable provider in **Auth → Providers → Facebook**, check App ID/Secret |
| Crash `Cannot find native module 'ExpoWebBrowser'` | Dev client built before the package was added | Rebuild: `npx expo run:android` / `run:ios` |
| Works on Android, iOS browser never returns | iOS URL scheme missing | `app.json` → `"scheme": "taybatapp"` must exist (it does) — rebuild iOS |

---

## Quick Reference — Who Holds What

```
┌──────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────┐
│   Meta Console       │      │   Supabase Dashboard     │      │   App (.env/code)   │
│──────────────────────│      │──────────────────────────│      │─────────────────────│
│ App ID    (public)   │ ───▶ │ Provider: Facebook       │      │ SUPABASE_URL        │
│ App Secret (SECRET!) │ ───▶ │   client ID + secret     │      │ SUPABASE_ANON_KEY   │
│ Redirect URI:        │      │ Redirect URLs:           │ ◀─── │ deep link:          │
│   …supabase.co/auth/ │      │   taybatapp://auth/      │      │   taybatapp://auth/ │
│   v1/callback        │      │   callback               │      │   callback          │
└──────────────────────┘      └──────────────────────────┘      └─────────────────────┘
        Facebook never sees the app secret in the mobile app — only Supabase uses it.
```
