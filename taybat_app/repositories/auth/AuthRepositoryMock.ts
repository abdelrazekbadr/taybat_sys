import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type { AuthProvider, AuthSession, LoginPayload, SignUpPayload } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import { EmailAlreadyUsedError, InvalidCredentialsError } from '@/shared/errors/AppError';
import type { IAuthRepository } from './IAuthRepository';

type MockAuthRecord = {
  id: string;
  email: string;
  password: string | null;
  provider: AuthProvider;
  created_at: string;
};

function uuid(): string {
  const h = (n: number) =>
    Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `${h(8)}-${h(4)}-4${h(3)}-${((8 + Math.floor(Math.random() * 4)) | 0).toString(16)}${h(3)}-${h(12)}`;
}

function mockToken(): string {
  return `mock_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

function buildSession(userId: string): AuthSession {
  return {
    access_token: mockToken(),
    user_id: userId,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  };
}

async function readRecords(): Promise<MockAuthRecord[]> {
  const raw = await storageService.get<unknown>(STORAGE_KEYS.MOCK_AUTH_USERS);
  if (!Array.isArray(raw)) return [];
  return raw.filter((u): u is MockAuthRecord => {
    if (!u || typeof u !== 'object') return false;
    const v = u as Partial<MockAuthRecord>;
    return (
      typeof v.id === 'string' &&
      typeof v.email === 'string' &&
      (typeof v.password === 'string' || v.password === null) &&
      typeof v.created_at === 'string'
    );
  });
}

async function writeRecords(records: MockAuthRecord[]): Promise<void> {
  await storageService.set(STORAGE_KEYS.MOCK_AUTH_USERS, records);
}

export class AuthRepositoryMock implements IAuthRepository {
  async signUpWithEmail(payload: SignUpPayload): Promise<AuthSession> {
    await mockDelay();
    const email = payload.email.trim().toLowerCase();
    const records = await readRecords();
    if (records.find((r) => r.email.toLowerCase() === email)) {
      throw new EmailAlreadyUsedError();
    }
    const record: MockAuthRecord = {
      id: uuid(),
      email,
      password: payload.password,
      provider: 'email',
      created_at: new Date().toISOString(),
    };
    await writeRecords([...records, record]);
    const session = buildSession(record.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    return session;
  }

  async loginWithEmail(payload: LoginPayload): Promise<AuthSession> {
    await mockDelay();
    const email = payload.email.trim().toLowerCase();
    const records = await readRecords();
    const match = records.find((r) => r.email.toLowerCase() === email && r.password === payload.password);
    if (!match) throw new InvalidCredentialsError();
    const session = buildSession(match.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    return session;
  }

  async loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthSession> {
    await mockDelay();
    const email = `mock+${provider}@taybat.app`;
    const records = await readRecords();
    const existing = records.find((r) => r.email.toLowerCase() === email.toLowerCase());
    const record: MockAuthRecord = existing ?? {
      id: uuid(),
      email,
      password: null,
      provider,
      created_at: new Date().toISOString(),
    };
    if (!existing) await writeRecords([...records, record]);
    const session = buildSession(record.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    return session;
  }

  async logout(): Promise<void> {
    await mockDelay(300);
    await storageService.remove(STORAGE_KEYS.AUTH_SESSION);
  }

  async getSession(): Promise<AuthSession | null> {
    await mockDelay(250);
    const raw = await storageService.get<unknown>(STORAGE_KEYS.AUTH_SESSION);
    if (!raw || typeof raw !== 'object') return null;
    const v = raw as Partial<AuthSession>;
    if (typeof v.access_token !== 'string' || typeof v.user_id !== 'string' || typeof v.expires_at !== 'number') {
      return null;
    }
    if (v.expires_at <= Math.floor(Date.now() / 1000)) {
      await storageService.remove(STORAGE_KEYS.AUTH_SESSION);
      return null;
    }
    return { access_token: v.access_token, user_id: v.user_id, expires_at: v.expires_at };
  }

  async sendPasswordReset(_email: string): Promise<void> {
    await mockDelay(600);
  }

  async verifyEmailOtp(email: string, _token: string): Promise<AuthSession> {
    await mockDelay(500);
    const records = await readRecords();
    const record = records.find((r) => r.email.toLowerCase() === email.toLowerCase());
    if (!record) throw new InvalidCredentialsError();
    const session = buildSession(record.id);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, session);
    return session;
  }

  async resendVerificationEmail(_email: string): Promise<void> {
    await mockDelay(600);
  }
}
