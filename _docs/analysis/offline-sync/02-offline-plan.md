# 02 — Offline & Sync Plan (Home + Today Meals first)

**Goal:** the app opens and works with **no network** — home + today's meals render from cache instantly, the user can log/replace/delete meals offline, and everything **syncs cleanly when back online with no errors and no duplicates**.

**Strategy:** offline-first with a **local cache (read)** + **outbox queue (write)** + **sync engine (reconcile)**. Build in the order below — each phase ships value on its own. Phases 0–1 alone make the app *readable* offline (the priority); Phase 2 makes it *writable*.

---

## Guiding principles

1. **Cache-first render, then revalidate.** Read from persisted store immediately; refresh from Supabase in the background when online.
2. **Never show a red error for an offline condition.** Distinguish `offline` from `server error` (NetInfo). Offline = calm cached UI + a subtle "غير متصل" / "بانتظار المزامنة" chip.
3. **Optimistic writes, always queued.** The UI updates immediately; the network op goes to a persisted outbox and drains later.
4. **Idempotent sync.** Every queued write carries a client op id so replays can't duplicate.
5. **Own-data, last-write-wins.** `user_meals` rows belong to one user → conflicts are rare and resolved by LWW.

---

## Phase 0 — Foundations (connectivity + persistence infra)

*Prereq for everything. ~0.5–1 day.*

- **Add NetInfo.** `npx expo install @react-native-community/netinfo`. Create `stores/network.store.ts` exposing `isOnline: boolean` (+ `wasOffline` transition), subscribing to `NetInfo.addEventListener`. Also expose a `networkService.isOnline()` for non-React callers (repos/sync).
- **Add a persist helper.** Wrap zustand `persist` with `createJSONStorage(() => AsyncStorage)` (reuse `storageService` semantics). Add new keys to `STORAGE_KEYS`: `CACHE_MEALS`, `CACHE_USER_MEALS`, `CACHE_USER_PROFILE`, `CACHE_PUBLIC_CONFIG`, `OUTBOX`, `SYNC_META`.
- **Namespace cache by user id.** Persisted user data (userMeals, profile) must be keyed per `user.id` so switching accounts / logout never leaks another user's meals. Clear on logout in `storeReset.ts` (`resetAllAppStores`).

**Exit check:** `useNetworkStore().isOnline` flips correctly in airplane mode; a dummy persisted store survives an app restart.

---

## Phase 1 — Read offline: Home + Today Meals render from cache ⭐ (priority)

*The core ask. ~1–2 days.*

- **Persist `meals.store`** (`meals`, `mealImageBaseUrl`) — reference data, changes rarely. On `initializeMeals()`: hydrate from cache first; fetch only if online; on fetch failure **keep the cache** instead of clearing to `[]` (fixes the red-error screen, F1).
- **Persist `userMeals.store`** (`userMeals`, `lastFetchedAt`). `initializeUserMeals()`:
  - Hydrate persisted `userMeals` on boot → `refreshTodayMeals()` computes today's list **with no network** (already a pure filter — F-✅).
  - If online: background revalidate (stale-while-revalidate). If offline: skip the fetch, keep cache, **do not** set `errorMessage`.
- **Persist minimal `user` profile** (`user.store`) so `displayUser` is non-null offline → fixes the infinite `<MealSpinner/>` (F1). On boot, hydrate cached profile; `reloadProfile()` only overwrites when a fetch succeeds.
- **Fix the home error/loained states** (`index.tsx:185-221`):
  - `showMealsError` only when `!meals.length && isOnline` (real error). Offline + empty cache → friendly offline empty state, not red error.
  - Keep the existing empty-today card for the legit "no meals logged yet" case.
- **Offline-proof meal images (F8):** add `expo-image` (`npx expo install expo-image`), switch `MealImage` to it for disk-cached images, and **prefetch** today's + favourite meal images right after `initializeMeals()` succeeds (`Image.prefetch`/`expo-image` prefetch) so thumbnails show offline.

