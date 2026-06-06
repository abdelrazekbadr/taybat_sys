import { supabase } from '@/lib/supabase';
import { NotificationsRepositoryMock } from './NotificationsRepositoryMock';
import { NotificationsRepositorySupabase } from './NotificationsRepositorySupabase';
import type { INotificationsRepository } from './INotificationsRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const notificationsRepository: INotificationsRepository = USE_MOCK
  ? new NotificationsRepositoryMock()
  : new NotificationsRepositorySupabase(supabase);

export type { INotificationsRepository } from './INotificationsRepository';
