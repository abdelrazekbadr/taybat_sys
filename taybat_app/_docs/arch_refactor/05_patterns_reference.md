# 05 — Canonical Patterns Reference

This document is the **single source of truth** for how to write code in each layer. When implementing any phase, conform to these patterns exactly.

---

## 1. Repository Interface Pattern

Every feature defines one interface per data concern. The interface uses domain types — no Supabase or AsyncStorage types leak into it.

```typescript
// features/auth/repository/IAuthRepository.ts

import type { AuthSession } from '../domain/auth.types';
import type { LoginPayload, SignupPayload } from '../domain/auth.types';

export interface IAuthRepository {
  login(payload: LoginPayload): Promise<AuthSession>;
  signup(payload: SignupPayload): Promise<AuthSession>;
  logout(userId: string): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  sendPasswordReset(email: string): Promise<void>;
}
```

Rules:
- Method names are domain verbs, not HTTP verbs (`login` not `postLogin`)
- All methods are `async` (return `Promise`)
- Input and output types come from `domain/` — never from Supabase SDK types
- No optional parameters that differ between implementations

---

## 2. Repository Implementation Pattern (Mock)

```typescript
// features/auth/repository/auth.repository.mock.ts

import { storageService } from '@/shared/storage/storageService';
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { InvalidCredentialsError, ServerError } from '@/shared/errors/AppError';
import { mockDelay } from '@/utils/mockDelay';
import type { IAuthRepository } from './IAuthRepository';
import type { AuthSession, LoginPayload } from '../domain/auth.types';

export class AuthRepositoryMock implements IAuthRepository {
  async login(payload: LoginPayload): Promise<AuthSession> {
    await mockDelay();
    const users = await this.loadUsers();
    const user = users.find(
      (u) => u.email === payload.email && u.password === payload.password
    );
    if (!user) throw new InvalidCredentialsError();
    const session = this.buildSession(user);
    await storageService.set(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return session;
  }

  async getSession(): Promise<AuthSession | null> {
    const raw = await storageService.getString(STORAGE_KEYS.AUTH_SESSION);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }

  // ... other methods

  private async loadUsers() { /* ... */ }
  private buildSession(user: MockUser): AuthSession { /* ... */ }
}
```

---

## 3. Repository Factory Pattern

```typescript
// features/auth/repository/index.ts

import { AuthRepositoryMock } from './auth.repository.mock';
import { AuthRepositorySupabase } from './auth.repository.supabase';
import { supabaseClient } from '@/shared/api/supabaseClient';
import type { IAuthRepository } from './IAuthRepository';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const authRepository: IAuthRepository = USE_MOCK
  ? new AuthRepositoryMock()
  : new AuthRepositorySupabase(supabaseClient);
```

---

## 4. Use-Case Pattern

```typescript
// features/auth/domain/loginUseCase.ts

import { ValidationError, AuthError } from '@/shared/errors/AppError';
import { loginSchema } from './auth.schemas';
import type { IAuthRepository } from '../repository/IAuthRepository';
import type { AuthSession, LoginPayload } from './auth.types';

export async function loginUseCase(
  repo: IAuthRepository,
  payload: LoginPayload
): Promise<AuthSession> {
  const result = loginSchema.safeParse(payload);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors);
  }
  return repo.login(result.data);
}
```

Rules:
- Pure function — no imports from stores, React, or navigation
- First parameter is always the repository interface
- Throws typed `AppError` subclasses, never plain `Error` or strings
- Contains domain rules (validation, business invariants) not UI logic
- Testable with a simple in-memory repository

---

## 5. Zustand Store Pattern

```typescript
// features/auth/store/authSession.store.ts

import { create } from 'zustand';
import { authRepository } from '../repository';
import { loginUseCase } from '../domain/loginUseCase';
import { toUserMessage } from '@/shared/errors/errorUtils';
import type { AuthSession, LoginPayload } from '../domain/auth.types';

type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'guest' | 'unauthenticated' | 'error';

interface AuthSessionState {
  session: AuthSession | null;
  status: AuthStatus;
  errorMessage: string;

  initializeSession: () => Promise<void>;
  loginWithEmail: (payload: LoginPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  session: null,
  status: 'idle' as AuthStatus,
  errorMessage: '',
};

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  ...initialState,

  initializeSession: async () => {
    set({ status: 'initializing' });
    try {
      const session = await authRepository.getSession();
      set({ session, status: session ? 'authenticated' : 'unauthenticated' });
    } catch {
      set({ status: 'unauthenticated' });
    }
  },

  loginWithEmail: async (payload) => {
    set({ errorMessage: '' });
    try {
      const session = await loginUseCase(authRepository, payload);
      set({ session, status: 'authenticated' });
      return true;
    } catch (error: unknown) {
      set({ errorMessage: toUserMessage(error), status: 'error' });
      return false;
    }
  },

  logout: async () => {
    const session = useAuthSessionStore.getState().session;
    if (session) await authRepository.logout(session.userId);
    set({ ...initialState, status: 'unauthenticated' });
  },

  reset: () => set(initialState),
}));
```

