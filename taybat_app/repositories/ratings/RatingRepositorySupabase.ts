/**
 * Supabase implementation of IRatingRepository.
 *
 * Expected table:
 *   weekly_ratings (id, user_id, period_start, submitted_at, health_score,
 *                   adherence_score, pain_reduced, energy_improved, sleep_improved,
 *                   digestion_improved, mood_improved, mental_health_improved)
 *
 * RLS: users can only access their own rows (user_id = auth.uid()).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { WeeklyRating } from '@/types';
import type { CreateRatingPayload, IRatingRepository } from './IRatingRepository';

export class RatingRepositorySupabase implements IRatingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getRatings(userId: string): Promise<WeeklyRating[]> {
    const { data, error } = await this.client
      .from('weekly_ratings')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    if (error) throw new ServerError(error);
    return (data ?? []) as WeeklyRating[];
  }

  async submitRating(payload: CreateRatingPayload): Promise<WeeklyRating> {
    const { data, error } = await this.client
      .from('weekly_ratings')
      .insert({
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
      })
      .select()
      .single();
    if (error) throw new ServerError(error);
    return data as WeeklyRating;
  }
}
