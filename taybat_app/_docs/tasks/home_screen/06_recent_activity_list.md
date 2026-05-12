# 06 — RecentActivityList

**Status:** pending  
**Layer:** `components/home/RecentActivityList.tsx`

---

## Goal

Show the last 3 logged meals as a compact list with zone badge and date.

---

## Abstract Layout

```
الوجبات الأخيرة
┌────────────────────────────────────┐
│ 🟢  اليوم · ٣ عناصر               │
│ 🟡  أمس · ٢ عناصر                 │
│ 🟠  الإثنين · ١ عنصر               │
│                   [ عرض الكل ← ]  │
└────────────────────────────────────┘
```

---

## Props

```
meals: UserMeal[]         // last 3, sorted desc by datetime
onViewAll?: () => void
```

---

## Row Data

| Field | Source |
|---|---|
| Zone badge | `meal.zone_summary` |
| Date label | Relative: "اليوم" / "أمس" / weekday name |
| Item count | Count IDs in `meal.meal_item_ids` |

---

## Notes

- `UserMeal[]` sliced to last 3 before passing as prop (parent does the slicing)
- Date labels computed in `utils/dateUtils.ts`
- "View all" hidden if fewer than 4 total meals exist
