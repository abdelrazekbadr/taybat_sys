import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import type { HungryState, UserMeal } from '@/types';
import { HUNGRY_STATE_META } from '@/utils/hungerUtils';
import { localDateISO } from '@/utils/dateUtils';
import { toArabicNumerals } from '@/utils/zoneUtils';

// ─── Constants ─────────────────────────────────────────────────────────────

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

// Saturday-first column order (Sat→Fri), matches Arabic calendar convention
const WEEK_DAYS_AR = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const COMMIT_GREEN = '#34D399';
const COMMIT_RED   = '#fb7185';
const COMMIT_GREY  = '#cbd5e1';

const SCREEN_W  = Dimensions.get('window').width;
const CELL_GAP  = 4;
// available width = screen − (scrollview h-padding 22×2) − (card p-4 16×2) − (6 gaps)
const CELL_SIZE = Math.floor((SCREEN_W - 44 - 32 - CELL_GAP * 6) / 7);

// ─── Types ─────────────────────────────────────────────────────────────────

type DayCell = {
  day: number;
  date: string;
  hasLog: boolean;
  avgHunger: HungryState | null;  // rounded average of hungry_state across meals that day
  isFuture: boolean;
  isBefore: boolean;               // before the user's plan_start_date
  isToday: boolean;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

function satFirstOffset(isoDate: string): number {
  // getDay(): 0=Sun … 6=Sat → Sat=col0, Sun=col1, … Fri=col6
  return (new Date(isoDate).getDay() + 1) % 7;
}

type DayMealData = { hasLog: boolean; avgHunger: HungryState | null };

function buildMonthGrid(
  mealDataByDate: Map<string, DayMealData>,
  planStart: string | null,
  year: number,
  month: number,
) {
  const today       = localDateISO();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: DayCell[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const iso  = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const data = mealDataByDate.get(iso);
    days.push({
      day:      d,
      date:     iso,
      hasLog:   data?.hasLog ?? false,
      avgHunger: data?.avgHunger ?? null,
      isFuture: iso > today,
      isBefore: planStart ? iso < planStart : false,
      isToday:  iso === today,
    });
  }

  // Saturday-first offset + trailing fill to complete last row
  const offset = satFirstOffset(days[0].date);
  const padded: (DayCell | null)[] = [...Array<null>(offset).fill(null), ...days];
  const rem = padded.length % 7;
  if (rem !== 0) padded.push(...Array<null>(7 - rem).fill(null));

  const rows: (DayCell | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) rows.push(padded.slice(i, i + 7));

  // Stats: only count days within the plan and already passed
  const countable = days.filter((d) => !d.isFuture && !d.isBefore);
  const active    = countable.filter((d) => d.hasLog).length;
  const pct       = countable.length > 0 ? Math.round((active / countable.length) * 100) : 0;

  return { rows, activeDays: active, totalDays: countable.length, pct };
}

// ─── Component ─────────────────────────────────────────────────────────────

interface CommitmentCalendarProps {
  userMeals: UserMeal[];
  planStartDate?: string | null;
}

export function CommitmentCalendar({ userMeals, planStartDate }: CommitmentCalendarProps) {
  const theme           = useTheme();
  const { isRTL, rowDir } = useRTL();

  // Anchor min/max month boundaries once per render
  const _now     = new Date();
  const maxYear  = _now.getFullYear();
  const maxMonth = _now.getMonth();
  // Allow up to 3 months back (current month + 2 previous)
  const minDate  = new Date(_now.getFullYear(), _now.getMonth() - 2, 1);
  const minYear  = minDate.getFullYear();
  const minMonth = minDate.getMonth();

  const [year,  setYear]  = useState(maxYear);
  const [month, setMonth] = useState(maxMonth);

  const isAtMin = year < minYear || (year === minYear && month <= minMonth);
  const isAtMax = year > maxYear || (year === maxYear && month >= maxMonth);

  const goToPrev = () => {
    if (isAtMin) return;
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };

  const goToNext = () => {
    if (isAtMax) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };

  // mealDataByDate rebuilds only when userMeals change (not on month navigation)
  const mealDataByDate = useMemo((): Map<string, DayMealData> => {
    const acc = new Map<string, { hungerSum: number; hungerCount: number }>();
    userMeals.forEach((m) => {
      const d = m.date.slice(0, 10);
      const existing = acc.get(d) ?? { hungerSum: 0, hungerCount: 0 };
      if (m.hungry_state != null) {
        existing.hungerSum   += m.hungry_state;
        existing.hungerCount += 1;
      }
      acc.set(d, existing);
    });
    const result = new Map<string, DayMealData>();
    acc.forEach((v, k) => {
      const avg = v.hungerCount > 0
        ? (Math.round(v.hungerSum / v.hungerCount) as HungryState)
        : null;
      result.set(k, { hasLog: true, avgHunger: avg });
    });
    return result;
  }, [userMeals]);

  const planStart = useMemo(
    () => planStartDate?.slice(0, 10) ?? null,
    [planStartDate],
  );

  const { rows, activeDays, totalDays, pct } = useMemo(
    () => buildMonthGrid(mealDataByDate, planStart, year, month),
    [mealDataByDate, planStart, year, month],
  );

  return (
    <View className="rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
      {/* ── Month navigation ─────────────────────────────── */}
      <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
        {/* Prev — index 0 → rightmost in RTL (past direction) */}
        <Pressable
          onPress={goToPrev}
          disabled={isAtMin}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-app-surfaceAlt"
          style={({ pressed }) => [{ opacity: isAtMin ? 0.25 : pressed ? 0.6 : 1 }]}
        >
          {isRTL
            ? <ChevronRight size={18} color={theme.colors.onSurface} />
            : <ChevronLeft  size={18} color={theme.colors.onSurface} />}
        </Pressable>

        <AppText variant="bold" className="text-[14px] text-app-navy">
          {ARABIC_MONTHS[month]} {toArabicNumerals(year)}
        </AppText>

        {/* Next — index 2 → leftmost in RTL (future direction) */}
        <Pressable
          onPress={goToNext}
          disabled={isAtMax}
          hitSlop={8}
          className="h-8 w-8 items-center justify-center rounded-full bg-app-surfaceAlt"
          style={({ pressed }) => [{ opacity: isAtMax ? 0.25 : pressed ? 0.6 : 1 }]}
        >
          {isRTL
            ? <ChevronLeft  size={18} color={theme.colors.onSurface} />
            : <ChevronRight size={18} color={theme.colors.onSurface} />}
        </Pressable>
      </View>

      {/* ── Month commitment stats ────────────────────────── */}
      {totalDays > 0 && (
        <View className="mt-3 flex-row items-center gap-3" style={{ flexDirection: rowDir }}>
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          >
            <AppText variant="bold" className="text-[15px] text-app-primary">
              {toArabicNumerals(pct)}٪
            </AppText>
          </View>
          <View className="flex-1">
            <AppText className="text-[12.5px] leading-5 text-app-text">
              {toArabicNumerals(activeDays)} من {toArabicNumerals(totalDays)} يوم ملتزم
            </AppText>
            <View className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-app-surfaceAlt">
              <View
                className="h-full rounded-full bg-app-primary"
                style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
              />
            </View>
          </View>
        </View>
      )}

      {/* ── Day-of-week headers ───────────────────────────── */}
      {/* flexDirection: rowDir ensures Sat (index 0) is on the right in RTL */}
      <View className="mt-3 flex-row" style={{ flexDirection: rowDir, gap: CELL_GAP }}>
        {WEEK_DAYS_AR.map((d) => (
          <AppText
            key={d}
            variant="bold"
            className="text-center text-[10px] text-app-textSoft"
            style={{ width: CELL_SIZE }}
          >
            {d}
          </AppText>
        ))}
      </View>

      {/* ── Calendar grid ────────────────────────────────── */}
      <View className="mt-1" style={{ gap: CELL_GAP }}>
        {rows.map((row, rIdx) => (
          <View key={rIdx} className="flex-row" style={{ flexDirection: rowDir, gap: CELL_GAP }}>
            {row.map((cell, cIdx) => {
              if (!cell) {
                return (
                  <View
                    key={`pad-${rIdx}-${cIdx}`}
                    style={{ width: CELL_SIZE, height: CELL_SIZE }}
                  />
                );
              }

              const isNA = cell.isBefore || cell.isFuture;
              const bg   = isNA ? COMMIT_GREY : cell.hasLog ? COMMIT_GREEN : COMMIT_RED;

              return (
                <View
                  key={cell.date}
                  style={{
                    width:           CELL_SIZE,
                    height:          CELL_SIZE,
                    borderRadius:    6,
                    backgroundColor: bg,
                    borderWidth:     cell.isToday ? 2 : 0,
                    borderColor:     theme.colors.primary,
                    alignItems:      'center',
                    justifyContent:  'center',
                    overflow:        'hidden',
                    opacity:         isNA ? 0.28 : 1,
                  }}
                >
                  <AppText
                    variant={cell.isToday ? 'bold' : 'regular'}
                    style={{
                      fontSize:   CELL_SIZE < 34 ? 8 : 10,
                      color:      isNA ? '#475569' : '#ffffff',
                      lineHeight: CELL_SIZE < 34 ? 10 : 13,
                    }}
                  >
                    {toArabicNumerals(cell.day)}
                  </AppText>
                  {/* Hunger strip — bottom 3 px, only on committed non-NA days */}
                  {!isNA && cell.hasLog && cell.avgHunger !== null && (
                    <View
                      style={{
                        position:               'absolute',
                        bottom:                 0,
                        left:                   0,
                        right:                  0,
                        height:                 3,
                        backgroundColor:        HUNGRY_STATE_META[cell.avgHunger].color,
                        borderBottomLeftRadius: 5,
                        borderBottomRightRadius: 5,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Commitment legend ────────────────────────────── */}
      <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1" style={{ flexDirection: rowDir }}>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: COMMIT_GREEN }} />
          <AppText className="text-[11px] text-app-textSoft">ملتزم</AppText>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: COMMIT_RED }} />
          <AppText className="text-[11px] text-app-textSoft">غير ملتزم</AppText>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View
            style={{
              width: 11, height: 11, borderRadius: 3,
              backgroundColor: COMMIT_GREY, opacity: 0.28,
            }}
          />
          <AppText className="text-[11px] text-app-textSoft">غير متاح</AppText>
        </View>
      </View>

      {/* ── Hunger strip legend ───────────────────────────── */}
      <View className="mt-2.5 flex-row flex-wrap gap-x-3 gap-y-1" style={{ flexDirection: rowDir }}>
        {([1, 2, 3, 4] as HungryState[]).map((s) => {
          const meta = HUNGRY_STATE_META[s];
          return (
            <View key={s} className="flex-row items-center gap-1" style={{ flexDirection: rowDir }}>
              <View
                style={{
                  width: 18, height: 3, borderRadius: 2,
                  backgroundColor: meta.color,
                }}
              />
              <AppText className="text-[10px] text-app-textSoft">{meta.label}</AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}
