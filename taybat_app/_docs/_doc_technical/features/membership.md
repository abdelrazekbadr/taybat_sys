# Membership Feature — Technical Documentation

**Last updated:** 2026-06-07

---

## 1. Overview

The membership system rewards users with points across two independent tracks:

| Track | Arabic | Earns points by |
| --- | --- | --- |
| **Committed** | عضو ملتزم | Logging meals daily + completing weekly ratings |
| **Supporter** | عضو داعم | Sharing meals/posts externally |

Points accumulate over a rolling window (default 30 days, configurable). The window resets automatically — old events are purged daily. Users are placed into tiers based on their current total.

### Tier Ladder (identical structure for both tracks)

| Tier | Min Points | Label |
| --- | --- | --- |
| starter | 0 | مبتدئ |
| bronze | 50 | برونزي |
| silver | 150 | فضي |
| gold | 300 | ذهبي |
| platinum | 500 | بلاتيني |

All thresholds are stored in the database and editable by an admin at any time.

---

## 2. Database Schema

### Tables

#### `membership_config`
Key-value store for all global settings. Editable by admin; changes take effect immediately for all users.

| Key | Default | Meaning |
| --- | --- | --- |
| `reset_window_days` | 30 | Rolling window length in days |
| `max_daily_meal_events` | 1 | Max meal events counted per UTC day |
| `ad_cooldown_hours` | 6 | Min hours between counted ad views |

#### `membership_point_rules`
One row per action. Admin edits the `points` column — since totals are computed on-read by joining events with this table, the change is instant for every user.

| Column | Type | Notes |
| --- | --- | --- |
| `action_key` | text PK | e.g. `add_daily_meal` |
| `track` | enum committed/supporter | |
| `points` | int | Editable — no migration needed to change values |
| `is_active` | bool | Soft disable without deleting |

**Seeded rules:**

| action_key | Track | Points |
| --- | --- | --- |
| `add_daily_meal` | committed | 10 |
| `complete_weekly_rating` | committed | 30 |
| `consecutive_week_streak` | committed | 20 |
| `share_meal` | supporter | 5 |
| `share_post` | supporter | 5 |
| `share_stats` | supporter | 8 |
| `share_topic` | supporter | 5 |
| `create_community_post` | supporter | 3 |

#### `membership_tiers`
Composite PK `(track, tier_key)`. Admin-editable thresholds.

#### `user_point_events`
The raw event ledger. **Points are never pre-aggregated here** — there is no `points` column. Point values are always joined from `membership_point_rules` at query time.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users | |
| `track` | enum | |
| `action_key` | text FK → membership_point_rules | |
| `occurred_at` | timestamptz | Used for rolling-window filter |
| `event_date` | date | UTC date — stored explicitly so unique indexes work without function expressions |
| `reference_id` | uuid nullable | UUID references (posts, future use) |
| `reference_type` | enum nullable | `post / meal / stat / topic` |
| `meal_ref_id` | bigint nullable | Integer references — meal IDs and post IDs |

**Why `event_date` as a separate column?**
PostgreSQL requires index expressions to be `IMMUTABLE`. `date_trunc('day', timestamptz)` is `STABLE` (depends on timezone), so it cannot be used in a unique index. Storing `event_date date` explicitly avoids this and allows simple, fast unique indexes.

#### `membership_leaderboard_cache`
Stores only the **top 100 rows per track** (200 rows total, constant regardless of user count). Refreshed hourly by pg_cron.

### Indexes (Deduplication)

```sql
-- One committed point event per UTC day per user
UNIQUE (user_id, action_key, event_date)
  WHERE action_key = 'add_daily_meal'
  → index: uidx_upe_daily_meal

-- One supporter point event per (user, action, referenced item)
-- Covers: share_meal with same meal, share_post with same post, etc.
UNIQUE (user_id, action_key, meal_ref_id)
  WHERE meal_ref_id IS NOT NULL
  → index: uidx_upe_action_meal

-- Performance: rolling-window aggregation
INDEX (user_id, track, occurred_at DESC)
  → index: idx_upe_user_track_time

-- Performance: daily purge job
INDEX (occurred_at)
  → index: idx_upe_occurred_at
```

