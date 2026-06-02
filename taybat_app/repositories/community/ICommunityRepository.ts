import type { CommunityPost, CommunityStats } from '@/types';

export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ICommunityRepository {
  getPosts(cursor: string | null, limit: number): Promise<PaginatedResult<CommunityPost>>;
  getStats(): Promise<CommunityStats[]>;
  getReactions(userId: string): Promise<number[]>;
  getFollows(userId: string): Promise<string[]>;
  toggleReaction(userId: string, postId: number): Promise<number[]>;
  toggleFollow(userId: string, targetUserId: string): Promise<string[]>;
}
