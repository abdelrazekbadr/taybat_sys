import { create } from 'zustand';

import { mealPreferencesService } from '@/api/account/mealPreferences.service';

import { useUserStore } from './user.store';

interface MealPreferencesState {
  favoriteMealIds: number[];
  isLoading: boolean;
  errorMessage: string;

  initializePreferences: () => Promise<void>;
  toggleFavorite: (mealId: number) => Promise<boolean>;
  resetPreferences: () => void;
}

const initialState = {
  favoriteMealIds: [] as number[],
  isLoading: false,
  errorMessage: '',
};

export const useMealPreferencesStore = create<MealPreferencesState>((set, get) => ({
  ...initialState,

  initializePreferences: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ favoriteMealIds: [], isLoading: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return;
      }

      const stored = await mealPreferencesService.fetchFavorites(user.id);
      set({ favoriteMealIds: stored ?? [], isLoading: false });
    } catch (error: unknown) {
      set({
        favoriteMealIds: [],
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تحميل تفضيلات الوجبات',
      });
    }
  },

  toggleFavorite: async (mealId) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isLoading: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }

      const next = await mealPreferencesService.toggleFavorite(user.id, mealId);
      set({ favoriteMealIds: next, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تحديث التفضيل',
      });
      return false;
    }
  },

  resetPreferences: () => set({ ...initialState }),
}));
