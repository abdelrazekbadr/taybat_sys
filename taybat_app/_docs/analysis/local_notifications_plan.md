# Local Reminder Notifications — Technical Plan

**Date:** 2026-06-14  
**Scope:** Android + iOS local scheduled notifications for the Al-Taybat Expo app

---

## Overview

Three reminder types, all locally scheduled on-device (no server push required):

| # | Reminder | Schedule | Trigger |
|---|---|---|---|
| 1 | Fast reminder (Monday / Thursday) | Sunday 23:00 + Wednesday 23:00 | Weekly recurring |
| 2 | Meal registration reminder | Every day 22:00 | Daily recurring |
| 3 | Weekly rating reminder | When `next_rating_date` arrives | One-shot, rescheduled on each rating |

Each can be independently toggled ON/OFF by the user from the Account screen.

---

## Library Choice — `expo-notifications`

Use **`expo-notifications`** (Expo SDK, not yet installed).

**Why:**
- Part of the official Expo SDK — consistent with the existing `expo-*` stack
- Handles both Android and iOS via a single API
- Supports all three trigger types needed: `WeeklyTrigger`, `DailyTrigger`, `DateTrigger`
- OS-level scheduling: notifications survive app restarts and app being closed — no JS background task needed
- Provides `cancelScheduledNotificationAsync(id)` for toggle-off

**What it is NOT:** This is not Supabase push / FCM. These notifications are entirely local — they do not require a server, internet connection, or notification token.

---

## How the OS Handles Scheduled Notifications

```
app calls scheduleNotificationAsync(trigger)
        ↓
OS registers the trigger (Android: AlarmManager / iOS: UNCalendarNotificationTrigger)
        ↓
At the scheduled time, OS fires the notification
        ↓
Works even if the app is closed or the phone restarted (Android may vary by OEM battery policy)
```

No background JS thread is needed. The Expo app only needs to be opened once after scheduling to hand off the trigger to the OS.

---

## Notification Identifiers

Fixed string IDs allow cancel and reschedule without querying the OS scheduler:

| ID | Notification |
|---|---|
| `fast-monday-eve` | Sunday 23:00 → Monday fast reminder |
| `fast-thursday-eve` | Wednesday 23:00 → Thursday fast reminder |
| `meal-daily` | Daily 22:00 → log today's meals |
| `rating-pending` | One-shot on `next_rating_date` → weekly rating available |

---

## Notification 1 — Fast Reminder (Monday / Thursday)

### Intent
The user fasts on Monday and Thursday following the Islamic Sunnah. We notify them the **night before** at 23:00 so they can prepare (set Suhoor alarm, prepare food, make intention).

### Schedule
- **Sunday 23:00** → reminds of the Monday fast
- **Wednesday 23:00** → reminds of the Thursday fast

### Trigger Type
`WeeklyTriggerInput` — fires every week on the same weekday at the same hour/minute.

In `expo-notifications` weekday numbering: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday.

```
Sunday  = weekday 1, hour 23, minute 0  →  fast-monday-eve
Wednesday = weekday 4, hour 23, minute 0  →  fast-thursday-eve
```

### Behavior
- Toggling ON schedules both IDs (`fast-monday-eve` + `fast-thursday-eve`)
- Toggling OFF cancels both
- If the toggle was already ON when the user opens settings, both are already active — no reschedule needed

---

## Notification 2 — Meal Registration Reminder

### Intent
Remind the user every evening to log the meals they ate today before midnight, when the day resets.

### Schedule
- **Every day at 22:00** (10 PM)

### Trigger Type
`DailyTriggerInput` — fires at the same time every day.

### Behavior
- Toggling ON schedules `meal-daily`
- Toggling OFF cancels `meal-daily`
- This notification is stateless — no need to check whether meals were already logged (simpler, avoids needing background data access)

---

## Notification 3 — Weekly Rating Reminder

### Intent
When a user's `next_rating_date` has arrived (i.e., 7+ days since last rating), the rating screen becomes available. We notify the user once so they know to complete it.

