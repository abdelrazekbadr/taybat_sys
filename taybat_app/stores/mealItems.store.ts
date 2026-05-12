import { create } from 'zustand';

import { MOCK_MEAL_ITEMS } from '@/data/mock';
import type { MealItem, ZoneColor } from '@/types';

interface MealItemsState {
  mealItems: MealItem[];
  isLoading: boolean;
  errorMessage: string;
  initializeMealItems: () => Promise<void>;
  getMealItemsByZone: (zone: ZoneColor) => MealItem[];
  getMealItemById: (id: number) => MealItem | undefined;
}

const initialState = {
  mealItems: [] as MealItem[],
  isLoading: false,
  errorMessage: '',
};

export const useMealItemsStore = create<MealItemsState>((set, get) => ({
  ...initialState,

  initializeMealItems: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      set({ mealItems: MOCK_MEAL_ITEMS, isLoading: false });
    } catch (error: unknown) {
      set({
        mealItems: [],
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load meal items',
      });
    }
  },

  getMealItemsByZone: (zone) => get().mealItems.filter((item) => item.zone === zone),

  getMealItemById: (id) => get().mealItems.find((item) => item.id === id),
}));
