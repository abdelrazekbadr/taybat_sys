import { create } from 'zustand';

import { communityRepository } from '@/repositories/community';
import { toUserMessage } from '@/shared/errors/AppError';
import type { CommunityPost, CommunityStats } from '@/types';

import { useUserStore } from './user.store';

const PAGE_SIZE = 10;

interface CommunityState {
  posts: CommunityPost[];
  userReactions: number[];
  userFollows: string[];
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
  toggleFollow: (userId: string) => Promise<void>;
  resetCommunity: () => void;
}

const initialState = {
  posts: [] as CommunityPost[],
  userReactions: [] as number[],
  userFollows: [] as string[],
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
      const user = useUserStore.getState().user;
      const userId = user?.id ?? '';
      const [result, stats, userReactions, userFollows] = await Promise.all([
        communityRepository.getPosts(null, PAGE_SIZE),
        communityRepository.getStats(),
        communityRepository.getReactions(userId),
        communityRepository.getFollows(userId),
      ]);
      set({ posts: result.items, cursor: result.nextCursor, hasMore: result.hasMore, stats, userReactions, userFollows, isLoading: false });
    } catch (error: unknown) {
      set({ ...initialState, isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  loadMorePosts: async () => {
    const { isLoadingMore, hasMore, cursor } = get();
    if (isLoadingMore || !hasMore) return;
    set({ isLoadingMore: true, errorMessage: '' });
    try {
      const result = await communityRepository.getPosts(cursor, PAGE_SIZE);
      set((state) => ({
        posts: [...state.posts, ...result.items],
        cursor: result.nextCursor,
        hasMore: result.hasMore,
        isLoadingMore: false,
      }));
    } catch (error: unknown) {
      set({ isLoadingMore: false, errorMessage: toUserMessage(error) });
    }
  },

  refreshPosts: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const [result, stats] = await Promise.all([
        communityRepository.getPosts(null, PAGE_SIZE),
        communityRepository.getStats(),
      ]);
      set({ posts: result.items, cursor: result.nextCursor, hasMore: result.hasMore, stats, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  toggleReaction: async (postId) => {
    const prevPosts = get().posts;
    const prevReactions = get().userReactions;
    const isLoved = prevReactions.includes(postId);

    // Optimistic update
    const nextPosts = prevPosts.map((p) =>
      p.id !== postId ? p : { ...p, love_count: isLoved ? Math.max(0, p.love_count - 1) : p.love_count + 1 },
    );
    set({ userReactions: isLoved ? prevReactions.filter((id) => id !== postId) : [...prevReactions, postId], posts: nextPosts });

    try {
      const user = useUserStore.getState().user;
      const nextReactions = await communityRepository.toggleReaction(user?.id ?? '', postId);
      set({ userReactions: nextReactions });
    } catch (error: unknown) {
      set({ userReactions: prevReactions, posts: prevPosts, errorMessage: toUserMessage(error) });
    }
  },

  toggleFollow: async (userId) => {
    const prev = get().userFollows;
    const optimistic = prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId];
    set({ userFollows: optimistic });

    try {
      const currentUser = useUserStore.getState().user;
      const next = await communityRepository.toggleFollow(currentUser?.id ?? '', userId);
      set({ userFollows: next });
    } catch (error: unknown) {
      set({ userFollows: prev, errorMessage: toUserMessage(error) });
    }
  },

  resetCommunity: () => set({ ...initialState }),
}));
