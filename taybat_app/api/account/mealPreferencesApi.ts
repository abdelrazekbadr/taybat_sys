import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';

export async function fetchMealFavorites(_userId: number): Promise<number[] | null> {
  try {
    const value = await storageService.get<unknown>(STORAGE_KEYS.MEAL_FAVORITES);
    if (!Array.isArray(value)) return null;
    return value.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  } catch {
    return null;
  }
}

export async function saveMealFavorites(_userId: number, favorites: number[]): Promise<void> {
  await storageService.set(STORAGE_KEYS.MEAL_FAVORITES, favorites);
}
