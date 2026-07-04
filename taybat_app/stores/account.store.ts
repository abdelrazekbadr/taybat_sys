import { create } from 'zustand';
import { z } from 'zod';

import { authService } from '@/api/auth/auth.service';
import { accountRepository } from '@/repositories/account';
import { toUserMessage } from '@/shared/errors/AppError';
import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';

import { resetAllAppStores } from './storeReset';
import { useUserStore } from './user.store';

const nameSchema = z.string().trim().min(1, 'الاسم مطلوب').max(60, 'الاسم طويل جداً');

interface AccountState {
  isEditingName: boolean;
  draftName: string;
  avatarConfig: AvatarConfig | null;
  postVisibility: PostVisibility;
  followPermission: FollowPermission;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;

  setDraftName: (value: string) => void;
  initializeAccount: () => Promise<void>;
  startEditName: () => void;
  cancelEditName: () => void;
  confirmEditName: () => Promise<boolean>;

  updateAvatar: (config: AvatarConfig) => Promise<boolean>;
  updatePostVisibility: (value: PostVisibility) => Promise<boolean>;
  updateFollowPermission: (value: FollowPermission) => Promise<boolean>;
  logout: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;

  resetAccount: () => void;
}

const initialState = {
  isEditingName: false,
  draftName: '',
  avatarConfig: null as AvatarConfig | null,
  postVisibility: 'public' as PostVisibility,
  followPermission: 'everyone' as FollowPermission,
  isLoading: false,
  isSaving: false,
  errorMessage: '',
};

export const useAccountStore = create<AccountState>((set) => ({
  ...initialState,

  setDraftName: (value) => set({ draftName: value }),

  initializeAccount: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const prefs = await accountRepository.getPreferences(user?.id ?? '');
      set({
        draftName: user?.name ?? '',
        avatarConfig: prefs.avatarConfig,
        postVisibility: prefs.postVisibility ?? initialState.postVisibility,
        followPermission: prefs.followPermission ?? initialState.followPermission,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({ ...initialState, isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  startEditName: () => {
    const user = useUserStore.getState().user;
    set({ isEditingName: true, draftName: user?.name ?? '' });
  },

  cancelEditName: () => {
    const user = useUserStore.getState().user;
    set({ isEditingName: false, draftName: user?.name ?? '', errorMessage: '' });
  },

  confirmEditName: async () => {
    set({ isSaving: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isSaving: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }
      const parsed = nameSchema.safeParse(useAccountStore.getState().draftName);
      if (!parsed.success) {
        set({ isSaving: false, errorMessage: parsed.error.issues[0]?.message ?? 'الاسم غير صالح' });
        return false;
      }
      await accountRepository.updateName(user.id, parsed.data);
      useUserStore.getState().updateUser({ name: parsed.data });
      set({ isEditingName: false, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  updateAvatar: async (config) => {
    set({ isSaving: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isSaving: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }
      await accountRepository.updateAvatar(user.id, config);
      useUserStore.getState().updateUser({ avatar_config: config });
      set({ avatarConfig: config, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  updatePostVisibility: async (value) => {
    set({ isSaving: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isSaving: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }
      await accountRepository.updatePostVisibility(user.id, value);
      useUserStore.getState().updateUser({ post_visibility: value });
      set({ postVisibility: value, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  updateFollowPermission: async (value) => {
    set({ isSaving: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isSaving: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }
      await accountRepository.updateFollowPermission(user.id, value);
      useUserStore.getState().updateUser({ follow_permission: value });
      set({ followPermission: value, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  logout: async () => {
    set({ isSaving: true, errorMessage: '' });
    try {
      await resetAllAppStores();
      set({ ...initialState, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  deleteAccount: async () => {
    set({ isSaving: true, errorMessage: '' });
    try {
      // Revoke OAuth tokens BEFORE deleting from the database so the revocation
      // request reaches Google's servers while the session is still valid.
      // This forces the account picker to appear on the next Google sign-in.
      await authService.revokeOAuthTokens();
      await accountRepository.deleteAccount();
      await resetAllAppStores();
      set({ ...initialState, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  resetAccount: () => set({ ...initialState }),
}));
