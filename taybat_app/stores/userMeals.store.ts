import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { trackingRepository } from '@/repositories/tracking';
import { toUserMessage } from '@/shared/errors/AppError';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import type { HungryState, UserMeal } from '@/types';
import { FASTING_MEAL_CODE } from '@/utils/constants';
import { localDateISO } from '@/utils/dateUtils';

import { useMealsStore } from './meals.store';
import { useMembershipStore } from './membership.store';
import { useNotificationSettingsStore } from './notificationSettings.store';
import { isOnline } from './network.store';
import { useUserStore } from './user.store';
import { persistJSONStorage } from './_persist';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface UserMealsState {
  userMeals: UserMeal[];
  todayMeals: UserMeal[];
  isLoading: boolean;
  errorMessage: string;
  lastFetchedAt: number | null;
  initializeUserMeals: (force?: boolean) => Promise<void>;
  refreshTodayMeals: () => void;
  logMeal: (
    mealId: number,
    hungryState?: HungryState | null,
  ) => Promise<boolean>;
  replaceMeal: (userMealId: number, mealId: number) => Promise<boolean>;
  deleteMeal: (id: number) => Promise<boolean>;
  getMealsByDate: (date: string) => UserMeal[];
  resetUserMeals: () => void;
}

const initialState = {
  userMeals: [] as UserMeal[],
  todayMeals: [] as UserMeal[],
  isLoading: false,
  errorMessage: '',
  lastFetchedAt: null as number | null,
};

const todayIsoDate = () => localDateISO();

