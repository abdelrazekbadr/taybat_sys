# CLAUDE.md — Taybat App

## Project Overview

**Al-Tayebat** is a React Native (Expo) mobile app based on Dr. Diya Al-Awadi's five-zone dietary system for reducing inflammation and restoring biological balance. It is an RTL-first, Arabic-primary application.

**Stack:** React Native 0.81 · Expo 54 · TypeScript (strict) · Zustand · React Native Paper (MD3) · NativeWind v4 · TanStack Query · i18next · react-hook-form + Zod · AsyncStorage

---

## Directory Structure

```
taybat_app/
├── app/                    # Expo Router screens & layouts (UI layer only)
│   ├── _layout.tsx         # Root layout: fonts, theme, i18n, RTL bootstrap
│   ├── (auth)/             # Auth group: onboarding, login, etc.
│   └── index.tsx           # Entry screen
├── api/                    # API + storage layer (no UI/navigation imports)
│   ├── client/             # HTTP clients (fetchyClient via axios)
│   ├── storage/            # AsyncStorage wrapper (storageService, STORAGE_KEYS)
│   └── template/           # Service templates / examples
├── components/
│   └── common/             # Shared UI components (AppText, PrimaryButton, …)
├── core/constants/         # App-wide constants (colors, etc.)
├── hooks/                  # Custom React hooks
├── localization/           # i18next setup, ar.json / en.json translations
├── shared/lib/             # Internal libraries (Fetchy HTTP client)
├── stores/                 # Zustand stores
├── theme/                  # Paper theme builder, tokens, index
├── utils/                  # Pure helper functions
└── _docs/kb/               # Domain knowledge base (dietary guide, AI KB)
```

**Path alias:** `@/` resolves to the project root (configured in `tsconfig.json`).

---

## Architectural Layers — Hard Rules

| Layer | Location | Allowed | Forbidden |
|---|---|---|---|
| **Screens** | `app/**` | UI rendering, user input, reading store state, calling store actions | Direct Supabase calls, business logic, navigation imports in api/ |
| **Stores** | `stores/` | Zustand state, async actions, calling services | Direct Supabase calls, UI imports |
| **Services** | `api/*/` service files | Orchestrate flows, call API modules, map errors | UI logic, navigation imports |
| **API Modules** | `api/*/` non-service files | Wrap Supabase/HTTP calls with typed functions | UI logic, navigation |
| **Utils** | `utils/` | Pure functions: formatting, validation, error mapping | Side effects, imports from stores/api |

---

## Zustand Store Pattern

Every feature store must follow this exact shape:

```typescript
import { create } from 'zustand';

interface FeatureState {
  data: SomeType | null;
  isLoading: boolean;
  errorMessage: string;
  // setters
  setFieldName: (value: string) => void;
  // actions
  initializeFeature: () => Promise<void>;
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
      const result = await featureService.fetch();
      set({ data: result, isLoading: false });
    } catch (error: unknown) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Failed to load',
        isLoading: false,
      });
    }
  },
}));
```

Rules:
- Never use `any` — use `unknown` for external errors and narrow with `instanceof Error`
- Keep screens thin: read state + call actions only
- Persist only what survives app restarts (use `storageService`)
- Include `reset` action for every store
- No temporary UI-only state unless unavoidable

---

## TypeScript Rules

- `strict: true` is enforced — no `any` anywhere
- Use discriminated unions for state machines (auth, onboarding, request status)
- Define shared types in dedicated type files (`types/` when created)
- Handle all async with proper error typing

---

## Theme & Styling

### Color tokens (Tailwind — use these in screens)

```
bg-app-primary        → #10B981 (Emerald)
bg-app-secondary      → #06B6D4 (Teal)
bg-app-navy           → #1e293b
bg-app-background     → #f1f5f9
bg-app-surface        → #ffffff
text-app-text         → #1e293b
text-app-muted        → #475569
```

