import { create } from 'zustand';

import { mealRepository } from '@/repositories/meals';
import { toUserMessage } from '@/shared/errors/AppError';
import type { Meal, MealItem, ZoneColor } from '@/types';

interface MealsState {
  meals: Meal[];
  isLoading: boolean;
  errorMessage: string;
  initializeMeals: () => Promise<void>;
  getMealById: (id: number) => Meal | undefined;
  resetMeals: () => void;
}

const initialState = {
  meals: [] as Meal[],
  isLoading: false,
  errorMessage: '',
};

export const dominantZoneFromMealItemCodes = (codes: string[], mealItems: MealItem[]): ZoneColor => {
  if (!codes.length) return 5;
  const zones = codes
    .map((code) => mealItems.find((item) => item.code === code)?.zone)
    .filter((z): z is ZoneColor => z !== undefined);
  return (zones.length ? Math.max(...zones) : 5) as ZoneColor;
};

export const useMealsStore = create<MealsState>((set, get) => ({
  ...initialState,

  initializeMeals: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const meals = await mealRepository.getMeals();
      set({ meals, isLoading: false });
    } catch (error: unknown) {
      set({ meals: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  getMealById: (id) => get().meals.find((meal) => meal.id === id),

  resetMeals: () => set({ ...initialState }),
}));
