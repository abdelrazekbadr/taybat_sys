import { toArabicNumerals } from './zoneUtils';

export function toRelativeArabicTime(iso: string): string {
  const from = new Date(iso).getTime();
  const now = Date.now();
  if (!Number.isFinite(from)) return '';
  const diffMs = Math.max(0, now - from);
  const minutes = Math.floor(diffMs / (60 * 1000));
  if (minutes < 60) {
    const v = Math.max(1, minutes);
    return `منذ ${toArabicNumerals(v)} دقيقة`;
  }

  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 24) {
    return `منذ ${toArabicNumerals(hours)} ساعة`;
  }

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days < 7) {
    return `منذ ${toArabicNumerals(days)} يوم`;
  }

  const weeks = Math.floor(days / 7);
  return `منذ ${toArabicNumerals(weeks)} أسبوع`;
}

