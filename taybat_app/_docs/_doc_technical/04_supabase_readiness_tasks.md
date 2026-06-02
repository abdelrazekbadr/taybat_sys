# Supabase Readiness — Auth Review & Task List
### What needs to change before `EXPO_PUBLIC_USE_MOCK=false` works

---

## Review Summary

The auth architecture is well-designed. The repository pattern, factory, service layer, and error hierarchy are all sound. However, **6 blocking bugs** exist that will cause crashes or incorrect behavior the moment you switch to real Supabase. There are also 4 important improvements needed for production quality.

---

## Bug Map

```
┌───────────────────────────────────────────────────────────────────────┐
│  BLOCKING — will crash or misbehave with EXPO_PUBLIC_USE_MOCK=false   │
├────┬──────────────────────────────────────────────────────────────────┤
│ B1 │ Auth guard bypasses complete-profile screen (navigation bug)     │
│ B2 │ Dual user identity (User = number ID vs UserProfile = UUID)      │
│ B3 │ user.store still hardcoded on MOCK_USER, never reads real auth   │
│ B4 │ All non-auth repositories use userId: number (must be string)    │
│ B5 │ Supabase signUp throws when email confirmation is enabled        │
│ B6 │ OAuth on mobile is unimplemented — always throws ServerError     │
├────┴──────────────────────────────────────────────────────────────────┤
│  IMPORTANT — will cause silent failures or poor UX in production      │
├────┬──────────────────────────────────────────────────────────────────┤
│ I1 │ No supabase.auth.onAuthStateChange listener                      │
│ I2 │ mapError() in AuthRepositorySupabase too narrow                  │
│ I3 │ plan_start_date never set during profile completion              │
│ I4 │ getProfile() uses .single() instead of .maybeSingle()           │
└────┴──────────────────────────────────────────────────────────────────┘
```

---

## Blocking Bugs — Detailed Analysis

### B1 — Auth guard bypasses `complete-profile` screen

**File:** `app/_layout.tsx:129`

**The bug:**
```typescript
// Current guard logic
if (isAccessible && inAuth) {
  router.replace('/(main)' as never);  // ← fires for ANY (auth) screen
}
```

When a new user signs up → `status = 'authenticated'` → guard fires → sees `isAccessible && inAuth` (because `complete-profile` is inside `(auth)`) → immediately redirects to `/(main)`.

New users **never reach** `complete-profile`. They go straight to main with an incomplete profile.

**Fix needed in `app/_layout.tsx`:**
```typescript
// Replace the isAccessible && inAuth block with:
if (isAccessible && inAuth) {
  const user = useAuthStore.getState().user;
  // Allow authenticated users to stay on complete-profile if profile is incomplete
  const isOnCompleteProfile = segments[1] === 'complete-profile';
  if (isOnCompleteProfile && user && !user.profile_completed) {
    return; // do NOT redirect, let them complete the profile
  }
  router.replace('/(main)' as never);
}
```

---

### B2 — Dual user identity model

**Files:** `types/index.ts`, `types/auth.types.ts`

**The bug:**

The app has two unrelated `user` concepts with different ID types:

| Type | Store | `id` type | Source |
|---|---|---|---|
| `User` | `user.store` | `number` (e.g. 1, 2) | Mock seed data |
| `AuthUser` | `auth.store` | `string` UUID | Supabase auth |
| `UserProfile` | auth service | `string` UUID | Supabase `profiles` table |

With Supabase, the user ID is always a UUID like `"a7f3bc2d-..."`. But `User.id` is `number` and all stores/repositories accept `userId: number`.

**Fix needed:**

The `User` type in `types/index.ts` must be unified with the Supabase-based `UserProfile`. The downstream types (`UserMeal.user_id`, `WeeklyRating.user_id`, etc.) must all change from `number` to `string`.

**Step 1 — Update `types/index.ts`:** Remove old `User` interface, replace with Supabase-compatible shape:
```typescript
// REMOVE the old User interface (id: number, subscriber_id, etc.)
// REPLACE with:
export interface User {
  id: string;                    // UUID from auth.users
  email: string;
  name: string | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  plan_start_date: string | null;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  post_visibility: PostVisibility;
  follow_permission: FollowPermission;
  profile_completed: boolean;
}
```

