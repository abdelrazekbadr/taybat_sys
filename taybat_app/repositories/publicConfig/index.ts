import { supabase } from '@/lib/supabase';

import { PublicConfigRepositoryMock } from './PublicConfigRepositoryMock';
import { PublicConfigRepositorySupabase } from './PublicConfigRepositorySupabase';
import type { IPublicConfigRepository } from './IPublicConfigRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const publicConfigRepository: IPublicConfigRepository = USE_MOCK
  ? new PublicConfigRepositoryMock()
  : new PublicConfigRepositorySupabase(supabase);

export type {
  IPublicConfigRepository,
  NotificationConfig,
  ShareConfig,
} from './IPublicConfigRepository';
export {
  DEFAULT_MEAL_IMAGE_BASE_URL,
  DEFAULT_NOTIFICATION_CONFIG,
  DEFAULT_RATING_MIN_COMMITMENT_DAYS,
  DEFAULT_SHARE_CONFIG,
} from './IPublicConfigRepository';
