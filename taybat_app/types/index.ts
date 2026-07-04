import type { Gender, WeeklyScore } from './auth.types';

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

export interface MealItemCategory {
  id: number;
  name: string;
  name_en: string | null;
  description: string | null;
  description_en: string | null;
}

export interface MealItem {
  id: number;
  code: string;
  name: string;
  category: number;
  meal_category_id?: number | null;
  zone: ZoneColor;
  rating: number;
  frequency: string;
  notes: string;
  image_url: string;
  sequence?: number;
}

export interface Meal {
  id: number;
  name: string;
  /** unique meal identifier, e.g. "M001" — used to derive image filename {code}.png */
  code: string;
  /** comma-separated meal_item codes from meal_items.code */
  meal_item_codes: string;
  dominant_zone: ZoneColor;
  rating: number;
  image_url: string;
  /** comma-separated meal type ids: 1=إفطار 2=غداء 3=عشاء */
  meal_type_ids: string;
  sequence?: number;
  max_day_frequency?: number | null;
  max_week_frequency?: number | null;
  max_month_frequency?: number | null;
}

export interface User {
  id: string;                     // UUID from Supabase auth.users
  email: string;
  name: string | null;
  gender: Gender | null;
  avatar_url: string | null;
  avatar_config: AvatarConfig | null;
  plan_start_date: string | null;
  next_rating_date: string | null;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  post_visibility: PostVisibility;
  follow_permission: FollowPermission;
  profile_completed: boolean;
  registered_at: string;          // profiles.created_at — user's registration timestamp
}

export interface MealItemPreference {
  user_id: number;
  meal_item_id: number;
  is_active: boolean;
  is_favorite: boolean;
}

export type HungryState = 1 | 2 | 3 | 4;

export interface UserMeal {
  id: number;
  user_id: string;              // UUID from auth.users
  meal_id: number;
  /** comma-separated meal_item codes from meal_items.code */
  meal_item_codes: string;
  datetime: string;
  date: string;
  zone_summary: ZoneColor;
  /** 1=شبعان  2=عادي  3=جائع  4=جوع شديد — null on legacy rows */
  hungry_state?: HungryState | null;
}

export interface UserRating {
  id: number;
  user_id: string;
  period_start: string;
  submitted_at: string;
  health_score: WeeklyScore;
  adherence_score: WeeklyScore | null;   // system-computed — not user-entered
  improvement_goals_codes: string;        // CSV of health_goal IDs e.g. "1,4,5"
}

export interface HealthGoal {
  id: number;
  code: string;
  name: string;
  name_en: string | null;
  active: boolean;
  image: string | null;
  show_in_complete_profile: boolean;
}

export interface HealthCondition {
  code: string;
  name: string;
  name_en: string | null;
  active: boolean;
  image: string | null;
}

export interface LibraryTopic {
  id: number;
  code: string;
  sequence: number;
  title: string;
  description: string;
  image_url: string;
  accent_color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
}

export interface LibraryTopicItem {
  id: number;
  topic_id: number;
  code: string;
  sequence: number;
  icon: string;
  title: string;
  description: string;
  is_active: boolean;
}

export type LibraryTopicWithItems = LibraryTopic & { items: LibraryTopicItem[] };

export type PostType = 'system' | 'achievement' | 'meal_share' | 'user_post';
export type NotificationType = 'announcement' | 'new_post' | 'health_tip';
export type NotificationActionType = 'community_post' | 'url';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  image_url: string | null;
  action_type: NotificationActionType | null;
  action_ref: string | null;
  created_at: string;
  is_read: boolean;
}

export type ReactionType = 'love';

export interface CommunityPost {
  id: number;
  user_id: string;              // UUID from auth.users
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  link_url: string | null;
  post_type: PostType;
  is_pinned: boolean;
  love_count: number;
  public_notification: boolean;
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

// ============================================================
// Membership
// ============================================================

export type MembershipTrack = 'committed' | 'supporter';

export type MembershipTierKey = 'starter' | 'bronze' | 'silver' | 'gold' | 'platinum';

export type PointEventActionKey =
  | 'add_daily_meal'
  | 'complete_weekly_rating'
  | 'consecutive_week_streak'
  | 'share_meal'
  | 'share_post'
  | 'share_stats'
  | 'share_topic'
  | 'create_community_post';

export type PointEventReferenceType = 'post' | 'meal' | 'stat' | 'topic';

export interface MembershipTier {
  track: MembershipTrack;
  tierKey: MembershipTierKey;
  minPoints: number;
  labelAr: string;
  iconKey: string;
  sortOrder: number;
}

export interface PointRule {
  actionKey: PointEventActionKey;
  track: MembershipTrack;
  points: number;
  isActive: boolean;
}

export interface UserMembership {
  userId: string;
  committedPoints: number;
  supporterPoints: number;
  committedTier: MembershipTier;
  supporterTier: MembershipTier;
  windowStart: string;
}

export interface MembershipConfig {
  resetWindowDays: number;
  maxDailyMealEvents: number;
  adCooldownHours: number;
  tiers: MembershipTier[];
  rules: PointRule[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  points: number;
  tierKey: MembershipTierKey;
}
