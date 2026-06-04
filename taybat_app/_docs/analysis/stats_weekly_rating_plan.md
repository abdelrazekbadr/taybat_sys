# Weekly Rating Refactor Plan

**Date:** 2026-06-03
**Status:** Pending Review

---

## Summary of Changes Requested

1. **Remove** "الالتزام بالنظام" (`adherence_score`) from the user-facing rating form — the system calculates commitment automatically via the weekly progress bar.
2. **Replace** hardcoded `IMPROVEMENT_OPTIONS` with dynamic data from the `health_goals` Supabase table.
3. **Save** weekly ratings to Supabase (repository layer already exists — needs wiring + schema fix).

---

## Current State

### Supabase — `weekly_ratings` table (already exists)

```
id, user_id, period_start, submitted_at,
health_score,        -- 1–5
adherence_score,     -- 1–5 (will become system-calculated, not user-entered)
pain_reduced,        -- bool (hardcoded improvements)
energy_improved,     -- bool
sleep_improved,      -- bool
digestion_improved,  -- bool
mood_improved,       -- bool
mental_health_improved -- bool
```

### Supabase — `health_goals` table (already exists)

| id | code | name (AR)                      | name_en             | image          |
| -- | ---- | ------------------------------ | ------------------- | -------------- |
| 1  | HG01 | تقليل الالتهاب    | Reduce inflammation | goal_pain      |
| 2  | HG02 | تحسين الهضم          | Improve digestion   | goal_digestive |
| 3  | HG03 | فقدان الوزن          | Weight loss         | goal_weight    |
| 4  | HG04 | تحسين الطاقة        | Improve energy      | goal_power     |
| 5  | HG05 | تحسين النوم          | Improve sleep       | goal_sleep     |
| 6  | HG06 | التخلص من التوتر | Reduce stress       | goal_worry     |

### Current Data Flow

```
StatsScreen (hardcoded options)
  → form.handleSubmit
  → useWeeklyRatingStore.submitRating
  → ratingRepository.submitRating (RatingRepositorySupabase)
  → weekly_ratings table
```

**Problem:** The repository layer already writes to Supabase correctly. The issue is:

- `adherence_score` is user-entered but should be system-computed
- `IMPROVEMENT_OPTIONS` are hardcoded, not from `health_goals`
- The boolean improvement columns don't map cleanly to `health_goals` IDs

---

## Proposed Schema Change

### Add `improvement_goal_ids` column to `weekly_ratings`

```sql
ALTER TABLE weekly_ratings
  ADD COLUMN improvement_goal_ids TEXT DEFAULT '';
-- Stores CSV of health_goal IDs: e.g. "1,4,5"
-- Consistent with app CSV pattern (meal_item_codes, health_goals_codes, etc.)
```

The existing boolean columns (pain_reduced, energy_improved, etc.) are **kept** for backward compatibility and fast aggregation queries.

On insert, we populate both:

- `improvement_goal_codes` = "1,4,5" 
- Boolean columns = derived from the IDs mapping (kept for existing stats queries)

### `adherence_score` — system-computed

Do NOT ask the user. Compute it automatically on submission from the current week's meal completion:

```
adherence_score = round(done_days_this_cycle / 7 * 4) + 1  →  clamp to [1, 5]
```

The weekly progress bar already has this data. Pass `weeklyDoneCount` from the home screen context or re-compute it in the store.

For Phase 1, simply **omit** `adherence_score` from the form and save `null` to the DB (column is nullable). Future iteration can auto-compute it.

---

## Implementation Phases

### Phase 1 — Database (Supabase)

- [ ] `ALTER TABLE weekly_ratings ADD COLUMN improvement_goal_ids TEXT DEFAULT ''`
- [ ] Verify RLS policy covers new column (inherits SELECT/UPDATE from existing policy)

### Phase 2 — Types & Interfaces

**`types/index.ts`** — update `WeeklyRating`:

```typescript
export interface WeeklyRating {
  id: number;
  user_id: string;
  period_start: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore | null;   // nullable — system-computed later
  improvement_goal_codes: string;          // CSV of health_goal IDs
  submitted_at: string;
  // legacy boolean columns (kept for queries, not used in UI)
  pain_reduced: boolean;
  energy_improved: boolean;
  sleep_improved: boolean;
  digestion_improved: boolean;
  mood_improved: boolean;
  mental_health_improved: boolean;
}
```

