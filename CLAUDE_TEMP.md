# CLAUDE.md — Taybat App

## Project Overview

**Al-Tayebat** is a React Native (Expo) mobile app based on Dr. Diya Al-Awadi's five-zone dietary system for reducing inflammation and restoring biological balance. It is an RTL-first, Arabic-primary application.

**Stack:** React Native 0.81.5 · Expo ~54.0.25 · TypeScript ~5.9.2 (strict) · Zustand ^5.0.8 · React Native Paper ^5.15.1 (MD3) · NativeWind ^4.2.1 · TanStack Query ^5.90.7 · i18next ^25.6.0 · react-hook-form ^7.58.1 · Zod ^4.3.6 · @supabase/supabase-js ^2.52.0 · lucide-react-native ^1.14.0

---

## Directory Structure

```text
taybat_app/
├── app/                    # Expo Router screens & layouts (UI layer only)
│   ├── _layout.tsx         # Root layout: providers, fonts, theme, i18n, RTL, auth guard
│   ├── (auth)/             # Auth group: onboarding, login, signup, verify-email,
│   │                       #   reset-password, complete-profile
│   └── (main)/             # Main tabs: index, select-meal, meal-detail, community,
│                           #   stats, account, meal-preferences, user-profile, topics
├── api/                    # High-level service orchestration
│   ├── auth/               # authService — coordinates auth + profile flows
│   └── client/             # fetchyClient (axios wrapper), supabaseClient
├── repositories/           # Data access layer (Interface + Mock + Supabase impls)
│   ├── auth/               # IAuthRepository, mock, supabase
│   ├── userProfile/        # IUserProfileRepository, mock, supabase
│   ├── account/            # IAccountRepository, mock, supabase
│   ├── meals/              # IMealRepository, mock, supabase
│   ├── tracking/           # ITrackingRepository, mock, supabase
│   ├── community/          # ICommunityRepository, mock, supabase
│   └── ratings/            # IRatingRepository, mock, supabase
├── stores/                 # Zustand stores (one per feature)
│   └── storeReset.ts       # resetAllAppStores() — orchestrated full reset
├── components/
│   ├── common/             # AppText, AppTextInput, PrimaryButton, AppTabBar,
│   │                       #   StarRating, StepIndicator, SelectionModal, ChipSelector
│   ├── auth/               # ProfileStepBasic/Health/Goals, OtpInput,
│   │                       #   SocialAuthButtons, AuthGateSheet
│   ├── home/               # HomeHeader, CommitmentCard, TodayMealRow, BadgeProgressCard
│   ├── account/            # AvatarPickerSheet, SettingsRow, SegmentedToggle
│   └── community/          # PostCard, CommunityStatsTab, EmptyFeed
├── hooks/                  # useRTL, useThemeMode, useAuthGate
├── shared/
│   ├── errors/             # AppError hierarchy (toUserMessage helper)
│   └── storage/            # storageService + STORAGE_KEYS
├── lib/                    # logger (react-native-logs, namespaced)
├── localization/           # i18next setup, ar.json / en.json
├── theme/                  # buildPaperTheme, buildNavigationTheme, tokens
├── types/                  # index.ts (entities), auth.types.ts
├── utils/                  # statsUtils and other pure helpers
└── _docs/kb/               # Domain knowledge base
```

**Path alias:** `@/` resolves to the project root (configured in `tsconfig.json`).

---

## Architectural Layers — Hard Rules

| Layer                  | Location            | Allowed                                                  | Forbidden                            |
| ---------------------- | ------------------- | -------------------------------------------------------- | ------------------------------------ |
| **Screens**      | `app/**`          | UI rendering, store reads/actions                        | Direct Supabase, business logic      |
| **Stores**       | `stores/`         | Zustand state, async actions, calling services/repos     | Direct Supabase, UI imports          |
| **Services**     | `api/*/`          | Orchestrate multi-repo flows, map errors                 | UI logic, navigation                 |
| **Repositories** | `repositories/*/` | Wrap data source (Mock or Supabase) with typed functions | UI logic, navigation, business logic |
| **Utils**        | `utils/`          | Pure functions only                                      | Side effects, stores/api imports     |

**Data flow:** Screen → Store action → Service (optional) → Repository → Data source

---

## Mock vs. Supabase Mode

The app runs in **mock mode by default**. This is controlled by:

```
EXPO_PUBLIC_USE_MOCK=true   # default — no Supabase needed
EXPO_PUBLIC_USE_MOCK=false  # production — real Supabase
```

