import React from 'react';
import { Pressable, Text } from 'react-native';

import { useTheme } from 'react-native-paper';

import { themeTokens } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
}

export function PrimaryButton({ title, onPress }: PrimaryButtonProps) {
  const theme = useTheme();
  const onPrimary = theme.dark ? themeTokens.colors.dark.onPrimary : themeTokens.colors.light.onPrimary;

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: theme.colors.primary,
        paddingVertical: themeTokens.spacing.lg - 2,
        borderRadius: themeTokens.radius.lg,
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: onPrimary,
          fontSize: themeTokens.typography.body.fontSize,
          fontWeight: themeTokens.typography.metrics.fontWeight,
          fontFamily: 'Cairo_600SemiBold',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
