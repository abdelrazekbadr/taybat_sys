import { supabase } from '@/lib/supabase';

import type { IUserRatingRepository } from './IUserRatingRepository';
import { UserRatingRepositoryMock } from './UserRatingRepositoryMock';
import { UserRatingRepositorySupabase } from './UserRatingRepositorySupabase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const userRatingRepository: IUserRatingRepository = USE_MOCK
  ? new UserRatingRepositoryMock()
  : new UserRatingRepositorySupabase(supabase);

export type { IUserRatingRepository, CreateUserRatingPayload } from './IUserRatingRepository';

