import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { mealRepository } from '@/repositories/meals';
import {
  DEFAULT_MEAL_IMAGE_BASE_URL,
  publicConfigRepository,
} from '@/repositories/publicConfig';
import { toUserMessage } from '@/shared/errors/AppError';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import type { Meal, MealItem, ZoneColor } from '@/types';
import { getMealImageUri, prefetchMealImages } from '@/utils/mealImage';
import { isOnline } from './network.store';
import { persistJSONStorage } from './_persist';

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

export const dominantZoneFromMealItemCodes = (
  codes: string[],
  mealItems: MealItem[],
): ZoneColor => {
  if (!codes.length) return 5;
  const zones = codes
    .map((code) => mealItems.find((item) => item.code === code)?.zone)
    .filter((z): z is ZoneColor => z !== undefined);
  return (zones.length ? Math.max(...zones) : 5) as ZoneColor;
};

export const useMealsStore = create<MealsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeMeals: async () => {
        // Offline with a warm cache: keep showing cached meals, never error.
        if (!isOnline() && get().meals.length > 0) {
          set({ isLoading: false, errorMessage: '' });
          return;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          const [meals, mealImageBaseUrl] = await Promise.all([
            mealRepository.getMeals(),
            publicConfigRepository
              .getMealImageBaseUrl()
              .catch(() => DEFAULT_MEAL_IMAGE_BASE_URL),
          ]);
          set({ meals, mealImageBaseUrl, isLoading: false });
          // Warm the disk cache so thumbnails render offline next launch.
          prefetchMealImages(meals, mealImageBaseUrl);
        } catch (error: unknown) {
          // Keep any previously cached meals instead of wiping to an empty/error
          // state — the home screen decides whether to show an error based on
          // whether a cache exists (see index.tsx).
          const hasCache = get().meals.length > 0;
          set({
            isLoading: false,
            errorMessage: hasCache ? '' : toUserMessage(error),
          });
        }
      },

      getMealById: (id) => get().meals.find((meal) => meal.id === id),

      getMealImageUri: (meal) => getMealImageUri(meal, get().mealImageBaseUrl),

      resetMeals: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEYS.CACHE_MEALS,
      storage: persistJSONStorage,
      // Persist only the reference data, never transient UI flags.
      partialize: (s) => ({
        meals: s.meals,
        mealImageBaseUrl: s.mealImageBaseUrl,
      }),
    },
  ),
);
