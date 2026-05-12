import { create } from 'zustand';

import { MOCK_USER } from '@/data/mock';
import type { User } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string;
  initializeUser: () => Promise<void>;
  resetUser: () => void;
}

const initialState = {
  user: null as User | null,
  isLoading: false,
  errorMessage: '',
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  initializeUser: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      set({ user: MOCK_USER, isLoading: false });
    } catch (error: unknown) {
      set({
        user: null,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load user',
      });
    }
  },

  resetUser: () => set({ ...initialState }),
}));
