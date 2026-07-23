import { create } from 'zustand';

import { userProfileRepository } from '@/repositories/auth';
import {
  DEFAULT_RATING_MIN_COMMITMENT_DAYS,
  publicConfigRepository,
} from '@/repositories/publicConfig';
import { userRatingRepository } from '@/repositories/userRatings';
import type { CreateUserRatingPayload } from '@/repositories/userRatings';
import { toUserMessage } from '@/shared/errors/AppError';
import type { UserRating } from '@/types';
import { addDaysToISODate, localDateISO } from '@/utils/dateUtils';

import { useMembershipStore } from './membership.store';
import { isOnline } from './network.store';
import { useUserStore } from './user.store';

export type SubmitUserRatingPayload = Omit<CreateUserRatingPayload, 'userId'>;

const RATINGS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface UserRatingState {
  ratings: UserRating[];
  pendingRating: boolean;
  isLoading: boolean;
  errorMessage: string;
  lastFetchedAt: number | null;
  /** Minimum committed days (out of the last 7) required to submit a weekly rating. */
  minCommitmentDays: number;
  initializeRatings: (force?: boolean) => Promise<void>;
  submitRating: (payload: SubmitUserRatingPayload) => Promise<boolean>;
  checkPendingRating: () => void;
  resetUserRatings: () => void;
}

const initialState = {
  ratings: [] as UserRating[],
  pendingRating: false,
  isLoading: false,
  errorMessage: '',
  lastFetchedAt: null as number | null,
  minCommitmentDays: DEFAULT_RATING_MIN_COMMITMENT_DAYS,
};

const isoDate = (value: string) => value.slice(0, 10);

const daysBetweenISO = (fromIso: string, toIso: string) => {
  const from = new Date(isoDate(fromIso)).getTime();
  const to = new Date(isoDate(toIso)).getTime();
  return Math.floor((to - from) / 86_400_000);
};

// DST-safe date-only arithmetic — see addDaysToISODate for why a naive
// UTC-parse/local-mutate/UTC-serialize round-trip silently loses a day
// around DST transitions.
const addDaysISO = (iso: string, days: number) => addDaysToISODate(iso, days);

export const useUserRatingStore = create<UserRatingState>((set, get) => ({
  ...initialState,

  initializeRatings: async (force = false) => {
    const { lastFetchedAt } = get();
    if (
      !force &&
      lastFetchedAt &&
      Date.now() - lastFetchedAt < RATINGS_CACHE_TTL_MS &&
      get().ratings.length > 0
    ) {
      get().checkPendingRating();
      return;
    }
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const [ratings, minCommitmentDays] = await Promise.all([
        user ? userRatingRepository.getRatings(user.id) : Promise.resolve([]),
        publicConfigRepository
          .getRatingMinCommitmentDays()
          .catch(() => get().minCommitmentDays),
      ]);
      set({
        ratings,
        minCommitmentDays,
        isLoading: false,
        lastFetchedAt: Date.now(),
      });
      if (user?.plan_start_date) {
        try {
          const desiredDueDate = ratings.length
            ? addDaysISO(
                ratings.reduce((latest, r) =>
                  new Date(r.submitted_at).getTime() >
                  new Date(latest.submitted_at).getTime()
                    ? r
                    : latest,
                ).submitted_at,
                7,
              )
            : addDaysISO(user.plan_start_date, 7);

          const needsFix =
            !user.next_rating_date ||
            isoDate(user.next_rating_date) !== desiredDueDate;
          if (needsFix) {
            await userProfileRepository.updateProfile(user.id, {
              next_rating_date: desiredDueDate,
            });
            useUserStore
              .getState()
              .updateUser({ next_rating_date: desiredDueDate });
          }
        } catch {}
      }
      get().checkPendingRating();
    } catch (error: unknown) {
      set({
        ratings: [],
        pendingRating: false,
        isLoading: false,
        errorMessage: toUserMessage(error),
      });
    }
  },

  submitRating: async (payload) => {
    // Weekly rating is an online-only action — it must never be queued/optimistic
    // because it drives next_rating_date and membership points server-side.
    if (!isOnline()) {
      set({
        isLoading: false,
        errorMessage: 'يتطلب إرسال التقييم اتصالاً بالإنترنت',
      });
      return false;
    }
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isLoading: false, errorMessage: 'User not initialized' });
        return false;
      }
      const rating = await userRatingRepository.submitRating({
        ...payload,
        userId: user.id,
      });
      const nextRatingDate = addDaysISO(rating.submitted_at, 7);
      try {
        await userProfileRepository.updateProfile(user.id, {
          next_rating_date: nextRatingDate,
          last_health_score: rating.health_score,
          last_improvement_goals_codes: rating.improvement_goals_codes,
        });
      } catch {}
      useUserStore.getState().updateUser({ next_rating_date: nextRatingDate });
      set((state) => ({
        ratings: [...state.ratings, rating],
        isLoading: false,
      }));
      get().checkPendingRating();
      void useMembershipStore
        .getState()
        .recordEvent('committed', 'complete_weekly_rating');
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  checkPendingRating: () => {
    // localDateISO(), not new Date().toISOString() — the latter reads the
    // UTC calendar date, which disagrees with "today" for a few hours around
    // local midnight on every device, in every timezone (early morning in
    // positive-UTC-offset zones like Cairo/Riyadh; late evening in
    // negative-offset zones like the Americas). This must always be the
    // device's LOCAL calendar date for a due-date comparison to be correct.
    const today = localDateISO();
    const ratings = get().ratings;
    if (!ratings.length) {
      const user = useUserStore.getState().user;
      if (!user?.plan_start_date) {
        set({ pendingRating: true });
        return;
      }
      const dueDate = addDaysISO(user.plan_start_date, 7);
      set({ pendingRating: daysBetweenISO(dueDate, today) >= 0 });
      return;
    }
    const last = ratings.reduce((latest, r) =>
      new Date(r.submitted_at).getTime() >
      new Date(latest.submitted_at).getTime()
        ? r
        : latest,
    );
    const dueDate = addDaysISO(last.submitted_at, 7);
    set({ pendingRating: daysBetweenISO(dueDate, today) >= 0 });
  },

  resetUserRatings: () => set({ ...initialState }),
}));
