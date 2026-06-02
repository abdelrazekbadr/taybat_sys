import { supabase } from '@/lib/supabase';
import { TrackingRepositoryMock } from './TrackingRepositoryMock';
import { TrackingRepositorySupabase } from './TrackingRepositorySupabase';
import type { ITrackingRepository } from './ITrackingRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const trackingRepository: ITrackingRepository = USE_MOCK
  ? new TrackingRepositoryMock()
  : new TrackingRepositorySupabase(supabase);

export type { ITrackingRepository, CreateUserMealPayload } from './ITrackingRepository';
