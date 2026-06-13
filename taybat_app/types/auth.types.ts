export type AuthProvider = 'email' | 'google' | 'apple' | 'facebook' | 'guest';
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
  birth_date: string | null;
  birth_year: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: ActivityLevel | null;
  health_goals_codes: string | null;
  health_conditions_codes: string | null;
  provider: AuthProvider;
  profile_completed: boolean;
  plan_start_date: string | null;
  next_rating_date: string | null;
  last_health_score: number | null;
  last_improvement_goals_codes: string | null;
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
  birth_date?: string;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: ActivityLevel;
  health_goals_codes?: string;
  health_conditions_codes?: string;
  initial_health_score?: WeeklyScore;
}

export type WeeklyScore = 1 | 2 | 3 | 4 | 5;

export interface AuthResult {
  user: AuthUser;
  profile: UserProfile;
  profile_completed: boolean;
}

export interface AuthSession {
  access_token: string;
  user_id: string;
  expires_at: number;
  /** Real email from OAuth provider — undefined in mock sessions */
  email?: string;
  /** Display name from OAuth provider — undefined in mock sessions */
  name?: string | null;
  /** Avatar URL from OAuth provider — undefined in mock sessions */
  avatar_url?: string | null;
  /** ISO birth date from Google People API — only set after Google sign-in */
  birth_date?: string | null;
  /** Gender from Google People API — only set after Google sign-in */
  gender?: Gender | null;
}
