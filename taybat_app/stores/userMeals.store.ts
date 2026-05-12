import { create } from 'zustand';

import { MOCK_USER_MEALS } from '@/data/mock';
import type { UserMeal } from '@/types';

import { useMealsStore } from './meals.store';
import { useUserStore } from './user.store';

interface UserMealsState {
  userMeals: UserMeal[];
  todayMeals: UserMeal[];
  isLoading: boolean;
  errorMessage: string;
  initializeUserMeals: () => Promise<void>;
  logMeal: (mealId: number) => Promise<boolean>;
  deleteMeal: (id: number) => Promise<boolean>;
  getMealsByDate: (date: string) => UserMeal[];
}

const initialState = {
  userMeals: [] as UserMeal[],
  todayMeals: [] as UserMeal[],
  isLoading: false,
  errorMessage: '',
};

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

export const useUserMealsStore = create<UserMealsState>((set, get) => ({
  ...initialState,

  initializeUserMeals: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const today = todayIsoDate();
      const userMeals = MOCK_USER_MEALS;
      set({
        userMeals,
        todayMeals: userMeals.filter((m) => m.date === today),
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        userMeals: [],
        todayMeals: [],
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load meal logs',
      });
    }
  },

  getMealsByDate: (date) => get().userMeals.filter((m) => m.date === date),

  logMeal: async (mealId) => {
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
      const currentMeals = get().userMeals;
      const todayMeals = currentMeals.filter((m) => m.user_id === user.id && m.date === today);
      if (todayMeals.length >= 3) {
        set({ isLoading: false, errorMessage: 'تم الوصول للحد اليومي (3 وجبات)' });
        return false;
      }

      const nextId = (currentMeals.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
      const newUserMeal: UserMeal = {
        id: nextId,
        user_id: user.id,
        meal_id: meal.id,
        meal_item_ids: meal.meal_item_ids,
        datetime: new Date().toISOString(),
        date: today,
        zone_summary: meal.dominant_zone,
      };

      const nextUserMeals = [...currentMeals, newUserMeal];
      set({
        userMeals: nextUserMeals,
        todayMeals: nextUserMeals.filter((m) => m.user_id === user.id && m.date === today),
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to log meal',
      });
      return false;
    }
  },

  deleteMeal: async (id) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const currentMeals = get().userMeals;
      const nextUserMeals = currentMeals.filter((m) => m.id !== id);
      const today = todayIsoDate();
      set({
        userMeals: nextUserMeals,
        todayMeals: user ? nextUserMeals.filter((m) => m.user_id === user.id && m.date === today) : [],
        isLoading: false,
      });
      return nextUserMeals.length !== currentMeals.length;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to delete meal log',
      });
      return false;
    }
  },
}));
