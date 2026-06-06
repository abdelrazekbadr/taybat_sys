import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, View, TouchableOpacity, Share, Image, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { ChevronLeft, ChevronRight, Frown, Laugh, LayersPlus, Meh, Share2, Smile, Trash2 } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { OutlineButton } from '@/components/common/OutlineButton';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StarRating } from '@/components/common/StarRating';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useRTL } from '@/hooks/useRTL';
import { useMealItemsStore } from '@/stores/mealItems.store';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { HungryState, MealItem, ZoneColor } from '@/types';
import { getZoneMeta } from '@/utils/zoneUtils';

const defaultFoodImage = require('../../assets/images/food/risotto.png');
const defaultDishImage = require('../../assets/images/food/dish.png');

const HUNGRY_OPTIONS: OptionItem<HungryState>[] = [
  { key: 1 as HungryState, label: 'شبعان',     icon: { kind: 'lucide', Icon: Laugh } },
  { key: 2 as HungryState, label: 'عادي',       icon: { kind: 'lucide', Icon: Smile } },
  { key: 3 as HungryState, label: 'جائع',       icon: { kind: 'lucide', Icon: Meh   } },
  { key: 4 as HungryState, label: 'جوع شديد',  icon: { kind: 'lucide', Icon: Frown } },
];

