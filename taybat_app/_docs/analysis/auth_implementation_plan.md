# Auth Implementation Plan — Al-Taybat App

**Date:** 2026-05-18  
**Branch target:** `feat/auth-flow`  
**Status:** Ready for implementation  
**Data strategy:** Mock-first → Supabase swap (no code change outside API layer)

---

## Decision Summary

| Topic | Decision | Rationale |
| --- | --- | --- |
| First impression | Onboarding → Auth Decision (no forced login) | Reduces friction, better conversion |
| Guest mode | Full app access with soft gates at protected features | Best UX, avoids hard walls |
| Registration steps | 2-step: credentials → profile completion | Reduces drop-off vs single long form |
| OAuth | Google + Apple (Phase 1), Facebook (Phase 2) | Apple required by App Store; Facebook adds complexity |
| Session persistence | Fake token + AsyncStorage (mock) → Supabase session (live) | Same interface, different implementation |
| Route guarding | Store-based flag + Expo Router redirect | Clean, no navigation in stores |
| Profile completion | Separate screen, skippable except required fields | Flexibility + data quality balance |
| **Data layer** | **Mock implementations now, Supabase drop-in later** | **No UI/store changes needed at swap time** |
| **Type naming** | **snake_case for DB-mirrored types (matches Supabase columns)** | **Zero mapping overhead when connecting real DB** |

---

## Supabase Compatibility Strategy

The goal: swap mock ↔ Supabase by changing **one file** — nothing in stores, services, or screens changes.

### Pattern: Interface-driven API Layer

```text
Screens
  ↓ (read state, call actions)
authStore  ←→  auth.service.ts
                    ↓
              IAuthApi / IUserApi   ← interface contract
                    ↓
        ┌───────────┴──────────────┐
        │                          │
  authApi.mock.ts          authApi.supabase.ts
  userApi.mock.ts          userApi.supabase.ts
  (AsyncStorage)           (Supabase client)
```

`api/auth/index.ts` exports the active implementation:

```typescript
// api/auth/index.ts
// Switch this import when connecting Supabase:
export { authApi } from './authApi.mock';      // ← NOW (mock)
export { userApi } from './userApi.mock';       // ← NOW (mock)
// export { authApi } from './authApi.supabase'; // ← LATER
// export { userApi } from './userApi.supabase'; // ← LATER
```

The service imports from `api/auth/index.ts` — it never knows which is active.

---

## Supabase Schema (Reference Only — not implemented now)

Define now, implement later. Types are designed to match this exactly.

### `users` table

```sql
create table users (
  id               uuid primary key references auth.users(id),
  email            text not null,
  name             text,
  gender           text,              -- 'male' | 'female'
  birth_year       int,
  weight_kg        numeric(5,1),
  height_cm        numeric(5,1),
  activity_level   text,              -- 'sedentary' | 'light' | 'moderate' | 'active'
  health_goals     text[],
  provider         text not null,     -- 'email' | 'google' | 'apple'
  profile_completed boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table users enable row level security;
create policy "users_own_row" on users
  for all using (auth.uid() = id);
```

### Supabase Auth user (from `supabase.auth.getUser()`)

Relevant fields our code uses:

```text
id: string (UUID)
email: string
user_metadata.name?: string
user_metadata.avatar_url?: string
app_metadata.provider: string
created_at: string
```

---

## Types (`types/auth.types.ts`)

**Rule:** DB-mirrored fields use `snake_case` to match Supabase columns exactly. No mapping needed at swap time.

```typescript
// === Enums / Literals ===
export type AuthProvider     = 'email' | 'google' | 'apple' | 'guest';
export type AuthStatus       = 'idle' | 'initializing' | 'authenticated' | 'guest' | 'unauthenticated' | 'loading' | 'error';
export type Gender           = 'male' | 'female';
export type ActivityLevel    = 'sedentary' | 'light' | 'moderate' | 'active';

// === DB-mirrored user profile (matches users table columns) ===
export interface UserProfile {
  id: string;                      // uuid — matches auth.users.id
  email: string;
  name: string | null;
  gender: Gender | null;
  birth_year: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: ActivityLevel | null;
  health_goals: string[] | null;
  provider: AuthProvider;
  profile_completed: boolean;
  created_at: string;              // ISO string — matches timestamptz
  updated_at: string;
}

// === Runtime auth user (held in store — subset of UserProfile + session) ===
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;       // from OAuth user_metadata or null
  provider: AuthProvider;
  profile_completed: boolean;
}

// === Input types for write operations ===
export interface SignUpPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// Matches writable subset of users table columns
export interface ProfileCompletionPayload {
  name: string;
  gender?: Gender;
  birth_year?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: ActivityLevel;
  health_goals?: string[];
}

// === Service return type ===
export interface AuthResult {
  user: AuthUser;
  profile_completed: boolean;
}

// === Mock session token (mirrors Supabase session shape minimally) ===
export interface AuthSession {
  access_token: string;
  user_id: string;
  expires_at: number;              // unix timestamp — matches Supabase session
}
```

