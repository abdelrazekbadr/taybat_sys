# Loading Spinner Audit & MealSpinner Component Plan

**Date:** 2026-06-06  
**Status:** Planning (no implementation yet)  
**Scope:** Audit all clickable UI elements that trigger data fetches → replace all `ActivityIndicator` usages with a custom `<MealSpinner />` component.

---

## 1. Goals

1. Audit every screen for clickable/action elements that trigger async data loads.
2. Identify where loading feedback is missing (silent actions).
3. Build a custom `<MealSpinner />` with 3 variants: `orbit`, `pulse`, `arc`.
4. Replace all `ActivityIndicator` usages with `<MealSpinner />`.
5. Ensure every data-loading action shows a spinner — no silent loads.

---

## 2. Screen-by-Screen Audit

### 2.1 Home Screen — `app/(main)/index.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Pull-to-refresh (`RefreshControl`) | `handleRefresh` → re-fetches meals & user meals | `refreshing={isLoading}` via `RefreshControl` | Replace with MealSpinner overlay |
| "إعادة المحاولة" Pressable | `initializeMeals()` | `ActivityIndicator` shown separately | Replace with MealSpinner |
| "إضافة وجبة" FAB button | `router.push('/(main)/select-meal')` | No async — navigation only | None needed |
| Delete meal icon | `removeUserMeal(mealId)` inside Alert confirm | No spinner during delete | **Missing** — add inline `isLoading` per-item |
| Weekly rating card → Stats link | `router.push('/(main)/stats')` | Navigation only | None needed |
| Meal history link | `router.push('/(main)/meal-history')` | Navigation only | None needed |

**Current indicators:** 2× `ActivityIndicator` (meals loading, user-meals loading)  
**Action:** Replace both with `<MealSpinner variant="orbit" size={120} />` centered in container.

---

### 2.2 Select Meal Screen — `app/(main)/select-meal.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `initializeMeals()` on mount | `ActivityIndicator` full-screen | Replace with MealSpinner |
| Meal card "إضافة" button | `addUserMeal(meal)` | `ActivityIndicator` on button | Replace with MealSpinner inline `size={80}` |
| Back button | `router.back()` | None | None needed |

**Current indicators:** 2× `ActivityIndicator`  
**Action:** Full-screen → `variant="orbit"`, button-level → `variant="pulse" size={80}`.

---

### 2.3 Meal Detail Screen — `app/(main)/meal-detail.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| "إضافة لليوم" button | `addUserMeal()` | No spinner | **Missing** |
| Delete log button | `removeUserMeal()` inside Alert | No spinner | **Missing** |
| Share button | `Share.share()` — native | None | None needed |
| Back button | `router.back()` | None | None needed |

**Current indicators:** 0  
**Action:** Add `isLoading` state to the two async actions, show `<MealSpinner variant="pulse" size={80} />` in place of button content.

---

### 2.4 Meal History Screen — `app/(main)/meal-history.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | Reads from `useUserMealsStore` — data already cached | No loading needed | None |
| Meal row tap | `router.push` to meal-detail | Navigation only | None |
| Back button | `router.back()` | None | None |

**Current indicators:** 0  
**Action:** None required; data is served from store cache.

---

### 2.5 Meal Preferences Screen — `app/(main)/meal-preferences.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `initializePreferences()` | `ActivityIndicator` full-screen | Replace with MealSpinner |
| Favorite toggle (heart icon) | `toggleFavorite(mealId)` | Button `disabled={isLoading}` but no visual feedback | **Missing** — show per-item spinner or pulse animation |
| Meal card tap | `router.push` to meal-detail | Navigation only | None |
| Back button | `router.back()` | None | None |

**Current indicators:** 1× `ActivityIndicator`  
**Action:** Full-screen → `variant="orbit" size={120}`, favorite toggle → `variant="arc" size={80}` inline.

---

### 2.6 Community Screen — `app/(main)/community.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Pull-to-refresh | `refreshPosts()` | `refreshing={isLoading}` | Replace visual with MealSpinner overlay |
| Initial load | `initializeCommunity()` | `ActivityIndicator` | Replace with MealSpinner |
| Load more (end of list) | `loadMorePosts()` | `ActivityIndicator` footer | Replace with `variant="arc" size={80}` |
| Reaction toggle (like) | `toggleReaction(postId)` — optimistic | No spinner (optimistic) | None needed (instant UI) |
| Follow toggle | `toggleFollow(userId)` — optimistic | No spinner (optimistic) | None needed |
| Post image / link tap | External navigation | None | None |

**Current indicators:** 2× `ActivityIndicator` (initial + load-more)  
**Action:** Initial → `variant="orbit"`, load-more footer → `variant="arc" size={80}`.

---

### 2.7 Stats Screen — `app/(main)/stats.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `fetchGoals()` | No spinner shown | **Missing** — add loading state |
| Tab selector | Local state toggle — no async | None | None |
| Submit rating button | `submitRating()` | `loading={isLoading}` on Paper Button | Replace with MealSpinner inside button |
| Weekly chart bars | Derived from cached state | No async | None |

