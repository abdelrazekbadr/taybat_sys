# 01 — Current State Analysis

## Layer Inventory

```
app/           → Expo Router screens + layouts (UI + navigation)
stores/        → Zustand stores (state + async actions)
api/           → Services + mock API implementations + storage
components/    → UI components (common + feature-specific)
hooks/         → Custom React hooks
theme/         → React Native Paper theme builder + tokens
types/         → Domain type definitions (partially here, partially in api/)
localization/  → i18next config + translation files
data/          → Mock data + static JSON
utils/         → Pure utility functions
core/          → Color constants
shared/        → Fetchy HTTP client library
```

---

## Data Flow (Current)

```
Screen (app/)
    │  reads selector / calls action
    ▼
Zustand Store (stores/)
    │  calls service function
    ▼
Service (api/*/service.ts)
    │  calls mock API function
    ▼
Mock API (api/*.mock.ts)
    │  reads/writes JSON in
    ▼
AsyncStorage (storageService)
```

---

## What Works Well

- File-based routing via Expo Router is clean and maps 1:1 to screens
- Cairo + NativeWind + React Native Paper design system is cohesive
- i18next + RTL bootstrapping is complete and correct
- Auth state machine in `auth.store.ts` covers all lifecycle states
- `storageService` abstraction prevents AsyncStorage spread
- `STORAGE_KEYS` centralizes all key names

---

## Identified Problems

### P1 — No Repository Abstraction (Critical)

Mock implementations are called directly by services. There is no interface that both mock and Supabase can implement. Replacing mock with Supabase requires editing service files.

```
// Current — service knows about mock
import { authApi } from './authApi.mock';   ← hardcoded
```

No swap point exists. The mock is a direct dependency, not an adapter.

---

### P2 — Type Fragmentation (High)

Domain types live in three locations:
- `types/auth.types.ts` — AuthUser, AuthSession, LoginPayload
- `types/index.ts` — User, Meal, UserMeal, CommunityPost
- `api/auth/types.ts` — IAuthApi, IUserApi interface definitions

No single source of truth. Stores and services import from different paths for related types. Interface definitions are buried inside an implementation folder.

---

### P3 — Fat Stores — Mixed Concerns (High)

`auth.store.ts` handles:
- Login / signup / logout actions
- Profile completion flow
- Form state (email, password fields)
- Session initialization
- OAuth flows
- Error messages for each sub-action

This makes it untestable without setting up the whole auth subsystem, and screens cannot subscribe to narrow slices without re-rendering on unrelated state changes.

---

### P4 — Cross-Store Direct Imports (Medium)

Some stores import other stores directly:

```typescript
// community.store.ts
import { useUserStore } from './user.store';   ← inter-store dependency
const userId = useUserStore.getState().user?.id;
```

This creates invisible coupling. A change to `user.store` can break `community.store` silently. It also makes stores impossible to test in isolation.

---

### P5 — No Server State Layer (Medium)

TanStack Query is installed but unused. All server data lives in Zustand stores, which means:
- No automatic stale-while-revalidate
- No background refetch on window focus / app foreground
- No request deduplication
- Manual loading/error state management duplicated across 13 stores

---

### P6 — No Offline Strategy (Medium)

The app has no offline queue, no sync mechanism, and no connectivity awareness. When Supabase is integrated, users on poor connections will see silent failures. There is no optimistic update + rollback pattern.

---

### P7 — No Error Boundary or Typed Errors (Medium)

Errors are caught as `unknown`, narrowed to `Error`, and surfaced as arbitrary strings. There is no typed error hierarchy (NetworkError, AuthError, ValidationError), no React Error Boundary wrapping feature zones, and no global error toast coordinator.

---

### P8 — Testing Infrastructure Missing (Medium)

- No test for any store, service, or component
- Stores call real services, making unit tests require mock setup from scratch
- No test factory/builder pattern for creating test data
- No CI integration verified

---

### P9 — Folder Structure is Layer-Based, Not Feature-Based (Low-Medium)

All stores are flat in `stores/`. All components are in `components/`. This works at small scale but at 20+ features it becomes:
- Hard to identify what belongs to what feature
- Encourages cross-feature imports that aren't explicit
- Makes per-feature ownership/testing harder to enforce

---

### P10 — No Dashboard / Charts Architecture (Low — Forward-Looking)

The `stats.tsx` screen and `CommunityStatsTab.tsx` exist but the dashboard architecture (data aggregation, chart data transformation, time-range filtering) is not designed. Adding charts without a plan will scatter aggregation logic into screens.

---

## Current Store Catalog

| Store | Responsibility | Problems |
|---|---|---|
| `auth.store` | Login, signup, OAuth, profile completion, session init | Too large; mixes form + domain + auth machine |
| `app.store` | Language, app readiness, HAS_SEEN_ONBOARDING | Clean |
| `user.store` | Current user profile | Depends on user data from auth |
| `theme.store` | Light/dark/system mode | Clean |
| `account.store` | Account settings (avatar, visibility, language) | Reads from user.store directly |
| `meals.store` | Meals catalog | Reads from mock data |
| `mealItems.store` | Meal items by zone | Reads from mock data |
| `mealPreferences.store` | Favorite meals | Reads from user.store |
| `userMeals.store` | Meal logs | Reads from meals.store + user.store |
| `weeklyRating.store` | Weekly health ratings | Reads from user.store |
| `community.store` | Posts, follows, reactions | Reads from user.store |
| `authGate.store` | Auth gate sheet visibility | UI state only |

---

## Dependency Graph (Current)

```
auth.store ─────────────────────────────────────► authService ──► authApi.mock
user.store ──────────────────────────────────────► userService ──► userApi.mock
account.store ──── reads ────► user.store
mealPreferences.store ── reads ──► user.store
userMeals.store ────── reads ──► meals.store
                   └─── reads ──► user.store
weeklyRating.store ── reads ──► user.store
community.store ───── reads ──► user.store
```

**Problem:** domain stores are tightly coupled to `user.store`. Any change to `user.store` state shape cascades to 5 stores.

---

## Mock API Layer (Current)

```
authApi.mock.ts     — users stored in AsyncStorage as JSON array
userApi.mock.ts     — profiles stored in AsyncStorage as JSON map
accountApi.ts       — partial, calls storage directly
mealPreferencesApi.ts — calls storage directly
```

There is no shared interface file that defines what a "real" implementation must expose. The mock is the only implementation, and it is the definition.
