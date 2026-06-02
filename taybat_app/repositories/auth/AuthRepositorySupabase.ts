/**
 * Supabase implementation of IAuthRepository.
 * Uses supabase.auth.* — no custom table needed for authentication itself.
 *
 * TODO: Wire this in repositories/auth/index.ts when Supabase credentials are configured.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError, InvalidCredentialsError, EmailAlreadyUsedError, EmailConfirmationRequiredError, NetworkError, ServerError } from '@/shared/errors/AppError';
import { createLogger } from '@/lib/logger';
import type { AuthProvider, AuthSession, LoginPayload, SignUpPayload } from '@/types';
import type { IAuthRepository } from './IAuthRepository';

const log = createLogger('Auth');

export class AuthRepositorySupabase implements IAuthRepository {
  constructor(private readonly client: SupabaseClient) {}

  async signUpWithEmail(payload: SignUpPayload): Promise<AuthSession> {
    log.debug('[Auth] signUpWithEmail → supabase.auth.signUp', payload.email);
    const { data, error } = await this.client.auth.signUp({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
    log.debug('[Auth] signUpWithEmail ←', { hasSession: !!data?.session, hasUser: !!data?.user, error });
    if (error) throw this.mapError(error);
    // session is null when Supabase requires email confirmation — that is expected
    if (!data.session) throw new EmailConfirmationRequiredError();
    return this.toSession(data.session);
  }

  async loginWithEmail(payload: LoginPayload): Promise<AuthSession> {
    log.debug('[Auth] loginWithEmail → supabase.auth.signInWithPassword', payload.email);
    const { data, error } = await this.client.auth.signInWithPassword({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
    });
    log.debug('[Auth] loginWithEmail ←', { hasSession: !!data?.session, error });
    if (error) throw this.mapError(error);
    if (!data.session) throw new ServerError();
    return this.toSession(data.session);
  }

  async loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthSession> {
    // OAuth on mobile uses expo-auth-session + supabase.auth.signInWithIdToken / exchangeCodeForSession.
    // The exact flow depends on the provider SDK (Google, Apple).
    // Placeholder: trigger the OAuth flow and exchange the code/token here.
    const { data, error } = await this.client.auth.signInWithOAuth({ provider });
    if (error) throw this.mapError(error);
    // OAuth completes asynchronously via deep link — session is returned via onAuthStateChange.
    // This method returns a temporary placeholder; the real session is set by the auth listener.
    void data;
    throw new ServerError(); // replace with actual deep-link exchange logic
  }

  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) throw this.mapError(error);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) throw this.mapError(error);
    if (!data.session) return null;
    return this.toSession(data.session);
  }

  async sendPasswordReset(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email);
    if (error) throw this.mapError(error);
  }

  async verifyEmailOtp(email: string, token: string): Promise<AuthSession> {
    log.debug('[Auth] verifyEmailOtp → supabase.auth.verifyOtp', email);
    const { data, error } = await this.client.auth.verifyOtp({ email, token, type: 'signup' });
    log.debug('[Auth] verifyEmailOtp ←', { hasSession: !!data?.session, error });
    if (error) throw this.mapError(error);
    if (!data.session) throw new ServerError();
    return this.toSession(data.session);
  }

  async resendVerificationEmail(email: string): Promise<void> {
    log.debug('[Auth] resendVerificationEmail →', email);
    const { error } = await this.client.auth.resend({ type: 'signup', email });
    if (error) throw this.mapError(error);
  }

  private toSession(session: NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getSession']>>['data']['session']>): AuthSession {
    return {
      access_token: session.access_token,
      user_id: session.user.id,
      expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
    };
  }

  private mapError(error: { message?: string; status?: number; code?: string }): Error {
    log.error('[Auth] Supabase error raw:', JSON.stringify(error));
    const msg = (error.message ?? '').toLowerCase();
    if (msg.includes('invalid login credentials') || msg.includes('invalid_grant'))
      return new InvalidCredentialsError();
    if (msg.includes('user already registered') || msg.includes('already been registered'))
      return new EmailAlreadyUsedError();
    if (msg.includes('email not confirmed'))
      return new EmailConfirmationRequiredError();
    if (msg.includes('rate limit') || error.status === 429)
      return new NetworkError(error);
    if (error.status === 0 || msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch'))
      return new NetworkError(error);
    if (msg.includes('token') || msg.includes('otp') || error.code === 'otp_expired')
      return new AppError('INVALID_CREDENTIALS', 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    return new ServerError(error);
  }
}
