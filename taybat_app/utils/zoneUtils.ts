import type { ZoneColor } from '@/types';
import { themeTokens } from '@/theme/tokens';

export interface ZoneMeta {
  color: string;
  softBg: string;
  emoji: string;
  label: string;
  stars: number;
}

const ZONE_META: Record<ZoneColor, ZoneMeta> = {
  1: { color: themeTokens.colors.brand.emerald, softBg: themeTokens.colors.brand.emeraldSoft, emoji: '🟢', label: 'الأخضر', stars: 5 },
  2: { color: themeTokens.colors.brand.gold, softBg: themeTokens.colors.brand.goldSoft, emoji: '🟡', label: 'الأصفر', stars: 4 },
  3: { color: themeTokens.colors.brand.orange, softBg: themeTokens.colors.brand.orangeSoft, emoji: '🟠', label: 'البرتقالي', stars: 3 },
  4: { color: themeTokens.colors.brand.purple, softBg: themeTokens.colors.brand.purpleSoft, emoji: '🟣', label: 'البنفسجي', stars: 2 },
  5: { color: themeTokens.colors.brand.rose, softBg: themeTokens.colors.brand.roseSoft, emoji: '🔴', label: 'الأحمر', stars: 1 },
};

export const getZoneMeta = (zone: ZoneColor): ZoneMeta => ZONE_META[zone] ?? ZONE_META[5];

export const computeDominantZone = (zones: ZoneColor[]): ZoneColor => {
  if (!zones.length) return 5;
  return (Math.max(...zones) as ZoneColor);
};

export const toArabicNumerals = (n: number): string =>
  String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
