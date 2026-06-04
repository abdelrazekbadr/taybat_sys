import { supabase } from '@/lib/supabase';
import { authRepository, userProfileRepository } from '@/repositories/auth';
import { EmailConfirmationRequiredError, toUserMessage } from '@/shared/errors/AppError';
import { createLogger } from '@/lib/logger';
import type { AuthResult, AuthProvider, LoginPayload, ProfileCompletionPayload, SignUpPayload, UserProfile } from '@/types';

const log = createLogger('AuthService');

class AuthService {
  async loginWithEmail(payload: LoginPayload): Promise<AuthResult> {
    try {
      const session = await authRepository.loginWithEmail(payload);
      await this.ensureProfileRow(session.user_id, payload.email, 'email');
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) throw new Error('حدث خطأ ما. حاول مرة أخرى');
      return this.toAuthResult(profile);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async signUpWithEmail(payload: SignUpPayload): Promise<AuthResult | null> {
    try {
      const session = await authRepository.signUpWithEmail(payload);
      await this.ensureProfileRow(session.user_id, payload.email, 'email');
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) throw new Error('حدث خطأ ما. حاول مرة أخرى');
      return this.toAuthResult(profile);
    } catch (error: unknown) {
      if (error instanceof EmailConfirmationRequiredError) {
        log.info('[AuthService] signUpWithEmail: email confirmation required');
        return null;
      }
      log.error('[AuthService] signUpWithEmail error:', error instanceof Error ? error.message : error);
      throw new Error(toUserMessage(error));
    }
  }

  async loginWithOAuth(provider: Exclude<AuthProvider, 'email' | 'guest'>): Promise<AuthResult> {
    try {
      const session = await authRepository.loginWithOAuth(provider);
      const email = `mock+${provider}@taybat.app`;
      await this.ensureProfileRow(session.user_id, email, provider);
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) throw new Error('حدث خطأ ما. حاول مرة أخرى');
      return this.toAuthResult(profile);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async completeProfile(userId: string, email: string, data: ProfileCompletionPayload): Promise<UserProfile> {
    try {
      const existing = await userProfileRepository.getProfile(userId);
      const planStartDate = existing?.plan_start_date ?? new Date().toISOString().split('T')[0];
      const nextRatingDate =
        existing?.next_rating_date ??
        (() => {
          const dt = new Date(planStartDate);
          dt.setDate(dt.getDate() + 7);
          return dt.toISOString().split('T')[0];
        })();
      return await userProfileRepository.upsertProfile(userId, {
        ...data,
        email,
        plan_start_date: planStartDate,
        next_rating_date: nextRatingDate,
        profile_completed: true,
      });
    } catch (error: unknown) {
      log.error('[AuthService] completeProfile error:', error instanceof Error ? error.message : error);
      throw new Error(toUserMessage(error));
    }
  }

  async getSessionAndProfile(): Promise<AuthResult | null> {
    try {
      const session = await authRepository.getSession();
      if (!session) return null;
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) {
        await authRepository.logout();
        return null;
      }
      return this.toAuthResult(profile);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await authRepository.logout();
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await authRepository.sendPasswordReset(email);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async verifyEmailOtp(email: string, token: string): Promise<AuthResult> {
    try {
      const session = await authRepository.verifyEmailOtp(email, token);
      await this.ensureProfileRow(session.user_id, email, 'email');
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) throw new Error('حدث خطأ ما. حاول مرة أخرى');
      return this.toAuthResult(profile);
    } catch (error: unknown) {
      log.error('[AuthService] verifyEmailOtp error:', error instanceof Error ? error.message : error);
      throw new Error(toUserMessage(error));
    }
  }

  async resendVerificationEmail(email: string): Promise<void> {
    try {
      await authRepository.resendVerificationEmail(email);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  // Subscribes to Supabase auth state changes. Returns an unsubscribe function.
  // In mock mode this is a no-op — mock auth has no real events.
  subscribeToAuthChanges(onSignOut: () => void): () => void {
    const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
    if (USE_MOCK) return () => {};

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        onSignOut();
      }
    });
    return () => subscription.unsubscribe();
  }

  private async ensureProfileRow(userId: string, email: string, provider: AuthProvider): Promise<void> {
    const existing = await userProfileRepository.getProfile(userId);
    if (existing) return;
    await userProfileRepository.upsertProfile(userId, {
      id: userId,
      email,
      provider,
      name: null,
      gender: null,
      birth_date: null,
      birth_year: null,
      weight_kg: null,
      height_cm: null,
      activity_level: null,
      health_goals_codes: null,
        health_conditions_codes: null,
      plan_start_date: null,
        next_rating_date: null,
      profile_completed: false,
    });
  }

  private toAuthResult(profile: UserProfile): AuthResult {
    return {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: null,
        provider: profile.provider,
        profile_completed: profile.profile_completed,
      },
      profile,
      profile_completed: profile.profile_completed,
    };
  }
}

export const authService = new AuthService();