export const useUserMealsStore = create<UserMealsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeUserMeals: async (force = false) => {
        const { lastFetchedAt, userMeals: cached } = get();
        if (
          !force &&
          lastFetchedAt &&
          Date.now() - lastFetchedAt < CACHE_TTL_MS &&
          cached.length > 0
        ) {
          get().refreshTodayMeals();
          return;
        }
        // Offline: serve the persisted cache and recompute today's list locally.
        // Never surface an error just because the network is unavailable.
        if (!isOnline()) {
          set({ isLoading: false, errorMessage: '' });
          get().refreshTodayMeals();
          return;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ isLoading: false });
            return;
          }
          const today = todayIsoDate();
          const userMeals = await trackingRepository.getUserMeals(user.id);
          const todayMeals = userMeals.filter((m) => m.date === today);
          set({
            userMeals,
            todayMeals,
            isLoading: false,
            lastFetchedAt: Date.now(),
          });
          void useNotificationSettingsStore
            .getState()
            .refreshMealReminder(todayMeals.length > 0);
        } catch (error: unknown) {
          // Keep the cached meals on failure; only report an error when we have
          // nothing to show. The home screen distinguishes offline from real errors.
          const hasCache = get().userMeals.length > 0;
          set({
            isLoading: false,
            errorMessage: hasCache ? '' : toUserMessage(error),
          });
          get().refreshTodayMeals();
        }
      },

      refreshTodayMeals: () => {
        const today = todayIsoDate();
        const user = useUserStore.getState().user;
        const todayMeals = user
          ? get().userMeals.filter(
              (m) => m.user_id === user.id && m.date === today,
            )
          : [];
        set({ todayMeals });
        void useNotificationSettingsStore
          .getState()
          .refreshMealReminder(todayMeals.length > 0);
      },

      getMealsByDate: (date) => get().userMeals.filter((m) => m.date === date),

      logMeal: async (mealId, hungryState) => {
        // Interim: meal writes still require the network (offline queue lands in Phase 2).
        // Fail fast rather than hanging on a 30s request timeout while offline.
        if (!isOnline()) {
          set({
            isLoading: false,
            errorMessage: 'يتطلب تسجيل الوجبة اتصالاً بالإنترنت',
          });
          return false;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ isLoading: false, errorMessage: 'User not initialized' });
            return false;
          }
          const meal = useMealsStore.getState().getMealById(mealId);
          if (!meal) {
            set({ isLoading: false, errorMessage: 'Meal not found' });
            return false;
          }
          const today = todayIsoDate();
          const todayUserMeals = get().userMeals.filter(
            (m) => m.user_id === user.id && m.date === today,
          );

          // Fasting is a once-per-day fact, not a repeatable meal slot.
          if (
            meal.code === FASTING_MEAL_CODE &&
            todayUserMeals.some((m) => m.meal_id === meal.id)
          ) {
            set({
              isLoading: false,
              errorMessage: 'لقد سجّلت صيامك لهذا اليوم بالفعل',
            });
            return false;
          }

          const todayCount = todayUserMeals.length;
          if (todayCount >= 3) {
            set({
              isLoading: false,
              errorMessage: 'تم الوصول للحد اليومي (3 وجبات)',
            });
            return false;
          }
          // Capture before the API call: only the FIRST meal of the day earns points
          const isFirstMealToday = todayCount === 0;
          const entry = await trackingRepository.logMeal({
            userId: user.id,
            mealId: meal.id,
            mealItemCodes: meal.meal_item_codes,
            zoneSummary: meal.dominant_zone,
            hungryState: hungryState ?? null,
          });
          const nextMeals = [...get().userMeals, entry];
          const todayMeals = nextMeals.filter(
            (m) => m.user_id === user.id && m.date === today,
          );
          set({ userMeals: nextMeals, todayMeals, isLoading: false });
          void useNotificationSettingsStore
            .getState()
            .refreshMealReminder(todayMeals.length > 0);
          if (isFirstMealToday) {
            void useMembershipStore
              .getState()
              .recordEvent('committed', 'add_daily_meal');
          }
          return true;
        } catch (error: unknown) {
          set({ isLoading: false, errorMessage: toUserMessage(error) });
          return false;
        }
      },

      replaceMeal: async (userMealId, mealId) => {
        if (!isOnline()) {
          set({
            isLoading: false,
            errorMessage: 'يتطلب تعديل الوجبة اتصالاً بالإنترنت',
          });
          return false;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          const user = useUserStore.getState().user;
          if (!user) {
            set({ isLoading: false, errorMessage: 'User not initialized' });
            return false;
          }
          const meal = useMealsStore.getState().getMealById(mealId);
          if (!meal) {
            set({ isLoading: false, errorMessage: 'Meal not found' });
            return false;
          }

          const today = todayIsoDate();
          const todayUserMeals = get().userMeals.filter(
            (m) => m.user_id === user.id && m.date === today,
          );

          // Fasting is a once-per-day fact, not a repeatable meal slot.
          if (
            meal.code === FASTING_MEAL_CODE &&
            todayUserMeals.some(
              (m) => m.meal_id === meal.id && m.id !== userMealId,
            )
          ) {
            set({
              isLoading: false,
              errorMessage: 'لقد سجّلت صيامك لهذا اليوم بالفعل',
            });
            return false;
          }

          const updated = await trackingRepository.replaceMeal(userMealId, {
            userId: user.id,
            mealId: meal.id,
            mealItemCodes: meal.meal_item_codes,
            zoneSummary: meal.dominant_zone,
          });
          const nextMeals = get().userMeals.map((m) =>
            m.id === userMealId ? updated : m,
          );
          set({
            userMeals: nextMeals,
            todayMeals: nextMeals.filter(
              (m) => m.user_id === user.id && m.date === today,
            ),
            isLoading: false,
          });
          return true;
        } catch (error: unknown) {
          set({ isLoading: false, errorMessage: toUserMessage(error) });
          return false;
        }
      },

      deleteMeal: async (id) => {
        if (!isOnline()) {
          set({
            isLoading: false,
            errorMessage: 'يتطلب حذف الوجبة اتصالاً بالإنترنت',
          });
          return false;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          // Capture the meal's date before removing it from state
          const targetMeal = get().userMeals.find((m) => m.id === id);
          await trackingRepository.deleteMeal(id);
          const user = useUserStore.getState().user;
          const today = todayIsoDate();
          const nextMeals = get().userMeals.filter((m) => m.id !== id);
          const todayMeals = user
            ? nextMeals.filter((m) => m.user_id === user.id && m.date === today)
            : [];
          set({ userMeals: nextMeals, todayMeals, isLoading: false });
          void useNotificationSettingsStore
            .getState()
            .refreshMealReminder(todayMeals.length > 0);
          // Only remove the day's committed points when this was the LAST meal for that day
          if (targetMeal) {
            const remainingMealsForDay = nextMeals.filter(
              (m) => m.date === targetMeal.date,
            );
            if (remainingMealsForDay.length === 0) {
              void useMembershipStore
                .getState()
                .deleteDayEvent(targetMeal.date);
            }
          }
          return true;
        } catch (error: unknown) {
          set({ isLoading: false, errorMessage: toUserMessage(error) });
          return false;
        }
      },

      resetUserMeals: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEYS.CACHE_USER_MEALS,
      storage: persistJSONStorage,
      // Persist the meal log + fetch timestamp. `todayMeals` is derived and
      // date-sensitive, so it is recomputed via refreshTodayMeals() after boot.
      partialize: (s) => ({
        userMeals: s.userMeals,
        lastFetchedAt: s.lastFetchedAt,
      }),
    },
  ),
);
