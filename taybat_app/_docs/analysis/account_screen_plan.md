# Account Screen — Design & Implementation Plan

## Overview

The Account screen ("حسابي") is the self-service settings hub of the app. Accessed via the `account` tab in `AppTabBar`, it replaces the current behavior of pushing to `user-profile.tsx`. The screen follows a **settings-list style**: grouped rows organized into collapsible or static sections. Design principle: **maximum preference coverage, minimum keystrokes** — prefer toggles, pickers, and single-tap actions over text input forms.

---

## Current State

| File | Status |
|---|---|
| `app/(main)/user-profile.tsx` | Exists — view-only profile (own + others). Keep as-is for viewing other users' profiles from the Community screen. |
| `app/(main)/account.tsx` | **Missing** — needs to be created as the tab's root screen. |
| `AppTabBar.tsx` account press | Currently `router.push('/(main)/user-profile')` — must change to `router.replace('/(main)/account')`. |

---

## Navigation

### Tab bar update

The `account` tab press changes from push → replace and targets the new screen:

```diff
- router.push('/(main)/user-profile');
+ router.replace('/(main)/account');
```

`user-profile.tsx` remains reachable from Community posts via `router.push('/(main)/user-profile?userId=X&name=Y')`.

### Sub-screens (all push, no tab bar)

| Screen | Route | Entry point |
|---|---|---|
| Edit Name | Modal / inline | Inline in account.tsx |
| Avatar Picker | Bottom sheet | Tap avatar in account.tsx |
| Meal Preferences | `/(main)/meal-preferences` | Row tap in account.tsx |

---

## Screen Layout

```
┌──────────────────────────────────┐
│  Safe-area top                   │
│  حسابي                           │  ← bold title, RTL-start
├──────────────────────────────────┤
│                                  │
│     ┌────────┐                   │
│     │ Avatar │  اسم المستخدم    │  ← 72px avatar, name bold
│     │  80px  │  في الرحلة منذ  │  ← plan days chip
│     └────────┘  X يوم           │
│                                  │
├──────────────────────────────────┤
│  حسابي                           │  ← section header
│  ─────────────────────────────── │
│  الاسم          محمد أحمد  [✎]  │
│  البريد         user@…    [›]   │
│  الصورة الشخصية              [›] │
├──────────────────────────────────┤
│  تفضيلات الوجبات                 │  ← section header
│  ─────────────────────────────── │
│  الوجبات المفضلة  ٣ مفضلة  [›]  │
├──────────────────────────────────┤
│  الخصوصية والأمان                │  ← section header
│  ─────────────────────────────── │
│  رؤية منشوراتي   [عام ╍ متابعون]│  ← segmented toggle
│  من يستطيع متابعتي [الكل ╍ …]   │  ← segmented toggle
├──────────────────────────────────┤
│  إعدادات التطبيق                 │  ← section header
│  ─────────────────────────────── │
│  اللغة          العربية  [›]    │
│  المظهر         تلقائي   [›]   │
├──────────────────────────────────┤
│                                  │
│  [ تسجيل الخروج ]               │  ← destructive button, full-width
│                                  │
│  AppTabBar  active="account"     │
└──────────────────────────────────┘
```

---

## Section 1 — حسابي (My Account)

### Hero — avatar + identity strip

```
┌──────────────────────────────────┐
│  [Avatar 80px]  اسم المستخدم    │
│                 [chip: ١٢ يوم]   │
└──────────────────────────────────┘
```

- Tap the avatar → opens `AvatarPickerSheet` (bottom sheet)
- No separate "edit profile" button; each field row is independently editable

### Row: الاسم (Name)

- **Default state:** `الاسم · محمد أحمد` + pencil icon
- **Edit state:** pencil tap → row expands inline to an `AppTextInput` with ✓ confirm and ✕ cancel icons
- On confirm: call `accountStore.updateName(value)` → persisted immediately
- Validation: non-empty, max 60 chars (Zod, client-side only)

