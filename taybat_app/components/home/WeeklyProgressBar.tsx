import { CalendarDays } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import type { UserMeal } from '@/types';
import { addDaysToISODate, localDateISO } from '@/utils/dateUtils';

const AR_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

function toArabicDigits(n: number) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
}

// Reads the day/month directly from the "YYYY-MM-DD" string components —
// no Date object involved, so there's no UTC/local timezone ambiguity to
// get wrong for a pure display label.
function formatDateAr(iso: string) {
  const [, m, d] = iso.split('-').map(Number);
  return `${toArabicDigits(d)} ${AR_MONTHS[m - 1]}`;
}

/**
 * Returns the ISO date of the start of the current 7-day cycle based on plan
 * start. `daysDiff` is a pure UTC-vs-UTC difference between two date-only
 * strings (safe — no local-time mutation involved), but the cycle start
 * itself must be reconstructed via addDaysToISODate to stay DST-safe.
 */
function getCycleStartISO(planStartISO: string, todayISO: string): string {
  const start = new Date(planStartISO).getTime();
  const today = new Date(todayISO).getTime();
  const daysDiff = Math.floor((today - start) / 86_400_000);
  const cycleIndex = Math.floor(daysDiff / 7);
  return addDaysToISODate(planStartISO, cycleIndex * 7);
}

type DayStatus = 'done' | 'missed' | 'future' | 'today';

interface Segment {
  status: DayStatus;
  dayNumber: number;
}

interface WeeklyProgressBarProps {
  userMeals: UserMeal[];
  planStartDate: string | null;
  onPress?: () => void;
}

function buildSegments(
  mealDateSet: Set<string>,
  todayISO: string,
  planStartISO: string | null,
): { segments: Segment[]; cycleStartISO: string; cycleEndISO: string } {
  // No plan started yet — all dashes gray, no commitment calculated
  if (!planStartISO) {
    const cycleStartISO = addDaysToISODate(todayISO, -6);
    const segments = Array.from({ length: 7 }, (_, i) => {
      const iso = addDaysToISODate(cycleStartISO, i);
      return {
        status: 'future' as DayStatus,
        dayNumber: Number(iso.slice(8, 10)),
      };
    });
    return { segments, cycleStartISO, cycleEndISO: todayISO };
  }

  const cycleStartISO = getCycleStartISO(planStartISO, todayISO);
  const cycleEndISO = addDaysToISODate(cycleStartISO, 6);

  const segments = Array.from({ length: 7 }, (_, i) => {
    const iso = addDaysToISODate(cycleStartISO, i);

    let status: DayStatus;
    if (iso > todayISO) {
      status = 'future'; // not reached yet → grey
    } else if (mealDateSet.has(iso)) {
      status = 'done'; // meal logged → green
    } else if (iso < todayISO) {
      status = 'missed'; // past day, no meal → red
    } else {
      status = 'today'; // today, no meal yet → grey
    }

    return { status, dayNumber: Number(iso.slice(8, 10)) };
  });

  return { segments, cycleStartISO, cycleEndISO };
}

export function WeeklyProgressBar({
  userMeals,
  planStartDate,
  onPress,
}: WeeklyProgressBarProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const isLTR = rowDir === 'row';

  const todayISO = localDateISO();
  const planStartISO = planStartDate?.slice(0, 10) ?? null;

  const mealDateSet = React.useMemo(
    () => new Set(userMeals.map((m) => m.date)),
    [userMeals],
  );

  const { segments, cycleStartISO, cycleEndISO } = React.useMemo(
    () => buildSegments(mealDateSet, todayISO, planStartISO),
    [mealDateSet, todayISO, planStartISO],
  );

  const doneCount = segments.filter((s) => s.status === 'done').length;

  const barColor = (status: DayStatus) => {
    if (status === 'done') return '#10B981';
    if (status === 'missed') return '#FB7185';
    return theme.colors.surfaceVariant ?? '#E2E8F0';
  };

  const labelColor = (status: DayStatus) => {
    if (status === 'done') return '#10B981';
    if (status === 'missed') return '#FB7185';
    return theme.colors.onSurfaceVariant ?? '#94A3B8';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="rounded-[20px] border border-app-lineSoft bg-app-surface p-4"
      style={({ pressed }) => [{ opacity: onPress && pressed ? 0.85 : 1 }]}
    >
      {/* Header row */}
      <View
        className="items-center justify-between"
        style={{ flexDirection: rowDir }}
      >
        <View
          className="items-center gap-1.5"
          style={{ flexDirection: rowDir }}
        >
          <CalendarDays
            size={14}
            color={theme.colors.primary}
            strokeWidth={2}
          />
          <AppText
            variant="bold"
            className="text-app-textMuted gap-1.5  text-[13px]"
          >
            الالتزام الأسبوعي
          </AppText>
        </View>
        <AppText
          variant="bold"
          className="text-[12px]"
          style={{ color: theme.colors.primary }}
        >
          {toArabicDigits(doneCount)} / ٧
        </AppText>
      </View>

      {/* Cycle date range */}
      <AppText className="text-app-textMuted mb-3 mt-0.5 text-[11px] leading-5">
        {formatDateAr(cycleStartISO)} — {formatDateAr(cycleEndISO)}
      </AppText>

      {/* 7-segment bar + day numbers */}
      <View className="flex-row gap-0.5" style={{ flexDirection: rowDir }}>
        {segments.map(({ status, dayNumber }, i) => {
          // Round the outer end of the first and last dash to form pill ends
          const startCap = isLTR
            ? { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 }
            : { borderTopRightRadius: 999, borderBottomRightRadius: 999 };
          const endCap = isLTR
            ? { borderTopRightRadius: 999, borderBottomRightRadius: 999 }
            : { borderTopLeftRadius: 999, borderBottomLeftRadius: 999 };

          const capStyle = i === 0 ? startCap : i === 6 ? endCap : {};

          return (
            <View key={i} className="flex-1 items-center gap-1">
              <View
                className="h-[10px] w-full"
                style={{ backgroundColor: barColor(status), ...capStyle }}
              />
              <AppText
                className="text-[9px]"
                style={{ color: labelColor(status) }}
              >
                {toArabicDigits(dayNumber)}
              </AppText>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}
