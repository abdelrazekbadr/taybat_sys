import { NativeModules } from 'react-native';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError, InvalidCredentialsError, EmailAlreadyUsedError, EmailConfirmationRequiredError, NetworkError, ServerError, SessionExpiredError } from '@/shared/errors/AppError';
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
    if (provider === 'google') return this.loginWithGoogle();
    if (provider === 'facebook') return this.loginWithFacebook();
    throw new ServerError();
  }

  private async loginWithGoogle(): Promise<AuthSession> {
    // Dynamic import — only evaluated when this method is called, never at module load time.
    // This prevents the "RNGoogleSignin could not be found" crash when the native
    // binary hasn't been rebuilt yet or when running in mock mode.
    const {
      GoogleSignin,
      isSuccessResponse,
      isErrorWithCode,
      statusCodes,
    } = await import('@react-native-google-signin/google-signin');

    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    log.debug('[Google] step 1 — webClientId present:', !!webClientId, '| prefix:', webClientId?.slice(0, 12));
    if (!webClientId) {
      throw new AppError('UNKNOWN', 'إعدادات تسجيل Google غير مكتملة');
    }

    GoogleSignin.configure({ webClientId });
    log.debug('[Google] step 2 — GoogleSignin.configure() done');

    try {
      log.debug('[Google] step 3 — checking Play Services');
      await GoogleSignin.hasPlayServices();
      log.debug('[Google] step 4 — Play Services OK, calling signIn()');

      const response = await GoogleSignin.signIn();
      log.debug('[Google] step 5 — signIn() returned, type:', response.type, '| isSuccess:', isSuccessResponse(response));

      if (!isSuccessResponse(response)) {
        log.debug('[Google] step 5a — user cancelled or non-success type:', response.type);
        throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
      }

      const idToken = response.data.idToken;
      log.debug('[Google] step 6 — idToken present:', !!idToken, '| user email:', response.data.user?.email);
      if (!idToken) {
        log.error('[Google] step 6 FAIL — idToken is null after successful signIn');
        throw new ServerError();
      }

      log.debug('[Google] step 7 — calling supabase.auth.signInWithIdToken');
      const { data, error } = await this.client.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });

      log.debug('[Google] step 8 — signInWithIdToken returned | hasSession:', !!data?.session, '| error:', error ? JSON.stringify(error) : 'none');

      if (error) {
        log.error('[Google] step 8 FAIL — Supabase error:', JSON.stringify(error));
        throw this.mapError(error);
      }
      if (!data.session) {
        log.error('[Google] step 8 FAIL — session is null with no error');
        throw new ServerError();
      }

      log.debug('[Google] step 9 — SUCCESS | userId:', data.session.user.id, '| email:', data.session.user.email);
      return this.toSession(data.session);
    } catch (error: unknown) {
      if (error instanceof AppError) throw error;

      if (isErrorWithCode(error)) {
        const code = (error as { code: string | number }).code;
        log.error('[Google] Google SDK error | code:', code, '| message:', (error as Error).message);
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          throw new AppError('OAUTH_CANCELED', 'جاري تسجيل الدخول بالفعل');
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new AppError('OAUTH_CANCELED', 'خدمات Google غير متاحة على هذا الجهاز');
        }
        // code 10 = DEVELOPER_ERROR — SHA-1 fingerprint mismatch or wrong webClientId
        if (code === 10) {
          log.error('[Google] DEVELOPER_ERROR (code 10) — SHA-1 fingerprint in Google Cloud Console does not match this APK signing cert. Register the debug SHA-1 from: keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android');
          throw new AppError('SERVER', 'خطأ في إعداد تسجيل Google — تحقق من إعدادات المشروع');
        }
      }

      log.error('[Google] unexpected error | type:', typeof error, '| message:', error instanceof Error ? error.message : String(error), '| stack:', error instanceof Error ? error.stack : 'no stack');
      throw new ServerError(error);
    }
  }

  // Facebook uses the browser-based PKCE flow (per Supabase docs):
  // signInWithOAuth(skipBrowserRedirect) → open system browser → deep link back
  // with ?code= → exchangeCodeForSession. Requires flowType: 'pkce' on the client
  // and `taybatapp://auth/callback` registered in Supabase → URL Configuration.
  private async loginWithFacebook(): Promise<AuthSession> {
    // Dynamic import — same rationale as Google: never evaluated at module load,
    // so mock mode and dev clients without the native module don't crash.
    const WebBrowser = await import('expo-web-browser');

    const redirectTo = 'taybatapp://auth/callback';

    log.debug('[Facebook] step 1 — requesting OAuth URL from Supabase');
    const { data, error } = await this.client.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo,
        skipBrowserRedirect: true, // we open the browser ourselves below
      },
    });
    if (error) {
      log.error('[Facebook] step 1 FAIL —', JSON.stringify(error));
      throw this.mapError(error);
    }
    if (!data?.url) {
      log.error('[Facebook] step 1 FAIL — no OAuth URL returned');
      throw new ServerError();
    }

    log.debug('[Facebook] step 2 — opening auth session in system browser');
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    log.debug('[Facebook] step 3 — browser result type:', result.type);

    if (result.type !== 'success') {
      // 'cancel' / 'dismiss' — user closed the browser sheet
      throw new AppError('OAUTH_CANCELED', 'تم إلغاء تسجيل الدخول');
    }

    const callbackUrl = new URL(result.url);
    const providerError = callbackUrl.searchParams.get('error_description') ?? callbackUrl.searchParams.get('error');
    if (providerError) {
      log.error('[Facebook] step 4 FAIL — provider returned error:', providerError);
      throw new ServerError(new Error(providerError));
    }

    const code = callbackUrl.searchParams.get('code');
    log.debug('[Facebook] step 4 — authorization code present:', !!code);
    if (!code) {
      log.error('[Facebook] step 4 FAIL — callback URL missing code param:', result.url);
      throw new ServerError();
    }

    log.debug('[Facebook] step 5 — exchanging code for session');
    const { data: sessionData, error: sessionError } = await this.client.auth.exchangeCodeForSession(code);
    if (sessionError) {
      log.error('[Facebook] step 5 FAIL —', JSON.stringify(sessionError));
      throw this.mapError(sessionError);
    }
    if (!sessionData.session) {
      log.error('[Facebook] step 5 FAIL — session is null with no error');
      throw new ServerError();
    }

    log.debug('[Facebook] step 6 — SUCCESS | userId:', sessionData.session.user.id, '| email:', sessionData.session.user.email);
    return this.toSession(sessionData.session);
  }

  async logout(): Promise<void> {
    // Guard against Expo Go / builds without the native binary.
    // The module's top-level getEnforcing() throws an Invariant Violation before
    // our try/catch can fire, so we check native availability first.
    if (NativeModules.RNGoogleSignin) {
      try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        await GoogleSignin.signOut();
      } catch {}
    }

    // Try global sign-out (invalidates session on server). If the server rejects
    // (e.g. user was already deleted from auth.users after account deletion),
    // fall back to local-only so AsyncStorage is always cleared.
    const { error } = await this.client.auth.signOut();
    if (error) {
      await this.client.auth.signOut({ scope: 'local' });
    }
  }

  async revokeOAuthTokens(): Promise<void> {
    // Same native-availability guard as logout() — see comment there.
    if (NativeModules.RNGoogleSignin) {
      try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch {}
    }
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

  async verifyResetOtp(email: string, token: string): Promise<void> {
    log.debug('[Auth] verifyResetOtp → supabase.auth.verifyOtp type:recovery', email);
    const { error } = await this.client.auth.verifyOtp({ email, token, type: 'recovery' });
    log.debug('[Auth] verifyResetOtp ←', { error });
    if (error) throw this.mapError(error);
  }

  async updatePassword(password: string): Promise<void> {
    log.debug('[Auth] updatePassword → supabase.auth.updateUser');
    const { error } = await this.client.auth.updateUser({ password });
    log.debug('[Auth] updatePassword ←', { error });
    if (error) throw this.mapError(error);
  }

  private toSession(session: NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getSession']>>['data']['session']>): AuthSession {
    const meta = session.user.user_metadata ?? {};
    return {
      access_token: session.access_token,
      user_id: session.user.id,
      expires_at: session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
      email: session.user.email,
      name: (meta.name ?? meta.full_name ?? null) as string | null,
      avatar_url: (meta.avatar_url ?? meta.picture ?? null) as string | null,
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
    if (msg.includes('refresh token') || error.code === 'refresh_token_not_found' || error.code === 'refresh_token_already_used')
      return new SessionExpiredError();
    if (msg.includes('token') || msg.includes('otp') || error.code === 'otp_expired')
      return new AppError('INVALID_CREDENTIALS', 'رمز التحقق غير صحيح أو منتهي الصلاحية');
    if (error.code === 'same_password' || msg.includes('should be different from the old password'))
      return new AppError('INVALID_CREDENTIALS', 'كلمة المرور الجديدة يجب أن تختلف عن كلمة المرور الحالية');
    return new ServerError(error);
  }
}