---

## 3. Point Calculation — Core Design Principle

> **Points are never stored as a number. They are always computed on-read.**

The query inside `get_user_membership` RPC:

```sql
SELECT
  SUM(r.points) FILTER (WHERE e.track = 'committed') AS committed_points,
  SUM(r.points) FILTER (WHERE e.track = 'supporter') AS supporter_points
FROM user_point_events e
JOIN membership_point_rules r
  ON r.action_key = e.action_key AND r.is_active = true
WHERE e.user_id = p_user_id
  AND e.occurred_at >= v_window_start;  -- rolling window
```

**Consequence:** If an admin changes `add_daily_meal` from 10 points to 15 points, every user's committed total immediately reflects the new value — without any batch job or data migration.

---

## 4. Backend Layer (Supabase / PostgreSQL)

The backend is responsible for:
- **Source of truth** for all point totals
- **Final deduplication** via unique indexes
- **Tier resolution** inside the RPC
- **Automated jobs** (streak, leaderboard, purge)

### RPC Functions

#### `get_user_membership(p_user_id uuid) → json`

Called by the app when loading a user's profile. Performs all computation in a single database round-trip:

1. Reads `reset_window_days` from `membership_config` **once into a local PL/pgSQL variable** — avoids a repeated JOIN on every event row.
2. Aggregates both tracks in a single pass using conditional `FILTER`.
3. Resolves the tier for each track by joining `membership_tiers`.
4. Falls back to `'starter'` if the user has zero events (new users).

Returns:
```json
{
  "committed_points": 120,
  "supporter_points": 15,
  "committed_tier_key": "bronze",
  "committed_tier_label": "برونزي",
  "committed_tier_icon": "tier_bronze",
  "supporter_tier_key": "starter",
  "supporter_tier_label": "مبتدئ",
  "supporter_tier_icon": "tier_starter",
  "window_start": "2026-05-08T00:00:00Z"
}
```

The function is `SECURITY DEFINER` — runs as the function owner, not the caller. This allows reading config and tiers tables regardless of the caller's RLS policies.

#### `record_point_event(p_track, p_action_key, p_reference_id?, p_reference_type?, p_meal_ref_id?) → void`

All point inserts go through this function — there is no direct client INSERT on `user_point_events`.

```sql
-- Inside the function:
INSERT INTO user_point_events (user_id, track, action_key, event_date, ...)
VALUES (auth.uid(), p_track, p_action_key, (now() AT TIME ZONE 'UTC')::date, ...)
ON CONFLICT DO NOTHING;
```

The `ON CONFLICT DO NOTHING` catches any unique index violation silently. The unique indexes act as a safety net — even if a client bug sends duplicate events, the database refuses duplicates.

The function silently returns (no insert, no error) if:
- The user is not authenticated
- The rule is inactive (`is_active = false`)
- A unique constraint is violated (duplicate event)

#### `delete_day_point_event(p_event_date date) → void`

Deletes the `add_daily_meal` event for a specific UTC date for the authenticated user. Called only when the last meal of a given day is deleted.

```sql
DELETE FROM user_point_events
WHERE user_id    = auth.uid()
  AND action_key = 'add_daily_meal'
  AND event_date = p_event_date;
```

### Automated pg_cron Jobs

| Job | Schedule | What it does |
| --- | --- | --- |
| `membership_streak_check` | Daily 00:01 UTC | Awards `consecutive_week_streak` if user has `add_daily_meal` on each of the 7 days ending yesterday. Scoped to users active in last 8 days (DAU-proportional cost). |
| `membership_leaderboard_refresh` | Hourly | Recomputes top-100 per track using DELETE + INSERT (not TRUNCATE, to avoid empty-table read windows during refresh). |
| `membership_event_purge` | Daily 02:00 UTC | Deletes events older than `reset_window_days + 8` days (8-day buffer for streak lookback). Without this, `user_point_events` grows indefinitely. |