**Exit check (manual):** cold-start in airplane mode after one online run → home shows profile, commitment card, today's meals with thumbnails, weekly progress. **Zero red errors.**

---

## Phase 2 — Write offline: outbox + optimistic Today Meals

*The hard part. ~2–4 days.*

### 2a. Outbox queue

- قق`stores/outbox.store.ts` (persisted): array of ops
  ```ts
  type OutboxOp = {
    opId: string;                  // uuid — idempotency key
    type: 'log' | 'replace' | 'delete';
    payload: {...};                // meal ids, item codes, zone, hungry_state, clientDatetime
    tempId?: number;               // for 'log': the optimistic negative id
    targetId?: number;             // for replace/delete: temp or real user_meal id
    createdAt: string;             // device timestamp — becomes the meal datetime (fixes F6)
    status: 'pending' | 'syncing' | 'error';
    attempts: number;
  };
  ```
- Generate `opId` with a uuid util. Persist on every change.

### 2b. Optimistic model in `userMeals.store`

- Add fields to the local `UserMeal`: a **stable local key** and an explicit **`slot`** (breakfast/lunch/dinner) so the UI no longer derives the slot from `id % 3` (fixes F4). Update `index.tsx:264` to read `um.slot` (fallback to `id % 3` for legacy synced rows).
- `logMeal` when **offline** (or always, then flush):
  1. build a temp `UserMeal` with `id = -Date.now()` (negative → never collides with server ids), `pending: true`, `date/datetime = createdAt`.
  2. push into `userMeals` immediately + `refreshTodayMeals()` (instant UI).
  3. enqueue an outbox `log` op with the same `opId`/`createdAt`.
  4. run the same **3-meals/day + fasting-once** validation against `get().userMeals` (includes optimistic entries) — already correct (F-✅).
- `deleteMeal`/`replaceMeal` on a **temp (unsynced)** row → resolve purely locally (drop/replace the temp entry and its queued `log` op; no network op emitted).
- `deleteMeal`/`replaceMeal` on a **synced** row while offline → optimistic update + enqueue `delete`/`replace` op targeting the real id.

### 2c. Idempotent inserts (Supabase migration)

- Add `client_op_id uuid` to `user_meals` with a **UNIQUE** constraint; insert it from the outbox `opId`. Use `upsert(..., { onConflict: 'client_op_id', ignoreDuplicates: true })` so a replayed op after a lost-ack **cannot duplicate** (fixes F5).
- Change `TrackingRepositorySupabase.logMeal` to accept `clientOpId` + `clientDatetime` from the payload instead of stamping `new Date()` (fixes F6).

**Exit check:** log 3 meals in airplane mode → they appear instantly on home with thumbnails and correct slots; kill & relaunch app (still offline) → they persist.

---

## Phase 3 — Sync engine (reconcile, no errors, no dupes)

*~1–2 days.*

- New `services/sync/index.ts` — a single `runSync()` orchestrator:
  1. **Guard:** if `!isOnline` or already running → no-op.
  2. **Drain outbox in FIFO order.** For each op: mark `syncing` → call the repo (idempotent upsert) → on success replace the temp `UserMeal` with the returned server row and **remap** `tempId → realId` across the store and any later queued ops that target it. Remove the op.
  3. **On expected network failure** (NetInfo dropped mid-sync / `NetworkError`): leave op `pending`, stop, retry later. **Never** surface a red error — this is the "sync without error" guarantee.
  4. **On genuine server rejection** (validation/permission): mark op `error`, keep the optimistic row flagged, surface a **non-blocking** toast, and expose a manual retry. (Rare for own-data writes.)
  5. **Pull fresh reads** after the outbox is empty (`initializeUserMeals(force)`), then reconcile: server truth wins for synced rows; keep still-pending temp rows.
  6. **Replay membership side effects (F7):** after meal sync, recompute/record the day's `committed` point events for days that changed, and `deleteDayEvent` for emptied days — using the same idempotency guarantees. (record_point_event must be safe to call once per day; dedupe server-side or gate client-side.)
