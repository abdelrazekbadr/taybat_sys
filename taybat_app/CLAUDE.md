# CLAUDE.md — Taybat App

**Al-Tayebat** — RTL-first Arabic Expo app · Dr. Diya Al-Awadi's five-zone dietary system.

**Stack:** RN 0.81 · Expo ~54 · TypeScript strict · Zustand ^5 · RN Paper ^5 (MD3) · NativeWind ^4 · react-hook-form + Zod · @supabase/supabase-js ^2 · lucide-react-native · i18next

---

## Directory Structure

```text
taybat_app/
├── app/             # Expo Router screens (UI only)
│   ├── (auth)/      # login, signup, verify-email, reset-password, complete-profile
│   └── (main)/      # index, select-meal, community, stats, account, user-profile…
├── api/auth/        # authService — auth + profile orchestration
├── api/client/      # supabaseClient, fetchyClient (axios)
├── repositories/    # Interface + Mock + Supabase impls per domain
├── stores/          # Zustand stores + storeReset.ts
├── components/      # common/, auth/, home/, account/, community/
├── hooks/           # useRTL, useThemeMode, useAuthGate
├── shared/errors/   # AppError hierarchy + toUserMessage()
├── shared/storage/  # storageService + STORAGE_KEYS
├── lib/             # createLogger (react-native-logs)
├── localization/    # i18next, ar.json / en.json
├── theme/           # buildPaperTheme, tokens
├── types/           # index.ts (entities), auth.types.ts
└── utils/           # pure helpers
```

**Alias:** `@/` → root.

---

## Layer Rules

| Layer | Location | Allowed | Forbidden |
| --- | --- | --- | --- |
| Screens | `app/**` | UI, store reads/actions | Direct Supabase, business logic |
| Stores | `stores/` | State, async actions, call repos | Direct Supabase, UI imports |
| Services | `api/*/` | Multi-repo orchestration | UI, navigation |
| Repositories | `repositories/*/` | Typed data-source wrappers | UI, navigation, business logic |
| Utils | `utils/` | Pure functions only | Side effects, store/api imports |

**Flow:** Screen → Store → Service (optional) → Repository → Data source

---

## Mock vs Supabase

```text
EXPO_PUBLIC_USE_MOCK=true    # default — mock, no Supabase needed
EXPO_PUBLIC_USE_MOCK=false   # production
```

Each `repositories/[domain]/index.ts` exports a singleton. **Always import the singleton, never the class.**

---

## Zustand Store Pattern

```typescript
export const useFeatureStore = create<FeatureState>((set) => ({
  data: null, isLoading: false, errorMessage: '',

  fetchFeature: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      set({ data: await featureRepository.getItems(), isLoading: false });
    } catch (error: unknown) {
      set({ errorMessage: toUserMessage(error), isLoading: false });
    }
  },

  resetFeature: () => set({ data: null, isLoading: false, errorMessage: '' }),
}));
```

- Never `any` — `unknown` + `toUserMessage(error)` from `@/shared/errors/AppError`
- Every store needs a `reset` action
- Cross-store: `useOtherStore.getState().action()` — never import hooks inside another store
- Full reset: `resetAllAppStores()` from `stores/storeReset.ts`

### Active Stores

| Store | Key state |
| --- | --- |
| `useAuthStore` | `status: AuthStatus`, `user: AuthUser\|null` |
| `useUserStore` | `user: User\|null` |
| `useAppStore` | `language: 'ar'\|'en'`, `isReady` |
| `useThemeStore` | `mode: 'light'\|'dark'\|'system'` |
| `useAccountStore` | draft name, avatarConfig, visibility prefs |
| `useMealsStore` / `useMealItemsStore` | `meals[]` / `mealItems[]` |
| `useMealPreferencesStore` | `favoriteMealIds[]` |
| `useUserMealsStore` | `userMeals[]`, `todayMeals[]` — **max 3/day** |
| `useCommunityStore` | paginated posts, reactions/follows (optimistic) |
| `useWeeklyRatingStore` | `ratings[]`, `pendingRating` (true if 7+ days) |
| `useAuthGateStore` | `isOpen` — drives AuthGateSheet overlay |

---

## Auth Flow

`AuthStatus` = `'idle' | 'initializing' | 'authenticated' | 'guest' | 'unauthenticated' | 'loading' | 'error'`

Routing in root layout: `initializing/idle` → splash · `unauthenticated/error` → login · `authenticated + !profile_completed` → complete-profile · `authenticated + profile_completed` → main · `guest` → main with auth gate.

`plan_start_date` set on `completeProfile()`. Drives days-on-plan and pending-rating logic.

---

## Error Handling

```typescript
import { toUserMessage } from '@/shared/errors/AppError';
set({ errorMessage: toUserMessage(error), isLoading: false });
```

Classes: `NetworkError` · `InvalidCredentialsError` · `EmailAlreadyUsedError` · `EmailConfirmationRequiredError` · `SessionExpiredError` · `NotFoundError` · `ServerError`. All messages in Arabic — never expose raw Supabase errors.

