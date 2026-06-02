import type { WeeklyRating, WeeklyScore } from '@/types';

export interface CreateRatingPayload {
  userId: string;
  period_start: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore;
  pain_reduced: boolean;
  energy_improved: boolean;
  sleep_improved: boolean;
  digestion_improved: boolean;
  mood_improved: boolean;
  mental_health_improved: boolean;
}

export interface IRatingRepository {
  getRatings(userId: string): Promise<WeeklyRating[]>;
  submitRating(payload: CreateRatingPayload): Promise<WeeklyRating>;
}
