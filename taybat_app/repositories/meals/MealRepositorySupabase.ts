/**
 * Supabase implementation of IMealRepository.
 *
 * Expected tables:
 *   meals      (id, name, meal_item_ids, dominant_zone, image_url, meal_type_ids)
 *   meal_items (id, name, category, zone, rating, frequency, notes, image_url)
 *
 * These are read-only reference tables — no RLS user filtering needed.
 * Cache aggressively (e.g. TanStack Query staleTime: 30min).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { Meal, MealItem, ZoneColor } from '@/types';
import type { IMealRepository } from './IMealRepository';

export class MealRepositorySupabase implements IMealRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getMeals(): Promise<Meal[]> {
    const { data, error } = await this.client.from('meals').select('*').order('id');
    if (error) throw new ServerError(error);
    return (data ?? []) as Meal[];
  }

  async getMealById(id: number): Promise<Meal | null> {
    const { data, error } = await this.client.from('meals').select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new ServerError(error);
    }
    return data as Meal;
  }

  async getMealsByZone(zone: ZoneColor): Promise<Meal[]> {
    const { data, error } = await this.client.from('meals').select('*').eq('dominant_zone', zone).order('id');
    if (error) throw new ServerError(error);
    return (data ?? []) as Meal[];
  }

  async getMealItems(): Promise<MealItem[]> {
    const { data, error } = await this.client.from('meal_items').select('*').order('id');
    if (error) throw new ServerError(error);
    return (data ?? []) as MealItem[];
  }

  async getMealItemsByZone(zone: ZoneColor): Promise<MealItem[]> {
    const { data, error } = await this.client.from('meal_items').select('*').eq('zone', zone).order('id');
    if (error) throw new ServerError(error);
    return (data ?? []) as MealItem[];
  }
}