**Step 2 — Update dependent types in `types/index.ts`:**
```typescript
// UserMeal.user_id: number → string
// WeeklyRating.user_id: number → string
// CommunityPost.user_id: number → string
```

---

### B3 — `user.store` is hardcoded to `MOCK_USER`

**File:** `stores/user.store.ts:51-68`

**The bug:**
```typescript
// Current initializeUser() — always starts from MOCK_USER
const user: User = {
  ...MOCK_USER,                   // ← hardcoded mock base
  name: savedName ?? MOCK_USER.name,
  // ...
};
```

After a real Supabase login, `user.store` still contains the mock user's ID (`1`) and mock data. Every store that calls `useUserStore.getState().user` gets the wrong user.

**Fix needed in `stores/user.store.ts`:**

`user.store` must no longer manage its own initialization from storage. Instead, after `auth.store` successfully authenticates, it should populate `user.store` from the `UserProfile`:

```typescript
// Remove MOCK_USER dependency entirely
// Add a new action: setUserFromProfile(profile: UserProfile)
// Called from auth.store after login/signup/session restore
setUserFromProfile: (profile: UserProfile) => {
  set({
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: null,
      avatar_config: null,
      plan_start_date: profile.plan_start_date ?? null,
      language: 'ar',
      theme: 'system',
      post_visibility: 'public',
      follow_permission: 'everyone',
      profile_completed: profile.profile_completed,
    },
    isLoading: false,
  });
},
```

In `auth.store.ts`, after every successful auth call:
```typescript
// After set({ status: 'authenticated', user: result.user, ... })
useUserStore.getState().setUserFromProfile(result.profile);
```

---

### B4 — Repositories use `userId: number`, Supabase uses UUID strings

**Files:** `repositories/tracking/ITrackingRepository.ts`, `repositories/community/ICommunityRepository.ts`, `repositories/account/IAccountRepository.ts`, `repositories/ratings/IRatingRepository.ts`

**The bug:** All non-auth repositories accept `userId: number`. With Supabase, the user ID is always a UUID string. The Supabase implementations will fail when a UUID string like `"a7f3bc2d-..."` is passed where `number` is expected, and TypeScript will produce errors.

**Fix needed — change `userId: number` to `userId: string` in ALL 4 repository interfaces and both their implementations (Mock + Supabase):**

```typescript
// ITrackingRepository.ts
export interface CreateUserMealPayload {
  userId: string;  // was number
  ...
}
export interface ITrackingRepository {
  getUserMeals(userId: string): Promise<UserMeal[]>;
  getMealsByDate(userId: string, date: string): Promise<UserMeal[]>;
  logMeal(payload: CreateUserMealPayload): Promise<UserMeal>;
  replaceMeal(userMealId: number, payload: CreateUserMealPayload): Promise<UserMeal>;
}

// ICommunityRepository.ts
export interface ICommunityRepository {
  getReactions(userId: string): Promise<number[]>;
  getFollows(userId: string): Promise<number[]>;
  toggleReaction(userId: string, postId: number): Promise<number[]>;
  toggleFollow(userId: string, targetUserId: string): Promise<number[]>;
}

// IAccountRepository.ts — all userId params: number → string

// IRatingRepository.ts
export interface CreateRatingPayload { userId: string; ... }
export interface IRatingRepository {
  getRatings(userId: string): Promise<WeeklyRating[]>;
  submitRating(payload: CreateRatingPayload): Promise<WeeklyRating>;
}
```

Also update `UserMeal.user_id`, `WeeklyRating.user_id`, `CommunityPost.user_id` in `types/index.ts` (linked to B2 fix).

---

### B5 — Supabase signUp throws when email confirmation is enabled

**File:** `repositories/auth/AuthRepositorySupabase.ts:21`

**The bug:**
```typescript
async signUpWithEmail(payload: SignUpPayload): Promise<AuthSession> {
  const { data, error } = await this.client.auth.signUp({ ... });
  if (error) throw this.mapError(error);
  if (!data.session) throw new ServerError();  // ← fires when email confirmation is ON
  return this.toSession(data.session);
}
```

When Supabase's "Confirm email" setting is enabled (default in production), `signUp()` returns `data.session = null` because the user must verify their email first. The current code throws `ServerError` for every signup attempt.

**Fix needed:**

