import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Moon, Sunrise, Sun, Utensils, type LucideIcon } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import type { UserMeal } from '@/types';
import { formatArabicTime } from '@/utils/statsUtils';
import { getZoneMeta } from '@/utils/zoneUtils';

interface TodayMealRowProps {
  userMeal: UserMeal;
  mealName: string;
  onPress: () => void;
}

const MEAL_SLOT_ICONS: LucideIcon[] = [Sunrise, Sun, Moon];
const MEAL_SLOT_LABELS = ['الإفطار', 'الغداء', 'العشاء'];

export function TodayMealRow({ userMeal, mealName, onPress }: TodayMealRowProps) {
  const zoneMeta = getZoneMeta(userMeal.zone_summary);
  const { rowDir } = useRTL();
  const slotIndex = userMeal.id % 3;
  const SlotIcon = MEAL_SLOT_ICONS[slotIndex] ?? Utensils;
  const slotLabel = MEAL_SLOT_LABELS[slotIndex] ?? 'وجبة';
  const timeLabel = formatArabicTime(userMeal.datetime);

  return (
    <TouchableOpacity style={[styles.row, { flexDirection: rowDir }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, { backgroundColor: zoneMeta.softBg }]}>
        <SlotIcon size={22} color={zoneMeta.color} strokeWidth={2} />
      </View>

      <View style={styles.body}>
        <View style={[styles.metaRow, { flexDirection: rowDir }]}>
          <AppText variant="bold" style={styles.slotLabel}>{slotLabel}</AppText>
          <View style={styles.dot} />
          <AppText style={styles.timeLabel}>{timeLabel}</AppText>
        </View>
        <AppText variant="bold" style={styles.mealName} numberOfLines={1}>{mealName}</AppText>
        <StarRating value={zoneMeta.stars} size={13} gap={2} />
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  slotLabel: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 16,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#94A3B8',
  },
  timeLabel: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 16,
  },
  mealName: {
    fontSize: 14,
    color: '#0F2A36',
    lineHeight: 20,
  },
});