```
[ الاسم ]  محمد أحمد  [✎]
         ↓ tap ✎
[ الاسم ]  [_____________]  [✓] [✕]
```

### Row: البريد الإلكتروني (Email)

- Displayed read-only (no inline edit — email changes require re-verification)
- Shows masked email: `us***@gmail.com`
- Tap row → shows informational bottom sheet: "لتغيير بريدك تواصل مع الدعم"
- No form needed

### Row: الصورة الشخصية (Avatar)

- Same tap target as tapping the avatar hero (both open `AvatarPickerSheet`)

---

## Component: `AvatarPickerSheet`

A bottom sheet with two tabs: **الأحرف** (letter avatar) and **الرموز** (emoji preset).

```
┌──────────────────────────────────┐
│  اختر صورتك الشخصية            │
│  [ الأحرف ]  [ الرموز ]        │
├──────────────────────────────────┤
│  Tab 1 — الأحرف                 │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ │  ← 6 color swatches
│  │  │ │  │ │  │ │  │ │  │ │  │ │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘ │
│  (first letter of name + color)  │
├──────────────────────────────────┤
│  Tab 2 — الرموز                  │
│  🌿 🌱 🧑‍⚕️ 💪 ⭐ 🎯 🏆 🌸      │  ← preset emoji grid
└──────────────────────────────────┘
```

- No image upload in Phase 1 (avoids Supabase Storage complexity)
- Selection stored as `avatar_config: { type: 'letter' | 'emoji'; value: string; color?: string }`
- Replaces the current `avatar_url` field for now; `avatar_url` string becomes the serialized config

---

## Section 2 — تفضيلات الوجبات (Meal Preferences)

### Row in Account screen

```
[ تفضيلات الوجبات ]  ٣ مفضلة  [›]
```

- Shows count of current favorites
- Tap → `router.push('/(main)/meal-preferences')`

### Screen: `meal-preferences.tsx`

```
┌──────────────────────────────────┐
│  [←]   وجباتي المفضلة           │
├──────────────────────────────────┤
│  الأكثر تسجيلاً                 │  ← section: frequently logged
│  ─────────────────────────────── │
│  [❤] وجبة الأرز بزيت الزيتون    │  ← MealCard with toggle
│  [❤] شوفان مع التمر             │
│  [🤍] عدس بدون ثوم              │
│                                  │
│  إضافة وجبة أخرى                │  ← section: browse all meals
│  ─────────────────────────────── │
│  [ بحث في الوجبات... ]          │
│  [🤍] كشري صحي                  │
│  [🤍] مرق دجاج (بدون ثوم)      │
└──────────────────────────────────┘
```

**Logic:**
1. "الأكثر تسجيلاً" — derived from `userMeals` store: group by `meal_id`, sort desc, take top 10
2. Heart toggle calls `userMealsStore.toggleFavorite(mealItemId)` → updates `MealItemPreference.is_favorite`
3. Search box filters the full meal catalog (from `data/mock` → later from API)
4. Filled heart = `is_favorite: true`; outline heart = not yet favorited

**Props / state — no separate store needed:**
- Read `userMeals` from `useUserMealsStore()`
- Read `mealItemPreferences` from a new `useMealPreferencesStore()`
- `toggleFavorite` action in `useMealPreferencesStore`

---

## Section 3 — الخصوصية والأمان (Security & Privacy)

### Row: رؤية منشوراتي (Post Visibility)

```
رؤية منشوراتي
[ عام ]  [ متابعون فقط ]
```

- Segmented control (two options, styled as pill pair — same pattern as tab pills in Stats screen)
- Values: `'public' | 'followers'`
- Default: `'public'`
- Persisted to `storageService` under `STORAGE_KEYS.POST_VISIBILITY`

### Row: من يستطيع متابعتي (Who Can Follow)

