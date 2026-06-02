import React from 'react';
import { ActivityIndicator, Image, type ImageSourcePropType, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';

import { useRTL } from '@/hooks/useRTL';
import { AppText } from './AppText';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /** flex value for the pressable — omit for natural/auto width */
  flex?: number;
  /** Pre-rendered icon element (Lucide, MaterialCommunityIcons, etc.) */
  icon?: React.ReactElement;
  /** Image source from assets (e.g. require('@/assets/icons/google.png')) */
  imageSource?: ImageSourcePropType;
  /** Size for imageSource — default 22 */
  imageSize?: number;
  /** Override text color — default theme.colors.onSurface */
  textColor?: string;
}

export function OutlineButton({
  title,
  onPress,
  loading,
  disabled,
  flex,
  icon,
  imageSource,
  imageSize = 22,
  textColor,
}: OutlineButtonProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const isDark = theme.dark;
  const isInactive = Boolean(loading || disabled);
  const labelColor = textColor ?? (theme.colors.onSurface as string);

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      className={`flex-row items-center justify-center gap-2 rounded-xl border  py-1 px-4 ${isDark ? 'bg-app-navy border-[#334155]' : 'bg-white border-[#d1d5db]'}`}
      style={{ flexDirection: rowDir }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <>
          {imageSource != null ? (
            <Image
              source={imageSource}
              style={{ width: imageSize, height: imageSize }}
              resizeMode="contain"
            />
          ) : icon}
          <AppText variant="semibold" className="text-[14px]" style={{ color: labelColor }}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
