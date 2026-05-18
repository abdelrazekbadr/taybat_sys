import { create } from 'zustand';

import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import { MOCK_USER } from '@/data/mock';
import type { AvatarConfig, FollowPermission, PostVisibility, User } from '@/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  errorMessage: string;
  initializeUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  resetUser: () => void;
}

const initialState = {
  user: null as User | null,
  isLoading: false,
  errorMessage: '',
};

const toPostVisibility = (value: string | null): PostVisibility | null => {
  if (value === 'public' || value === 'followers') return value;
  return null;
};

const toFollowPermission = (value: string | null): FollowPermission | null => {
  if (value === 'everyone' || value === 'approved') return value;
  return null;
};

const safeGetAvatarConfig = async (): Promise<AvatarConfig | null> => {
  try {
    const value = await storageService.get<unknown>(STORAGE_KEYS.AVATAR_CONFIG);
    if (!value || typeof value !== 'object') return null;
    const v = value as Partial<AvatarConfig>;
    if (v.type !== 'letter' && v.type !== 'emoji') return null;
    if (typeof v.value !== 'string' || v.value.length === 0) return null;
    if (typeof v.color !== 'undefined' && typeof v.color !== 'string') return null;
    return { type: v.type, value: v.value, color: v.color };
  } catch {
    return null;
  }
};

export const useUserStore = create<UserState>((set) => ({
  ...initialState,

  initializeUser: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const [savedName, savedAvatarConfig, savedPostVisibility, savedFollowPermission] = await Promise.all([
        storageService.getString(STORAGE_KEYS.USER_NAME),
        safeGetAvatarConfig(),
        storageService.getString(STORAGE_KEYS.POST_VISIBILITY),
        storageService.getString(STORAGE_KEYS.FOLLOW_PERMISSION),
      ]);

      const user: User = {
        ...MOCK_USER,
        name: savedName?.trim() ? savedName.trim() : MOCK_USER.name,
        avatar_config: savedAvatarConfig ?? MOCK_USER.avatar_config,
        post_visibility: toPostVisibility(savedPostVisibility) ?? MOCK_USER.post_visibility,
        follow_permission: toFollowPermission(savedFollowPermission) ?? MOCK_USER.follow_permission,
      };

      set({ user, isLoading: false });
    } catch (error: unknown) {
      set({
        user: null,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'Failed to load user',
      });
    }
  },

  refreshUser: async () => {
    await useUserStore.getState().initializeUser();
  },

  updateUser: (updates) => {
    set((state) => (state.user ? { user: { ...state.user, ...updates } } : state));
  },

  resetUser: () => set({ ...initialState }),
}));
