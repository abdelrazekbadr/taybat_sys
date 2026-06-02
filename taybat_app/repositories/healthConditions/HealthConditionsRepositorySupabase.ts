import type { SupabaseClient } from '@supabase/supabase-js';

import { ServerError } from '@/shared/errors/AppError';
import type { HealthCondition } from '@/types';

import type { IHealthConditionsRepository } from './IHealthConditionsRepository';

export class HealthConditionsRepositorySupabase implements IHealthConditionsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listActiveConditions(): Promise<HealthCondition[]> {
    const { data, error } = await this.client
      .from('health_conditions')
      .select('code, name, name_en, active, image')
      .eq('active', true)
      .order('code', { ascending: true });

    if (error) throw new ServerError(error);
    return (data ?? []) as HealthCondition[];
  }
}
