import type { ZoneColor } from '@/types';

export interface ZoneMeta {
  color: string;
  softBg: string;
  emoji: string;
  label: string;
  stars: number;
}

const ZONE_META: Record<ZoneColor, ZoneMeta> = {
  1: { color: '#10B981', softBg: '#DCFCE7', emoji: '🟢', label: 'الأخضر', stars: 5 },
  2: { color: '#F5C24A', softBg: '#FFF4D6', emoji: '🟡', label: 'الأصفر', stars: 4 },
  3: { color: '#F08A4B', softBg: '#FFE4D2', emoji: '🟠', label: 'البرتقالي', stars: 3 },
  4: { color: '#9B7AC8', softBg: '#EDE9F7', emoji: '🟣', label: 'البنفسجي', stars: 2 },
  5: { color: '#E36A6A', softBg: '#FFE4E4', emoji: '🔴', label: 'الأحمر', stars: 1 },
};

export const getZoneMeta = (zone: ZoneColor): ZoneMeta => ZONE_META[zone] ?? ZONE_META[5];

export const computeDominantZone = (zones: ZoneColor[]): ZoneColor => {
  if (!zones.length) return 5;
  return (Math.max(...zones) as ZoneColor);
};

export const toArabicNumerals = (n: number): string =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
