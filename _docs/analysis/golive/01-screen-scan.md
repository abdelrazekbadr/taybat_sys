# 01 — App Screen Scan

Scan of `taybat_app/app/**` to verify completeness before go-live. Static checks (`typecheck`, `lint`) and layer discipline were also run.

## Automated health

| Check | Result |
| --- | --- |
| `npm run typecheck` | ✅ Clean (no errors) |
| `npm run lint` | ⚠️ 0 errors, **2 warnings** (see below) |
| Layer discipline (no `@/lib/supabase` imported in `app/**`) | ✅ Clean — screens go through stores/repos |
| `EXPO_PUBLIC_USE_MOCK` | `false` in `.env` (already pointed at real Supabase) |

**Lint warnings to clear:**
- `app/(auth)/login.tsx:90` — `handleFacebook` assigned but never used → Facebook button is wired up but the handler is dead. Decide: ship Facebook login or remove the button. (Facebook OAuth also needs App Review to leave dev mode — see [05](05-google-cloud-firebase.md).)
- `app/(main)/stats.tsx:199` — `useMemo` missing dependency `svgXFor`. Verify the weekly chart renders correctly, then fix or justify.

## Screen inventory

### Auth flow — `app/(auth)/`
| Screen | Status | Notes |
| --- | --- | --- |
| `onboarding.tsx` | ✅ | 4 illustrated slides present. **No privacy/terms consent link** — add before store submission. |
| `login.tsx` | ✅ | Email/password + Google + Facebook. OAuth block gated on `USE_MOCK===false`. Facebook handler unused (see above). |
| `signup.tsx` | ✅ | **No link to Terms/Privacy** on the signup CTA — recommended for Play compliance. |
| `verify-email.tsx` | ✅ | Depends on Supabase email delivery — see SMTP note in [04](04-supabase.md). |
| `reset-password.tsx` / `reset-verify.tsx` / `reset-new-password.tsx` | ✅ | 3-step reset. Depends on email OTP delivery. |
| `complete-profile.tsx` | ✅ | Sets `plan_start_date`. Gate before `(main)`. |

### Main app — `app/(main)/`
| Screen | Status | Notes |
| --- | --- | --- |
| `index.tsx` (home) | ✅ | Weekly progress, today's meals. |
| `select-meal.tsx` / `meal-detail.tsx` / `meal-preferences.tsx` / `meal-history.tsx` | ✅ | Meal flow (max 3/day). |
| `community.tsx` / `user-profile.tsx` / `topics.tsx` / `topic-detail.tsx` | ✅ | Community + library. Realtime love count. |
| `stats.tsx` | ✅ | Weekly chart (lint warning above). |
| `notifications.tsx` | ✅ | In-app notifications feed. |
| `account.tsx` | ✅ | Has **delete account** (`deleteAccount` → `delete_user_account` RPC) at line 368 — good, Play requires an in-app deletion path. **Missing: visible Privacy Policy & Terms links** in account/settings. |

## Missing points (product-level, not blockers unless noted)

1. **Privacy Policy & Terms links inside the app** — none found anywhere (`grep` for privacy/terms/الخصوصية/الشروط returned nothing in `app/`). Add a hosted URL link in: onboarding/signup consent, and account screen. Play Data Safety review checks this. → also a [blocker](02-blockers.md) at the store level.
2. **Account deletion is present in-app** ✅ but Play also wants a **web deletion instructions URL** (`DELETION.md` content must be hosted).
3. **Push notifications are LOCAL only** — no `getExpoPushToken`/FCM device-token registration anywhere. Scheduled reminders (fast, meal, rating) work offline. This is fine for Phase 1; no FCM server key needed. Note it so you don't expect remote/marketing push yet.
4. **Notification permission UX** — `POST_NOTIFICATIONS` runtime prompt is handled (Android 13+). Verify the "open settings" fallback on a real device.
5. **Facebook login** — either finish it (needs Facebook App Review to go public) or hide the button for Phase 1 to avoid a broken/dev-mode-only login path.
6. **Error/empty/offline states** — spot-check community, stats, and meal screens with airplane mode on a real device before submission.

## Recommendation for Phase 1 scope

Ship with **Email/password + Google** sign-in. **Hide Facebook** (and Apple, which is iOS/Phase 2) until their provider reviews are done. This removes two external-review dependencies from the critical path.
