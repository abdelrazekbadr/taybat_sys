import { supabase } from '@/lib/supabase';
import { TopicsRepositoryMock } from './TopicsRepositoryMock';
import { TopicsRepositorySupabase } from './TopicsRepositorySupabase';
import type { ITopicsRepository } from './ITopicsRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const topicsRepository: ITopicsRepository = USE_MOCK
  ? new TopicsRepositoryMock()
  : new TopicsRepositorySupabase(supabase);

export type { ITopicsRepository } from './ITopicsRepository';
