import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { topicsRepository } from '@/repositories/topics';
import { toUserMessage } from '@/shared/errors/AppError';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import type { LibraryTopicWithItems } from '@/types';

import { isOnline } from './network.store';
import { persistJSONStorage } from './_persist';

interface TopicsState {
  topics: LibraryTopicWithItems[];
  isLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string;
  fetchTopics: () => Promise<void>;
  refreshTopics: () => Promise<void>;
  getTopicByCode: (code: string) => LibraryTopicWithItems | undefined;
  resetTopics: () => void;
}

const initialState = {
  topics: [] as LibraryTopicWithItems[],
  isLoading: false,
  isRefreshing: false,
  errorMessage: '',
};

export const useTopicsStore = create<TopicsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchTopics: async () => {
        if (get().topics.length > 0) return;
        // Offline with nothing cached: nothing to fetch, don't spin forever.
        if (!isOnline()) {
          set({ isLoading: false, errorMessage: '' });
          return;
        }
        set({ isLoading: true, errorMessage: '' });
        try {
          const topics = await topicsRepository.getTopicsWithItems();
          set({ topics, isLoading: false });
        } catch (error: unknown) {
          set({
            topics: [],
            isLoading: false,
            errorMessage: toUserMessage(error),
          });
        }
      },

      refreshTopics: async () => {
        if (!isOnline()) return;
        set({ isRefreshing: true, errorMessage: '' });
        try {
          const topics = await topicsRepository.getTopicsWithItems();
          set({ topics, isRefreshing: false });
        } catch (error: unknown) {
          // Keep the cached topics on a failed refresh — don't wipe good data.
          set({ isRefreshing: false, errorMessage: toUserMessage(error) });
        }
      },

      getTopicByCode: (code) => get().topics.find((t) => t.code === code),

      resetTopics: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEYS.CACHE_TOPICS,
      storage: persistJSONStorage,
      partialize: (s) => ({ topics: s.topics }),
    },
  ),
);
