# OAuth Integration Plan — Google & Facebook
**App:** Al-Taybat · **Updated:** 2026-06-08
**Source:** Official Supabase docs (React Native platform)
- https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=platform&platform=react-native
- https://supabase.com/docs/guides/auth/social-login/auth-facebook

---

## What Exists & What Changes

| Layer | Status | Change needed |
|---|---|---|
| `IAuthRepository.loginWithOAuth()` | ✅ Interface exists | None |
| `AuthRepositoryMock.loginWithOAuth()` | ✅ Works | None |
| `authService.loginWithOAuth()` | ✅ Works | None |
| Auth store action | ✅ Works | None |
| Auth decision screen | ✅ Has buttons | Add Facebook button |
| `AuthRepositorySupabase.loginWithOAuth()` | ❌ Throws `ServerError` | **Replace placeholder** |

Only `AuthRepositorySupabase.loginWithOAuth()` needs real implementation.

---

## Flow Comparison (v1 plan was wrong)

| | v1 Plan (Wrong) | Correct (per docs) |
|---|---|---|
| **Google** | `expo-auth-session` + PKCE + `exchangeCodeForSession` | Native SDK `@react-native-google-signin` + `signInWithIdToken` |
| **Google Supabase secret** | Required | ❌ Not needed for native apps |
| **Facebook** | `expo-auth-session` + PKCE | `supabase.signInWithOAuth(skipBrowserRedirect)` + `expo-web-browser` + `exchangeCodeForSession` |

---

## App Identifiers (from `app.json`)

| Key | Value |
|---|---|
| App scheme | `taybatapp` |
| iOS Bundle ID | `com.tayabat.sys` |
| Android Package | `com.tayabat.sys` |
| Supabase callback | `https://<ref>.supabase.co/auth/v1/callback` |
| Mobile deep link | `taybatapp://auth/callback` |

---

## Packages to Install

```bash
# Google native sign-in SDK
npm install @react-native-google-signin/google-signin

# Facebook OAuth via browser (already available in Expo SDK 54)
npx expo install expo-web-browser
```

> `expo-web-browser` is likely already installed — check `package.json` first.
> `expo-auth-session` is NOT needed.

---

## PART A — Google OAuth

### A1. Google Cloud Console Setup

**URL:** https://console.cloud.google.com/apis/credentials

#### Step 1 — OAuth Consent Screen
1. Go to **APIs & Services → OAuth consent screen**
2. User type: **External** → **Create**
3. App name: `Al-Taybat`, support email, developer email → **Save**
4. Scopes → Add: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
5. Test users → add your test Google account email

#### Step 2 — Create Credentials (2 clients total)

Go to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**

**Client 1 — Web Application** (used by Supabase + `GoogleSignin.configure` on all platforms)
- Type: **Web application**
- Name: `taybat-web`
- Authorized redirect URIs: `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`
- **Save → copy Client ID** (this is `GOOGLE_WEB_CLIENT_ID`)
- **No secret needed** — native apps don't send it

**Client 2 — Android**
- Type: **Android**
- Name: `taybat-android`
- Package name: `com.tayabat.sys`
- SHA-1 fingerprint — run this to get it:
  ```bash
  # Debug (for development):
  keytool -keystore ~/.android/debug.keystore -list -v \
    -alias androiddebugkey -storepass android -keypass android
  # Copy the SHA1: line from the output
  ```
- **Save → copy Client ID** (this is `GOOGLE_ANDROID_CLIENT_ID`)

> iOS automatically uses the Web Client ID — no separate iOS OAuth client needed for native SDK flow.

#### Step 3 — Configure Scopes

1. Go to **APIs & Services → Data Access (Scopes)**  
   URL: https://console.cloud.google.com/auth/scopes
2. Verify these 3 are listed:
   - `openid` (add manually if missing)
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`

---

### A2. Supabase Dashboard — Google

**URL:** `https://supabase.com/dashboard/project/<YOUR_REF>/auth/providers`

