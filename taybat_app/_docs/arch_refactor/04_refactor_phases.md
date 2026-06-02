# 04 — Refactor Phases

## Delivery Principle

Each phase is **independently deliverable** — the app must run at the end of every phase. No big-bang rewrites. Phases can be handed to different agents or developers.

---

## Phase Map

```
Phase 1 — Foundation             (no feature changes, pure infrastructure)
Phase 2 — Repository Layer       (add interfaces + factory, keep mocks working)
Phase 3 — Domain / Use-Cases     (extract business logic from stores into use-cases)
Phase 4 — Store Decomposition    (split fat stores, fix cross-store deps)
Phase 5 — TanStack Query         (migrate read-heavy data from stores to queries)
Phase 6 — Error Handling         (typed errors, error boundaries)
Phase 7 — Offline Support        (queue + sync manager)
Phase 8 — Stats / Charts         (aggregator + chart components)
Phase 9 — Test Infrastructure    (factories, unit tests, coverage gates)
Phase 10 — Supabase Integration  (swap factory env vars, add Supabase impls)
```

---

## Phase 1 — Foundation

**Goal:** Establish shared infrastructure and naming that all later phases depend on.  
**App impact:** Zero — no feature code changes.

### Tasks

1. **Create `features/` directory** with empty `index.ts` files per feature folder
2. **Move `shared/lip/Fetchy`** → `shared/api/fetchyClient.ts`
3. **Create `shared/errors/AppError.ts`** — base error hierarchy (no usages yet)
4. **Create `shared/storage/`** — move `storageService.ts` and `storageKeys.ts` from `api/storage/`; update all imports
5. **Create `shared/api/supabaseClient.ts`** — singleton Supabase client (not yet wired to real project)
6. **Move global stores** — `app.store.ts`, `theme.store.ts` remain in `stores/` (they are global, not feature-specific)
7. **Update path aliases** in `tsconfig.json`:
   - `@/features/*` → `./features/*`
   - `@/shared/*` → `./shared/*`
8. **Verify:** `npm run typecheck` passes, `npm run lint` passes

### Files Created

```
shared/
  api/
    fetchyClient.ts        (moved from shared/lip/Fetchy)
    supabaseClient.ts      (new — empty client scaffold)
  storage/
    storageService.ts      (moved from api/storage/)
    storageKeys.ts         (moved from api/storage/)
  errors/
    AppError.ts            (new)
    errorUtils.ts          (new)
features/
  auth/   meals/   tracking/   user/   stats/   community/   ratings/
  (each: empty domain/ repository/ store/ hooks/ components/ folders)
```

---

## Phase 2 — Repository Layer

**Goal:** Introduce `IRepository` interfaces per feature. The existing mocks become the first implementations. Services continue to work unchanged.  
**App impact:** Zero — internal refactor only.

### Tasks

For each feature (`auth`, `user`, `meals`, `tracking`, `community`, `ratings`):

1. **Define `IFeatureRepository.ts`** — extract the interface from what the current mock/service exposes
2. **Rename existing mock** to conform to `feature.repository.mock.ts` filename and implement the interface
3. **Create `repository/index.ts`** — factory file that exports `const featureRepository: IFeatureRepository = new FeatureRepositoryMock()`
4. **Update service to import from factory** (not directly from mock file)
5. **Verify:** all types still resolve, app runs

### Interface Definitions (example)

```
features/auth/repository/IAuthRepository.ts
  login(payload: LoginPayload): Promise<AuthSession>
  signup(payload: SignupPayload): Promise<AuthSession>
  logout(userId: string): Promise<void>
  getSession(): Promise<AuthSession | null>
  sendPasswordReset(email: string): Promise<void>

features/auth/repository/IUserProfileRepository.ts
  getProfile(userId: string): Promise<UserProfile | null>
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>

features/meals/repository/IMealRepository.ts
  getMeals(): Promise<Meal[]>
  getMealById(id: string): Promise<Meal | null>
  getMealItems(mealId: string): Promise<MealItem[]>
  getMealsByZone(zone: Zone): Promise<Meal[]>

features/tracking/repository/ITrackingRepository.ts
  getUserMeals(userId: string, dateRange?: DateRange): Promise<UserMeal[]>
  logMeal(entry: CreateUserMealPayload): Promise<UserMeal>
  deleteMealLog(id: string): Promise<void>

features/community/repository/ICommunityRepository.ts
  getPosts(cursor?: string, limit?: number): Promise<PaginatedResult<Post>>
  followUser(followerId: string, targetId: string): Promise<void>
  unfollowUser(followerId: string, targetId: string): Promise<void>
  reactToPost(userId: string, postId: string, reaction: ReactionType): Promise<void>

features/ratings/repository/IRatingRepository.ts
  getRatings(userId: string): Promise<WeeklyRating[]>
  submitRating(entry: CreateRatingPayload): Promise<WeeklyRating>
```

