import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator, RefreshControl, Alert, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';

import { BarChart2, ChevronLeft, ChevronRight, Star, Utensils } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { useRTL } from '@/hooks/useRTL';
import { BadgeProgressCard } from '@/components/home/BadgeProgressCard';
import { CommitmentCard } from '@/components/home/CommitmentCard';
import { HomeHeader } from '@/components/home/HomeHeader';
import { TodayMealRow } from '@/components/home/TodayMealRow';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import { useWeeklyRatingStore } from '@/stores/weeklyRating.store';
import { currentStreak, daysOnPlan } from '@/utils/statsUtils';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useUserStore();
  const { userMeals, todayMeals, initializeUserMeals } = useUserMealsStore();
  const { meals, isLoading: mealsLoading, errorMessage: mealsError, initializeMeals, getMealById } = useMealsStore();
  const { pendingRating, initializeRatings, checkPendingRating } = useWeeklyRatingStore();
  const { rowDir, isRTL } = useRTL();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const deleteMeal = useUserMealsStore((s) => s.deleteMeal);

  useEffect(() => {
    if (!userMeals.length) initializeUserMeals();
  }, [initializeUserMeals, userMeals.length]);

  useEffect(() => {
    if (!meals.length) initializeMeals();
  }, [initializeMeals, meals.length]);

  useEffect(() => {
    initializeRatings();
  }, [initializeRatings]);

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
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (mealsLoading && !meals.length) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (mealsError && !meals.length) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background" style={{ paddingHorizontal: 32, gap: 16 }}>
        <AppText variant="bold" style={{ fontSize: 16, color: theme.colors.error, textAlign: 'center' }}>
          تعذّر تحميل البيانات
        </AppText>
        <AppText style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20 }}>
          {mealsError}
        </AppText>
        <Pressable
          onPress={() => { void initializeMeals(); }}
          style={{ marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.primary }}
        >
          <AppText variant="semibold" style={{ fontSize: 14, color: '#fff' }}>إعادة المحاولة</AppText>
        </Pressable>
      </View>
    );
  }

  const dayNumber = daysOnPlan(user.plan_start_date);
  const streak = currentStreak(userMeals);
  const BADGE_TARGET = 7;

  return (
    <View className="flex-1 bg-app-background">
      <HomeHeader
        name={user.name}
        avatarUrl={user.avatar_url}
        onProfilePress={() => router.push('/(main)/user-profile')}
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
          streakDays={streak}
          onAddMeal={() => router.push('/(main)/select-meal')}
        />

        {/* Today's meals */}
        {todayMeals.length > 0 && (
          <View className="mt-[22px]">
            <View className="mb-3 px-1 items-center justify-between" style={{ flexDirection: rowDir }}>
              <AppText variant="bold" className="text-[17px] leading-6 text-app-navy">وجبات اليوم</AppText>
              <AppText
                variant="bold"
                className="text-[13px] leading-5 text-app-primaryDark"
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
              <AppText variant="bold" className="text-[15px] leading-[22px] text-app-navy">لم تسجّل وجبات اليوم بعد</AppText>
              <AppText className="text-center text-[13px] leading-5 text-app-textSoft">سجّل أول وجبة وابدأ يومك بشكل صحيح</AppText>
            </View>
          </View>
        )}

        <Pressable
          onPress={() => router.push('/(main)/stats')}
          className="mt-3 rounded-[18px] border border-app-lineSoft bg-app-surface px-4 py-4"
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
        >
          <View className="flex-row items-center gap-3" style={{ flexDirection: rowDir }}>
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-app-surfaceAlt">
              <BarChart2 size={20} color={theme.colors.primary} strokeWidth={2.4} />
            </View>
            <View className="flex-1">
              <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
                إنجازاتي
              </AppText>
              <AppText className="text-[12.5px] leading-5 text-app-textMuted">شاهد تقييماتك وتطورك</AppText>
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
            onPress={() => router.push('/(main)/stats')}
            className="mt-[22px] gap-1 rounded-[18px] border border-app-warning bg-app-warningSoft p-4"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            <View className="items-center gap-1.5" style={{ flexDirection: rowDir }}>
              <Star size={15} color={theme.colors.primary} fill={theme.colors.primary} strokeWidth={0} />
              <AppText variant="bold" className="text-[15px] leading-[22px] text-app-navy">حان وقت تقييم أسبوعك!</AppText>
            </View>
            <AppText className="text-[13px] leading-5 text-app-textSoft">أخبرنا كيف كان أسبوعك الصحي</AppText>
          </Pressable>
        )}

        {/* Badge progress */}
        <View className="mt-[22px]">
          <BadgeProgressCard
            currentDays={streak}
            targetDays={BADGE_TARGET}
            badgeLabel="أسبوع من الالتزام"
          />
        </View>
        </View>
      </ScrollView>

      <AppTabBar active="home" />
    </View>
  );
}
