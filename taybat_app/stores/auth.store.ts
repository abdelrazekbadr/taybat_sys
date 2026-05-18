import { create } from 'zustand';

import { authService } from '@/api/auth/auth.service';
import type { AuthStatus, AuthUser, LoginPayload, ProfileCompletionPayload, SignUpPayload } from '@/types';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  isLoading: boolean;
  errorMessage: string;

  initializeAuth: () => Promise<void>;
  loginWithEmail: (payload: LoginPayload) => Promise<boolean>;
  signUpWithEmail: (payload: SignUpPayload) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<boolean>;
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
  isLoading: false,
  errorMessage: '',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  initializeAuth: async () => {
    set({ status: 'initializing', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.getSessionAndProfile();
      if (result) {
        set({ status: 'authenticated', user: result.user, isLoading: false });
        return;
      }
      set({ status: 'unauthenticated', user: null, isLoading: false });
    } catch (error: unknown) {
      set({
        status: 'error',
        user: null,
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'حدث خطأ ما. حاول مرة أخرى',
      });
    }
  },

  loginWithEmail: async (payload) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.loginWithEmail(payload);
      set({ status: 'authenticated', user: result.user, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        status: 'unauthenticated',
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الدخول',
      });
      return false;
    }
  },

  signUpWithEmail: async (payload) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.signUpWithEmail(payload);
      set({ status: 'authenticated', user: result.user, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        status: 'unauthenticated',
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر إنشاء الحساب',
      });
      return false;
    }
  },

  loginWithOAuth: async (provider) => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      const result = await authService.loginWithOAuth(provider);
      set({ status: 'authenticated', user: result.user, isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        status: 'unauthenticated',
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الدخول',
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
      const profile = await authService.completeProfile(user.id, data);
      set({
        status: 'authenticated',
        user: {
          ...user,
          name: profile.name,
          profile_completed: profile.profile_completed,
        },
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      set({
        status: 'authenticated',
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر حفظ البيانات',
      });
      return false;
    }
  },

  setGuestMode: () => {
    set({ status: 'guest', user: null, isLoading: false, errorMessage: '' });
  },

  logout: async () => {
    set({ status: 'loading', isLoading: true, errorMessage: '' });
    try {
      await authService.logout();
      set({ status: 'unauthenticated', user: null, isLoading: false });
    } catch (error: unknown) {
      set({
        status: 'error',
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر تسجيل الخروج',
      });
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, errorMessage: '' });
    try {
      await authService.sendPasswordReset(email);
      set({ isLoading: false });
      return true;
    } catch (error: unknown) {
      set({
        isLoading: false,
        errorMessage: error instanceof Error ? error.message : 'تعذّر إرسال الرابط',
      });
      return false;
    }
  },

  clearError: () =>
    set((state) => ({
      errorMessage: '',
      status: state.status === 'error' ? 'unauthenticated' : state.status,
    })),

  resetAuth: () => set({ ...initialState }),
}));
