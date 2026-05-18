export type ZoneColor = 1 | 2 | 3 | 4 | 5;

export * from './auth.types';

export type PostVisibility = 'public' | 'followers';
export type FollowPermission = 'everyone' | 'approved';
export type AvatarType = 'letter' | 'emoji';

export interface AvatarConfig {
  type: AvatarType;
  value: string;
  color?: string;
}

export interface MealItem {
  id: number;
  name: string;
  category: number;
  zone: ZoneColor;
  rating: number;
  frequency: string;
  notes: string;
  image_url: string;
}

export interface Meal {
  id: number;
  name: string;
  meal_item_ids: string;
  dominant_zone: ZoneColor;
  image_url: string;
  /** comma-separated meal type ids: 1=إفطار 2=غداء 3=عشاء */
  meal_type_ids: string;
}

export interface User {
  id: number;
  subscriber_id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  plan_start_date: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  post_visibility: PostVisibility;
  follow_permission: FollowPermission;
}

export interface MealItemPreference {
  user_id: number;
  meal_item_id: number;
  is_active: boolean;
  is_favorite: boolean;
}

export interface UserMeal {
  id: number;
  user_id: number;
  meal_id: number;
  meal_item_ids: string;
  datetime: string;
  date: string;
  zone_summary: ZoneColor;
}

export type WeeklyScore = 1 | 2 | 3 | 4 | 5;

export interface WeeklyRating {
  id: number;
  user_id: number;
  period_start: string;
  submitted_at: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore;
  pain_reduced: boolean;
  energy_improved: boolean;
  sleep_improved: boolean;
  digestion_improved: boolean;
  mood_improved: boolean;
  mental_health_improved: boolean;
}

export type PostType = 'system' | 'achievement' | 'meal_share' | 'user_post';

export type ReactionType = 'love';

export interface CommunityPost {
  id: number;
  user_id: number;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  post_type: PostType;
  is_pinned: boolean;
  love_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityStats {
  month: string;
  active_users: number;
  avg_health_score: number | null;
  avg_adherence_score: number | null;
  total_meals_logged: number;
}
