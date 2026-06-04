import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { ChevronLeft, ChevronRight, LayersPlus } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { GradientTabs } from '@/components/common/GradientTabs';
import { StarRating } from '@/components/common/StarRating';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useRTL } from '@/hooks/useRTL';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { Meal } from '@/types';
import { getZoneMeta, toArabicNumerals } from '@/utils/zoneUtils';

// RTL-first order: with auto-flip, first item lands on the RIGHT.
// فطار should be on the right in Arabic → put it first.
const TABS = [
  { key: 'breakfast', label: 'فطار' },
  { key: 'lunch', label: 'غداء' },
  { key: 'dinner', label: 'عشاء' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const TAB_TYPE_NUM: Record<TabKey, string> = {
  breakfast: '1',
  lunch: '2',
  dinner: '3',
};

const defaultFoodImage = require('../../assets/images/food/risotto.png');

export default function SelectMealScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { initialTab, replaceUserMealId } = useLocalSearchParams<{
    initialTab?: string;
    replaceUserMealId?: string;
  }>();
  const { meals, initializeMeals, isLoading } = useMealsStore();
  const { userMeals, initializeUserMeals } = useUserMealsStore();
  const initialTabValue = Array.isArray(initialTab) ? initialTab[0] : initialTab;
  const resolvedInitialTab: TabKey =
    initialTabValue === 'lunch' ? 'lunch' : initialTabValue === 'dinner' ? 'dinner' : 'breakfast';
  const [activeTab, setActiveTab] = useState<TabKey>(resolvedInitialTab);
  const { isRTL, rowDir } = useRTL();

  useEffect(() => {
    if (!meals.length) initializeMeals();
  }, [meals.length, initializeMeals]);

  useEffect(() => {
    if (!userMeals.length) initializeUserMeals();
  }, [initializeUserMeals, userMeals.length]);

  const activeTypeNum = TAB_TYPE_NUM[activeTab];
  const filteredMeals: Meal[] = meals.filter((m) =>
    m.meal_type_ids.split(',').map((s) => s.trim()).includes(activeTypeNum)
  );

  const lastWeekCountsByMealId = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const counts: Record<number, number> = {};
    for (const log of userMeals) {
      const logDate = log.date ? new Date(`${log.date}T00:00:00.000Z`) : new Date(log.datetime);
      if (Number.isNaN(logDate.getTime())) continue;
      if (logDate < start || logDate > end) continue;
      counts[log.meal_id] = (counts[log.meal_id] ?? 0) + 1;
    }
    return counts;
  }, [userMeals]);

  const isReplaceFlow = typeof replaceUserMealId === 'string' && replaceUserMealId.length > 0;
  const headerTitle = isReplaceFlow ? 'قم بتبديل وجبتك' : 'اختر وجبتك';

  return (
    <View className="flex-1 bg-app-background">
      {/* header */}
      <View className="flex-row items-center justify-between px-[20px] pb-2" style={{ paddingTop: insets.top + 12, flexDirection: rowDir }}>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full border border-app-line bg-app-surface"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          {isRTL ? (
            <ChevronRight size={22} color={theme.colors.onSurface} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={22} color={theme.colors.onSurface} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
        <View className="items-center gap-0.5">
          <AppText variant="bold" className="text-center text-[17px]  text-app-navy">{headerTitle}</AppText>
        </View>
        <View className="w-10" />
      </View>

      {/* tabs */}
      <View className="px-[22px] py-3">
        <View
          className="self-center"
          style={{ width: '100%', maxWidth: 380 }}
        >
          <GradientTabs options={TABS} value={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      {/* list */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-[22px] pb-6">
            <AppText className="mb-2 text-[12px] leading-[18px] text-app-textSoft">
              {toArabicNumerals(filteredMeals.length)} اقتراحات مناسبة لمرحلتك الحالية
            </AppText>
            <View className="gap-2.5">
              {filteredMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  lastWeekCount={lastWeekCountsByMealId[meal.id] ?? 0}
                  replaceUserMealId={Array.isArray(replaceUserMealId) ? replaceUserMealId[0] : replaceUserMealId}
                  onPress={() =>
                    router.push({ pathname: '/(main)/meal-detail', params: { mealId: String(meal.id) } })
                  }
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      <AppTabBar active="home" />
    </View>
  );
}

function MealCard({
  meal,
  lastWeekCount,
  replaceUserMealId,
  onPress,
}: {
  meal: Meal;
  lastWeekCount: number;
  replaceUserMealId?: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const zoneMeta = getZoneMeta(meal.dominant_zone);
  const { rowDir } = useRTL();
  const { requireAuth } = useAuthGate();
  const logMeal = useUserMealsStore((s) => s.logMeal);
  const replaceMeal = useUserMealsStore((s) => s.replaceMeal);
  const [isAdding, setIsAdding] = useState(false);
  const imageSource = meal.image_url ? { uri: meal.image_url } : defaultFoodImage;
  const ingredientsCount =
    typeof meal.meal_item_codes === 'string' && meal.meal_item_codes.trim().length > 0
      ? meal.meal_item_codes.split(',').filter(Boolean).length
      : 0;

  const handleAddInternal = async () => {
    if (isAdding) return;
    setIsAdding(true);
    const replaceId = replaceUserMealId ? Number(replaceUserMealId) : Number.NaN;
    const ok = Number.isFinite(replaceId) ? await replaceMeal(replaceId, meal.id) : await logMeal(meal.id);
    if (ok) {
      router.replace('/(main)' as never);
      return;
    }
    setIsAdding(false);
    const message = useUserMealsStore.getState().errorMessage;
    Alert.alert(replaceUserMealId ? 'تعذّر استبدال الوجبة' : 'تعذّر تسجيل الوجبة', message || 'حاول مرة أخرى');
  };

  const handleAdd = () => requireAuth(handleAddInternal);

  return (
    <TouchableOpacity
      className="relative flex-row items-center gap-3.5 rounded-[18px] border border-app-lineSoft bg-app-surface p-3.5 shadow-sm shadow-black/10"
      style={{ flexDirection: rowDir }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="h-[54px] w-[54px] flex-shrink-0 overflow-hidden rounded-[16px] border border-app-line bg-app-surfaceAlt">
        <Image source={imageSource} className="h-full w-full" resizeMode="cover" />
      </View>

      <View className="flex-1 gap-0.5" style={{ minWidth: 0 }}>
        <AppText variant="bold" className="text-[12px] leading-5 text-app-navy" numberOfLines={1}>
          {meal.name}
        </AppText>

        <View className="flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
          <AppText variant="bold" className="text-[10.5px] leading-5 text-app-textSoft">
            تناولت آخر أسبوع: {toArabicNumerals(lastWeekCount)} {lastWeekCount === 1 ? 'مرة' : 'مرات'}
          </AppText>
          <View className="h-[3px] w-[3px] rounded-full bg-app-muted2" />
          <AppText className="text-[10.5px] leading-5 text-app-textSoft">
            {ingredientsCount} مكوّنات
          </AppText>
        </View>

        <View className="flex-row items-center" style={{ flexDirection: rowDir, justifyContent: 'flex-start' }}>
          <StarRating value={zoneMeta.stars} size={13} gap={2} />
        </View>
      </View>

      <TouchableOpacity
        className="h-[38px] w-[38px] flex-shrink-0 overflow-hidden rounded-full shadow-sm shadow-black/10"
        onPress={handleAdd}
        activeOpacity={0.85}
        disabled={isAdding}
      >
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          {isAdding ? (
            <ActivityIndicator color="white" />
          ) : (
            <LayersPlus size={20} color="white" strokeWidth={2.5} />
          )}
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