1. Find **Google** → toggle **Enable**
2. **Client ID**: paste your `GOOGLE_WEB_CLIENT_ID`
3. **Client Secret**: leave empty (native apps don't need it)
4. **Save**

> Do NOT add the Android Client ID here — it goes only in your app code.

---

### A3. Supabase URL Configuration

**URL:** `https://supabase.com/dashboard/project/<YOUR_REF>/auth/url-configuration`

Add to **Redirect URLs**:
```
taybatapp://auth/callback
taybatapp://
```

---

### A4. Expo / `app.json` — Google

No changes needed in `app.json` for the native Google SDK on Android.

For **iOS** add the reversed Web Client ID as a URL scheme (required so Google can redirect back):

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tayabat.sys",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.XXXXXXXX-YYYYYY"
            ]
          }
        ]
      }
    }
  }
}
```

Replace `XXXXXXXX-YYYYYY` with the suffix of your Web Client ID.
Example: if `GOOGLE_WEB_CLIENT_ID = 123456789-abc.apps.googleusercontent.com`
→ scheme = `com.googleusercontent.apps.123456789-abc`

---

### A5. Environment Variables

Add to `.env.local`:

```env
# Google OAuth — Web Client ID (used on all platforms)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

---

### A6. Google Sign-In Initialization

Configure once at app startup. Add to your root `_layout.tsx` (or `app/_layout.tsx`) before the router renders:

```typescript
// app/_layout.tsx — add near the top, outside any component
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  // scopes: ['profile', 'email'],  // optional — defaults cover these
});
```

Call this once — it does not need to be inside a component or effect.

---

### A7. Google Code in `AuthRepositorySupabase`

Replace the `loginWithOAuth` method in [repositories/auth/AuthRepositorySupabase.ts](repositories/auth/AuthRepositorySupabase.ts):

```typescript
// New imports to add at the top of AuthRepositorySupabase.ts:
import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import * as WebBrowser from 'expo-web-browser';
import { AppError } from '@/shared/errors/AppError';

// Replace the loginWithOAuth method:
async loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthSession> {
  log.debug('[Auth] loginWithOAuth →', provider);

  if (provider === 'google') {
    return this.loginWithGoogle();
  }
  if (provider === 'facebook') {
    return this.loginWithFacebook();
  }

  throw new ServerError();
}

private async loginWithGoogle(): Promise<AuthSession> {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (!isSuccessResponse(response)) {
      throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
    }

    const idToken = response.data.idToken;
    if (!idToken) throw new ServerError();

    const { data, error } = await this.client.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    log.debug('[Auth] Google signInWithIdToken ←', { hasSession: !!data?.session, error });
    if (error) throw this.mapError(error);
    if (!data.session) throw new ServerError();

    return this.toSession(data.session);
  } catch (error: unknown) {
    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new AppError('OAUTH_CANCELED', 'جاري تسجيل الدخول بالفعل');
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new AppError('OAUTH_CANCELED', 'خدمات Google غير متاحة');
      }
    }
    throw error;
  }
}
```

---

## PART B — Facebook OAuth

### B1. Meta Developer Console Setup

**URL:** https://developers.facebook.com/apps/

#### Step 1 — Create App
1. Click **Create App**
2. Use case: **Authenticate and request data from users with Facebook Login**
3. App name: `Al-Taybat`, contact email → **Create App**

#### Step 2 — Configure Facebook Login
1. In left sidebar → **Add Product** → **Facebook Login → Set Up → Other**
2. Go to **Facebook Login → Settings** in the sidebar
3. Add to **Valid OAuth Redirect URIs**:
   ```
   https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
4. **Save Changes**

#### Step 3 — Enable Email Permission (critical)
Without this, Facebook won't return the user's email and auth may fail.

1. Left sidebar → **Use Cases** → **Authentication and Account Creation**
2. Click **Edit** → find `email` permission
3. Status must say **"Ready for testing"**
4. If missing, click **Add** → add `email` scope

#### Step 4 — Get Credentials
1. Go to **Settings → Basic**
2. Copy **App ID**
3. Click **Show** next to App Secret → copy it

#### Step 5 — Add Platforms
Still in **Settings → Basic → scroll down → Add Platform**:
- **iOS**: Bundle ID = `com.tayabat.sys`
- **Android**: Google Play Package Name = `com.tayabat.sys`

#### Step 6 — Add Test Users (dev mode)
While app is in development mode, only listed users can log in.

1. Left sidebar → **App Roles → Roles**
2. **Add Testers** → enter Facebook account usernames/emails
3. Users must accept the invitation (they'll see it in Facebook notifications)

---

### B2. Supabase Dashboard — Facebook

**URL:** `https://supabase.com/dashboard/project/<YOUR_REF>/auth/providers`

