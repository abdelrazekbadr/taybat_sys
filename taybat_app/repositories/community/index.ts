import { supabase } from '@/lib/supabase';
import { CommunityRepositoryMock } from './CommunityRepositoryMock';
import { CommunityRepositorySupabase } from './CommunityRepositorySupabase';
import type { ICommunityRepository } from './ICommunityRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const communityRepository: ICommunityRepository = USE_MOCK
  ? new CommunityRepositoryMock()
  : new CommunityRepositorySupabase(supabase);

export type { ICommunityRepository, PaginatedResult } from './ICommunityRepository';
