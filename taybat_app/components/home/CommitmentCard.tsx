import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Frown, Laugh, Meh, Smile, Utensils, type LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { toArabicNumerals } from '@/utils/zoneUtils';

interface CommitmentCardProps {
  dayNumber: number;
  streakDays: number;
  onAddMeal: () => void;
}

type MoodItem = { Icon: LucideIcon; label: string };

const MOODS: MoodItem[] = [
  { Icon: Frown, label: 'جوع شديد' },
  { Icon: Meh,   label: 'جائع' },
  { Icon: Smile, label: 'محايد' },
  { Icon: Laugh, label: 'شبعان' },
];

export function CommitmentCard({ dayNumber, streakDays, onAddMeal }: CommitmentCardProps) {
  const [selectedMood, setSelectedMood] = useState(1);
  const { rowDir } = useRTL();

  return (
    <LinearGradient
      colors={['#0EA875', '#1ED49A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* decorative circles */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      <View style={styles.content}>
        <View style={[styles.pillRow, { flexDirection: rowDir }]}>
          <View style={styles.pill}>
            <AppText variant="bold" style={styles.pillText}>
              اليوم {toArabicNumerals(dayNumber)} من رحلتك
            </AppText>
          </View>
          <View style={[styles.pill, styles.pillRow, { gap: 4 }]}>
            <Flame size={11} color="#fff" fill="#fff" strokeWidth={0} />
            <AppText variant="bold" style={styles.pillText}>
              {toArabicNumerals(streakDays)} أيام التزام
            </AppText>
          </View>
        </View>

        <AppText variant="bold" style={styles.headline}>هل تشعر بالجوع الآن؟</AppText>
        <AppText style={styles.subline}>توقّف وأنصت. استمع لجسدك قبل كل وجبة.</AppText>

        <View style={[styles.moodRow, { flexDirection: rowDir }]}>
          {MOODS.map((m, i) => {
            const MoodIcon = m.Icon;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.moodBtn, i === selectedMood && styles.moodBtnActive]}
                onPress={() => setSelectedMood(i)}
                activeOpacity={0.8}
              >
                <MoodIcon
                  size={22}
                  color={i === selectedMood ? '#0EA875' : 'rgba(255,255,255,0.85)'}
                  strokeWidth={2}
                />
                <AppText variant="bold" style={[styles.moodLabel, i === selectedMood && styles.moodLabelActive]}>
                  {m.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={onAddMeal} activeOpacity={0.85}>
          <View style={styles.addBtnContent}>
            <Utensils size={16} color="#059669" strokeWidth={2} />
            <AppText variant="bold" style={styles.addBtnText}>أضف وجبة الآن</AppText>
          </View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#0EA875',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  circleTopRight: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  circleBottomLeft: {
    position: 'absolute',
    left: -50,
    bottom: -60,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  content: {
    gap: 0,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  pillText: {
    fontSize: 11,
    color: '#fff',
    lineHeight: 16,
  },
  headline: {
    fontSize: 22,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 4,
  },
  subline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.90)',
    lineHeight: 20,
    marginBottom: 16,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  moodBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    gap: 4,
  },
  moodBtnActive: {
    backgroundColor: '#fff',
  },
  moodLabel: {
    fontSize: 10.5,
    color: '#fff',
    lineHeight: 14,
    textAlign: 'center',
  },
  moodLabelActive: {
    color: '#0F2A36',
  },
  addBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 15,
    color: '#059669',
    lineHeight: 20,
  },
});
