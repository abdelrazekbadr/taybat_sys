import { MOCK_COMMUNITY_POSTS, MOCK_COMMUNITY_STATS } from '@/data/mock';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type { CommunityPost, CommunityStats } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { ICommunityRepository, PaginatedResult } from './ICommunityRepository';

const PAGE_SIZE_DEFAULT = 10;

function sortPosts(posts: CommunityPost[]): CommunityPost[] {
  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

async function readNumberArray(key: string): Promise<number[]> {
  try {
    const value = await storageService.get<unknown>(key);
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is number => typeof v === 'number');
  } catch {
    return [];
  }
}

async function readStringArray(key: string): Promise<string[]> {
  try {
    const value = await storageService.get<unknown>(key);
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

export class CommunityRepositoryMock implements ICommunityRepository {
  async getPosts(cursor: string | null, limit: number = PAGE_SIZE_DEFAULT): Promise<PaginatedResult<CommunityPost>> {
    await mockDelay();
    const sorted = sortPosts(MOCK_COMMUNITY_POSTS);
    let page: CommunityPost[];
    if (!cursor) {
      page = sorted.slice(0, limit);
    } else {
      const cursorTime = new Date(cursor).getTime();
      page = sorted
        .filter((p) => !p.is_pinned && new Date(p.created_at).getTime() < cursorTime)
        .slice(0, limit);
    }
    const nextCursor = page.length ? page[page.length - 1]!.created_at : null;
    const hasMore = nextCursor
      ? sortPosts(MOCK_COMMUNITY_POSTS)
          .filter((p) => !p.is_pinned && new Date(p.created_at).getTime() < new Date(nextCursor).getTime())
          .length > 0
      : false;
    return { items: page, nextCursor, hasMore };
  }

  async getStats(): Promise<CommunityStats[]> {
    await mockDelay(150);
    return MOCK_COMMUNITY_STATS;
  }

  async getReactions(_userId: string): Promise<number[]> {
    return readNumberArray(STORAGE_KEYS.COMMUNITY_REACTIONS);
  }

  async getFollows(_userId: string): Promise<string[]> {
    return readStringArray(STORAGE_KEYS.COMMUNITY_FOLLOWS);
  }

  async toggleReaction(_userId: string, postId: number): Promise<number[]> {
    await mockDelay(150);
    const current = await readNumberArray(STORAGE_KEYS.COMMUNITY_REACTIONS);
    const next = current.includes(postId) ? current.filter((id) => id !== postId) : [...current, postId];
    await storageService.set(STORAGE_KEYS.COMMUNITY_REACTIONS, next);
    return next;
  }

  async toggleFollow(_userId: string, targetUserId: string): Promise<string[]> {
    await mockDelay(150);
    const current = await readStringArray(STORAGE_KEYS.COMMUNITY_FOLLOWS);
    const next = current.includes(targetUserId)
      ? current.filter((id) => id !== targetUserId)
      : [...current, targetUserId];
    await storageService.set(STORAGE_KEYS.COMMUNITY_FOLLOWS, next);
    return next;
  }
}
