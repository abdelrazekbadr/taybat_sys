# Library Screen — Design & Implementation Plan

## Overview

The Library (المكتبة) tab opens a 2-column grid of knowledge topics derived from the Tayabat 5-level dietary system. Tapping a topic navigates to a full-detail screen with image, title, description, and item cards.

---

## Screens

### 1. Library Grid Screen — `app/(main)/library.tsx`

**Purpose:** Entry point for the knowledge base. Shows all topics as a 2-column grid.

**Layout (top → bottom):**

```
┌─────────────────────────────┐
│  Safe-area top              │
│  [←]  المكتبة              │  ← AppText bold title + optional back
├─────────────────────────────┤
│  [TopicCard]  [TopicCard]   │
│  [TopicCard]  [TopicCard]   │
│  [TopicCard]  [TopicCard]   │
│         ...                 │
├─────────────────────────────┤
│  AppTabBar  active="library"│
└─────────────────────────────┘
```

**Behavior:**

- Uses `FlatList` with `numColumns={2}` — avoids nesting ScrollView
- Each card press navigates: `router.push({ pathname: '/(main)/library-topic', params: { topicId } })`
- No loading/async state — data is static

---

### 2. Topic Detail Screen — `app/(main)/library-topic.tsx`

**Purpose:** Rich detail view for a single topic.

**Layout (top → bottom inside ScrollView):**

```
┌─────────────────────────────┐
│  [← Back]  (floating btn)   │  ← absolute positioned, safe-area aware
│                             │
│  ┌─────────────────────────┐│
│  │   Image (cover)         ││  ← full-width, ~240px height
│  └─────────────────────────┘│
│                             │
│  Title                      │  ← AppText bold, text-[22px]
│  Description                │  ← AppText, text-[14px], text-app-muted
│                             │
│  ─── section divider ───   │
│                             │
│  [TopicItemCard]            │  ← icon + title + description
│  [TopicItemCard]            │
│         ...                 │
│  bottom padding             │
└─────────────────────────────┘
```

**Back button:** Absolute-positioned circle button (top-left/right per RTL), overlaid on the image. Mimics the pattern in `meal-detail.tsx`.

**Params received:** `topicId: string` via `useLocalSearchParams`

---

## Components

### `components/library/TopicCard.tsx`

Props:

```typescript
interface TopicCardProps {
  topic: LibraryTopic;
  onPress: () => void;
}
```

Visual structure (single card):

```
┌───────────────────┐
│  ░░░ color strip  │  ← 4px top border in topic accent color
│                   │
│    [Icon 36px]    │  ← lucide icon, accent color
│                   │
│   Topic Title     │  ← AppText semibold, centered, 2-line max
└───────────────────┘
```

- Background: `bg-app-surface`
- Border: `border border-app-lineSoft rounded-2xl`
- Flex: `flex-1` so both columns stretch equally
- Margin: `m-1.5` (gap between cards via margin)

---

### `components/library/TopicItemCard.tsx`

Props:

```typescript
interface TopicItemCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}
```

Visual structure:

```
┌─────────────────────────────┐
│ [Icon]  Title               │  ← icon + bold title in a row
│         Description text    │  ← muted, multi-line under title
└─────────────────────────────┘
```

- Background: `bg-app-background`
- Border: `border border-app-lineSoft rounded-xl`
- Padding: `p-4`
- Icon: 20px, accent color from topic context (passed as prop or via context)

---

## Data & Types

### `types/library.types.ts` (new file)

```typescript
import type { LucideIcon } from 'lucide-react-native';

export interface LibraryTopicItem {
  id: string;
  Icon: LucideIcon;
  title: string;
  description: string;
}

export interface LibraryTopic {
  id: string;
  title: string;
  description: string;
  image: string | ReturnType<typeof require>; // url string or local asset
  accentColor: string;                         // level accent color for card
  Icon: LucideIcon;                            // icon shown in grid card
  items: LibraryTopicItem[];
}
```

### `data/library/topics.data.ts` (new file)

Static data — no store needed (knowledge base is read-only content).

**Initial 6 topics** derived from `_docs/kb/01_Tayabat_Guide.md`:

| id | code         | title                                                            | icon            | accentColor              |
| -- | ------------ | ---------------------------------------------------------------- | --------------- | ------------------------ |
| 1  | `overview` | فلسفة النظام                                          | `BookHeart`   | `#64748b` (navy-muted) |
| 2  | `level-1`  | المستوى الأول – الغذاء الأساسي         | `ShieldCheck` | `#10B981` (green)      |
| 3  | `level-2`  | المستوى الثاني – الغذاء المحدود       | `Sun`         | `#F59E0B` (yellow)     |
| 4  | `level-3`  | المستوى الثالث – الغذاء المراقب       | `Flame`       | `#F97316` (orange)     |
| 5  | `level-4`  | المستوى الرابع – الغذاء الاستثنائي | `Sparkles`    | `#8B5CF6` (purple)     |
| 6  | `level-5`  | المستوى الخامس – الغذاء الممنوع       | `ShieldX`     | `#EF4444` (red)        |

Each topic has 4–8 items. Examples for Level 1 items:

- Rice (الأرز) — `Wheat` icon — "المصدر الأساسي للطاقة، يومي بدون قيود"
- Potato (البطاطس) — `Sprout` icon — "غذاء عادي يُسلق أو يُشوى"
- Olive Oil (زيت الزيتون) — `Droplets` icon — "مضاد التهابات طبيعي"
- Dates (التمر) — `Cherry` icon — "محلي طبيعي مسموح يومياً"
- Vitamin D (فيتامين د) — `Sun` icon — "مكمل إلزامي للجميع"

---

## Navigation & Routing

### `app/(main)/_layout.tsx` — add 2 screens

```typescript
<Stack.Screen name="library" />
<Stack.Screen name="library-topic" />
```

### `components/common/AppTabBar.tsx` — wire library tab

```typescript
case 'library':
  router.push('/(main)/library');
  break;
```

---

## File Checklist

**New files:**

- [ ] `types/library.types.ts`
- [ ] `data/library/topics.data.ts`
- [ ] `components/library/TopicCard.tsx`
- [ ] `components/library/TopicItemCard.tsx`
- [ ] `app/(main)/library.tsx`
- [ ] `app/(main)/library-topic.tsx`

**Modified files:**

- [ ] `app/(main)/_layout.tsx` — register 2 new screens
- [ ] `components/common/AppTabBar.tsx` — add library navigation

---

## Design Rules (from CLAUDE.md)

- RTL-first: use `useRTL()` → `{ isRTL, rowDir }` for directional layout
- No hardcoded colors — use `accentColor` from topic data or `theme.colors.*`
- `AppText` for all text — never raw `<Text>`
- `className` for layout/spacing; `style` only when className can't do it
- No stores — static data accessed directly from `topics.data.ts`
- Back button mirrors `meal-detail.tsx` floating back button pattern
- `AppTabBar active="library"` on library grid screen only (detail screen has no tab bar — it's a push screen)

---

## Future Splits (Phase 2)

Each section of `01_Tayabat_Guide.md` maps to one or more topics. Additional topics to add later:

- الأسئلة الشائعة (FAQ)
- التطبيق العملي اليومي (Daily application guide)
- نصائح الطهي (Cooking tips per level)
- الحالات الخاصة (Special conditions)

The `LibraryTopic` data shape supports this without any schema changes — just add more entries to `topics.data.ts`.
