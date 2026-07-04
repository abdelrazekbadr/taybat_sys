import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { useRTL } from '@/hooks/useRTL';
import { AppText } from '@/components/common/AppText';

export interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  leftIcon?: React.ReactNode;
  iconBg?: string;
  destructive?: boolean;
}

export function SettingsRow({
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
  leftIcon,
  iconBg,
  destructive = false,
}: SettingsRowProps) {
  const theme = useTheme();
  const { isRTL, rowDir } = useRTL();

  const labelColor = destructive ? theme.colors.error : theme.colors.onSurface;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="px-4 py-3.5"
      style={({ pressed }) => [{ opacity: !onPress ? 1 : pressed ? 0.85 : 1 }]}
    >
      <View className="flex-row items-center gap-3" style={{ flexDirection: rowDir }}>
        {leftIcon && (
          <View
            className="h-[34px] w-[34px] items-center justify-center rounded-[10px]"
            style={{ backgroundColor: iconBg ?? theme.colors.surfaceVariant }}
          >
            {leftIcon}
          </View>
        )}

        <AppText variant="semibold" className="flex-1 text-[14px] leading-6" style={{ color: labelColor }}>
          {label}
        </AppText>

        <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
          {rightElement ? (
            rightElement
          ) : value ? (
            <AppText className="text-[13px] leading-5 text-app-textMuted">{value}</AppText>
          ) : null}

          {onPress && showChevron ? (
            isRTL ? (
              <ChevronLeft size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronRight size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
            )
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
