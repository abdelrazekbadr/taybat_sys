# AI Agent Rules & Instructions — Al‑Taybat (React Native)

This document defines the rules an AI coding agent must follow when developing the Al‑Tayebat mobile app. It is optimized for consistent code quality, security, and a scalable architecture.
project root folder name is "taybat_app"
website nexjs js folder name is "taybat_web" for future use not now

---

## 1) Project Context (Non‑Negotiables)

- **Platform**: React Native (iOS + Android)
- **Language**: TypeScript (strict)
- **Backend**: Supabase (Auth + Postgres + Realtime)
- **State**: Zustand (persist where needed)
- **UI**: react-native-paper (theme-driven UI)
- **Navigation**: React Navigation
- **Localization**: i18n-js, **Arabic RTL-first**
- **Forms/Validation**: react-hook-form + zod

---

## 2) Architectural Rules

### Layer boundaries (must not be violated)

- **Screens (UI layer)**: render UI, gather user input, call store actions/service methods, display loading/errors.
- **Stores (Zustand layer)**: hold app state, expose typed actions/selectors, persist only what is required.
- **Services (Business logic)**: orchestrate flows, apply business rules, call API modules, map errors to app-friendly messages.
- **API modules (Supabase client layer)**: contain Supabase calls only, no UI logic, no navigation.
- **Utils**: pure helpers (formatting, validation helpers, error mapping).

### “No cross-wiring” rules

- UI must not call Supabase directly.
- API modules must not import screens or navigation.
- Stores should not import screens; if needed, stores may be updated by services.
- Do not introduce circular dependencies (especially store ↔ service ↔ api).

---

## 3) Folder/Module Conventions

Follow the project structure from the technical plan:

- `src/screens/*` — screen components (and optional `*.styles.ts`, `*.test.tsx`)
- `src/navigation/*` — navigators + typed route params
- `src/store/*` — Zustand stores + `index.ts` exports
- `src/services/*` — business logic services + `index.ts` exports
- `src/api/*` — `supabaseClient.ts` and API modules (auth/user/meals/analytics)
- `src/localization/*` — i18n setup + translations
- `src/types/*` — shared types (no `any`)
- `src/utils/*` — validation, formatting, error handling utilities
- `src/theme/*` or `src/styles/*` — tokens + theme builders (light/dark/system)

Exports:

- Keep barrel exports small and intentional; avoid wildcard exports if they hide cycles.

---

## 4) Theming & RTL Rules (UI Quality)

### Theme-driven UI only

- Do not hardcode brand colors in screens/components.
- All colors/spacing/typography must be consumed from the theme/token layer.
- Support **Light / Dark / System** mode and allow runtime switching.

### Brand tokens (must be reflected in theme)

- Emerald: `#10B981` (alt `#059669`)
- Teal: `#06B6D4` (alt `#0891B2`)
- Deep Navy: `#1e293b`
- Light backgrounds: `#ffffff`, `#f1f5f9`
- Dark mode: bg `#0f172a`, surface `#1e293b`, text `#f1f5f9`, text2 `#cbd5e1`
- Accents: Gold `#f59e0b`, Orange `#fb923c`, Rose `#fb7185`, Purple `#a78bfa`

### RTL-first constraints

- Assume Arabic strings are primary and UI must look correct in RTL.
- Always validate alignment, icon direction, and back navigation gestures in RTL.
- Avoid layouts that break when text is longer (Arabic often expands).

---

## 5) TypeScript & Code Quality Rules

### Strict typing

- No `any`. If uncertain, define a type and refine later.
- Use discriminated unions for state machines (auth/onboarding/requests).
- Prefer `unknown` over `any` for external errors, then narrow safely.

### Error handling

- Every async call must handle:
  - network failure
  - server errors
  - validation errors
  - “no session / expired session”
- Errors must be mapped to user-friendly messages at the service layer.
- Never swallow errors silently; return typed error results or throw typed errors consistently.

### No sensitive data

- No credentials in code.
- Supabase URL and keys must come from environment config (and `.env.example` contains placeholders only).
- Never log tokens, anon keys, or full session objects.

---

## 6) Supabase Rules

- Centralize client creation in `src/api/supabaseClient.ts`.
- Use an auth state listener to react to session changes (and update stores).
- Use a single “health check” style function to validate connectivity without exposing secrets.
- Prefer explicit, typed API module functions (authApi/userApi/mealsApi/analyticsApi) over scattered calls.

---

## 7) Zustand Rules

- Stores must expose:
  - typed state
  - typed actions
  - reset method
- Persist only what is required (e.g., auth token, minimal user identity, theme mode).
- Keep async orchestration in services; stores should remain predictable and testable.

Recommended pattern:

- `useXStore` for raw store
- `useX()` hooks to expose a friendly slice for screens

---

## 8) Forms & Validation Rules

- Use `react-hook-form` for forms.
- Use `zod` schemas for validation (input + server payload constraints).
- Validate before API calls; never rely on UI-only validation.

---

## 9) Testing & Verification Rules

- Add unit tests for pure utilities and services where logic is non-trivial.
- Add integration tests for critical flows (auth + onboarding + profile completion).
- E2E tests (Detox) are required for the happy path once screens exist:
  - first launch → onboarding → sign up/login → complete profile → main app

Every change should be verified via:

- TypeScript checks (no type errors)
- linting/formatting rules
- tests when logic is impacted

---

## 10) Performance & UX Rules

- Always show loading states for async operations.
- Avoid unnecessary rerenders: select store slices, memoize expensive calculations.
- Prefer list virtualization patterns for long lists.
- Keep animations subtle and performant; do not block JS thread with heavy work.

---

## 11) Accessibility Rules

- Respect dynamic text scaling where practical.
- Ensure contrast in dark mode.
- Label important interactive elements for screen readers.

---

## 12) Output Contract for AI Agent (How to Deliver Work)

When implementing any task:

- Follow the task file’s structure and do not expand scope beyond the task.
- Keep code consistent with existing conventions (imports, naming, folder placement).
- Provide:
  - what changed (files + purpose)
  - how it matches architecture rules
  - how it was verified (types/lint/tests)

---

## 13) Quick Review Checklist (Before Marking a Task “Done”)

- [ ] No secrets in code or logs
- [ ] No `any` types
- [ ] Errors handled and surfaced appropriately
- [ ] Theme/token usage (no hardcoded brand colors in screens)
- [ ] RTL layout verified conceptually (alignment, spacing, text expansion)
- [ ] Store/service/api boundaries respected
- [ ] Dependencies updated if task sequencing changed
- [ ] Minimal tests added where logic is introduced
