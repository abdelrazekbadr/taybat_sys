import { supabase } from '@/lib/supabase';
import { AccountRepositoryMock } from './AccountRepositoryMock';
import { AccountRepositorySupabase } from './AccountRepositorySupabase';
import type { IAccountRepository } from './IAccountRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const accountRepository: IAccountRepository = USE_MOCK
  ? new AccountRepositoryMock()
  : new AccountRepositorySupabase(supabase);

export type { IAccountRepository, AccountPreferences } from './IAccountRepository';
