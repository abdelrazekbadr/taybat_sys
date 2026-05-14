import { create } from 'zustand';

import { MOCK_WEEKLY_RATINGS } from '@/data/mock';
import type { WeeklyRating, WeeklyScore } from '@/types';

import { useUserStore } from './user.store';

export type SubmitWeeklyRatingPayload = {
  period_start: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore;
  pain_reduced: boolean;
  energy_improved: boolean;
  sleep_improved: boolean;
  digestion_improved: boolean;
  mood_improved: boolean;
  mental_health_improved: boolean;
};

interface WeeklyRatingState {
  ratings: WeeklyRating[];
  pendingRating: boolean;
  isLoading: boolean;
  errorMessage: string;
  initializeRatings: () => Promise<void>;
  submitRating: (payload: SubmitWeeklyRatingPayload) => Promise<boolean>;
  checkPendingRating: () => void;
}

const initialState = {
  ratings: [] as WeeklyRating[],
  pendingRating: false,
  isLoading: false,
  errorMessage: '',
};

const daysBetween = (fromIso: string, toIso: string) => {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.floor((to - from) / (24 * 60 * 60 * 1000));
};

export const useWeeklyRatingStore = create<WeeklyRatingState>((set, get) => ({
  ...initialState,

  initializeRatings: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      set({ ratings: MOCK_WEEKLY_RATINGS, isLoading: false });
      get().checkPendingRating();
    } catch (error: unknown) {
      set({
        ratings: [],
        pendingRating: false,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load weekly ratings',
      });
    }
  },

  submitRating: async (payload) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isLoading: false, errorMessage: 'User not initialized' });
        return false;
      }

      const current = get().ratings;
      const nextId = (current.reduce((max, r) => Math.max(max, r.id), 0) || 0) + 1;
      const newRating: WeeklyRating = {
        id: nextId,
        user_id: user.id,
        submitted_at: new Date().toISOString(),
        ...payload,
      };

      set({ ratings: [...current, newRating], isLoading: false });
      get().checkPendingRating();
      return true;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to submit weekly rating',
      });
      return false;
    }
  },

  checkPendingRating: () => {
    const ratings = get().ratings;
    if (!ratings.length) {
      const user = useUserStore.getState().user;
      if (!user?.plan_start_date) {
        set({ pendingRating: true });
        return;
      }
      const days = daysBetween(user.plan_start_date, new Date().toISOString());
      set({ pendingRating: days >= 7 });
      return;
    }

    const last = ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
    );

    const days = daysBetween(last.submitted_at, new Date().toISOString());
    set({ pendingRating: days >= 7 });
  },
}));