**Step 1 — Add new error type in `shared/errors/AppError.ts`:**
```typescript
export class EmailConfirmationRequiredError extends AppError {
  constructor() {
    super('EMAIL_CONFIRMATION_REQUIRED', 'تم إرسال رابط التحقق إلى بريدك الإلكتروني');
    this.name = 'EmailConfirmationRequiredError';
  }
}
// Also add 'EMAIL_CONFIRMATION_REQUIRED' to ErrorCode union
```

**Step 2 — Update `AuthRepositorySupabase.signUpWithEmail`:**
```typescript
if (!data.session) {
  // Email confirmation required — not an error, expected flow
  throw new EmailConfirmationRequiredError();
}
```

**Step 3 — Handle in `auth.service.ts` `signUpWithEmail`:**
```typescript
async signUpWithEmail(payload: SignUpPayload): Promise<AuthResult | 'email_confirmation_required'> {
  try {
    const session = await authRepository.signUpWithEmail(payload);
    // ... rest of flow
  } catch (error: unknown) {
    if (error instanceof EmailConfirmationRequiredError) {
      return 'email_confirmation_required';
    }
    throw new Error(toUserMessage(error));
  }
}
```

**Step 4 — Handle in `auth.store.ts` `signUpWithEmail`:**
```typescript
signUpWithEmail: async (payload) => {
  // ...
  const result = await authService.signUpWithEmail(payload);
  if (result === 'email_confirmation_required') {
    set({ status: 'unauthenticated', isLoading: false, pendingEmailConfirmation: true });
    return 'pending_confirmation';
  }
  // ...
}
```

**Step 5 — Create `app/(auth)/verify-email.tsx` screen:**
A simple screen showing: "تم إرسال رابط التفعيل إلى [email]. افتح بريدك الإلكتروني وانقر على الرابط للمتابعة." with a "Resend" button and a "Back to login" link.

**Alternatively (for development):** Disable email confirmation in Supabase → Authentication → Email → turn OFF "Confirm email". This makes signup work immediately without this complexity. Use this approach during development and enable confirmation only for production.

---

### B6 — OAuth on mobile is unimplemented for Supabase

**File:** `repositories/auth/AuthRepositorySupabase.ts:35-44`

**The bug:**
```typescript
async loginWithOAuth(provider: ...): Promise<AuthSession> {
  const { data, error } = await this.client.auth.signInWithOAuth({ provider });
  // ...
  throw new ServerError(); // ← always throws — OAuth is not implemented
}
```

The login screen shows Google and Facebook buttons. With `USE_MOCK=false`, pressing either will always throw an error.

**On mobile, OAuth flow is fundamentally different from web.** `signInWithOAuth` opens a browser but there is no built-in redirect back. You need either:
- **`expo-auth-session`** (recommended for Expo) — handles the full OAuth + code exchange + deep link return
- **`@react-native-google-signin/google-signin`** (for Google specifically) with `supabase.auth.signInWithIdToken()`

**Fix options (pick one):**

**Option A — Hide OAuth buttons when `USE_MOCK=false` (quickest, ship later):**
```typescript
// In login.tsx
const { rowDir } = useRTL();
const isUsingMock = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

// Only render social buttons in mock mode
{isUsingMock ? (
  <View className="flex-row gap-3">
    {/* Google + Facebook buttons */}
  </View>
) : null}
```

**Option B — Implement Google OAuth properly with `expo-auth-session`:**

Install: `npx expo install expo-auth-session expo-crypto`

Add to `app.json`:
```json
{
  "expo": {
    "scheme": "taybat",
    "ios": { "bundleIdentifier": "com.taybat.app" },
    "android": { "package": "com.taybat.app" }
  }
}
```

In `repositories/auth/AuthRepositorySupabase.ts`:
```typescript
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

async loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthSession> {
  const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'taybat' });
  const { data, error } = await this.client.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw this.mapError(error ?? { message: 'OAuth failed' });

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  if (result.type !== 'success') throw new ServerError({ message: 'OAuth cancelled' });

  const params = new URL(result.url).hash
    .slice(1)
    .split('&')
    .reduce((acc, p) => { const [k, v] = p.split('='); acc[k] = v; return acc; }, {} as Record<string, string>);

  const { data: sessionData, error: sessionError } =
    await this.client.auth.setSession({
      access_token: params['access_token'],
      refresh_token: params['refresh_token'],
    });
  if (sessionError || !sessionData.session) throw this.mapError(sessionError ?? { message: 'Session failed' });
  return this.toSession(sessionData.session);
}
```

