import { MOCK_MEAL_ITEMS, MOCK_MEALS } from '@/data/mock';
import type { Meal, MealItem, ZoneColor } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { IMealRepository } from './IMealRepository';

export class MealRepositoryMock implements IMealRepository {
  async getMeals(): Promise<Meal[]> {
    await mockDelay();
    return MOCK_MEALS;
  }

  async getMealById(id: number): Promise<Meal | null> {
    await mockDelay(150);
    return MOCK_MEALS.find((m) => m.id === id) ?? null;
  }

  async getMealsByZone(zone: ZoneColor): Promise<Meal[]> {
    await mockDelay(150);
    return MOCK_MEALS.filter((m) => m.dominant_zone === zone);
  }

  async getMealItems(): Promise<MealItem[]> {
    await mockDelay();
    return MOCK_MEAL_ITEMS;
  }

  async getMealItemsByZone(zone: ZoneColor): Promise<MealItem[]> {
    await mockDelay(150);
    return MOCK_MEAL_ITEMS.filter((item) => item.zone === zone);
  }
}