**Current indicators:** 0 (Paper `Button loading` prop only)  
**Action:** Add goal-fetch spinner (`variant="pulse"`), replace rating submit with `<MealSpinner variant="arc" size={80} />`.

---

### 2.8 Notifications Screen — `app/(main)/notifications.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `fetchNotifications()` | `ActivityIndicator` | Replace with MealSpinner |
| "تحديد الكل كمقروء" button | `markAllAsRead()` | No spinner | **Missing** |
| Notification item tap | `markAsRead(id)` + navigation | No per-item spinner | Low priority — quick action |

**Current indicators:** 1× `ActivityIndicator`  
**Action:** Full-screen → `variant="orbit"`, mark-all button → disable + `variant="arc" size={80}`.

---

### 2.9 Account Screen — `app/(main)/account.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | Data from `useAccountStore` — usually pre-loaded | `ActivityIndicator` if no user | Replace with MealSpinner |
| Edit name (pencil icon) | Local state toggle | None | None |
| Save name | `updateDisplayName()` | No spinner | **Missing** |
| Avatar picker tap | Opens modal — local | None | None |
| Avatar save | `updateAvatar()` | No spinner | **Missing** |
| Logout | Alert confirm → `signOut()` | No spinner | **Missing** — add overlay spinner |
| Meal preferences row | `router.push` | Navigation | None |
| Email row | Alert only | None | None |

**Current indicators:** 1× `ActivityIndicator` (initial load guard)  
**Action:** Initial guard → `variant="orbit"`, save actions → inline `variant="pulse" size={80}`, logout → full-screen overlay.

---

### 2.10 User Profile Screen — `app/(main)/user-profile.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `fetchUserProfile(userId)` | No spinner | **Missing** |
| Follow/Unfollow button | `toggleFollow(userId)` | No spinner | **Missing** |
| Back button | `router.back()` | None | None |

**Current indicators:** 0  
**Action:** Mount → `variant="orbit"`, follow toggle → `variant="arc" size={80}` inline.

---

### 2.11 Topics Screen — `app/(main)/topics.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `fetchTopics()` | `ActivityIndicator` full-screen | Replace with MealSpinner |
| Pull-to-refresh | `refreshTopics()` | `RefreshControl` | Replace visual |
| Topic card tap | `router.push` to topic-detail | Navigation | None |

**Current indicators:** 1× `ActivityIndicator`  
**Action:** Replace with `variant="orbit" size={120}`.

---

### 2.12 Topic Detail Screen — `app/(main)/topic-detail.tsx`

| Element | Action | Current Loading | Gap |
|---|---|---|---|
| Screen mount | `fetchTopics()` (re-uses topics store) | No spinner | **Missing** |
| Back button | `router.back()` | None | None |

**Current indicators:** 0  
**Action:** Add loading guard with `variant="pulse"`.

---

## 3. Summary of Gaps

| Priority | Gap | Screens |
|---|---|---|
| **High** | Silent async action — no feedback | Meal Detail (add/delete), Account (save name, avatar, logout), User Profile (follow), Notifications (mark all read), Stats (fetch goals) |
| **Medium** | ActivityIndicator → replace with MealSpinner | Home, Select Meal, Meal Preferences, Community, Notifications, Account, Topics |
| **Low** | Per-item optimistic actions | Community reactions/follows (already optimistic — intentional) |

---

## 4. MealSpinner Component Plan

### 4.1 File Structure

```
components/
  common/
    MealSpinner/
      index.tsx           ← main export + usage examples
      OrbitSpinner.tsx    ← variant: 'orbit'
      PulseSpinner.tsx    ← variant: 'pulse'
      ArcSpinner.tsx      ← variant: 'arc'
      useMealSpinner.ts   ← shared Animated.Value + rotation hook
      types.ts            ← shared prop types
```

### 4.2 Types (`types.ts`)

```typescript
export type SpinnerVariant = 'orbit' | 'pulse' | 'arc';
export type SpinnerSize    = 80 | 120 | 160;
export type SpinnerSpeed   = 'slow' | 'normal' | 'fast';

export interface MealSpinnerProps {
  variant?:     SpinnerVariant;   // default: 'orbit'
  size?:        SpinnerSize;      // default: 120
  speed?:       SpinnerSpeed;     // default: 'normal'
  items?:       string[];         // default: ['🍚', '🍯', '🫒', '🌴']
  plateEmoji?:  string;           // default: '🍽️'
  label?:       string;           // Arabic loading text below spinner
  labelStyle?:  TextStyle;
}
```

### 4.3 Shared Animation Hook (`useMealSpinner.ts`)

- Accepts `speed: SpinnerSpeed`
- Speed → duration map: `{ slow: 3000, normal: 2000, fast: 1000 }`
- Returns one `Animated.Value` + interpolated rotation string `'0deg' → '360deg'`
- Uses `Animated.loop(Animated.timing(..., { useNativeDriver: true }))`
- Cleans up with `animation.stop()` on unmount

### 4.4 Variant 1 — OrbitSpinner (`OrbitSpinner.tsx`)

