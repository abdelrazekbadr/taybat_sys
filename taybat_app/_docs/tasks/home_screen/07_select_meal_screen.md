# 07 — Select Meal Screen

**Status:** pending
**Route:** `app/(main)/select-meal.tsx`
**Triggered from:** Home screen empty meal slot tap / FAB

---

## Goal

Let the user pick an existing Meal to log for today, or compose a new one from MealItems.
Single-purpose screen — no editing, no deletion.

---

## Layout

```text
┌─────────────────────────────────────────┐
│ ← رجوع          اختر وجبة              │  ← header
├─────────────────────────────────────────┤
│ [ 🟢 أخضر ][ 🟡 أصفر ][ 🟠 برتقالي ]  │  ← ZoneFilterStrip (horizontal chips)
│ [ 🟣 بنفسجي ][ 🔴 أحمر ][ الكل ]       │
├─────────────────────────────────────────┤
│ 🔍 ابحث عن وجبة...                      │  ← SearchBar
├─────────────────────────────────────────┤
│ ┌──────────────────────────────────┐    │
│ │ 🟢  فطور                         │    │  ← MealCard (tap to log)
│ │     أرز · تمر · عسل  · ٣ عناصر  │    │
│ └──────────────────────────────────┘    │
│ ┌──────────────────────────────────┐    │
│ │ 🟠  غداء                         │    │
│ │     لحم ضاني · زيت زيتون  · ٢   │    │
│ └──────────────────────────────────┘    │
│  ...                                    │
└─────────────────────────────────────────┘
          [ + إنشاء وجبة جديدة ]           ← bottom CTA
```

---

## Components

### `ZoneFilterStrip`

```text
props: selectedZone: ZoneColor | null, onSelect: (zone: ZoneColor | null) => void
```

- Horizontal scrollable chips, one per zone + "الكل"
- Active chip uses zone background color
- Stateless — local state in screen

### `MealSearchBar`

```text
props: value: string, onChange: (text: string) => void
```

- Filters `MOCK_MEALS` by name on every keystroke
- Local state only — not in store

### `MealCard`

```text
props: meal: Meal, mealItems: MealItem[], onPress: (meal: Meal) => void
```

- Shows zone badge (integer → color via `zoneUtils`)
- Meal name + preview of first 3 item names + total count
- Single tap → logs this meal → navigate back to Home

---

## Screen Logic

```text
1. Load meals from useMealsStore
2. Load mealItems from useMealItemsStore (for name preview)
3. Filter meals by selectedZone + searchText (local state)
4. Tap MealCard → useUserMealsStore.logMeal(meal.id) → pop screen
5. "إنشاء وجبة جديدة" → navigate to ComposeMeal screen (future)
```

- If `logMeal` returns false (max 3 reached) → show inline error toast
- No loading skeleton — data is always in-memory from mock

---

## Data Sources

| Data | Source |
|---|---|
| meals list | `useMealsStore.meals` |
| item names for preview | `useMealItemsStore.getMealItemById(id)` |
| log action | `useUserMealsStore.logMeal(mealId)` |
