import { Award, Bell } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import type { Gender } from '@/types';
import { getDefaultAvatarSource } from '@/utils/avatarUtils';

interface HomeHeaderProps {
  name: string | null;
  gender?: Gender | null;
  avatarUrl?: string | null;
  isGuest?: boolean;
  onBellPress?: () => void;
  onProfilePress?: () => void;
  unreadCount?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  return hour >= 5 && hour < 12 ? 'صباح الخير،' : 'مساء الخير،';
}

export function HomeHeader({ name, gender, avatarUrl, isGuest = false, onBellPress, onProfilePress, unreadCount = 0 }: HomeHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const avatarSource = avatarUrl ? { uri: avatarUrl } : getDefaultAvatarSource(gender, isGuest);
  const greeting = getGreeting();
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount);

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
          <AppText className="text-[12.5px] leading-[18px] text-app-textSoft">{greeting}</AppText>
          <AppText variant="bold" className="text-[16.5px] leading-[22px] text-app-navy">{name}</AppText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="relative h-[44px] w-[44px] items-center justify-center rounded-full border border-app-line bg-app-surface"
        onPress={onBellPress}
        activeOpacity={0.7}
      >
        <Bell size={20} color={theme.colors.onSurface} strokeWidth={2} />
        {unreadCount > 0 && (
          <View
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: '#E11D48',
              borderWidth: 1.5,
              borderColor: theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 3,
            }}
          >
            <AppText variant="bold" style={{ fontSize: 9, lineHeight: 13, color: '#fff' }}>
              {badgeLabel}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
