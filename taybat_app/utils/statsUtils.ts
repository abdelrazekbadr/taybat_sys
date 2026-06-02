import type { UserMeal, WeeklyRating } from '@/types';

export const daysOnPlan = (planStartDate: string | null | undefined): number => {
  if (!planStartDate) return 0;
  // Compare calendar dates only (strip time) so the first day is always Day 1
  const startDate = planStartDate.slice(0, 10);
  const todayDate = new Date().toISOString().slice(0, 10);
  const diffMs = new Date(todayDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.floor(diffMs / 86_400_000) + 1);
};

export const currentStreak = (userMeals: UserMeal[]): number => {
  const mealDates = new Set(userMeals.map((m) => m.date));
  let streak = 0;
  const cursor = new Date();
  while (mealDates.has(cursor.toISOString().slice(0, 10))) {
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

export const nextRatingDate = (ratings: WeeklyRating[]): string => {
  if (!ratings.length) return new Date().toISOString().slice(0, 10);
  const last = ratings.reduce((latest, r) =>
    new Date(r.submitted_at).getTime() > new Date(latest.submitted_at).getTime() ? r : latest,
  );
  return addDaysISO(last.submitted_at, 7);
};

export const daysUntilNextRating = (ratings: WeeklyRating[]): number => {
  const due = nextRatingDate(ratings);
  const today = new Date().toISOString().slice(0, 10);
  return daysBetweenISO(today, due);
};

export type WeeklyChartPoint = {
  value: number;
  value2: number;
  label: string;
};

export const toWeeklyChartData = (ratings: WeeklyRating[], weeks: number): WeeklyChartPoint[] => {
  if (weeks <= 0) return [];
  const byStart = new Map(ratings.map((r) => [r.period_start, r]));
  const lastStart =
    ratings.length > 0
      ? ratings.reduce((latest, r) =>
          new Date(r.period_start).getTime() > new Date(latest.period_start).getTime() ? r : latest,
        ).period_start
      : new Date().toISOString().slice(0, 10);

  const points: WeeklyChartPoint[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = addDaysISO(lastStart, -7 * i);
    const r = byStart.get(start);
    points.push({
      value: r ? r.health_score : 0,
      value2: r ? r.adherence_score : 0,
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

export const toMonthlyChartData = (ratings: WeeklyRating[], year: number): MonthlyChartPoint[] => {
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
