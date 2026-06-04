import React from 'react';
import { View, TouchableOpacity, Image, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from 'react-native-paper';

import { ArrowLeftRight, Trash2 } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import type { UserMeal } from '@/types';
import { formatArabicTime } from '@/utils/statsUtils';
import { getZoneMeta } from '@/utils/zoneUtils';

const defaultFoodImage = require('../../assets/images/food/risotto.png');

interface TodayMealRowProps {
  userMeal: UserMeal;
  mealName: string;
  imageUrl?: string;
  onPress: () => void;
  onReplacePress?: () => void;
  onDeletePress?: () => void;
}

const MEAL_SLOT_LABELS = ['الإفطار', 'الغداء', 'العشاء'];

export function TodayMealRow({
  userMeal,
  mealName,
  imageUrl,
  onPress,
  onReplacePress,
  onDeletePress,
}: TodayMealRowProps) {
  const theme = useTheme();
  const zoneMeta = getZoneMeta(userMeal.zone_summary);
  const { rowDir } = useRTL();
  const slotIndex = userMeal.id % 3;
  const slotLabel = MEAL_SLOT_LABELS[slotIndex] ?? 'وجبة';
  const timeLabel = formatArabicTime(userMeal.datetime);
  const imageSource = imageUrl ? { uri: imageUrl } : defaultFoodImage;

  const renderDeleteAction = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!onDeletePress) return null;
    const scale = dragX.interpolate({
      inputRange: [-110, -50],
      outputRange: [1, 0.92],
      extrapolate: 'clamp',
    });
    return (
      <View className="h-full w-[112px] px-2 py-2">
        <Animated.View style={{ flex: 1, transform: [{ scale }] }}>
          <TouchableOpacity
            className="h-full w-full items-center justify-center rounded-[18px]"
            style={{ backgroundColor: theme.colors.error }}
            onPress={onDeletePress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="حذف الوجبة"
          >
            <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
              <Trash2 size={22} color={theme.colors.surface} strokeWidth={3} />
              <AppText variant="bold" className="text-[12px]" style={{ color: theme.colors.surface }}>
                حذف
              </AppText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      enabled={!!onDeletePress}
      renderRightActions={renderDeleteAction}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      overshootLeft={false}
      overshootRight={false}
      containerStyle={{ borderRadius: 18 }}
    >
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
          <AppText variant="bold" className="text-[13px] leading-5 text-app-navy" numberOfLines={1}>
            {mealName}
          </AppText>

          <View className="flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
            <AppText variant="bold" className="text-[10.5px] leading-5 text-app-textSoft">
              {slotLabel}
            </AppText>
            <View className="h-[3px] w-[3px] rounded-full bg-app-muted2" />
            <AppText className="text-[10.5px] leading-5 text-app-textSoft">{timeLabel}</AppText>
          </View>

          <View className="flex-row items-center" style={{ flexDirection: rowDir, justifyContent: 'flex-start' }}>
            <StarRating value={zoneMeta.stars} size={13} gap={2} />
          </View>
        </View>

        <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
          {onReplacePress ? (
            <TouchableOpacity
              className="h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border border-app-lineSoft bg-app-surfaceAlt"
              onPress={onReplacePress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="استبدال الوجبة"
            >
              <ArrowLeftRight size={18} color={theme.colors.onSurface} strokeWidth={2.5} />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
