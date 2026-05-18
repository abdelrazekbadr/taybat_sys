import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';

export function StepIndicator(props: { steps: number; activeIndex: number }) {
  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-center gap-2">
      {Array.from({ length: props.steps }).map((_, idx) => {
        const isActive = idx === props.activeIndex;
        return (
          <View
            key={idx}
            className={`h-2 rounded-full ${isActive ? 'w-8' : 'w-2'}`}
            style={{ backgroundColor: isActive ? theme.colors.primary : theme.colors.outlineVariant }}
          />
        );
      })}
    </View>
  );
}