1. Find **Facebook** → toggle **Enable**
2. **Client ID**: paste your Facebook **App ID**
3. **Client Secret**: paste your Facebook **App Secret**
4. **Save**

---

### B3. Facebook Code in `AuthRepositorySupabase`

Add this private method (alongside `loginWithGoogle` from Part A):

```typescript
private async loginWithFacebook(): Promise<AuthSession> {
  // Step 1: Get the Supabase OAuth URL (with PKCE code verifier stored internally)
  const { data, error } = await this.client.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: 'taybatapp://auth/callback',
      skipBrowserRedirect: true,  // we handle the browser ourselves
    },
  });

  if (error || !data.url) throw this.mapError(error ?? new Error('No OAuth URL'));

  // Step 2: Open Facebook login in system browser
  const result = await WebBrowser.openAuthSessionAsync(data.url, 'taybatapp://');

  if (result.type !== 'success') {
    throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
  }

  // Step 3: Extract the authorization code from the deep link
  const url = new URL(result.url);
  const code = url.searchParams.get('code');
  if (!code) {
    log.error('[Auth] Facebook callback missing code param', result.url);
    throw new ServerError();
  }

  // Step 4: Exchange code for session (Supabase handles PKCE verifier automatically)
  const { data: sessionData, error: sessionError } = await this.client.auth.exchangeCodeForSession(code);

  log.debug('[Auth] Facebook exchangeCodeForSession ←', { hasSession: !!sessionData?.session, sessionError });
  if (sessionError) throw this.mapError(sessionError);
  if (!sessionData.session) throw new ServerError();

  return this.toSession(sessionData.session);
}
```

---

## PART C — Error Handling Update

Add `'OAUTH_CANCELED'` to `AppError` error handling in [shared/errors/AppError.ts](shared/errors/AppError.ts):

```typescript
// In toUserMessage() — add this case:
case 'OAUTH_CANCELED':
  return 'تم إلغاء تسجيل الدخول';
```

---

## PART D — Add Facebook Button to Auth Screen

### D1. Add `'facebook'` to `AuthProvider` type

In [types/index.ts](types/index.ts) (or wherever `AuthProvider` is defined):

```typescript
export type AuthProvider = 'email' | 'google' | 'apple' | 'facebook' | 'guest';
```

### D2. Update `SocialAuthButtons` component

In [components/auth/SocialAuthButtons.tsx](components/auth/SocialAuthButtons.tsx), add the Facebook button case:

```tsx
case 'facebook':
  return (
    <Pressable
      key="facebook"
      onPress={() => handleOAuth('facebook')}
      disabled={isLoading}
      style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
    >
      <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
      <AppText variant="semibold" className="text-app-text text-[15px]">
        {t('auth.decision.continueWithFacebook')}
      </AppText>
    </Pressable>
  );
```

### D3. Add i18n key

In [localization/translations/ar.json](localization/translations/ar.json):
```json
"auth": {
  "decision": {
    "continueWithFacebook": "متابعة مع Facebook"
  }
}
```

In [localization/translations/en.json](localization/translations/en.json):
```json
"auth": {
  "decision": {
    "continueWithFacebook": "Continue with Facebook"
  }
}
```

---

## Full Implementation Sequence

### Phase 1 — Google (do this first, simpler)

| # | Task | Where |
|---|---|---|
| 1 | `npm install @react-native-google-signin/google-signin` | terminal |
| 2 | Create Web OAuth client in Google Cloud Console | browser |
| 3 | Create Android OAuth client + get SHA-1 | browser + terminal |
| 4 | Enable Google provider in Supabase dashboard | browser |
| 5 | Add `taybatapp://auth/callback` to Supabase redirect URLs | browser |
| 6 | Add reversed Web Client ID scheme to `app.json` (iOS only) | `app.json` |
| 7 | Add `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` to `.env.local` | `.env.local` |
| 8 | Call `GoogleSignin.configure()` in `app/_layout.tsx` | `app/_layout.tsx` |
| 9 | Replace `loginWithOAuth` in `AuthRepositorySupabase` | `repositories/auth/AuthRepositorySupabase.ts` |
| 10 | Add OAUTH_CANCELED to `toUserMessage()` | `shared/errors/AppError.ts` |
| 11 | `npx expo run:ios` and test | simulator |
| 12 | `npm run lint && npm run typecheck` | terminal |

