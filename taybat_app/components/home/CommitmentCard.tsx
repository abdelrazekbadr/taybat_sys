import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Share2, Trophy, Utensils } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, View, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { buildDayStreakTopic, shareContent } from '@/services/sharing';
import { useMembershipStore } from '@/stores/membership.store';
import { toArabicNumerals } from '@/utils/zoneUtils';

const AR_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function formatStartDateAr(iso: string): string {
  const d = new Date(iso);
  return `${toArabicNumerals(d.getDate())} ${AR_MONTHS[d.getMonth()]}`;
}

interface CommitmentCardProps {
  dayNumber: number;
  planStartDate?: string | null;
  onAddMeal: () => void;
}

export function CommitmentCard({ dayNumber, planStartDate, onAddMeal }: CommitmentCardProps) {
  const theme = useTheme();
  const { isRTL, rowDir } = useRTL();
  const entrance = useRef(new Animated.Value(0)).current;
  const shake    = useRef(new Animated.Value(0)).current;
  const [isSharingDay, setIsSharingDay] = useState(false);

  const committedPoints  = useMembershipStore((s) => s.committedPoints);
  const supporterPoints  = useMembershipStore((s) => s.supporterPoints);
  const committedTier    = useMembershipStore((s) => s.committedTier);
  const supporterTier    = useMembershipStore((s) => s.supporterTier);
  const membershipConfig = useMembershipStore((s) => s.config);

  const nextCommittedPts = useMemo(() => {
    if (!membershipConfig) return 50;
    return (
      membershipConfig.tiers
        .filter((t) => t.track === 'committed' && t.minPoints > committedPoints)
        .sort((a, b) => a.minPoints - b.minPoints)[0]?.minPoints ?? null
    );
  }, [membershipConfig, committedPoints]);

  const nextSupporterPts = useMemo(() => {
    if (!membershipConfig) return 50;
    return (
      membershipConfig.tiers
        .filter((t) => t.track === 'supporter' && t.minPoints > supporterPoints)
        .sort((a, b) => a.minPoints - b.minPoints)[0]?.minPoints ?? null
    );
  }, [membershipConfig, supporterPoints]);

  const committedPct = nextCommittedPts
    ? (`${Math.round(Math.min(1, committedPoints / nextCommittedPts) * 100)}%` as `${number}%`)
    : ('100%' as `${number}%`);

  const supporterPct = nextSupporterPts
    ? (`${Math.round(Math.min(1, supporterPoints / nextSupporterPts) * 100)}%` as `${number}%`)
    : ('100%' as `${number}%`);

  useEffect(() => {
    entrance.setValue(0);
    shake.setValue(0);
    Animated.parallel([
      Animated.spring(entrance, {
        toValue: 1,
        useNativeDriver: true,
        damping: 22,
        stiffness: 110,
        mass: 1.2,
      }),
      Animated.sequence([
        Animated.delay(60),
        Animated.timing(shake, { toValue: 1,    duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1,   duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.8,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.8, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.4,  duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0,    duration: 55, useNativeDriver: true }),
      ]),
    ]).start();
  }, [entrance, shake]);

  const shakeTranslateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });
  const shakeRotateZ    = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-1.6deg', '1.6deg'] });

  const animatedStyle = {
    opacity: entrance,
    transform: [
      { perspective: 1200 },
      { rotateY: entrance.interpolate({ inputRange: [0, 1], outputRange: ['-80deg', '0deg'] }) },
      { translateX: shakeTranslateX },
      { rotateZ: shakeRotateZ },
      { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
    ],
  };

  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart  = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd    = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };
  // iOS uses explicit CSS RTL (no native coordinate flip) — mirror progress bars manually
  const flipBar    = Platform.OS === 'ios' && isRTL;

  const handleShareDay = async () => {
    if (isSharingDay) return;
    setIsSharingDay(true);
    try {
      const { shared } = await shareContent(buildDayStreakTopic(), dayNumber);
      // Reuses 'share_stats' — the closest existing supporter-track rule for a
      // personal-progress share; see _docs/analysis/share_enhancement_plan.md §4.4.
      if (shared) {
        void useMembershipStore.getState().recordEvent('supporter', 'share_stats', undefined, 'stat', dayNumber);
      }
    } finally {
      setIsSharingDay(false);
    }
  };

  return (
    <View className="rounded-[26px] shadow-xl shadow-black/20" style={{ elevation: 10 }}>
      <Animated.View style={[animatedStyle, { borderRadius: 26, overflow: 'hidden' }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={gradStart}
          end={gradEnd}
          style={{ padding: 20 }}
        >
          {/* Decorative circles */}
          <View
            className="absolute top-[-30px] h-[160px] w-[160px] rounded-full bg-white/10"
            style={androidRTL ? { left: -30 } : { right: -30 }}
          />
          <View
            className="absolute bottom-[-60px] h-[150px] w-[150px] rounded-full bg-white/10"
            style={androidRTL ? { right: -50 } : { left: -50 }}
          />

          <View className="gap-0">
            {/* Day + plan start row */}
            <View className="items-center justify-between" style={{ flexDirection: rowDir }}>
              <View className="items-center gap-1.5" style={{ flexDirection: rowDir }}>
                <View className="rounded-full bg-white/25 px-2.5">
                  <AppText variant="bold" className="text-[11px] text-white">
                    اليوم {toArabicNumerals(dayNumber)} من رحلتك
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={handleShareDay}
                  disabled={isSharingDay}
                  className="h-6 w-6 items-center justify-center rounded-full bg-white/20"
                  activeOpacity={0.75}
                >
                  <Share2 size={12} color="white" strokeWidth={2.4} />
                </TouchableOpacity>
              </View>
              {planStartDate ? (
                <View className="rounded-full bg-white/15 px-2.5">
                  <AppText className="text-[11px] text-white/80">
                    بدأت {formatStartDateAr(planStartDate)}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Membership section label — window days from config */}
            <AppText variant="semibold" className="mb-2 mt-3 text-[12px] leading-5 text-white/80">
              عضويتك آخر {toArabicNumerals(membershipConfig?.resetWindowDays ?? 30)} يوم
            </AppText>

            {/* ── Two membership cards side by side ── */}
            <View className="gap-4" style={{ flexDirection: rowDir }}>
              {/* Committed card */}
              <TouchableOpacity
                className="flex-1 rounded-[14px] bg-white/15 px-3 py-2.5"
                activeOpacity={0.75}
                onPress={() => router.push('/(main)/user-profile' as never)}
              >
                {/* Icon + label | points aligned to end */}
                <View className="mb-1.5 items-center justify-between" style={{ flexDirection: rowDir }}>
                  <View className="items-center gap-1" style={{ flexDirection: rowDir }}>
                    <Trophy size={11} color="white" strokeWidth={2.2} />
                    <AppText variant="semibold" className="text-[11px] leading-5 text-white/90">
                      ملتزم
                    </AppText>
                  </View>
                  <View className="items-baseline gap-0.5" style={{ flexDirection: rowDir }}>
                    <AppText variant="bold" className="text-[13px] leading-5 text-white">
                      {toArabicNumerals(committedPoints)}
                    </AppText>
                    <AppText className="text-[10px] leading-5 text-white/70"> نقطة</AppText>
                  </View>
                </View>
                {/* Tier name */}
                <AppText className="mb-1 text-[10.5px] leading-4 text-white/80">
                  {committedTier?.labelAr ?? 'مبتدئ'}
                </AppText>
                {/* Progress bar */}
                <View
                  className="h-1 overflow-hidden rounded-full bg-white/25"
                  style={{ transform: [{ scaleX: flipBar ? -1 : 1 }] }}
                >
                  <View className="h-full rounded-full bg-white" style={{ width: committedPct }} />
                </View>
              </TouchableOpacity>

              {/* Supporter card */}
              <TouchableOpacity
                className="flex-1 rounded-[14px] bg-white/15 px-3 py-2.5"
                activeOpacity={0.75}
                onPress={() => router.push('/(main)/user-profile' as never)}
              >
                {/* Icon + label | points aligned to end */}
                <View className="mb-1.5 items-center justify-between" style={{ flexDirection: rowDir }}>
                  <View className="items-center gap-1" style={{ flexDirection: rowDir }}>
                    <Share2 size={11} color="white" strokeWidth={2.2} />
                    <AppText variant="semibold" className="text-[11px] leading-5 text-white/90">
                      داعم
                    </AppText>
                  </View>
                  <View className="items-baseline gap-0.5" style={{ flexDirection: rowDir }}>
                    <AppText variant="bold" className="text-[13px] leading-5 text-white">
                      {toArabicNumerals(supporterPoints)}
                    </AppText>
                    <AppText className="text-[10px] leading-5 text-white/70"> نقطة</AppText>
                  </View>
                </View>
                {/* Tier name */}
                <AppText className="mb-1 text-[10.5px] leading-4 text-white/80">
                  {supporterTier?.labelAr ?? 'مبتدئ'}
                </AppText>
                {/* Progress bar */}
                <View
                  className="h-1 overflow-hidden rounded-full bg-white/25"
                  style={{ transform: [{ scaleX: flipBar ? -1 : 1 }] }}
                >
                  <View className="h-full rounded-full bg-white" style={{ width: supporterPct }} />
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Hunger section ── */}
            <AppText variant="bold" className="mb-1 mt-4 text-[20px] text-white">
              هل تشعر بالجوع الآن؟
            </AppText>
            <AppText className="mb-4 text-[13px] leading-5 text-white/90">
              توقّف وأنصت. استمع لجسدك قبل كل وجبة.
            </AppText>

            {/* Add meal CTA */}
            <TouchableOpacity
              className="h-12 items-center justify-center rounded-[14px] bg-app-surface"
              onPress={onAddMeal}
              activeOpacity={0.85}
            >
              <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
                <Utensils size={16} color={theme.colors.primary} strokeWidth={2} />
                <AppText variant="bold" className="text-[14px] text-app-primaryDark">
                  اختر وجبة من الطيبات
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}
