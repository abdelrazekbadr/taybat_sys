import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Award, PartyPopper } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { toArabicNumerals } from '@/utils/zoneUtils';

interface BadgeProgressCardProps {
  currentDays: number;
  targetDays: number;
  badgeLabel: string;
}

export function BadgeProgressCard({ currentDays, targetDays, badgeLabel }: BadgeProgressCardProps) {
  const progress = Math.min(1, currentDays / targetDays);
  const { rowDir } = useRTL();
  const pct = `${Math.round(progress * 100)}%`;

  return (
    <View style={[styles.card, { flexDirection: rowDir }]}>
      <LinearGradient
        colors={['#FFE08A', '#F5A623']}
        style={styles.medalBox}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Award size={26} color="#fff" fill="#fff" strokeWidth={1.5} />
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.nextLabelRow}>
          <AppText variant="bold" style={styles.nextLabel}>الشارة القادمة</AppText>
          <PartyPopper size={11} color="#F5C24A" strokeWidth={2} />
        </View>
        <AppText variant="bold" style={styles.badgeLabel}>{badgeLabel}</AppText>

        <View style={styles.progressTrack}>
          <LinearGradient
            colors={['#FFD062', '#F5A623']}
            style={[styles.progressFill, { width: pct as `${number}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <AppText style={styles.progressText}>
          {toArabicNumerals(currentDays)} من {toArabicNumerals(targetDays)} أيام
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#0F2A36',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },
  medalBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 4,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  nextLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextLabel: {
    fontSize: 11,
    color: '#F5C24A',
    lineHeight: 16,
  },
  badgeLabel: {
    fontSize: 14,
    color: '#0F2A36',
    lineHeight: 20,
  },
  progressTrack: {
    marginTop: 6,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#EAF0F6',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
});
