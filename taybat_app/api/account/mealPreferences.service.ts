import { fetchMealFavorites, saveMealFavorites } from './mealPreferencesApi';

class MealPreferencesService {
  async fetchFavorites(userId: number): Promise<number[] | null> {
    return fetchMealFavorites(userId);
  }

  async saveFavorites(userId: number, favorites: number[]): Promise<void> {
    await saveMealFavorites(userId, favorites);
  }

  async toggleFavorite(userId: number, mealId: number): Promise<number[]> {
    const current = (await fetchMealFavorites(userId)) ?? [];
    const isFav = current.includes(mealId);
    const next = isFav ? current.filter((id) => id !== mealId) : [...current, mealId];
    await saveMealFavorites(userId, next);
    return next;
  }
}

export const mealPreferencesService = new MealPreferencesService();
