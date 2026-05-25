import { authApi, userApi } from '@/api/auth';
import type {
  AuthProvider,
  AuthResult,
  LoginPayload,
  ProfileCompletionPayload,
  SignUpPayload,
  UserProfile,
} from '@/types';

const ERROR_MAP: Record<string, string> = {
  'User already registered': 'هذا البريد الإلكتروني مستخدم بالفعل',
  'Invalid login credentials': 'البريد أو كلمة المرور غير صحيحة',
  'Email not confirmed': 'يرجى تأكيد بريدك الإلكتروني أولاً',
  'Network request failed': 'تحقق من اتصالك بالإنترنت',
  MOCK_USER_NOT_FOUND: 'البريد أو كلمة المرور غير صحيحة',
  '__default__': 'حدث خطأ ما. حاول مرة أخرى',
};

class AuthService {
  async loginWithEmail(payload: LoginPayload): Promise<AuthResult> {
    try {
      const { user } = await authApi.loginWithEmail(payload);
      await this.ensureProfileRow(user.id, user.email, user.provider);
      const profile = await userApi.getProfile(user.id);
      if (!profile) {
        throw new Error('__default__');
      }
      return { user: this.toAuthUser(profile), profile_completed: profile.profile_completed };
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async signUpWithEmail(payload: SignUpPayload): Promise<AuthResult> {
    try {
      const { user } = await authApi.signUpWithEmail(payload);
      await this.ensureProfileRow(user.id, user.email, user.provider);
      const profile = await userApi.getProfile(user.id);
      if (!profile) {
        throw new Error('__default__');
      }
      return { user: this.toAuthUser(profile), profile_completed: profile.profile_completed };
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async loginWithOAuth(provider: 'google' | 'apple' | 'facebook'): Promise<AuthResult> {
    try {
      const { user } = await authApi.loginWithOAuth(provider);
      await this.ensureProfileRow(user.id, user.email, user.provider);
      const profile = await userApi.getProfile(user.id);
      if (!profile) {
        throw new Error('__default__');
      }
      return { user: this.toAuthUser(profile), profile_completed: profile.profile_completed };
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async completeProfile(userId: string, data: ProfileCompletionPayload): Promise<UserProfile> {
    try {
      const next = await userApi.upsertProfile(userId, {
        ...data,
        profile_completed: true,
      });
      return next;
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async getSessionAndProfile(): Promise<AuthResult | null> {
    try {
      const session = await authApi.getSession();
      if (!session) {
        return null;
      }

      const profile = await userApi.getProfile(session.user_id);
      if (!profile) {
        await authApi.logout();
        return null;
      }

      return { user: this.toAuthUser(profile), profile_completed: profile.profile_completed };
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await authApi.sendPasswordReset(email);
    } catch (error: unknown) {
      throw new Error(this.mapError(error));
    }
  }

  private async ensureProfileRow(userId: string, email: string, provider: AuthProvider): Promise<void> {
    const existing = await userApi.getProfile(userId);
    if (existing) {
      return;
    }

    await userApi.upsertProfile(userId, {
      id: userId,
      email,
      provider,
      name: null,
      gender: null,
      birth_year: null,
      weight_kg: null,
      height_cm: null,
      activity_level: null,
      health_goals: null,
      profile_completed: false,
    });
  }

  private toAuthUser(profile: UserProfile) {
    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: null,
      provider: profile.provider,
      profile_completed: profile.profile_completed,
    };
  }

  private mapError(error: unknown): string {
    const key = error instanceof Error ? error.message : '__default__';
    return ERROR_MAP[key] ?? ERROR_MAP.__default__;
  }
}

export const authService = new AuthService();

