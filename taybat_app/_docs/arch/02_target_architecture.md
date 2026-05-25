# 02 — Target Architecture

## Design Principles

1. **Dependency Inversion** — high-level modules define interfaces; low-level modules implement them
2. **Single Responsibility** — one reason to change per module
3. **Feature Cohesion** — code that changes together lives together
4. **Testability by Design** — every layer can be tested without its dependencies
5. **Swap-Ready Data Layer** — mock ↔ Supabase is a one-line change per feature

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│   app/ screens   ←   stores/ (UI-facing state)         │
│   components/    ←   TanStack Query (server cache)     │
└───────────────────────┬─────────────────────────────────┘
                        │ calls
┌───────────────────────▼─────────────────────────────────┐
│                   DOMAIN LAYER                          │
│   features/*/domain/   use-cases, domain models        │
│   features/*/store/    Zustand — pure domain state     │
└───────────────────────┬─────────────────────────────────┘
                        │ depends on interfaces only
┌───────────────────────▼─────────────────────────────────┐
│                    DATA LAYER                           │
│   features/*/repository/   interface + implementations │
│   ├── *.mock.ts    (AsyncStorage/mock data)            │
│   └── *.supabase.ts  (Supabase client)                 │
│   shared/infrastructure/   storageService, supabase    │
└─────────────────────────────────────────────────────────┘
```

---

## Full Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SCREEN (app/features/auth/screens/LoginScreen.tsx)                         │
│                                                                              │
│  const { loginWithEmail, status, errorMessage } = useAuthStore()            │
│  const { data: session } = useQuery(sessionQueryKey)   [TanStack]           │
│                                                                              │
└──────────────────┬─────────────────────────────────────────────────────────┘
                   │ reads state / dispatches actions
┌──────────────────▼─────────────────────────────────────────────────────────┐
│  ZUSTAND STORE (features/auth/store/auth.store.ts)                         │
│                                                                              │
│  – UI state: status, isLoading, errorMessage                               │
│  – calls use-cases (not repositories directly)                             │
│  – never imports other stores                                               │
│  – receives userId via parameter, not from user.store                      │
│                                                                              │
└──────────────────┬─────────────────────────────────────────────────────────┘
                   │ calls
┌──────────────────▼─────────────────────────────────────────────────────────┐
│  USE-CASE (features/auth/domain/loginUseCase.ts)                           │
│                                                                              │
│  export async function loginUseCase(                                        │
│    repo: IAuthRepository,                                                   │
│    payload: LoginPayload                                                     │
│  ): Promise<AuthSession>                                                     │
│                                                                              │
│  – pure function (easily unit-testable)                                    │
│  – orchestrates: validate → call repo → map result                        │
│  – throws typed AppError                                                    │
│                                                                              │
└──────────────────┬─────────────────────────────────────────────────────────┘
                   │ calls interface method
┌──────────────────▼─────────────────────────────────────────────────────────┐
│  REPOSITORY INTERFACE (features/auth/repository/IAuthRepository.ts)        │
│                                                                              │
│  interface IAuthRepository {                                                │
│    login(payload: LoginPayload): Promise<AuthSession>                      │
│    signup(payload: SignupPayload): Promise<AuthSession>                    │
│    logout(): Promise<void>                                                  │
│    getSession(): Promise<AuthSession | null>                               │
│    resetPassword(email: string): Promise<void>                             │
│  }                                                                          │
│                                                                              │
└──────┬───────────────────────────────────────────────────────┬─────────────┘
       │                                                         │
┌──────▼──────────────────────────┐  ┌────────────────────────▼─────────────┐
│  MOCK IMPL                      │  │  SUPABASE IMPL                        │
│  auth.repository.mock.ts        │  │  auth.repository.supabase.ts          │
│                                 │  │                                        │
│  – in-memory + AsyncStorage     │  │  – supabase.auth.signInWithPassword() │
│  – no network                   │  │  – supabase.auth.signUp()             │
│  – deterministic for tests      │  │  – supabase.auth.getSession()         │
└─────────────────────────────────┘  └───────────────────────────────────────┘
```

---

## Repository Swap Mechanism

The active implementation is chosen in one place — a factory file per feature:

```
features/auth/repository/auth.repository.factory.ts
```

```
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const authRepository: IAuthRepository = USE_MOCK
  ? new AuthRepositoryMock()
  : new AuthRepositorySupabase(supabaseClient);
```

To switch from mock to Supabase: flip one env variable. No service or store changes.

---

## Store Decomposition

### Before: one fat auth store

```
auth.store.ts (1 file, ~300 lines)
  – email, password form fields   ← UI state, not domain
  – status machine
  – login, signup, logout, reset
  – profile completion steps
  – OAuth flows
  – initialization
```

### After: focused stores

```
features/auth/store/
  authSession.store.ts     – AuthSession, status, initializeSession
  authForm.store.ts        – form field state only (email, password)
  profileSetup.store.ts    – multi-step profile completion state
  authGate.store.ts        – gate sheet open/close (UI only)
```

Each store is narrow. Screens subscribe only to what they need. Testing `authSession.store` does not require form state setup.

---

## TanStack Query Integration Strategy

**Rule:** TanStack Query owns all *server state*. Zustand owns all *client state*.

| Data Type | Owner | Why |
|---|---|---|
| Auth session | Zustand | App-wide, triggers routing |
| User profile (remote) | TanStack Query | Stale-while-revalidate, background sync |
| Meals catalog | TanStack Query | Read-only reference data, cache forever |
| User meal logs | TanStack Query | Server source of truth |
| Community posts | TanStack Query | Paginated, cursor-based |
| Language setting | Zustand | Pure client preference |
| Theme mode | Zustand | Pure client preference |
| UI modal open state | Zustand | Pure ephemeral UI |
| Form input values | react-hook-form | Ephemeral form state |

**Offline interaction:** TanStack Query's `optimisticUpdate + rollback` handles optimistic mutations. The offline queue (see below) handles mutations when there is no connectivity.

---

## Error Handling Architecture

### Typed Error Hierarchy

```
AppError (base)
  ├── NetworkError     – no connectivity, timeout
  ├── AuthError        – expired session, invalid credentials
  │   ├── InvalidCredentialsError
  │   └── SessionExpiredError
  ├── ValidationError  – zod schema failures
  ├── NotFoundError    – resource not found
  ├── PermissionError  – unauthorized action
  └── ServerError      – 5xx from Supabase / edge functions
```

### Error Boundary Zones

```
Root Error Boundary   → catches catastrophic errors → full-screen fallback
  ├── Auth Zone EB    → catches auth errors → redirects to login
  └── Feature Zone EBs (one per main tab)
      ├── Home EB     → shows "retry" card
      ├── Stats EB    → shows empty state
      └── Community EB → shows empty feed
```

### Error Flow

```
Repository throws AppError (typed)
    ↓
Use-case catches, wraps, re-throws (or maps to domain error)
    ↓
Store catches, sets errorMessage (localized string)
    ↓
Screen reads errorMessage, displays inline or triggers toast
    ↓
If uncaught: React Error Boundary renders fallback
```

---

## Offline Support Architecture

### Scope: Limited Offline (Partial Reads + Queued Writes)

```
┌────────────────────────────────────────────────┐
│           OFFLINE STRATEGY                      │
│                                                 │
│  READS:   serve stale TanStack Query cache     │
│           show "offline" banner                │
│                                                 │
│  WRITES:  queue mutations in AsyncStorage      │
│           sync when connectivity restored      │
│           optimistic UI during queue           │
└────────────────────────────────────────────────┘
```

### Sync Queue

```
shared/offline/
  offlineQueue.ts       – FIFO queue, persisted to AsyncStorage
  syncManager.ts        – watches NetInfo, flushes queue on connect
  offlineContext.tsx    – React context: isOnline, pendingCount
```

**Queue Entry shape:**
```
{
  id: string,           // uuid
  operation: 'logMeal' | 'submitRating' | 'followUser' | ...,
  payload: unknown,     // typed per operation
  createdAt: string,    // ISO timestamp
  retryCount: number,
}
```

**Sync strategy:**
- On connect: flush queue in order, retry up to 3×
- On 4xx: discard (validation failure — user must retry)
- On 5xx / timeout: back-off, keep in queue
- On conflict: server wins, show "synced with changes" toast

---

## Charts / Dashboard Architecture

### Data Flow for Stats Screen

```
StatsScreen
    │
    ├── useQuery(userMealsQuery)     → raw meal logs from TanStack
    │
    ├── statsAggregator.ts           → pure transformation functions
    │   ├── dailyAdherenceByZone()
    │   ├── weeklyTrend()
    │   ├── zoneSummaryThisWeek()
    │   └── mealFrequencyDistribution()
    │
    └── Chart components (Victory Native / Gifted Charts)
        ├── AdherenceLineChart
        ├── ZoneDonutChart
        └── WeeklyBarChart
```

**Key principle:** chart components are pure — they receive pre-computed data, not raw meal logs. All aggregation lives in `statsAggregator.ts` (pure functions → trivially testable).

### Dashboard Data Architecture

```
features/stats/
  domain/
    statsAggregator.ts    – pure aggregation functions
    statsTypes.ts         – DailySummary, WeeklyTrend, ZoneStat
  hooks/
    useStats.ts           – combines TanStack + aggregator
  components/
    AdherenceChart.tsx    – pure chart component
    ZoneDonutChart.tsx    – pure chart component
    StatsDateRangePicker.tsx
```

---

## Authentication Flow (Target)

```
App Boot
    │
    ├── SplashScreen.tsx
    │       └── authSession.store.initializeSession()
    │                   └── IAuthRepository.getSession()
    │                               ├── session valid → status='authenticated'
    │                               └── no session → status='unauthenticated'
    │
Root _layout.tsx observes status:
    │
    ├── 'authenticated' + profile_completed=true  → /(main)
    ├── 'authenticated' + profile_completed=false → /(auth)/complete-profile
    ├── 'unauthenticated'                         → /(auth)/login
    └── 'guest'                                   → /(main) [limited access]
```

---

## Community / Social Architecture

```
features/community/
    repository/
      ICommunityRepository.ts
      community.repository.mock.ts
      community.repository.supabase.ts
    domain/
      communityTypes.ts          – Post, Comment, Reaction
      followUserUseCase.ts
      reactToPostUseCase.ts
    store/
      communityFeed.store.ts     – feed posts (delegated to TanStack Query)
      communityActions.store.ts  – follow/unfollow, react (write operations)
    hooks/
      useCommunityFeed.ts        – TanStack paginated query
      useCommunityActions.ts
    components/
      PostCard.tsx
      EmptyFeed.tsx
```

**Real-time:** Supabase Realtime subscriptions wire into the TanStack Query cache invalidation. When a new post arrives over Realtime, invalidate the feed query — TanStack re-fetches.

---

## RTL / i18n Architecture (Unchanged, Hardened)

Current implementation is solid. Minor improvements:

- Extract `RTLProvider` as a named context (instead of implicit I18nManager calls)
- Type `useTranslation()` key paths with generated TypeScript types from translation JSON
- Add `i18next-scanner` to CI to catch missing keys before production

---

## Testing Architecture

### Test Pyramid Target

```
            ┌───────────────┐
            │  E2E Tests     │  Detox — happy path flows only
            │  (5-10)        │  login → log meal → view stats
            └───────┬───────┘
            ┌───────▼───────┐
            │ Integration   │  Jest + RN Testing Library
            │ Tests (20-30) │  screen + store + mock repository
            └───────┬───────┘
            ┌───────▼───────┐
            │  Unit Tests   │  Jest — pure functions
            │  (50+)        │  use-cases, aggregators, utils
            └───────────────┘
```

### What to Test at Each Layer

| Layer | Test type | Tool |
|---|---|---|
| Use-cases | Unit | Jest (inject mock repository) |
| Repository (mock impl) | Unit | Jest |
| Stores | Integration | Jest + Zustand test utilities |
| Components | Component | RN Testing Library |
| Screens | Integration | RN Testing Library + mock stores |
| Stats aggregation | Unit | Jest |
| E2E flows | E2E | Detox |

### Factory Pattern for Test Data

```
shared/testing/
  factories/
    userFactory.ts        – createUser({ overrides })
    mealFactory.ts        – createMeal({ zone: 'green' })
    sessionFactory.ts     – createAuthSession({ expired: false })
  mocks/
    authRepository.mock.ts  – in-memory, deterministic
    storageService.mock.ts  – Map-based, no AsyncStorage
```

Use-case test example (no store, no screen):
```
const repo = new InMemoryAuthRepository();
const result = await loginUseCase(repo, { email: 'test@x.com', password: '123456' });
expect(result.userId).toBeDefined();
```
