import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';
import type { AccountPreferences, IAccountRepository } from './IAccountRepository';

async function safeGetAvatarConfig(): Promise<AvatarConfig | null> {
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
}

function toPostVisibility(v: string | null): PostVisibility | null {
  if (v === 'public' || v === 'followers') return v;
  return null;
}

function toFollowPermission(v: string | null): FollowPermission | null {
  if (v === 'everyone' || v === 'approved') return v;
  return null;
}

export class AccountRepositoryMock implements IAccountRepository {
  async getPreferences(_userId: string): Promise<AccountPreferences> {
    const [avatarConfig, postVisibilityRaw, followPermissionRaw] = await Promise.all([
      safeGetAvatarConfig(),
      storageService.getString(STORAGE_KEYS.POST_VISIBILITY),
      storageService.getString(STORAGE_KEYS.FOLLOW_PERMISSION),
    ]);
    return {
      avatarConfig,
      postVisibility: toPostVisibility(postVisibilityRaw),
      followPermission: toFollowPermission(followPermissionRaw),
    };
  }

  async updateName(_userId: string, name: string): Promise<void> {
    await storageService.set(STORAGE_KEYS.USER_NAME, name);
  }

  async updateAvatar(_userId: string, config: AvatarConfig): Promise<void> {
    await storageService.set(STORAGE_KEYS.AVATAR_CONFIG, config);
  }

  async updatePostVisibility(_userId: string, value: PostVisibility): Promise<void> {
    await storageService.set(STORAGE_KEYS.POST_VISIBILITY, value);
  }

  async updateFollowPermission(_userId: string, value: FollowPermission): Promise<void> {
    await storageService.set(STORAGE_KEYS.FOLLOW_PERMISSION, value);
  }

  async getFavoriteMealIds(_userId: string): Promise<number[]> {
    try {
      const value = await storageService.get<unknown>(STORAGE_KEYS.MEAL_FAVORITES);
      if (!Array.isArray(value)) return [];
      return value.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    } catch {
      return [];
    }
  }

  async saveFavoriteMealIds(_userId: string, ids: number[]): Promise<void> {
    await storageService.set(STORAGE_KEYS.MEAL_FAVORITES, ids);
  }

  async deleteAccount(): Promise<void> {
    // Mock: no-op — resetAllAppStores in the store action clears local state
  }
}
