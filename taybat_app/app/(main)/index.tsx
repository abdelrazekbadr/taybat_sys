import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';

import { Star, Utensils } from 'lucide-react-native';

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
  const { user, initializeUser } = useUserStore();
  const { userMeals, todayMeals, initializeUserMeals } = useUserMealsStore();
  const { meals, initializeMeals, getMealById } = useMealsStore();
  const { pendingRating, initializeRatings, checkPendingRating } = useWeeklyRatingStore();
  const { rowDir } = useRTL();

  useEffect(() => {
    initializeUser();
    initializeUserMeals();
    initializeMeals();
    initializeRatings();
  }, [initializeUser, initializeUserMeals, initializeMeals, initializeRatings]);

  useEffect(() => {
    if (userMeals.length) checkPendingRating();
  }, [userMeals, checkPendingRating]);

  if (!user || !meals.length) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#10B981" size="large" />
      </View>
    );
  }

  const dayNumber = daysOnPlan(user.plan_start_date);
  const streak = currentStreak(userMeals);
  const BADGE_TARGET = 7;

  return (
    <View style={styles.screen}>
      <HomeHeader
        name={user.name}
        subscriberId={user.subscriber_id}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CommitmentCard
          dayNumber={dayNumber}
          streakDays={streak}
          onAddMeal={() => router.push('/(main)/select-meal')}
        />

        {/* Today's meals */}
        {todayMeals.length > 0 && (
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { flexDirection: rowDir }]}>
              <AppText variant="bold" style={styles.sectionTitle}>وجبات اليوم</AppText>
              <AppText
                variant="bold"
                style={styles.sectionLink}
                onPress={() => router.push('/(main)/select-meal')}
              >
                سجّل وجبة
              </AppText>
            </View>
            <View style={styles.mealList}>
              {todayMeals.map((um) => {
                const meal = getMealById(um.meal_id);
                return (
                  <TodayMealRow
                    key={um.id}
                    userMeal={um}
                    mealName={meal?.name ?? 'وجبة'}
                    onPress={() =>
                      router.push({ pathname: '/(main)/meal-detail', params: { mealId: String(um.meal_id) } })
                    }
                  />
                );
              })}
            </View>
          </View>
        )}

        {todayMeals.length === 0 && (
          <View style={styles.section}>
            <View style={styles.emptyMeals}>
              <Utensils size={40} color="#94A3B8" strokeWidth={1.5} />
              <AppText variant="bold" style={styles.emptyTitle}>لم تسجّل وجبات اليوم بعد</AppText>
              <AppText style={styles.emptySubtitle}>سجّل أول وجبة وابدأ يومك بشكل صحيح</AppText>
            </View>
          </View>
        )}

        {/* Weekly rating banner */}
        {pendingRating && (
          <View style={styles.ratingBanner}>
            <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 6 }}>
              <Star size={15} color="#F5C24A" fill="#F5C24A" strokeWidth={0} />
              <AppText variant="bold" style={styles.ratingTitle}>حان وقت تقييم أسبوعك!</AppText>
            </View>
            <AppText style={styles.ratingSubtitle}>أخبرنا كيف كانت أسبوعك الصحي</AppText>
          </View>
        )}

        {/* Badge progress */}
        <View style={styles.section}>
          <BadgeProgressCard
            currentDays={streak}
            targetDays={BADGE_TARGET}
            badgeLabel="أسبوع من الالتزام"
          />
        </View>
      </ScrollView>

      <AppTabBar active="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loading: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 0,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#0F2A36',
    lineHeight: 24,
  },
  sectionLink: {
    fontSize: 13,
    color: '#059669',
    lineHeight: 20,
  },
  mealList: {
    gap: 10,
  },
  emptyMeals: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  emptyTitle: {
    fontSize: 15,
    color: '#0F2A36',
    lineHeight: 22,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  ratingBanner: {
    marginTop: 22,
    backgroundColor: '#FFF4D6',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5C24A',
    gap: 4,
  },
  ratingTitle: {
    fontSize: 15,
    color: '#0F2A36',
    lineHeight: 22,
  },
  ratingSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
  },
});
