# 01 — Home Screen Layout (Abstract)

**Status:** pending
**Layer:** `app/(main)/index.tsx`
**RTL:** Arabic primary

---

## Goal

Define the Home screen as an abstract layout — sections, responsibilities, and data sources.
No styling detail or full implementation.

---

## Screen Layout (top → bottom)

```text
┌─────────────────────────────────┐
│  HeaderSection                  │  ← greeting + subscriber badge + date
├─────────────────────────────────┤
│  TodayMealTrackerSection        │  ← 3 meal slots (فطور / غداء / عشاء)
│  [slot 1] [slot 2] [slot 3]     │
├─────────────────────────────────┤
│  AdherenceStreakCard             │  ← days on plan, current streak
├─────────────────────────────────┤
│  WeeklyRatingBanner             │  ← shown only when pendingRating = true
├─────────────────────────────────┤
│  ZoneGuideStrip                 │  ← 5 colored zone chips (reference)
├─────────────────────────────────┤
│  RecentActivityList             │  ← last 3 UserMeal entries with zone badge
└─────────────────────────────────┘
       [FAB: + تسجيل وجبة]
```

---

## Sections

### HeaderSection

- Data: `user.name`, `user.subscriber_id`, today's date (formatted Arabic)
- Shows subscriber badge (#100, #101 …)
- No actions

### TodayMealTrackerSection

- Data: `todayMeals` from `useUserMealsStore`
- Always shows 3 slots
- Filled slot → zone color badge + summary of item count
- Empty slot → "+" tap navigates to Select Meal screen
- Slot labels: فطور · غداء · عشاء

### AdherenceStreakCard

- Data: `userMeals` — compute days user logged at least 1 meal
- Shows: days since plan start, current consecutive streak, zone-1 meal count today
- Read-only display

### WeeklyRatingBanner

- Data: `pendingRating` from `useWeeklyRatingStore`
- Visible only when 7 days have passed since last rating
- Single CTA button → navigates to Weekly Rating screen
- Dismissible for the session (not permanently)

### ZoneGuideStrip

- Static display of 5 zone chips with emoji + Arabic label via `zoneUtils`
- Tapping a zone chip navigates to Zone Detail screen (future)
- No store dependency

### RecentActivityList

- Data: last 3 `userMeals` sorted by datetime desc
- Each row: date label + zone badge + item count
- "View all" link → future full log screen

### FAB (Floating Action Button)

- Fixed bottom-right (LTR) / bottom-left (RTL)
- Label: "+ تسجيل وجبة"
- Navigates to Select Meal screen

---

## Screen Responsibilities

- Read from `useUserStore`, `useUserMealsStore`, `useWeeklyRatingStore`
- Call `initializeUser()`, `initializeUserMeals()`, `checkPendingRating()` on mount
- No business logic inline — delegate to stores
- Show loading skeleton when any store `isLoading = true`
- Zone integers → colors/labels always via `utils/zoneUtils` — never hardcode zone values in screen
