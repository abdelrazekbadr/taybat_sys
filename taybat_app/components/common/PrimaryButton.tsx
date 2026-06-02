import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useRTL } from '@/hooks/useRTL';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  gradientColors?: [string, string];
  leadingIcon?: React.ReactElement;
  trailingIcon?: React.ReactElement;
}

export function PrimaryButton({ title, onPress, loading, disabled, gradientColors, leadingIcon, trailingIcon }: PrimaryButtonProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const isInactive = Boolean(loading || disabled);
  const colors: [string, string] = gradientColors ?? [theme.colors.primary, theme.colors.secondary];

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [{ alignSelf: 'stretch' }, { opacity: isInactive ? 0.4 : pressed ? 0.9 : 1 }]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.onPrimary} />
        ) : (
          <View style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {leadingIcon ?? null}
            <AppText variant="bold" className="text-[15px] text-white">
              {title}
            </AppText>
            {trailingIcon ?? null}
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
