# Taybat App — Architecture Overview
### For New Team Members

> Read this first. It gives you the mental model you need before touching any code.

---

## 1. What is This App?

**Al-Tayebat** is a React Native (Expo) mobile app implementing Dr. Diya Al-Awadi's five-zone dietary system for reducing inflammation. Users track daily meals, view health statistics, and interact with a community feed.

**Primary language:** Arabic (RTL). English is secondary.  
**Target platforms:** iOS, Android, Web (limited).

---

## 2. Tech Stack at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  MOBILE APP (React Native 0.81 + Expo 54)                  │
├─────────────────────────────────────────────────────────────┤
│  UI             NativeWind v4 (Tailwind) + React Native Paper│
│  Navigation     Expo Router (file-based)                    │
│  State          Zustand v5                                  │
│  Server State   TanStack Query v5 (configured, ready)       │
│  Forms          React Hook Form + Zod                       │
│  i18n           i18next + react-i18next                     │
│  Fonts          Cairo (Regular / SemiBold / Bold)           │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (current: mock — target: Supabase)                 │
│  Auth           supabase.auth  (mock: AsyncStorage)         │
│  Database       Supabase Postgres (mock: in-memory + JSON)  │
│  Storage        Supabase Storage (not yet needed)           │
│  Realtime       Supabase Realtime (future: community feed)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Architecture in One Picture

```
┌──────────────────────────────────────────────────────────────┐
│                    SCREEN LAYER  (app/)                      │
│    Thin React components — display state, call actions       │
└──────────────────────┬───────────────────────────────────────┘
                       │  reads state / calls actions
┌──────────────────────▼───────────────────────────────────────┐
│                    STATE LAYER  (stores/)                    │
│    Zustand stores — owns loading, error, local mutations     │
└──────────────────────┬───────────────────────────────────────┘
                       │  calls service (auth) or repository (rest)
┌──────────────────────▼───────────────────────────────────────┐
│               SERVICE LAYER  (api/auth/)                     │
│    AuthService — orchestrates auth + profile together        │
└──────────────────────┬───────────────────────────────────────┘
                       │  calls interface methods
┌──────────────────────▼───────────────────────────────────────┐
│              REPOSITORY LAYER  (repositories/)               │
│    Interface + Mock implementation + Supabase implementation │
│    Factory picks which one via env var EXPO_PUBLIC_USE_MOCK  │
└──────────────────────┬───────────────────────────────────────┘
                       │
         ┌─────────────┴──────────────┐
         ▼                            ▼
   [ Mock (AsyncStorage) ]   [ Supabase (Postgres + Auth) ]
   Development / testing       Production
```

**The golden rule:** Each layer only talks to the layer directly below it. Screens never call repositories. Repositories never import from stores.

---

## 4. Folder Structure — Every Folder Explained

```
taybat_app/
│
├── app/                    ← Expo Router: file name = URL route
│   ├── _layout.tsx         ← Root: providers (Paper, i18n, TanStack, fonts)
│   ├── splash.tsx          ← Boot screen: init auth → decide where to go
│   ├── index.tsx           ← Redirects to splash
│   ├── (auth)/             ← Route group: login, signup, onboarding
│   │   ├── _layout.tsx     ← Auth stack navigator
│   │   ├── onboarding.tsx  ← First-time carousel
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── complete-profile.tsx   ← 3-step profile wizard
│   │   └── reset-password.tsx
│   └── (main)/             ← Route group: protected screens (requires auth)
│       ├── _layout.tsx     ← Tab navigator + AuthGate component
│       ├── index.tsx       ← Home / dashboard
│       ├── stats.tsx       ← Charts & statistics
│       ├── community.tsx   ← Social feed
│       ├── account.tsx     ← User settings
│       └── ...             ← Meal detail, topics, etc.
│
├── repositories/           ← DATA ACCESS LAYER (most important new addition)
│   ├── auth/               ← IAuthRepository + IUserProfileRepository
│   │   ├── IAuthRepository.ts           ← The CONTRACT (interface)
│   │   ├── AuthRepositoryMock.ts        ← Works offline (AsyncStorage)
│   │   ├── AuthRepositorySupabase.ts    ← Real backend
│   │   └── index.ts                     ← Factory: picks mock or Supabase
│   ├── meals/              ← IMealRepository
│   ├── tracking/           ← ITrackingRepository (user meal logs)
│   ├── community/          ← ICommunityRepository
│   ├── account/            ← IAccountRepository (preferences + favorites)
│   └── ratings/            ← IRatingRepository (weekly health ratings)
│
├── stores/                 ← ZUSTAND STATE (one file per domain)
│   ├── auth.store.ts       ← Session, status machine, login/logout
│   ├── user.store.ts       ← Current user profile
│   ├── account.store.ts    ← Account settings (avatar, visibility)
│   ├── meals.store.ts      ← Meals catalog
│   ├── mealItems.store.ts  ← Meal items by zone
│   ├── userMeals.store.ts  ← Today's meal logs
│   ├── community.store.ts  ← Community feed + reactions
│   ├── weeklyRating.store.ts ← Weekly health surveys
│   ├── mealPreferences.store.ts ← Favorite meals
│   ├── authGate.store.ts   ← Auth gate sheet (UI-only)
│   ├── app.store.ts        ← Language, app readiness
│   ├── theme.store.ts      ← Light/dark/system mode
│   └── storeReset.ts       ← Resets all stores on logout
│
├── api/
│   └── auth/
│       └── auth.service.ts ← Orchestrates auth + profile (uses repositories)
│
├── components/             ← Reusable UI components
│   ├── common/             ← App-wide: AppText, PrimaryButton, StarRating…
│   ├── auth/               ← Auth screens: ProfileStep*, AuthGateSheet
│   ├── home/               ← Home screen: HomeHeader, TodayMealRow…
│   ├── community/          ← PostCard, EmptyFeed…
│   └── account/            ← SettingsRow, AvatarPickerSheet…
│
├── shared/
│   ├── storage/            ← storageService + STORAGE_KEYS (single source)
│   └── errors/             ← AppError hierarchy + toUserMessage()
│
├── lib/
│   └── supabase.ts         ← Supabase client singleton (ready, not connected)
│
├── hooks/                  ← useRTL, useThemeMode, useAuthGate
├── theme/                  ← Paper theme builder + design tokens
├── localization/           ← i18next setup + ar.json / en.json
├── types/                  ← Domain TypeScript types (User, Meal, etc.)
├── data/mock/              ← Seed data used by mock repositories
└── utils/                  ← Pure helpers: zoneUtils, statsUtils, dateUtils
```

