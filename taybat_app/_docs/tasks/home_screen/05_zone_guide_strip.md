# 05 — ZoneGuideStrip

**Status:** pending  
**Layer:** `components/home/ZoneGuideStrip.tsx`

---

## Goal

A horizontal scrollable strip showing the 5 dietary zones as colored chips — quick visual reference.

---

## Abstract Layout

```
← scroll →
[ 🟢 الأخضر ] [ 🟡 الأصفر ] [ 🟠 البرتقالي ] [ 🟣 البنفسجي ] [ 🔴 الأحمر ]
```

---

## Props

```
onZonePress?: (zone: ZoneColor) => void   // optional — future navigation
```

---

## Data

Static — no store. Zone labels and colors are constants.

```
zones: Array<{ zone: ZoneColor, label: string, emoji: string }>
```

---

## Notes

- Horizontal `FlatList` or `ScrollView`
- Each chip: zone emoji + Arabic label + background tinted to zone color (10% opacity bg, solid text)
- No loading state — purely static display