**Never hardcode hex colors in screens.** Use `app.*` Tailwind tokens or `theme.colors.*` from `useTheme()`.

### Paper theme (dynamic theming in components)

```typescript
import { useTheme } from 'react-native-paper';
const theme = useTheme();
// Use theme.colors.primary, theme.colors.surface, etc.
// For StatusBar: theme.dark ? 'light' : 'dark'
```

### Layout / typography rule

- Use **NativeWind `className`** for layout, spacing, and typography in screens
- Use **`react-native-paper` components** for interactive UI (Button, TextInput, Card, etc.)
- Inline `style` only when `className` cannot achieve the result

---

## Text & Font Components

Cairo is the only font family. **Always use the shared wrappers** — never use raw `<Text>` or `<TextInput>` from react-native.

```tsx
import { AppText, AppTextInput } from '@/components/common/AppText';

// Variants: 'regular' | 'semibold' | 'bold'
<AppText className="text-lg text-app-text">عنوان</AppText>
<AppText variant="bold" className="text-[32px]">كبير</AppText>
<AppTextInput variant="semibold" placeholder="..." />
```

Fonts are loaded once in `app/_layout.tsx` via `useFonts`.

---

## RTL-First Development

Arabic is the **default language**. RTL is the primary layout direction.

- `useAppStore((s) => s.language)` gives `'ar' | 'en'`
- Derive `isRTL = language === 'ar'` and set `text-right` / `text-left` conditionally
- `AppText` / `AppTextInput` handle `writingDirection` automatically
- `I18nManager.forceRTL` is applied at bootstrap in `app/_layout.tsx`
- On Android a reload is triggered when RTL state changes — this is expected

---

## Localization

- i18next with `react-i18next` provider
- Translation files: `localization/translations/ar.json` and `en.json`
- Use `useTranslation()` hook — never hardcode user-facing strings in screens
- Arabic is fallback for untranslated keys

---

## Storage

All persistence goes through `storageService` — never call `AsyncStorage` directly.

```typescript
import { storageService } from '@/api/storage/storageService';
import { STORAGE_KEYS } from '@/api/storage/storageKeys';

await storageService.set(STORAGE_KEYS.LANGUAGE, 'ar');
const lang = await storageService.getString(STORAGE_KEYS.LANGUAGE);
```

Add new keys to `STORAGE_KEYS` constant before use.

---

## Forms

- `react-hook-form` for all forms with full TypeScript typing
- `zod` for schema validation (client-side and server payload)
- Validate before any API call
- Surface validation errors clearly — never silently swallow

---

## Error Handling

- Map all errors to user-friendly messages **at the service layer**
- Stores expose `errorMessage: string` — screens display it
- Never expose raw Supabase/network error text to the user
- Never swallow errors — always set `errorMessage` or throw typed errors

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

Copy `.env.example` to `.env` and fill in:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env` or expose secrets in logs or code.

---

## Domain Context

The app implements Dr. Diya Al-Awadi's **five-zone dietary system**:

| Zone | Color | Frequency |
|---|---|---|
| Safe Protocol | 🟢 Green | Daily — mandatory for severe cases |
| Monitored | 🟡 Yellow | Daily with symptom monitoring |
| Stable Cases | 🟠 Orange | 1–3× per week, boiling required |
| Healthy/Children | 🟣 Purple | Rarely — forbidden for ill patients |
| Forbidden | 🔴 Red | Never — even as an ingredient |

**Red zone absolute prohibitions:** eggs, chicken, garlic, onion, tomato, legumes, white flour, citrus fruits.

Domain knowledge files are in `_docs/kb/`:
- `01_Tayabat_Guide.md` — full Arabic dietary guide
- `02_Tayabat_AI_KnowledgeBase_AR.md` — AI knowledge base
- `Tayabat_Meals_Database_v2.json` — meals database
- `agent_instruction.md` — development instructions
