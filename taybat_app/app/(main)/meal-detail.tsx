import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, View, TouchableOpacity, Share, Image, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { ChevronLeft, ChevronRight, Share2, Trash2 } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import { useMealItemsStore } from '@/stores/mealItems.store';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { MealItem, ZoneColor } from '@/types';
import { getZoneMeta } from '@/utils/zoneUtils';

const defaultFoodImage = require('../../assets/images/food/risotto.png');
const defaultDishImage = require('../../assets/images/food/dish.png');

export default function MealDetailScreen() {
  const theme = useTheme();
  const { mealId, userMealId } = useLocalSearchParams<{ mealId: string; userMealId?: string }>();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const sheetEntrance = useRef(new Animated.Value(0)).current;
  const screenHeight = Dimensions.get('window').height/2;

  const { getMealById, meals, initializeMeals } = useMealsStore();
  const { mealItems, initializeMealItems, getMealItemByCode } = useMealItemsStore();
  const { logMeal, deleteMeal } = useUserMealsStore();

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

  const handleAddToday = async () => {
    await logMeal(meal.id);
    router.back();
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

            <AppText variant="bold" className="mt-2 text-[24px] leading-[34px] text-app-navy">
              {meal.name}
            </AppText>

            {items.length > 0 && (
              <View className="mt-5">
                <AppText variant="bold" className="mb-3 px-1 text-[17px] leading-6 text-app-navy">
                  المكوّنات
                </AppText>
                <View className="gap-2">
                  {items.map((item) => (
                    <IngredientRow key={item.id} item={item} />
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              className="mt-[22px] h-[54px] items-center justify-center rounded-[14px] border-2 border-app-primary bg-app-surface shadow-sm shadow-black/10"
              style={{ flexDirection: rowDir, gap: 10, elevation: 3 }}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <View className="h-[34px] w-[34px] items-center justify-center rounded-full border border-app-line bg-app-surfaceAlt">
                <Share2 size={18} color={theme.colors.onSurface} strokeWidth={2} />
              </View>
              <AppText variant="bold" className="text-[14.5px] leading-5 text-app-navy">
                شارك الوجبة على السوشيال ميديا
              </AppText>
            </TouchableOpacity>

            <View className="mt-3 flex-row justify-center gap-3" style={{ flexDirection: rowDir }}>
              <MaterialCommunityIcons name="facebook" size={16} color={theme.colors.onSurface} />
              <MaterialCommunityIcons name="twitter" size={16} color={theme.colors.onSurface} />
              <MaterialCommunityIcons name="whatsapp" size={16} color={theme.colors.onSurface} />
            </View>

            <TouchableOpacity className="mt-3" onPress={handleAddToday} activeOpacity={0.9}>
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                style={{ height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <AppText variant="bold" className="text-[15px] leading-5 text-white">
                  أضف إلى وجبات اليوم
                </AppText>
              </LinearGradient>
            </TouchableOpacity>
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
        <AppText variant="bold" className="text-[14px] leading-5 text-app-navy" numberOfLines={1}>
          {item.name}
        </AppText>
        {item.notes ? (
          <AppText className="text-[11.5px] leading-4 text-app-textSoft" numberOfLines={2}>
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
