import type { AuthProvider, AuthSession, LoginPayload, SignUpPayload } from '@/types';

export interface IAuthRepository {
  signUpWithEmail(payload: SignUpPayload): Promise<AuthSession>;
  loginWithEmail(payload: LoginPayload): Promise<AuthSession>;
  loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthSession>;
  logout(): Promise<void>;
  revokeOAuthTokens(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  sendPasswordReset(email: string): Promise<void>;
  verifyEmailOtp(email: string, token: string): Promise<AuthSession>;
  resendVerificationEmail(email: string): Promise<void>;
  verifyResetOtp(email: string, token: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}
