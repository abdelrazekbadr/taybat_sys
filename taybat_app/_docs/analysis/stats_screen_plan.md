# Stats Screen — Design & Implementation Plan

## Overview

The Stats screen is the user's personal health dashboard. It is reachable from the weekly rating notification card on the Home screen and from the bottom tab bar. It contains two tabs: **التقييم** (submit / view the weekly evaluation) and **التطور** (health progress charts over time).

---

## Navigation Entry Points

| Source | Action |
|---|---|
| Home screen — `pendingRating` banner card | `router.push('/(main)/stats')` |
| `AppTabBar` — `badges` tab (repurposed) | `router.push('/(main)/stats')` |

`AppTabBar` key stays `badges`, label updated to `إنجازاتي` or `تطوري` — no schema change needed.

---

## Screen Layout

```
┌──────────────────────────────┐
│  Safe-area top               │
│  [←]   تقييم الطيبات        │  ← title + back button
├──────────────────────────────┤
│                              │
│    [ التقييم ]  [ التطور ]   │  ← centered badge tab pills
│                              │
├──────────────────────────────┤
│                              │
│  < Tab content >             │
│                              │
│  (ScrollView per tab)        │
│                              │
├──────────────────────────────┤
│  AppTabBar  active="badges"  │
└──────────────────────────────┘
```

### Tab pill design

Two `TouchableOpacity` pills, horizontally centered, with `gap-3` between them:
- **Active:** gradient fill (primary → secondary), white text
- **Inactive:** `bg-app-surface border border-app-lineSoft`, muted text

---

## Tab 1 — التقييم (Weekly Evaluation)

### State: Locked (not pending)

```
┌──────────────────────────────┐
│  🔒 التقييم القادم            │  ← AppText bold
│  الأحد ١٧ مايو · بعد ٣ أيام  │  ← date + countdown chip
├──────────────────────────────┤
│  الحالة الصحية العامة        │  ← section label
│  [😞][😕][😐][🙂][😄]         │  ← ScoreSelector (disabled, shows last value)
│                              │
│  الالتزام بالنظام            │
│  [😞][😕][😐][🙂][😄]         │  ← ScoreSelector (disabled)
│                              │
│  التحسينات الملحوظة          │
│  [pill][pill][pill]           │  ← ImprovementToggle row (disabled)
│  [pill][pill]                │
│                              │
│  [ أرسل التقييم — disabled ] │
└──────────────────────────────┘
```

### State: Active (pending — due date reached)

Same layout but all controls are enabled and interactive. Submit button uses primary gradient.

---

### Component: `ScoreSelector`

**Props:**
```typescript
interface ScoreSelectorProps {
  value: WeeklyScore | null;
  onChange: (v: WeeklyScore) => void;
  disabled?: boolean;
}
```

**Visual — 5 options in a row:**

| Score | Icon (Lucide) | Label |
|---|---|---|
| 1 | `Frown` | سيء جداً |
| 2 | `Meh` | سيء |
| 3 | `Smile` | محايد |
| 4 | `Laugh` | جيد |
| 5 | `PartyPopper` | ممتاز |

Each option: round pill `flex-1`, icon 22px + label below.
- Selected: `bg-app-primary/10 border border-app-primary`, icon in `theme.colors.primary`
- Unselected: `bg-app-surface border border-app-lineSoft`, icon in muted color
- Disabled: reduced opacity (`opacity-40`), no press feedback

Mirrors the mood-picker pattern already used in `CommitmentCard.tsx`.

---

### Component: `ImprovementToggle`

**Props:**
```typescript
interface ImprovementToggleProps {
  icon: LucideIcon;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}
```

**Visual — pill button:**
```
┌──────────────────────┐
│  [Icon]  تحسّن الألم │  ← active: green bg + white text
└──────────────────────┘
```

- Active: `bg-app-primary`, white icon + text
- Inactive: `bg-app-surface border border-app-lineSoft`, muted icon + text
- Layout: `flexWrap: 'wrap'` row of pills, 2 per row approximately

**5 toggles mapped from `WeeklyRating`:**

| field | icon | label |
|---|---|---|
| `pain_reduced` | `Zap` | تحسّن الألم |
| `energy_improved` | `Battery` | طاقة أفضل |
| `sleep_improved` | `Moon` | نوم أفضل |
| `digestion_improved` | `Activity` | هضم أفضل |
| `mood_improved` | `Smile` | مزاج أفضل |

---

### Evaluation submission flow

1. User fills `health_score`, `adherence_score` (required), toggles (optional — default `false`)
2. Tap "أرسل التقييم" → `useWeeklyRatingStore.submitRating(payload)`
3. On success: show inline success state (checkmark animation), `pendingRating` flips to `false`
4. On error: show `errorMessage` under button

---

## Tab 2 — التطور (Health Timeline Charts)

### Layout (inside ScrollView)

```
┌──────────────────────────────┐
│  📈 التطور الأسبوعي          │  ← section header
│  ─────────────────────────── │
│  [Line/Area Chart]           │  ← last 10 weeks
│   • health_score (green)     │
│   • adherence_score (teal)   │
├──────────────────────────────┤
│  📊 ملخّص شهري               │  ← section header
│  ─────────────────────────── │
│  [Bar Chart]                 │  ← 12 months current year
│   avg score per month        │
└──────────────────────────────┘
```