---

## 5. How Screens Route (Expo Router)

The file path inside `app/` IS the route. No route config file needed.

```
app/splash.tsx              →  /splash
app/(auth)/login.tsx        →  /login          (inside auth group)
app/(main)/index.tsx        →  /               (home, inside main group)
app/(main)/stats.tsx        →  /stats
```

**Route groups** `(auth)` and `(main)` are folders that group screens but don't add to the URL. They each have their own `_layout.tsx` that defines the navigator (stack vs tabs).

**Auth guard** lives in `app/_layout.tsx`. It watches `authStatus` from `useAuthStore` and redirects:

```
authenticated + profile complete  →  /(main)
authenticated + profile incomplete →  /(auth)/complete-profile
unauthenticated                    →  /(auth)/login
first time ever                    →  /(auth)/onboarding
```

---

## 6. The Repository Pattern — Why It Exists

The most important architectural decision is the **Repository + Factory pattern**.

```
                   ┌─────────────────────────┐
                   │   IAuthRepository       │  ← Interface (contract)
                   │   .login()              │
                   │   .signup()             │
                   │   .logout()             │
                   │   .getSession()         │
                   └────────┬────────────────┘
                            │  implemented by
          ┌─────────────────┴──────────────────┐
          ▼                                     ▼
  AuthRepositoryMock                 AuthRepositorySupabase
  (AsyncStorage-based)               (supabase.auth.*)
  No network needed                  Real backend


          ▲ which one?
          │
  repositories/auth/index.ts
  ─────────────────────────────
  EXPO_PUBLIC_USE_MOCK=true   →  AuthRepositoryMock
  EXPO_PUBLIC_USE_MOCK=false  →  AuthRepositorySupabase
```

**Why this matters:**
- You develop features offline using mock data
- Switching to the real backend = change one env variable, zero code changes
- You can test business logic by injecting a mock repository
- Every repository follows the same interface, so the store code never changes

---

## 7. State Management (Zustand)

Each domain has one store. All stores follow the same shape:

```typescript
interface FeatureState {
  data: SomeType | null;
  isLoading: boolean;
  errorMessage: string;           ← always a user-readable Arabic string

  initializeFeature: () => Promise<void>;   ← called once when screen mounts
  doAction: (arg: Type) => Promise<boolean>;
  reset: () => void;              ← called on logout
}
```

**Reading state in a screen:**
```tsx
// Subscribe only to what you need — avoid re-renders
const meals = useMealsStore((s) => s.meals);
const isLoading = useMealsStore((s) => s.isLoading);
const initializeMeals = useMealsStore((s) => s.initializeMeals);
```

**Store dependency rule:** Stores can read from other stores using `getState()`, but they must NOT subscribe (no `useOtherStore()` inside a store file).

```typescript
// ✅ OK — read once at action time
const user = useUserStore.getState().user;

// ❌ WRONG — creates subscription inside a store
const user = useUserStore((s) => s.user);  // only valid in React components
```

---

## 8. Error Handling Pattern

All errors flow through `shared/errors/AppError.ts`:

```
Repository throws AppError subclass
  ↓
Store catches it in try/catch
  ↓
toUserMessage(error) → Arabic string
  ↓
set({ errorMessage: '...' })
  ↓
Screen reads errorMessage → shows to user
```

**Error types:**

