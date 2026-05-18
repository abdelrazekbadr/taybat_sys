import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';

const toPostVisibility = (value: string | null): PostVisibility | null => {
  if (value === 'public' || value === 'followers') return value;
  return null;
};

const toFollowPermission = (value: string | null): FollowPermission | null => {
  if (value === 'everyone' || value === 'approved') return value;
  return null;
};

const safeGetAvatarConfig = async (): Promise<AvatarConfig | null> => {
  const value = await storageService.get<unknown>(STORAGE_KEYS.AVATAR_CONFIG);
  if (!value || typeof value !== 'object') return null;
  const v = value as Partial<AvatarConfig>;
  if (v.type !== 'letter' && v.type !== 'emoji') return null;
  if (typeof v.value !== 'string' || v.value.length === 0) return null;
  if (typeof v.color !== 'undefined' && typeof v.color !== 'string') return null;
  return { type: v.type, value: v.value, color: v.color };
};

export async function updateUserName(_userId: number, name: string): Promise<void> {
  await storageService.set(STORAGE_KEYS.USER_NAME, name);
}

export async function updateAvatarConfig(_userId: number, config: AvatarConfig): Promise<void> {
  await storageService.set(STORAGE_KEYS.AVATAR_CONFIG, config);
}

export async function updatePostVisibility(_userId: number, value: PostVisibility): Promise<void> {
  await storageService.set(STORAGE_KEYS.POST_VISIBILITY, value);
}

export async function updateFollowPermission(_userId: number, value: FollowPermission): Promise<void> {
  await storageService.set(STORAGE_KEYS.FOLLOW_PERMISSION, value);
}

export async function fetchAccountPreferences(): Promise<{
  avatarConfig: AvatarConfig | null;
  postVisibility: PostVisibility | null;
  followPermission: FollowPermission | null;
}> {
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