### Row Level Security

| Table | Read | Write |
| --- | --- | --- |
| `membership_config` | All authenticated | Admin (service role only) |
| `membership_point_rules` | All authenticated | Admin (service role only) |
| `membership_tiers` | All authenticated | Admin (service role only) |
| `user_point_events` | Own rows only | Via `SECURITY DEFINER` RPC only — no direct client INSERT |
| `membership_leaderboard_cache` | All authenticated | Admin / pg_cron only |

---

## 5. App Layer (TypeScript)

### Architecture

```
app/(main)/_layout.tsx
  └── useMembershipStore.init()          ← called once on mount (after auth)
      └── membershipRepository.getConfig()

Screen triggers (logMeal, submitRating, handleShare)
  └── useMembershipStore.recordEvent()
      ├── optimistic update (instant UI)
      └── membershipRepository.recordEvent()
          └── Supabase RPC: record_point_event()

user-profile.tsx / CommitmentCard.tsx
  └── useMembershipStore.fetchMembership()
      └── membershipRepository.getUserMembership()
          └── Supabase RPC: get_user_membership()
```

### Repository Layer

`repositories/membership/` exports a singleton `membershipRepository` that switches between implementations based on `EXPO_PUBLIC_USE_MOCK`:

| Implementation | When used | Storage |
| --- | --- | --- |
| `MembershipRepositoryMock` | `EXPO_PUBLIC_USE_MOCK=true` (dev default) | AsyncStorage (`@taybat/membership_mock_events`) |
| `MembershipRepositorySupabase` | `EXPO_PUBLIC_USE_MOCK=false` (production) | Supabase RPCs + direct table selects |

### Store (`membership.store.ts`)

**State:**
```typescript
config: MembershipConfig | null   // loaded once, persists for session
committedPoints: number
supporterPoints: number
committedTier: MembershipTier | null
supporterTier: MembershipTier | null
windowStart: string | null
isLoading: boolean
errorMessage: string
```

**Key behaviors:**

`init()` — called from `app/(main)/_layout.tsx` on mount. Idempotent (no-op if config already loaded). Loads `membership_config`, `membership_tiers`, and `membership_point_rules` in a single `getConfig()` call. Config is cached for the entire session — not re-fetched on every screen navigation.

`fetchMembership()` — calls `get_user_membership` RPC. Auto-inits if config is missing. Replaces local point totals with server values. Called:
- On `_layout.tsx` mount (after `init`)
- When `user-profile.tsx` gains focus
- After `deleteDayEvent` (to sync totals after deletion)

`recordEvent()` — fire-and-forget with **optimistic update**:
1. Looks up the rule's point value from cached config.
2. Immediately adds to local points + resolves new tier (UI updates instantly).
3. Sends the RPC in the background.
4. On RPC failure: reverts by calling `fetchMembership()`.

**Guests:** `recordEvent` is a silent no-op when `useUserStore.user` is null.

`deleteDayEvent(date)` — calls `delete_day_point_event` RPC then refreshes membership totals. Has no optimistic update — the refresh provides accuracy.

---

## 6. Point Event Triggers — Where Each Event is Recorded

### Committed Track

#### `add_daily_meal` (+10 pts)
- **File:** `stores/userMeals.store.ts` → `logMeal()`
- **Guard (app layer):** `isFirstMealToday = todayCount === 0` — computed from current `userMeals` state BEFORE the new meal is added. `recordEvent` is only called when this is `true`.
- **Guard (DB layer):** `uidx_upe_daily_meal` unique index — rejects duplicates for the same UTC day as a safety net.
- **Why both guards?** The app guard prevents the wrong optimistic update from firing (UI would show inflated points if the DB-only approach were used). The DB guard is the authoritative safety net.

