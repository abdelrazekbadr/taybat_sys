import { create } from 'zustand';

import { createLogger } from '@/lib/logger';
import type { NotificationConfig } from '@/repositories/publicConfig';
import { DEFAULT_NOTIFICATION_CONFIG, publicConfigRepository } from '@/repositories/publicConfig';
import {
  cancelFastReminders,
  cancelMealReminder,
  cancelRatingNotification,
  getNotificationPermissionGranted,
  requestNotificationPermission,
  scheduleFastReminders,
  scheduleMealReminder,
  scheduleRatingNotification,
} from '@/services/notifications';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import { toUserMessage } from '@/shared/errors/AppError';

import { useUserStore } from './user.store';

const log = createLogger('NotificationSettingsStore');

interface NotificationToggles {
  fastReminder: boolean;
  mealReminder: boolean;
  ratingReminder: boolean;
}

const DEFAULT_TOGGLES: NotificationToggles = {
  fastReminder: true,
  mealReminder: true,
  ratingReminder: true,
};

interface NotificationSettingsState extends NotificationToggles {
  isLoaded: boolean;
  config: NotificationConfig;

  loadSettings: () => Promise<void>;
  loadConfig: () => Promise<void>;
  setFastReminder: (enabled: boolean) => Promise<void>;
  setMealReminder: (enabled: boolean, hasLoggedMealToday: boolean) => Promise<void>;
  setRatingReminder: (enabled: boolean) => Promise<void>;
  refreshMealReminder: (hasLoggedMealToday: boolean) => Promise<void>;
  resetNotificationSettings: () => void;
}

async function persistToggles(patch: Partial<NotificationToggles>): Promise<void> {
  const current =
    (await storageService.get<NotificationToggles>(STORAGE_KEYS.NOTIFICATION_SETTINGS)) ??
    DEFAULT_TOGGLES;
  await storageService.set(STORAGE_KEYS.NOTIFICATION_SETTINGS, { ...current, ...patch });
}

export const useNotificationSettingsStore = create<NotificationSettingsState>((set, get) => ({
  ...DEFAULT_TOGGLES,
  isLoaded: false,
  config: DEFAULT_NOTIFICATION_CONFIG,

  loadSettings: async () => {
    try {
      const saved = await storageService.get<NotificationToggles>(STORAGE_KEYS.NOTIFICATION_SETTINGS);
      if (saved) set({ ...saved, isLoaded: true });
      else set({ isLoaded: true });
    } catch (error: unknown) {
      log.warn('loadSettings failed', toUserMessage(error));
      set({ isLoaded: true });
    }
  },

  loadConfig: async () => {
    try {
      const config = await publicConfigRepository.getNotificationConfig();
      set({ config });
      log.debug('Notification config loaded from Supabase');
    } catch (error: unknown) {
      log.warn('loadConfig failed — using defaults', toUserMessage(error));
    }
  },

  setFastReminder: async (enabled) => {
    set({ fastReminder: enabled });
    await persistToggles({ fastReminder: enabled });
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          set({ fastReminder: false });
          await persistToggles({ fastReminder: false });
          return;
        }
        await scheduleFastReminders(get().config);
      } else {
        await cancelFastReminders();
      }
    } catch (error: unknown) {
      log.error('setFastReminder error', toUserMessage(error));
    }
  },

  setMealReminder: async (enabled, hasLoggedMealToday) => {
    set({ mealReminder: enabled });
    await persistToggles({ mealReminder: enabled });
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          set({ mealReminder: false });
          await persistToggles({ mealReminder: false });
          return;
        }
        await scheduleMealReminder(get().config, hasLoggedMealToday);
      } else {
        await cancelMealReminder();
      }
    } catch (error: unknown) {
      log.error('setMealReminder error', toUserMessage(error));
    }
  },

  setRatingReminder: async (enabled) => {
    set({ ratingReminder: enabled });
    await persistToggles({ ratingReminder: enabled });
    try {
      if (enabled) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          set({ ratingReminder: false });
          await persistToggles({ ratingReminder: false });
          return;
        }
        const nextDate = useUserStore.getState().user?.next_rating_date ?? null;
        if (nextDate) await scheduleRatingNotification(nextDate, get().config);
      } else {
        await cancelRatingNotification();
      }
    } catch (error: unknown) {
      log.error('setRatingReminder error', toUserMessage(error));
    }
  },

  // Re-arms the meal reminder with up-to-date content (reminder vs. congrats)
  // whenever today's logged meals change. No-op if the toggle is off or
  // permission isn't granted — never prompts.
  refreshMealReminder: async (hasLoggedMealToday) => {
    const { mealReminder, config } = get();
    if (!mealReminder) return;
    try {
      const granted = await getNotificationPermissionGranted();
      if (!granted) return;
      await scheduleMealReminder(config, hasLoggedMealToday);
    } catch (error: unknown) {
      log.warn('refreshMealReminder failed', toUserMessage(error));
    }
  },

  resetNotificationSettings: () =>
    set({ ...DEFAULT_TOGGLES, isLoaded: false, config: DEFAULT_NOTIFICATION_CONFIG }),
}));
