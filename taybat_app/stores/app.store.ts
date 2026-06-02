import { create } from 'zustand';

import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';

interface AppState {
  language: 'en' | 'ar';
  isReady: boolean;
  initializeApp: () => Promise<void>;
  setLanguage: (value: 'en' | 'ar') => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'ar',
  isReady: false,

  initializeApp: async () => {
    const savedLanguage = await storageService.getString(STORAGE_KEYS.LANGUAGE);
    set({
      language: savedLanguage === 'en' ? 'en' : 'ar',
      isReady: true,
    });
  },

  setLanguage: async (value) => {
    await storageService.set(STORAGE_KEYS.LANGUAGE, value);
    set({ language: value });
  },
}));