### Type Migration

Merge `types/auth.types.ts` + `api/auth/types.ts` → `features/auth/domain/auth.types.ts`  
Move `types/index.ts` domain types per feature:
- `User`, `UserProfile` → `features/user/domain/user.types.ts`
- `Meal`, `MealItem`, `Zone` → `features/meals/domain/meal.types.ts`
- `UserMeal` → `features/tracking/domain/tracking.types.ts`
- `Post`, `Reaction` → `features/community/domain/community.types.ts`
- `WeeklyRating` → `features/ratings/domain/rating.types.ts`

Delete `types/auth.types.ts` and `api/auth/types.ts` once fully migrated.

---

## Phase 3 — Domain / Use-Cases

**Goal:** Extract business logic from stores into pure, repository-injected use-case functions.  
**App impact:** Zero — stores continue to call same logic, now via use-cases.

### What is a Use-Case?

A pure `async function` that:
- Accepts a repository and a payload
- Validates or orchestrates domain rules
- Returns a typed result or throws a typed `AppError`
- Has no knowledge of Zustand, React, or UI

```
loginUseCase(repo: IAuthRepository, payload: LoginPayload): Promise<AuthSession>
```

### Use-Cases to Create

```
features/auth/domain/
  loginUseCase.ts              – validate payload → repo.login() → return session
  signupUseCase.ts             – validate → repo.signup() → return session
  logoutUseCase.ts             – repo.logout()
  initSessionUseCase.ts        – repo.getSession() → validate expiry → return or null
  completeProfileUseCase.ts    – validate profile payload → repo.upsertProfile()

features/tracking/domain/
  logMealUseCase.ts            – check <3 meals today → repo.logMeal()
  deleteMealLogUseCase.ts      – repo.deleteMealLog()

features/community/domain/
  followUserUseCase.ts         – cannot follow self → repo.followUser()
  reactToPostUseCase.ts        – toggle reaction → repo.reactToPost()

features/ratings/domain/
  submitRatingUseCase.ts       – check no duplicate this week → repo.submitRating()
```

### Store Update Pattern

Before (store calls service directly):
```
loginWithEmail: async (payload) => {
  set({ isLoading: true });
  try {
    const session = await authService.loginWithEmail(payload);  // service
    set({ session, status: 'authenticated' });
  } catch (e) {
    set({ errorMessage: e.message });
  }
}
```

After (store calls use-case):
```
loginWithEmail: async (payload) => {
  set({ isLoading: true });
  try {
    const session = await loginUseCase(authRepository, payload);  // use-case
    set({ session, status: 'authenticated' });
  } catch (e) {
    set({ errorMessage: toUserMessage(e) });  // typed error mapping
  }
}
```

Delete `api/*/service.ts` files after migration.

---

## Phase 4 — Store Decomposition

**Goal:** Break fat stores into narrow, single-responsibility stores. Eliminate cross-store direct imports.  
**App impact:** Screen selectors must be updated after each split.

### Split Plan

#### auth.store → 3 stores

| New Store | Responsibilities |
|---|---|
| `authSession.store.ts` | AuthSession object, status machine, init/login/logout |
| `profileSetup.store.ts` | currentStep, profileData, submitStep, isSubmitting |
| `authForm.store.ts` | email/password fields (login form only — or use react-hook-form state directly) |

> Consider: `authForm.store` may be unnecessary if the login form uses `react-hook-form` local state only. Lean toward removing it.

#### Cross-store dep elimination

**Problem:** `community.store`, `userMeals.store`, `account.store` all call `useUserStore.getState().user?.id` directly.

**Solution:** Pass `userId` as a parameter to store actions:

```
// Before (cross-store import)
communityStore.followUser()  // internally gets userId from user.store

// After (userId as param from screen)
communityStore.followUser(currentUserId)
```

The screen reads `userId` from `useAuthSessionStore()` and passes it down. Stores become data-agnostic workers.

#### Stores After Decomposition

```
stores/ (global)
  app.store.ts
  theme.store.ts

features/auth/store/
  authSession.store.ts
  profileSetup.store.ts
  authGate.store.ts

features/user/store/
  user.store.ts            – current user profile (loaded once on auth)
  account.store.ts         – settings: avatar, visibility, follow permission

features/tracking/store/
  tracking.store.ts        – today's meals, log action (write-only; reads from TanStack)

features/community/store/
  communityActions.store.ts – follow, react (write-only; reads from TanStack)

features/ratings/store/
  weeklyRating.store.ts
```

Note: `meals.store` and `mealItems.store` are fully replaced by TanStack Query hooks in Phase 5 — they do not get a new home in `features/`.

---

