import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';

export type SegmentedOption<T extends string> = { label: string; value: T };

export interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedToggle<T extends string>({ options, value, onChange }: SegmentedToggleProps<T>) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View className="flex-row gap-2" style={{ flexDirection: rowDir }}>
      {options.map((opt) => {
        const isActive = opt.value === value;
        const content = (
          <View
            className="items-center justify-center rounded-[999px] border px-3 py-2"
            style={{
              borderColor: isActive ? 'transparent' : theme.colors.outlineVariant,
              backgroundColor: isActive ? 'transparent' : theme.colors.surface,
              minWidth: 78,
            }}
          >
            <AppText
              variant="semibold"
              className="text-[12.5px] leading-5"
              style={{ color: isActive ? theme.colors.surface : theme.colors.onSurfaceVariant }}
            >
              {opt.label}
            </AppText>
          </View>
        );

        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className="flex-1"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          >
            {isActive ? (
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ borderRadius: 999 }}
              >
                {content}
              </LinearGradient>
            ) : (
              content
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