Rules:
- Never import other feature stores
- `userId` needed by actions is read from own state (`getState()`) or passed as parameter
- Always include `reset()` action
- `errorMessage` is always a user-displayable string (use `toUserMessage()`)
- Status is a discriminated union string literal type
- Loading state uses `status` — avoid separate `isLoading` boolean when status covers it

---

## 6. TanStack Query Hook Pattern (Read)

```typescript
// features/meals/hooks/useMeals.ts

import { useQuery } from '@tanstack/react-query';
import { mealRepository } from '../repository';

export const MEALS_QUERY_KEY = ['meals'] as const;

export function useMeals() {
  return useQuery({
    queryKey: MEALS_QUERY_KEY,
    queryFn: () => mealRepository.getMeals(),
    staleTime: 30 * 60 * 1000,  // meals catalog rarely changes
    gcTime: 60 * 60 * 1000,
  });
}
```

---

## 7. TanStack Query Hook Pattern (Mutation with Optimistic Update)

```typescript
// features/community/hooks/useReactToPost.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { communityRepository } from '../repository';
import { FEED_QUERY_KEY } from './useCommunityFeed';
import type { ReactionType } from '../domain/community.types';

export function useReactToPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId, reaction }: {
      userId: string;
      postId: string;
      reaction: ReactionType;
    }) => communityRepository.reactToPost(userId, postId, reaction),

    onMutate: async ({ postId, reaction }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const prev = queryClient.getQueryData(FEED_QUERY_KEY);
      // apply optimistic update to cache
      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(FEED_QUERY_KEY, context.prev);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}
```

---

## 8. AppError Pattern

```typescript
// shared/errors/AppError.ts

export enum ErrorCode {
  NETWORK = 'NETWORK',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION = 'PERMISSION',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export class AppError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NetworkError extends AppError {
  constructor(cause?: unknown) {
    super(ErrorCode.NETWORK, 'Network error', cause);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
  }
}

export class SessionExpiredError extends AppError {
  constructor() {
    super(ErrorCode.SESSION_EXPIRED, 'Session expired');
  }
}

export class ValidationError extends AppError {
  constructor(readonly fields: Record<string, string[]>) {
    super(ErrorCode.VALIDATION, 'Validation failed');
  }
}
```

```typescript
// shared/errors/errorUtils.ts

import { AppError, NetworkError, SessionExpiredError, ErrorCode } from './AppError';
import i18next from 'i18next';

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    switch (error.code) {
      case ErrorCode.INVALID_CREDENTIALS: return i18next.t('errors.invalidCredentials');
      case ErrorCode.SESSION_EXPIRED:     return i18next.t('errors.sessionExpired');
      case ErrorCode.NETWORK:             return i18next.t('errors.network');
      case ErrorCode.VALIDATION:          return i18next.t('errors.validation');
      default:                            return i18next.t('errors.unknown');
    }
  }
  return i18next.t('errors.unknown');
}

export const isNetworkError = (e: unknown): e is NetworkError => e instanceof NetworkError;
export const isSessionExpired = (e: unknown): e is SessionExpiredError => e instanceof SessionExpiredError;
```

---

## 9. React Error Boundary Pattern

```typescript
// shared/ui/ErrorBoundary.tsx

import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/AppText';
import { PrimaryButton } from '@/components/PrimaryButton';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ onRetry: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to crash reporting (e.g., Sentry)
    console.error('[ErrorBoundary]', error, info);
  }

  retry = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) return <Fallback onRetry={this.retry} />;
      return (
        <View className="flex-1 items-center justify-center p-6">
          <AppText variant="semibold" className="text-center text-app-text">
            حدث خطأ غير متوقع
          </AppText>
          <PrimaryButton onPress={this.retry} label="إعادة المحاولة" className="mt-4" />
        </View>
      );
    }
    return this.props.children;
  }
}
```

---

## 10. Screen Pattern (Thin Screen)

Screens are the thinnest layer. They:
- Subscribe to store selectors narrowly
- Call store actions or mutation hooks
- Pass data to dumb components as props
- Do not contain business logic

