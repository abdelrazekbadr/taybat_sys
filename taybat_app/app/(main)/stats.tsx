import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  Battery,
  Brain,
  ChevronLeft,
  ChevronRight,
  Frown,
  Laugh,
  Meh,
  Moon,
  PartyPopper,
  Smile,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppText } from '@/components/common/AppText';
import { AppTabBar } from '@/components/common/AppTabBar';
import { useRTL } from '@/hooks/useRTL';
import { useUserStore } from '@/stores/user.store';
import { useWeeklyRatingStore } from '@/stores/weeklyRating.store';
import type { WeeklyRating, WeeklyScore } from '@/types';
import { daysUntilNextRating, nextRatingDate, toMonthlyChartData, toWeeklyChartData } from '@/utils/statsUtils';
import { toArabicNumerals } from '@/utils/zoneUtils';

type ForceMode = 'pending' | 'locked';

type EvaluationFormValues = {
  health_score: WeeklyScore | null;
  adherence_score: WeeklyScore | null;
  pain_reduced: boolean;
  energy_improved: boolean;
  sleep_improved: boolean;
  digestion_improved: boolean;
  mood_improved: boolean;
  mental_health_improved: boolean;
};

const weeklyScoreSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

const evaluationSchema = z.object({
  health_score: weeklyScoreSchema,
  adherence_score: weeklyScoreSchema,
  pain_reduced: z.boolean(),
  energy_improved: z.boolean(),
  sleep_improved: z.boolean(),
  digestion_improved: z.boolean(),
  mood_improved: z.boolean(),
  mental_health_improved: z.boolean(),
});

