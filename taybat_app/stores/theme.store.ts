import { create } from 'zustand';

import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import type { ThemeMode } from '@/theme';

interface ThemeState {
  mode: ThemeMode;
  isLoading: boolean;
  errorMessage: string;
  setMode: (mode: ThemeMode) => Promise<void>;
  initializeThemeMode: () => Promise<void>;
  resetTheme: () => Promise<void>;
}

const initialState = {
  mode: 'light' as ThemeMode,//system
  isLoading: false,
  errorMessage: '',
};

export const useThemeStore = create<ThemeState>((set) => ({
  ...initialState,

  setMode: async (mode) => {
    set({ mode, errorMessage: '' });
    try {
      await storageService.set(STORAGE_KEYS.THEME_MODE, mode);
    } catch (error: unknown) {
      set({
        errorMessage: error instanceof Error ? error.message : 'Failed to save theme setting',
      });
    }
  },

  initializeThemeMode: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const savedMode = await storageService.getString(STORAGE_KEYS.THEME_MODE);
      const mode: ThemeMode =
        savedMode === 'light' || savedMode === 'dark' || savedMode === 'system'
          ? savedMode
          : 'light';
      set({ mode, isLoading: false });
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load theme settings',
      });
    }
  },

  resetTheme: async () => {
    set({ ...initialState });
    try {
      await storageService.remove(STORAGE_KEYS.THEME_MODE);
    } catch {
      set({ errorMessage: 'Failed to reset theme settings' });
    }
  },
}));