- **Center:** plate emoji in circle (white bg `#FFFFFF`, border `#E5E5E5`, shadow)
- **Orbit path:** 4 food emoji items on circle of radius `size * 0.42`
- **Position:** `Math.cos` / `Math.sin` with `(2π / n) * i` offset per item
- **Plate rotation:** clockwise via `Animated.loop`
- **Item counter-rotation:** each emoji rotates by negative of orbit angle → stays visually upright
- **Transform chain per item:**
  ```
  translateX(cos(angle + rotation) * radius)
  translateY(sin(angle + rotation) * radius)
  rotate(-rotation)  ← counter-rotation keeps emoji upright
  ```
- `useNativeDriver: true` on all transforms

### 4.5 Variant 2 — PulseSpinner (`PulseSpinner.tsx`)

- **Center:** plate emoji, static
- **Rings:** 3 concentric `border`-only circles (no fill), color from prop or `#10B981` (app primary)
- **Animation per ring:** scale `0.3 → 1`, opacity `1 → 0`
- **Stagger delays:** 0ms, 500ms, 1000ms
- **Loop:** `Animated.loop(Animated.sequence([...]))` per ring, independent
- **Separate Animated.Values** for scale and opacity (required for `useNativeDriver`)

### 4.6 Variant 3 — ArcSpinner (`ArcSpinner.tsx`)

- **6 dots** arranged in a circle, positioned with cos/sin at `(2π / 6) * i`
- **Dot size:** `size * 0.1`
- **Opacity gradient:** `[1, 0.85, 0.65, 0.45, 0.25, 0.1]` per dot index
- **Animation:** entire group rotates clockwise continuously
- **No counter-rotation** (dots are circles, not emoji)
- **Dot color:** `#AAAAAA` default (neutral)

### 4.7 Main Export (`index.tsx`)

```tsx
// <MealSpinner />
// <MealSpinner variant="pulse" size={80} speed="fast" />
// <MealSpinner variant="orbit" items={['🍚', '🍯', '🫒', '🌴']} label="جاري التحميل..." />
// <MealSpinner variant="arc" size={160} speed="slow" />

export function MealSpinner(props: MealSpinnerProps) {
  // switch on variant → OrbitSpinner | PulseSpinner | ArcSpinner
  // if label → <AppText> below spinner
}
```

### 4.8 Styling Rules

- **No hardcoded hex in StyleSheet** — derive from `size` prop; accept color props
- **Neutral palette defaults:** plate bg `#FFFFFF`, border `#E5E5E5`, dot `#AAAAAA`
- **All sizing relative to `size` prop** — no magic numbers
- **`useNativeDriver: true`** on all animations (transform only)
- **Separate `Animated.Value`** for opacity vs transform (cannot mix with native driver)
- Works on iOS and Android

---

## 5. Integration Pattern

### 5.1 Full-screen loading guard
```tsx
if (isLoading && items.length === 0) {
  return (
    <View className="flex-1 items-center justify-center bg-app-background">
      <MealSpinner variant="orbit" size={120} label="جاري التحميل..." />
    </View>
  );
}
```

### 5.2 Pull-to-refresh overlay (replace RefreshControl visual)
```tsx
// Keep RefreshControl for native gesture, add MealSpinner as overlay when refreshing
{isRefreshing && (
  <View style={StyleSheet.absoluteFill} className="items-center justify-center">
    <MealSpinner variant="pulse" size={80} />
  </View>
)}
```

### 5.3 Inline button loading state
```tsx
<Pressable onPress={handleAction} disabled={isLoading}>
  {isLoading
    ? <MealSpinner variant="arc" size={80} speed="fast" />
    : <AppText>تأكيد</AppText>}
</Pressable>
```

### 5.4 Logout / destructive action overlay
```tsx
{isLoggingOut && (
  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
        className="items-center justify-center">
    <MealSpinner variant="orbit" size={120} label="جاري تسجيل الخروج..." />
  </View>
)}
```

---

## 6. Implementation Order

| Step | Task | Priority |
|---|---|---|
| 1 | Create `MealSpinner/types.ts` | Required first |
| 2 | Create `useMealSpinner.ts` hook | Required first |
| 3 | Build `OrbitSpinner.tsx` (flagship variant) | High |
| 4 | Build `PulseSpinner.tsx` | High |
| 5 | Build `ArcSpinner.tsx` | High |
| 6 | Wire up `index.tsx` main export | High |
| 7 | Replace `ActivityIndicator` in all screens (7 locations) | High |
| 8 | Add missing spinners to silent actions (High-priority gaps table) | Medium |
| 9 | Export from `components/common/index.ts` | Low |

---

## 7. Constraints & Rules

- **No third-party animation libs** — only `Animated` from React Native core
- **No `setInterval` / `setTimeout`** — only `Animated.loop`
- **No new packages** — zero additional installs
- **`useNativeDriver: true`** on all animations
- **AppText for label** — never raw `<Text>`
- **Separate Animated.Values** for opacity and transform
- Follow CLAUDE.md: no `any`, no hardcoded strings, NativeWind className for layout
