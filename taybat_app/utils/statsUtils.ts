import type { UserMeal } from '@/types';

export const daysOnPlan = (planStartDate: string): number => {
  const start = new Date(planStartDate).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - start) / 86_400_000));
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
