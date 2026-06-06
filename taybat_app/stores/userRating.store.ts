import { create } from 'zustand';

import { userProfileRepository } from '@/repositories/auth';
import { userRatingRepository } from '@/repositories/userRatings';
import type { CreateUserRatingPayload } from '@/repositories/userRatings';
import { toUserMessage } from '@/shared/errors/AppError';
import type { UserRating } from '@/types';

import { useMembershipStore } from './membership.store';
import { useUserStore } from './user.store';

export type SubmitUserRatingPayload = Omit<CreateUserRatingPayload, 'userId'>;

interface UserRatingState {
  ratings: UserRating[];
  pendingRating: boolean;
  isLoading: boolean;
  errorMessage: string;
  initializeRatings: () => Promise<void>;
  submitRating: (payload: SubmitUserRatingPayload) => Promise<boolean>;
  checkPendingRating: () => void;
  resetUserRatings: () => void;
}

const initialState = {
  ratings: [] as UserRating[],
  pendingRating: false,
  isLoading: false,
  errorMessage: '',
};

const isoDate = (value: string) => value.slice(0, 10);

const daysBetweenISO = (fromIso: string, toIso: string) => {
  const from = new Date(isoDate(fromIso)).getTime();
  const to = new Date(isoDate(toIso)).getTime();
  return Math.floor((to - from) / 86_400_000);
};

const addDaysISO = (iso: string, days: number) => {
  const dt = new Date(isoDate(iso));
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
};

export const useUserRatingStore = create<UserRatingState>((set, get) => ({
  ...initialState,

  initializeRatings: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const ratings = user ? await userRatingRepository.getRatings(user.id) : [];
      set({ ratings, isLoading: false });
      if (user?.plan_start_date) {
        try {
          const desiredDueDate = ratings.length
            ? addDaysISO(
                ratings.reduce((latest, r) =>
                  new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
                ).submitted_at,
                7,
              )
            : addDaysISO(user.plan_start_date, 7);

          const needsFix = !user.next_rating_date || isoDate(user.next_rating_date) !== desiredDueDate;
          if (needsFix) {
            await userProfileRepository.upsertProfile(user.id, { next_rating_date: desiredDueDate });
            useUserStore.getState().updateUser({ next_rating_date: desiredDueDate });
          }
        } catch {}
      }
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
      const rating = await userRatingRepository.submitRating({ ...payload, userId: user.id });
      const nextRatingDate = addDaysISO(rating.submitted_at, 7);
      try {
        await userProfileRepository.upsertProfile(user.id, {
          next_rating_date: nextRatingDate,
          last_health_score: rating.health_score,
          last_improvement_goals_codes: rating.improvement_goals_codes,
        });
      } catch {}
      useUserStore.getState().updateUser({ next_rating_date: nextRatingDate });
      set((state) => ({ ratings: [...state.ratings, rating], isLoading: false }));
      get().checkPendingRating();
      void useMembershipStore.getState().recordEvent('committed', 'complete_weekly_rating');
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
      const dueDate = addDaysISO(user.plan_start_date, 7);
      set({ pendingRating: daysBetweenISO(dueDate, new Date().toISOString()) >= 0 });
      return;
    }
    const last = ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
    );
    const dueDate = addDaysISO(last.submitted_at, 7);
    set({ pendingRating: daysBetweenISO(dueDate, new Date().toISOString()) >= 0 });
  },

  resetUserRatings: () => set({ ...initialState }),
}));