---

## API Layer Interfaces (`api/auth/types.ts`)

Contracts that both mock and Supabase implementations must satisfy:

```typescript
export interface IAuthApi {
  signUpWithEmail(payload: SignUpPayload): Promise<{ user: AuthUser; session: AuthSession }>;
  loginWithEmail(payload: LoginPayload): Promise<{ user: AuthUser; session: AuthSession }>;
  loginWithOAuth(provider: 'google' | 'apple'): Promise<{ user: AuthUser; session: AuthSession }>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  sendPasswordReset(email: string): Promise<void>;
  // Supabase-only: onAuthStateChange — not mocked, guard with flag in service
}

export interface IUserApi {
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getProfile(userId: string): Promise<UserProfile | null>;
}
```

---

## Mock Implementation

### `api/auth/authApi.mock.ts`

Simulates auth with AsyncStorage. All operations resolve after a fake 600ms delay.

```text
Mock behaviors:
  signUpWithEmail  → generate uuid, store {user, session} to AsyncStorage, return both
  loginWithEmail   → load stored users, match email+password (simple compare), return session
  loginWithOAuth   → generate a fake OAuth user with email = `mock+{provider}@taybat.app`
  logout           → delete session from AsyncStorage
  getSession       → read session from AsyncStorage, check expires_at
  sendPasswordReset → log to console, resolve (no actual email in mock)
```

Session stored at: `STORAGE_KEYS.AUTH_SESSION`  
Users stored at: `STORAGE_KEYS.MOCK_AUTH_USERS` (mock-only key, removed at swap)

### `api/auth/userApi.mock.ts`

```text
Mock behaviors:
  upsertProfile → read profile map from storage, merge data, write back, return merged
  getProfile    → read profile map from storage, return by userId or null
```

Profiles stored at: `STORAGE_KEYS.MOCK_USER_PROFILES` (mock-only key)

### Mock delay helper

```typescript
// utils/mockDelay.ts
export const mockDelay = (ms = 600) => new Promise(r => setTimeout(r, ms));
```

---

## Service Layer (`api/auth/auth.service.ts`)

Imports from `api/auth/index.ts` — completely unaware of mock vs Supabase:

```typescript
import { authApi, userApi } from '@/api/auth';

class AuthService {
  async loginWithEmail(payload: LoginPayload): Promise<AuthResult>
  async signUpWithEmail(payload: SignUpPayload): Promise<AuthResult>
  async loginWithOAuth(provider: 'google' | 'apple'): Promise<AuthResult>
  async completeProfile(userId: string, data: ProfileCompletionPayload): Promise<UserProfile>
  async getSessionAndProfile(): Promise<AuthResult | null>
  async logout(): Promise<void>
  async sendPasswordReset(email: string): Promise<void>

  // private
  private async ensureProfileRow(userId: string, email: string, provider: AuthProvider): Promise<void>
  private mapError(error: unknown): string
}
```

**Error mapping (Arabic):**

```typescript
const ERROR_MAP: Record<string, string> = {
  'User already registered':    'هذا البريد الإلكتروني مستخدم بالفعل',
  'Invalid login credentials':  'البريد أو كلمة المرور غير صحيحة',
  'Email not confirmed':        'يرجى تأكيد بريدك الإلكتروني أولاً',
  'Network request failed':     'تحقق من اتصالك بالإنترنت',
  'MOCK_USER_NOT_FOUND':        'البريد أو كلمة المرور غير صحيحة',  // mock error
  '__default__':                'حدث خطأ ما. حاول مرة أخرى',
};
```

---

## Auth Store (`stores/auth.store.ts`)

No awareness of mock vs Supabase — calls `authService` only:

```typescript
interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  errorMessage: string;

  initializeAuth: () => Promise<void>;
  loginWithEmail: (payload: LoginPayload) => Promise<boolean>;
  signUpWithEmail: (payload: SignUpPayload) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<boolean>;
  completeProfile: (data: ProfileCompletionPayload) => Promise<boolean>;
  setGuestMode: () => void;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
  resetAuth: () => void;
}
```

