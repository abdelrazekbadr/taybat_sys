/**
 * Supabase implementation of ITrackingRepository.
 *
 * Expected table:
 *   user_meals (id, user_id, meal_id, meal_item_ids, datetime, date, zone_summary)
 *
 * RLS: users can only access their own rows (user_id = auth.uid()).
 *
 * user_id is a UUID string referencing auth.users.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { UserMeal } from '@/types';
import { localDateISO } from '@/utils/dateUtils';
import type { CreateUserMealPayload, ITrackingRepository } from './ITrackingRepository';

export class TrackingRepositorySupabase implements ITrackingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getUserMeals(userId: string): Promise<UserMeal[]> {
    // CommitmentCalendar navigates up to 2 months back; 90 days covers all consumers.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 89);
    const cutoffDate = localDateISO(cutoff);
    const { data, error } = await this.client
      .from('user_meals')
      .select('*')
      .eq('user_id', userId)
      .gte('date', cutoffDate)
      .order('datetime', { ascending: false });
    if (error) throw new ServerError(error);
    return (data ?? []) as UserMeal[];
  }

  async getMealsByDate(userId: string, date: string): Promise<UserMeal[]> {
    const { data, error } = await this.client
      .from('user_meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('datetime', { ascending: true });
    if (error) throw new ServerError(error);
    return (data ?? []) as UserMeal[];
  }

  async logMeal(payload: CreateUserMealPayload): Promise<UserMeal> {
    const now = new Date();
    const { data, error } = await this.client
      .from('user_meals')
      .insert({
        user_id: payload.userId,
        meal_id: payload.mealId,
        meal_item_codes: payload.mealItemCodes,
        datetime: now.toISOString(),
        date: localDateISO(now),
        zone_summary: payload.zoneSummary,
        hungry_state: payload.hungryState ?? null,
      })
      .select()
      .single();
    if (error) throw new ServerError(error);
    return data as UserMeal;
  }

  async replaceMeal(userMealId: number, payload: CreateUserMealPayload): Promise<UserMeal> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('user_meals')
      .update({
        meal_id: payload.mealId,
        meal_item_codes: payload.mealItemCodes,
        datetime: now,
        zone_summary: payload.zoneSummary,
      })
      .eq('id', userMealId)
      .select()
      .single();
    if (error) throw new ServerError(error);
    return data as UserMeal;
  }

  async deleteMeal(id: number): Promise<void> {
    const { error } = await this.client.from('user_meals').delete().eq('id', id);
    if (error) throw new ServerError(error);
  }
}
