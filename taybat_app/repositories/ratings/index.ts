import { supabase } from '@/lib/supabase';
import { RatingRepositoryMock } from './RatingRepositoryMock';
import { RatingRepositorySupabase } from './RatingRepositorySupabase';
import type { IRatingRepository } from './IRatingRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const ratingRepository: IRatingRepository = USE_MOCK
  ? new RatingRepositoryMock()
  : new RatingRepositorySupabase(supabase);

export type { IRatingRepository, CreateRatingPayload } from './IRatingRepository';
