import type { UserRating } from '@/types';

export const MOCK_USER_RATINGS: UserRating[] = Object.freeze([
  {
    id: 1,
    user_id: 'mock-user-1',
    period_start: '2026-04-01',
    submitted_at: '2026-04-07T18:00:00.000Z',
    health_score: 2,
    adherence_score: null,
    improvement_goals_codes: '2',
  },
  {
    id: 2,
    user_id: 'mock-user-1',
    period_start: '2026-04-08',
    submitted_at: '2026-04-14T18:00:00.000Z',
    health_score: 3,
    adherence_score: null,
    improvement_goals_codes: '1,2,3,4,5,6',
  },
]) as unknown as UserRating[];