- **Triggers for `runSync()`:** app start (if online) · NetInfo `offline→online` transition · `AppState` → `active` · pull-to-refresh (`handleRefresh` in `index.tsx:155`) · after each successful online write (flush).
- **Concurrency:** a module-level `isSyncing` lock + a "sync again requested" flag so overlapping triggers coalesce.

**Exit check:** log/delete/replace several meals offline → go online → within seconds everything syncs, temp ids become real, **no duplicates** (verify row count in Supabase), no error toasts, membership points correct.

---

## Phase 4 — Correctness, UX polish & tests

*~1–2 days.*

- **Sync status UI:** a small chip on home — "غير متصل" when offline, "بانتظار المزامنة (n)" when the outbox is non-empty, hidden when synced. Optional per-row "pending" dot on `TodayMealRow`.
- **Day boundary / timezone:** `createdAt` from device time drives `date/datetime`; confirm a meal logged offline at 23:59 keeps its original date after morning sync.
- **Guest mode:** unaffected (read-only demo, no writes/sync).
- **Logout/reset:** `resetAllAppStores()` must clear all cache keys + the outbox for the signed-out user.
- **Test matrix (manual + a few unit tests on the outbox reducer):**
  1. Cold start, airplane mode, first-ever launch (no cache) → friendly offline empty state, no crash.
  2. Cold start, airplane mode, after prior online run → full home renders from cache.
  3. Log 3 meals offline → relaunch offline → persisted → go online → synced once, no dupes.
  4. Delete a synced meal offline → sync → row gone server-side.
  5. Replace a still-pending meal offline → only one final row after sync.
  6. Flaky network (lost ack): op replays → `client_op_id` unique prevents duplicate.
  7. Overnight: meal logged 23:59 offline keeps its date after morning sync.
  8. Two devices / re-pull: server truth reconciles without wiping pending local writes.

---

## Supabase changes required

| Change                                                                                                        | Why                             |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `ALTER TABLE user_meals ADD COLUMN client_op_id uuid; CREATE UNIQUE INDEX ... ON user_meals(client_op_id);` | Idempotent inserts (F5)         |
| Repo insert via`upsert(onConflict: 'client_op_id', ignoreDuplicates: true)`                                 | No duplicates on replay         |
| Accept client`datetime`/`date` in `logMeal` (stop stamping server time)                                 | Correct offline timestamps (F6) |
| Ensure`record_point_event` is idempotent per (user, day) or add client-side gate                            | Correct points after sync (F7)  |
| Keep RLS as-is (rows scoped to`auth.uid()`)                                                                 | Security unchanged              |

## New dependencies

- `@react-native-community/netinfo` (connectivity) — Expo-compatible.
- `expo-image` (persistent image disk cache + prefetch) — replaces RN `<Image>` in `MealImage`.
- A small uuid generator (e.g. `expo-crypto` `randomUUID`, already Expo-friendly).

## Recommended minimum viable slice

If you want the smallest shippable win first: **Phase 0 + Phase 1** = home + today's meals fully readable offline with no errors. That alone removes the worst failure (unusable app with no network). Phase 2–3 (offline writes + sync) is the larger, higher-risk effort — do it as a focused follow-up with the test matrix above.

## Effort estimate

| Phase | Scope                          | Est.                  |
| ----- | ------------------------------ | --------------------- |
| 0     | NetInfo + persist infra        | 0.5–1 d              |
| 1     | Read offline (home + today) ⭐ | 1–2 d                |
| 2     | Offline writes + outbox        | 2–4 d                |
| 3     | Sync engine + reconcile        | 1–2 d                |
| 4     | Polish + tests                 | 1–2 d                |
|       | **Total**                | **~6–11 days** |
