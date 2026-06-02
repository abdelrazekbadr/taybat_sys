# 03 — Target Folder Structure

## Overview

The target structure is **feature-first, then layer**. Each feature is a self-contained vertical slice with its own types, repository interface, store, hooks, and components. Shared infrastructure lives in `shared/`.

---

## Full Directory Tree

```
taybat_app/
│
├── app/                              # Expo Router — file system routes ONLY
│   ├── _layout.tsx                   # Root: fonts, theme, i18n, RTL, providers
│   ├── index.tsx                     # Entry redirect → splash
│   ├── splash.tsx                    # Bootstrap: auth init, font load, route
│   ├── splash.web.tsx                # Web variant
│   ├── +not-found.tsx                # 404 fallback
│   │
│   ├── (auth)/                       # Auth route group
│   │   ├── _layout.tsx               # Auth stack navigator
│   │   ├── onboarding.tsx            # First-time onboarding carousel
│   │   ├── login.tsx                 # Login screen
│   │   ├── signup.tsx                # Signup screen
│   │   ├── reset-password.tsx        # Password reset
│   │   └── complete-profile.tsx      # 3-step profile completion
│   │
│   └── (main)/                       # Protected route group
│       ├── _layout.tsx               # Tab navigator + AuthGate
│       ├── index.tsx                 # Home / dashboard
│       ├── select-meal.tsx           # Meal selection
│       ├── meal-detail.tsx           # Meal detail
│       ├── topics.tsx                # Topics library
│       ├── topic-detail.tsx          # Topic detail
│       ├── stats.tsx                 # Statistics dashboard
│       ├── community.tsx             # Community feed
│       ├── account.tsx               # Account settings
│       ├── meal-preferences.tsx      # Favorite meals
│       └── user-profile.tsx          # User profile view
│
├── features/                         # Feature vertical slices
│   │
│   ├── auth/                         # Authentication & session
│   │   ├── domain/
│   │   │   ├── auth.types.ts         # AuthSession, AuthUser, LoginPayload, SignupPayload
│   │   │   ├── loginUseCase.ts       # Pure: validate → repo → return session
│   │   │   ├── signupUseCase.ts
│   │   │   ├── logoutUseCase.ts
│   │   │   └── initSessionUseCase.ts # Restore session on boot
│   │   ├── repository/
│   │   │   ├── IAuthRepository.ts    # Interface — the contract
│   │   │   ├── IUserProfileRepository.ts
│   │   │   ├── auth.repository.mock.ts        # AsyncStorage-backed mock
│   │   │   ├── auth.repository.supabase.ts    # Supabase Auth client
│   │   │   ├── userProfile.repository.mock.ts
│   │   │   ├── userProfile.repository.supabase.ts
│   │   │   └── index.ts              # Factory — picks mock or supabase via env
│   │   ├── store/
│   │   │   ├── authSession.store.ts  # Status, session, init/login/logout
│   │   │   ├── authForm.store.ts     # Email/password field state (login form)
│   │   │   ├── profileSetup.store.ts # Multi-step profile completion state
│   │   │   └── authGate.store.ts     # Auth gate sheet open/close
│   │   ├── hooks/
│   │   │   ├── useAuthSession.ts     # Thin wrapper around authSession.store
│   │   │   └── useAuthGate.ts        # requireAuth() gating logic
│   │   └── components/
│   │       ├── SocialAuthButtons.tsx
│   │       ├── AuthGateSheet.tsx
│   │       ├── ProfileStepBasic.tsx
│   │       ├── ProfileStepHealth.tsx
│   │       └── ProfileStepGoals.tsx
│   │
│   ├── user/                         # User profile & account settings
│   │   ├── domain/
│   │   │   ├── user.types.ts         # User, UserProfile, HealthGoal
│   │   │   ├── updateProfileUseCase.ts
│   │   │   └── updateAccountSettingsUseCase.ts
│   │   ├── repository/
│   │   │   ├── IUserRepository.ts
│   │   │   ├── user.repository.mock.ts
│   │   │   ├── user.repository.supabase.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── user.store.ts         # Current user profile
│   │   │   └── account.store.ts      # Settings: avatar, visibility, language
│   │   ├── hooks/
│   │   │   └── useCurrentUser.ts     # TanStack Query for profile
│   │   └── components/
│   │       ├── AvatarPickerSheet.tsx
│   │       └── SettingsRow.tsx
│   │
│   ├── meals/                        # Meal catalog & zone data
│   │   ├── domain/
│   │   │   ├── meal.types.ts         # Meal, MealItem, Zone
│   │   │   └── mealZoneUtils.ts      # Zone color, label lookups
│   │   ├── repository/
│   │   │   ├── IMealRepository.ts
│   │   │   ├── meal.repository.mock.ts
│   │   │   ├── meal.repository.supabase.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── useMeals.ts           # TanStack Query — meals catalog
│   │   │   └── useMealItems.ts       # TanStack Query — meal items by zone
│   │   └── components/
│   │       ├── MealCard.tsx
│   │       └── ZoneBadge.tsx
│   │
│   ├── tracking/                     # User meal logs & daily tracking
│   │   ├── domain/
│   │   │   ├── tracking.types.ts     # UserMeal, DailyLog
│   │   │   ├── logMealUseCase.ts     # Validate: <3 meals/day → create log
│   │   │   └── deleteMealLogUseCase.ts
│   │   ├── repository/
│   │   │   ├── ITrackingRepository.ts
│   │   │   ├── tracking.repository.mock.ts
│   │   │   ├── tracking.repository.supabase.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── tracking.store.ts     # Today's meals, log action, optimistic update
│   │   ├── hooks/
│   │   │   ├── useUserMeals.ts       # TanStack Query — user meal history
│   │   │   └── useTodayMeals.ts      # Derived: filter today's logs
│   │   └── components/
│   │       ├── TodayMealRow.tsx
│   │       └── MealLogList.tsx
│   │
│   ├── stats/                        # Statistics & charts
│   │   ├── domain/
│   │   │   ├── stats.types.ts        # DailySummary, WeeklyTrend, ZoneStat
│   │   │   └── statsAggregator.ts    # Pure functions: dailyAdherence, weeklyTrend
│   │   ├── repository/
│   │   │   ├── IStatsRepository.ts
│   │   │   ├── stats.repository.mock.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── useStats.ts           # Combines TanStack + aggregator
│   │   └── components/
│   │       ├── AdherenceLineChart.tsx
│   │       ├── ZoneDonutChart.tsx
│   │       ├── WeeklyBarChart.tsx
│   │       └── StatsDateRangePicker.tsx
│   │
│   ├── community/                    # Community feed & social
│   │   ├── domain/
│   │   │   ├── community.types.ts    # Post, Comment, Reaction, CommunityStats
│   │   │   ├── followUserUseCase.ts
│   │   │   └── reactToPostUseCase.ts
│   │   ├── repository/
│   │   │   ├── ICommunityRepository.ts
│   │   │   ├── community.repository.mock.ts
│   │   │   ├── community.repository.supabase.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── communityActions.store.ts  # follow/unfollow, react (write-only)
│   │   ├── hooks/
│   │   │   ├── useCommunityFeed.ts   # TanStack paginated query
│   │   │   └── useCommunityStats.ts
│   │   └── components/
│   │       ├── PostCard.tsx
│   │       ├── CommunityStatsTab.tsx
│   │       └── EmptyFeed.tsx
│   │
│   ├── ratings/                      # Weekly health ratings
│   │   ├── domain/
│   │   │   ├── rating.types.ts       # WeeklyRating
│   │   │   └── submitRatingUseCase.ts
│   │   ├── repository/
│   │   │   ├── IRatingRepository.ts
│   │   │   ├── rating.repository.mock.ts
│   │   │   ├── rating.repository.supabase.ts
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── weeklyRating.store.ts
│   │   └── components/
│   │       └── StarRatingInput.tsx
│   │
│   └── notifications/                # (Future) push notifications
│       └── domain/
│           └── notification.types.ts
│
├── shared/                           # Cross-feature infrastructure
│   ├── api/
│   │   ├── supabaseClient.ts         # Singleton Supabase client
│   │   └── fetchyClient.ts           # HTTP client (non-Supabase APIs)
│   ├── storage/
│   │   ├── storageService.ts         # AsyncStorage/localStorage wrapper
│   │   └── storageKeys.ts            # STORAGE_KEYS enum (all keys)
│   ├── errors/
│   │   ├── AppError.ts               # Base error class hierarchy
│   │   └── errorUtils.ts             # toUserMessage(error), isNetworkError()
│   ├── offline/
│   │   ├── offlineQueue.ts           # FIFO queue in AsyncStorage
│   │   └── syncManager.ts            # NetInfo listener + queue flusher
│   ├── ui/
│   │   ├── ErrorBoundary.tsx         # Generic React Error Boundary
│   │   └── OfflineBanner.tsx         # "You're offline" indicator
│   └── testing/
│       ├── factories/
│       │   ├── userFactory.ts
│       │   ├── mealFactory.ts
│       │   └── sessionFactory.ts
│       └── mocks/
│           └── storageService.mock.ts
│
├── components/                       # Global shared UI primitives
│   ├── AppText.tsx
│   ├── AppTextInput.tsx
│   ├── PrimaryButton.tsx
│   ├── AppTabBar.tsx
│   ├── StepIndicator.tsx
│   ├── ChipSelector.tsx
│   ├── SelectionModal.tsx
│   └── StarRating.tsx
│
├── hooks/                            # Global custom hooks
│   ├── useRTL.ts
│   ├── useThemeMode.ts
│   └── useNetworkStatus.ts           # [New] Wraps @react-native-netinfo
│
├── stores/                           # Global (non-feature) stores
│   ├── app.store.ts                  # Language, app readiness
│   └── theme.store.ts                # Light/dark/system
│
├── theme/                            # Design system
│   ├── index.ts
│   ├── theme.ts
│   └── tokens.ts
│
├── localization/                     # i18n
│   ├── i18n.ts
│   └── translations/
│       ├── ar.json
│       └── en.json
│
├── types/                            # Shared/root types only
│   └── env.d.ts                      # EXPO_PUBLIC_* env var types
│
├── utils/                            # Pure helpers (no side effects)
│   ├── dateUtils.ts
│   ├── zoneUtils.ts
│   ├── statsUtils.ts                 # (Move aggregation to features/stats/domain)
│   ├── deviceUtils.ts
│   └── communityTime.ts
│
├── data/                             # Static data (not mock API data)
│   ├── onboarding/
│   │   └── onboardingSlides.json
│   └── topics/
│       └── topics.json
│
└── assets/                           # Fonts, images (unchanged)
```