```typescript
// app/(main)/index.tsx (Home Screen — example)

import { useTodayMeals } from '@/features/tracking/hooks/useTodayMeals';
import { useCurrentUser } from '@/features/user/hooks/useCurrentUser';
import { useLogMeal } from '@/features/tracking/hooks/useLogMeal';
import { TodayMealRow } from '@/features/tracking/components/TodayMealRow';
import { HomeHeader } from '@/features/user/components/HomeHeader';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

export default function HomeScreen() {
  const { data: user } = useCurrentUser();
  const { data: todayMeals = [] } = useTodayMeals(user?.id ?? '');
  const { mutate: logMeal } = useLogMeal();

  return (
    <ErrorBoundary>
      <ScrollView className="flex-1 bg-app-background">
        <HomeHeader user={user} />
        {todayMeals.map((meal) => (
          <TodayMealRow key={meal.id} meal={meal} />
        ))}
      </ScrollView>
    </ErrorBoundary>
  );
}
```

---

## 11. Test Pattern (Use-Case Unit Test)

```typescript
// features/auth/domain/__tests__/loginUseCase.test.ts

import { loginUseCase } from '../loginUseCase';
import { InvalidCredentialsError } from '@/shared/errors/AppError';
import { createAuthSession, createUser } from '@/shared/testing/factories/userFactory';
import type { IAuthRepository } from '../../repository/IAuthRepository';

function makeRepo(overrides?: Partial<IAuthRepository>): IAuthRepository {
  return {
    login: jest.fn().mockResolvedValue(createAuthSession()),
    signup: jest.fn(),
    logout: jest.fn(),
    getSession: jest.fn().mockResolvedValue(null),
    sendPasswordReset: jest.fn(),
    ...overrides,
  };
}

describe('loginUseCase', () => {
  it('returns session on valid credentials', async () => {
    const repo = makeRepo();
    const result = await loginUseCase(repo, { email: 'a@b.com', password: '123456' });
    expect(result.userId).toBeDefined();
    expect(repo.login).toHaveBeenCalledWith({ email: 'a@b.com', password: '123456' });
  });

  it('throws ValidationError on empty email', async () => {
    const repo = makeRepo();
    await expect(loginUseCase(repo, { email: '', password: '123456' }))
      .rejects.toThrow('Validation failed');
  });

  it('propagates InvalidCredentialsError from repo', async () => {
    const repo = makeRepo({ login: jest.fn().mockRejectedValue(new InvalidCredentialsError()) });
    await expect(loginUseCase(repo, { email: 'a@b.com', password: 'wrong' }))
      .rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
```

---

## 12. Stats Aggregator Pattern (Pure Functions)

```typescript
// features/stats/domain/statsAggregator.ts
// All functions are pure — no side effects, no async, no imports from stores

import type { UserMeal } from '@/features/tracking/domain/tracking.types';
import type { Zone, ZoneDistribution, DailySummary } from './stats.types';

export function mealFrequencyByZone(meals: UserMeal[]): ZoneDistribution {
  const counts: Record<Zone, number> = { green: 0, yellow: 0, orange: 0, purple: 0, red: 0 };
  for (const meal of meals) counts[meal.zone] += 1;
  const total = meals.length || 1;
  return Object.fromEntries(
    Object.entries(counts).map(([zone, count]) => [zone, count / total])
  ) as ZoneDistribution;
}

export function weeklyAdherenceTrend(meals: UserMeal[], weekStart: string): DailySummary[] {
  // group meals by day, compute adherence score per day
  // returns 7 DailySummary objects
}
```

Test these with simple `describe` / `it` blocks — no mocks needed, just data.

---

## Layer Import Summary

```
app/ screens
  ✅ features/*/hooks
  ✅ features/*/store
  ✅ features/*/components
  ✅ components/ (shared primitives)
  ✅ shared/ui
  ❌ features/*/domain (use hooks instead)
  ❌ features/*/repository

features/*/store
  ✅ features/*/domain
  ✅ features/*/repository/index (factory)
  ✅ shared/errors
  ✅ shared/storage
  ❌ other features' stores
  ❌ app/
  ❌ components/

features/*/domain (use-cases, types)
  ✅ shared/errors
  ✅ types in same feature domain/
  ❌ everything else (pure domain)

features/*/repository
  ✅ shared/api
  ✅ shared/storage
  ✅ features/*/domain (types only)
  ❌ stores, hooks, components

shared/
  ❌ features/ (no upward deps)
  ❌ app/

components/ (shared UI primitives)
  ✅ theme/
  ✅ shared/ui
  ❌ stores, features (receive via props/hooks)
```
