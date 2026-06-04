import { MOCK_USER_MEALS } from '@/data/mock';
import type { UserMeal } from '@/types';
import { localDateISO } from '@/utils/dateUtils';
import { mockDelay } from '@/utils/mockDelay';
import type { CreateUserMealPayload, ITrackingRepository } from './ITrackingRepository';

// In-memory store — starts from mock data, mutations are session-only.
let _meals: UserMeal[] = [...MOCK_USER_MEALS];
let _nextId = _meals.reduce((max, m) => Math.max(max, m.id), 0) + 1;

export class TrackingRepositoryMock implements ITrackingRepository {
  async getUserMeals(userId: string): Promise<UserMeal[]> {
    await mockDelay();
    return _meals.filter((m) => m.user_id === userId);
  }

  async getMealsByDate(userId: string, date: string): Promise<UserMeal[]> {
    await mockDelay(150);
    return _meals.filter((m) => m.user_id === userId && m.date === date);
  }

  async logMeal(payload: CreateUserMealPayload): Promise<UserMeal> {
    await mockDelay();
    const now = new Date();
    const entry: UserMeal = {
      id: _nextId++,
      user_id: payload.userId,
      meal_id: payload.mealId,
      meal_item_codes: payload.mealItemCodes,
      datetime: now.toISOString(),
      date: localDateISO(now),
      zone_summary: payload.zoneSummary,
      hungry_state: payload.hungryState ?? null,
    };
    _meals = [..._meals, entry];
    return entry;
  }

  async replaceMeal(userMealId: number, payload: CreateUserMealPayload): Promise<UserMeal> {
    await mockDelay();
    const now = new Date().toISOString();
    const existing = _meals.find((m) => m.id === userMealId);
    const updated: UserMeal = {
      id: userMealId,
      user_id: payload.userId,
      meal_id: payload.mealId,
      meal_item_codes: payload.mealItemCodes,
      datetime: now,
      date: existing?.date ?? now.slice(0, 10),
      zone_summary: payload.zoneSummary,
    };
    _meals = _meals.map((m) => (m.id === userMealId ? updated : m));
    return updated;
  }

  async deleteMeal(id: number): Promise<void> {
    await mockDelay(150);
    _meals = _meals.filter((m) => m.id !== id);
  }
}
