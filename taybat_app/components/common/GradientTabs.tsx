import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';

export type TabOption<K extends string> = {
  key: K;
  label: string;
};

export function GradientTabs<K extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly TabOption<K>[];
  value: K;
  onChange: (value: K) => void;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View className="flex-row gap-2" style={{ flexDirection: rowDir }}>
      {options.map((t) => {
        const isActive = t.key === value;

        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            className="flex-1 overflow-hidden rounded-full"
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            {isActive ? (
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 999 }}
              >
                <View className="items-center justify-center rounded-full px-5 py-2.5 shadow-sm shadow-black/10">
                  <AppText variant="bold" className="text-[13px] leading-5 text-white">
                    {t.label}
                  </AppText>
                </View>
              </LinearGradient>
            ) : (
              <View className="items-center justify-center rounded-full border border-app-lineSoft bg-app-surface px-5 py-2.5">
                <AppText variant="bold" className="text-[13px] leading-5 text-app-textSoft">
                  {t.label}
                </AppText>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
