import { create } from 'zustand';

import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import { MOCK_COMMUNITY_POSTS, MOCK_COMMUNITY_STATS } from '@/data/mock';
import type { CommunityPost, CommunityStats } from '@/types';

const PAGE_SIZE = 10;

const sortPosts = (posts: CommunityPost[]) => {
  return [...posts].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

const pagePosts = (all: CommunityPost[], cursor: string | null, limit: number) => {
  const sorted = sortPosts(all);
  if (!cursor) {
    return sorted.slice(0, limit);
  }
  const cursorTime = new Date(cursor).getTime();
  return sorted.filter((p) => !p.is_pinned && new Date(p.created_at).getTime() < cursorTime).slice(0, limit);
};

const safeReadNumberArray = async (key: string) => {
  try {
    const value = await storageService.get<unknown>(key);
    if (!Array.isArray(value)) return [] as number[];
    return value.filter((v): v is number => typeof v === 'number');
  } catch {
    return [] as number[];
  }
};

interface CommunityState {
  posts: CommunityPost[];
  userReactions: number[];
  userFollows: number[];
  stats: CommunityStats[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  cursor: string | null;
  errorMessage: string;

  initializeCommunity: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  toggleReaction: (postId: number) => Promise<void>;
  toggleFollow: (userId: number) => Promise<void>;
  resetCommunity: () => void;
}

const initialState = {
  posts: [] as CommunityPost[],
  userReactions: [] as number[],
  userFollows: [] as number[],
  stats: [] as CommunityStats[],
  isLoading: false,
  isLoadingMore: false,
  hasMore: true,
  cursor: null as string | null,
  errorMessage: '',
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  ...initialState,

  initializeCommunity: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const [userReactions, userFollows] = await Promise.all([
        safeReadNumberArray(STORAGE_KEYS.COMMUNITY_REACTIONS),
        safeReadNumberArray(STORAGE_KEYS.COMMUNITY_FOLLOWS),
      ]);

      const firstPage = pagePosts(MOCK_COMMUNITY_POSTS, null, PAGE_SIZE);
      const nextCursor = firstPage.length ? firstPage[firstPage.length - 1]!.created_at : null;
      const more = pagePosts(MOCK_COMMUNITY_POSTS, nextCursor, 1).length > 0;

      set({
        posts: firstPage,
        cursor: nextCursor,
        hasMore: more,
        stats: MOCK_COMMUNITY_STATS,
        userReactions,
        userFollows,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        ...initialState,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load community',
      });
    }
  },

  loadMorePosts: async () => {
    const { isLoadingMore, hasMore, cursor } = get();
    if (isLoadingMore || !hasMore) return;
    set({ isLoadingMore: true, errorMessage: '' });
    try {
      const nextPage = pagePosts(MOCK_COMMUNITY_POSTS, cursor, PAGE_SIZE);
      const current = get().posts;
      const merged = [...current, ...nextPage];
      const nextCursor = nextPage.length ? nextPage[nextPage.length - 1]!.created_at : cursor;
      const more = nextCursor ? pagePosts(MOCK_COMMUNITY_POSTS, nextCursor, 1).length > 0 : false;

      set({ posts: merged, cursor: nextCursor, hasMore: more, isLoadingMore: false });
    } catch (error: unknown) {
      set({
        isLoadingMore: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load more posts',
      });
    }
  },

  refreshPosts: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const firstPage = pagePosts(MOCK_COMMUNITY_POSTS, null, PAGE_SIZE);
      const nextCursor = firstPage.length ? firstPage[firstPage.length - 1]!.created_at : null;
      const more = pagePosts(MOCK_COMMUNITY_POSTS, nextCursor, 1).length > 0;
      set({ posts: firstPage, cursor: nextCursor, hasMore: more, stats: MOCK_COMMUNITY_STATS, isLoading: false });
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to refresh posts',
      });
    }
  },

  toggleReaction: async (postId) => {
    const prevPosts = get().posts;
    const prevReactions = get().userReactions;
    const isLoved = prevReactions.includes(postId);

    const nextReactions = isLoved ? prevReactions.filter((id) => id !== postId) : [...prevReactions, postId];
    const nextPosts = prevPosts.map((p) => {
      if (p.id !== postId) return p;
      const loveCount = isLoved ? Math.max(0, p.love_count - 1) : p.love_count + 1;
      return { ...p, love_count: loveCount };
    });

    set({ userReactions: nextReactions, posts: nextPosts, errorMessage: '' });
    try {
      await storageService.set(STORAGE_KEYS.COMMUNITY_REACTIONS, nextReactions);
    } catch (error: unknown) {
      set({
        userReactions: prevReactions,
        posts: prevPosts,
        errorMessage: error instanceof Error ? error.message : 'Failed to save reaction',
      });
    }
  },

  toggleFollow: async (userId) => {
    const prev = get().userFollows;
    const isFollowing = prev.includes(userId);
    const next = isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId];
    set({ userFollows: next, errorMessage: '' });
    try {
      await storageService.set(STORAGE_KEYS.COMMUNITY_FOLLOWS, next);
    } catch (error: unknown) {
      set({
        userFollows: prev,
        errorMessage: error instanceof Error ? error.message : 'Failed to save follow state',
      });
    }
  },

  resetCommunity: () => {
    set({ ...initialState });
  },
}));

