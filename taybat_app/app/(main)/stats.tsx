import { router, useLocalSearchParams } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  Frown,
  Laugh,
  Meh,
  PartyPopper,
  Smile,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { GradientTabs } from '@/components/common/GradientTabs';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { AppTabBar } from '@/components/common/AppTabBar';
import { CommitmentCalendar } from '@/components/stats/CommitmentCalendar';
import { useRTL } from '@/hooks/useRTL';
import { useHealthGoalsStore } from '@/stores/healthGoals.store';
import { useUserStore } from '@/stores/user.store';
import { useUserRatingStore } from '@/stores/userRating.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import type { UserRating, WeeklyScore } from '@/types';
import { localDateISO } from '@/utils/dateUtils';
import { nextRatingDate, toHealthTimelineInDays } from '@/utils/statsUtils';
import { toArabicNumerals } from '@/utils/zoneUtils';

// ─── Types ─────────────────────────────────────────────────────────────────

type ForceMode = 'pending' | 'locked';

type EvaluationFormValues = {
  health_score: WeeklyScore | null;
  improvements: number[];
};

type PeriodDays = 30 | 60 | 90;

// ─── Validation ────────────────────────────────────────────────────────────

const weeklyScoreSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]);

const evaluationSchema = z.object({
  health_score: weeklyScoreSchema,
  improvements: z.array(z.number()).min(1),
});

// ─── Constants ─────────────────────────────────────────────────────────────

const SCORE_OPTIONS: OptionItem<WeeklyScore>[] = [
  { key: 1, icon: { kind: 'lucide', Icon: Frown },      label: 'سيء جداً' },
  { key: 2, icon: { kind: 'lucide', Icon: Meh },        label: 'سيء' },
  { key: 3, icon: { kind: 'lucide', Icon: Smile },      label: 'عادي' },
  { key: 4, icon: { kind: 'lucide', Icon: Laugh },      label: 'جيد' },
  { key: 5, icon: { kind: 'lucide', Icon: PartyPopper },label: 'ممتاز' },
];

const STATS_TABS = [
  { key: 'evaluation', label: 'التقييم' },
  { key: 'timeline',   label: 'إنجازاتي' },
] as const;

const PERIOD_OPTIONS: { key: PeriodDays; label: string }[] = [
  { key: 30, label: 'آخر شهر' },
  { key: 60, label: 'آخر شهرين' },
  { key: 90, label: 'آخر ٣ شهور' },
];

// Chart geometry — responsive to screen width
const SCREEN_W    = Dimensions.get('window').width;
const Y_AXIS_W    = 22;                              // width reserved for Y-axis labels
const CHART_H     = 170;
const CHART_PX    = 16;
const CHART_PY    = 22;
const CHART_SVG_W = Math.max(200, SCREEN_W - 76 - Y_AXIS_W); // 76 = scrollview+card padding

// Arabic month abbreviations for X-axis dates
const MONTHS_SHORT = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر',
];

// Health score colour + label mapping (1=worst … 5=best)
const SCORE_COLORS: Record<number, string> = {
  1: '#fb7185', // rose   — سيء جداً
  2: '#fb923c', // orange — سيء
  3: '#f59e0b', // gold   — عادي
  4: '#34D399', // emerald — جيد
  5: '#10B981', // emerald dark — ممتاز
};