### Phase 2 — Facebook

| # | Task | Where |
|---|---|---|
| 1 | `npx expo install expo-web-browser` (if not installed) | terminal |
| 2 | Create app in Meta Developer Console | browser |
| 3 | Add Supabase callback URI to Facebook Login settings | browser |
| 4 | Enable email permission in Use Cases | browser |
| 5 | Add test users in App Roles → Testers | browser |
| 6 | Enable Facebook provider in Supabase dashboard | browser |
| 7 | Add `EXPO_PUBLIC_FACEBOOK_APP_ID` to `.env.local` (optional — not needed in code, only Supabase dashboard) | — |
| 8 | Add `loginWithFacebook()` private method to `AuthRepositorySupabase` | `repositories/auth/AuthRepositorySupabase.ts` |
| 9 | Add `'facebook'` to `AuthProvider` type | `types/index.ts` |
| 10 | Add Facebook button to `SocialAuthButtons` | `components/auth/SocialAuthButtons.tsx` |
| 11 | Add i18n key | `localization/translations/ar.json` + `en.json` |
| 12 | Test with a listed Tester account | device/simulator |

---

## Environment Variables Summary

```env
# .env.local — never commit this file

# Google
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Facebook App ID is NOT needed in the app — only in Supabase dashboard
# Facebook App Secret stays ONLY in Supabase dashboard
```

> Secrets (App Secret, Client Secret) go ONLY into the Supabase dashboard. Never in the app or `.env`.

---

## Testing Checklist

```
Google:
  [ ] Google sign-in sheet opens (iOS) / activity starts (Android)
  [ ] Cancel → Arabic message shown, no crash
  [ ] Successful login → navigates to complete-profile (first time) or main
  [ ] Re-login with same Google account → goes to main (no new profile row)
  [ ] EXPO_PUBLIC_USE_MOCK=true → mock OAuth still works (no real SDK calls)

Facebook:
  [ ] Test account is listed in Meta Console → App Roles → Testers
  [ ] Facebook login opens browser tab
  [ ] Cancel / dismiss → Arabic message shown, no crash
  [ ] Successful login → navigates correctly
  [ ] User email is returned (check Supabase auth.users in dashboard)

Both:
  [ ] npm run typecheck — no errors
  [ ] npm run lint — no errors
```

---

## Common Issues & Fixes

| Issue | Cause | Fix |
|---|---|---|
| `PLAY_SERVICES_NOT_AVAILABLE` | Android emulator without Play Services | Use a device or AVD with Play Services |
| Google sign-in shows wrong account | `webClientId` mismatch | Must use Web Client ID, NOT Android Client ID |
| iOS Google button does nothing | Missing reversed URL scheme in `app.json` | Add `com.googleusercontent.apps.XXXX` scheme |
| `redirect_uri_mismatch` | Supabase callback not in Google Console | Add exact `https://<ref>.supabase.co/auth/v1/callback` |
| Facebook "App not setup" | User not listed as Tester in dev mode | Add user in Meta Console → App Roles → Testers |
| Facebook email null | Email permission not enabled | Check Use Cases → email shows "Ready for testing" |
| `exchangeCodeForSession` fails | `taybatapp://auth/callback` missing in Supabase | Add it in Authentication → URL Configuration |
| Browser opens then nothing happens | `skipBrowserRedirect: true` forgotten | Required for mobile OAuth — must be set |

---

## Useful Links

| Resource | URL |
|---|---|
| Supabase Google OAuth (React Native) | https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=platform&platform=react-native |
| Supabase Facebook OAuth | https://supabase.com/docs/guides/auth/social-login/auth-facebook |
| Google Cloud Console (Credentials) | https://console.cloud.google.com/apis/credentials |
| Google Cloud Console (Scopes) | https://console.cloud.google.com/auth/scopes |
| Google Cloud Console (Consent Screen) | https://console.cloud.google.com/apis/credentials/consent |
| `@react-native-google-signin` Expo setup | https://react-native-google-signin.github.io/docs/setting-up/expo |
| Meta Developer Console | https://developers.facebook.com/apps/ |
| Supabase Auth Providers | https://supabase.com/dashboard/project/_/auth/providers |
| Supabase URL Configuration | https://supabase.com/dashboard/project/_/auth/url-configuration |
| SHA-1 fingerprint guide | https://developers.google.com/android/guides/client-auth |