```
AppError (base)
  ├── NetworkError           "تحقق من اتصالك بالإنترنت"
  ├── InvalidCredentialsError "البريد أو كلمة المرور غير صحيحة"
  ├── EmailAlreadyUsedError   "هذا البريد الإلكتروني مستخدم بالفعل"
  ├── SessionExpiredError     "انتهت الجلسة، يرجى تسجيل الدخول مجدداً"
  ├── NotFoundError
  └── ServerError
```

---

## 9. Auth Flow — Step by Step

```
App starts
    │
    ▼
splash.tsx
    │── initializeAuth()
    │       └── authService.getSessionAndProfile()
    │               ├── authRepository.getSession()  ← check stored token
    │               └── userProfileRepository.getProfile(userId)
    │
    ├── session found + profile complete   ──→  /(main)  home
    ├── session found + profile incomplete ──→  /(auth)/complete-profile
    ├── no session + seen onboarding       ──→  /(auth)/login
    └── no session + first time            ──→  /(auth)/onboarding
```

**Auth status machine:**
```
idle → initializing → authenticated ←→ loading
                   ↘ unauthenticated ← error
                   ↘ guest
```

---

## 10. RTL / Arabic-First Rules

The app is Arabic-first (RTL).

| Platform | RTL Approach |
|---|---|
| iOS | Disabled native RTL flip. Explicit `textAlign: 'right'`, `flexDirection: 'row-reverse'` in JS |
| Android | Native `I18nManager.forceRTL(true)` + app reload |
| Web | `document.documentElement.setAttribute('dir', 'rtl')` |

**Always use:**
- `<AppText>` instead of `<Text>` — handles `writingDirection` automatically
- `<AppTextInput>` instead of `<TextInput>`
- `useRTL()` hook for conditional `flexDirection` or `textAlign`
- `t('key')` from `useTranslation()` — never hardcode Arabic strings

---

## 11. Design System Quick Reference

**Colors (use Tailwind classes, never hex):**
```
bg-app-primary    → Emerald green  #10B981
bg-app-secondary  → Teal           #06B6D4
bg-app-background → Light gray     #f1f5f9
bg-app-surface    → White          #ffffff
text-app-text     → Navy           #1e293b
text-app-muted    → Gray           #475569
```

**Five food zones:**
```
Zone 1 (Green)  — Daily safe foods
Zone 2 (Yellow) — Daily with monitoring
Zone 3 (Orange) — 1-3× per week
Zone 4 (Purple) — Rarely / healthy only
Zone 5 (Red)    — Forbidden
```

**Typography:** Always Cairo font. Use `variant="regular|semibold|bold"` on `<AppText>`.

---

## 12. Development Modes

| Mode | How | What works |
|---|---|---|
| **Mock mode** (default) | `EXPO_PUBLIC_USE_MOCK=true` or not set | Full app, no internet needed |
| **Supabase mode** | `EXPO_PUBLIC_USE_MOCK=false` | Real backend, needs `.env` credentials |

Set in `.env` at the project root:
```
EXPO_PUBLIC_USE_MOCK=true
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 13. Key Commands

```bash
npm run start        # Start Expo dev server
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run typecheck    # TypeScript check (must pass before PR)
npm run lint         # ESLint (must pass before PR)
npm run test         # Jest
npm run format       # Prettier
```

---

## 14. Data Flow Diagram — Logging a Meal

This traces a single user action end-to-end to show all layers working together:

```
User taps "Log Meal" on HomeScreen
          │
          ▼
app/(main)/index.tsx
  logMeal(mealId)  ← from useUserMealsStore()
          │
          ▼
stores/userMeals.store.ts  logMeal(mealId)
  1. Get user from useUserStore.getState().user
  2. Get meal from useMealsStore.getState().getMealById(mealId)
  3. Check todayMeals.length < 3
  4. trackingRepository.logMeal({ userId, mealId, ... })
          │
          ▼
repositories/tracking/index.ts
  (env: USE_MOCK=true)
          │
          ▼
TrackingRepositoryMock.logMeal(payload)
  Creates UserMeal object in memory
  Returns new UserMeal
          │
          ▼  (when USE_MOCK=false)
TrackingRepositorySupabase.logMeal(payload)
  supabase.from('user_meals').insert({...}).select().single()
  Returns new UserMeal from database
          │
          ▼
Store updates state:
  userMeals = [...userMeals, newEntry]
  todayMeals = filter today's
          │
          ▼
HomeScreen re-renders with updated meal list
```

---

## 15. File You Touch for Each Type of Change

| What you want to do | Files to change |
|---|---|
| Add a new screen | `app/(main)/new-screen.tsx` + navigation entry |
| Add UI to an existing screen | Screen file + maybe a new component |
| Add new domain data | `types/index.ts` + repository interface + both impls |
| Change business logic | Store action or create a service method |
| Add a new setting | `repositories/account/IAccountRepository.ts` + both impls + `STORAGE_KEYS` |
| Change error message | `shared/errors/AppError.ts` or store catch block |
| Add translation key | `localization/translations/ar.json` + `en.json` |
| New color token | `tailwind.config.js` + `theme/tokens.ts` |
| Fix storage key naming | `shared/storage/storageKeys.ts` |
