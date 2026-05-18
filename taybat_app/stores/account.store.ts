import { create } from 'zustand';
import { z } from 'zod';

import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import { accountService } from '@/api/account/account.service';
import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';

import { useCommunityStore } from './community.store';
import { useMealItemsStore } from './mealItems.store';
import { useMealsStore } from './meals.store';
import { useThemeStore } from './theme.store';
import { useUserMealsStore } from './userMeals.store';
import { useUserStore } from './user.store';
import { useWeeklyRatingStore } from './weeklyRating.store';
import { useMealPreferencesStore } from '@/stores/mealPreferences.store';

const nameSchema = z
  .string()
  .trim()
  .min(1, 'الاسم مطلوب')
  .max(60, 'الاسم طويل جداً');

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
      const prefs = await accountService.loadPreferences();
      set({
        draftName: user?.name ?? '',
        avatarConfig: prefs.avatarConfig,
        postVisibility: prefs.postVisibility ?? initialState.postVisibility,
        followPermission: prefs.followPermission ?? initialState.followPermission,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        ...initialState,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تحميل إعدادات الحساب',
      });
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

      await accountService.updateName(user.id, parsed.data);
      useUserStore.getState().updateUser({ name: parsed.data });

      set({ isEditingName: false, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ الاسم',
      });
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

      await accountService.updateAvatar(user.id, config);
      useUserStore.getState().updateUser({ avatar_config: config });
      set({ avatarConfig: config, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ الصورة الشخصية',
      });
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
      await accountService.updatePostVisibility(user.id, value);
      useUserStore.getState().updateUser({ post_visibility: value });
      set({ postVisibility: value, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ إعدادات الخصوصية',
      });
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
      await accountService.updateFollowPermission(user.id, value);
      useUserStore.getState().updateUser({ follow_permission: value });
      set({ followPermission: value, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ إعدادات المتابعة',
      });
      return false;
    }
  },

  logout: async () => {
    set({ isSaving: true, errorMessage: '' });
    try {
      await Promise.all([
        storageService.remove(STORAGE_KEYS.USER_NAME),
        storageService.remove(STORAGE_KEYS.AVATAR_CONFIG),
        storageService.remove(STORAGE_KEYS.POST_VISIBILITY),
        storageService.remove(STORAGE_KEYS.FOLLOW_PERMISSION),
        storageService.remove(STORAGE_KEYS.MEAL_ITEM_PREFERENCES),
        storageService.remove(STORAGE_KEYS.MEAL_FAVORITES),
        storageService.remove(STORAGE_KEYS.COMMUNITY_REACTIONS),
        storageService.remove(STORAGE_KEYS.COMMUNITY_FOLLOWS),
      ]);

      useCommunityStore.getState().resetCommunity();
      useMealsStore.getState().resetMeals();
      useMealItemsStore.getState().resetMealItems();
      useUserMealsStore.getState().resetUserMeals();
      useWeeklyRatingStore.getState().resetWeeklyRatings();
      useMealPreferencesStore.getState().resetPreferences();
      await useThemeStore.getState().resetTheme();
      useUserStore.getState().resetUser();

      set({ ...initialState, isSaving: false });
      return true;
    } catch (error: unknown) {
      set({
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الخروج',
      });
      return false;
    }
  },

  resetAccount: () => set({ ...initialState }),
}));
