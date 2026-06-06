# Membership Feature — Technical Plan

**Goal:** Replace the badge/achievement system with a dynamic, community-driven membership model that rewards commitment and advocacy, drives viral growth, and keeps the community healthy — without annoying users.

---

## 1. Concepts Overview

### Two Membership Tracks

| Track | Arabic Name | What Earns Points | Reset Window |
| --- | --- | --- | --- |
| **Committed Member** | عضو ملتزم | Daily meal logging + weekly ratings | 30 days (configurable) |
| **Supporter Member** | عضو داعم | Sharing meals / posts / stats / topics + optional ad views | 30 days (configurable) |

Each user has **two independent point totals** — one per track. A user can be high on both, one, or neither.

### Tier Ladder (per track)

| Tier | Points Range | Display |
| --- | --- | --- |
| Starter | 0–49 | No badge |
| Bronze | 50–149 | Bronze icon |
| Silver | 150–299 | Silver icon |
| Gold | 300–499 | Gold icon |
| Platinum | 500+ | Platinum icon |

Tier thresholds are stored in the database and dynamically configurable.

---

## 2. Core Design Principle: Dynamic Rules

**All point values, tier thresholds, and the reset window must be stored in Supabase — never hardcoded.**

When an admin edits a rule, point totals recalculate automatically because totals are derived on-read from the raw event log joined to current rule values — not stored as a pre-computed number.

This means:

- Changing "daily meal = 5 pts" to "daily meal = 8 pts" instantly affects every user's rolling 30-day total.
- No batch job needed to recompute.

---

## 3. Database Schema

### 3.1 `membership_config`

Stores global settings. Key-value pairs editable by admin.

| Column | Type | Example |
| --- | --- | --- |
| `key` | text PK | `'reset_window_days'` |
| `value` | text | `'30'` |
| `description` | text | `'Rolling window for point calculation'` |
| `updated_at` | timestamptz | — |

Initial rows:

```
reset_window_days      = 30
max_daily_meal_events  = 1     (only first meal per day counts for committed track)
ad_cooldown_hours      = 6     (minimum hours between counted ad views)
```

### 3.2 `membership_point_rules`

One row per action. Admin edits `points` here to instantly affect all users.
`action_key` is the natural primary key — no separate uuid needed.

| Column | Type | Notes |
| --- | --- | --- |
| `action_key` | text PK | e.g. `add_daily_meal`, `share_post` |
| `track` | enum `committed \| supporter` | |
| `points` | int | Points awarded per event |
| `description_ar` | text | Admin label |
| `is_active` | bool | Soft disable without deleting |
| `updated_at` | timestamptz | |

Initial rows:

**Committed track:**

| action_key | points |
| --- | --- |
| `add_daily_meal` | 10 |
| `complete_weekly_rating` | 30 |
| `consecutive_week_streak` | 20 (bonus per completed consecutive week) |

**Supporter track:**

| action_key | points |
| --- | --- |
| `share_meal` | 5 |
| `share_post` | 5 |
| `share_stats` | 8 |
| `share_topic` | 5 |
| `watch_optional_ad` | 15 |
| `create_community_post` | 3 |

### 3.3 `membership_tiers`

Small lookup table (10 rows max). Composite PK `(track, tier_key)` — no separate uuid needed.

| Column | Type | Notes |
| --- | --- | --- |
| `track` | enum | PK part 1 |
| `tier_key` | text | PK part 2 — `starter/bronze/silver/gold/platinum` |
| `min_points` | int | |
| `label_ar` | text | |
| `icon_key` | text | Maps to local asset |
| `sort_order` | int | |

### 3.4 `user_point_events`

The raw ledger. Every earning action writes one row here. Points are never pre-aggregated.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `track` | enum `committed \| supporter` | |
| `action_key` | text | References `membership_point_rules.action_key` |
| `occurred_at` | timestamptz default now() | Used for rolling-window filter |
| `reference_id` | uuid nullable | Post ID, meal ID, etc. |
| `reference_type` | enum `post \| meal \| stat \| topic` nullable | Enum saves ~20 bytes/row vs text |

**No `points` column here** — the current point value is always read from `membership_point_rules` at query time.

**DB-level unique constraints** — prevent duplicates from concurrent writes, not just checked in the app layer:

- Partial unique index on `(user_id, action_key, date_trunc('day', occurred_at))` where `action_key = 'add_daily_meal'` — one meal event per calendar day.
- Partial unique index on `(user_id, action_key, reference_id)` where `action_key IN ('share_meal','share_post','share_stats','share_topic')` — sharing the same item twice doesn't double-count.
- Ad cooldown enforced server-side inside the `record_point_event` RPC function (checks last event timestamp before inserting — cannot be bypassed from client).

