export type AuthProvider = 'email' | 'google' | 'apple' | 'guest';
export type AuthStatus =
  | 'idle'
  | 'initializing'
  | 'authenticated'
  | 'guest'
  | 'unauthenticated'
  | 'loading'
  | 'error';

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  gender: Gender | null;
  birth_year: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: ActivityLevel | null;
  health_goals: string[] | null;
  provider: AuthProvider;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  provider: AuthProvider;
  profile_completed: boolean;
}

export interface SignUpPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileCompletionPayload {
  name: string;
  gender?: Gender;
  birth_year?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: ActivityLevel;
  health_goals?: string[];
}

export interface AuthResult {
  user: AuthUser;
  profile_completed: boolean;
}

export interface AuthSession {
  access_token: string;
  user_id: string;
  expires_at: number;
}

