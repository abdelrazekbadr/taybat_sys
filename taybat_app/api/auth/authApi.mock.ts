import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import type { AuthSession, AuthUser, LoginPayload, SignUpPayload } from '@/types';
import { mockDelay } from '@/utils/mockDelay';

import type { IAuthApi } from './types';

type MockAuthUserRecord = {
  id: string;
  email: string;
  password: string | null;
  provider: 'email' | 'google' | 'apple';
  created_at: string;
};

const nowIso = () => new Date().toISOString();

function createMockUuid(): string {
  const hex = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${((8 + Math.floor(Math.random() * 4)) | 0).toString(16)}${hex(3)}-${hex(12)}`;
}

function createMockToken(): string {
  return `mock_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

async function readUsers(): Promise<MockAuthUserRecord[]> {
  const users = await storageService.get<unknown>(STORAGE_KEYS.MOCK_AUTH_USERS);
  if (!Array.isArray(users)) return [];
  return users.filter((u): u is MockAuthUserRecord => {
    if (!u || typeof u !== 'object') return false;
    const v = u as Partial<MockAuthUserRecord>;
    return (
      typeof v.id === 'string' &&
      typeof v.email === 'string' &&
      (typeof v.password === 'string' || v.password === null) &&
      (v.provider === 'email' || v.provider === 'google' || v.provider === 'apple') &&
      typeof v.created_at === 'string'
    );
  });
}

async function writeUsers(users: MockAuthUserRecord[]): Promise<void> {
  await storageService.set(STORAGE_KEYS.MOCK_AUTH_USERS, users);
}

function toAuthUser(record: MockAuthUserRecord, profileCompleted: boolean): AuthUser {
  return {
    id: record.id,
    email: record.email,
    name: null,
    avatar_url: null,
    provider: record.provider,
    profile_completed: profileCompleted,
  };
}

function createSession(userId: string): AuthSession {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  return {
    access_token: createMockToken(),
    user_id: userId,
    expires_at: expiresAt,
  };
}

export const authApi: IAuthApi = {
  async signUpWithEmail(payload: SignUpPayload): Promise<{ user: AuthUser; session: AuthSession }> {
    await mockDelay();

    const email = payload.email.trim().toLowerCase();
    const password = payload.password;

    const users = await readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      throw new Error('User already registered');
    }

    const record: MockAuthUserRecord = {
      id: createMockUuid(),
      email,
      password,
      provider: 'email',
      created_at: nowIso(),
    };
    const nextUsers = [...users, record];
    await writeUsers(nextUsers);

    const session = createSession(record.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);

    return { user: toAuthUser(record, false), session };
  },

  async loginWithEmail(payload: LoginPayload): Promise<{ user: AuthUser; session: AuthSession }> {
    await mockDelay();

    const email = payload.email.trim().toLowerCase();
    const password = payload.password;

    const users = await readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email && u.password === password);
    if (!existing) {
      throw new Error('MOCK_USER_NOT_FOUND');
    }

    const session = createSession(existing.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);

    return { user: toAuthUser(existing, false), session };
  },

  async loginWithOAuth(provider: 'google' | 'apple'): Promise<{ user: AuthUser; session: AuthSession }> {
    await mockDelay();

    const email = `mock+${provider}@taybat.app`;
    const users = await readUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    const record: MockAuthUserRecord =
      existing ??
      ({
        id: createMockUuid(),
        email,
        password: null,
        provider,
        created_at: nowIso(),
      } satisfies MockAuthUserRecord);

    if (!existing) {
      await writeUsers([...users, record]);
    }

    const session = createSession(record.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);

    return { user: toAuthUser(record, false), session };
  },

  async logout(): Promise<void> {
    await mockDelay(300);
    await storageService.remove(STORAGE_KEYS.AUTH_SESSION);
  },

  async getSession(): Promise<AuthSession | null> {
    await mockDelay(250);
    const session = await storageService.get<unknown>(STORAGE_KEYS.AUTH_SESSION);
    if (!session || typeof session !== 'object') return null;
    const v = session as Partial<AuthSession>;
    if (typeof v.access_token !== 'string' || typeof v.user_id !== 'string' || typeof v.expires_at !== 'number') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (v.expires_at <= now) {
      await storageService.remove(STORAGE_KEYS.AUTH_SESSION);
      return null;
    }

    return { access_token: v.access_token, user_id: v.user_id, expires_at: v.expires_at };
  },

  async sendPasswordReset(_email: string): Promise<void> {
    await mockDelay(600);
  },
};
