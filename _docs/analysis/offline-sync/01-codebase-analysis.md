# 01 — Codebase Analysis: Offline Readiness (Home + Today Meals)

Analysis performed before writing the plan. Focus: the **home screen** (`app/(main)/index.tsx`) and **today's meals** data path, since those are the priority to make bullet-proof offline.

## Data path traced

```
HomeScreen (app/(main)/index.tsx)
  ├─ useUserStore        → user profile (name, plan_start_date …)
  ├─ useMealsStore       → meals[] (reference data) + mealImageBaseUrl   → initializeMeals()
  ├─ useUserMealsStore   → userMeals[] + todayMeals[]                     → initializeUserMeals() / refreshTodayMeals()
  ├─ useUserRatingStore  → pendingRating
  └─ useNotificationsStore → unreadCount

useUserMealsStore.initializeUserMeals()
  → trackingRepository.getUserMeals(userId)                → TrackingRepositorySupabase
      → supabase.from('user_meals').select(...).gte('date', -89d)

Writes: logMeal / replaceMeal / deleteMeal
  → trackingRepository.*  → direct supabase insert/update/delete (awaited)
  → then optimistic state update WITH the server response
  → side effects: membershipStore.recordEvent()/deleteDayEvent() (RPC, fire-and-forget)
                  notificationSettingsStore.refreshMealReminder() (local)
```

## Findings

### 🔴 F1 — No persistence of domain data (in-memory only)
Zustand stores hold everything in RAM. `grep` for the `persist` middleware across `stores/` found **no real usage** (only the word "persist" in comments). The **only** thing persisted across restarts is the Supabase **auth session** (`lib/supabase.ts` → `storage: AsyncStorage`, `persistSession: true`).

**Consequence on a cold start with no network:**
- `meals = []` → `initializeMeals()` throws → `showMealsError` true → home renders the red **"تعذّر تحميل البيانات"** screen (`index.tsx:206`).
- `userMeals = []` → today's meals empty.
- `user = null` until a profile fetch succeeds → home is stuck on `<MealSpinner />` (`index.tsx:177-183`) because `displayUser` is null offline.

So today the app is effectively **unusable offline on a fresh launch**.

### 🔴 F2 — No connectivity detection
`@react-native-community/netinfo` is **not installed**; no `isConnected`/online state anywhere. The app cannot tell "offline" from "server error", so every offline failure surfaces as a generic red error instead of a graceful offline state.

### 🔴 F3 — Writes are synchronous & unqueued
`logMeal` / `replaceMeal` / `deleteMeal` `await` Supabase directly. The optimistic update happens **after** success (state is set from the server row). Offline → the `await` rejects → `errorMessage` set, `Alert` shown, `return false`. **Nothing is queued; the user action is simply lost.** There is no outbox.

### 🟠 F4 — Server-generated integer IDs make offline creates tricky
`user_meals.id` is a DB auto-increment `bigint`. An offline-created meal has **no id** until it syncs. The home screen relies on the id:
- `key={um.id}` (list key)
- `slotIndex = um.id % 3` → chooses breakfast/lunch/dinner tab (`index.tsx:264`)
- `meal-detail` / `select-meal` navigation passes `userMealId`.

Temp client IDs (e.g. negative timestamps) are needed, plus reconciliation to the real id after sync. `id % 3` breaks for negative temp ids — the slot must become an explicit field, not derived from id.

### 🟠 F5 — No idempotency → duplicate risk on sync
If a write actually reached Supabase but the response was lost (flaky network), replaying the queued op inserts a **duplicate** meal. `user_meals` has no client-supplied unique key (`client_op_id`) to dedupe on.

### 🟠 F6 — Timestamp is stamped at send time, not creation time
`TrackingRepositorySupabase.logMeal` sets `datetime`/`date` = `new Date()` **inside the repo**. If a meal is logged offline at 11pm and synced next morning, it would get the wrong date. The creation timestamp must be captured when the user acts and passed through to the insert.

### 🟠 F7 — Cross-store side effects fail silently offline
`membershipStore.recordEvent()` / `deleteDayEvent()` are RPC calls wrapped in try/catch that only `log.error` (fire-and-forget). Offline, points are silently **not** recorded and never retried. Needs to be part of the sync/reconcile step (or recomputed after meal sync).

### 🟡 F8 — Meal images are network-only
`MealImage` uses React Native's `<Image>` with a Supabase Storage URL (`{baseUrl}{code}.png`). RN only caches after a successful first load; there is no guaranteed **disk** cache. Offline-first launch → broken thumbnails. `expo-image` (persistent disk cache + `prefetch`) is **not installed**.

### 🟡 F9 — 5-min TTL cache is in-memory
`useUserMealsStore` has a `CACHE_TTL_MS` gate, but `lastFetchedAt` and the data live in RAM, so it does nothing across restarts.

### ✅ What already works in our favor
- `refreshTodayMeals()` and `getMealsByDate()` are **pure client-side filters** over `userMeals` — once `userMeals` is persisted, today's meals compute offline with zero network.
- The 3-meals/day and fasting-once rules read `get().userMeals` (would include optimistic entries) — validation stays correct offline.
- `@tanstack/react-query` `QueryClientProvider` is already mounted in `app/_layout.tsx` (unused for data today, but available).
- `storageService` + `STORAGE_KEYS` give a clean AsyncStorage wrapper to build on.
- Repositories are cleanly abstracted behind interfaces — offline logic can live in a decorator/queue without touching screens.

## Dependency gaps to close
| Need | Present? | Action |
| --- | --- | --- |
| Connectivity detection | ❌ | add `@react-native-community/netinfo` |
| Persistent disk image cache | ❌ (RN Image) | add `expo-image` (or `Image.prefetch` + cache) |
| Persisted store state | ❌ | zustand `persist` + AsyncStorage (via `storageService`) |
| Idempotent inserts | ❌ | Supabase migration: `client_op_id uuid unique` on `user_meals` |
| AsyncStorage | ✅ | already used |
| React Query | ✅ (mounted) | optional to leverage |