**`IRatingRepository.ts`** — update `CreateRatingPayload`:

```typescript
export interface CreateRatingPayload {
  userId: string;
  period_start: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore | null;
  improvement_goal_ids: string;          // CSV of health_goal IDs
}
```

### Phase 3 — Repository Layer

**`RatingRepositorySupabase.ts`** — update `submitRating`:

- Save `improvement_goal_ids` to DB
- Derive and save boolean columns from IDs (e.g. `goal_pain (id=1)` → `pain_reduced`)
- Save `adherence_score: null` for now

**`RatingRepositoryMock.ts`** — update `submitRating` to match new payload shape.

### Phase 4 — Store

**`weeklyRating.store.ts`** — update `SubmitWeeklyRatingPayload`:

- Replace `pain_reduced, energy_improved, ...` with `improvement_goal_ids: string`
- `adherence_score` removed from user payload, passed as `null`

### Phase 5 — Stats Screen UI

1. **Remove** the `adherence_score` section (Controller + OptionSelector block)
2. **Remove** `IMPROVEMENT_OPTIONS` hardcoded array
3. **Load goals** via `useHealthGoalsStore` (same pattern as `complete-profile.tsx`)
4. **Build `OptionItem[]`** dynamically from `health_goals`:
   ```typescript
   const improvementOptions: OptionItem<number>[] = goals.map(g => ({
     key: g.id,
     label: isEnglish && g.name_en ? g.name_en : g.name,
     icon: { kind: 'image', name: g.image ?? 'dish', tint: true },
   }));
   ```
5. **Form values** change: `improvements: ImprovementKey[]` → `improvements: number[]` (goal IDs)
6. **Update Zod schema**: `improvements: z.array(z.number())`
7. **On submit**: convert `improvements` array to CSV string for `improvement_goal_ids`

### Phase 6 — Chart Update (WeeklyMiniChart)

- Remove `adherence` line from the weekly chart (no longer meaningful as user-entered score)
- Keep `health_score` line only
- Or: show adherence computed from meal data (future enhancement)

---

## Data Flow After Refactor

```
StatsScreen
  ├── useHealthGoalsStore.goals  →  dynamic improvement options
  ├── form.improvements: number[]  →  selected health_goal IDs
  └── form.handleSubmit
        → submitRating({ health_score, improvement_goal_ids: "1,4,5", adherence_score: null })
        → weeklyRating.store.submitRating
        → RatingRepositorySupabase.submitRating
        → weekly_ratings (with improvement_goal_ids + derived booleans)
```

---

## Icon Mapping (health_goals.image → ICON_SOURCES key)

All 6 goal images are already registered in `utils/iconSources.ts`:

```
goal_pain, goal_digestive, goal_weight, goal_power, goal_sleep, goal_worry
```

No additional icon work needed.

---

## Files to Change

| File                                                 | Change                                               |
| ---------------------------------------------------- | ---------------------------------------------------- |
| Supabase DB                                          | ADD COLUMN improvement_goal_ids TEXT                 |
| `types/index.ts`                                   | Update `WeeklyRating` shape                        |
| `repositories/ratings/IRatingRepository.ts`        | Update `CreateRatingPayload`                       |
| `repositories/ratings/RatingRepositorySupabase.ts` | Save new column + derive booleans                    |
| `repositories/ratings/RatingRepositoryMock.ts`     | Match new payload                                    |
| `stores/weeklyRating.store.ts`                     | Update payload type                                  |
| `app/(main)/stats.tsx`                             | Remove adherence_score section, dynamic improvements |

---

## Risks & Notes

- Boolean columns in `weekly_ratings` are kept to avoid breaking existing stats queries in `user-profile.tsx` and `statsUtils.ts`
- `adherence_score` column remains in DB (nullable) — can be auto-populated in a future iteration using meal data
- `useHealthGoalsStore.fetchGoals()` is already called in `complete-profile.tsx`; the stats screen will follow the same pattern (call on mount, check `goals.length === 0` guard)
- The `WeeklyMiniChart` chart legend "الالتزام" line should be removed since `adherence_score` is no longer user-entered
