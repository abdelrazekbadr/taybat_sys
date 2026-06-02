import { MOCK_WEEKLY_RATINGS } from '@/data/mock';
import type { WeeklyRating } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { CreateRatingPayload, IRatingRepository } from './IRatingRepository';

let _ratings: WeeklyRating[] = [...MOCK_WEEKLY_RATINGS];
let _nextId = _ratings.reduce((max, r) => Math.max(max, r.id), 0) + 1;

export class RatingRepositoryMock implements IRatingRepository {
  async getRatings(userId: string): Promise<WeeklyRating[]> {
    await mockDelay();
    return _ratings.filter((r) => r.user_id === userId);
  }

  async submitRating(payload: CreateRatingPayload): Promise<WeeklyRating> {
    await mockDelay();
    const rating: WeeklyRating = {
      id: _nextId++,
      user_id: payload.userId,
      period_start: payload.period_start,
      submitted_at: new Date().toISOString(),
      health_score: payload.health_score,
      adherence_score: payload.adherence_score,
      pain_reduced: payload.pain_reduced,
      energy_improved: payload.energy_improved,
      sleep_improved: payload.sleep_improved,
      digestion_improved: payload.digestion_improved,
      mood_improved: payload.mood_improved,
      mental_health_improved: payload.mental_health_improved,
    };
    _ratings = [..._ratings, rating];
    return rating;
  }
}
