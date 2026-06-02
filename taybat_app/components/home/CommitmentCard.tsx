import { LinearGradient } from 'expo-linear-gradient';
import { Frown, Laugh, Meh, Smile, Utensils, type LucideIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, View, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
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

type MoodItem = { Icon: LucideIcon; label: string };

const MOODS: MoodItem[] = [
  { Icon: Frown, label: 'جوع شديد' },
  { Icon: Meh,   label: 'جائع' },
  { Icon: Smile, label: 'محايد' },
  { Icon: Laugh, label: 'شبعان' },
];

export function CommitmentCard({ dayNumber, planStartDate, onAddMeal }: CommitmentCardProps) {
  const theme = useTheme();
  const [selectedMood, setSelectedMood] = useState(1);
  const { isRTL, rowDir } = useRTL();
  const entrance = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

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
        Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.8, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -0.8, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0.4, duration: 55, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
      ]),
    ]).start();
  }, [entrance, shake]);

  const shakeTranslateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });
  const shakeRotateZ = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-1.6deg', '1.6deg'],
  });

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

  // On Android the native RTL coordinate flip mirrors the gradient X axis,
  // so we swap start/end to keep the visual direction consistent.
  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd   = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };

  return (
    <View className="rounded-[26px] shadow-xl shadow-black/20" style={{ elevation: 10 }}>
    <Animated.View style={[animatedStyle, { borderRadius: 26, overflow: 'hidden' }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={gradStart}
        end={gradEnd}
        style={{ padding: 20 }}
      >
        {/* absolute circles: swap left/right on Android RTL to stay in correct corners */}
        <View className="absolute top-[-30px] h-[160px] w-[160px] rounded-full bg-white/10" style={androidRTL ? { left: -30 } : { right: -30 }} />
        <View className="absolute bottom-[-60px] h-[150px] w-[150px] rounded-full bg-white/10" style={androidRTL ? { right: -50 } : { left: -50 }} />

        <View className="gap-0">
          <View className="items-center justify-between" style={{ flexDirection: rowDir }}>
            <View className="rounded-full bg-white/25 px-2.5 ">
              <AppText variant="bold" className="text-[11px]  text-white">
                اليوم {toArabicNumerals(dayNumber)} من رحلتك
              </AppText>
            </View>
            {planStartDate ? (
              <View className="rounded-full bg-white/15 px-2.5 ">
                <AppText className="text-[11px]  text-white/80">
                  بدأت {formatStartDateAr(planStartDate)}
                </AppText>
              </View>
            ) : null}
          </View>

          <AppText variant="bold" className="mb-1 text-[20px]  text-white">هل تشعر بالجوع الآن؟</AppText>
          <AppText className="mb-4 text-[13px] leading-5 text-white/90">توقّف وأنصت. استمع لجسدك قبل كل وجبة.</AppText>

          <View className="mb-2 flex-row gap-2" style={{ flexDirection: rowDir }}>
            {MOODS.map((m, i) => {
              const MoodIcon = m.Icon;
              const isActive = i === selectedMood;
              return (
                <TouchableOpacity
                  key={i}
                  className="flex-1 items-center gap-1 rounded-[16px] px-1 py-2.5"
                  style={isActive ? { backgroundColor: theme.colors.surface } : undefined}
                  onPress={() => setSelectedMood(i)}
                  activeOpacity={0.8}
                >
                  <MoodIcon
                    size={22}
                    color={isActive ? theme.colors.primary : 'rgba(255,255,255,0.85)'}
                    strokeWidth={2}
                  />
                  <AppText
                    variant="bold"
                    className="text-center text-[10.5px] leading-[16px]"
                    style={isActive ? { color: theme.colors.onSurface } : { color: theme.colors.surface }}
                  >
                    {m.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="h-12 items-center justify-center rounded-[14px] bg-app-surface"
            onPress={onAddMeal}
            activeOpacity={0.85}
          >
            <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
              <Utensils size={16} color={theme.colors.primary} strokeWidth={2} />
              <AppText variant="bold" className="text-[14px]  text-app-primaryDark">اختر وجبة من الطيبات</AppText>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
    </View>
  );
}
