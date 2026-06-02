import type { UserProfile } from '@/types';

export interface IUserProfileRepository {
  getProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
}
