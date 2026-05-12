# 04 — Zone Utils

**Status:** pending
**Layer:** `utils/zoneUtils.ts`

---

## Goal

Single source of truth for converting `ZoneColor` integers to display values used across all UI components.
Pure functions only — no imports from stores or components.

---

## Functions to Implement

```ts
getZoneColor(zone: ZoneColor): string
// Returns Tailwind bg class
// 1 → 'bg-app-primary'   (green  #10B981)
// 2 → 'bg-amber-400'     (yellow)
// 3 → 'bg-orange-400'    (orange)
// 4 → 'bg-violet-400'    (purple)
// 5 → 'bg-rose-500'      (red)

getZoneEmoji(zone: ZoneColor): string
// 1→'🟢'  2→'🟡'  3→'🟠'  4→'🟣'  5→'🔴'

getZoneLabel(zone: ZoneColor): string
// Arabic label
// 1→'أخضر'  2→'أصفر'  3→'برتقالي'  4→'بنفسجي'  5→'أحمر'

getZoneTextColor(zone: ZoneColor): string
// Tailwind text class for contrast on zone background
// 1-4 → 'text-white'   5 → 'text-white'

computeDominantZone(zoneIntegers: ZoneColor[]): ZoneColor
// Returns the highest integer (worst zone) among the input array
// Used when building a Meal from MealItems
```

---

## Usage

```ts
import { getZoneEmoji, getZoneLabel, getZoneColor } from '@/utils/zoneUtils';

// In a component:
<View className={getZoneColor(meal.dominant_zone)}>
  <AppText>{getZoneEmoji(meal.dominant_zone)} {getZoneLabel(meal.dominant_zone)}</AppText>
</View>
```

---

## Constraints

- No `switch` — use lookup objects for O(1) access
- All functions return a non-nullable value (every ZoneColor 1–5 must be handled)
- Export a `ZONE_META` constant too for cases that need all fields at once
