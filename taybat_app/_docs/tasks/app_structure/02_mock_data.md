# 02 — Mock Data (Prototype Layer)

**Status:** completed  
**Layer:** `data/mock/` — replaces Supabase until backend is wired

---

## Goal

Create static typed mock data for all entities. Screens and stores import from here during prototyping.
When Supabase is ready, swap the import — no screen or store changes needed.

---

## Files to Create

### `data/mock/meal_items.mock.ts`

- Export `MOCK_MEAL_ITEMS: MealItem[]`
- Source: `_docs/kb/Tayabat_Meals_Database_v2.json`
- Include all atomic food ingredients from all 5 zones
- Map JSON fields → `MealItem` type: rename `color` → `zone`, assign numeric `id` per zone prefix:
  - Green (G\*) → 1001–1099 · Yellow (Y\*) → 2001–2099 · Orange (O\*) → 3001–3099
  - Purple (P\*) → 4001–4099 · Red (R\*) → 5001–5099
- `image_url: null` for all items at prototype stage

### `data/mock/meals.mock.ts`

- Export `MOCK_MEALS: Meal[]`
- 3 sample composed meals built from `MealItem` IDs:
  - id:1 · name:"فطور" · meal_item_ids:"1001,1006,1008" · dominant_zone: green
  - id:2 · name:"غداء" · meal_item_ids:"3002,1003" · dominant_zone: orange
  - id:3 · name:"عشاء" · meal_item_ids:"2025,2030" · dominant_zone: yellow

### `data/mock/user.mock.ts`

- Export `MOCK_USER: User`
  - id: 1
  - subscriber_id: 100
  - name: "عبد الرازق"
  - plan_start_date: "2026-04-01"
  - language: "ar"
  - theme: "light"

### `data/mock/meal_item_preferences.mock.ts`

- Export `MOCK_MEAL_ITEM_PREFERENCES: MealItemPreference[]`
- Mark 5–8 food ingredients as `is_favorite: true`, all as `is_active: true`
- Spread favorites across different zones

### `data/mock/user_meals.mock.ts`

- Export `MOCK_USER_MEALS: UserMeal[]`
- 7 days of data (today − 6 days), max 3 records per date
- Each record references a `meal_id` from `MOCK_MEALS` and snapshots `meal_item_ids`
- Vary `zone_summary` across days to make streak/stats interesting

### `data/mock/weekly_ratings.mock.ts`

- Export `MOCK_WEEKLY_RATINGS: WeeklyRating[]`
- 2 entries (week 1 and week 2 of the plan)
- Show gradual improvement in boolean signals week-over-week

---

## Helper

Create `data/mock/index.ts` — re-exports all mock collections.

---

## Rule

All mock data is **read-only** (`as const` or `Object.freeze`).
No logic in mock files — pure data only.
