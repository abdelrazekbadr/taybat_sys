import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import { useMealItemsStore } from '@/stores/mealItems.store';
import { useMealsStore } from '@/stores/meals.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { MealItem, ZoneColor } from '@/types';
import { getZoneMeta, toArabicNumerals } from '@/utils/zoneUtils';

export default function MealDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();

  const { getMealById, meals, initializeMeals } = useMealsStore();
  const { mealItems, initializeMealItems, getMealItemById } = useMealItemsStore();
  const { logMeal } = useUserMealsStore();

  useEffect(() => {
    if (!meals.length) initializeMeals();
    if (!mealItems.length) initializeMealItems();
  }, [meals.length, mealItems.length, initializeMeals, initializeMealItems]);

  const meal = mealId ? getMealById(Number(mealId)) : undefined;

  if (!meal) {
    return (
      <View style={styles.screen}>
        <View style={[styles.heroArea, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.overlayBtn} onPress={() => router.back()}>
            {isRTL ? <ChevronRight size={24} color="#0F2A36" strokeWidth={2.5} /> : <ChevronLeft size={24} color="#0F2A36" strokeWidth={2.5} />}
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <AppText variant="bold" style={styles.notFoundText}>الوجبة غير موجودة</AppText>
        </View>
      </View>
    );
  }

  const zoneMeta = getZoneMeta(meal.dominant_zone);
  const itemIds = meal.meal_item_ids.split(',').map(Number);
  const items: MealItem[] = itemIds
    .map((id) => getMealItemById(id))
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

  return (
    <View style={styles.screen}>
      {/* Hero image area */}
      <View style={[styles.heroArea, { backgroundColor: zoneMeta.softBg }]}>
        <View style={[styles.heroBtns, { top: insets.top + 12, flexDirection: rowDir }]}>
          <TouchableOpacity style={styles.overlayBtn} onPress={() => router.back()} activeOpacity={0.8}>
            {/* chevron points toward "back" direction — right in RTL, left in LTR */}
            {isRTL ? <ChevronRight size={24} color="#0F2A36" strokeWidth={2.5} /> : <ChevronLeft size={24} color="#0F2A36" strokeWidth={2.5} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayBtn} activeOpacity={0.8}>
            <Heart size={20} color="#0F2A36" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroContent}>
          <AppText style={styles.heroPlaceholderText}>{meal.name}</AppText>
        </View>
      </View>

      {/* Content sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* title + stars */}
        <AppText variant="bold" style={styles.mealTitle}>{meal.name}</AppText>
        <View style={[styles.starsRow, { flexDirection: rowDir }]}>
          <StarRating value={zoneMeta.stars} size={18} gap={3} />
          <AppText style={styles.starsLabel}>تقييم نظام الطيّبات</AppText>
        </View>

        <AppText style={styles.description}>
          وجبة من نظام الطيّبات — {toArabicNumerals(items.length)} مكوّنات
        </AppText>

        {/* ingredients */}
        {items.length > 0 && (
          <View style={styles.ingredientsSection}>
            <View style={styles.sectionHeader}>
              <AppText variant="bold" style={styles.sectionTitle}>المكوّنات وتقييم كل عنصر</AppText>
            </View>
            <View style={styles.ingredientList}>
              {items.map((item) => (
                <IngredientRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        )}

        {/* share button */}
        <TouchableOpacity style={[styles.shareBtn, { flexDirection: rowDir }]} onPress={handleShare} activeOpacity={0.8}>
          <Share2 size={18} color="#0F2A36" strokeWidth={2} />
          <AppText variant="bold" style={styles.shareBtnText}>شارك الوجبة على السوشيال ميديا</AppText>
        </TouchableOpacity>

        {/* add to today */}
        <TouchableOpacity onPress={handleAddToday} activeOpacity={0.9} style={styles.addBtnWrapper}>
          <LinearGradient
            colors={['#1ED49A', '#0CA170']}
            style={styles.addBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <AppText variant="bold" style={styles.addBtnText}>أضف إلى وجبات اليوم</AppText>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function IngredientRow({ item }: { item: MealItem }) {
  const zoneMeta = getZoneMeta(item.zone as ZoneColor);
  const { rowDir } = useRTL();

  return (
    <View style={[styles.ingredientRow, { flexDirection: rowDir }]}>
      <View style={styles.ingredientBody}>
        <View style={styles.ingredientTop}>
          <AppText variant="bold" style={styles.ingredientName}>{item.name}</AppText>
          {item.notes ? (
            <AppText style={styles.ingredientNote}>{item.notes}</AppText>
          ) : null}
        </View>
      </View>
      <StarRating value={zoneMeta.stars} size={13} gap={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  heroArea: {
    height: 280,
    flexShrink: 0,
    position: 'relative',
  },
  heroBtns: {
    position: 'absolute',
    left: 22,
    right: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroPlaceholderText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  overlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: '#F1F5F9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetContent: {
    padding: 22,
    gap: 0,
  },
  mealTitle: {
    fontSize: 24,
    color: '#0F2A36',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  starsLabel: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  description: {
    marginTop: 12,
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 22,
  },
  ingredientsSection: {
    marginTop: 20,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    color: '#0F2A36',
    lineHeight: 24,
  },
  ingredientList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  ingredientBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  ingredientTop: {
    gap: 2,
  },
  ingredientName: {
    fontSize: 14,
    color: '#0F2A36',
    lineHeight: 20,
  },
  ingredientNote: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  shareBtn: {
    marginTop: 22,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareBtnText: {
    fontSize: 14.5,
    color: '#0F2A36',
    lineHeight: 20,
  },
  addBtnWrapper: {
    marginTop: 12,
  },
  addBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  addBtnText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
  },
});
