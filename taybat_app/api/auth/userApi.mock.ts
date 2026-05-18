import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import type { UserProfile } from '@/types';
import { mockDelay } from '@/utils/mockDelay';

import type { IUserApi } from './types';

type ProfileMap = Record<string, UserProfile>;

const nowIso = () => new Date().toISOString();

async function readProfiles(): Promise<ProfileMap> {
  const raw = await storageService.get<unknown>(STORAGE_KEYS.MOCK_USER_PROFILES);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as ProfileMap;
}

async function writeProfiles(map: ProfileMap): Promise<void> {
  await storageService.set(STORAGE_KEYS.MOCK_USER_PROFILES, map);
}

export const userApi: IUserApi = {
  async upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await mockDelay();
    const map = await readProfiles();
    const existing = map[userId];
    const createdAt = existing?.created_at ?? nowIso();
    const next: UserProfile = {
      id: userId,
      email: data.email ?? existing?.email ?? '',
      name: typeof data.name !== 'undefined' ? data.name : existing?.name ?? null,
      gender: typeof data.gender !== 'undefined' ? data.gender : existing?.gender ?? null,
      birth_year: typeof data.birth_year !== 'undefined' ? data.birth_year : existing?.birth_year ?? null,
      weight_kg: typeof data.weight_kg !== 'undefined' ? data.weight_kg : existing?.weight_kg ?? null,
      height_cm: typeof data.height_cm !== 'undefined' ? data.height_cm : existing?.height_cm ?? null,
      activity_level:
        typeof data.activity_level !== 'undefined' ? data.activity_level : existing?.activity_level ?? null,
      health_goals: typeof data.health_goals !== 'undefined' ? data.health_goals : existing?.health_goals ?? null,
      provider: data.provider ?? existing?.provider ?? 'email',
      profile_completed:
        typeof data.profile_completed !== 'undefined' ? data.profile_completed : existing?.profile_completed ?? false,
      created_at: createdAt,
      updated_at: nowIso(),
    };

    const nextMap = { ...map, [userId]: next };
    await writeProfiles(nextMap);
    return next;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    await mockDelay(250);
    const map = await readProfiles();
    return map[userId] ?? null;
  },
};
