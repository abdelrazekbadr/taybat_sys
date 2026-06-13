import { create } from 'zustand';

import { authService } from '@/api/auth/auth.service';
import { AppError } from '@/shared/errors/AppError';
import { createLogger } from '@/lib/logger';
import type { AuthStatus, AuthUser, LoginPayload, ProfileCompletionPayload, SignUpPayload, UserProfile } from '@/types';

import { useUserStore } from './user.store';

const log = createLogger('AuthStore');

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  errorMessage: string;

  initializeAuth: () => Promise<void>;
  loginWithEmail: (payload: LoginPayload) => Promise<boolean>;
  signUpWithEmail: (payload: SignUpPayload) => Promise<boolean | 'pending_confirmation'>;
  loginWithOAuth: (provider: 'google' | 'apple' | 'facebook') => Promise<boolean>;
  verifyEmailOtp: (email: string, token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  completeProfile: (data: ProfileCompletionPayload) => Promise<boolean>;
  setGuestMode: () => void;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
  resetAuth: () => void;
}

const initialState = {
  status: 'idle' as AuthStatus,
  user: null as AuthUser | null,
  profile: null as UserProfile | null,
  isLoading: false,
  errorMessage: '',
};

// Holds the Supabase auth listener cleanup — module-level so it persists across renders
let _unsubscribeAuthListener: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  initializeAuth: async () => {
    set({ status: 'initializing', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.getSessionAndProfile();
      if (result) {
        useUserStore.getState().setUserFromProfile(result.profile);
        set({ status: 'authenticated', user: result.user, profile: result.profile, isLoading: false });
      } else {
        set({ status: 'unauthenticated', user: null, profile: null, isLoading: false });
      }
    } catch (error: unknown) {
      set({
        status: 'error',
        user: null,
        profile: null,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'حدث خطأ ما. حاول مرة أخرى',
      });
    }

    // Wire Supabase auth state listener once (no-op in mock mode)
    _unsubscribeAuthListener?.();
    _unsubscribeAuthListener = authService.subscribeToAuthChanges(() => {
      useUserStore.getState().resetUser();
      set({ status: 'unauthenticated', user: null, profile: null, isLoading: false, errorMessage: '' });
    });
  },

  loginWithEmail: async (payload) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.loginWithEmail(payload);
      useUserStore.getState().setUserFromProfile(result.profile);
      set({ status: 'authenticated', user: result.user, profile: result.profile, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ status: 'unauthenticated', user: null, profile: null, isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الدخول' });
      return false;
    }
  },

  signUpWithEmail: async (payload) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.signUpWithEmail(payload);
      if (!result) {
        // Supabase returned no session — email confirmation required
        set({ status: 'unauthenticated', user: null, profile: null, isLoading: false });
        return 'pending_confirmation';
      }
      useUserStore.getState().setUserFromProfile(result.profile);
      set({ status: 'authenticated', user: result.user, profile: result.profile, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ status: 'unauthenticated', user: null, profile: null, isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر إنشاء الحساب' });
      return false;
    }
  },

  verifyEmailOtp: async (email, token) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const result = await authService.verifyEmailOtp(email, token);
      useUserStore.getState().setUserFromProfile(result.profile);
      set({ status: 'authenticated', user: result.user, profile: result.profile, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: error instanceof Error ? error.message : 'رمز التحقق غير صحيح' });
      return false;
    }
  },

  resendVerificationEmail: async (email) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      await authService.resendVerificationEmail(email);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر إعادة الإرسال' });
      return false;
    }
  },

  loginWithOAuth: async (provider) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.loginWithOAuth(provider);
      useUserStore.getState().setUserFromProfile(result.profile);
      set({ status: 'authenticated', user: result.user, profile: result.profile, isLoading: false });
      return true;
    } catch (error: unknown) {
      const isCanceled = error instanceof AppError && error.code === 'OAUTH_CANCELED';
      set({
        status: 'unauthenticated',
        user: null,
        profile: null,
        isLoading: false,
        // No error banner for user-initiated cancel — only real failures show a message
        errorMessage: isCanceled ? '' : (error instanceof Error ? error.message : 'تعذّر تسجيل الدخول'),
      });
      return false;
    }
  },

  completeProfile: async (data) => {
    const user = get().user;
    if (!user) {
      set({ errorMessage: 'يرجى تسجيل الدخول أولاً' });
      return false;
    }
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const profile = await authService.completeProfile(user.id, user.email ?? '', data);
      log.debug('[AuthStore] completeProfile ← profile returned:', {
        id: profile.id,
        email: profile.email,
        profile_completed: profile.profile_completed,
        name: profile.name,
      });
      useUserStore.getState().setUserFromProfile(profile);
      set({
        status: 'authenticated',
        user: { ...user, name: profile.name, profile_completed: profile.profile_completed },
        profile,
        isLoading: false,
      });
      log.info('[AuthStore] completeProfile: profile saved, navigating');
      return true;
    } catch (error: unknown) {
      set({ status: 'authenticated', isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ البيانات' });
      return false;
    }
  },

  setGuestMode: () => {
    set({ status: 'guest', user: null, profile: null, isLoading: false, errorMessage: '' });
  },

  logout: async () => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      await authService.logout();
      useUserStore.getState().resetUser();
      set({ status: 'unauthenticated', user: null, profile: null, isLoading: false });
    } catch (error: unknown) {
      set({ status: 'error', isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الخروج' });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      await authService.sendPasswordReset(email);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: error instanceof Error ? error.message : 'تعذّر إرسال الرابط' });
      return false;
    }
  },

  clearError: () =>
    set((state) => ({ errorMessage: '', status: state.status === 'error' ? 'unauthenticated' : state.status })),

  resetAuth: () => set({ ...initialState }),
}));
