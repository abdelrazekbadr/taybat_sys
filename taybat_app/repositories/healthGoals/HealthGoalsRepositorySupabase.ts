import type { SupabaseClient } from '@supabase/supabase-js';

import { ServerError } from '@/shared/errors/AppError';
import type { HealthGoal } from '@/types';

import type { IHealthGoalsRepository } from './IHealthGoalsRepository';

export class HealthGoalsRepositorySupabase implements IHealthGoalsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveGoals(): Promise<HealthGoal[]> {
    const { data, error } = await this.client
      .from('health_goals')
      .select('id, code, name, name_en, active, image, show_in_complete_profile')
      .eq('active', true)
      .order('code', { ascending: true });

    if (error) throw new ServerError(error);
    return (data ?? []) as HealthGoal[];
  }
}
