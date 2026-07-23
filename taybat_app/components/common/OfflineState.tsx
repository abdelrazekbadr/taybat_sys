import { WifiOff } from 'lucide-react-native';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';

interface OfflineStateProps {
  /** Defaults to the standard "no connection" headline. */
  title?: string;
  /** Defaults to a generic "check your connection" hint. */
  message?: string;
  /** Shown as a pill button below the message when provided. */
  onRetry?: () => void;
  /**
   * Full-screen (default) fills the remaining space, for a screen with no
   * other content to show. Compact is sized for embedding inside a tab,
   * list, or section that has other content around it.
   */
  compact?: boolean;
}

/**
 * Shown in place of an empty/error state when the device is offline AND
 * there is no cached data to fall back on — distinct from a genuine "no
 * data yet" empty state or a real server error, so the user understands
 * *why* the screen has nothing to show.
 */
export function OfflineState({
  title,
  message,
  onRetry,
  compact = false,
}: OfflineStateProps) {
  const theme = useTheme();

  return (
    <View
      className={
        compact
          ? 'items-center gap-3 px-6 py-10'
          : 'flex-1 items-center justify-center gap-4 px-8'
      }
    >
      <WifiOff
        size={compact ? 28 : 40}
        color={theme.colors.onSurfaceVariant}
        strokeWidth={1.5}
      />
      <AppText
        variant="bold"
        className={
          compact ? 'text-center text-[14px]' : 'text-center text-[16px]'
        }
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {title ?? 'لا يوجد اتصال بالإنترنت'}
      </AppText>
      <AppText className="text-app-textMuted text-center text-[13px] leading-5">
        {message ?? 'تحقق من اتصالك وحاول مرة أخرى'}
      </AppText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="mt-2 rounded-full px-6 py-2.5"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <AppText variant="semibold" className="text-[14px] text-white">
            إعادة المحاولة
          </AppText>
        </Pressable>
      )}
    </View>
  );
}
