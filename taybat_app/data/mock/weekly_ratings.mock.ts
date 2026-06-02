import type { WeeklyRating } from '@/types';

export const MOCK_WEEKLY_RATINGS: WeeklyRating[] = Object.freeze([
  {
    id: 1,
    user_id: 'mock-user-1',
    period_start: '2026-04-01',
    submitted_at: '2026-04-07T18:00:00.000Z',
    health_score: 2,
    adherence_score: 2,
    pain_reduced: false,
    energy_improved: false,
    sleep_improved: false,
    digestion_improved: true,
    mood_improved: false,
    mental_health_improved: false,
  },
  {
    id: 2,
    user_id: 'mock-user-1',
    period_start: '2026-04-08',
    submitted_at: '2026-04-14T18:00:00.000Z',
    health_score: 3,
    adherence_score: 3,
    pain_reduced: true,
    energy_improved: true,
    sleep_improved: true,
    digestion_improved: true,
    mood_improved: true,
    mental_health_improved: true,
  },
]) as unknown as WeeklyRating[];
