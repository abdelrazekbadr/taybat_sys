import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

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
  const theme = useTheme();
  const progress = Math.min(1, currentDays / targetDays);
  const { rowDir } = useRTL();
  const pct = `${Math.round(progress * 100)}%`;

  return (
    <View
      className="flex-row items-center gap-3.5 rounded-[20px] border border-app-lineSoft bg-app-surface p-3.5 shadow-sm shadow-black/10"
      style={{ flexDirection: rowDir, elevation: 2 }}
    >
      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Award size={26} color={theme.colors.surface} fill={theme.colors.surface} strokeWidth={1.5} />
      </LinearGradient>

      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
          <AppText variant="bold" className="text-[11px] leading-4 text-app-textSoft">الشارة القادمة</AppText>
          <PartyPopper size={11} color={theme.colors.primary} strokeWidth={2} />
        </View>
        <AppText variant="bold" className="text-[14px] leading-5 text-app-navy">{badgeLabel}</AppText>

        <View className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-app-surfaceAlt">
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            style={{ height: '100%', width: pct as `${number}%`, borderRadius: 999 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>

        <AppText className="mt-1 text-[11px] leading-4 text-app-textSoft">
          {toArabicNumerals(currentDays)} من {toArabicNumerals(targetDays)} أيام
        </AppText>
      </View>
    </View>
  );
}
