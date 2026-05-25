import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';

import { useTheme } from 'react-native-paper';

import { AppText } from './AppText';
import { themeTokens } from '@/theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({ title, onPress, loading, disabled }: PrimaryButtonProps) {
  const theme = useTheme();
  const onPrimary = theme.dark ? themeTokens.colors.dark.onPrimary : themeTokens.colors.light.onPrimary;
  const isInactive = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => ({
        backgroundColor: theme.colors.primary,
        minHeight: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'stretch',
        paddingHorizontal: 24,
        opacity: isInactive ? 0.7 : pressed ? 0.9 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={onPrimary} />
      ) : (
        <AppText variant="semibold" style={{ fontSize: 15.5, color: onPrimary }}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}
