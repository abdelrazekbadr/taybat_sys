/**
 * Supabase implementation of IAccountRepository.
 *
 * Expected table:
 *   user_preferences (user_id uuid pk references auth.users, avatar_config jsonb,
 *                     post_visibility text, follow_permission text, updated_at timestamptz)
 *
 *   meal_favorites   (user_id uuid, meal_id int)  -- or stored in user_preferences as jsonb array
 *
 * Name updates write to the `profiles` table (shared with auth).
 *
 * RLS: users can only read/write their own row (user_id = auth.uid()).
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';
import type { AccountPreferences, IAccountRepository } from './IAccountRepository';

export class AccountRepositorySupabase implements IAccountRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getPreferences(userId: string): Promise<AccountPreferences> {
    const { data, error } = await this.client
      .from('user_preferences')
      .select('avatar_config, post_visibility, follow_permission')
      .eq('user_id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw new ServerError(error);
    return {
      avatarConfig: (data?.avatar_config as AvatarConfig) ?? null,
      postVisibility: (data?.post_visibility as PostVisibility) ?? null,
      followPermission: (data?.follow_permission as FollowPermission) ?? null,
    };
  }

  async updateName(userId: string, name: string): Promise<void> {
    const { error } = await this.client
      .from('profiles')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw new ServerError(error);
  }

  async updateAvatar(userId: string, config: AvatarConfig): Promise<void> {
    await this.upsertPreference(userId, { avatar_config: config });
  }

  async updatePostVisibility(userId: string, value: PostVisibility): Promise<void> {
    await this.upsertPreference(userId, { post_visibility: value });
  }

  async updateFollowPermission(userId: string, value: FollowPermission): Promise<void> {
    await this.upsertPreference(userId, { follow_permission: value });
  }

  async getFavoriteMealIds(userId: string): Promise<number[]> {
    const { data, error } = await this.client
      .from('meal_favorites')
      .select('meal_id')
      .eq('user_id', userId);
    if (error) throw new ServerError(error);
    return (data ?? []).map((r: { meal_id: number }) => r.meal_id);
  }

  async saveFavoriteMealIds(userId: string, ids: number[]): Promise<void> {
    const { error: deleteError } = await this.client
      .from('meal_favorites')
      .delete()
      .eq('user_id', userId);
    if (deleteError) throw new ServerError(deleteError);
    if (ids.length === 0) return;
    const { error: insertError } = await this.client
      .from('meal_favorites')
      .insert(ids.map((meal_id) => ({ user_id: userId, meal_id })));
    if (insertError) throw new ServerError(insertError);
  }

  async deleteAccount(): Promise<void> {
    const { error } = await this.client.rpc('delete_user_account');
    if (error) throw new ServerError(error);
  }

  private async upsertPreference(userId: string, patch: Record<string, unknown>): Promise<void> {
    const { error } = await this.client
      .from('user_preferences')
      .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() });
    if (error) throw new ServerError(error);
  }
}
