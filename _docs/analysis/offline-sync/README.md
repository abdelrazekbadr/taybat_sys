# Offline & Sync — Al‑Taybat (Home + Today Meals first)

Make the app open and work with **no network**, then **sync cleanly when back online — no errors, no duplicates**. Priority: the **home screen** and **today's meals**.

Generated: 2026‑07‑04 (analysis of `taybat_app` at commit on `main`).

## Documents
| File | Purpose |
| --- | --- |
| [01-codebase-analysis.md](01-codebase-analysis.md) | What the code does today + the 9 gaps blocking offline |
| [02-offline-plan.md](02-offline-plan.md) | Phased implementation plan (0→4) with effort + Supabase changes |

## Bottom line from the analysis
The app is currently **not usable on a cold start with no network**:
- **No domain data is persisted** — Zustand stores are in-memory only (just the Supabase auth session survives restarts). Offline launch → `meals=[]` → red "تعذّر تحميل البيانات"; `user=null` → stuck on the spinner.
- **No connectivity detection** (`NetInfo` not installed) → offline looks like a server error.
- **Writes aren't queued** — `logMeal`/`replaceMeal`/`deleteMeal` hit Supabase directly and just fail offline; the action is lost.
- Secondary risks: server-generated int ids vs. offline creates, no idempotency key (duplicate risk on sync), send-time timestamps (wrong dates), network-only meal images.

What helps us: today's-meals filtering is already pure/client-side, rules read from local state, repos are cleanly abstracted, and React Query is already mounted.

## The approach (offline-first)
**Cache-first read** (persist stores) + **outbox queue** (optimistic, persisted writes) + **sync engine** (idempotent reconcile on reconnect).

- **Phase 0** — NetInfo + persistence infra
- **Phase 1 ⭐** — Home + Today Meals render from cache (the priority; ~1–2 d)
- **Phase 2** — Offline writes via optimistic outbox
- **Phase 3** — Sync engine (drain → reconcile, no errors, no dupes)
- **Phase 4** — Sync-status UI, timezone correctness, test matrix

**Smallest shippable win:** Phase 0 + 1 → app fully *readable* offline. Phases 2–3 add offline *writes* + sync.

## Requires (see plan for details)
- Deps: `@react-native-community/netinfo`, `expo-image`, a uuid source (`expo-crypto`).
- Supabase: add `client_op_id uuid` **unique** on `user_meals` (idempotent inserts) + pass client timestamps through on insert.
