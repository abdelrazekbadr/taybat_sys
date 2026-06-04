import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, ArrowRight, CalendarDays, Utensils } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { GradientTabs, type TabOption } from '@/components/common/GradientTabs';
import { TodayMealRow } from '@/components/home/TodayMealRow';
import { useRTL } from '@/hooks/useRTL';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { UserMeal } from '@/types';
import { toArabicNumerals } from '@/utils/zoneUtils';

const AR_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatFullDateAr(iso: string): string {
  const d = new Date(iso);
  return `${AR_DAYS[d.getDay()]}، ${toArabicNumerals(d.getDate())} ${AR_MONTHS[d.getMonth()]}`;
}

type PeriodKey = '7' | '30' | '60';

const PERIOD_TABS: readonly TabOption<PeriodKey>[] = [
  { key: '7',  label: 'آخر ٧ أيام' },
  { key: '30', label: 'آخر ٣٠ يوماً' },
  { key: '60', label: 'آخر ٦٠ يوماً' },
] as const;

function groupByDate(meals: UserMeal[], periodDays: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - periodDays + 1);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const filtered = meals.filter((m) => m.date >= cutoffISO);

  const map = new Map<string, UserMeal[]>();
  for (const meal of filtered) {
    const list = map.get(meal.date) ?? [];
    map.set(meal.date, [...list, meal]);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([date, dayMeals]) => ({ date, meals: dayMeals }));
}

export default function MealHistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const [period, setPeriod] = useState<PeriodKey>('7');

  const { userMeals } = useUserMealsStore();
  const { getMealById } = useMealsStore();

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd   = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };

  const groupedDays = useMemo(
    () => groupByDate(userMeals, parseInt(period)),
    [userMeals, period],
  );

  const totalMeals = groupedDays.reduce((sum, { meals }) => sum + meals.length, 0);

  return (
    <View className="flex-1 bg-app-background">
      {/* ── Hero ── */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={gradStart}
        end={gradEnd}
        style={{ paddingTop: insets.top + 8, paddingBottom: 44, paddingHorizontal: 20 }}
      >
        <View className="mb-4" style={{ flexDirection: rowDir, alignItems: 'center' }}>
          <Pressable
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full"
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, backgroundColor: 'rgba(255,255,255,0.2)' }]}
          >
            <BackIcon size={20} color="white" strokeWidth={2.2} />
          </Pressable>
        </View>

        <AppText variant="bold" className="text-[22px] leading-8 text-white">
          سجل الوجبات
        </AppText>
        <AppText className="mt-1 text-[13px] leading-5 text-white/75">
          {toArabicNumerals(totalMeals)} وجبة مسجلة في هذه الفترة
        </AppText>
      </LinearGradient>

      {/* ── Card panel ── */}
      <View className="flex-1 -mt-7 overflow-hidden rounded-t-[28px] bg-app-surface">
        {/* Period tabs */}
        <View className="px-5 pb-3 pt-5">
          <GradientTabs options={PERIOD_TABS} value={period} onChange={setPeriod} />
        </View>

        {/* Grouped list */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 32 }}
        >
          {groupedDays.length === 0 ? (
            <View className="mt-16 items-center gap-3">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-app-surfaceAlt">
                <Utensils size={32} color={theme.colors.outline} strokeWidth={1.5} />
              </View>
              <AppText variant="bold" className="text-[15px] leading-6 text-app-navy">
                لا توجد وجبات مسجلة
              </AppText>
              <AppText className="text-center text-[13px] leading-5 text-app-textSoft">
                لم تسجّل أي وجبات في هذه الفترة
              </AppText>
            </View>
          ) : (
            groupedDays.map(({ date, meals: dayMeals }) => (
              <View key={date} className="mt-5">
                {/* Day header */}
                <View
                  className="mb-2.5 items-center justify-between"
                  style={{ flexDirection: rowDir }}
                >
                  <View className="items-center gap-2" style={{ flexDirection: rowDir }}>
                    <CalendarDays size={13} color={theme.colors.primary} strokeWidth={2} />
                    <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                      {formatFullDateAr(date)}
                    </AppText>
                  </View>
                  <View
                    className="rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                  >
                    <AppText
                      variant="semibold"
                      className="text-[11px] leading-5"
                      style={{ color: theme.colors.primary }}
                    >
                      {toArabicNumerals(dayMeals.length)} {dayMeals.length === 1 ? 'وجبة' : 'وجبات'}
                    </AppText>
                  </View>
                </View>

                {/* Meal rows */}
                <View className="gap-2.5">
                  {dayMeals.map((userMeal) => {
                    const meal = getMealById(userMeal.meal_id);
                    return (
                      <TodayMealRow
                        key={userMeal.id}
                        userMeal={userMeal}
                        mealName={meal?.name ?? 'وجبة'}
                        imageUrl={meal?.image_url}
                        onPress={() =>
                          router.push({
                            pathname: '/(main)/meal-detail',
                            params: {
                              mealId: String(userMeal.meal_id),
                              userMealId: String(userMeal.id),
                            },
                          })
                        }
                      />
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}
