import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, View, ScrollView, RefreshControl, Alert, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';

import { BarChart2, ChevronLeft, ChevronRight, Star, Utensils } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { MealSpinner } from '@/components/common/MealSpinner';
import { useRTL } from '@/hooks/useRTL';
import { CommitmentCard } from '@/components/home/CommitmentCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { TodayMealRow } from '@/components/home/TodayMealRow';
import { WeeklyProgressBar } from '@/components/home/WeeklyProgressBar';
import { useMealsStore } from '@/stores/meals.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import { useUserRatingStore } from '@/stores/userRating.store';
import { daysOnPlan } from '@/utils/statsUtils';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useUserStore();
  const { userMeals, todayMeals, initializeUserMeals } = useUserMealsStore();
  const refreshTodayMeals = useUserMealsStore((s) => s.refreshTodayMeals);
  const { meals, isLoading: mealsLoading, errorMessage: mealsError, initializeMeals, getMealById } = useMealsStore();
  const { pendingRating, initializeRatings, checkPendingRating } = useUserRatingStore();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const loadNotifications = useNotificationsStore((s) => s.loadNotifications);
  const { rowDir, isRTL } = useRTL();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const deleteMeal = useUserMealsStore((s) => s.deleteMeal);

  useEffect(() => {
    if (!userMeals.length) initializeUserMeals();
  }, [initializeUserMeals, userMeals.length]);

  // Re-filter todayMeals by the current calendar date whenever the screen gains
  // focus or the app returns to the foreground — handles overnight date changes.
  useFocusEffect(
    useCallback(() => {
      refreshTodayMeals();
    }, [refreshTodayMeals]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshTodayMeals();
    });
    return () => sub.remove();
  }, [refreshTodayMeals]);

  useEffect(() => {
    if (!meals.length) initializeMeals();
  }, [initializeMeals, meals.length]);

  useEffect(() => {
    initializeRatings();
  }, [initializeRatings]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setCardKey((k) => k + 1);
    await Promise.all([
      initializeUserMeals(),
      initializeMeals(),
      initializeRatings(),
    ]);
    setIsRefreshing(false);
  }, [initializeUserMeals, initializeMeals, initializeRatings]);

  useEffect(() => {
    if (userMeals.length) checkPendingRating();
  }, [userMeals, checkPendingRating]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <MealSpinner />
      </View>
    );
  }

  if (mealsLoading && !meals.length) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <MealSpinner />
      </View>
    );
  }

  if (mealsError && !meals.length) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-app-background px-8">
        <AppText variant="bold" className="text-center text-[16px]" style={{ color: theme.colors.error }}>
          تعذّر تحميل البيانات
        </AppText>
        <AppText className="text-center text-[13px] leading-5 text-app-textMuted">
          {mealsError}
        </AppText>
        <Pressable
          onPress={() => { void initializeMeals(); }}
          className="mt-2 rounded-full px-6 py-2.5"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <AppText variant="semibold" className="text-[14px] text-white">إعادة المحاولة</AppText>
        </Pressable>
      </View>
    );
  }

  const dayNumber = daysOnPlan(user.plan_start_date);

  return (
    <View className="flex-1 bg-app-background">
      <HomeHeader
        name={user.name}
        gender={user.gender}
        avatarUrl={user.avatar_url}
        onProfilePress={() => router.push('/(main)/user-profile')}
        onBellPress={() => router.push('/(main)/notifications')}
        unreadCount={unreadCount}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View className="px-[22px] pb-6">
          <CommitmentCard
            key={cardKey}
            dayNumber={dayNumber}
            planStartDate={user.plan_start_date}
            onAddMeal={() => router.push('/(main)/select-meal')}
          />

          {/* Today's meals */}
          {todayMeals.length > 0 && (
            <View className="mt-[22px]">
              <View
                className="mb-3 items-center justify-between px-1"
                style={{ flexDirection: rowDir }}
              >
                <AppText variant="bold" className="text-[17px]  text-app-navy">
                  وجبات اليوم
                </AppText>
                <AppText
                  variant="bold"
                  className="text-[13px]  text-app-primaryDark"
                  onPress={() => router.push('/(main)/select-meal')}
                >
                  سجّل وجبة
                </AppText>
              </View>
              <View className="gap-2.5">
                {todayMeals.map((um) => {
                  const meal = getMealById(um.meal_id);
                  const slotIndex = um.id % 3;
                  const initialTab =
                    slotIndex === 0 ? 'breakfast' : slotIndex === 1 ? 'lunch' : 'dinner';
                  return (
                    <TodayMealRow
                      key={um.id}
                      userMeal={um}
                      mealName={meal?.name ?? 'وجبة'}
                      imageUrl={meal?.image_url}
                      onPress={() =>
                        router.push({
                          pathname: '/(main)/meal-detail',
                          params: { mealId: String(um.meal_id), userMealId: String(um.id) },
                        })
                      }
                      onReplacePress={() =>
                        router.push({
                          pathname: '/(main)/select-meal',
                          params: { replaceUserMealId: String(um.id), initialTab },
                        })
                      }
                      onDeletePress={() => {
                        Alert.alert('حذف الوجبة', 'هل تريد حذف هذه الوجبة من سجل اليوم؟', [
                          { text: 'إلغاء', style: 'cancel' },
                          {
                            text: 'حذف',
                            style: 'destructive',
                            onPress: async () => {
                              const ok = await deleteMeal(um.id);
                              if (!ok) {
                                const message = useUserMealsStore.getState().errorMessage;
                                Alert.alert('تعذّر حذف الوجبة', message || 'حاول مرة أخرى');
                              }
                            },
                          },
                        ]);
                      }}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {todayMeals.length === 0 && (
            <View className="mt-[22px]">
              <View className="items-center gap-2 rounded-[20px] border border-app-lineSoft bg-app-surface p-6">
                <Utensils size={40} color={theme.colors.outline} strokeWidth={1.5} />
                <AppText variant="bold" className="text-[15px] leading-[22px] text-app-navy">
                  لم تسجّل وجبات اليوم بعد
                </AppText>
                <AppText className="text-center text-[13px] leading-6 text-app-textSoft">
                  سجّل أول وجبة وابدأ يومك بشكل صحيح
                </AppText>
              </View>
            </View>
          )}

          {/* Stats link */}
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(main)/stats',
                params: { initialTab: pendingRating ? 'evaluation' : 'timeline' },
              } as never)
            }
            className="mt-3 rounded-[18px] border border-app-lineSoft bg-app-surface px-4 py-4"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <View className="items-center gap-3" style={{ flexDirection: rowDir }}>
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-app-surfaceAlt">
                <BarChart2 size={20} color={theme.colors.primary} strokeWidth={2.4} />
              </View>
              <View className="flex-1">
                <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
                  إنجازاتي
                </AppText>
                <AppText className="text-[12.5px] leading-6 text-app-textMuted">
                  شاهد تقييماتك وتطورك
                </AppText>
              </View>
              {isRTL ? (
                <ChevronLeft size={22} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
              ) : (
                <ChevronRight size={22} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
              )}
            </View>
          </Pressable>

          {/* Weekly rating banner */}
          {pendingRating && (
            <Pressable
              onPress={() => router.push('/(main)/stats' as never)}
              className="mt-[22px] overflow-hidden rounded-[18px] border border-app-warning bg-app-surface"
              style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
            >
              {/* Warning accent stripe on the start edge */}
              <View className="flex-row" style={{ flexDirection: rowDir }}>
                <View className="w-1 self-stretch bg-app-warning" />
                <View className="flex-1 items-center gap-3 px-4 py-3.5" style={{ flexDirection: rowDir }}>
                  {/* Icon badge */}
                  <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-app-warningSoft">
                    <Star size={22} color="#F5A623" fill="#F5A623" strokeWidth={0} />
                  </View>
                  {/* Text */}
                  <View className="flex-1">
                    <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
                      حان وقت تقييمك الأسبوعي
                    </AppText>
                    <AppText className="text-[12px] leading-5 text-app-textSoft">
                      أخبرنا كيف كان أسبوعك الصحي
                    </AppText>
                  </View>
                  {/* Directional arrow */}
                  {isRTL
                    ? <ChevronLeft  size={20} color="#F5A623" strokeWidth={2.5} />
                    : <ChevronRight size={20} color="#F5A623" strokeWidth={2.5} />}
                </View>
              </View>
            </Pressable>
          )}

          {/* Weekly commitment progress */}
          <View className="mt-[22px]">
            <WeeklyProgressBar
              userMeals={userMeals}
              planStartDate={user.plan_start_date}
              onPress={() => router.push('/(main)/meal-history' as never)}
            />
          </View>
        </View>
      </ScrollView>

      <AppTabBar active="home" />
    </View>
  );
}