Also add to Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `taybat://` (or your actual scheme)
- Redirect URLs: `taybat://auth/callback`

---

## Important Issues

### I1 — No `supabase.auth.onAuthStateChange` listener

**Without this:** The app doesn't know when Supabase silently refreshes the token, when the user is signed out on another device, or when an OAuth deep-link completes.

**Fix — Add in `api/auth/auth.service.ts`:**
```typescript
subscribeToAuthChanges(callback: (event: string, session: AuthSession | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session) {
      callback('SIGNED_OUT', null);
    } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      callback(event, {
        access_token: session.access_token,
        user_id: session.user.id,
        expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      });
    }
  });
  return () => subscription.unsubscribe();
}
```

**Wire in `stores/auth.store.ts` `initializeAuth`:**
```typescript
initializeAuth: async () => {
  // ... existing init logic ...

  // Subscribe to future auth changes (only once)
  const unsubscribe = authService.subscribeToAuthChanges((event, _session) => {
    if (event === 'SIGNED_OUT') {
      useAuthStore.getState().logout();
    }
    // TOKEN_REFRESHED: no action needed, Supabase client handles it
  });
  // Store cleanup if needed: return unsubscribe in a store field or use a module-level variable
}
```

---

### I2 — `mapError` in `AuthRepositorySupabase` is too narrow

**File:** `repositories/auth/AuthRepositorySupabase.ts:72`

Missing error cases from Supabase:
- Rate limiting: `"Email rate limit exceeded"` or status 429
- Weak password: `"Password should be at least 6 characters"`
- Email not confirmed: `"Email not confirmed"`
- Invalid token: `"invalid claim: missing sub claim"` (expired reset token)

**Fix:**
```typescript
private mapError(error: { message: string; status?: number; code?: string }): Error {
  const msg = error.message ?? '';
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) return new InvalidCredentialsError();
  if (msg.includes('User already registered') || msg.includes('already been registered')) return new EmailAlreadyUsedError();
  if (msg.includes('Email not confirmed')) return new EmailConfirmationRequiredError();
  if (msg.includes('rate limit') || error.status === 429) return new NetworkError(error);
  if (error.status === 0 || msg.toLowerCase().includes('network') || msg.includes('fetch')) return new NetworkError(error);
  return new ServerError(error);
}
```

---

### I3 — `plan_start_date` never set during profile completion

**File:** `app/(auth)/complete-profile.tsx` and `types/auth.types.ts`

`UserProfile` type does not include `plan_start_date`. The `complete-profile` screen collects name/gender/weight/etc. but never sets when the user started the plan. The `user-profile.tsx` screen shows a "days on the journey" counter that will always show 0.

**Fix — Step 1:** Add `plan_start_date` to `UserProfile` in `types/auth.types.ts`:
```typescript
export interface UserProfile {
  // ...existing fields...
  plan_start_date: string | null;  // ADD THIS
}
```

**Fix — Step 2:** Add to DB table (run in Supabase SQL Editor):
```sql
-- Already in setup guide, verify it exists:
alter table public.profiles add column if not exists plan_start_date date;
```

**Fix — Step 3:** Set it on profile completion in `auth.service.ts`:
```typescript
async completeProfile(userId: string, data: ProfileCompletionPayload): Promise<UserProfile> {
  return await userProfileRepository.upsertProfile(userId, {
    ...data,
    plan_start_date: new Date().toISOString().split('T')[0],  // ADD THIS
    profile_completed: true,
  });
}
```

---

### I4 — `UserProfileRepositorySupabase.getProfile` uses `.single()` with error catching

**File:** `repositories/auth/UserProfileRepositorySupabase.ts:31`

Currently: uses `.single()` which throws `PGRST116` when no row found, then catches it. Cleaner pattern:

```typescript
async getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await this.client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();           // returns null if not found — no exception
  if (error) throw new ServerError(error);
  return data as UserProfile | null;
}
```

---

## Complete Task List

Implement in this order — each task unlocks the next.

---

### TASK 1 — Fix the auth guard navigation bug
**Priority: CRITICAL | Files: `app/_layout.tsx`**

