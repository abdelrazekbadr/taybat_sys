# 02 — TodayMealTrackerSection

**Status:** pending  
**Layer:** `components/home/TodayMealTracker.tsx`

---

## Goal

Display today's 3 meal slots. Filled slots show zone + items. Empty slots are tappable to log a meal.

---

## Abstract Layout

```text
┌──────────┐  ┌──────────┐  ┌──────────┐
│  فطور    │  │  غداء    │  │  عشاء    │
│  🟢 ×2   │  │  + إضافة │  │  + إضافة │
└──────────┘  └──────────┘  └──────────┘
```

---

## Props

```ts
todayMeals: UserMeal[]        // from useUserMealsStore.todayMeals
onAddMeal: (slot: 1|2|3) => void
```

---

## Slot Logic

- Slot 1 = first entry logged today (regardless of meal type label)
- Slot 2 = second entry, Slot 3 = third
- Labels فطور/غداء/عشاء are positional (slot index), not stored
- Filled: show `zone_summary` colored badge + count of items ("٢ عنصر")
- Empty: show "+" icon + "إضافة"
- When 3 slots filled → "+" FAB is hidden or disabled

---

## Zone Badge Color Map

```text
ZoneColor  → Tailwind class
'green'    → bg-app-primary  (#10B981)
'yellow'   → bg-amber-400
'orange'   → bg-orange-400
'purple'   → bg-violet-400
'red'      → bg-rose-500
```

---

## Data Source

`useUserMealsStore` → `todayMeals`  
Max 3 enforced in store `logMeal` action — component just reflects state.
