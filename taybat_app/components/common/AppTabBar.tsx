import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, HandPlatter, House, User, Users, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useBottomInset } from '@/hooks/useBottomInset';
import { useTheme } from 'react-native-paper';

import { useRTL } from '@/hooks/useRTL';
import { AppText } from './AppText';

export type TabKey = 'home' | 'library' | 'add' | 'community' | 'account';

interface AppTabBarProps {
  active?: TabKey;
}

type TabItem = { key: TabKey; label: string; Icon: LucideIcon };

const TABS_RTL: TabItem[] = [
  { key: 'home', label: 'الرئيسية', Icon: House },
  { key: 'library', label: 'المكتبة', Icon: BookOpen },
  { key: 'add', label: '', Icon: HandPlatter },
  { key: 'community', label: 'عائلتنا', Icon: Users },
  { key: 'account', label: 'حسابي', Icon: User },
];

const TABS_LTR: TabItem[] = [
  { key: 'account', label: 'Account', Icon: User },
  { key: 'community', label: 'Community', Icon: Users },
  { key: 'add', label: '', Icon: HandPlatter },
  { key: 'library', label: 'Library', Icon: BookOpen },
  { key: 'home', label: 'Home', Icon: House },
];

export function AppTabBar({ active = 'home' }: AppTabBarProps) {
  const theme = useTheme();
  const tabBarBottom = useBottomInset(0);
  const { isRTL, rowDir } = useRTL();
  const tabs = isRTL ? TABS_RTL : TABS_LTR;
  const inactiveColor = theme.colors.onSurfaceVariant ?? theme.colors.outline;

  const handlePress = (key: TabKey) => {
    if (key === 'add') {
      router.push('/(main)/select-meal');
      return;
    }
    if (key === active) {
      return;
    }
    if (key === 'home') {
      router.replace('/(main)');
      return;
    }
    if (key === 'library') {
      router.replace('/(main)/topics');
      return;
    }
    if (key === 'community') {
      router.replace('/(main)/community');
      return;
    }
    if (key === 'account') {
      router.replace('/(main)/account');
      return;
    }
  };

  return (
    <View
      className="flex-row items-center border-t border-app-lineSoft bg-app-surface px-2 pt-2.5"
      style={{ flexDirection: rowDir, paddingBottom: tabBarBottom }}
    >
      {tabs.map((tab) => {
        if (tab.key === 'add') {
          return (
            <TouchableOpacity
              key="add"
              className="flex-1 items-center opacity-85"
              style={{ marginTop: -40 }}
              onPress={() => handlePress('add')}
              activeOpacity={0.80}
            >
              <LinearGradient
                colors={[theme.colors.secondary, theme.colors.primary]}
                style={{ width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' }}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <HandPlatter size={26} color={theme.colors.surface} strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        const { Icon, key, label } = tab;
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            className="flex-1 items-center gap-1"
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? theme.colors.primary : inactiveColor}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <AppText
              variant="bold"
              className="text-center text-[10.5px] leading-[17px]"
              style={{ color: isActive ? theme.colors.primary : inactiveColor }}
            >
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