### Chart Library — `react-native-gifted-charts`

**Recommendation:** `react-native-gifted-charts`

**Why:**
- Most actively maintained RN chart library (2024–2025)
- Native-level performance — uses `react-native-svg` under the hood
- Built-in support for line, area, and bar charts
- Gradient fill support (works with `expo-linear-gradient` already installed)
- RTL-compatible (can flip x-axis direction)
- Simple, declarative API — no D3 required
- Handles empty/null data points gracefully

**Install:**
```bash
npm install react-native-gifted-charts react-native-svg
```
(`react-native-svg` is likely already present via expo; verify with `npx expo install react-native-svg`)

---

### Weekly Line Chart — data shape

```typescript
// Derived from WeeklyRating[] sorted by period_start
// Last 10 weeks, fill missing weeks with null

interface WeeklyChartPoint {
  value: number;       // health_score avg (or 0 for empty)
  label: string;       // "أ١"، "أ٢" etc. (Arabic week abbreviation)
  dataPointText?: string;
}
```

Two datasets:
- `healthData: WeeklyChartPoint[]` — mapped from `health_score`
- `adherenceData: WeeklyChartPoint[]` — mapped from `adherence_score`

Empty weeks (no rating): value = `0`, rendered as a gap (use `hideDataPoint: true`)

Chart config:
```typescript
<LineChart
  data={healthData}
  data2={adherenceData}
  height={180}
  spacing={36}
  maxValue={5}
  noOfSections={5}
  curved
  areaChart
  startFillColor={theme.colors.primary}
  startOpacity={0.3}
  endOpacity={0.05}
  color1={theme.colors.primary}
  color2={theme.colors.secondary}
  hideRules
  yAxisTextStyle={{ color: theme.colors.outline, fontSize: 10 }}
  xAxisLabelTextStyle={{ color: theme.colors.outline, fontSize: 10 }}
/>
```

---

### Monthly Bar Chart — data shape

```typescript
interface MonthlyChartPoint {
  value: number;       // avg of health_score for that month (0 if no ratings)
  label: string;       // "يناير"، "فبراير" etc.
  frontColor: string;  // primary color if has data, outline if empty
}
```

12 bars always rendered. Months with no ratings get a near-zero value with a dashed/outline style (`frontColor: theme.colors.surfaceVariant`).

Chart config:
```typescript
<BarChart
  data={monthlyData}
  height={160}
  barWidth={20}
  spacing={10}
  maxValue={5}
  noOfSections={5}
  roundedTop
  hideRules
  barBorderRadius={4}
  yAxisTextStyle={{ color: theme.colors.outline, fontSize: 10 }}
  xAxisLabelTextStyle={{ color: theme.colors.outline, fontSize: 9 }}
/>
```

---

## Data Derivation Utilities — `utils/statsUtils.ts` (extend existing)

Add pure functions (no side effects, no imports from stores):

```typescript
// Returns next evaluation due date ISO string
nextRatingDate(ratings: WeeklyRating[]): string

// Returns days until next evaluation (negative = overdue / pending)
daysUntilNextRating(ratings: WeeklyRating[]): number

// Maps WeeklyRating[] → last N weekly chart points (fills gaps with 0)
toWeeklyChartData(ratings: WeeklyRating[], weeks: number): WeeklyChartPoint[]

// Maps WeeklyRating[] → 12-month chart points for given year
toMonthlyChartData(ratings: WeeklyRating[], year: number): MonthlyChartPoint[]
```

---

## File Checklist

**New files:**
- [ ] `app/(main)/stats.tsx` — main screen with tab switcher
- [ ] `components/stats/EvaluationTab.tsx` — Tab 1 content
- [ ] `components/stats/TimelineTab.tsx` — Tab 2 content
- [ ] `components/stats/ScoreSelector.tsx` — 5-option visual score picker
- [ ] `components/stats/ImprovementToggle.tsx` — boolean pill toggle

**Modified files:**
- [ ] `app/(main)/_layout.tsx` — register `stats` screen
- [ ] `components/common/AppTabBar.tsx` — wire `badges` tab → `/(main)/stats`
- [ ] `utils/statsUtils.ts` — add 4 chart/date utility functions
- [ ] `app/(main)/index.tsx` — wire `pendingRating` banner `onPress` → `router.push('/(main)/stats')`

---

## Design Rules

- No new store — consume `useWeeklyRatingStore` directly
- `ScoreSelector` mirrors `CommitmentCard` mood-picker pattern (already validated in UI)
- Locked state: `opacity-40` + `pointerEvents="none"` wrapper — no separate disabled prop drilling
- Charts scroll horizontally on small screens via `ScrollView` wrapper with `horizontal`
- RTL: chart x-axis labels naturally right-to-left in Arabic; test on device
- `AppTabBar active="badges"` on stats screen
- Back button in safe-area top (stack push screen — no floating button needed here, header row suffices)
- All score/improvement values default to `null` / `false` when form opens — never pre-fill from last submission (each week is independent)
