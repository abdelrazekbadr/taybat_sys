import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type { UserProfile } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { IUserProfileRepository } from './IUserProfileRepository';

type ProfileMap = Record<string, UserProfile>;

async function readProfiles(): Promise<ProfileMap> {
  const raw = await storageService.get<unknown>(STORAGE_KEYS.MOCK_USER_PROFILES);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as ProfileMap;
}

async function writeProfiles(map: ProfileMap): Promise<void> {
  await storageService.set(STORAGE_KEYS.MOCK_USER_PROFILES, map);
}

export class UserProfileRepositoryMock implements IUserProfileRepository {
  async getProfile(userId: string): Promise<UserProfile | null> {
    await mockDelay(250);
    const map = await readProfiles();
    return map[userId] ?? null;
  }

  async upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    await mockDelay();
    const map = await readProfiles();
    const existing = map[userId];
    const now = new Date().toISOString();
    const next: UserProfile = {
      id: userId,
      email: data.email ?? existing?.email ?? '',
      name: typeof data.name !== 'undefined' ? data.name : (existing?.name ?? null),
      gender: typeof data.gender !== 'undefined' ? data.gender : (existing?.gender ?? null),
      birth_date: typeof data.birth_date !== 'undefined' ? data.birth_date : (existing?.birth_date ?? null),
      birth_year: typeof data.birth_year !== 'undefined' ? data.birth_year : (existing?.birth_year ?? null),
      weight_kg: typeof data.weight_kg !== 'undefined' ? data.weight_kg : (existing?.weight_kg ?? null),
      height_cm: typeof data.height_cm !== 'undefined' ? data.height_cm : (existing?.height_cm ?? null),
      activity_level: typeof data.activity_level !== 'undefined' ? data.activity_level : (existing?.activity_level ?? null),
      health_goals_codes: typeof data.health_goals_codes !== 'undefined' ? data.health_goals_codes : (existing?.health_goals_codes ?? null),
      health_conditions_codes: typeof data.health_conditions_codes !== 'undefined' ? data.health_conditions_codes : (existing?.health_conditions_codes ?? null),
      provider: data.provider ?? existing?.provider ?? 'email',
      profile_completed: typeof data.profile_completed !== 'undefined' ? data.profile_completed : (existing?.profile_completed ?? false),
      plan_start_date: typeof data.plan_start_date !== 'undefined' ? data.plan_start_date : (existing?.plan_start_date ?? null),
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
    await writeProfiles({ ...map, [userId]: next });
    return next;
  }
}
