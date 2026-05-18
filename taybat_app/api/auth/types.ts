import type {
  AuthSession,
  AuthUser,
  LoginPayload,
  SignUpPayload,
  UserProfile,
} from '@/types';

export interface IAuthApi {
  signUpWithEmail(payload: SignUpPayload): Promise<{ user: AuthUser; session: AuthSession }>;
  loginWithEmail(payload: LoginPayload): Promise<{ user: AuthUser; session: AuthSession }>;
  loginWithOAuth(provider: 'google' | 'apple'): Promise<{ user: AuthUser; session: AuthSession }>;
  logout(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  sendPasswordReset(email: string): Promise<void>;
}

export interface IUserApi {
  upsertProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile>;
  getProfile(userId: string): Promise<UserProfile | null>;
}