Each repository domain has a factory at `repositories/[domain]/index.ts` that exports a singleton:

- Mock mode → uses in-memory data + `storageService` for persistence
- Supabase mode → real DB calls

**Never bypass this factory.** Always import the repository instance, not the class directly.

---

## Repository Pattern

Every data domain follows this contract:

```typescript
// repositories/feature/IFeatureRepository.ts
export interface IFeatureRepository {
  getItems(userId: string): Promise<FeatureItem[]>;
  saveItem(payload: CreateFeaturePayload): Promise<FeatureItem>;
}

// repositories/feature/index.ts  (factory)
import { FeatureRepositoryMock } from './FeatureRepositoryMock';
import { FeatureRepositorySupabase } from './FeatureRepositorySupabase';

const useMock = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
export const featureRepository: IFeatureRepository = useMock
  ? new FeatureRepositoryMock()
  : new FeatureRepositorySupabase();
```

---

## Zustand Store Pattern

Every feature store must follow this exact shape:

```typescript
import { create } from 'zustand';

interface FeatureState {
  data: SomeType | null;
  isLoading: boolean;
  errorMessage: string;
  setFieldName: (value: string) => void;
  fetchFeature: () => Promise<void>;
  submitFeature: () => Promise<boolean>;
  resetFeature: () => void;
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  data: null,
  isLoading: false,
  errorMessage: '',

  setFieldName: (value) => set({ fieldName: value }),

  fetchFeature: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const result = await featureRepository.getItems(userId);
      set({ data: result, isLoading: false });
    } catch (error: unknown) {
      set({
        errorMessage: toUserMessage(error),
        isLoading: false,
      });
    }
  },

  resetFeature: () => set({ data: null, isLoading: false, errorMessage: '' }),
}));
```

Rules:

- Never use `any` — use `unknown` for errors, narrow with `instanceof Error` or `toUserMessage()`
- Every store must have a `resetFeature` action
- Screens stay thin: read state + call actions only
- **Cross-store coordination:** use `useOtherStore.getState().action()` to avoid circular imports — do NOT import store hooks inside other stores' logic
- All 12 stores are exported from `stores/index.ts`
- Full app reset: call `resetAllAppStores()` from `stores/storeReset.ts`

### Active Stores

| Store                       | Key State                                          | Notes                                |
| --------------------------- | -------------------------------------------------- | ------------------------------------ |
| `useAuthStore`            | `status` (AuthStatus), `user` (AuthUser\|null) | Drives auth guard in root layout     |
| `useUserStore`            | `user` (User\|null)                              | Populated by auth store on login     |
| `useAppStore`             | `language`, `isReady`                          | Persists language preference         |
| `useThemeStore`           | `mode` (ThemeMode)                               | Persists to storage                  |
| `useAccountStore`         | editing state, avatarConfig, visibility prefs      | Uses accountRepository               |
| `useMealsStore`           | `meals` array                                    | Initializes from mealRepository      |
| `useMealItemsStore`       | `mealItems` array                                | Initializes from mealRepository      |
| `useMealPreferencesStore` | `favoriteMealIds`                                | Toggles via accountRepository        |
| `useUserMealsStore`       | `userMeals`, `todayMeals`                      | **Hard limit: 3 meals/day**    |
| `useCommunityStore`       | `posts` (paginated), reactions, follows          | Optimistic updates on toggle         |
| `useWeeklyRatingStore`    | `ratings`, `pendingRating`                     | Pending if 7+ days since last rating |
| `useAuthGateStore`        | `isOpen`                                         | Controls AuthGateSheet overlay       |

---

## Auth Flow

`AuthStatus` discriminated union drives all routing decisions in root layout:

```typescript
type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'guest'
                | 'unauthenticated' | 'loading' | 'error';
```

Routing logic:

- `initializing` / `idle` → show splash
- `unauthenticated` / `error` → redirect to `(auth)/login`
- `authenticated` + `profile_completed: false` → redirect to `(auth)/complete-profile`
- `authenticated` + `profile_completed: true` → allow `(main)`
- `guest` → allow `(main)` with auth gate on protected actions

Profile completion is set automatically on `completeProfile()` and sets `plan_start_date` to the current ISO date.

---

## Error Handling

### AppError Hierarchy (`shared/errors/AppError.ts`)

```typescript
import { toUserMessage } from '@/shared/errors/AppError';

// In stores — always use toUserMessage() for error extraction
set({ errorMessage: toUserMessage(error), isLoading: false });
```

Available error classes:

