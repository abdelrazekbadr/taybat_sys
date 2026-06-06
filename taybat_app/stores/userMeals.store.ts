import { create } from 'zustand';

import { trackingRepository } from '@/repositories/tracking';
import { toUserMessage } from '@/shared/errors/AppError';
import type { HungryState, UserMeal } from '@/types';
import { localDateISO } from '@/utils/dateUtils';

import { useMealsStore } from './meals.store';
import { useMembershipStore } from './membership.store';
import { useUserStore } from './user.store';

interface UserMealsState {
  userMeals: UserMeal[];
  todayMeals: UserMeal[];
  isLoading: boolean;
  errorMessage: string;
  initializeUserMeals: () => Promise<void>;
  refreshTodayMeals: () => void;
  logMeal: (mealId: number, hungryState?: HungryState | null) => Promise<boolean>;
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
};

const todayIsoDate = () => localDateISO();

export const useUserMealsStore = create<UserMealsState>((set, get) => ({
  ...initialState,

  initializeUserMeals: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isLoading: false });
        return;
      }
      const today = todayIsoDate();
      const userMeals = await trackingRepository.getUserMeals(user.id);
      set({ userMeals, todayMeals: userMeals.filter((m) => m.date === today), isLoading: false });
    } catch (error: unknown) {
      set({ userMeals: [], todayMeals: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  refreshTodayMeals: () => {
    const today = todayIsoDate();
    const user  = useUserStore.getState().user;
    set({
      todayMeals: user
        ? get().userMeals.filter((m) => m.user_id === user.id && m.date === today)
        : [],
    });
  },

  getMealsByDate: (date) => get().userMeals.filter((m) => m.date === date),

  logMeal: async (mealId, hungryState) => {
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
      const todayCount = get().userMeals.filter((m) => m.user_id === user.id && m.date === today).length;
      if (todayCount >= 3) {
        set({ isLoading: false, errorMessage: 'تم الوصول للحد اليومي (3 وجبات)' });
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
      set({ userMeals: nextMeals, todayMeals: nextMeals.filter((m) => m.user_id === user.id && m.date === today), isLoading: false });
      if (isFirstMealToday) {
        void useMembershipStore.getState().recordEvent('committed', 'add_daily_meal');
      }
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  replaceMeal: async (userMealId, mealId) => {
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
      const updated = await trackingRepository.replaceMeal(userMealId, {
        userId: user.id,
        mealId: meal.id,
        mealItemCodes: meal.meal_item_codes,
        zoneSummary: meal.dominant_zone,
      });
      const today = todayIsoDate();
      const nextMeals = get().userMeals.map((m) => (m.id === userMealId ? updated : m));
      set({ userMeals: nextMeals, todayMeals: nextMeals.filter((m) => m.user_id === user.id && m.date === today), isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  deleteMeal: async (id) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      // Capture the meal's date before removing it from state
      const targetMeal = get().userMeals.find((m) => m.id === id);
      await trackingRepository.deleteMeal(id);
      const user = useUserStore.getState().user;
      const today = todayIsoDate();
      const nextMeals = get().userMeals.filter((m) => m.id !== id);
      set({
        userMeals: nextMeals,
        todayMeals: user ? nextMeals.filter((m) => m.user_id === user.id && m.date === today) : [],
        isLoading: false,
      });
      // Only remove the day's committed points when this was the LAST meal for that day
      if (targetMeal) {
        const remainingMealsForDay = nextMeals.filter((m) => m.date === targetMeal.date);
        if (remainingMealsForDay.length === 0) {
          void useMembershipStore.getState().deleteDayEvent(targetMeal.date);
        }
      }
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  resetUserMeals: () => set({ ...initialState }),
}));
