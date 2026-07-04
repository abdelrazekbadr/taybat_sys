import * as Notifications from 'expo-notifications';
import type { PermissionResponse } from 'expo-modules-core';
import { Alert, Linking, Platform } from 'react-native';

import { createLogger } from '@/lib/logger';
import type { NotificationConfig } from '@/repositories/publicConfig';
import { DEFAULT_NOTIFICATION_CONFIG } from '@/repositories/publicConfig';

const log = createLogger('NotificationService');

// ─── Notification identifiers ────────────────────────────────────────────────
export const NOTIF_IDS = {
  FAST_MONDAY_EVE: 'fast-monday-eve',
  FAST_THURSDAY_EVE: 'fast-thursday-eve',
  MEAL_DAILY: 'meal-daily',
  RATING_PENDING: 'rating-pending',
} as const;

// ─── Android channel ──────────────────────────────────────────────────────────

export async function initNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('taybat-reminders', {
    name: 'تذكيرات الطيبات',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#10B981',
  });
}

// ─── Permission ───────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync() as unknown as PermissionResponse;
  if (existing.granted) return true;

  const result = await Notifications.requestPermissionsAsync() as unknown as PermissionResponse;
  if (!result.granted) {
    Alert.alert(
      'التذكيرات موقوفة',
      'لتفعيل التذكيرات، افتح الإعدادات ومكّن الإشعارات لتطبيق الطيبات.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'فتح الإعدادات', onPress: () => void Linking.openSettings() },
      ],
    );
    return false;
  }
  return true;
}

export async function getNotificationPermissionGranted(): Promise<boolean> {
  const p = await Notifications.getPermissionsAsync() as unknown as PermissionResponse;
  return p.granted;
}

// ─── Fast reminders (Sunday 23:00 + Wednesday 23:00 — local time) ─────────────
// expo-notifications weekday: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
// Notify Sunday (=1) eve for Monday fast; Wednesday (=4) eve for Thursday fast

export async function scheduleFastReminders(config: NotificationConfig = DEFAULT_NOTIFICATION_CONFIG): Promise<void> {
  await cancelFastReminders();
  const { fastReminderHour: hour, fastReminderMinute: minute } = config;

  await Promise.all([
    Notifications.scheduleNotificationAsync({
      identifier: NOTIF_IDS.FAST_MONDAY_EVE,
      content: {
        title: 'تذكير بالصيام',
        body: 'غداً الاثنين ,أعدّ نيتك  الليلة للصيام غدا وعيش بصحة 🌙',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour, minute },
    }),
    Notifications.scheduleNotificationAsync({
      identifier: NOTIF_IDS.FAST_THURSDAY_EVE,
      content: {
        title: 'تذكير بالصيام',
        body: 'غداً الخميس ,أعدّ نيتك  الليلة للصيام غدا وعيش بصحة 🌙',
        sound: true,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 4, hour, minute },
    }),
  ]);
  log.debug('Fast reminders scheduled', { hour, minute });
}

export async function cancelFastReminders(): Promise<void> {
  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.FAST_MONDAY_EVE),
    Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.FAST_THURSDAY_EVE),
  ]);
}

// ─── Meal daily reminder (local time, one-shot — content depends on whether ──
// today's meals are already logged, so it's rescheduled rather than a fixed
// DAILY trigger; re-armed on app foreground/focus and after each meal change)

export async function scheduleMealReminder(
  config: NotificationConfig = DEFAULT_NOTIFICATION_CONFIG,
  hasLoggedMealToday = false,
): Promise<void> {
  await cancelMealReminder();
  const { mealReminderHour: hour, mealReminderMinute: minute } = config;

  const now = new Date();
  const today = new Date(now);
  today.setHours(hour, minute, 0, 0);
  const firesToday = today.getTime() > now.getTime();
  const fireAt = firesToday ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const content = firesToday && hasLoggedMealToday
    ? {
        title: 'أحسنت!',
        body: '👏 أحسنت! سجلت وجباتك اليوم، خطوة جميلة نحو نمط حياة صحي 🌿',
        sound: true,
      }
    : {
        title: 'سجّل وجباتك',
        body: 'لا تنسَ تسجيل وجباتك وراقب صحتك  🍽️',
        sound: true,
      };

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS.MEAL_DAILY,
    content,
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
  log.debug('Meal reminder scheduled', { fireAt: fireAt.toISOString(), congrats: firesToday && hasLoggedMealToday });
}

export async function cancelMealReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.MEAL_DAILY);
}

// ─── Rating one-shot (local time on next_rating_date) ────────────────────────
// DateTrigger fires once at an absolute JS Date. Constructing the Date from
// "YYYY-MM-DDThh:mm:ss" (no timezone suffix) uses the device's local timezone.

export async function scheduleRatingNotification(
  nextRatingDateISO: string,
  config: NotificationConfig = DEFAULT_NOTIFICATION_CONFIG,
): Promise<void> {
  await cancelRatingNotification();

  const { ratingReminderHour: h, ratingReminderMinute: m } = config;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');

  // Local-time Date — no "Z" suffix so the JS Date constructor uses local TZ
  const date = new Date(`${nextRatingDateISO.slice(0, 10)}T${hh}:${mm}:00`);
  if (isNaN(date.getTime())) {
    log.warn('scheduleRatingNotification: invalid date', nextRatingDateISO);
    return;
  }

  // If target is already in the past, fire in 5 minutes
  const fireAt = date.getTime() < Date.now() ? new Date(Date.now() + 5 * 60 * 1000) : date;

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIF_IDS.RATING_PENDING,
    content: {
      title: 'تقييمك الأسبوعي جاهز',
      body: 'حان وقت تقييم أسبوعك الصحي — افتح التطبيق لتبدأ ⭐',
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt },
  });
  log.debug('Rating notification scheduled for', fireAt.toISOString());
}

export async function cancelRatingNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(NOTIF_IDS.RATING_PENDING);
}

// ─── Startup sync ─────────────────────────────────────────────────────────────

export interface SyncOptions {
  fastReminder: boolean;
  mealReminder: boolean;
  ratingReminder: boolean;
  hasLoggedMealToday: boolean;
  nextRatingDateISO: string | null;
  config: NotificationConfig;
}

export async function syncAllNotifications(opts: SyncOptions): Promise<void> {
  // Silent check only — never prompt on app launch. Prompting happens when the
  // user explicitly toggles a reminder ON (via setFastReminder etc.).
  const hasPermission = await getNotificationPermissionGranted();
  if (!hasPermission) return;

  await Promise.all([
    opts.fastReminder
      ? scheduleFastReminders(opts.config)
      : cancelFastReminders(),
    opts.mealReminder
      ? scheduleMealReminder(opts.config, opts.hasLoggedMealToday)
      : cancelMealReminder(),
    opts.ratingReminder && opts.nextRatingDateISO
      ? scheduleRatingNotification(opts.nextRatingDateISO, opts.config)
      : cancelRatingNotification(),
  ]);
}