```
من يستطيع متابعتي
[ الجميع ]  [ بموافقتي ]
```

- Values: `'everyone' | 'approved'`
- Default: `'everyone'`
- Persisted to `STORAGE_KEYS.FOLLOW_PERMISSION`

**Phase 1 scope:** these settings are client-side preferences only — they will gate the server queries once the backend supports it. The UI ships now; enforcement is added server-side later.

---

## Section 4 — إعدادات التطبيق (App Settings)

### Row: اللغة (Language)

```
اللغة   [ العربية ]  [ English ]
```

- Segmented toggle
- Calls existing `appStore.setLanguage('ar' | 'en')` — triggers RTL/LTR switch

### Row: المظهر (Theme)

```
المظهر
[ فاتح ]  [ داكن ]  [ تلقائي ]
```

- 3-option segmented control
- Calls `appStore.setTheme('light' | 'dark' | 'system')`

---

## Section 5 — Logout

```
┌──────────────────────────────────┐
│                                  │
│    [ تسجيل الخروج ]              │
│                                  │
└──────────────────────────────────┘
```

- Full-width destructive button (red/error color — `theme.colors.error`)
- Tap → confirmation `Alert.alert` with two options: "تسجيل الخروج" (confirm) / "إلغاء"
- On confirm: `authStore.logout()` → clears all stores → routes to auth

---

## Data Types — additions to `types/index.ts`

```typescript
export type PostVisibility = 'public' | 'followers';
export type FollowPermission = 'everyone' | 'approved';
export type AvatarType = 'letter' | 'emoji';

export interface AvatarConfig {
  type: AvatarType;
  value: string;        // first letter of name OR emoji character
  color?: string;       // bg hex — only for 'letter' type
}

// Extend User:
export interface User {
  id: number;
  subscriber_id: number;
  name: string;
  email: string;                        // ADD
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;   // ADD — replaces avatar_url in Phase 1
  plan_start_date: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  post_visibility: PostVisibility;      // ADD
  follow_permission: FollowPermission;  // ADD
}
```

---

## Storage Keys — additions to `STORAGE_KEYS`

```typescript
POST_VISIBILITY: 'post_visibility',
FOLLOW_PERMISSION: 'follow_permission',
AVATAR_CONFIG: 'avatar_config',
```

---

## Zustand Store — `stores/account.store.ts`

```typescript
interface AccountState {
  isEditingName: boolean;
  draftName: string;
  isSaving: boolean;
  errorMessage: string;

  setDraftName: (value: string) => void;
  startEditName: () => void;
  cancelEditName: () => void;
  confirmEditName: () => Promise<void>;

  updateAvatar: (config: AvatarConfig) => Promise<void>;
  updatePostVisibility: (value: PostVisibility) => Promise<void>;
  updateFollowPermission: (value: FollowPermission) => Promise<void>;

  resetAccount: () => void;
}
```

**Rules:**
- `confirmEditName` validates with Zod, calls `userService.updateName(name)`, then calls `userStore.refreshUser()` to sync the updated name
- `updatePostVisibility` and `updateFollowPermission` persist immediately to `storageService` (no API call in Phase 1)
- `updateAvatar` serializes `AvatarConfig` to `storageService` (and later to the `users` table)

---

## Store — `stores/mealPreferences.store.ts`

```typescript
interface MealPreferencesState {
  preferences: MealItemPreference[];
  isLoading: boolean;
  errorMessage: string;

  initializePreferences: () => Promise<void>;
  toggleFavorite: (mealItemId: number) => Promise<void>;
  resetPreferences: () => void;
}
```

---

## Shared Component: `SettingsRow`

```typescript
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;  // for custom right-side content (toggles, badges)
  destructive?: boolean;
}
```

```
┌──────────────────────────────────┐
│  label             value  [›]    │
└──────────────────────────────────┘
```

