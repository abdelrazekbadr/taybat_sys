# 03 — AdherenceStreakCard

**Status:** pending
**Layer:** `components/home/AdherenceStreakCard.tsx`

---

## Goal

Show the user's engagement statistics at a glance — days on plan, streak, and today's zone performance.

---

## Abstract Layout

```text
┌──────────────────────────────────────┐
│  📅 يوم ٤١ في الخطة                  │
│                                      │
│  🔥 ١٢ يوم متواصل    🟢 ٢ خضراء اليوم│
└──────────────────────────────────────┘
```

---

## Props

```ts
planStartDate: string   // user.plan_start_date
userMeals: UserMeal[]   // full history for streak calculation
todayMeals: UserMeal[]  // for today's green zone count
```

---

## Computed Values (pure functions in utils)

| Display | Computation |
| --- | --- |
| Days on plan | `today − plan_start_date` in days |
| Current streak | Consecutive days with ≥1 `UserMeal` going back from today |
| Green meals today | Count `todayMeals` where `zone_summary === 1` |

---

## Notes

- All computations in `utils/statsUtils.ts` — pure functions, no store calls
- Card is display-only — no actions
- Numbers formatted in Arabic numerals when `language === 'ar'`
