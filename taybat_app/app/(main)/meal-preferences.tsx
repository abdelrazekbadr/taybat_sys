import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react-native';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { MealSpinner } from '@/components/common/MealSpinner';
import { GradientTabs } from '@/components/common/GradientTabs';
import { StarRating } from '@/components/common/StarRating';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useRTL } from '@/hooks/useRTL';
import { useMealPreferencesStore } from '@/stores/mealPreferences.store';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import type { Meal } from '@/types';
import { getZoneMeta, toArabicNumerals } from '@/utils/zoneUtils';

const defaultFoodImage = require('../../assets/images/food/risotto.png');

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <AppText variant="bold" className="mb-2 px-1 text-[13px] leading-5 text-app-textMuted">
        {title}
      </AppText>
      <View className="gap-2">{children}</View>
    </View>
  );
}

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

function MealCard(props: {
  meal: Meal;
  favorite: boolean;
  lastWeekCount: number;
  disabled?: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const zoneMeta = getZoneMeta(props.meal.dominant_zone);
  const imageSource = props.meal.image_url ? { uri: props.meal.image_url } : defaultFoodImage;
  const ingredientsCount =
    typeof props.meal.meal_item_codes === 'string' && props.meal.meal_item_codes.trim().length > 0
      ? props.meal.meal_item_codes.split(',').filter(Boolean).length
      : 0;

  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      className="rounded-[18px] border border-app-lineSoft bg-app-surface p-3.5 shadow-sm shadow-black/10"
      style={({ pressed }) => [{ opacity: props.disabled ? 0.5 : pressed ? 0.9 : 1 }]}
    >
      <View className="items-center gap-3" style={{ flexDirection: rowDir, justifyContent: 'flex-start' }}>
        <View className="h-[54px] w-[54px] flex-shrink-0 overflow-hidden rounded-[16px] border border-app-line bg-app-surfaceAlt">
          <Image source={imageSource} className="h-full w-full" resizeMode="cover" />
        </View>

        <View className="flex-1" style={{ minWidth: 0 }}>
          <AppText variant="bold" className="text-[12px] leading-5 text-app-navy" numberOfLines={1}>
            {props.meal.name}
          </AppText>

          <View className="mt-0.5 flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
            <AppText variant="bold" className="text-[10.5px] leading-4 text-app-textSoft">
              تناولت آخر أسبوع: {toArabicNumerals(props.lastWeekCount)} {props.lastWeekCount === 1 ? 'مرة' : 'مرات'}
            </AppText>
            <View className="h-[3px] w-[3px] rounded-full bg-app-muted2" />
            <AppText className="text-[10.5px] leading-4 text-app-textSoft">
              {toArabicNumerals(ingredientsCount)} مكوّنات
            </AppText>
          </View>

          <View className="mt-1 flex-row items-center" style={{ flexDirection: rowDir }}>
            <StarRating value={zoneMeta.stars} size={13} gap={2} />
          </View>
        </View>

        <Pressable
          onPress={props.onToggleFavorite}
          disabled={props.disabled}
          className="h-[38px] w-[38px] flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-app-surfaceAlt"
          style={({ pressed }) => [{ opacity: props.disabled ? 0.5 : pressed ? 0.9 : 1 }]}
        >
          <Heart
            size={20}
            color={props.favorite ? theme.colors.primary : theme.colors.onSurfaceVariant}
            fill={props.favorite ? theme.colors.primary : 'transparent'}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function MealPreferencesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();
  const { requireAuth } = useAuthGate();

  const { user } = useUserStore();
  const { meals, initializeMeals } = useMealsStore();
  const { userMeals, initializeUserMeals } = useUserMealsStore();
  const { favoriteMealIds, isLoading, errorMessage, initializePreferences, toggleFavorite } = useMealPreferencesStore();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('breakfast');

  useEffect(() => {
    if (!meals.length) initializeMeals();
  }, [initializeMeals, meals.length]);

  useEffect(() => {
    if (!userMeals.length) initializeUserMeals();
  }, [initializeUserMeals, userMeals.length]);

  useEffect(() => {
    initializePreferences();
  }, [initializePreferences]);

  const favoriteSet = useMemo(() => new Set(favoriteMealIds), [favoriteMealIds]);
  const isFavorite = useCallback((mealId: number) => favoriteSet.has(mealId), [favoriteSet]);

  const activeTypeNum = TAB_TYPE_NUM[activeTab];

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

  const visibleMeals: Meal[] = useMemo(() => {
    const base = meals.filter((m) => m.meal_type_ids.split(',').map((s) => s.trim()).includes(activeTypeNum));
    const q = query.trim();
    const searched = q ? base.filter((m) => m.name.includes(q)) : base;
    return [...searched].sort((a, b) => {
      const aFav = favoriteSet.has(a.id);
      const bFav = favoriteSet.has(b.id);
      if (aFav !== bFav) return aFav ? -1 : 1;
      const aCount = lastWeekCountsByMealId[a.id] ?? 0;
      const bCount = lastWeekCountsByMealId[b.id] ?? 0;
      if (aCount !== bCount) return bCount - aCount;
      return a.name.localeCompare(b.name);
    });
  }, [activeTypeNum, favoriteSet, lastWeekCountsByMealId, meals, query]);

  if (!user || !meals.length) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <MealSpinner />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-app-background">
      <View
        className="flex-row items-center justify-between px-[20px] pb-2"
        style={{ paddingTop: insets.top + 12, flexDirection: rowDir }}
      >
        <Pressable
          className="h-10 w-10 items-center justify-center rounded-full border border-app-line bg-app-surface"
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
        >
          {isRTL ? (
            <ChevronRight size={22} color={theme.colors.onSurface} strokeWidth={2.5} />
          ) : (
            <ChevronLeft size={22} color={theme.colors.onSurface} strokeWidth={2.5} />
          )}
        </Pressable>
        <AppText variant="bold" className="text-center text-[17px] leading-6 text-app-navy">
          وجباتي المفضلة
        </AppText>
        <View className="w-10" />
      </View>

      <View className="px-[22px] py-3">
        <View className="self-center" style={{ width: '100%', maxWidth: 380 }}>
          <GradientTabs options={TABS} value={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-[22px] pb-10">
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="بحث في الوجبات..."
            className="mt-2 rounded-[16px] border border-app-lineSoft bg-app-surface px-4 py-3 text-[14px] text-app-text"
          />

          <AppText className="mt-3 text-[12px] leading-[18px] text-app-textSoft">
            {toArabicNumerals(visibleMeals.length)} وجبة
          </AppText>

          <Section title="الوجبات">
            {visibleMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                favorite={isFavorite(meal.id)}
                lastWeekCount={lastWeekCountsByMealId[meal.id] ?? 0}
                disabled={isLoading}
                onPress={() => router.push({ pathname: '/(main)/meal-detail', params: { mealId: String(meal.id) } })}
                onToggleFavorite={() => requireAuth(() => toggleFavorite(meal.id))}
              />
            ))}
            {!visibleMeals.length && (
              <View className="rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
                <AppText className="text-[13px] leading-5 text-app-textMuted">
                  لا توجد وجبات مطابقة لهذا التصفية.
                </AppText>
              </View>
            )}
          </Section>

          {!!errorMessage && (
            <View className="mt-3 rounded-[14px] border border-app-lineSoft bg-app-surface p-3">
              <AppText className="text-[12.5px] leading-5" style={{ color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
