export type ZoneColor = 1 | 2 | 3 | 4 | 5;

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
}

export interface User {
  id: number;
  subscriber_id: number;
  name: string;
  avatar_url: string | null;
  plan_start_date: string;
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
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
}
