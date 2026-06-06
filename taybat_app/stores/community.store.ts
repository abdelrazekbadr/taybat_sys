import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { communityRepository } from '@/repositories/community';
import { toUserMessage } from '@/shared/errors/AppError';
import type { CommunityPost, CommunityStats } from '@/types';

import { useUserStore } from './user.store';

const PAGE_SIZE = 10;
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

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

// Module-level channel ref — not reactive state, just a cleanup handle
let realtimeChannel: RealtimeChannel | null = null;

function setupLoveCountChannel() {
  if (USE_MOCK || realtimeChannel) return;
  realtimeChannel = supabase
    .channel('community_love_counts')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'community_posts' },
      (payload) => {
        const updated = payload.new as { id: number; love_count: number };
        useCommunityStore.setState((state) => ({
          posts: state.posts.map((p) =>
            p.id === updated.id ? { ...p, love_count: updated.love_count } : p,
          ),
        }));
      },
    )
    .subscribe();
}

function teardownLoveCountChannel() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  ...initialState,

  initializeCommunity: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const userId = user?.id ?? '';
      const [result, stats, fetchedReactions, fetchedFollows] = await Promise.all([
        communityRepository.getPosts(null, PAGE_SIZE),
        communityRepository.getStats(),
        // Only fetch user-specific data when we have a real userId.
        // An empty string returns [] and would wipe a correctly loaded state.
        userId ? communityRepository.getReactions(userId) : Promise.resolve(get().userReactions),
        userId ? communityRepository.getFollows(userId)  : Promise.resolve(get().userFollows),
      ]);
      set({
        posts: result.items,
        cursor: result.nextCursor,
        hasMore: result.hasMore,
        stats,
        userReactions: fetchedReactions,
        userFollows: fetchedFollows,
        isLoading: false,
      });
      setupLoveCountChannel();
    } catch (error: unknown) {
      set({ ...initialState, isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  loadMorePosts: async () => {
    const { isLoadingMore, hasMore, cursor, isLoading } = get();
    // cursor === null means initializeCommunity hasn't finished yet — guard
    // against the race where onEndReached fires on an empty list before the
    // first page loads, causing both functions to fetch page 1 simultaneously.
    if (isLoadingMore || isLoading || !hasMore || cursor === null) return;
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

    // Optimistic update (immediate UI feedback)
    const nextPosts = prevPosts.map((p) =>
      p.id !== postId ? p : { ...p, love_count: isLoved ? Math.max(0, p.love_count - 1) : p.love_count + 1 },
    );
    set({ userReactions: isLoved ? prevReactions.filter((id) => id !== postId) : [...prevReactions, postId], posts: nextPosts });

    try {
      const user = useUserStore.getState().user;
      const nextReactions = await communityRepository.toggleReaction(user?.id ?? '', postId);
      // The repository checks the DB independently — its result is authoritative.
      // If it took the OPPOSITE action to what the store optimistically assumed
      // (e.g. store thought un-liked but DB had the row → repository deleted),
      // correct the love_count so it reflects reality.
      const actuallyAdded = nextReactions.includes(postId);
      const optimisticallyAdded = !isLoved;
      set((state) => {
        if (actuallyAdded === optimisticallyAdded) {
          // Optimistic was correct — only sync reaction list
          return { userReactions: nextReactions };
        }
        // Undo the wrong optimistic delta (+1 or -1) and apply the real one
        const correction = (actuallyAdded ? 1 : -1) - (optimisticallyAdded ? 1 : -1);
        return {
          userReactions: nextReactions,
          posts: state.posts.map((p) =>
            p.id !== postId ? p : { ...p, love_count: Math.max(0, p.love_count + correction) },
          ),
        };
      });
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

  resetCommunity: () => {
    teardownLoveCountChannel();
    set({ ...initialState });
  },
}));