## Phase 5 — TanStack Query Migration

**Goal:** Move read-heavy server data from Zustand into TanStack Query. Zustand retains only write-state and ephemeral UI.  
**App impact:** Screens update imports, remove store init calls.

### Setup

- Configure `QueryClient` with defaults: `staleTime: 5 * 60 * 1000`, `gcTime: 10 * 60 * 1000`
- Wrap app root with `QueryClientProvider` in `app/_layout.tsx`
- Add `Expo AppState` listener to refetch on app foreground

### Query Hooks to Create

```
features/meals/hooks/
  useMeals.ts              – useQuery(['meals'], () => mealRepository.getMeals())
  useMealItems.ts          – useQuery(['mealItems', mealId], ...)
  useMealsByZone.ts        – derived from useMeals

features/tracking/hooks/
  useUserMeals.ts          – useQuery(['userMeals', userId, dateRange], ...)
  useTodayMeals.ts         – derived: filter today from useUserMeals

features/community/hooks/
  useCommunityFeed.ts      – useInfiniteQuery(['feed'], cursor-based)
  useCommunityStats.ts     – useQuery(['communityStats', userId], ...)

features/user/hooks/
  useCurrentUser.ts        – useQuery(['user', userId], () => userRepository.getProfile(userId))
```

### Mutation Hooks

```
features/tracking/hooks/
  useLogMeal.ts            – useMutation → invalidate ['userMeals', userId]
  useDeleteMealLog.ts      – useMutation → invalidate ['userMeals', userId]

features/community/hooks/
  useFollowUser.ts         – useMutation → invalidate ['communityStats']
  useReactToPost.ts        – useMutation with optimistic update → rollback on error

features/ratings/hooks/
  useSubmitRating.ts       – useMutation → invalidate ['ratings', userId]
```

### Stores Retired in This Phase

- `meals.store.ts` → deleted (replaced by `useMeals` hook)
- `mealItems.store.ts` → deleted (replaced by `useMealItems` hook)
- `userMeals.store.ts` → replaced by `tracking.store.ts` (writes only) + `useUserMeals` hook (reads)
- `community.store.ts` → replaced by `communityActions.store.ts` (writes only) + `useCommunityFeed` hook (reads)

---

## Phase 6 — Error Handling

**Goal:** Typed error hierarchy, React Error Boundaries per zone, global toast coordinator.  
**App impact:** UX improvement — better error messages, no blank screens on errors.

### AppError Hierarchy

```typescript
// shared/errors/AppError.ts
class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly cause?: unknown
  ) { super(message); }
}

class NetworkError extends AppError {}
class AuthError extends AppError {}
class InvalidCredentialsError extends AuthError {}
class SessionExpiredError extends AuthError {}
class ValidationError extends AppError { constructor(readonly fields: Record<string, string[]>) }
class NotFoundError extends AppError {}
class ServerError extends AppError {}
```

### Error Boundary Placement

```
app/_layout.tsx
  └── <RootErrorBoundary>                      fallback: full-screen error + retry
        └── app/(main)/_layout.tsx
              ├── <HomeErrorBoundary>           fallback: retry card
              ├── <StatsErrorBoundary>          fallback: empty state
              └── <CommunityErrorBoundary>      fallback: empty feed
```

### `errorUtils.ts`

```
toUserMessage(error: unknown): string  → localized user-facing string
isNetworkError(error: unknown): boolean
isAuthError(error: unknown): boolean
isSessionExpired(error: unknown): boolean
```

### Global Toast

- `shared/ui/ToastProvider.tsx` — a React context with `showError(message)` / `showSuccess(message)`
- Screens call `useToast().showError(toUserMessage(e))` for soft errors that don't need boundaries

---

## Phase 7 — Offline Support

**Goal:** Queue mutations when offline, sync when connectivity returns.  
**App impact:** App no longer silently fails on poor connections.

### Components to Build

```
shared/offline/
  offlineQueue.ts       – add/remove/list operations; persisted to AsyncStorage
  syncManager.ts        – listens to NetInfo; on connect → flush queue
  useOfflineQueue.ts    – React hook: { isOnline, pendingCount, pendingOps }
shared/ui/
  OfflineBanner.tsx     – yellow bar: "No connection — X operations pending"
```

### Queue Entry Type

```typescript
type QueuedOperation = {
  id: string;               // uuid
  operation: OperationType; // 'logMeal' | 'reactToPost' | 'followUser' | 'submitRating'
  payload: unknown;
  createdAt: string;
  retryCount: number;
  userId: string;
}
```

### Integration Points

Mutation hooks wrap their mutation function with an offline check:
```
if (!isOnline) {
  offlineQueue.add({ operation: 'logMeal', payload: entry, userId });
  // apply optimistic update to TanStack cache
  return;
}
await logMealUseCase(trackingRepository, entry);
```

