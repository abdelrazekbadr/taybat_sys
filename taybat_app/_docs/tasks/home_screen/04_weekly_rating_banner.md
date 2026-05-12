# 04 — WeeklyRatingBanner

**Status:** pending  
**Layer:** `components/home/WeeklyRatingBanner.tsx`

---

## Goal

Prompt the user to submit their weekly health rating when 7 days have passed since their last submission.

---

## Abstract Layout

```
┌──────────────────────────────────────┐
│  🌟 وقت تقييم أسبوعك!               │
│  سجّل تحسّنك الصحي هذا الأسبوع       │
│                [ ابدأ التقييم ]      │
└──────────────────────────────────────┘
```

---

## Props

```
visible: boolean            // = useWeeklyRatingStore.pendingRating
onStart: () => void         // navigate to Weekly Rating screen
onDismiss: () => void       // hide for the session (not persisted)
```

---

## Visibility Rule

Show when: `lastRating.submitted_at` + 7 days ≤ today  
OR: user has no ratings yet AND plan days ≥ 7

---

## Notes

- Rendered conditionally — takes no space when `visible = false`
- Dismiss is session-only (local state, not stored)
- Accent color: brand gold `#f59e0b`