### Schedule
- **One-shot notification** scheduled for `next_rating_date` at **20:00** (8 PM)
- After the user submits a rating, the store sets a new `next_rating_date` (+7 days) — at that point, the notification must be cancelled and rescheduled for the new date

### Trigger Type
`DateTriggerInput` — fires once at an absolute timestamp.

### Scheduling Logic

```
On app launch (if ratingReminder = ON):
  1. Read next_rating_date from useUserStore
  2. If next_rating_date is in the future → schedule notification for that date at 20:00
  3. If next_rating_date is already past AND pendingRating = true → fire immediately
     (or schedule for the next available time + a few minutes)
  4. If pendingRating is already handled (rating was submitted this week) → cancel any pending notification

After submitRating() succeeds:
  1. Cancel 'rating-pending' notification
  2. Read new next_rating_date from store
  3. If ratingReminder = ON → schedule new notification for new next_rating_date at 20:00
```

### Where to Hook the Reschedule
The reschedule logic sits **outside the store** — it's a side effect triggered by `submitRating()` returning `true`. A thin notification service module will export `syncRatingNotification()` which the screen calls after a successful submission.

---

## Notification Content (Arabic)

| ID | Title | Body |
|---|---|---|
| `fast-monday-eve` | تذكير بالصيام | غداً الاثنين — يوم صيام سنة. أعدّ نيتك الليلة 🌙 |
| `fast-thursday-eve` | تذكير بالصيام | غداً الخميس — يوم صيام سنة. أعدّ نيتك الليلة 🌙 |
| `meal-daily` | سجّل وجباتك | لا تنسَ تسجيل وجبات اليوم قبل منتصف الليل 🍽️ |
| `rating-pending` | تقييمك الأسبوعي جاهز | حان وقت تقييم أسبوعك الصحي — افتح التطبيق لتبدأ ⭐ |

---

## Permission Handling

### iOS
- iOS **requires explicit user permission** before showing any notification
- Permission request must happen at runtime (cannot be declared in `app.json` alone)
- **Strategy:** Request permission the first time the user turns ON any toggle
  - If granted → proceed with scheduling
  - If denied → show a dialog explaining how to enable it in iOS Settings → Settings → Al-Taybat → Notifications
- `expo-notifications` provides `requestPermissionsAsync()` which returns the granted status
- Check permission status before scheduling — do not re-request if already granted

### Android
- Android < 13 (API 32): local notifications are auto-granted, no runtime request needed
- Android 13+ (API 33): requires `POST_NOTIFICATIONS` runtime permission
- `expo-notifications` handles this via the same `requestPermissionsAsync()` call
- **Notification Channel (Android 8+):** Must create a channel at app startup, before scheduling anything
  - Channel ID: `taybat-reminders`
  - Name: "تذكيرات الطيبات"
  - Importance: `HIGH` (shows heads-up banner)

---

## Settings Store — `notificationSettings.store.ts`

A new Zustand store, persisted to `AsyncStorage` via `storageService`.

**State shape:**
```
{
  fastReminder: boolean     // default: true
  mealReminder: boolean     // default: true
  ratingReminder: boolean   // default: true
}
```

**Actions:**
```
setFastReminder(enabled: boolean)
setMealReminder(enabled: boolean)
setRatingReminder(enabled: boolean)
```

Each setter:
1. Persists the new value to `storageService` (under a new `STORAGE_KEYS.NOTIFICATION_SETTINGS` key)
2. Calls the appropriate notification service function (`scheduleFastReminder()` or `cancelFastReminder()`, etc.)

**Why persist to storage:** The store resets on app restart. Persisted settings let us re-schedule notifications on every app launch without the user needing to retoggle.

---

## Notification Service Module — `services/notifications/`

A new module (not a store — no UI state here) that wraps `expo-notifications` calls.

**Responsibilities:**
- `initNotificationChannel()` → called once at app startup (Android channel setup)
- `requestNotificationPermission()` → returns `true` if granted
- `scheduleFastReminders()` → schedules `fast-monday-eve` + `fast-thursday-eve`
- `cancelFastReminders()` → cancels both
- `scheduleMealReminder()` → schedules `meal-daily`
- `cancelMealReminder()` → cancels
- `scheduleRatingNotification(nextRatingDate: string)` → cancels existing, schedules new one-shot
- `cancelRatingNotification()` → cancels

