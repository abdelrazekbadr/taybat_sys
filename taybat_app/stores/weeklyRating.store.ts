import { create } from 'zustand';

import { ratingRepository } from '@/repositories/ratings';
import type { CreateRatingPayload } from '@/repositories/ratings';
import { toUserMessage } from '@/shared/errors/AppError';
import type { WeeklyRating } from '@/types';

import { useUserStore } from './user.store';

export type SubmitWeeklyRatingPayload = Omit<CreateRatingPayload, 'userId'>;

interface WeeklyRatingState {
  ratings: WeeklyRating[];
  pendingRating: boolean;
  isLoading: boolean;
  errorMessage: string;
  initializeRatings: () => Promise<void>;
  submitRating: (payload: SubmitWeeklyRatingPayload) => Promise<boolean>;
  checkPendingRating: () => void;
  resetWeeklyRatings: () => void;
}

const initialState = {
  ratings: [] as WeeklyRating[],
  pendingRating: false,
  isLoading: false,
  errorMessage: '',
};

const daysBetween = (fromIso: string, toIso: string) =>
  Math.floor((new Date(toIso).getTime() - new Date(fromIso).getTime()) / (24 * 60 * 60 * 1000));

export const useWeeklyRatingStore = create<WeeklyRatingState>((set, get) => ({
  ...initialState,

  initializeRatings: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const ratings = user ? await ratingRepository.getRatings(user.id) : [];
      set({ ratings, isLoading: false });
      get().checkPendingRating();
    } catch (error: unknown) {
      set({ ratings: [], pendingRating: false, isLoading: false, errorMessage: toUserMessage(error) });
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
      const rating = await ratingRepository.submitRating({ ...payload, userId: user.id });
      set((state) => ({ ratings: [...state.ratings, rating], isLoading: false }));
      get().checkPendingRating();
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
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
      set({ pendingRating: daysBetween(user.plan_start_date, new Date().toISOString()) >= 7 });
      return;
    }
    const last = ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
    );
    set({ pendingRating: daysBetween(last.submitted_at, new Date().toISOString()) >= 7 });
  },

  resetWeeklyRatings: () => set({ ...initialState }),
}));
