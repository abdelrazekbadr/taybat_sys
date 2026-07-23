import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { userProfileRepository } from '@/repositories/auth';
import { toUserMessage } from '@/shared/errors/AppError';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import type { AvatarConfig, User } from '@/types';
import type { UserProfile } from '@/types/auth.types';

import { persistJSONStorage } from './_persist';

interface UserState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string;
  setUserFromProfile: (profile: UserProfile) => void;
  updateUser: (updates: Partial<User>) => void;
  reloadProfile: () => Promise<void>;
  resetUser: () => void;
}

const initialState = {
  user: null as User | null,
  isLoading: false,
  errorMessage: '',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      setUserFromProfile: (profile) =>
        set({
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            gender: profile.gender,
            avatar_url: null,
            avatar_config: null as AvatarConfig | null,
            plan_start_date: profile.plan_start_date ?? null,
            next_rating_date: profile.next_rating_date ?? null,
            language: 'ar',
            theme: 'system',
            post_visibility: 'public',
            follow_permission: 'everyone',
            profile_completed: profile.profile_completed,
            registered_at: profile.created_at,
          },
          isLoading: false,
          errorMessage: '',
        }),

      updateUser: (updates) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...updates } } : state,
        ),

      reloadProfile: async () => {
        const userId = useUserStore.getState().user?.id;
        if (!userId) return;
        try {
          const profile = await userProfileRepository.getProfile(userId);
          if (profile) useUserStore.getState().setUserFromProfile(profile);
        } catch (error: unknown) {
          set({ errorMessage: toUserMessage(error) });
        }
      },

      resetUser: () => set({ ...initialState }),
    }),
    {
      name: STORAGE_KEYS.CACHE_USER_PROFILE,
      storage: persistJSONStorage,
      // Cache the profile so the home screen renders offline instead of hanging
      // on the loading spinner. Cleared on logout via resetUser().
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
