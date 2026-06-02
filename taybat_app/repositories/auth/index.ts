import { supabase } from '@/lib/supabase';
import { AuthRepositoryMock } from './AuthRepositoryMock';
import { AuthRepositorySupabase } from './AuthRepositorySupabase';
import { UserProfileRepositoryMock } from './UserProfileRepositoryMock';
import { UserProfileRepositorySupabase } from './UserProfileRepositorySupabase';
import type { IAuthRepository } from './IAuthRepository';
import type { IUserProfileRepository } from './IUserProfileRepository';

// Set EXPO_PUBLIC_USE_MOCK=false in .env to use real Supabase.
// Defaults to mock so the app works without backend credentials.
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const authRepository: IAuthRepository = USE_MOCK
  ? new AuthRepositoryMock()
  : new AuthRepositorySupabase(supabase);

export const userProfileRepository: IUserProfileRepository = USE_MOCK
  ? new UserProfileRepositoryMock()
  : new UserProfileRepositorySupabase(supabase);

export type { IAuthRepository } from './IAuthRepository';
export type { IUserProfileRepository } from './IUserProfileRepository';
