import { supabase } from '@/lib/supabase';

import { HealthConditionsRepositoryMock } from './HealthConditionsRepositoryMock';
import { HealthConditionsRepositorySupabase } from './HealthConditionsRepositorySupabase';
import type { IHealthConditionsRepository } from './IHealthConditionsRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const healthConditionsRepository: IHealthConditionsRepository = USE_MOCK
  ? new HealthConditionsRepositoryMock()
  : new HealthConditionsRepositorySupabase(supabase);

export type { IHealthConditionsRepository } from './IHealthConditionsRepository';
