import { create } from 'zustand';

import { healthGoalsRepository } from '@/repositories/healthGoals';
import { toUserMessage } from '@/shared/errors/AppError';
import type { HealthGoal } from '@/types';

interface HealthGoalsState {
  goals: HealthGoal[];
  isLoading: boolean;
  errorMessage: string;

  fetchGoals: () => Promise<void>;
  resetHealthGoals: () => void;
}

const initialState = {
  goals: [] as HealthGoal[],
  isLoading: false,
  errorMessage: '',
};

export const useHealthGoalsStore = create<HealthGoalsState>((set) => ({
  ...initialState,

  fetchGoals: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const goals = await healthGoalsRepository.listActiveGoals();
      set({ goals, isLoading: false });
    } catch (error: unknown) {
      set({ goals: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  resetHealthGoals: () => set({ ...initialState }),
}));