---

## Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Files | `kebab-case.ts` | `auth.repository.mock.ts` |
| Interfaces | `I` prefix + `PascalCase` | `IAuthRepository` |
| Types | `PascalCase` | `AuthSession`, `LoginPayload` |
| Stores | `use` + Feature + `Store` | `useAuthSessionStore` |
| Hooks | `use` + Description | `useCurrentUser`, `useCommunityFeed` |
| Use-cases | `verbNounUseCase.ts` | `loginUseCase.ts`, `logMealUseCase.ts` |
| Repository files | `feature.repository.impl.ts` | `auth.repository.supabase.ts` |
| Factory files | `index.ts` inside `repository/` | picks impl from env |
| Screens | `PascalCase` (Expo Router auto-names) | `login.tsx` → `LoginScreen` component |
| Components | `PascalCase.tsx` | `AuthGateSheet.tsx` |
| Test files | Same name + `.test.ts` | `loginUseCase.test.ts` |

---

## Import Rules

```
app/         → may import from features/*/hooks, features/*/store, features/*/components, components/, shared/
features/*/store  → may import from features/*/domain, features/*/repository/index, shared/
features/*/domain → may import from shared/errors, types in same domain folder ONLY
features/*/repository → may import from shared/api, shared/storage
shared/      → may NOT import from features/ or app/
components/  → may NOT import from stores/ or features/*/store (use props/hooks pattern)
```