**What to change:**
In the `useEffect` that watches `[authStatus, segments]`, change the `isAccessible && inAuth` branch to allow users with an incomplete profile to remain on `complete-profile`:

```typescript
// Replace lines 129-131 in app/_layout.tsx
if (isAccessible && inAuth) {
  const { user } = useAuthStore.getState();
  const isCompleteProfileScreen = segments[1] === 'complete-profile';
  if (isCompleteProfileScreen && user !== null && !user.profile_completed) {
    return; // let them finish the profile wizard
  }
  router.replace('/(main)' as never);
}
```

**Verify:** Sign up as a new user → should land on `complete-profile`, not `/(main)`.

---

### TASK 2 — Unify the user identity model (B2 + B3 + B4 combined)
**Priority: CRITICAL | Files: `types/index.ts`, `types/auth.types.ts`, `stores/user.store.ts`, all repository interfaces**

**Step 2a — Update `types/auth.types.ts`:** Add `plan_start_date` to `UserProfile` and `ProfileCompletionPayload`:
```typescript
export interface UserProfile {
  // ... existing fields ...
  plan_start_date: string | null;  // ADD
}
```

**Step 2b — Rewrite `User` interface in `types/index.ts`** to use `id: string` (UUID) and merge it with `UserProfile`:
```typescript
export interface User {
  id: string;                   // UUID — Supabase auth.users.id
  email: string;
  name: string | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  plan_start_date: string | null;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  post_visibility: PostVisibility;
  follow_permission: FollowPermission;
  profile_completed: boolean;
}
```

**Step 2c — Update related types** in `types/index.ts`:
```typescript
// Change user_id field in all these interfaces:
export interface UserMeal { user_id: string; ... }  // was number
export interface WeeklyRating { user_id: string; ... }  // was number
export interface CommunityPost { user_id: string; ... }  // was number
```

**Step 2d — Update all 4 repository interfaces** (`ITrackingRepository`, `ICommunityRepository`, `IAccountRepository`, `IRatingRepository`): change `userId: number` → `userId: string` in all method signatures and payload types.

**Step 2e — Update all Mock implementations** to accept `userId: string`. The mock data storage keys and in-memory maps use the userId as a key — change from numeric to string.

**Step 2f — Rewrite `stores/user.store.ts`** — remove `MOCK_USER` import, add `setUserFromProfile` action:
```typescript
import { create } from 'zustand';
import type { User } from '@/types';
import type { UserProfile } from '@/types';
import { storageService } from '@/shared/storage/storageService';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';

interface UserState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string;
  setUserFromProfile: (profile: UserProfile) => void;
  updateUser: (updates: Partial<User>) => void;
  resetUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  errorMessage: '',

  setUserFromProfile: (profile) => set({
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: null,
      avatar_config: null,
      plan_start_date: profile.plan_start_date ?? null,
      language: 'ar',
      theme: 'system',
      post_visibility: 'public',
      follow_permission: 'everyone',
      profile_completed: profile.profile_completed,
    },
  }),

  updateUser: (updates) =>
    set((state) => (state.user ? { user: { ...state.user, ...updates } } : state)),

  resetUser: () => set({ user: null, isLoading: false, errorMessage: '' }),
}));
```

**Step 2g — Update `auth.store.ts`** — call `useUserStore.getState().setUserFromProfile(result.profile)` after every successful login/signup. This requires `authService` methods to also return the full `UserProfile` (not just `AuthUser`). Update `AuthResult` and `auth.service.ts` accordingly:

```typescript
// types/auth.types.ts — update AuthResult
export interface AuthResult {
  user: AuthUser;
  profile: UserProfile;         // ADD FULL PROFILE
  profile_completed: boolean;
}

// auth.service.ts — update toAuthUser to also return profile
// authService.loginWithEmail() → return { user: this.toAuthUser(profile), profile, profile_completed: ... }

// auth.store.ts — after every success:
set({ status: 'authenticated', user: result.user, isLoading: false });
useUserStore.getState().setUserFromProfile(result.profile);
```

**Run:** `npm run typecheck` — fix all remaining type errors before proceeding.

---