export default function MealDetailScreen() {
  const theme = useTheme();
  const { mealId, userMealId } = useLocalSearchParams<{ mealId: string; userMealId?: string }>();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const { requireAuth } = useAuthGate();
  const sheetEntrance = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height/2;

  const { getMealById, meals, initializeMeals } = useMealsStore();
  const { mealItems, initializeMealItems, getMealItemByCode } = useMealItemsStore();
  const { logMeal, deleteMeal } = useUserMealsStore();
  const [hungryState, setHungryState] = useState<HungryState | null>(null);
  const [hungerRequired, setHungerRequired] = useState(false);

  useEffect(() => {
    if (!meals.length) initializeMeals();
    if (!mealItems.length) initializeMealItems();
  }, [meals.length, mealItems.length, initializeMeals, initializeMealItems]);

  useEffect(() => {
    sheetEntrance.setValue(0);
    Animated.timing(sheetEntrance, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [mealId, sheetEntrance]);

  const meal = mealId ? getMealById(Number(mealId)) : undefined;

  if (!meal) {
    return (
      <View className="flex-1 bg-app-background">
        <View className="h-[280px] bg-app-background" style={{ paddingTop: insets.top + 12 }}>
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
            style={{ elevation: 5, marginLeft: 22 }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            {isRTL ? (
              <ChevronRight size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <AppText variant="bold" className="text-[16px] text-app-textSoft">الوجبة غير موجودة</AppText>
        </View>
      </View>
    );
  }

  const zoneMeta = getZoneMeta(meal.dominant_zone);
  const imageSource = meal.image_url ? { uri: meal.image_url } : defaultFoodImage;
  const itemCodes = meal.meal_item_codes.split(',').filter(Boolean);
  const items: MealItem[] = itemCodes
    .map((code) => getMealItemByCode(code))
    .filter((item): item is MealItem => item !== undefined);

  const handleShare = async () => {
    try {
      await Share.share({ message: `وجبة ${meal.name} من نظام الطيّبات - ${zoneMeta.emoji} منطقة ${zoneMeta.label}` });
    } catch {}
  };

  const handleAddTodayInternal = async () => {
    const ok = await logMeal(meal.id, hungryState);
    if (ok) {
      router.replace('/(main)' as never);
      return;
    }
    const message = useUserMealsStore.getState().errorMessage;
    Alert.alert('تعذّر تسجيل الوجبة', message || 'حاول مرة أخرى');
  };

  const handleAddToday = () => {
    if (!hungryState) {
      setHungerRequired(true);
      return;
    }
    requireAuth(handleAddTodayInternal);
  };

  const canDeleteLog = typeof userMealId === 'string' && userMealId.length > 0;

  const handleDeleteLog = async () => {
    if (!canDeleteLog) return;
    Alert.alert('حذف الوجبة', 'هل تريد حذف هذه الوجبة من سجل اليوم؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteMeal(Number(userMealId));
          if (ok) {
            router.back();
            return;
          }
          const message = useUserMealsStore.getState().errorMessage;
          Alert.alert('تعذّر حذف الوجبة', message || 'حاول مرة أخرى');
        },
      },
    ]);
  };

  const sheetAnimatedStyle = {
    opacity: sheetEntrance,
    transform: [
      {
        translateY: sheetEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      },
    ],
  };

  return (
    <View className="flex-1 bg-app-background">
      <View className="relative h-[280px] bg-app-background">
        <Image source={imageSource} className="absolute inset-0 h-full w-full" resizeMode="contain" />
        <View
          className="absolute left-[22px] right-[22px] flex-row justify-between"
          style={{ top: insets.top + 12, flexDirection: rowDir }}
        >
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
            style={{ elevation: 5 }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            {isRTL ? (
              <ChevronRight size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={24} color={theme.colors.onSurface} strokeWidth={2.5} />
            )}
          </TouchableOpacity>
          <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
            {canDeleteLog ? (
              <TouchableOpacity
                className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
                style={{ elevation: 5 }}
                onPress={handleDeleteLog}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="حذف الوجبة"
              >
                <Trash2 size={20} color={theme.colors.onSurface} strokeWidth={2} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface shadow-lg shadow-black/10"
              style={{ elevation: 5 }}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Share2 size={20} color={theme.colors.onSurface} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Animated.View className="-mt-7 flex-1 rounded-t-[28px] bg-app-surface" style={sheetAnimatedStyle}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View className="px-[22px] pt-4">
            <View className="self-end">
              <StarRating value={zoneMeta.stars} size={18} gap={3} />
            </View>

            <AppText variant="bold" className="mt-2 text-[17px]  text-app-navy">
              {meal.name}
            </AppText>

            {items.length > 0 && (
              <View className="mt-5">
                <AppText variant="bold" className="mb-3 px-1 text-[17px] leading-7 text-app-navy">
                  المكوّنات
                </AppText>
                <View className="gap-2">
                  {items.map((item) => (
                    <IngredientRow key={item.id} item={item} />
                  ))}
                </View>
              </View>
            )}

            {/* ── Hunger state selector ── */}
            <View className="mt-5 rounded-[16px] border border-app-lineSoft bg-app-surfaceAlt p-4">
              <AppText variant="bold" className="mb-3 text-[14px] leading-[22px] text-app-navy">
                كيف  شعورك قبل الوجبة؟
              </AppText>
              <OptionSelector<HungryState>
                options={HUNGRY_OPTIONS}
                mode="single"
                value={hungryState}
                onChange={(val) => { setHungryState(val); setHungerRequired(false); }}
                layout="iconTop"
                variant="soft"
              />
              {hungerRequired && (
                <AppText className="mt-2 text-[12px] leading-[18px] text-red-500">
                  يرجى تحديد شعورك قبل إضافة الوجبة
                </AppText>
              )}
            </View>

            {/* ── Action buttons row ── */}
            <View className="mt-4 flex-row gap-2" style={{ flexDirection: rowDir }}>
              <View style={{ flex: 2 }}>
                <PrimaryButton
                  title="اضف الوجبة"
                  onPress={handleAddToday}
                  className="h-[48px]"
                  leadingIcon={<LayersPlus size={16} color="white" strokeWidth={2.5} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <OutlineButton
                  title="مشاركة"
                  onPress={handleShare}
                  icon={<Share2 size={15} color={theme.colors.onSurface} strokeWidth={2} />}
                  className="h-[48px]"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

function IngredientRow({ item }: { item: MealItem }) {
  const zoneMeta = getZoneMeta(item.zone as ZoneColor);
  const { rowDir } = useRTL();
  const imageSource = item.image_url ? { uri: item.image_url } : defaultDishImage;

  return (
    <View
      className="flex-row items-center gap-3 rounded-[16px] border border-app-lineSoft bg-app-surface p-3"
      style={{ flexDirection: rowDir }}
    >
      <View className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-[14px] border border-app-line bg-app-surfaceAlt">
        <Image source={imageSource} className="h-full w-full" resizeMode="cover" />
      </View>
      <View className="flex-1 gap-0.5" style={{ minWidth: 0 }}>
        <AppText variant="bold" className="text-[14px] leading-6 text-app-navy" numberOfLines={1}>
          {item.name}
        </AppText>
        {item.notes ? (
          <AppText className="text-[11px] leading-[18px] text-app-textSoft" numberOfLines={2}>
            {item.notes}
          </AppText>
        ) : null}
      </View>
      <View className="flex-shrink-0">
        <StarRating value={zoneMeta.stars} size={13} gap={2} />
      </View>
    </View>
  );
}