**State machine:**

```text
idle → initializing → authenticated | unauthenticated | guest
unauthenticated | guest → loading (on login/signup)
loading → authenticated | unauthenticated (on result)
authenticated → loading (on logout)
loading → unauthenticated (on signout)
any → error (on unexpected error)
error → unauthenticated (on clearError)
```

---

## Navigation Flow

```text
App Start
  └── /splash  (check existing session via authStore.initializeAuth)
        ├── status = authenticated → /(main)
        ├── status = unauthenticated + has_seen_onboarding → /(auth)/auth-decision
        └── status = unauthenticated + first launch → /(auth)/onboarding

/(auth)/onboarding  (carousel, 4 slides)
  └── Last slide CTA → /(auth)/auth-decision  [set HAS_SEEN_ONBOARDING = true]

/(auth)/auth-decision
  ├── إنشاء حساب    → /(auth)/signup
  ├── لدي حساب      → /(auth)/login
  ├── Google         → [mock OAuth] → complete-profile or main
  ├── Apple          → [mock OAuth] → complete-profile or main
  └── تصفح أولاً    → /(main)  [guest mode]

/(auth)/signup       → on success → /(auth)/complete-profile
/(auth)/login        → on success → complete-profile or /(main)
/(auth)/complete-profile  → on save/skip → /(main)
/(auth)/reset-password    → standalone (no auto-navigate after)

/(main)/*
  └── Protected actions → AuthGateSheet bottom sheet (soft gate for guests)
```

---

## Screen Specifications

### 1. `/splash` — Updated

```typescript
// Splash priority logic (replaces current 5s timer approach):
1. Wait for fonts + i18n (already handled by _layout.tsx)
2. Call authStore.initializeAuth()  ← NEW
3. Route based on status:
   - 'authenticated' → router.replace('/(main)')
   - 'unauthenticated' + HAS_SEEN_ONBOARDING → router.replace('/(auth)/auth-decision')
   - 'unauthenticated' + first launch  → router.replace('/(auth)/onboarding')
```

Keep the animated loader — it shows during `initializeAuth` (which has mock delay).

---

### 2. `/(auth)/auth-decision` — New Screen

Layout (RTL, full-height scroll-safe):

```text
[Logo / Illustration]
[Title: "انضم إلى مجتمع التايبات"]
[Subtitle: "ابدأ رحلتك نحو صحة أفضل"]

[── سجّل الدخول بـ ──]
[ 🅶  متابعة مع Google  ]
[ 🍎  متابعة مع Apple   ]

[── أو بالبريد الإلكتروني ──]
[ إنشاء حساب جديد ]  ← primary button
[ لدي حساب بالفعل ]  ← outlined button

[────────────────────]
[ تصفح التطبيق أولاً ]  ← text link (muted color)
```

---

### 3. `/(auth)/login` — New Screen

Fields: Email, Password (SecureEntry)  
Links: "لا تملك حساباً؟ أنشئ حساباً" | "نسيت كلمة المرور؟"

Zod schema:

```typescript
z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
})
```

---

### 4. `/(auth)/signup` — New Screen

Fields: Email, Password, Confirm Password  
Link: "لديك حساب بالفعل؟ سجّل الدخول"

Zod schema:

```typescript
z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})
```

---

### 5. `/(auth)/complete-profile` — New Screen (3-step wizard)

Progress indicator at top (3 dots or bar).

```text
Step 1 — المعلومات الأساسية
  • الاسم الكامل    [TextInput]  ← required
  • الجنس           [ChipSelector: ذكر / أنثى]
  • سنة الميلاد     [NumberInput or Picker]

Step 2 — المعلومات الصحية
  • الوزن (كجم)     [NumberInput]
  • الطول (سم)      [NumberInput]
  • مستوى النشاط    [ChipSelector: خامل / خفيف / متوسط / نشط]

Step 3 — هدفك الصحي  (multi-select chips)
  • تقليل الالتهابات
  • تحسين الهضم
  • فقدان الوزن
  • تحسين الطاقة
  • متابعة حالة صحية
```

Footer: `[تخطي لاحقاً]` (ghost) + `[حفظ والمتابعة]` (primary)

Required: name only. Everything else is optional.

---

### 6. `/(auth)/reset-password` — New Screen

Email field + submit → shows success message inline (no navigation).  
Mock: resolves immediately, shows confirmation text.

---

## Storage Keys (add to `api/storage/storageKeys.ts`)

