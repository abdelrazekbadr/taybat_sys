import { create } from 'zustand';

import { MOCK_MEALS } from '@/data/mock';
import type { Meal, ZoneColor } from '@/types';

interface MealsState {
  meals: Meal[];
  isLoading: boolean;
  errorMessage: string;
  initializeMeals: () => Promise<void>;
  getMealById: (id: number) => Meal | undefined;
  createMeal: (name: string, mealItemIds: number[]) => Promise<Meal | null>;
  deleteMeal: (id: number) => Promise<boolean>;
  resetMeals: () => void;
}

const initialState = {
  meals: [] as Meal[],
  isLoading: false,
  errorMessage: '',
};

const zoneFromMealItemId = (mealItemId: number): ZoneColor => {
  const zone = Math.floor(mealItemId / 1000);
  if (zone === 1 || zone === 2 || zone === 3 || zone === 4 || zone === 5) return zone;
  return 5;
};

const dominantZoneFromMealItemIds = (mealItemIds: number[]): ZoneColor => {
  const zones = mealItemIds.map(zoneFromMealItemId);
  return (zones.length ? Math.max(...zones) : 5) as ZoneColor;
};

export const useMealsStore = create<MealsState>((set, get) => ({
  ...initialState,

  initializeMeals: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      set({ meals: MOCK_MEALS, isLoading: false });
    } catch (error: unknown) {
      set({
        meals: [],
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load meals',
      });
    }
  },

  getMealById: (id) => get().meals.find((meal) => meal.id === id),

  createMeal: async (name, mealItemIds) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const trimmedName = name.trim();
      const cleanedIds = mealItemIds.filter((x) => Number.isFinite(x) && x > 0);
      if (!trimmedName || cleanedIds.length === 0) {
        set({ isLoading: false, errorMessage: 'Invalid meal data' });
        return null;
      }

      const currentMeals = get().meals;
      const nextId = (currentMeals.reduce((max, m) => Math.max(max, m.id), 0) || 0) + 1;
      const newMeal: Meal = {
        id: nextId,
        name: trimmedName,
        meal_item_ids: cleanedIds.join(','),
        dominant_zone: dominantZoneFromMealItemIds(cleanedIds),
        image_url: '',
        meal_type_ids: '1,2,3',
      };

      set({ meals: [...currentMeals, newMeal], isLoading: false });
      return newMeal;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to create meal',
      });
      return null;
    }
  },

  deleteMeal: async (id) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const currentMeals = get().meals;
      const nextMeals = currentMeals.filter((meal) => meal.id !== id);
      set({ meals: nextMeals, isLoading: false });
      return nextMeals.length !== currentMeals.length;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to delete meal',
      });
      return false;
    }
  },

  resetMeals: () => set({ ...initialState }),
}));
