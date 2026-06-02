import { create } from 'zustand';

import { healthConditionsService } from '@/api/healthConditions/healthConditions.service';
import { toUserMessage } from '@/shared/errors/AppError';
import type { HealthCondition } from '@/types';

interface HealthConditionsState {
  conditions: HealthCondition[];
  isLoading: boolean;
  errorMessage: string;

  fetchConditions: () => Promise<void>;
  resetHealthConditions: () => void;
}

const initialState = {
  conditions: [] as HealthCondition[],
  isLoading: false,
  errorMessage: '',
};

export const useHealthConditionsStore = create<HealthConditionsState>((set) => ({
  ...initialState,

  fetchConditions: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const conditions = await healthConditionsService.listActiveConditions();
      set({ conditions, isLoading: false });
    } catch (error: unknown) {
      set({ conditions: [], isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  resetHealthConditions: () => set({ ...initialState }),
}));
