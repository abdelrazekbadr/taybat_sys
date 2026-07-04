import { create } from 'zustand';

import { mealRepository } from '@/repositories/meals';
import { DEFAULT_MEAL_IMAGE_BASE_URL, publicConfigRepository } from '@/repositories/publicConfig';
import { toUserMessage } from '@/shared/errors/AppError';
import type { Meal, MealItem, ZoneColor } from '@/types';
import { getMealImageUri } from '@/utils/mealImage';

interface MealsState {
  meals: Meal[];
  mealImageBaseUrl: string;
  isLoading: boolean;
  errorMessage: string;
  initializeMeals: () => Promise<void>;
  getMealById: (id: number) => Meal | undefined;
  getMealImageUri: (meal: Pick<Meal, 'image_url' | 'code'>) => string | null;
  resetMeals: () => void;
}

const initialState = {
  meals: [] as Meal[],
  mealImageBaseUrl: DEFAULT_MEAL_IMAGE_BASE_URL,
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
      const [meals, mealImageBaseUrl] = await Promise.all([
        mealRepository.getMeals(),
        publicConfigRepository.getMealImageBaseUrl().catch(() => DEFAULT_MEAL_IMAGE_BASE_URL),
      ]);
      set({ meals, mealImageBaseUrl, isLoading: false });
    } catch (error: unknown) {
      set({ meals: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  getMealById: (id) => get().meals.find((meal) => meal.id === id),

  getMealImageUri: (meal) => getMealImageUri(meal, get().mealImageBaseUrl),

  resetMeals: () => set({ ...initialState }),
}));
