import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { StarRating } from '@/components/common/StarRating';
import { useRTL } from '@/hooks/useRTL';
import { useMealsStore } from '@/stores/meals.store';
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

const MEAL_SLOT_MAP: Record<number, TabKey> = {
  1: 'breakfast',
  2: 'lunch',
  3: 'dinner',
};

export default function SelectMealScreen() {
  const insets = useSafeAreaInsets();
  const { meals, initializeMeals, isLoading } = useMealsStore();
  const [activeTab, setActiveTab] = useState<TabKey>('breakfast');
  const { isRTL, rowDir } = useRTL();

  useEffect(() => {
    if (!meals.length) initializeMeals();
  }, [meals.length, initializeMeals]);

  const filteredMeals: Meal[] = meals.filter((m) => MEAL_SLOT_MAP[m.id] === activeTab);

  return (
    <View style={styles.screen}>
      {/* header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, flexDirection: rowDir }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          {isRTL ? <ChevronRight size={22} color="#0F2A36" strokeWidth={2.5} /> : <ChevronLeft size={22} color="#0F2A36" strokeWidth={2.5} />}
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <AppText style={styles.headerSub}>من نظام الطيّبات</AppText>
          <AppText variant="bold" style={styles.headerTitle}>اختار وجبتك</AppText>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* tabs */}
      <View style={styles.tabsWrapper}>
        <View style={[styles.tabsContainer, { flexDirection: rowDir }]}>
          {TABS.map((t) => {
            const isActive = t.key === activeTab;
            return (
              <TouchableOpacity
                key={t.key}
                style={styles.tabBtn}
                onPress={() => setActiveTab(t.key)}
                activeOpacity={0.8}
              >
                {isActive ? (
                  <LinearGradient
                    colors={['#1ED49A', '#0CA170']}
                    style={styles.tabBtnActive}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                  >
                    <AppText variant="bold" style={styles.tabLabelActive}>{t.label}</AppText>
                  </LinearGradient>
                ) : (
                  <View style={styles.tabBtnInactive}>
                    <AppText variant="bold" style={styles.tabLabelInactive}>{t.label}</AppText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* list */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#10B981" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <AppText style={styles.countLabel}>
            {toArabicNumerals(filteredMeals.length)} اقتراحات مناسبة لمرحلتك الحالية
          </AppText>
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() =>
                router.push({ pathname: '/(main)/meal-detail', params: { mealId: String(meal.id) } })
              }
            />
          ))}
        </ScrollView>
      )}

      <AppTabBar active="home" />
    </View>
  );
}

function MealCard({ meal, onPress }: { meal: Meal; onPress: () => void }) {
  const zoneMeta = getZoneMeta(meal.dominant_zone);
  const { rowDir } = useRTL();

  return (
    <TouchableOpacity style={[styles.card, { flexDirection: rowDir }]} onPress={onPress} activeOpacity={0.7}>
      {/* image placeholder */}
      <View style={[styles.imgPlaceholder, { backgroundColor: zoneMeta.softBg }]}>
        <AppText style={styles.imgEmoji}>{zoneMeta.emoji}</AppText>
      </View>

      <View style={styles.cardBody}>
        <StarRating value={zoneMeta.stars} size={13} gap={2} />
        <AppText variant="bold" style={styles.mealName}>{meal.name}</AppText>
        <AppText style={styles.mealSub}>
          {meal.meal_item_ids.split(',').length} مكوّنات
        </AppText>
      </View>

      <TouchableOpacity style={styles.addCircle} onPress={onPress} activeOpacity={0.8}>
        <Plus size={20} color="#059669" strokeWidth={2.5} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  headerSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#0F2A36',
    lineHeight: 24,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  tabsWrapper: {
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  tabBtn: {
    flex: 1,
  },
  tabBtnActive: {
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  tabBtnInactive: {
    paddingVertical: 10,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabLabelActive: {
    fontSize: 13.5,
    color: '#fff',
    lineHeight: 20,
    textAlign: 'center',
  },
  tabLabelInactive: {
    fontSize: 13.5,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    gap: 10,
  },
  countLabel: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imgPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  imgEmoji: {
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  cardTop: {
    marginBottom: 2,
  },
  mealName: {
    fontSize: 14.5,
    color: '#0F2A36',
    lineHeight: 20,
  },
  mealSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  addCircle: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
