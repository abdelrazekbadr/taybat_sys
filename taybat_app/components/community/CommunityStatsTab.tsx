import { BarChart2 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Line, Path, Rect } from 'react-native-svg';

import { AppText } from '@/components/common/AppText';
import type { CommunityStats } from '@/types';

function SectionEmpty({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View className="mt-4 items-center justify-center rounded-[18px] border border-app-lineSoft bg-app-surface px-6 py-8">
      <BarChart2 size={30} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
      <AppText variant="bold" className="mt-3 text-center text-[13.5px] leading-6 text-app-navy">
        {title}
      </AppText>
      <AppText className="mt-1 text-center text-[12px] leading-6 text-app-textMuted">
        قريباً — ستظهر هنا بعد أول شهر نشاط
      </AppText>
    </View>
  );
}

function BarChart({ values }: { values: number[] }) {
  const theme = useTheme();
  const width = 320;
  const height = 160;
  const paddingX = 14;
  const paddingY = 14;
  const max = Math.max(1, ...values);
  const barW = values.length ? (width - paddingX * 2) / values.length - 8 : 0;

  return (
    <Svg width={width} height={height}>
      {Array.from({ length: 4 }).map((_, idx) => {
        const y = paddingY + (idx / 3) * (height - paddingY * 2);
        return <Line key={idx} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={theme.colors.outlineVariant} strokeWidth={1} />;
      })}
      {values.map((v, idx) => {
        const x = paddingX + idx * (barW + 8);
        const barH = ((Math.max(0, v) / max) * (height - paddingY * 2)) || 0;
        const y = height - paddingY - barH;
        return <Rect key={idx} x={x} y={y} width={barW} height={barH} rx={8} fill={theme.colors.primary} />;
      })}
    </Svg>
  );
}

function LineChart({ values }: { values: number[] }) {
  const theme = useTheme();
  const width = 320;
  const height = 160;
  const paddingX = 18;
  const paddingY = 18;

  const points = values.map((v) => Math.max(0, Math.min(5, v)));
  const xStep = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0;
  const yFor = (v: number) => height - paddingY - ((v - 0) / 5) * (height - paddingY * 2);

  const path = points.length
    ? points
        .map((v, idx) => {
          const x = paddingX + idx * xStep;
          const y = yFor(v);
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ')
    : '';

  return (
    <Svg width={width} height={height}>
      {Array.from({ length: 6 }).map((_, idx) => {
        const y = paddingY + (idx / 5) * (height - paddingY * 2);
        return <Line key={idx} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke={theme.colors.outlineVariant} strokeWidth={1} />;
      })}
      {path ? <Path d={path} stroke={theme.colors.secondary} strokeWidth={3} fill="none" /> : null}
    </Svg>
  );
}

export function CommunityStatsTab({ stats }: { stats: CommunityStats[] }) {
  const hasData = stats.some((s) => (s.active_users ?? 0) > 0);

  const activeUsers = useMemo(() => stats.map((s) => s.active_users ?? 0).slice(-12), [stats]);
  const avgAdherence = useMemo(
    () => stats.map((s) => (typeof s.avg_adherence_score === 'number' ? s.avg_adherence_score : 0)).slice(-12),
    [stats],
  );

  return (
    <ScrollView contentContainerClassName="px-[22px] pb-10">
      <AppText variant="bold" className="mt-2 text-[14px] leading-6 text-app-navy">
        المستخدمون النشطون
      </AppText>
      {hasData ? (
        <View className="mt-3 overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
          <BarChart values={activeUsers} />
        </View>
      ) : (
        <SectionEmpty title="قريباً — لوحة المعلومات" />
      )}

      <AppText variant="bold" className="mt-6 text-[14px] leading-6 text-app-navy">
        متوسط الالتزام الغذائي
      </AppText>
      {hasData ? (
        <View className="mt-3 overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface p-4">
          <LineChart values={avgAdherence} />
        </View>
      ) : (
        <SectionEmpty title="قريباً — متوسط الالتزام" />
      )}
    </ScrollView>
  );
}