### TASK 3 — Handle Supabase email confirmation
**Priority: CRITICAL | Files: `shared/errors/AppError.ts`, `repositories/auth/AuthRepositorySupabase.ts`, `api/auth/auth.service.ts`, `stores/auth.store.ts`, new file `app/(auth)/verify-email.tsx`**

**Step 3a — Add `EmailConfirmationRequiredError` to `shared/errors/AppError.ts`:**
```typescript
// Add to ErrorCode union:
| 'EMAIL_CONFIRMATION_REQUIRED'

// Add new class:
export class EmailConfirmationRequiredError extends AppError {
  constructor() {
    super('EMAIL_CONFIRMATION_REQUIRED', 'تم إرسال رابط التحقق إلى بريدك الإلكتروني');
    this.name = 'EmailConfirmationRequiredError';
  }
}
```

**Step 3b — Fix `AuthRepositorySupabase.signUpWithEmail`:**
```typescript
if (!data.session) {
  throw new EmailConfirmationRequiredError();
}
```

**Step 3c — Update `auth.service.ts` `signUpWithEmail`** to return a union type instead of throwing:
```typescript
async signUpWithEmail(payload: SignUpPayload): Promise<AuthResult | null> {
  try {
    const session = await authRepository.signUpWithEmail(payload);
    // ... normal flow
  } catch (error: unknown) {
    if (error instanceof EmailConfirmationRequiredError) {
      return null; // caller handles this as "pending confirmation"
    }
    throw new Error(toUserMessage(error));
  }
}
```

**Step 3d — Update `auth.store.ts` `signUpWithEmail`:**
```typescript
signUpWithEmail: async (payload) => {
  set({ status: 'loading', isLoading: true, errorMessage: '' });
  try {
    const result = await authService.signUpWithEmail(payload);
    if (!result) {
      // Email confirmation required
      set({ status: 'unauthenticated', isLoading: false });
      return 'pending_confirmation';
    }
    set({ status: 'authenticated', user: result.user, isLoading: false });
    useUserStore.getState().setUserFromProfile(result.profile);
    return true;
  } catch (error: unknown) {
    set({ status: 'unauthenticated', isLoading: false, errorMessage: ... });
    return false;
  }
}
// Update return type: Promise<boolean | 'pending_confirmation'>
```

**Step 3e — Update `app/(auth)/signup.tsx`:**
```typescript
const result = await signUpWithEmail({ email, password });
if (result === 'pending_confirmation') {
  router.replace('/(auth)/verify-email' as never);
  return;
}
if (!result) return;
router.replace('/(auth)/complete-profile' as never);
```

