import { supabase } from '@/lib/supabase';

import { HealthGoalsRepositoryMock } from './HealthGoalsRepositoryMock';
import { HealthGoalsRepositorySupabase } from './HealthGoalsRepositorySupabase';
import type { IHealthGoalsRepository } from './IHealthGoalsRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const healthGoalsRepository: IHealthGoalsRepository = USE_MOCK
  ? new HealthGoalsRepositoryMock()
  : new HealthGoalsRepositorySupabase(supabase);

export type { IHealthGoalsRepository } from './IHealthGoalsRepository';