**Delete path:** `deleteMeal(id)` in `userMeals.store.ts`:
1. Captures `targetMeal.date` before modifying state.
2. Deletes the meal from the tracking table.
3. Counts remaining meals for `targetMeal.date` in the updated list.
4. If count is 0 → calls `deleteDayEvent(targetMeal.date)` → removes the day's committed event from `user_point_events`.

```
Example:
  User logs meal A at 09:00 → isFirstMealToday=true → event recorded → +10 pts
  User logs meal B at 13:00 → isFirstMealToday=false → no event → 0 pts added
  User logs meal C at 19:00 → isFirstMealToday=false → no event → 0 pts added
  User deletes meal B → 2 meals remain for the day → no deleteDayEvent → pts unchanged
  User deletes meal A → 1 meal remains → no deleteDayEvent → pts unchanged
  User deletes meal C → 0 meals remain → deleteDayEvent("2026-06-07") → -10 pts
```

#### `complete_weekly_rating` (+30 pts)
- **File:** `stores/userRating.store.ts` → `submitRating()`
- **Guard:** None needed — the existing rating flow already enforces one rating per 7-day period. The DB has no unique index for this action; duplicate prevention is business-logic-level.

#### `consecutive_week_streak` (+20 pts)
- **File:** Backend — `membership_streak_check` pg_cron job (runs nightly at 00:01 UTC)
- **Guard:** Checks if a streak event was already awarded this calendar week before inserting.
- **Scope:** Only users who have `add_daily_meal` events in the last 8 days (cost proportional to DAU).

### Supporter Track

#### `share_meal` (+5 pts)
- **File:** `app/(main)/meal-detail.tsx` → `handleShare()`
- **Trigger:** `result.action === Share.sharedAction` (iOS-aware — skips cancelled share sheets; Android always fires).
- **Dedup:** `uidx_upe_action_meal` unique on `(user_id, action_key, meal_ref_id)` — sharing the same meal twice earns points only once.
- **Note:** `meal_ref_id` stores `meal.id` (integer Meal template ID, not UserMeal ID).

#### `share_post` (+5 pts)
- **File:** `components/community/PostCard.tsx` → `handleShare()` → `finally` block
- **Trigger:** Fires after both the image share path and the text fallback path.
- **Dedup:** `uidx_upe_action_meal` unique on `(user_id, action_key, meal_ref_id)` — `meal_ref_id` stores `post.id`.
- **Note:** `finally` block means it fires even if the image capture fails and the text fallback is used.

---

## 7. Config Caching Strategy

```
App startup
  → _layout.tsx mounts
    → init()                    ← one HTTP round-trip: 3 parallel selects
      → config cached in store  ← stays in memory for the session

Every screen that needs points
  → reads from store (zero HTTP)

Every fetchMembership()
  → one RPC call (get_user_membership)
  → no config re-fetch

Admin changes a rule in the DB
  → existing cached config shows old point values in hints UI
  → actual totals from get_user_membership reflect new values immediately
     (because RPC joins live data, not cached config)
  → on next app restart, cache is refreshed
```

**Implication:** The "كيف تكسب النقاط؟" hint card in `user-profile.tsx` reads from `config.rules` (cached), so it may show stale point labels until the next app restart. The actual totals are always live.

---

## 8. Mock Implementation (Development)

`MembershipRepositoryMock` mirrors all the same rules as the Supabase implementation:

- Events are persisted in `AsyncStorage` under key `@taybat/membership_mock_events`.
- `recordEvent` applies the same dedup logic in JavaScript:
  - `add_daily_meal`: checks `eventDate === today` before inserting.
  - Share events: checks `mealRefId === incoming mealRefId` before inserting.
- `deleteDayPointEvent(date)`: filters stored events by `eventDate === date`.
- `getUserMembership`: sums events × point values in-memory, resolves tier from the same static tier list as the DB seed.

Config, tiers, and rules are hardcoded in the mock to match the DB seed values exactly.

---

## 9. Known Limitations