Indexes:

- `(user_id, track, occurred_at DESC)` — primary index covering rolling-window aggregation. `DESC` matches the `occurred_at >= NOW() - interval` filter scan direction.
- `(occurred_at)` — used exclusively by the daily purge job (§8.3).

### 3.5 `membership_leaderboard_cache`

Stores **only top 100 per track** (200 rows total, fixed size regardless of user count). Individual profile reads do NOT use this table — they call the RPC function directly (§4).

| Column | Type | Notes |
| --- | --- | --- |
| `track` | enum | PK part 1 |
| `rank` | int | PK part 2 — 1 to 100 |
| `user_id` | uuid | |
| `points` | int | |
| `tier_key` | text | |
| `refreshed_at` | timestamptz | When this snapshot was taken |

Primary key: `(track, rank)`. Refreshed every hour by pg_cron with bounded, constant cost.

---

## 4. Point Calculation Logic

### RPC Function: `get_user_membership(user_id uuid)`

Individual profile reads go through a single Postgres RPC function, **not** raw queries from the app. This avoids multiple round-trips and ensures config is read exactly once per call.

The function does in one server-side call:

1. Reads `reset_window_days` from `membership_config` once into a local variable (no repeated JOIN per row).
2. Aggregates both tracks in a single pass over `user_point_events` using conditional aggregation.
3. Resolves the current tier for each track by joining `membership_tiers`.
4. Returns a single JSON object.

```sql
-- Conceptual structure (not final SQL):
CREATE OR REPLACE FUNCTION get_user_membership(p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_window_days int;
  v_window_start timestamptz;
BEGIN
  SELECT value::int INTO v_window_days
  FROM membership_config WHERE key = 'reset_window_days';

  v_window_start := NOW() - (v_window_days || ' days')::interval;

  RETURN (
    SELECT json_build_object(
      'committed_points', SUM(r.points) FILTER (WHERE e.track = 'committed'),
      'supporter_points', SUM(r.points) FILTER (WHERE e.track = 'supporter'),
      'window_start', v_window_start
    )
    FROM user_point_events e
    JOIN membership_point_rules r
      ON r.action_key = e.action_key AND r.is_active = true
    WHERE e.user_id = p_user_id
      AND e.occurred_at >= v_window_start
  );
END;
$$;
```

Admin changes a rule → next RPC call returns updated totals immediately. No cache invalidation needed.

### RPC Function: `record_point_event(...)`

All inserts into `user_point_events` go through a `SECURITY DEFINER` RPC — never direct client INSERT. The function enforces all deduplication and cooldown rules server-side before inserting:

- `add_daily_meal`: checks no event exists for today (falls back to DB unique index as safety net).
- Share events: checks no event exists for `(user_id, action_key, reference_id)` in the current window.
- `watch_optional_ad`: reads `ad_cooldown_hours` from config and compares to last ad event timestamp.

### Streak Bonus (Committed Track)

A **pg_cron job** runs nightly (not an Edge Function — runs inside Postgres, cheaper):

1. Filters to users who have `add_daily_meal` events in the last 8 days (recently-active scope only — cost scales with DAU, not total users).
2. For each: checks if `add_daily_meal` exists for each of the 7 consecutive days ending yesterday.
3. Awards `consecutive_week_streak` if condition met and not already awarded this calendar week (idempotent).

---

## 5. App Architecture — Following Existing Patterns

### 5.1 New Repository: `repositories/membership/`

Files:

- `IMembershipRepository.ts` — interface with methods:
  - `getUserMembership(userId)` → `UserMembership` (calls `get_user_membership` RPC)
  - `recordEvent(userId, track, actionKey, referenceId?, referenceType?)` → void (calls `record_point_event` RPC)
  - `getLeaderboard(track, limit)` → `LeaderboardEntry[]` (reads from cache table)
  - `getConfig()` → `MembershipConfig` (fetched once at app init — `membership_config` + `membership_tiers`)
- `MembershipRepositoryMock.ts`
- `MembershipRepositorySupabase.ts`
- `index.ts` — exports singleton

`getPointRules()` and `getMembershipTiers()` are **not** called per profile view. They are loaded once at app startup via `getConfig()` and stored in the membership store. The store holds them for the session lifetime.

### 5.2 New Store: `stores/membership.store.ts`

State:

