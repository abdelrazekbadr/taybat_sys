import type { Meal, MealItem, ZoneColor } from '@/types';

export interface IMealRepository {
  getMeals(): Promise<Meal[]>;
  getMealById(id: number): Promise<Meal | null>;
  getMealsByZone(zone: ZoneColor): Promise<Meal[]>;
  getMealItems(): Promise<MealItem[]>;
  getMealItemsByZone(zone: ZoneColor): Promise<MealItem[]>;
}
