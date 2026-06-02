import { supabase } from '@/lib/supabase';
import { MealRepositoryMock } from './MealRepositoryMock';
import { MealRepositorySupabase } from './MealRepositorySupabase';
import type { IMealRepository } from './IMealRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const mealRepository: IMealRepository = USE_MOCK
  ? new MealRepositoryMock()
  : new MealRepositorySupabase(supabase);

export type { IMealRepository } from './IMealRepository';
