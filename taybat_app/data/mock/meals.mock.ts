import type { Meal } from '@/types';

export const MOCK_MEALS: Meal[] = Object.freeze([
  {
    id: 1,
    name: 'فطور',
    meal_item_ids: '1001,1006,1008',
    dominant_zone: 1,
    image_url: '',
  },
  {
    id: 2,
    name: 'غداء',
    meal_item_ids: '3002,1003',
    dominant_zone: 3,
    image_url: '',
  },
  {
    id: 3,
    name: 'عشاء',
    meal_item_ids: '2025,2030',
    dominant_zone: 2,
    image_url: '',
  },
]) as unknown as Meal[];