```typescript
// Auth (both mock and live)
AUTH_SESSION:           '@taybat/auth_session',
AUTH_USER:              '@taybat/auth_user',
HAS_SEEN_ONBOARDING:   '@taybat/has_seen_onboarding',

// Mock-only (remove when switching to Supabase)
MOCK_AUTH_USERS:        '@taybat/mock_auth_users',
MOCK_USER_PROFILES:     '@taybat/mock_user_profiles',
```

Mock-only keys are clearly named so they're easy to find and delete at swap time.

---

## Guest Mode — Protected Feature Pattern

Bottom sheet gate instead of hard navigation block:

```typescript
// hooks/useAuthGate.ts
export function useAuthGate() {
  const status = useAuthStore(s => s.status);
  const [showGate, setShowGate] = useState(false);

  const requireAuth = (action: () => void) => {
    if (status === 'authenticated') {
      action();
    } else {
      setShowGate(true);
    }
  };

  return { requireAuth, showGate, setShowGate };
}
```

**Protected (gate shown to guest):**

- Logging meals
- Saving favorites
- Personal stats
- Community posting
- Meal preferences

**Open to guest:**

- Meal library (read)
- Topics / articles
- Community feed (read only)
- 5-zone guide

---

## Route Guard (`app/_layout.tsx`)

```typescript
const status = useAuthStore(s => s.status);
const segments = useSegments();

useEffect(() => {
  if (status === 'initializing' || status === 'idle') return;

  const inAuth = segments[0] === '(auth)';
  const inMain = segments[0] === '(main)';
  const isAccessible = status === 'authenticated' || status === 'guest';

  if (isAccessible && inAuth) router.replace('/(main)');
  else if (!isAccessible && inMain) router.replace('/(auth)/auth-decision');
}, [status, segments]);
```

---

## Implementation Sequence

### Phase 1 — Foundation (no UI)

1. Create `types/auth.types.ts` with all types (snake_case, Supabase-compatible)
2. Add storage keys to `api/storage/storageKeys.ts`
3. Create `utils/mockDelay.ts`
4. Create `api/auth/types.ts` (IAuthApi, IUserApi interfaces)
5. Create `api/auth/authApi.mock.ts`
6. Create `api/auth/userApi.mock.ts`
7. Create `api/auth/index.ts` (exports mock implementations)
8. Create `api/auth/auth.service.ts`
9. Create `stores/auth.store.ts`
10. Wire route guard into `app/_layout.tsx`

### Phase 2 — Onboarding Update

1. Update `app/splash.tsx`: call `authStore.initializeAuth()`, route by status
2. Update `app/(auth)/onboarding.tsx`: last CTA → `/(auth)/auth-decision`, set `HAS_SEEN_ONBOARDING`

### Phase 3 — Auth Screens

1. Update `app/(auth)/_layout.tsx`: register all new routes
2. Create `app/(auth)/auth-decision.tsx`
3. Create `app/(auth)/login.tsx`
4. Create `app/(auth)/signup.tsx`
5. Create `app/(auth)/reset-password.tsx`

### Phase 4 — Profile Completion

1. Create `components/common/ChipSelector.tsx`
2. Create `components/common/StepIndicator.tsx`
3. Create `components/auth/SocialAuthButtons.tsx`
4. Create `components/auth/ProfileStepBasic.tsx`
5. Create `components/auth/ProfileStepHealth.tsx`
6. Create `components/auth/ProfileStepGoals.tsx`
7. Create `app/(auth)/complete-profile.tsx`

### Phase 5 — Guest Gate

1. Create `hooks/useAuthGate.ts`
2. Create `components/auth/AuthGateSheet.tsx`
3. Add `AuthGateSheet` to `app/(main)/_layout.tsx`
4. Wire `requireAuth` into protected actions

### Phase 6 — i18n

1. Add all auth keys to `localization/translations/ar.json`
2. Add all auth keys to `localization/translations/en.json`

---

### Future: Supabase Swap (single-step)

When Supabase is ready:

1. Create `api/supabase/client.ts` (Supabase singleton)
2. Create `api/auth/authApi.supabase.ts` (satisfies `IAuthApi`)
3. Create `api/auth/userApi.supabase.ts` (satisfies `IUserApi`)
4. In `api/auth/index.ts`: swap the two import lines
5. Delete mock-only storage keys from `storageKeys.ts`
6. Delete `MOCK_AUTH_USERS` and `MOCK_USER_PROFILES` keys

**Zero changes to:** stores, services, screens, components, hooks.