**No circular imports.** `features/auth` must never import from `features/user` directly. If both need a common type, it goes in `shared/` or both features define their own minimal type (prefer duplication over coupling for small types).

---

## What Moves Where (Migration Map)

| Current Location | Target Location |
|---|---|
| `stores/auth.store.ts` | Split → `features/auth/store/authSession.store.ts` + `features/auth/store/profileSetup.store.ts` |
| `stores/user.store.ts` | `features/user/store/user.store.ts` |
| `stores/account.store.ts` | `features/user/store/account.store.ts` |
| `stores/meals.store.ts` | Replaced by `features/meals/hooks/useMeals.ts` (TanStack) |
| `stores/mealItems.store.ts` | Replaced by `features/meals/hooks/useMealItems.ts` (TanStack) |
| `stores/userMeals.store.ts` | `features/tracking/store/tracking.store.ts` + `features/tracking/hooks/useUserMeals.ts` |
| `stores/community.store.ts` | `features/community/store/communityActions.store.ts` + `features/community/hooks/useCommunityFeed.ts` |
| `stores/weeklyRating.store.ts` | `features/ratings/store/weeklyRating.store.ts` |
| `stores/authGate.store.ts` | `features/auth/store/authGate.store.ts` |
| `stores/app.store.ts` | `stores/app.store.ts` (unchanged — global) |
| `stores/theme.store.ts` | `stores/theme.store.ts` (unchanged — global) |
| `api/auth/auth.service.ts` | Replaced by use-cases in `features/auth/domain/` |
| `api/auth/authApi.mock.ts` | `features/auth/repository/auth.repository.mock.ts` |
| `api/auth/types.ts` | `features/auth/domain/auth.types.ts` |
| `types/auth.types.ts` | `features/auth/domain/auth.types.ts` (merged) |
| `types/index.ts` | Split per feature domain folder |
| `components/auth/` | `features/auth/components/` |
| `components/home/` | `features/tracking/components/` |
| `components/community/` | `features/community/components/` |
| `components/account/` | `features/user/components/` |
| `utils/zoneUtils.ts` | `features/meals/domain/mealZoneUtils.ts` |
| `utils/statsUtils.ts` | `features/stats/domain/statsAggregator.ts` |
| `utils/communityTime.ts` | `features/community/domain/communityTime.ts` |
| `data/mock/` | Per-feature `repository/*.mock.ts` (inline) |
| `shared/lip/Fetchy/` | `shared/api/fetchyClient.ts` |