- `NetworkError`, `InvalidCredentialsError`, `EmailAlreadyUsedError`
- `EmailConfirmationRequiredError`, `SessionExpiredError`
- `NotFoundError`, `ServerError`

All error messages are in Arabic. Never expose raw Supabase/network error text to the user.

---

## TypeScript Rules

- `strict: true` enforced — no `any` anywhere
- Use discriminated unions for state machines (see `AuthStatus`, `ThemeMode`)
- Shared entity types live in `types/index.ts`; auth-specific in `types/auth.types.ts`
- Handle all async with proper error typing (`unknown` + `toUserMessage`)

### Key Types

```typescript
// Meal zones (1 = safest, 5 = forbidden)
type ZoneColor = 1 | 2 | 3 | 4 | 5;

// meal_item_ids and meal_item_ids on UserMeal are CSV strings, not arrays
// e.g. "101,205,340" — use split(',') to work with them
type Meal = { id: string; name: string; meal_item_ids: string; dominant_zone: ZoneColor; ... };
type UserMeal = { id: string; user_id: string; meal_id: string; meal_item_ids: string; date: string; ... };
```

---

## Theme & Styling

### Token System (`theme/tokens.ts`)

```
brand: { emerald, emeraldDark, emeraldSoft, teal, tealDark, navy, white, grays, gold, rose, purple, orange }
spacing: { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }
radius: { sm:8, md:12, lg:16, xl:20 }
elevation: { level0–level3 } (0, 1, 3, 6)
```

### Tailwind Color Tokens (use in screens)

```
bg-app-primary        → brand.emerald (#10B981)
bg-app-secondary      → brand.teal (#06B6D4)
bg-app-navy           → #1e293b
bg-app-background     → #f1f5f9
bg-app-surface        → #ffffff
text-app-text         → #1e293b
text-app-muted        → #475569
```

**Never hardcode hex colors.** Use `app.*` Tailwind tokens or `theme.colors.*` from `useTheme()`.

### Paper Theme

```typescript
import { useTheme } from 'react-native-paper';
const theme = useTheme();
// theme.colors.primary, theme.colors.surface, theme.colors.error
// StatusBar: theme.dark ? 'light' : 'dark'
```

Both Paper theme and Navigation theme are built from the same token set in `theme/index.ts`.

### Layout Rule

- **NativeWind `className`** for layout, spacing, typography
- **React Native Paper components** for interactive UI (Button, TextInput, Card, Chip, etc.)
- **Inline `style`** only when `className` cannot achieve the result (e.g., dynamic values)
- **Icons:** `lucide-react-native` for product icons; `MaterialCommunityIcons` via Paper's icon system

---

## Text & Font Components

Cairo is the only font family. **Always use the shared wrappers.**

```tsx
import { AppText, AppTextInput } from '@/components/common/AppText';

// Variants: 'regular' | 'semibold' | 'bold'
<AppText className="text-lg text-app-text">عنوان</AppText>
<AppText variant="bold" className="text-[32px]">كبير</AppText>
<AppTextInput variant="semibold" placeholder="..." />
```

- Never use raw `<Text>` or `<TextInput>` from react-native
- `AppText` sets `allowFontScaling: false` and handles `writingDirection` for RTL automatically
- **`AppTextInput` does NOT forward refs** — do not wrap with `React.forwardRef` (causes runtime crash). Use `returnKeyType` + `onSubmitEditing` instead of programmatic focus.

---

## RTL-First Development

Arabic is the **default language**. RTL handling is **platform-specific**:

| Platform | RTL Strategy                                                |
| -------- | ----------------------------------------------------------- |
| Android  | Native RTL flip via `I18nManager.forceRTL()` + app reload |
| iOS      | Native RTL disabled; explicit `flex-row-reverse` via CSS  |

Use the `useRTL` hook instead of implementing this manually:

```tsx
import { useRTL } from '@/hooks/useRTL';

const { isRTL, rowDir } = useRTL();
// rowDir = 'row' | 'row-reverse'

<View style={{ flexDirection: rowDir }}>
  <AppText className={isRTL ? 'text-right' : 'text-left'}>...</AppText>
</View>
```

- `useAppStore((s) => s.language)` gives `'ar' | 'en'`
- `AppText` / `AppTextInput` handle `writingDirection` automatically
- Language switching triggers RTL update + re-render (Android reload expected)

---

## Localization

```typescript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
<AppText>{t('feature.key')}</AppText>
```