On `syncManager` flush:
- Load queue from storage
- Execute each operation via the relevant use-case
- On success: remove from queue, invalidate relevant TanStack queries
- On retryable failure: increment retryCount, keep in queue

---

## Phase 8 — Stats / Charts

**Goal:** Build stats aggregation layer and chart component library.  
**App impact:** Stats screen gets real charts.

### Aggregation Functions (pure, testable)

```typescript
// features/stats/domain/statsAggregator.ts

dailyAdherenceByZone(meals: UserMeal[], date: string): ZoneSummary
weeklyAdherenceTrend(meals: UserMeal[], weekStart: string): DailySummary[]
mealFrequencyByZone(meals: UserMeal[], dateRange: DateRange): ZoneDistribution
averageRatingTrend(ratings: WeeklyRating[], weeksBack: number): RatingPoint[]
```

### Chart Components

- `AdherenceLineChart` — receives `DailySummary[]`, renders line chart
- `ZoneDonutChart` — receives `ZoneDistribution`, renders donut
- `WeeklyBarChart` — receives `DailySummary[]`, renders stacked bars
- All chart components are **props-only** (no hooks, no store access)

### `useStats` hook

```typescript
// features/stats/hooks/useStats.ts
function useStats(userId: string, dateRange: DateRange) {
  const { data: meals } = useUserMeals(userId, dateRange);
  const { data: ratings } = useRatings(userId);
  
  return {
    weeklyTrend: useMemo(() => weeklyAdherenceTrend(meals, dateRange.start), [meals]),
    zoneDistribution: useMemo(() => mealFrequencyByZone(meals, dateRange), [meals]),
    ratingTrend: useMemo(() => averageRatingTrend(ratings, 8), [ratings]),
  };
}
```

---

## Phase 9 — Test Infrastructure

**Goal:** Establish test factories, write unit tests for all use-cases, add coverage gate to CI.

### Test Structure

```
features/auth/domain/__tests__/
  loginUseCase.test.ts
  signupUseCase.test.ts
  initSessionUseCase.test.ts

features/tracking/domain/__tests__/
  logMealUseCase.test.ts

features/stats/domain/__tests__/
  statsAggregator.test.ts    (most unit tests here — pure functions)

features/*/repository/__tests__/
  *.repository.mock.test.ts  (verify mock matches interface contract)
```

### Test Factory Pattern

```
shared/testing/factories/userFactory.ts
  createUser(overrides?: Partial<User>): User
  createAuthSession(overrides?: Partial<AuthSession>): AuthSession

shared/testing/factories/mealFactory.ts
  createMeal(overrides?: Partial<Meal>): Meal
  createUserMeal(overrides?: Partial<UserMeal>): UserMeal
```

### Coverage Gate (jest.config.js)

```
coverageThreshold: {
  'features/*/domain/**': { lines: 80, functions: 80 },
  'shared/offline/**':    { lines: 70 },
}
```

---

## Phase 10 — Supabase Integration

**Goal:** Wire real Supabase implementations behind the repository factory. Mock remains available via env var.

### Per-Feature Tasks

For each feature:
1. Create `feature.repository.supabase.ts` implementing `IFeatureRepository`
2. Update `repository/index.ts` factory:
   ```
   const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';
   export const featureRepository = USE_MOCK
     ? new FeatureRepositoryMock()
     : new FeatureRepositorySupabase(supabaseClient);
   ```
3. Run integration tests against real Supabase (staging env)
4. Verify all TypeScript types match Supabase table schemas

### Third-Party Authentication

```
features/auth/repository/auth.repository.supabase.ts
  login()   → supabase.auth.signInWithPassword()
  signup()  → supabase.auth.signUp()
  logout()  → supabase.auth.signOut()
  OAuth     → supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' })
  Session   → supabase.auth.getSession() + onAuthStateChange listener
```

Supabase session management should wire `onAuthStateChange` into `authSession.store` directly (not through repository) since it's a real-time push event.

### Row-Level Security

- All Supabase tables must have RLS policies
- User can only read/write their own rows
- Community posts: read-public, write-owner
- Document RLS policy per table in `_docs/supabase/rls.md`

---

## Phase Timeline (Recommended Order)

```
Week 1    Phase 1 + Phase 2   (foundation + repository layer)
Week 2    Phase 3 + Phase 4   (use-cases + store decomposition)
Week 3    Phase 5             (TanStack Query migration)
Week 4    Phase 6 + Phase 7   (error handling + offline)
Week 5    Phase 8             (stats + charts)
Week 6    Phase 9             (tests)
Week 7+   Phase 10            (Supabase — depends on backend readiness)
```

Each phase ends with: `npm run lint` + `npm run typecheck` + app boots without errors.