**Timezone edge case (minor)**
`event_date` in the DB is `(now() AT TIME ZONE 'UTC')::date`. `UserMeal.date` is the local device date (`localDateISO()`). For a user who logs a meal at 11:45 PM local time when UTC is already the next day, the meal's local date and the point event's UTC date will differ. Consequence: the deletion check (`remainingMealsForDay.filter(m => m.date === targetMeal.date)`) may not find the correct event to delete, so points are not reclaimed. This is an accepted edge case — points remain (forgiving toward the user).

**Share events on Android (minor)**
`Share.share()` on Android always resolves with `action: 'sharedAction'` regardless of whether the user completed or cancelled the share. Points are awarded even on cancelled share sheets on Android. The unique index prevents double-counting, so the user gets points once (on first open of the sheet), not repeatedly.

**Optimistic update on `share_*` actions**
The optimistic update in `recordEvent` fires immediately. If the DB unique index rejects the insert (same post/meal already shared), the local points were already incremented. `fetchMembership` is only called on error, not on silent `ON CONFLICT DO NOTHING` success. Consequence: points appear to increase locally even if they were rejected by the DB. This resolves itself on the next `fetchMembership` call (e.g. next profile view).

---

## 10. UI Surfaces

| Surface | File | What is shown |
| --- | --- | --- |
| Primary dashboard | `app/(main)/user-profile.tsx` | Both tracks: tier, points, progress bar, next tier hint, point rules from config |
| Home card | `components/home/CommitmentCard.tsx` | Both tracks side-by-side: tier label + points + progress bar. Tapping opens `user-profile`. |
| Account header | `app/(main)/account.tsx` | Committed tier badge pill (hidden for `starter`) |
| Community posts | `components/community/PostCard.tsx` | (Tier badges planned — not yet implemented) |

### Progress Bar RTL (iOS)
On iOS, RTL is handled via explicit CSS (no native coordinate flip). Progress bar fill direction is corrected by applying `transform: [{ scaleX: -1 }]` to the **outer container** (not the inner fill bar). The outer container's `overflow: hidden` clips the fill first; then `scaleX(-1)` flips the visual result so the fill grows from the trailing edge.

On Android, RTL is natively handled and no transform is needed.

---

## 11. File Map

```
repositories/membership/
  IMembershipRepository.ts      ← interface contract
  MembershipRepositoryMock.ts   ← dev implementation (AsyncStorage)
  MembershipRepositorySupabase.ts ← prod implementation (Supabase RPCs)
  index.ts                      ← singleton export, env-switch

stores/
  membership.store.ts           ← Zustand store (state + actions)

stores/userMeals.store.ts       ← logMeal + deleteMeal wired to membership
stores/userRating.store.ts      ← submitRating wired to membership

app/(main)/_layout.tsx          ← init() + fetchMembership() on mount
app/(main)/user-profile.tsx     ← primary membership dashboard
app/(main)/account.tsx          ← tier badge in header

components/home/CommitmentCard.tsx  ← compact dual-track widget
components/community/PostCard.tsx   ← share_post event recording

app/(main)/meal-detail.tsx      ← share_meal event recording

types/index.ts                  ← MembershipTrack, MembershipTierKey,
                                   PointEventActionKey, MembershipTier,
                                   UserMembership, MembershipConfig,
                                   LeaderboardEntry

shared/storage/storageKeys.ts   ← MEMBERSHIP_MOCK_EVENTS key
```

---

## 12. Adding a New Point Action (Checklist)

1. Insert a row into `membership_point_rules` (or let the admin do it via dashboard).
2. Add the `action_key` string to the `PointEventActionKey` union type in `types/index.ts`.
3. Add the same rule to `MOCK_RULES` in `MembershipRepositoryMock.ts`.
4. In the screen or store where the action happens, call:
   ```typescript
   void useMembershipStore.getState().recordEvent('supporter', 'new_action_key');
   ```
5. If dedup by item is needed (like share actions), pass `mealRefId = item.id`.
6. No database migration needed unless the action requires a new unique constraint.
