import { supabase } from '@/lib/supabase';
import { authRepository, userProfileRepository } from '@/repositories/auth';
import { userRatingRepository } from '@/repositories/userRatings';
import {
  AppError,
  EmailConfirmationRequiredError,
  toUserMessage,
} from '@/shared/errors/AppError';
import { createLogger } from '@/lib/logger';
import { addDaysToISODate, localDateISO } from '@/utils/dateUtils';
import type {
  AuthResult,
  AuthProvider,
  Gender,
  LoginPayload,
  ProfileCompletionPayload,
  SignUpPayload,
  UserProfile,
} from '@/types';

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
      log.error(
        '[AuthService] signUpWithEmail error:',
        error instanceof Error ? error.message : error,
      );
      throw new Error(toUserMessage(error));
    }
  }

  async loginWithOAuth(
    provider: Exclude<AuthProvider, 'email' | 'guest'>,
  ): Promise<AuthResult> {
    try {
      const session = await authRepository.loginWithOAuth(provider);
      const email = session.email ?? `mock+${provider}@taybat.app`;
      await this.ensureProfileRow(
        session.user_id,
        email,
        provider,
        session.name,
        session.birth_date,
        session.gender,
      );
      const profile = await userProfileRepository.getProfile(session.user_id);
      if (!profile) throw new Error('حدث خطأ ما. حاول مرة أخرى');
      return this.toAuthResult(profile, session.avatar_url);
    } catch (error: unknown) {
      // Re-throw AppError as-is so the store can inspect error.code (e.g. OAUTH_CANCELED)
      if (error instanceof AppError) throw error;
      throw new Error(toUserMessage(error));
    }
  }

  async completeProfile(
    userId: string,
    email: string,
    data: ProfileCompletionPayload,
  ): Promise<UserProfile> {
    try {
      const existing = await userProfileRepository.getProfile(userId);
      const planStartDate = existing?.plan_start_date ?? localDateISO();
      const nextRatingDate =
        existing?.next_rating_date ?? addDaysToISODate(planStartDate, 7);
      const { initial_health_score, ...profileData } = data;
      const profile = await userProfileRepository.upsertProfile(userId, {
        ...profileData,
        email,
        plan_start_date: planStartDate,
        next_rating_date: nextRatingDate,
        profile_completed: true,
        ...(initial_health_score
          ? { last_health_score: initial_health_score }
          : {}),
      });

      if (data.initial_health_score) {
        try {
          await userRatingRepository.submitRating({
            userId,
            period_start: planStartDate,
            health_score: data.initial_health_score,
            improvement_goals_codes: '',
          });
        } catch (ratingErr: unknown) {
          log.warn(
            '[AuthService] completeProfile: baseline rating insert failed (non-fatal):',
            ratingErr instanceof Error ? ratingErr.message : ratingErr,
          );
        }
      }

      return profile;
    } catch (error: unknown) {
      log.error(
        '[AuthService] completeProfile error:',
        error instanceof Error ? error.message : error,
      );
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

  /**
   * Reads only the locally persisted session (no profile fetch, no network
   * requirement) — used to distinguish "the profile re-fetch failed because
   * we're offline" from "the session itself is genuinely gone", so
   * initializeAuth() can fall back to the cached profile instead of forcing
   * the user back to login just because they have no connection.
   */
  async getLocalSessionUserId(): Promise<string | null> {
    try {
      const session = await authRepository.getSession();
      return session?.user_id ?? null;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await authRepository.logout();
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async revokeOAuthTokens(): Promise<void> {
    try {
      await authRepository.revokeOAuthTokens();
    } catch {}
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
      log.error(
        '[AuthService] verifyEmailOtp error:',
        error instanceof Error ? error.message : error,
      );
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

  async verifyResetOtp(email: string, token: string): Promise<void> {
    try {
      await authRepository.verifyResetOtp(email, token);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  async updatePassword(password: string): Promise<void> {
    try {
      await authRepository.updatePassword(password);
    } catch (error: unknown) {
      throw new Error(toUserMessage(error));
    }
  }

  // Subscribes to Supabase auth state changes. Returns an unsubscribe function.
  // In mock mode this is a no-op — mock auth has no real events.
  subscribeToAuthChanges(onSignOut: () => void): () => void {
    const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
    if (USE_MOCK) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        onSignOut();
      }
    });
    return () => subscription.unsubscribe();
  }

  private async ensureProfileRow(
    userId: string,
    email: string,
    provider: AuthProvider,
    name?: string | null,
    birthDate?: string | null,
    gender?: Gender | null,
  ): Promise<void> {
    const existing = await userProfileRepository.getProfile(userId);
    if (existing) return;
    await userProfileRepository.upsertProfile(userId, {
      id: userId,
      email,
      provider,
      name: name ?? null,
      gender: gender ?? null,
      birth_date: birthDate ?? null,
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

  private toAuthResult(
    profile: UserProfile,
    avatarUrl?: string | null,
  ): AuthResult {
    return {
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: avatarUrl ?? null,
        provider: profile.provider,
        profile_completed: profile.profile_completed,
      },
      profile,
      profile_completed: profile.profile_completed,
    };
  }
}

export const authService = new AuthService();
