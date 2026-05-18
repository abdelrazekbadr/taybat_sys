import { Award, Bell } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { toArabicNumerals } from '@/utils/zoneUtils';

interface HomeHeaderProps {
  name: string;
  subscriberId: number;
  avatarUrl?: string | null;
  onBellPress?: () => void;
  onProfilePress?: () => void;
  hasNotification?: boolean;
}

const defaultAvatar = require('../../assets/images/avatar/avatar_1.png');

export function HomeHeader({ name, subscriberId, avatarUrl, onBellPress, onProfilePress, hasNotification = true }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const avatarSource = avatarUrl ? { uri: avatarUrl } : defaultAvatar;

  return (
    <View
      className="flex-row items-start justify-between px-[22px] pb-3"
      style={{ paddingTop: insets.top + 12, flexDirection: rowDir }}
    >
      <TouchableOpacity
        className="flex-row items-center gap-3"
        style={{ flexDirection: rowDir }}
        onPress={onProfilePress}
        activeOpacity={onProfilePress ? 0.75 : 1}
        disabled={!onProfilePress}
      >
        <View className="relative h-[50px] w-[50px]">
          <Image source={avatarSource} className="h-[50px] w-[50px] rounded-full bg-app-surfaceAlt" resizeMode="cover" />
          <View
            className="absolute bottom-[-3px] h-[22px] w-[22px] items-center justify-center rounded-full bg-app-background"
            style={isRTL ? { right: -3 } : { left: -3 }}
          >
            <Award size={13} color={theme.colors.primary} fill={theme.colors.primary} strokeWidth={0} />
          </View>
        </View>

        <View className="gap-0.5">
          <AppText className="text-[12.5px] leading-[18px] text-app-textSoft">صباح الخير،</AppText>
          <AppText variant="bold" className="text-[16.5px] leading-[22px] text-app-navy">{name}</AppText>
          <View className="mt-1 self-start rounded-full bg-app-successSoft px-2 py-0.5">
            <AppText variant="bold" className="text-[11px] leading-2 text-app-primaryDark">
              رقم المشترك: {toArabicNumerals(subscriberId)}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="relative h-[44px] w-[44px] items-center justify-center rounded-full border border-app-line bg-app-surface"
        onPress={onBellPress}
        activeOpacity={0.7}
      >
        <Bell size={20} color={theme.colors.onSurface} strokeWidth={2} />
        {hasNotification && (
          <View className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border-2 border-app-surface bg-app-secondary" />
        )}
      </TouchableOpacity>
    </View>
  );
}
