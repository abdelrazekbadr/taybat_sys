import type { UserMeal, UserRating, ZoneColor } from '@/types';
import { localDateISO } from './dateUtils';

export const daysOnPlan = (planStartDate: string | null | undefined): number => {
  if (!planStartDate) return 0;
  const startDate = planStartDate.slice(0, 10);
  const todayDate = localDateISO();
  const diffMs = new Date(todayDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
};

export const currentStreak = (userMeals: UserMeal[]): number => {
  const mealDates = new Set(userMeals.map((m) => m.date));
  let streak = 0;
  const cursor = new Date();
  while (mealDates.has(localDateISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

export const greenMealsToday = (todayMeals: UserMeal[]): number =>
  todayMeals.filter((m) => m.zone_summary === 1).length;

export const formatArabicTime = (isoDatetime: string): string => {
  const date = new Date(isoDatetime);
  const h = date.getHours();
  const m = date.getMinutes();
  const isAM = h < 12;
  const h12 = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  const digits = `${h12}:${pad(m)}`;
  const arabicDigits = digits.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
  return `${arabicDigits} ${isAM ? 'صباحاً' : 'مساءً'}`;
};

// Date arithmetic on existing ISO date strings — consistently UTC-midnight based,
// safe to keep as toISOString since inputs are pure "YYYY-MM-DD" strings.
const addDaysISO = (isoDatetime: string, days: number) => {
  const date = new Date(isoDatetime);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const daysBetweenISO = (fromISODate: string, toISODate: string) => {
  const from = new Date(fromISODate).getTime();
  const to = new Date(toISODate).getTime();
  return Math.floor((to - from) / 86_400_000);
};

export const nextRatingDate = (ratings: UserRating[]): string => {
  if (!ratings.length) return localDateISO();
  const last = ratings.reduce((latest, r) =>
    new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
  );
  return addDaysISO(last.submitted_at, 7);
};

export const daysUntilNextRating = (ratings: UserRating[]): number => {
  const due = nextRatingDate(ratings);
  const today = localDateISO();
  return daysBetweenISO(today, due);
};

export type WeeklyChartPoint = {
  value: number;
  value2: number;
  label: string;
};

export const toWeeklyChartData = (ratings: UserRating[], weeks: number): WeeklyChartPoint[] => {
  if (weeks <= 0) return [];
  const byStart = new Map(ratings.map((r) => [r.period_start, r]));
  const lastStart =
    ratings.length > 0
      ? ratings.reduce((latest, r) =>
          new Date(r.period_start).getTime() > new Date(latest.period_start).getTime() ? r : latest,
        ).period_start
      : localDateISO();

  const points: WeeklyChartPoint[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = addDaysISO(lastStart, -7 * i);
    const r = byStart.get(start);
    points.push({
      value: r ? r.health_score : 0,
      value2: 0,
      label: String(weeks - i),
    });
  }
  return points;
};

export type MonthlyChartPoint = {
  value: number;
  label: string;
  hasData: boolean;
};

// ─── Commitment helpers ────────────────────────────────────────────────────

export type DayStatus = {
  date: string;
  hasLog: boolean;
  dominantZone: ZoneColor | null;
};

export type CommitmentData = {
  pct: number;
  activeDays: number;
  totalDays: number;
  dailyStatus: DayStatus[];
};

export const toCommitmentData = (userMeals: UserMeal[], days: number): CommitmentData => {
  if (days <= 0) return { pct: 0, activeDays: 0, totalDays: 0, dailyStatus: [] };

  const zoneByDate = new Map<string, ZoneColor>();
  userMeals.forEach((m) => {
    const d = m.date.slice(0, 10);
    const prev = zoneByDate.get(d);
    if (!prev || m.zone_summary > prev) zoneByDate.set(d, m.zone_summary);
  });

  const today = new Date();
  const dailyStatus: DayStatus[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dt = new Date(today);
    dt.setDate(today.getDate() - i);
    const iso = localDateISO(dt);
    const zone = zoneByDate.get(iso) ?? null;
    dailyStatus.push({ date: iso, hasLog: zone !== null, dominantZone: zone });
  }

  const activeDays = dailyStatus.filter((s) => s.hasLog).length;
  return {
    pct: Math.round((activeDays / days) * 100),
    activeDays,
    totalDays: days,
    dailyStatus,
  };
};

export const toHealthTimelineInDays = (ratings: UserRating[], days: number): UserRating[] => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days + 1);
  const cutoffIso = localDateISO(cutoff);
  return [...ratings]
    .filter((r) => r.submitted_at.slice(0, 10) >= cutoffIso)
    .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
};

// ─── Monthly chart (kept for legacy use) ──────────────────────────────────

export const toMonthlyChartData = (ratings: UserRating[], year: number): MonthlyChartPoint[] => {
  const buckets: { sum: number; count: number }[] = Array.from({ length: 12 }, () => ({ sum: 0, count: 0 }));
  ratings.forEach((r) => {
    const d = new Date(r.submitted_at);
    if (d.getFullYear() !== year) return;
    const m = d.getMonth();
    buckets[m].sum += r.health_score;
    buckets[m].count += 1;
  });

  return buckets.map((b, idx) => {
    const avg = b.count ? b.sum / b.count : 0;
    return { value: avg, label: String(idx + 1), hasData: b.count > 0 };
  });
};
