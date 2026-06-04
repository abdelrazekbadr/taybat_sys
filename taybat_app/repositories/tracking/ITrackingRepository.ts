import type { UserMeal } from '@/types';

export interface CreateUserMealPayload {
  userId: string;
  mealId: number;
  mealItemCodes: string;
  zoneSummary: import('@/types').ZoneColor;
  hungryState?: import('@/types').HungryState | null;
}

export interface ITrackingRepository {
  getUserMeals(userId: string): Promise<UserMeal[]>;
  getMealsByDate(userId: string, date: string): Promise<UserMeal[]>;
  logMeal(payload: CreateUserMealPayload): Promise<UserMeal>;
  replaceMeal(userMealId: number, payload: CreateUserMealPayload): Promise<UserMeal>;
  deleteMeal(id: number): Promise<void>;
}
