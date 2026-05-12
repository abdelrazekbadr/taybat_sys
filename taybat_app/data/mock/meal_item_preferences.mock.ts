import type { MealItemPreference } from '@/types';

export const MOCK_MEAL_ITEM_PREFERENCES: MealItemPreference[] = Object.freeze([
  { user_id: 1, meal_item_id: 1001, is_active: true, is_favorite: true },
  { user_id: 1, meal_item_id: 2001, is_active: true, is_favorite: true },
  { user_id: 1, meal_item_id: 3001, is_active: true, is_favorite: true },
  { user_id: 1, meal_item_id: 4001, is_active: true, is_favorite: true },
  { user_id: 1, meal_item_id: 5001, is_active: true, is_favorite: true },
  { user_id: 1, meal_item_id: 1006, is_active: true, is_favorite: false },
  { user_id: 1, meal_item_id: 2025, is_active: true, is_favorite: false },
  { user_id: 1, meal_item_id: 3002, is_active: true, is_favorite: false },
]) as unknown as MealItemPreference[];
