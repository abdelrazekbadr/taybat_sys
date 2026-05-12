import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, House, Medal, Plus, User, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRTL } from '@/hooks/useRTL';
import { AppText } from './AppText';

export type TabKey = 'home' | 'library' | 'add' | 'badges' | 'account';

interface AppTabBarProps {
  active?: TabKey;
}

type TabItem = { key: TabKey; label: string; Icon: LucideIcon };

const TABS_RTL: TabItem[] = [
  { key: 'home', label: 'الرئيسية', Icon: House },
  { key: 'library', label: 'المكتبة', Icon: BookOpen },
  { key: 'add', label: '', Icon: Plus },
  { key: 'badges', label: 'الشارات', Icon: Medal },
  { key: 'account', label: 'حسابي', Icon: User },
];

const TABS_LTR: TabItem[] = [
  { key: 'account', label: 'Account', Icon: User },
  { key: 'badges', label: 'Badges', Icon: Medal },
  { key: 'add', label: '', Icon: Plus },
  { key: 'library', label: 'Library', Icon: BookOpen },
  { key: 'home', label: 'Home', Icon: House },
];

export function AppTabBar({ active = 'home' }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const tabs = isRTL ? TABS_RTL : TABS_LTR;

  const handlePress = (key: TabKey) => {
    if (key === 'add') {
      router.push('/(main)/select-meal');
    }
  };

  return (
    <View style={[styles.bar, { flexDirection: rowDir, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((tab) => {
        if (tab.key === 'add') {
          return (
            <TouchableOpacity key="add" style={styles.fabWrapper} onPress={() => handlePress('add')} activeOpacity={0.85}>
              <LinearGradient
                colors={['#1ED49A', '#0CA170']}
                style={styles.fab}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Plus size={28} color="#fff" strokeWidth={2} />
              </LinearGradient>
            </TouchableOpacity>
          );
        }

        const { Icon, key, label } = tab;
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            style={styles.tab}
            onPress={() => handlePress(key)}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isActive ? '#059669' : '#94A3B8'}
              strokeWidth={isActive ? 2.5 : 2}
            />
            <AppText variant="bold" style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
    lineHeight: 14,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#059669',
  },
  fabWrapper: {
    flex: 1,
    alignItems: 'center',
    marginTop: -28,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
});
