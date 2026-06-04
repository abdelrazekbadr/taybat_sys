import { MOCK_USER_RATINGS } from '@/data/mock';
import type { UserRating } from '@/types';
import { mockDelay } from '@/utils/mockDelay';

import type { CreateUserRatingPayload, IUserRatingRepository } from './IUserRatingRepository';

let _ratings: UserRating[] = [...MOCK_USER_RATINGS];
let _nextId = _ratings.reduce((max, r) => Math.max(max, r.id), 0) + 1;

export class UserRatingRepositoryMock implements IUserRatingRepository {
  async getRatings(userId: string): Promise<UserRating[]> {
    await mockDelay();
    return _ratings.filter((r) => r.user_id === userId);
  }

  async submitRating(payload: CreateUserRatingPayload): Promise<UserRating> {
    await mockDelay();
    const rating: UserRating = {
      id: _nextId++,
      user_id: payload.userId,
      period_start: payload.period_start,
      submitted_at: new Date().toISOString(),
      health_score: payload.health_score,
      adherence_score: null,
      improvement_goals_codes: payload.improvement_goals_codes,
    };
    _ratings = [..._ratings, rating];
    return rating;
  }
}