---

## i18n Keys (ar.json additions)

```json
"auth": {
  "decision": {
    "title": "انضم إلى مجتمع التايبات",
    "subtitle": "ابدأ رحلتك نحو صحة أفضل",
    "createAccount": "إنشاء حساب جديد",
    "login": "لدي حساب بالفعل",
    "continueWithGoogle": "متابعة مع Google",
    "continueWithApple": "متابعة مع Apple",
    "browseFirst": "تصفح التطبيق أولاً",
    "orWith": "أو سجّل الدخول بـ",
    "orWithEmail": "أو بالبريد الإلكتروني"
  },
  "login": {
    "title": "مرحباً بعودتك",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "submit": "دخول",
    "forgotPassword": "نسيت كلمة المرور؟",
    "noAccount": "لا تملك حساباً؟",
    "signUpLink": "أنشئ حساباً"
  },
  "signup": {
    "title": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "confirmPassword": "تأكيد كلمة المرور",
    "submit": "إنشاء حساب",
    "hasAccount": "لديك حساب بالفعل؟",
    "loginLink": "سجّل الدخول"
  },
  "completeProfile": {
    "title": "أخبرنا عن نفسك",
    "subtitle": "حتى نخصص لك تجربة مناسبة",
    "stepBasic": "المعلومات الأساسية",
    "stepHealth": "المعلومات الصحية",
    "stepGoals": "هدفك الصحي",
    "name": "الاسم الكامل",
    "gender": "الجنس",
    "male": "ذكر",
    "female": "أنثى",
    "birthYear": "سنة الميلاد",
    "weight": "الوزن (كجم)",
    "height": "الطول (سم)",
    "activityLevel": "مستوى النشاط",
    "sedentary": "خامل",
    "light": "خفيف",
    "moderate": "متوسط",
    "active": "نشط",
    "healthGoals": "ما هدفك الصحي؟",
    "goal_inflammation": "تقليل الالتهابات",
    "goal_digestion": "تحسين الهضم",
    "goal_weight": "فقدان الوزن",
    "goal_energy": "تحسين الطاقة",
    "goal_condition": "متابعة حالة صحية",
    "skip": "تخطي لاحقاً",
    "save": "حفظ والمتابعة",
    "next": "التالي",
    "back": "رجوع"
  },
  "reset": {
    "title": "إعادة تعيين كلمة المرور",
    "subtitle": "سنرسل لك رابطاً على بريدك",
    "email": "البريد الإلكتروني",
    "submit": "إرسال الرابط",
    "successMessage": "تحقق من بريدك الإلكتروني",
    "backToLogin": "العودة لتسجيل الدخول"
  },
  "gate": {
    "title": "سجّل للمتابعة",
    "subtitle": "أنشئ حساباً مجانياً للوصول إلى هذه الميزة",
    "createAccount": "إنشاء حساب",
    "login": "تسجيل الدخول",
    "cancel": "إلغاء"
  },
  "errors": {
    "emailInUse": "هذا البريد الإلكتروني مستخدم بالفعل",
    "invalidLogin": "البريد أو كلمة المرور غير صحيحة",
    "emailNotConfirmed": "يرجى تأكيد بريدك الإلكتروني أولاً",
    "networkError": "تحقق من اتصالك بالإنترنت",
    "generic": "حدث خطأ ما. حاول مرة أخرى",
    "oauthCanceled": "تم إلغاء تسجيل الدخول",
    "sessionExpired": "انتهت جلستك، يرجى تسجيل الدخول مجدداً"
  }
}
```

---

## New Components

| Component | Location | Purpose |
| --- | --- | --- |
| `ChipSelector` | `components/common/` | Single/multi select chips — reused in profile + elsewhere |
| `StepIndicator` | `components/common/` | Progress dots for multi-step forms |
| `SocialAuthButtons` | `components/auth/` | Google + Apple buttons (reused on 3 screens) |
| `AuthGateSheet` | `components/auth/` | Bottom sheet shown to guests on protected actions |
| `ProfileStepBasic` | `components/auth/` | Step 1 of complete-profile |
| `ProfileStepHealth` | `components/auth/` | Step 2 of complete-profile |
| `ProfileStepGoals` | `components/auth/` | Step 3 of complete-profile |

---

## Out of Scope (deferred)

- Facebook OAuth (Phase 2)
- Real Supabase connection (separate ticket when backend ready)
- Email confirmation flow
- Biometric / PIN login
- Account deletion flow
- Subscription/payment gating
