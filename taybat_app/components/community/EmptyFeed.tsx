import { Rss } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';

export function EmptyFeed() {
  const theme = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 py-10">
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl border border-app-lineSoft bg-app-surface"
        style={{ borderColor: theme.colors.outlineVariant }}
      >
        <Rss size={30} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
      </View>
      <AppText variant="bold" className="mt-4 text-center text-[15px] leading-7 text-app-navy">
        قريباً — أول منشور في الطريق إليك
      </AppText>
      <AppText className="mt-2 text-center text-[12.5px] leading-6 text-app-textMuted">
        تابع عائلة الطيبات لتصلك آخر الأخبار والنصائح
      </AppText>
    </View>
  );
}

