/**
 * Supabase implementation of ICommunityRepository.
 *
 * Expected tables:
 *   community_posts  (id, user_id uuid, author_name, author_avatar, content, image_url,
 *                     post_type, is_pinned, love_count, created_at, updated_at)
 *   post_reactions   (user_id uuid, post_id bigint)  -- composite PK
 *   user_follows     (follower_id uuid, target_id uuid) -- composite PK
 *   community_stats  (month, active_users, avg_health_score, avg_adherence_score, total_meals_logged)
 *
 * RLS:
 *   community_posts  — read: authenticated; write: owner only
 *   post_reactions   — all: own rows (user_id = auth.uid())
 *   user_follows     — all: own rows (follower_id = auth.uid())
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ServerError } from '@/shared/errors/AppError';
import type { CommunityPost, CommunityStats } from '@/types';
import type { ICommunityRepository, PaginatedResult } from './ICommunityRepository';

export class CommunityRepositorySupabase implements ICommunityRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getPosts(cursor: string | null, limit: number): Promise<PaginatedResult<CommunityPost>> {
    let query = this.client
      .from('community_posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (cursor) {
      query = query.lt('created_at', cursor);
    }
    const { data, error } = await query;
    if (error) throw new ServerError(error);
    const items = (data ?? []) as CommunityPost[];
    const nextCursor = items.length ? items[items.length - 1]!.created_at : null;
    return { items, nextCursor, hasMore: items.length === limit };
  }

  async getStats(): Promise<CommunityStats[]> {
    const { data, error } = await this.client
      .from('community_stats')
      .select('*')
      .order('month', { ascending: false });
    if (error) throw new ServerError(error);
    return (data ?? []) as CommunityStats[];
  }

  async getReactions(userId: string): Promise<number[]> {
    const { data, error } = await this.client
      .from('post_reactions')
      .select('post_id')
      .eq('user_id', userId);
    if (error) throw new ServerError(error);
    return (data ?? []).map((r: { post_id: number }) => r.post_id);
  }

  async getFollows(userId: string): Promise<string[]> {
    const { data, error } = await this.client
      .from('user_follows')
      .select('target_id')
      .eq('follower_id', userId);
    if (error) throw new ServerError(error);
    return (data ?? []).map((r: { target_id: string }) => r.target_id);
  }

  async toggleReaction(userId: string, postId: number): Promise<number[]> {
    const current = await this.getReactions(userId);
    const isLiked = current.includes(postId);
    if (isLiked) {
      const { error } = await this.client
        .from('post_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId);
      if (error) throw new ServerError(error);
    } else {
      const { error } = await this.client
        .from('post_reactions')
        .insert({ user_id: userId, post_id: postId });
      if (error) throw new ServerError(error);
    }
    return this.getReactions(userId);
  }

  async toggleFollow(userId: string, targetUserId: string): Promise<string[]> {
    const current = await this.getFollows(userId);
    const isFollowing = current.includes(targetUserId);
    if (isFollowing) {
      const { error } = await this.client
        .from('user_follows')
        .delete()
        .eq('follower_id', userId)
        .eq('target_id', targetUserId);
      if (error) throw new ServerError(error);
    } else {
      const { error } = await this.client
        .from('user_follows')
        .insert({ follower_id: userId, target_id: targetUserId });
      if (error) throw new ServerError(error);
    }
    return this.getFollows(userId);
  }
}
