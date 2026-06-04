# Stats Screen — Calculations Reference

**File:** `app/(main)/stats.tsx`  
**Utilities:** `utils/statsUtils.ts`  
**Data sources:** `stores/userRating.store.ts` + `stores/userMeals.store.ts`

---

## Period Filter

Four fixed options (days back from today inclusive):

| Label        | Days |
|--------------|------|
| آخر اسبوع   | 7    |
| آخر شهر     | 30   |
| آخر شهرين   | 60   |
| آخر ٣ شهور  | 90   |

---

## 1. Commitment Percentage (`toCommitmentData`)

**Source table:** `user_meals` — one row per meal logged (up to 3/day).

**Algorithm:**

```
period = today - (days - 1)  →  today   (inclusive, e.g. 7 days = last 7 calendar dates)

For each date in the period:
  hasLog = any user_meal row with that date exists

activeDays = count(hasLog = true)
pct        = round(activeDays / days × 100)
```

**Validation example (7-day period, today = 2026-06-03):**

| Date       | Meals logged | hasLog |
|------------|-------------|--------|
| 2026-05-28 | 2           | ✓      |
| 2026-05-29 | 0           | ✗      |
| 2026-05-30 | 1           | ✓      |
| 2026-05-31 | 3           | ✓      |
| 2026-06-01 | 0           | ✗      |
| 2026-06-02 | 1           | ✓      |
| 2026-06-03 | 0           | ✗      |

→ `activeDays = 4`, `pct = round(4/7 × 100) = 57%`

---

## 2. Commitment Calendar (`CommitmentCalendar`)

Visual grid: 7 columns (Saturday → Friday), rows = weeks.

**Colors:**
- 🟢 Green `#34D399` — day has at least 1 meal logged (ملتزم)
- 🔴 Rose  `#fb7185` — no meal logged that day (غير ملتزم)
- Empty cell — day is outside the period (padding to align to Saturday-start)

**First-week padding formula:**

Arabic weeks start on Saturday. `getDay()` in JS: `0=Sun … 6=Sat`.

```
offset = (firstDate.getDay() + 1) % 7
```

| First day  | getDay() | offset | Padding cells before first date |
|------------|----------|--------|---------------------------------|
| Saturday   | 6        | 0      | None — starts in first column   |
| Sunday     | 0        | 1      | 1 empty cell (Saturday column)  |
| Monday     | 1        | 2      | 2 empty cells                   |
| Friday     | 5        | 6      | 6 empty cells                   |

**Validation example — 7-day period starting 2026-05-28 (Thursday, getDay()=4):**

```
offset = (4 + 1) % 7 = 5
```

Visual grid (RTL — Saturday on the right):

```
ج   خ   أ   ث   إ   ح   س
                ×   ×   ×   ×   ×   [28/ث]  [29/خ]
[30/ج]  [31/س]  [01/ح]  [02/إ]  [03/ث]  —   —
```

- 5 empty padding cells (Sat, Sun, Mon, Tue, Wed columns) before Thursday 28
- Trailing empty cells fill the last row to complete 7 columns

---

## 3. Health Improvement Timeline (`toHealthTimelineInDays`)

**Source table:** `users_ratings` — one row per weekly self-assessment.

**Algorithm:**

```
cutoff    = today - (days - 1)
filtered  = ratings where submitted_at.date >= cutoff
sorted    = filtered by submitted_at ascending
```

Displayed as a line chart (Y = health_score 1–5, X = submission order).

**Validation example (30-day filter, today = 2026-06-03):**

| submitted_at | health_score | Included? |
|--------------|-------------|-----------|
| 2026-04-20   | 3           | ✗ (before cutoff 2026-05-05) |
| 2026-05-10   | 3           | ✓         |
| 2026-05-17   | 4           | ✓         |
| 2026-05-24   | 4           | ✓         |
| 2026-06-01   | 5           | ✓         |

→ 4 points plotted, trend: 3 → 4 → 4 → 5 (improving)

---

## Data Flow

```
user_meals (Supabase / mock)
    └─ useUserMealsStore.userMeals[]
           └─ toCommitmentData(userMeals, days)
                  ├─ CommitmentSummaryCard  (pct, activeDays, totalDays)
                  └─ CommitmentCalendar     (dailyStatus[])

users_ratings (Supabase / mock)
    └─ useUserRatingStore.ratings[]
           └─ toHealthTimelineInDays(ratings, days)
                  └─ HealthTimelineChart    (filtered UserRating[])
```

---

## Supabase Tables Used

| Table           | Key columns                              | Used for              |
|-----------------|------------------------------------------|-----------------------|
| `user_meals`    | `user_id`, `date`, `zone_summary`        | Commitment calendar   |
| `users_ratings` | `user_id`, `submitted_at`, `health_score`| Health timeline chart |
