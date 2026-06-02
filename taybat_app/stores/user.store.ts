import { create } from 'zustand';

import type { AvatarConfig, User } from '@/types';
import type { UserProfile } from '@/types/auth.types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string;
  setUserFromProfile: (profile: UserProfile) => void;
  updateUser: (updates: Partial<User>) => void;
  resetUser: () => void;
}

const initialState = {
  user: null as User | null,
  isLoading: false,
  errorMessage: '',
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  setUserFromProfile: (profile) =>
    set({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: null,
        avatar_config: null as AvatarConfig | null,
        plan_start_date: profile.plan_start_date ?? null,
        language: 'ar',
        theme: 'system',
        post_visibility: 'public',
        follow_permission: 'everyone',
        profile_completed: profile.profile_completed,
      },
      isLoading: false,
      errorMessage: '',
    }),

  updateUser: (updates) =>
    set((state) => (state.user ? { user: { ...state.user, ...updates } } : state)),

  resetUser: () => set({ ...initialState }),
}));