const SCORE_LABELS: Record<number, string> = {
  1: 'سيء جداً',
  2: 'سيء',
  3: 'عادي',
  4: 'جيد',
  5: 'ممتاز',
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatArabicDate(isoDate: string) {
  const date = new Date(isoDate);
  try {
    return date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  } catch { return isoDate; }
}

function shortDate(isoDate: string): string {
  const d = new Date(isoDate);
  return `${toArabicNumerals(d.getDate())} ${MONTHS_SHORT[d.getMonth()].slice(0, 3)}`;
}

// ─── PeriodFilter ──────────────────────────────────────────────────────────

function PeriodFilter({
  value,
  onChange,
}: {
  value: PeriodDays;
  onChange: (v: PeriodDays) => void;
}) {
  const { rowDir } = useRTL();
  return (
    <View className="flex-row gap-2" style={{ flexDirection: rowDir }}>
      {PERIOD_OPTIONS.map(({ key, label }) => {
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className={`flex-1 items-center rounded-full py-[7px] ${
              active ? 'bg-app-primary' : 'border border-app-lineSoft bg-app-surface'
            }`}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <AppText
              variant={active ? 'bold' : 'regular'}
              className={`text-center text-[11px] ${active ? 'text-white' : 'text-app-textSoft'}`}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── HealthTimelineChart ───────────────────────────────────────────────────

function HealthTimelineChart({ ratings }: { ratings: UserRating[] }) {
  const theme       = useTheme();
  const { isRTL, rowDir } = useRTL();

  const yFor = (v: number) =>
    CHART_H - CHART_PY - ((Math.max(1, Math.min(5, v)) - 1) / 4) * (CHART_H - CHART_PY * 2);

  // Center single point; spread multiple evenly
  const xFor = (idx: number) =>
    ratings.length === 1
      ? CHART_SVG_W / 2
      : CHART_PX + idx * (CHART_SVG_W - CHART_PX * 2) / (ratings.length - 1);

  const pathD = useMemo(() => {
    if (ratings.length < 2) return '';
    const step = (CHART_SVG_W - CHART_PX * 2) / (ratings.length - 1);
    return ratings
      .map((r, i) => `${i === 0 ? 'M' : 'L'} ${CHART_PX + i * step} ${yFor(r.health_score)}`)
      .join(' ');
  }, [ratings]);

  // Y-axis label column
  const YAxisLabels = () => (
    <View
      style={{
        width: Y_AXIS_W,
        height: CHART_H,
        justifyContent: 'space-between',
        paddingTop: CHART_PY,
        paddingBottom: CHART_PY,
      }}
    >
      {[5, 4, 3, 2, 1].map((v) => (
        <AppText
          key={v}
          style={{
            fontSize: 9,
            color: '#94a3b8',
            textAlign: isRTL ? 'left' : 'right',
          }}
        >
          {toArabicNumerals(v)}
        </AppText>
      ))}
    </View>
  );

  return (
    <View className="mt-3 overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
      <AppText variant="bold" className="text-[14px] leading-6 text-app-navy">
        مسار التحسن الصحي بشكل عام
      </AppText>

      {ratings.length === 0 ? (
        <AppText className="mt-3 text-[12px] leading-5 text-app-textSoft">
          لا توجد تقييمات مسجّلة في هذه الفترة.
        </AppText>
      ) : (
        <>
          {/* Chart + Y-axis */}
          <View className="mt-3 flex-row items-start">
            {!isRTL && <YAxisLabels />}

            <View>
              <Svg width={CHART_SVG_W} height={CHART_H}>
                {/* Gridlines */}
                {Array.from({ length: 5 }).map((_, idx) => {
                  const y = CHART_PY + (idx / 4) * (CHART_H - CHART_PY * 2);
                  return (
                    <Line
                      key={idx}
                      x1={CHART_PX} y1={y}
                      x2={CHART_SVG_W - CHART_PX} y2={y}
                      stroke={theme.colors.outlineVariant}
                      strokeWidth={1}
                    />
                  );
                })}

                {/* Line */}
                {pathD ? (
                  <Path
                    d={pathD}
                    stroke={theme.colors.primary}
                    strokeWidth={2.5}
                    fill="none"
                  />
                ) : null}

                {/* Dots + score labels — each coloured by its score value */}
                {ratings.map((r, i) => {
                  const cx    = xFor(i);
                  const cy    = yFor(r.health_score);
                  const color = SCORE_COLORS[r.health_score] ?? theme.colors.primary;
                  return (
                    <React.Fragment key={i}>
                      <SvgText
                        x={cx}
                        y={cy - 9}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight="bold"
                        fill={color}
                      >
                        {String(r.health_score)}
                      </SvgText>
                      <Circle cx={cx} cy={cy} r={5} fill={color} />
                    </React.Fragment>
                  );
                })}
              </Svg>

              {/* X-axis date labels */}
              <View style={{ height: 18, position: 'relative' }}>
                {ratings.map((r, i) => {
                  // Skip dense labels: always show first/last, sample middle
                  const step = Math.max(1, Math.ceil((ratings.length - 1) / 4));
                  if (i !== 0 && i !== ratings.length - 1 && i % step !== 0) return null;
                  const labelW = 40;
                  return (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        left: xFor(i) - labelW / 2,
                        top: 2,
                        width: labelW,
                      }}
                    >
                      <AppText className="text-center text-[9px] text-app-textSoft">
                        {shortDate(r.submitted_at)}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </View>

            {isRTL && <YAxisLabels />}
          </View>

          {/* Score legend — coloured circles matching the dots */}
          <View
            className="mt-3 flex-row flex-wrap gap-x-3 gap-y-1.5"
            style={{ flexDirection: rowDir }}
          >
            {([1, 2, 3, 4, 5] as const).map((s) => (
              <View key={s} className="flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
                <View
                  style={{
                    width: 9, height: 9, borderRadius: 5,
                    backgroundColor: SCORE_COLORS[s],
                  }}
                />
                <AppText className="text-[10px] text-app-textSoft">
                  ({toArabicNumerals(s)}) {SCORE_LABELS[s]}
                </AppText>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function StatsScreen() {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const { i18n } = useTranslation();
  const { force, initialTab } = useLocalSearchParams<{ force?: ForceMode; initialTab?: string }>();
  const isEnglish = i18n.language?.startsWith('en');
  const user = useUserStore((s) => s.user);

  const ratings           = useUserRatingStore((s) => s.ratings);
  const pendingRating     = useUserRatingStore((s) => s.pendingRating);
  const isLoading         = useUserRatingStore((s) => s.isLoading);
  const errorMessage      = useUserRatingStore((s) => s.errorMessage);
  const initializeRatings = useUserRatingStore((s) => s.initializeRatings);
  const submitRating      = useUserRatingStore((s) => s.submitRating);

  const userMeals           = useUserMealsStore((s) => s.userMeals);
  const initializeUserMeals = useUserMealsStore((s) => s.initializeUserMeals);

  const goals      = useHealthGoalsStore((s) => s.goals);
  const fetchGoals = useHealthGoalsStore((s) => s.fetchGoals);

  const resolvedInitialTab = Array.isArray(initialTab) ? initialTab[0] : initialTab;
  const initialTabKey: 'evaluation' | 'timeline' | undefined =
    resolvedInitialTab === 'timeline'
      ? 'timeline'
      : resolvedInitialTab === 'evaluation'
        ? 'evaluation'
        : undefined;

  const [activeTab, setActiveTab]   = useState<'evaluation' | 'timeline'>(initialTabKey ?? 'evaluation');
  const [dayFilter, setDayFilter]   = useState<PeriodDays>(30);
  const [localError, setLocalError] = useState('');
  const [successKey, setSuccessKey] = useState(0);

  const dueDate = useMemo(() => {
    if (ratings.length > 0) return nextRatingDate(ratings);
    if (user?.plan_start_date) {
      const dt = new Date(user.plan_start_date.slice(0, 10));
      dt.setDate(dt.getDate() + 7);
      return dt.toISOString().slice(0, 10);
    }
    if (user?.next_rating_date) return user.next_rating_date;
    return localDateISO();
  }, [ratings, user?.next_rating_date, user?.plan_start_date]);

  const daysUntilDue = useMemo(() => {
    const today = localDateISO();
    return Math.floor(
      (new Date(dueDate).getTime() - new Date(today).getTime()) / 86_400_000,
    );
  }, [dueDate]);

  const ratingBlocked    = !user?.plan_start_date || !user?.profile_completed;
  const effectivePending = force === 'pending' ? true : force === 'locked' ? false : pendingRating;
  const canSubmit        = !ratingBlocked && effectivePending;

  const filteredRatings = useMemo(
    () => toHealthTimelineInDays(ratings, dayFilter),
    [ratings, dayFilter],
  );

  const didApplyInitialTab = useRef(false);
  const sheetEntrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (didApplyInitialTab.current) return;
    if (initialTabKey) setActiveTab(initialTabKey);
    didApplyInitialTab.current = true;
  }, [initialTabKey]);

  useEffect(() => { initializeRatings(); },      [initializeRatings]);
  useEffect(() => { initializeUserMeals(); },    [initializeUserMeals]);
  useEffect(() => {
    if (goals.length === 0) fetchGoals();
  }, [fetchGoals, goals.length]);

  useEffect(() => {
    sheetEntrance.setValue(0);
    Animated.timing(sheetEntrance, { toValue: 1, duration: 550, useNativeDriver: true }).start();
  }, [sheetEntrance, activeTab, successKey]);

  const sheetAnimatedStyle = {
    opacity: sheetEntrance,
    transform: [
      { translateY: sheetEntrance.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) },
    ],
  };

  const improvementOptions: OptionItem<number>[] = useMemo(
    () =>
      goals.filter((g) => g.active).map((g) => ({
        key: g.id,
        label: isEnglish && g.name_en ? g.name_en : g.name,
        icon: { kind: 'image' as const, name: g.image ?? 'dish', tint: false },
      })),
    [goals, isEnglish],
  );

  const form = useForm<EvaluationFormValues>({
    defaultValues: { health_score: null, improvements: [] },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setLocalError('');
    if (!canSubmit) { setLocalError('التقييم غير متاح الآن'); return; }

    form.clearErrors(['health_score', 'improvements']);
    const missingHealthScore  = values.health_score === null;
    const missingImprovements = values.improvements.length === 0;
    if (missingHealthScore || missingImprovements) {
      if (missingHealthScore)
        form.setError('health_score', { type: 'manual', message: 'اختر تقييم الحالة الصحية' });
      if (missingImprovements)
        form.setError('improvements', { type: 'manual', message: 'اختر تحسناً واحداً على الأقل' });
      setLocalError('يرجى إكمال الحقول المطلوبة');
      return;
    }

    const parsed = evaluationSchema.safeParse(values);
    if (!parsed.success) { setLocalError('يرجى إكمال الحقول المطلوبة'); return; }

    const ok = await submitRating({
      period_start: localDateISO(),
      health_score: parsed.data.health_score,
      improvement_goals_codes: parsed.data.improvements.join(','),
    });

    if (!ok) { setLocalError(errorMessage || 'تعذّر إرسال التقييم'); return; }
    form.reset();
    setSuccessKey((k) => k + 1);
  });

  return (
    <View className="flex-1 bg-app-background">
      {/* ── Header ──────────────────────────────────────────── */}
      <View className="px-[22px]" style={{ paddingTop: insets.top + 10 }}>
        <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
          <Pressable
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full border border-app-line bg-app-surface"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            {isRTL
              ? <ChevronRight size={24} color={theme.colors.onSurface} />
              : <ChevronLeft  size={24} color={theme.colors.onSurface} />}
          </Pressable>
          <AppText variant="bold" className="text-[17px] text-app-navy">
            تقييم الطيبات
          </AppText>
          <View className="w-11" />
        </View>

        <View className="mt-4">
          <GradientTabs options={STATS_TABS} value={activeTab} onChange={setActiveTab} />
        </View>
      </View>

      <Animated.View className="flex-1" style={sheetAnimatedStyle}>
        {activeTab === 'evaluation' ? (
          /* ── Evaluation Tab ───────────────────────────────── */
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 22, paddingTop: 18, paddingBottom: insets.bottom + 96,
            }}
          >
            {/* Period info card */}
            <View className="rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
              <View
                className="flex-row items-center justify-between"
                style={{ flexDirection: rowDir }}
              >
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
                <AppText className="mt-2 text-[11px] leading-5 text-app-textSoft">
                  {ratingBlocked
                    ? 'أكمل ملفك الشخصي أولاً لتفعيل التقييم الأسبوعي'
                    : `${daysUntilDue > 0 ? `متاح بعد ${toArabicNumerals(daysUntilDue)} أيام - ` : ''}قم بالالتزام بتسجيل وجباتك يومياً حتى تستطيع التقييم بالموعد القادم`}
                </AppText>
              ) : (
                <AppText className="mt-2 text-[12.5px] leading-6 text-app-textSoft">
                  اختر تقييمك ثم أرسل التقييم
                </AppText>
              )}
            </View>

            <View
              style={{ opacity: canSubmit ? 1 : 0.4 }}
              pointerEvents={canSubmit ? 'auto' : 'none'}
            >
              {/* Health score selector */}
              <View className="mt-5">
                <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                  الحالة الصحية العامة
                </AppText>
                <Controller
                  control={form.control}
                  name="health_score"
                  render={({ field }) => (
                    <OptionSelector
                      mode="single"
                      layout="iconTop"
                      variant="soft"
                      options={SCORE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={!canSubmit}
                      wrapperClassName="mt-2 flex-row gap-2"
                      itemClassName="flex-1"
                    />
                  )}
                />
                {form.formState.errors.health_score?.message ? (
                  <AppText className="mt-2 text-center text-[12px] leading-5 text-red-500">
                    * {form.formState.errors.health_score.message}
                  </AppText>
                ) : null}
              </View>

              {/* Improvements selector */}
              {improvementOptions.length > 0 && (
                <View className="mt-6">
                  <AppText variant="bold" className="text-[13px] leading-6 text-app-navy">
                    التحسينات الملحوظة
                  </AppText>
                  <AppText className="mb-3 mt-0.5 text-[12px] leading-5 text-app-textSoft">
                    ما الذي تحسّن هذا الأسبوع؟
                  </AppText>
                  <Controller
                    control={form.control}
                    name="improvements"
                    render={({ field }) => (
                      <OptionSelector
                        mode="multiple"
                        layout="iconStart"
                        variant="soft"
                        options={improvementOptions}
                        value={field.value}
                        onChange={field.onChange}
                        disabled={!canSubmit}
                        wrapperClassName="flex-row flex-wrap justify-between gap-y-3"
                        itemClassName="w-[48%]"
                      />
                    )}
                  />
                  {form.formState.errors.improvements?.message ? (
                    <AppText className="mt-2 text-center text-[12px] leading-5 text-red-500">
                      * {form.formState.errors.improvements.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            </View>

            <View className="mt-6">
              <PrimaryButton
                title="أرسل التقييم"
                onPress={handleSubmit}
                disabled={!canSubmit || isLoading}
                loading={isLoading}
              />
              {localError || errorMessage ? (
                <AppText className="mt-2 text-center text-[12.5px] leading-5 text-red-500">
                  * {localError || errorMessage}
                </AppText>
              ) : null}
              {successKey > 0 && !localError && !errorMessage ? (
                <View className="mt-3 items-center">
                  <AppText variant="bold" className="text-[13px] text-app-primary">
                    تم إرسال التقييم بنجاح ✓
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
          /* ── Achievements / Timeline Tab ──────────────────── */
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 22,
              paddingTop: 10,
              paddingBottom: insets.bottom + 96,
            }}
          >
            {/* Monthly commitment calendar — has its own prev/next month navigation */}
            <CommitmentCalendar
              userMeals={userMeals}
              planStartDate={user?.plan_start_date}
            />

            {/* Health improvement chart — period filter lives directly above it */}
            <View className="mt-5">
              <AppText variant="bold" className="mb-2 text-[13px] text-app-navy">
                مسار التحسن الصحي
              </AppText>
              <PeriodFilter value={dayFilter} onChange={setDayFilter} />
            </View>
            <HealthTimelineChart ratings={filteredRatings} />
          </ScrollView>
        )}
      </Animated.View>

      <View className="absolute bottom-0 left-0 right-0">
        <AppTabBar active="home" />
      </View>
    </View>
  );
}
