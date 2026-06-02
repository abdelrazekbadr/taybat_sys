import { create } from 'zustand';

import { accountRepository } from '@/repositories/account';
import { toUserMessage } from '@/shared/errors/AppError';

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
        set({ favoriteMealIds: [], isLoading: false });
        return;
      }
      const ids = await accountRepository.getFavoriteMealIds(user.id);
      set({ favoriteMealIds: ids, isLoading: false });
    } catch (error: unknown) {
      set({ favoriteMealIds: [], isLoading: false, errorMessage: toUserMessage(error) });
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
      const current = get().favoriteMealIds;
      const next = current.includes(mealId) ? current.filter((id) => id !== mealId) : [...current, mealId];
      await accountRepository.saveFavoriteMealIds(user.id, next);
      set({ favoriteMealIds: next, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  resetPreferences: () => set({ ...initialState }),
}));