function formatArabicDate(isoDate: string) {
  const date = new Date(isoDate);
  try {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch {
    return isoDate;
  }
}

type ScoreOption = { value: WeeklyScore; Icon: LucideIcon; label: string };

const SCORE_OPTIONS: ScoreOption[] = [
  { value: 1, Icon: Frown, label: 'سيء جداً' },
  { value: 2, Icon: Meh, label: 'سيء' },
  { value: 3, Icon: Smile, label: 'محايد' },
  { value: 4, Icon: Laugh, label: 'جيد' },
  { value: 5, Icon: PartyPopper, label: 'ممتاز' },
];

type ImprovementKey =
  | 'pain_reduced'
  | 'energy_improved'
  | 'sleep_improved'
  | 'digestion_improved'
  | 'mood_improved'
  | 'mental_health_improved';

const IMPROVEMENTS: { key: ImprovementKey; Icon: LucideIcon; label: string }[] = [
  { key: 'pain_reduced', Icon: Zap, label: 'تحسّن الألم' },
  { key: 'energy_improved', Icon: Battery, label: 'طاقة أفضل' },
  { key: 'sleep_improved', Icon: Moon, label: 'نوم أفضل' },
  { key: 'digestion_improved', Icon: Activity, label: 'هضم أفضل' },
  { key: 'mood_improved', Icon: Smile, label: 'مزاج أفضل' },
  { key: 'mental_health_improved', Icon: Brain, label: 'صحة نفسية أفضل' },
];

function ScoreSelector(props: {
  value: WeeklyScore | null;
  onChange: (v: WeeklyScore) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View className="mt-2 flex-row gap-2" style={{ flexDirection: rowDir }}>
      {SCORE_OPTIONS.map((opt) => {
        const isSelected = props.value === opt.value;
        const Icon = opt.Icon;
        return (
          <Pressable
            key={opt.value}
            onPress={() => props.onChange(opt.value)}
            disabled={props.disabled}
            className="flex-1"
            style={({ pressed }) => [{ opacity: props.disabled ? 0.4 : pressed ? 0.85 : 1 }]}
          >
            <View
              className="items-center justify-center rounded-[16px] border p-2.5"
              style={{
                borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
              }}
            >
              <Icon size={22} color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant} strokeWidth={2.4} />
              <AppText
                variant="semibold"
                className="mt-1 text-center text-[10.5px] leading-4"
                style={{ color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant }}
              >
                {opt.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function ImprovementToggle(props: {
  Icon: LucideIcon;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const Icon = props.Icon;
  const isActive = props.value;
  return (
    <Pressable
      onPress={() => props.onChange(!props.value)}
      disabled={props.disabled}
      className="w-[48%]"
      style={({ pressed }) => [{ opacity: props.disabled ? 0.4 : pressed ? 0.9 : 1 }]}
    >
      <View
        className="flex-row items-center gap-2 rounded-[14px] border px-3 py-3"
        style={{
          flexDirection: rowDir,
          borderColor: isActive ? theme.colors.primary : theme.colors.outlineVariant,
          backgroundColor: isActive ? theme.colors.primary : theme.colors.surface,
        }}
      >
        <Icon size={18} color={isActive ? theme.colors.surface : theme.colors.onSurfaceVariant} strokeWidth={2.4} />
        <AppText
          variant="semibold"
          className="flex-1 text-[12.5px] leading-5"
          style={{ color: isActive ? theme.colors.surface : theme.colors.onSurfaceVariant }}
        >
          {props.label}
        </AppText>
      </View>
    </Pressable>
  );
}

function WeeklyMiniChart({ ratings }: { ratings: WeeklyRating[] }) {
  const theme = useTheme();
  const width = 320;
  const height = 160;
  const paddingX = 18;
  const paddingY = 18;
  const points = useMemo(() => {
    return toWeeklyChartData(ratings, 10);
  }, [ratings]);

  const xStep = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0;
  const yFor = (v: number) =>
    height - paddingY - ((Math.max(1, Math.min(5, v)) - 1) / 4) * (height - paddingY * 2);

  const pathFor = (values: number[]) => {
    if (!values.length) return '';
    return values
      .map((v, idx) => {
        const x = paddingX + idx * xStep;
        const y = yFor(v);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const healthPath = pathFor(points.map((p) => p.value));
  const adherencePath = pathFor(points.map((p) => p.value2));

  return (
    <View className="mt-3 overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
      <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
        التطور الأسبوعي
      </AppText>
      <View className="mt-3 items-center">
        <Svg width={width} height={height}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const y = paddingY + (idx / 4) * (height - paddingY * 2);
            return <Line key={idx} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={theme.colors.outlineVariant} strokeWidth={1} />;
          })}
          {healthPath ? <Path d={healthPath} stroke={theme.colors.primary} strokeWidth={3} fill="none" /> : null}
          {adherencePath ? <Path d={adherencePath} stroke={theme.colors.secondary} strokeWidth={3} fill="none" /> : null}
          {points.map((p, idx) => {
            const x = paddingX + idx * xStep;
            return (
              <React.Fragment key={idx}>
                <Circle cx={x} cy={yFor(p.value || 1)} r={3.5} fill={theme.colors.primary} />
                <Circle cx={x} cy={yFor(p.value2 || 1)} r={3.5} fill={theme.colors.secondary} />
              </React.Fragment>
            );
          })}
        </Svg>
      </View>
      <View className="mt-3 flex-row gap-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
          <AppText className="text-[12px] text-app-textSoft">الصحة</AppText>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.colors.secondary }} />
          <AppText className="text-[12px] text-app-textSoft">الالتزام</AppText>
        </View>
      </View>
    </View>
  );
}

function MonthlyMiniChart({ ratings }: { ratings: WeeklyRating[] }) {
  const theme = useTheme();
  const width = 320;
  const height = 150;
  const paddingX = 14;
  const paddingY = 16;
  const year = new Date().getFullYear();

  const monthly = useMemo(() => {
    return toMonthlyChartData(ratings, year);
  }, [ratings, year]);

  const barCount = 12;
  const barGap = 6;
  const barWidth = (width - paddingX * 2 - barGap * (barCount - 1)) / barCount;
  const maxValue = 5;

  return (
    <View className="mt-3 overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
      <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
        ملخّص شهري
      </AppText>
      <View className="mt-3 items-center">
        <Svg width={width} height={height}>
          {Array.from({ length: 5 }).map((_, idx) => {
            const y = paddingY + (idx / 4) * (height - paddingY * 2);
            return <Line key={idx} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={theme.colors.outlineVariant} strokeWidth={1} />;
          })}
          {monthly.map((point, idx) => {
            const x = paddingX + idx * (barWidth + barGap);
            const h = (Math.max(0, Math.min(maxValue, point.value)) / maxValue) * (height - paddingY * 2);
            const y = height - paddingY - h;
            return (
              <Rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, h)}
                rx={4}
                fill={point.hasData ? theme.colors.primary : theme.colors.surfaceVariant}
                opacity={point.hasData ? 1 : 0.6}
              />
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

export default function StatsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const { force } = useLocalSearchParams<{ force?: ForceMode }>();

  const { user, initializeUser } = useUserStore();
  const { ratings, pendingRating, isLoading, errorMessage, initializeRatings, submitRating } = useWeeklyRatingStore();
  const [activeTab, setActiveTab] = useState<'evaluation' | 'timeline'>('evaluation');
  const [localError, setLocalError] = useState('');
  const [successKey, setSuccessKey] = useState(0);

  const dueDate = useMemo(() => nextRatingDate(ratings), [ratings]);
  const daysUntilDue = useMemo(() => daysUntilNextRating(ratings), [ratings]);
  const effectivePending = force === 'pending' ? true : force === 'locked' ? false : pendingRating;
  const canSubmit = effectivePending;

  const sheetEntrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) initializeUser();
    initializeRatings();
  }, [initializeRatings, initializeUser, user]);

  useEffect(() => {
    sheetEntrance.setValue(0);
    Animated.timing(sheetEntrance, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start();
  }, [sheetEntrance, activeTab, successKey]);

  const sheetAnimatedStyle = {
    opacity: sheetEntrance,
    transform: [
      {
        translateY: sheetEntrance.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const form = useForm<EvaluationFormValues>({
    defaultValues: {
      health_score: null,
      adherence_score: null,
      pain_reduced: false,
      energy_improved: false,
      sleep_improved: false,
      digestion_improved: false,
      mood_improved: false,
      mental_health_improved: false,
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError('');
    if (!canSubmit) {
      setLocalError('التقييم غير متاح الآن');
      return;
    }
    const parsed = evaluationSchema.safeParse(values);
    if (!parsed.success) {
      setLocalError('اختر تقييم الصحة والالتزام قبل الإرسال');
      return;
    }
    const ok = await submitRating({
      period_start: new Date().toISOString().slice(0, 10),
      ...parsed.data,
    });
    if (!ok) {
      setLocalError(errorMessage || 'تعذّر إرسال التقييم');
      return;
    }
    form.reset();
    setSuccessKey((k) => k + 1);
  });

  return (
    <View className="flex-1 bg-app-background">
      <View className="px-[22px]" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            {isRTL ? <ChevronRight size={24} color={theme.colors.onSurface} /> : <ChevronLeft size={24} color={theme.colors.onSurface} />}
          </Pressable>
          <AppText variant="bold" className="text-[17px] leading-6 text-app-navy">
            تقييم الطيبات
          </AppText>
          <View className="w-11" />
        </View>

        <View className="mt-4 flex-row justify-center gap-3" style={{ flexDirection: rowDir }}>
          <Pressable onPress={() => setActiveTab('evaluation')} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            {activeTab === 'evaluation' ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}
              >
                <AppText variant="bold" className="text-[13px] text-white">
                  التقييم
                </AppText>
              </LinearGradient>
            ) : (
              <View className="rounded-full border border-app-lineSoft bg-app-surface px-[18px] py-[10px]">
                <AppText variant="bold" className="text-[13px] text-app-textSoft">
                  التقييم
                </AppText>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => setActiveTab('timeline')} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
            {activeTab === 'timeline' ? (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}
              >
                <AppText variant="bold" className="text-[13px] text-white">
                  إنجازاتي
                </AppText>
              </LinearGradient>
            ) : (
              <View className="rounded-full border border-app-lineSoft bg-app-surface px-[18px] py-[10px]">
                <AppText variant="bold" className="text-[13px] text-app-textSoft">
                  إنجازاتي
                </AppText>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <Animated.View className="flex-1" style={sheetAnimatedStyle}>
        {activeTab === 'evaluation' ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: insets.bottom + 96 }}
          >
            <View className="rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
              <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
                <AppText variant="bold" className="text-[15px] leading-[22px] text-app-navy">
                  {canSubmit ? 'التقييم الحالي' : 'التقييم القادم'}
                </AppText>
                <View className="rounded-full bg-app-surfaceAlt px-3 py-1">
                  <AppText variant="bold" className="text-[11px] text-app-textSoft">
                    {formatArabicDate(dueDate)}
                  </AppText>
                </View>
              </View>
              {!canSubmit ? (
                <AppText className="mt-2 text-[12.5px] leading-5 text-app-textSoft">
                  {daysUntilDue > 0 ? `متاح بعد ${toArabicNumerals(daysUntilDue)} أيام` : 'غير متاح الآن'}
                </AppText>
              ) : (
                <AppText className="mt-2 text-[12.5px] leading-5 text-app-textSoft">اختر تقييمك ثم أرسل التقييم</AppText>
              )}
            </View>

            <View style={{ opacity: canSubmit ? 1 : 0.4 }} pointerEvents={canSubmit ? 'auto' : 'none'}>
              <View className="mt-5">
                <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                  الحالة الصحية العامة
                </AppText>
                <Controller
                  control={form.control}
                  name="health_score"
                  render={({ field }) => (
                    <ScoreSelector value={field.value} onChange={(v) => field.onChange(v)} disabled={!canSubmit} />
                  )}
                />
              </View>

              <View className="mt-5">
                <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                  الالتزام بالنظام
                </AppText>
                <Controller
                  control={form.control}
                  name="adherence_score"
                  render={({ field }) => (
                    <ScoreSelector value={field.value} onChange={(v) => field.onChange(v)} disabled={!canSubmit} />
                  )}
                />
              </View>

              <View className="mt-6">
                <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                  التحسينات الملحوظة
                </AppText>
                <View className="mt-3 flex-row flex-wrap justify-between gap-y-3" style={{ flexDirection: rowDir }}>
                  {IMPROVEMENTS.map((imp) => (
                    <Controller
                      key={imp.key}
                      control={form.control}
                      name={imp.key}
                      render={({ field }) => (
                        <ImprovementToggle
                          Icon={imp.Icon}
                          label={imp.label}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={!canSubmit}
                        />
                      )}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View className="mt-6">
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit || isLoading}
                style={({ pressed }) => [{ opacity: !canSubmit || isLoading ? 0.4 : pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center' }}
                >
                  <AppText variant="bold" className="text-[15px] text-white">
                    أرسل التقييم
                  </AppText>
                </LinearGradient>
              </Pressable>

              {localError || errorMessage ? (
                <AppText className="mt-2 text-center text-[12.5px] leading-5 text-app-danger">
                  {localError || errorMessage}
                </AppText>
              ) : null}

              {successKey > 0 && !localError && !errorMessage ? (
                <View className="mt-3 items-center">
                  <AppText variant="bold" className="text-[13px] text-app-primary">
                    تم إرسال التقييم بنجاح
                  </AppText>
                </View>
              ) : null}
            </View>

            {force ? (
              <View className="mt-6 items-center">
                <AppText className="text-[11px] text-app-muted">{`وضع الاختبار: ${force}`}</AppText>
              </View>
            ) : null}
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: insets.bottom + 96 }}
          >
            {!ratings.length ? (
              <View className="rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
                <AppText variant="bold" className="text-[14px] text-app-navy">
                  لا توجد بيانات كافية بعد
                </AppText>
                <AppText className="mt-1 text-[12.5px] leading-5 text-app-textSoft">
                  سجّل تقييمك الأسبوعي لتظهر الرسوم البيانية.
                </AppText>
              </View>
            ) : (
              <>
                <WeeklyMiniChart ratings={ratings} />
                <MonthlyMiniChart ratings={ratings} />
              </>
            )}
          </ScrollView>
        )}
      </Animated.View>

      <View className="absolute bottom-0 left-0 right-0">
        <AppTabBar active="home" />
      </View>
    </View>
  );
}
