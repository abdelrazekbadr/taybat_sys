# 03 — Zustand Store Structure

**Status:** completed  
**Layer:** `stores/`

---

## Goal

Define what stores are needed, their state shape, and actions.
No implementation — shape and responsibility only.

---

## Stores

### `useUserStore`

**File:** `stores/user.store.ts`

```
state:
  user: User | null
  isLoading: boolean
  errorMessage: string

actions:
  initializeUser()     // load from mock → later from Supabase session
  resetUser()
```

---

### `useMealItemsStore`

**File:** `stores/mealItems.store.ts`

```
state:
  mealItems: MealItem[]     // atomic food ingredients (read-only reference data)
  isLoading: boolean
  errorMessage: string

actions:
  initializeMealItems()              // load once — never mutate
  getMealItemsByZone(zone)           // selector — filter by zone
  getMealItemById(id)                // selector
```

> Reference data — load once on app start, read-only.

---

### `useMealsStore`

**File:** `stores/meals.store.ts`

```
state:
  meals: Meal[]             // composed dishes
  isLoading: boolean
  errorMessage: string

actions:
  initializeMeals()                  // load from mock/API
  getMealById(id)                    // selector
  createMeal(name, mealItemIds)      // compose a new meal, compute dominant_zone
  deleteMeal(id)
```

> `dominant_zone` is computed inside `createMeal` from the worst zone among `mealItemIds`.

---

### `useUserMealsStore`

**File:** `stores/userMeals.store.ts`

```
state:
  userMeals: UserMeal[]
  todayMeals: UserMeal[]    // derived — filtered to today's date
  isLoading: boolean
  errorMessage: string

actions:
  initializeUserMeals()
  logMeal(mealId)           // creates UserMeal — snapshots meal_item_ids, enforces max 3
  deleteMeal(id)
  getMealsByDate(date)      // selector
```

> Max-3-per-day validation lives inside `logMeal` — returns `false` if limit reached.

---

### `useWeeklyRatingStore`

**File:** `stores/weeklyRating.store.ts`

```
state:
  ratings: WeeklyRating[]
  pendingRating: boolean        // true if 7 days passed since last submission
  isLoading: boolean
  errorMessage: string

actions:
  initializeRatings()
  submitRating(payload)         // saves new WeeklyRating
  checkPendingRating()          // sets pendingRating flag
```

> `pendingRating` drives the "Rate your week" banner on the Home screen.

---

## What Does NOT Go in Stores

- Theme → stays in `useThemeStore` (already exists)
- Language → stays in `useAppStore` (already exists)
- Search / filter UI state → local component state only
