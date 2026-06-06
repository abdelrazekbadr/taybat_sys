import { supabase } from '@/lib/supabase';
import { MembershipRepositoryMock } from './MembershipRepositoryMock';
import { MembershipRepositorySupabase } from './MembershipRepositorySupabase';
import type { IMembershipRepository } from './IMembershipRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const membershipRepository: IMembershipRepository = USE_MOCK
  ? new MembershipRepositoryMock()
  : new MembershipRepositorySupabase(supabase);

export type { IMembershipRepository } from './IMembershipRepository';
