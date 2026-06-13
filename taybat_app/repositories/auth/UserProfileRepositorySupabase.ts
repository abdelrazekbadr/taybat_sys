/**
 * Supabase implementation of IUserProfileRepository.
 * Reads/writes to the `profiles` table which mirrors the UserProfile shape.
 *
 * Expected Supabase table schema (profiles):
 *   id              uuid primary key references auth.users(id) on delete cascade
 *   email           text not null
 *   name            text
 *   gender          text         -- 'male' | 'female'
 *   birth_year      int
 *   weight_kg       numeric
 *   height_cm       numeric
 *   activity_level  text         -- 'sedentary' | 'light' | 'moderate' | 'active'
 *   health_goals_codes text      -- CSV of goal codes (e.g. "HG01,HG02")
 *   health_conditions_codes text -- CSV of condition codes (e.g. "HC01,HC08")
 *   provider        text not null
 *   profile_completed boolean default false
 *   created_at      timestamptz default now()
 *   updated_at      timestamptz default now()
 *
 * Enable RLS: users can only read/write their own row.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { NotFoundError, ServerError } from '@/shared/errors/AppError';
import { createLogger } from '@/lib/logger';
import type { UserProfile } from '@/types';
import type { IUserProfileRepository } from './IUserProfileRepository';

const log = createLogger('Profile');

export class UserProfileRepositorySupabase implements IUserProfileRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getProfile(userId: string): Promise<UserProfile | null> {
    log.debug('[Profile] getProfile →', userId);
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      log.error('[Profile] getProfile ERROR:', {
        code: error.code, message: error.message, details: error.details, hint: error.hint,
      });
      throw new ServerError(error);
    }
    log.debug('[Profile] getProfile ← found:', !!data);
    if (!data) return null;
    return data as UserProfile;
  }

  async upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const payload = { ...data, id: userId, updated_at: new Date().toISOString() };
    log.debug('[Profile] upsertProfile → userId:', userId, 'fields:', Object.keys(payload));
    const { data: result, error } = await this.client
      .from('profiles')
      .upsert(payload)
      .select()
      .single();
    if (error) {
      log.error('[Profile] upsertProfile ERROR:', {
        code: error.code, message: error.message, details: error.details, hint: error.hint,
        payload,
      });
      throw new ServerError(error);
    }
    log.debug('[Profile] upsertProfile ← success');
    if (!result) throw new NotFoundError('Profile');
    return result as UserProfile;
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    const payload = { ...data, updated_at: new Date().toISOString() };
    log.debug('[Profile] updateProfile → userId:', userId, 'fields:', Object.keys(payload));
    const { error } = await this.client
      .from('profiles')
      .update(payload)
      .eq('id', userId);
    if (error) {
      log.error('[Profile] updateProfile ERROR:', {
        code: error.code, message: error.message, details: error.details, hint: error.hint,
        payload,
      });
      throw new ServerError(error);
    }
    log.debug('[Profile] updateProfile ← success');
  }
}