---

## TypeScript

- `strict: true` — no `any`
- Discriminated unions for state machines (`AuthStatus`, `ThemeMode`, `ZoneColor`)
- `meal_item_ids` on `Meal`/`UserMeal` is a **CSV string** — use `.split(',')`
- Zone encoded in item ID: `id % 1000 === zone`

---

## Theme & Styling

**Tailwind tokens — never hardcode hex:**

```text
bg-app-primary → #10B981   bg-app-secondary → #06B6D4   bg-app-navy → #1e293b
bg-app-background → #f1f5f9   bg-app-surface → #fff   text-app-text → #1e293b
```

**Paper theme:** `const theme = useTheme();` → `theme.colors.primary / .surface / .error` · `theme.dark ? 'light' : 'dark'` for StatusBar.

Rules: NativeWind `className` for layout · RN Paper for interactive UI · inline `style` only when needed · Icons: `lucide-react-native` + `MaterialCommunityIcons`

**Asset icons (`OptionSelector`):** static PNG map lives in `utils/iconSources.ts`. To add a new icon — drop the file in `assets/icons/` and add one entry to `ICON_SOURCES`. Pass the name as a plain string shorthand in `OptionItem.icon`:

```tsx
// simple name string — resolves via ICON_SOURCES
{ key: 'male', label: 'ذكر', icon: 'man' }

// full descriptor — needed when tint is required
{ key: 'dish', label: 'طبق', icon: { kind: 'image', name: 'dish', tint: true } }

// lucide icon
{ key: 1, label: 'سيء', icon: { kind: 'lucide', Icon: Frown } }
```

---

## Text & Font

Cairo is the only font. **Never raw `<Text>` or `<TextInput>`.**

```tsx
import { AppText, AppTextInput } from '@/components/common/AppText';
// variants: 'regular' | 'semibold' | 'bold'
<AppText variant="bold" className="text-2xl text-app-text">عنوان</AppText>
```

**`AppTextInput` does NOT forward refs** — `React.forwardRef` causes runtime crash. Use `returnKeyType` + `onSubmitEditing` instead.

---

## RTL

Use `useRTL` — do not implement platform logic manually:

```typescript
const { isRTL, rowDir } = useRTL(); // rowDir: 'row' | 'row-reverse'
<View style={{ flexDirection: rowDir }}>
  <AppText className={isRTL ? 'text-right' : 'text-left'}>...</AppText>
</View>
```

Android: native flip + reload. iOS: native RTL disabled, explicit CSS. `AppText`/`AppTextInput` handle `writingDirection` automatically.

---

## Localization

`const { t } = useTranslation();` — never hardcode strings. Files: `localization/translations/ar.json` + `en.json`. Fallback: English. Switch via `useAppStore.setLanguage()`.

---

## Storage

```typescript
import { storageService } from '@/shared/storage/storageService';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
await storageService.set(STORAGE_KEYS.LANGUAGE, 'ar');
```

Never call `AsyncStorage` directly. Add keys to `STORAGE_KEYS` before use.

---

## Forms

```typescript
const { control, handleSubmit } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
```

Validate before any API call. Add `accessibilityLabel` + `accessibilityHint` on auth screen inputs.

---

## Auth Button Pattern

Inside `(auth)/` use `Pressable` — **not `<PrimaryButton>`**:

```tsx
<Pressable onPress={handleSubmit(onSubmit)} disabled={isLoading}
  style={{ backgroundColor: theme.colors.primary, height: 54, borderRadius: 27,
           alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
  {isLoading
    ? <ActivityIndicator size="small" color="#fff" />
    : <AppText variant="semibold" className="text-[15.5px] text-white">{t('auth.submit')}</AppText>}
</Pressable>
```

---

## Auth Gate & Logging

```typescript
const { requireAuth } = useAuthGate();
requireAuth(() => toggleReaction(postId)); // opens sheet if guest

const log = createLogger('feature'); // from @/lib/logger — never console.log
log.debug('msg'); log.error('fail', err);
```

---

## Commands

```bash
npm run start / ios / android
npm run lint && npm run typecheck   # required before finishing any task
npm run test / format
```

---

## Domain — Five-Zone System

| Zone | Color | Frequency |
| --- | --- | --- |
| 1 | 🟢 Safe Protocol | Daily, mandatory for severe cases |
| 2 | 🟡 Monitored | Daily with symptom monitoring |
| 3 | 🟠 Stable Cases | 1–3×/week, boiling required |
| 4 | 🟣 Healthy/Children | Rarely — forbidden for ill patients |
| 5 | 🔴 Forbidden | Never, even as ingredient |

Zone in item ID: `id % 1000`. Use `dominantZoneFromMealItemIds()` (meals store) for CSV of IDs. Hard limit: **3 meals/day**. Rating pending if 7+ days since `plan_start_date` or last rating.

**Red zone:** eggs · chicken · garlic · onion · tomato · legumes · white flour · citrus.

Domain KB: `_docs/kb/` — dietary guide, AI KB, meals database.
