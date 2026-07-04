import type { AvatarConfig, FollowPermission, PostVisibility } from '@/types';

export interface AccountPreferences {
  avatarConfig: AvatarConfig | null;
  postVisibility: PostVisibility | null;
  followPermission: FollowPermission | null;
}

export interface IAccountRepository {
  getPreferences(userId: string): Promise<AccountPreferences>;
  updateName(userId: string, name: string): Promise<void>;
  updateAvatar(userId: string, config: AvatarConfig): Promise<void>;
  updatePostVisibility(userId: string, value: PostVisibility): Promise<void>;
  updateFollowPermission(userId: string, value: FollowPermission): Promise<void>;
  getFavoriteMealIds(userId: string): Promise<number[]>;
  saveFavoriteMealIds(userId: string, ids: number[]): Promise<void>;
  deleteAccount(): Promise<void>;
}
