import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';

import {
  fetchAccountPreferences,
  updateAvatarConfig,
  updateFollowPermission,
  updatePostVisibility,
  updateUserName,
} from './accountApi';

class AccountService {
  async loadPreferences(): Promise<{
    avatarConfig: AvatarConfig | null;
    postVisibility: PostVisibility | null;
    followPermission: FollowPermission | null;
  }> {
    return fetchAccountPreferences();
  }

  async updateName(userId: number, name: string): Promise<void> {
    try {
      await updateUserName(userId, name);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'تعذّر حفظ الاسم');
      }
      throw new Error('تعذّر حفظ الاسم');
    }
  }

  async updateAvatar(userId: number, config: AvatarConfig): Promise<void> {
    try {
      await updateAvatarConfig(userId, config);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'تعذّر حفظ الصورة الشخصية');
      }
      throw new Error('تعذّر حفظ الصورة الشخصية');
    }
  }

  async updatePostVisibility(userId: number, value: PostVisibility): Promise<void> {
    try {
      await updatePostVisibility(userId, value);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'تعذّر حفظ إعدادات الخصوصية');
      }
      throw new Error('تعذّر حفظ إعدادات الخصوصية');
    }
  }

  async updateFollowPermission(userId: number, value: FollowPermission): Promise<void> {
    try {
      await updateFollowPermission(userId, value);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || 'تعذّر حفظ إعدادات المتابعة');
      }
      throw new Error('تعذّر حفظ إعدادات المتابعة');
    }
  }
}

export const accountService = new AccountService();