This module has no Zustand dependency — stores call it, not the other way around.

---

## App Startup Sync

On every app launch, after the user is authenticated and their profile is loaded, a `syncAllNotifications()` function runs:

```
Read notification settings from storage
  │
  ├─ fastReminder = ON?
  │    └─ scheduleFastReminders()
  │
  ├─ mealReminder = ON?
  │    └─ scheduleMealReminder()
  │
  └─ ratingReminder = ON?
       └─ Read next_rating_date from useUserStore
            └─ scheduleRatingNotification(next_rating_date)
```

**Why needed on every launch:** On iOS, recurring triggers (`WeeklyTrigger`, `DailyTrigger`) persist until explicitly cancelled — they don't need reschedule. But the one-shot rating notification fires and disappears, so after each launch we check and reschedule if needed. The weekly/daily ones are idempotent — scheduling them again when they already exist is safe (`expo-notifications` uses the fixed ID to deduplicate).

---

## Account Screen — Settings UI

A new "التذكيرات" (Reminders) section in `app/(main)/account.tsx`, rendered as three toggle rows below the existing settings:

```
┌─────────────────────────────────────────────┐
│  التذكيرات                                   │
├─────────────────────────────────────────────┤
│  تذكير الصيام (الاثنين والخميس)    [  ●  ]  │
│  تذكير تسجيل الوجبات يومياً        [  ●  ]  │
│  تذكير التقييم الأسبوعي            [●    ]  │
└─────────────────────────────────────────────┘
```

Each row:
- `AppText` for label (RTL, Arabic)
- RN Paper `Switch` (MD3, uses `theme.colors.primary` when active)
- On toggle ON → call `setFastReminder(true)` etc. from `useNotificationSettingsStore`
- The store action handles permission request + scheduling
- If permission is denied, the toggle snaps back to OFF

---

## Edge Cases & Decisions

| Scenario | Decision |
|---|---|
| User disables notifications in OS Settings after enabling them in-app | Next time any toggle is ON and scheduling is attempted, `requestPermissionsAsync` will return `denied`. Show a dialog directing to OS settings. Toggles remain ON in store — this is intentional, as the user may re-enable OS permissions later. |
| App is uninstalled | OS clears all scheduled notifications automatically. |
| User changes timezone | Expo notification triggers use local device time — notifications shift with the timezone automatically. |
| Fast reminder fires but user already broke the fast | Accept this — reminder is educational / intention-setting. No conditional logic needed. |
| Rating notification fires but user already submitted the rating | Cancel the notification on successful `submitRating()` before the notification fires. If it fires anyway (race condition), harmless — user sees it's already done. |
| `next_rating_date` is `null` (new user, no plan_start_date) | Skip scheduling rating notification until `plan_start_date` is set (handled by the same `checkPendingRating` guard already in `userRating.store.ts`). |
| Expo Go vs dev build | `expo-notifications` scheduling does NOT work in Expo Go on iOS (physical device). Requires a **dev build**. Android Expo Go supports it. Ensure team tests on dev builds for iOS notification behavior. |

---

## Implementation Order

1. **Install** `expo-notifications`, configure `app.json` plugin + Android permissions
2. **Create** `services/notifications/` module with all scheduling functions
3. **Create** `notificationSettings.store.ts` + add `NOTIFICATION_SETTINGS` to `STORAGE_KEYS`
4. **Add** `syncAllNotifications()` call in root layout after auth is ready
5. **Hook** `scheduleRatingNotification` into the post-submitRating flow in the rating screen
6. **Add** Reminders section to `account.tsx` with three `Switch` toggles
7. **Test** on Android emulator (API 33) + iOS dev build physical device

---

## What This Plan Does NOT Cover

- **Push notifications from the server** (FCM/APNs) — that's a separate system and requires the Expo push token flow already partially present in `notifications.tsx`
- **Smart suppression** (don't send meal reminder if meals already logged) — not in scope; adds background data access complexity for marginal benefit
- **Notification sound customization** — use system default
- **Snooze or action buttons** on notifications — not in scope