```
committedPoints: number
supporterPoints: number
committedTier: MembershipTier | null
supporterTier: MembershipTier | null
tiers: MembershipTier[]          // loaded once at init
resetWindowDays: number          // loaded once at init
isLoading: boolean
errorMessage: string
```

Actions:

- `init()` — fetches config + tiers once at app startup; called from root layout after auth
- `fetchMembership(userId)` — calls `get_user_membership` RPC, updates points + tier state
- `recordEvent(track, actionKey, referenceId?)` — calls `record_point_event` RPC, optimistically updates local point total
- `reset()` — standard reset action

Store selectors: individual fields, never object selectors (per CLAUDE.md rule).

### 5.3 Guest Mode

When `AuthStatus = 'guest'`, the membership store stays in reset state. Membership UI surfaces (profile dashboard, tier badges) are hidden or replaced with a soft prompt to sign up. The `recordEvent` action is a no-op for guests — no points or events recorded.

### 5.4 Integration Points — Where Events Get Recorded

| User Action | Track | Action Key | Where in Code |
| --- | --- | --- | --- |
| Add a meal | committed | `add_daily_meal` | `userMeals.store.ts` after `addUserMeal()` succeeds |
| Submit weekly rating | committed | `complete_weekly_rating` | `userRating.store.ts` after `submitRating()` succeeds |
| Share a meal (external) | supporter | `share_meal` | Share sheet callback in `meal-detail.tsx` |
| Share a post | supporter | `share_post` | Post share action in `community.store.ts` |
| Share stats | supporter | `share_stats` | Stats share action in `stats.tsx` |
| Share a topic | supporter | `share_topic` | Topic share action in `topics.tsx` |
| Create community post | supporter | `create_community_post` | `community.store.ts` after post creation |
| Watch optional ad | supporter | `watch_optional_ad` | Ad completion callback in `AdSupportBanner` |

Recording is fire-and-forget (non-blocking) — the UI action is never gated on the point event succeeding.

---

## 6. Where to Display Membership in the App

### 6.1 Primary Location — `user-profile.tsx`

Full membership dashboard:

- Two cards side by side (committed / supporter)
- Points total + tier badge + tier name
- Progress bar to next tier
- "آخر 30 يوم" label explaining the rolling window
- Supporter card: optional ad button with remaining cooldown countdown

### 6.2 Secondary Locations

| Location | Display Format | Rationale |
| --- | --- | --- |
| **Community posts** (next to username) | Tiny tier icon | Social proof — high-tier members get visibility, inspires newcomers |
| **Account screen header** | Tier badge + label "عضو ذهبي" | Always-visible identity reinforcement |
| **Home screen** (index) | Compact streak card "أضفت وجبة X يوم متتالي" + pts | Daily habit reinforcement, drives return visits |
| **Stats screen** | "نقاطك هذا الشهر" widget with breakdown | Natural fit alongside health progress |
| **Topics / discussion** | Tier icon next to commenter name | Same social proof as community feed |
| **Notifications** | Push on tier-up: "حققت مستوى الفضة!" | Milestone alerts create sharing moments |
| **Share card (viral)** | Generated card with tier badge + "انضم لتطبيق الطيبات" | Every external share becomes an organic acquisition event |

### 6.3 Where NOT to Display

- Login / signup screens — don't add friction for new users.
- Onboarding — reveal after first meal is logged (surprise + delight moment).
- Guest-mode views — show sign-up prompt instead.

---

## 7. Optional Ad Support (Supporter Track)

### Philosophy

The ad is a **voluntary act of support**, not an interruption. UI framing:

- "ادعم الطيبات بمشاهدة إعلان" (Support Al-Taybat by watching an ad)
- User receives `watch_optional_ad` points as a thank-you
- Cooldown configured via `membership_config.ad_cooldown_hours` (default: 6h)

### Implementation Notes

- Use any standard React Native rewarded ad SDK (e.g. Google AdMob rewarded)
- Ad button appears only on the Supporter track card in `user-profile.tsx`
- After successful view: record event + brief celebration animation
- Never show ad outside explicit user action — no auto-play, no interstitial

---

## 8. Supabase Backend Automation

### 8.1 Nightly Streak Check (pg_cron — runs inside Postgres)

- Schedule: daily at 00:01 UTC
- **Scope: recently-active users only** — filter to users with at least one `add_daily_meal` event in the last 8 days. Cost scales with daily active users, not total users.
- For each qualifying user: check `add_daily_meal` exists for each of the 7 consecutive days ending yesterday.
- Award `consecutive_week_streak` if met and not already awarded this calendar week (idempotent).

