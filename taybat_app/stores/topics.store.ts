import { create } from 'zustand';

import { topicsRepository } from '@/repositories/topics';
import { toUserMessage } from '@/shared/errors/AppError';
import type { LibraryTopicWithItems } from '@/types';

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

export const useTopicsStore = create<TopicsState>((set, get) => ({
  ...initialState,

  fetchTopics: async () => {
    if (get().topics.length > 0) return;
    set({ isLoading: true, errorMessage: '' });
    try {
      const topics = await topicsRepository.getTopicsWithItems();
      set({ topics, isLoading: false });
    } catch (error: unknown) {
      set({ topics: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  refreshTopics: async () => {
    set({ isRefreshing: true, errorMessage: '' });
    try {
      const topics = await topicsRepository.getTopicsWithItems();
      set({ topics, isRefreshing: false });
    } catch (error: unknown) {
      set({ isRefreshing: false, errorMessage: toUserMessage(error) });
    }
  },

  getTopicByCode: (code) => get().topics.find((t) => t.code === code),

  resetTopics: () => set({ ...initialState }),
}));
