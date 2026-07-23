import { Image } from 'expo-image';

import type { Meal } from '@/types';

/**
 * Resolves the URI to load for a meal image.
 * Priority: explicit meal.image_url > {baseUrl}{meal.code}.png > null
 * (caller falls back to a local default asset when this returns null,
 * and on runtime load failure).
 */
export function getMealImageUri(
  meal: Pick<Meal, 'image_url' | 'code'>,
  baseUrl: string,
): string | null {
  if (meal.image_url) return meal.image_url;
  if (baseUrl && meal.code) return `${baseUrl}${meal.code}.png`;
  return null;
}

/**
 * Warm the on-disk image cache for the given meals so their thumbnails render
 * later even with no network (offline-first). Fire-and-forget — failures are
 * ignored. `expo-image` persists prefetched images to disk by default.
 */
export function prefetchMealImages(
  meals: Pick<Meal, 'image_url' | 'code'>[],
  baseUrl: string,
): void {
  const uris = meals
    .map((m) => getMealImageUri(m, baseUrl))
    .filter((u): u is string => !!u);
  if (uris.length) void Image.prefetch(uris, { cachePolicy: 'disk' });
}