### 8.2 Leaderboard Cache Refresh (pg_cron)

- Schedule: every 1 hour
- **Scope: top 100 per track only** (200 total rows — fixed cost regardless of user growth)
- Uses `DELETE … WHERE track = :track` + INSERT (not TRUNCATE) to avoid an empty-table window that would break concurrent leaderboard reads.
- Cost stays constant as the app scales.

### 8.3 Event Purge Job (pg_cron) — Critical for Storage

Without this, `user_point_events` grows indefinitely. Events older than the window are never queried.

- Schedule: daily at 02:00 UTC
- Deletes events older than `reset_window_days + 8` days (8-day buffer covers the streak check's 8-day active-user lookback)
- Uses the `(occurred_at)` index for efficient range deletion

```sql
-- Conceptual structure:
DELETE FROM user_point_events
WHERE occurred_at < NOW() - (
  (SELECT value::int FROM membership_config WHERE key = 'reset_window_days') + 8
  || ' days'
)::interval;
```

**Storage at steady state:** 1 meal/day + 1 weekly rating = ~35 events/month per user. At 10,000 users the table stabilizes at ~350,000 rows — instead of growing year over year.

### 8.4 Row Level Security (RLS)

- `user_point_events`: no direct client INSERT or SELECT allowed — all access via `SECURITY DEFINER` RPC functions only.
- `membership_config` / `membership_point_rules` / `membership_tiers`: SELECT for all authenticated users; no INSERT/UPDATE/DELETE from client.
- Admin mutations go through service role key inside Edge Functions only.

---

## 9. Viral Growth Strategy

### 9.1 Shareable Achievement Cards

When a user reaches a new tier, the app generates a shareable image card (`react-native-view-shot` or similar):

- Tier badge + Arabic tier name + app logo
- "انضم لتطبيق الطيبات واحصل على نقاطك"
- Deep link / App Store link embedded

Every tier-up becomes an organic acquisition event.

### 9.2 Community Leaderboard

Public leaderboard (opt-in, privacy toggle) showing top Committed and Supporter members for the current 30-day window. Creates friendly competition and motivates lurkers to participate.

### 9.3 Referral Integration (Future Phase)

A future `invite_friend` action key can be added to `membership_point_rules` without any schema change. Award points when a referral completes signup + first meal.

### 9.4 Social Proof in Post Feed

High-tier badges next to usernames signal authority. New users trust and follow advice from Platinum/Gold members, driving content quality and engagement without moderation overhead.

---

## 10. Implementation Phases

| Phase | Scope | Outcome |
| --- | --- | --- |
| **1 — DB Foundation** | Create all tables, seed config + default rules, set up RLS, add indexes, create pg_cron purge + streak + leaderboard jobs | Schema ready; backend automated |
| **2 — RPC Functions** | `get_user_membership`, `record_point_event` with deduplication logic | Server-side logic complete |
| **3 — Repository + Store** | `IMembershipRepository`, Mock + Supabase impls, `membership.store.ts` with `init()` | Feature works in mock mode end-to-end |
| **4 — Event Recording** | Wire `recordEvent()` into existing stores/screens at all integration points | Points accumulate from real user actions |
| **5 — User Profile Display** | Full membership dashboard in `user-profile.tsx` | Primary display surface live |
| **6 — Secondary Surfaces** | Community badges, home widget, account header, stats widget, notification triggers | Membership visible across the app |
| **7 — Leaderboard** | Leaderboard screen reading from cache table | Community competition live |
| **8 — Viral Share Cards** | Tier-up celebration + shareable card generation + deep links | Organic growth loop |
| **9 — Optional Ads** | AdMob integration, Supporter ad card in profile, cooldown enforcement | Monetization layer live |

---

## 11. Types Reference (new entities)

```typescript
interface UserMembership {
  userId: string
  committedPoints: number
  supporterPoints: number
  committedTier: MembershipTier
  supporterTier: MembershipTier
  windowStart: Date
}

interface MembershipTier {
  track: 'committed' | 'supporter'
  tierKey: 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum'
  labelAr: string
  minPoints: number
  iconKey: string
  sortOrder: number
}

interface PointRule {
  actionKey: string
  track: 'committed' | 'supporter'
  points: number
  isActive: boolean
}

interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string
  points: number
  tierKey: string
}

interface MembershipConfig {
  resetWindowDays: number
  maxDailyMealEvents: number
  adCooldownHours: number
  tiers: MembershipTier[]
}
```

---

Plan created: 2026-06-06 | Last revised: 2026-06-06
