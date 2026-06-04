import type { UserRating, WeeklyScore } from '@/types';

export interface CreateUserRatingPayload {
  userId: string;
  period_start: string;
  health_score: WeeklyScore;
  improvement_goals_codes: string;
}

export interface IUserRatingRepository {
  getRatings(userId: string): Promise<UserRating[]>;
  submitRating(payload: CreateUserRatingPayload): Promise<UserRating>;
}

