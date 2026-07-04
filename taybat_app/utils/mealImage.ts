import type { Meal } from '@/types';

/**
 * Resolves the URI to load for a meal image.
 * Priority: explicit meal.image_url > {baseUrl}{meal.code}.png > null
 * (caller falls back to a local default asset when this returns null,
 * and on runtime load failure).
 */
export function getMealImageUri(meal: Pick<Meal, 'image_url' | 'code'>, baseUrl: string): string | null {
  if (meal.image_url) return meal.image_url;
  if (baseUrl && meal.code) return `${baseUrl}${meal.code}.png`;
  return null;
}
