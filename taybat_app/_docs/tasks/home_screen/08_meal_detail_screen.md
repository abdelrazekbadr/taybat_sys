# 08 — Meal Detail Screen

**Status:** pending
**Route:** `app/(main)/meal-detail.tsx`
**Triggered from:** Filled meal slot tap on Home screen

---

## Goal

Show full detail of a logged UserMeal — which Meal was eaten, its MealItems, zone breakdown,
and when it was logged. Read-only view.

---

## Layout

```text
┌────────────────────────────────────────┐
│ ← رجوع                                 │  ← header
├────────────────────────────────────────┤
│                                        │
│   [ zone badge large ]  🟢 أخضر        │  ← ZoneBadgeHero
│   فطور                                 │  ← meal name
│   اليوم · ٠٨:١٠                        │  ← datetime formatted
│                                        │
├────────────────────────────────────────┤
│  عناصر الوجبة (٣)                      │  ← section header
│  ┌────────────────────────────────┐    │
│  │ 🟢  الأرز        · يومي        │    │  ← MealItemRow
│  │ 🟢  التمر        · يومي        │    │
│  │ 🟢  العسل        · يومي        │    │
│  └────────────────────────────────┘    │
├────────────────────────────────────────┤
│  ملاحظات العناصر                       │  ← section header (shown if any notes exist)
│  العسل: محلي طبيعي                    │
│  ...                                   │
├────────────────────────────────────────┤
│        [ 🗑 حذف هذه الوجبة ]           │  ← delete action (destructive, confirm first)
└────────────────────────────────────────┘
```

---

## Components

### `ZoneBadgeHero`

```text
props: zone: ZoneColor, label: string
```

- Large centered zone indicator at top of screen
- Zone integer → color + emoji + Arabic label via `zoneUtils`

### `MealItemRow`

```text
props: item: MealItem
```

- Small zone badge + item name + frequency label
- Read-only, no tap action

### `NotesSection`

```text
props: items: MealItem[]
```

- Renders only items where `notes` is non-empty
- Simple list of "name: note" rows

---

## Screen Logic

```text
Route params: userMealId: number

1. Get UserMeal by id from useUserMealsStore
2. Get Meal by meal_id from useMealsStore
3. Parse meal_item_ids string → array of ids
4. Resolve each id via useMealItemsStore.getMealItemById
5. Render read-only view

Delete flow:
  - Tap delete → show confirmation dialog
  - Confirm → useUserMealsStore.deleteMeal(userMealId) → navigate back
```

---

## Data Sources

| Data | Source |
|---|---|
| UserMeal | `useUserMealsStore` |
| Meal | `useMealsStore.getMealById` |
| MealItems | `useMealItemsStore.getMealItemById` (per id) |
| delete | `useUserMealsStore.deleteMeal` |
