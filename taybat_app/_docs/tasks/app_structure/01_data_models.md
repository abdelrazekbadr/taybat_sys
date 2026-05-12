# 01 — Data Models & TypeScript Types

**Status:** completed
**Layer:** `types/` (shared across all layers)

---

## Goal

Define all TypeScript types used across the app. No implementation — types only.

---

## Entity Relationship

```text
MealItem (atomic food ingredient)
    ↓ many-to-many
Meal (composed dish — combination of MealItems)
    ↓ one-to-many
UserMeal (daily log — user ate this Meal at this time)
```

---

## Types

### ZoneColor

```ts
type ZoneColor = 1 | 2 | 3 | 4 | 5
// 1=green  2=yellow  3=orange  4=purple  5=red
```

> Integers in both TypeScript and DB — consistent throughout all layers.
> UI display mapping (color, emoji, label) lives in `utils/zoneUtils.ts`.

---

### MealItem (atomic food ingredient — from meals database)

```ts
id: number        // zone-prefixed: Green 1001-1099, Yellow 2001-2099, Orange 3001-3099, Purple 4001-4099, Red 5001-5099
name: string      // Arabic name
category: number  // integer category ID (FK to category lookup — string at prototype stage)
zone: ZoneColor
rating: number    // 1–5
frequency: string // human-readable frequency label
notes: string
image_url: string // empty string at prototype stage
```

> Read-only reference data across 5 zones.

---

### Meal (a composed dish made of multiple MealItems)

```ts
id: number
name: string            // فطور | غداء | عشاء or custom label
meal_item_ids: string   // comma-separated MealItem IDs: "1001,1006,2025"
dominant_zone: ZoneColor
image_url: string
```

> dominant_zone = worst (highest integer) zone among meal_item_ids — computed on save.

---

### User

```ts
id: number
subscriber_id: number       // sequence starting from 100
name: string
avatar_url: string | null
plan_start_date: string     // ISO date
language: 'ar' | 'en'
theme: 'light' | 'dark' | 'system'
```

---

### MealItemPreference

```ts
user_id: number
meal_item_id: number  // FK to MealItem.id
is_active: boolean    // user includes this ingredient in their plan
is_favorite: boolean
```

---

### UserMeal (daily transaction — one record per logged meal)

```ts
id: number
user_id: number
meal_id: number         // FK to Meal.id
meal_item_ids: string   // snapshot of Meal.meal_item_ids at log time
datetime: string        // ISO datetime
date: string            // ISO date — for daily grouping and max-3 validation
zone_summary: ZoneColor // = Meal.dominant_zone (denormalized for fast stats)
```

> `meal_item_ids` is a snapshot — protects stats integrity if the Meal is edited later.
> Constraint: max 3 `UserMeal` records per `user_id` + `date`.

---

### WeeklyRating (health measurement every 7 days)

```ts
id: number
user_id: number
period_start: string  // ISO date — start of 7-day period
submitted_at: string  // ISO datetime

health_score: 1 | 2 | 3 | 4 | 5
adherence_score: 1 | 2 | 3 | 4 | 5

pain_reduced: boolean
energy_improved: boolean
sleep_improved: boolean
digestion_improved: boolean
mood_improved: boolean
```

> 5 boolean signals + 2 numeric scores. No free-text — keeps analysis clean and queryable.

---

## File Output

`types/index.ts` — exports all types above. **Status: done.**

---

## Constraints

- No `any`
- All union types as literals (no TypeScript `enum` keyword)
- Dates always ISO strings (never `Date` objects in store/API layers)
