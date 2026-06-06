/**
 * Resets all feature stores to their initial state.
 * Called during logout so account.store doesn't need to import every other store.
 */
import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';

import { useCommunityStore } from './community.store';
import { useHealthConditionsStore } from './healthConditions.store';
import { useHealthGoalsStore } from './healthGoals.store';
import { useMealItemsStore } from './mealItems.store';
import { useMealPreferencesStore } from './mealPreferences.store';
import { useMealsStore } from './meals.store';
import { useThemeStore } from './theme.store';
import { useUserMealsStore } from './userMeals.store';
import { useUserStore } from './user.store';
import { useNotificationsStore } from './notifications.store';
import { useTopicsStore } from './topics.store';
import { useUserRatingStore } from './userRating.store';
import { useMembershipStore } from './membership.store';

export async function resetAllAppStores(): Promise<void> {
  await Promise.all([
    storageService.remove(STORAGE_KEYS.USER_NAME),
    storageService.remove(STORAGE_KEYS.AVATAR_CONFIG),
    storageService.remove(STORAGE_KEYS.POST_VISIBILITY),
    storageService.remove(STORAGE_KEYS.FOLLOW_PERMISSION),
    storageService.remove(STORAGE_KEYS.MEAL_ITEM_PREFERENCES),
    storageService.remove(STORAGE_KEYS.MEAL_FAVORITES),
    storageService.remove(STORAGE_KEYS.COMMUNITY_REACTIONS),
    storageService.remove(STORAGE_KEYS.COMMUNITY_FOLLOWS),
    storageService.remove(STORAGE_KEYS.NOTIFICATION_READS),
    useThemeStore.getState().resetTheme(),
  ]);

  useCommunityStore.getState().resetCommunity();
  useHealthConditionsStore.getState().resetHealthConditions();
  useHealthGoalsStore.getState().resetHealthGoals();
  useMealsStore.getState().resetMeals();
  useMealItemsStore.getState().resetMealItems();
  useUserMealsStore.getState().resetUserMeals();
  useUserRatingStore.getState().resetUserRatings();
  useMealPreferencesStore.getState().resetPreferences();
  useTopicsStore.getState().resetTopics();
  useNotificationsStore.getState().resetNotifications();
  useMembershipStore.getState().resetMembership();
  useUserStore.getState().resetUser();
}
