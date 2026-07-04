import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { Check, ChevronLeft, ChevronRight, Frown, Laugh, LayersPlus, Meh, Moon, Share2, Smile, Trash2 } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { MealImage } from '@/components/common/MealImage';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { OutlineButton } from '@/components/common/OutlineButton';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StarRating } from '@/components/common/StarRating';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useRTL } from '@/hooks/useRTL';
import { buildFastingTopic, buildMealTopic, shareContent } from '@/services/sharing';
import { useMealItemsStore } from '@/stores/mealItems.store';
import { useMealsStore } from '@/stores/meals.store';
import { useMembershipStore } from '@/stores/membership.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import type { HungryState, MealItem } from '@/types';
import { FASTING_MEAL_CODE } from '@/utils/constants';
import { daysOnPlan } from '@/utils/statsUtils';

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

  const { getMealById, meals, initializeMeals, getMealImageUri } = useMealsStore();
  const { mealItems, initializeMealItems, getMealItemByCode } = useMealItemsStore();
  const { logMeal, deleteMeal, todayMeals } = useUserMealsStore();
  const { user } = useUserStore();
  const dayNo = daysOnPlan(user?.plan_start_date);
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

  const imageUri = getMealImageUri(meal);
  const isFasting = meal.code === FASTING_MEAL_CODE;
  const canDeleteLog = typeof userMealId === 'string' && userMealId.length > 0;
  // Only relevant when browsing/picking a meal to log — not when viewing an
  // already-logged entry (that flow shows the delete button instead).
  const alreadyFastedToday = isFasting && !canDeleteLog && todayMeals.some((m) => m.meal_id === meal.id);
  const itemCodes = meal.meal_item_codes.split(',').filter(Boolean);
  const items: MealItem[] = itemCodes
    .map((code) => getMealItemByCode(code))
    .filter((item): item is MealItem => item !== undefined);

  const handleShare = async () => {
    try {
      const topic = isFasting ? buildFastingTopic() : buildMealTopic(meal.name);
      const { shared } = await shareContent(topic, dayNo);
      // Only award points when the user actually shared (not when they cancelled).
      // On Android result.action is always sharedAction; on iOS it reflects real intent.
      if (shared) {
        void useMembershipStore.getState().recordEvent('supporter', 'share_meal', undefined, 'meal', meal.id);
      }
    } catch {}
  };

  const handleAddTodayInternal = async () => {
    // Fasting has no "hunger state before the meal" — there's no meal.
    const ok = await logMeal(meal.id, isFasting ? null : hungryState);
    if (ok) {
      router.replace('/(main)' as never);
      return;
    }
    const message = useUserMealsStore.getState().errorMessage;
    Alert.alert(isFasting ? 'تعذّر تسجيل الصيام' : 'تعذّر تسجيل الوجبة', message || 'حاول مرة أخرى');
  };

  const handleAddToday = () => {
    if (alreadyFastedToday) return;
    if (!isFasting && !hungryState) {
      setHungerRequired(true);
      return;
    }
    requireAuth(handleAddTodayInternal);
  };

  const handleDeleteLog = async () => {
    if (!canDeleteLog) return;
    Alert.alert(
      isFasting ? 'حذف الصيام' : 'حذف الوجبة',
      isFasting ? 'هل تريد حذف يوم الصيام هذا من سجل اليوم؟' : 'هل تريد حذف هذه الوجبة من سجل اليوم؟',
      [
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
            Alert.alert(isFasting ? 'تعذّر حذف الصيام' : 'تعذّر حذف الوجبة', message || 'حاول مرة أخرى');
          },
        },
      ],
    );
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
        <MealImage uri={imageUri} defaultSource={defaultFoodImage} className="absolute inset-0 h-full w-full" resizeMode="contain" />
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
                accessibilityLabel={isFasting ? 'حذف الصيام' : 'حذف الوجبة'}
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

      <Animated.View className="-mt-[50px] flex-1 rounded-t-[28px] bg-app-surface" style={sheetAnimatedStyle}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View className="px-[22px] pt-4">
            <View className="self-end">
              <StarRating value={meal.rating} size={18} gap={3} />
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

            {/* ── Hunger state selector — not applicable to fasting (no meal eaten) ── */}
            {!isFasting && (
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
            )}

            {/* ── Action buttons row ── */}
            <View className="mt-4 flex-row gap-2" style={{ flexDirection: rowDir }}>
              <View style={{ flex: 2 }}>
                <PrimaryButton
                  title={alreadyFastedToday ? 'تم تسجيل الصيام اليوم' : isFasting ? 'سجّل صيامك اليوم' : 'اضف الوجبة'}
                  onPress={handleAddToday}
                  disabled={alreadyFastedToday}
                  className="h-[48px]"
                  leadingIcon={
                    alreadyFastedToday ? (
                      <Check size={16} color="white" strokeWidth={2.5} />
                    ) : isFasting ? (
                      <Moon size={16} color="white" strokeWidth={2.5} />
                    ) : (
                      <LayersPlus size={16} color="white" strokeWidth={2.5} />
                    )
                  }
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
  const { rowDir } = useRTL();

  return (
    <View
      className="flex-row items-center gap-3 rounded-[16px] border border-app-lineSoft bg-app-surface p-3"
      style={{ flexDirection: rowDir }}
    >
      <View className="h-11 w-11 flex-shrink-0 overflow-hidden rounded-[14px] border border-app-line bg-app-surfaceAlt">
        <MealImage uri={item.image_url || null} defaultSource={defaultDishImage} className="h-full w-full" resizeMode="cover" />
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
        <StarRating value={item.rating} size={13} gap={2} />
      </View>
    </View>
  );
}
