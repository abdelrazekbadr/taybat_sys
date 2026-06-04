import type { SupabaseClient } from '@supabase/supabase-js';

import { ServerError } from '@/shared/errors/AppError';
import type { UserRating } from '@/types';

import type { CreateUserRatingPayload, IUserRatingRepository } from './IUserRatingRepository';

export class UserRatingRepositorySupabase implements IUserRatingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getRatings(userId: string): Promise<UserRating[]> {
    const { data, error } = await this.client
      .from('users_ratings')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false });
    if (error) throw new ServerError(error);
    return (data ?? []) as UserRating[];
  }

  async submitRating(payload: CreateUserRatingPayload): Promise<UserRating> {
    const { data, error } = await this.client
      .from('users_ratings')
      .insert({
        user_id: payload.userId,
        period_start: payload.period_start,
        submitted_at: new Date().toISOString(),
        health_score: payload.health_score,
        adherence_score: null,
        improvement_goals_codes: payload.improvement_goals_codes,
      })
      .select()
      .single();
    if (error) throw new ServerError(error);
    return data as UserRating;
  }
}