- i18next with `react-i18next`; device language detected via `expo-localization`
- Translation files: `localization/translations/ar.json` and `en.json`
- **Fallback language: English** (ar.json is the primary, en.json is fallback)
- Never hardcode user-facing strings in screens
- `interpolation: { escapeValue: false }` — safe to embed simple tags in translation values

---

## Storage

All persistence goes through `storageService` — never call `AsyncStorage` directly.

```typescript
import { storageService } from '@/shared/storage/storageService';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';

await storageService.set(STORAGE_KEYS.LANGUAGE, 'ar');
const lang = await storageService.getString(STORAGE_KEYS.LANGUAGE);
```

- Platform-aware: uses `AsyncStorage` on native, `localStorage` on web
- Auto JSON serialization/deserialization
- Add new keys to `STORAGE_KEYS` before use

---

## Forms

```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });
type FormData = z.infer<typeof schema>;

const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

- `react-hook-form` for all forms with full TypeScript typing
- `zod` for schema validation — validate before any API call
- Surface validation errors clearly — never silently swallow
- Add `accessibilityLabel` and `accessibilityHint` to all inputs in auth screens

---

## Auth Screen Button Pattern

**Do NOT use `<PrimaryButton>` inside auth screens** — use inline `Pressable`:

```tsx
import { ActivityIndicator, Pressable } from 'react-native';

<Pressable
  onPress={handleSubmit(onSubmit)}
  disabled={isLoading}
  style={{
    backgroundColor: theme.colors.primary,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isLoading ? 0.7 : 1,
  }}
>
  {isLoading ? (
    <ActivityIndicator size="small" color="#ffffff" />
  ) : (
    <AppText variant="semibold" className="text-[15.5px] text-white">
      {t('auth.submit')}
    </AppText>
  )}
</Pressable>
```

`PrimaryButton` uses `alignSelf: 'stretch'` which does not fill container width reliably inside auth card layouts.

---

## Auth Gate Hook

Use `useAuthGate` to guard protected actions (requires login):

```typescript
import { useAuthGate } from '@/hooks/useAuthGate';

const { requireAuth } = useAuthGate();

// Wraps an action — opens AuthGateSheet if user is guest, runs action if authenticated
requireAuth(() => {
  toggleReaction(postId);
});
```

---

## Logging

```typescript
import { createLogger } from '@/lib/logger';
const log = createLogger('feature-name');

log.debug('Fetching items');
log.error('Failed to load', error);
```

- `react-native-logs` — namespaced, async transport
- Dev: `debug` severity; Prod: `error` severity
- Never use `console.log` in screens or stores

---

## Commands

```bash
npm run start        # Start Expo dev server
npm run ios          # iOS simulator
npm run android      # Android emulator
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Jest
npm run format       # Prettier
```

**Before finishing any task:** run `npm run lint` and `npm run typecheck`.

---

## Environment Variables

```
EXPO_PUBLIC_USE_MOCK=true        # default — mock mode (no Supabase needed)
EXPO_PUBLIC_USE_MOCK=false       # production — real Supabase
SUPABASE_URL=https://mbbbdhyhtqkxakmblzmk.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

Never commit `.env` or expose secrets in logs or code.

---

## Domain Context

The app implements Dr. Diya Al-Awadi's **five-zone dietary system**:

| Zone             | Color         | Frequency                            |
| ---------------- | ------------- | ------------------------------------ |
| Safe Protocol    | 🟢 Green (1)  | Daily — mandatory for severe cases  |
| Monitored        | 🟡 Yellow (2) | Daily with symptom monitoring        |
| Stable Cases     | 🟠 Orange (3) | 1–3× per week, boiling required    |
| Healthy/Children | 🟣 Purple (4) | Rarely — forbidden for ill patients |
| Forbidden        | 🔴 Red (5)    | Never — even as an ingredient       |

**Zone encoding:** A meal item's zone is encoded in its ID (`id % 1000 = zone`). Use `dominantZoneFromMealItemIds()` from `stores/meals.store.ts` to compute a meal's dominant zone from a CSV of meal item IDs.

**Red zone absolute prohibitions:** eggs, chicken, garlic, onion, tomato, legumes, white flour, citrus fruits.

**Meal tracking:** Hard limit of **3 meals per day** per user, enforced in `useUserMealsStore.logMeal()`.

**Weekly rating:** Triggered when 7+ days have passed since `plan_start_date` or the last submitted rating. `plan_start_date` is set automatically on profile completion.

Domain knowledge files in `_docs/kb/`:

- `taybat_app/_docs/kb/altayebaat-system-book`.md