- Wraps a `Pressable` with press-opacity feedback
- `destructive` applies `theme.colors.error` to label color
- Separator line drawn between rows by parent section, not by the component itself

---

## Shared Component: `SegmentedToggle`

```typescript
interface SegmentedToggleProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}
```

- Active segment: gradient fill (primary → secondary), white text — same as tab pills
- Inactive: `bg-app-background border border-app-lineSoft`, muted text
- RTL-aware (options render RTL when `isRTL`)

---

## API Layer — `api/account/`

### `api/account/accountApi.ts`
- `updateUserName(userId, name): Promise<void>` → `supabase.from('users').update({ name }).eq('id', userId)`
- `updateAvatarConfig(userId, config): Promise<void>` → `supabase.from('users').update({ avatar_config: config }).eq('id', userId)`
- `updatePrivacySettings(userId, settings): Promise<void>` → future phase

### `api/account/mealPreferencesApi.ts`
- `fetchPreferences(userId): Promise<MealItemPreference[]>`
- `setFavorite(userId, mealItemId, isFavorite): Promise<void>` → upsert into `meal_item_preferences`

---

## Supabase Schema — additions

```sql
-- Add to users table
ALTER TABLE users
  ADD COLUMN avatar_config  JSONB,
  ADD COLUMN post_visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (post_visibility IN ('public', 'followers')),
  ADD COLUMN follow_permission TEXT NOT NULL DEFAULT 'everyone'
    CHECK (follow_permission IN ('everyone', 'approved'));

-- meal_item_preferences (may already exist from meal tracking phase)
CREATE TABLE IF NOT EXISTS meal_item_preferences (
  user_id       BIGINT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  meal_item_id  INT     NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_favorite   BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, meal_item_id)
);

CREATE INDEX idx_meal_pref_user ON meal_item_preferences(user_id);
```

---

## File Checklist

**New files:**
- [ ] `app/(main)/account.tsx`
- [ ] `app/(main)/meal-preferences.tsx`
- [ ] `stores/account.store.ts`
- [ ] `stores/mealPreferences.store.ts`
- [ ] `components/account/SettingsRow.tsx`
- [ ] `components/account/SegmentedToggle.tsx`
- [ ] `components/account/AvatarPickerSheet.tsx`
- [ ] `api/account/accountApi.ts`
- [ ] `api/account/mealPreferencesApi.ts`

**Modified files:**
- [ ] `types/index.ts` — extend `User`, add `AvatarConfig`, `PostVisibility`, `FollowPermission`
- [ ] `api/storage/storageKeys.ts` — add `POST_VISIBILITY`, `FOLLOW_PERMISSION`, `AVATAR_CONFIG`
- [ ] `components/common/AppTabBar.tsx` — account press → `router.replace('/(main)/account')`
- [ ] `app/(main)/_layout.tsx` — register `account` and `meal-preferences` screens
- [ ] `data/mock/index.ts` — extend `MOCK_USER` with new fields

---

## Design Rules

- **No multi-field forms** — every preference is changed by a single tap, toggle, or inline edit
- Name edit is inline (expands in place), not a modal — avoids navigation overhead for a single field
- Logout requires `Alert.alert` confirmation — destructive actions need an extra tap
- `SegmentedToggle` is the primary control for all 2–3 option preferences (language, theme, visibility, follow permission)
- All avatar options are presets (Phase 1) — no camera or photo library access yet
- Privacy changes are optimistic — apply instantly in UI, persist in background
- `AppTabBar` uses `router.replace` for tab switches — account screen included

---

## Phase Roadmap

| Phase | Scope |
|---|---|
| **1 (now)** | Account screen, inline name edit, avatar picker (presets), meal favorites, privacy toggles (client-only), language/theme toggles, logout |
| **2** | Server-enforced privacy settings (RLS update), photo upload for avatar (Supabase Storage), email change flow |
| **3** | Account deletion, data export (GDPR), notifications preferences, subscription/plan management |