**Step 3f — Create `app/(auth)/verify-email.tsx`:**
Simple screen with:
- Title: "تحقق من بريدك الإلكتروني"
- Body: "أرسلنا رابط التحقق. افتح بريدك الإلكتروني وانقر على الرابط للمتابعة."
- "إعادة إرسال" button (calls `authService.sendPasswordReset` — or Supabase's resend API)
- "العودة لتسجيل الدخول" link

**Alternatively (development shortcut):** In Supabase Dashboard → Authentication → Email → disable "Confirm email". This skips this entire task during development. Re-enable for production.

---

### TASK 4 — Wire Supabase auth state listener
**Priority: IMPORTANT | Files: `api/auth/auth.service.ts`, `stores/auth.store.ts`**

**Step 4a — Add `subscribeToAuthChanges` method to `AuthService` in `api/auth/auth.service.ts`:**

```typescript
subscribeToAuthChanges(
  onSignOut: () => void,
): () => void {
  // Only wire in Supabase mode — mock mode has no real auth events
  const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
  if (USE_MOCK) return () => {};

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
    if (event === 'SIGNED_OUT') {
      onSignOut();
    }
    // TOKEN_REFRESHED: Supabase client handles refresh automatically — no action needed here
  });
  return () => subscription.unsubscribe();
}
```

**Step 4b — Call it in `stores/auth.store.ts` `initializeAuth`:**

```typescript
// At module scope (outside the store)
let _unsubscribeAuthListener: (() => void) | null = null;

// Inside initializeAuth, at the end:
_unsubscribeAuthListener?.();
_unsubscribeAuthListener = authService.subscribeToAuthChanges(() => {
  useAuthStore.getState().logout();
});
```

---

### TASK 5 — Fix `mapError` in `AuthRepositorySupabase`
**Priority: IMPORTANT | File: `repositories/auth/AuthRepositorySupabase.ts`**

Replace the current 3-case `mapError`:
```typescript
private mapError(error: { message?: string; status?: number; code?: string }): Error {
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('invalid_grant'))
    return new InvalidCredentialsError();
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return new EmailAlreadyUsedError();
  if (msg.includes('email not confirmed'))
    return new EmailConfirmationRequiredError();
  if (msg.includes('rate limit') || error.status === 429)
    return new NetworkError(error);
  if (error.status === 0 || msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch'))
    return new NetworkError(error);
  return new ServerError(error);
}
```

---

### TASK 6 — Set `plan_start_date` on profile completion
**Priority: IMPORTANT | Files: `api/auth/auth.service.ts`, Supabase SQL**

**Step 6a — Run in Supabase SQL Editor** (if not already added):
```sql
alter table public.profiles add column if not exists plan_start_date date;
```

**Step 6b — Update `auth.service.ts` `completeProfile`:**
```typescript
async completeProfile(userId: string, data: ProfileCompletionPayload): Promise<UserProfile> {
  try {
    return await userProfileRepository.upsertProfile(userId, {
      ...data,
      plan_start_date: new Date().toISOString().split('T')[0],
      profile_completed: true,
    });
  } catch (error: unknown) {
    throw new Error(toUserMessage(error));
  }
}
```

---

### TASK 7 — Fix `UserProfileRepositorySupabase.getProfile`
**Priority: MINOR | File: `repositories/auth/UserProfileRepositorySupabase.ts`**

```typescript
async getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await this.client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();           // clean null-on-missing, no exception
  if (error) throw new ServerError(error);
  return data as UserProfile | null;
}
```

---

### TASK 8 — Handle OAuth on mobile
**Priority: IMPORTANT | File: `repositories/auth/AuthRepositorySupabase.ts`, `app.json`, `app/(auth)/login.tsx`**

**Minimum viable fix (hide buttons in Supabase mode):**

In `app/(auth)/login.tsx`, wrap the social buttons block:
```typescript
const showOAuth = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

// In JSX, replace the two social Pressable blocks with:
{showOAuth ? (
  <View className="flex-row gap-3">
    {/* Google button */}
    {/* Facebook button */}
  </View>
) : null}
```

**Full OAuth implementation:** Follow the code in B6 analysis above (Option B). Install `expo-auth-session`, add `scheme` to `app.json`, configure Supabase redirect URLs, implement the full code exchange flow.

---

## Verification Checklist

After completing all tasks, verify end-to-end with `EXPO_PUBLIC_USE_MOCK=false`:

```
[ ] TASK 1: New user signs up → lands on complete-profile (not main)
[ ] TASK 1: User with completed profile signs up → lands on main
[ ] TASK 2: npm run typecheck passes with zero errors
[ ] TASK 2: After login, user.store.user.id matches Supabase auth.users.id
[ ] TASK 2: All stores that call useUserStore.getState().user get correct UUID
[ ] TASK 3: Signup with "Confirm email" ON → verify-email screen shown
[ ] TASK 3: Signup with "Confirm email" OFF → complete-profile screen shown
[ ] TASK 4: Signing out in Supabase dashboard forces logout in app within seconds
[ ] TASK 5: Wrong password → shows Arabic "البريد أو كلمة المرور غير صحيحة"
[ ] TASK 5: Duplicate email → shows Arabic "هذا البريد الإلكتروني مستخدم بالفعل"
[ ] TASK 6: After completing profile → user-profile screen shows day count > 0
[ ] TASK 7: npm run typecheck passes
[ ] TASK 8: OAuth buttons hidden in Supabase mode (or fully implemented)
[ ] ALL: npm run lint passes with 0 errors
[ ] ALL: npm run typecheck passes with 0 errors
```

---

## Implementation Order

```
TASK 1  →  TASK 2  →  TASK 3  →  TASK 4  →  TASK 5  →  TASK 6  →  TASK 7  →  TASK 8
  ↓           ↓
Fix nav   Unify IDs   (run typecheck after TASK 2 before continuing)
guard     + user.store
```

Tasks 1 and 2 are the most involved. Everything else is straightforward. Once TASK 2 is done and typecheck passes, the app architecture is fully Supabase-compatible.
