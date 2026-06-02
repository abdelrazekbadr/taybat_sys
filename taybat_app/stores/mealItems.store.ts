import { create } from 'zustand';

import { mealRepository } from '@/repositories/meals';
import { toUserMessage } from '@/shared/errors/AppError';
import type { MealItem, ZoneColor } from '@/types';

interface MealItemsState {
  mealItems: MealItem[];
  isLoading: boolean;
  errorMessage: string;
  initializeMealItems: () => Promise<void>;
  getMealItemsByZone: (zone: ZoneColor) => MealItem[];
  getMealItemById: (id: number) => MealItem | undefined;
  getMealItemByCode: (code: string) => MealItem | undefined;
  resetMealItems: () => void;
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
      const mealItems = await mealRepository.getMealItems();
      set({ mealItems, isLoading: false });
    } catch (error: unknown) {
      set({ mealItems: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  getMealItemsByZone: (zone) => get().mealItems.filter((item) => item.zone === zone),

  getMealItemById: (id) => get().mealItems.find((item) => item.id === id),
  getMealItemByCode: (code) => get().mealItems.find((item) => item.code === code),

  resetMealItems: () => set({ ...initialState }),
}));
