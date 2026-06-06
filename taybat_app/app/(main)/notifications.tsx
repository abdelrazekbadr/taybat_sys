import { Bell, BellOff, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { AppText } from '@/components/common/AppText';
import { MealSpinner } from '@/components/common/MealSpinner';
import { useRTL } from '@/hooks/useRTL';
import { useNotificationsStore } from '@/stores/notifications.store';
import type { AppNotification } from '@/types';
import { toRelativeArabicTime } from '@/utils/communityTime';

const TYPE_ICON_COLOR: Record<string, string> = {
  new_post:     '#10B981',
  announcement: '#06B6D4',
  health_tip:   '#8B5CF6',
};

function NotificationItem({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const accentColor = TYPE_ICON_COLOR[item.type] ?? '#10B981';
  const timeLabel = toRelativeArabicTime(item.created_at);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      <View
        style={{
          flexDirection: rowDir,
          alignItems: 'flex-start',
          gap: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: item.is_read ? theme.colors.surface : `${accentColor}0D`,
        }}
      >
        {/* Icon bubble */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: `${accentColor}22`,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Bell size={19} color={accentColor} strokeWidth={2} />
        </View>

        {/* Text block */}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText variant="bold" style={{ fontSize: 13.5, color: theme.colors.onSurface }}>
              {item.title}
            </AppText>
            {!item.is_read && (
              <View
                style={{
                  width: 8, height: 8, borderRadius: 4,
                  backgroundColor: accentColor,
                  flexShrink: 0,
                }}
              />
            )}
          </View>

          <AppText
            numberOfLines={2}
            style={{ fontSize: 12.5, lineHeight: 20, color: theme.colors.onSurfaceVariant }}
          >
            {item.body}
          </AppText>

          <AppText style={{ fontSize: 11, color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {timeLabel}
          </AppText>
        </View>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: theme.colors.outlineVariant, marginHorizontal: 16 }} />
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();

  const notifications  = useNotificationsStore((s) => s.notifications);
  const isLoading      = useNotificationsStore((s) => s.isLoading);
  const unreadCount    = useNotificationsStore((s) => s.unreadCount);
  const markAsRead     = useNotificationsStore((s) => s.markAsRead);
  const markAllAsRead  = useNotificationsStore((s) => s.markAllAsRead);

  const handleItemPress = useCallback((item: AppNotification) => {
    markAsRead(item.id);
    if (item.action_type === 'community_post') {
      router.push('/(main)/community');
    }
  }, [markAsRead]);

  // Mark all read when screen is left
  useEffect(() => {
    return () => { markAllAsRead(); };
  }, [markAllAsRead]);

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <View className="flex-1 bg-app-background" style={{ paddingTop: insets.top }}>

      {/* Header */}
      <View
        style={{
          flexDirection: rowDir,
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <BackIcon size={22} color={theme.colors.onSurface} strokeWidth={2} />
        </Pressable>

        <AppText variant="bold" style={{ fontSize: 16, color: theme.colors.onSurface }}>
          الإشعارات{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </AppText>

        <Pressable
          onPress={markAllAsRead}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingHorizontal: 4 })}
          disabled={unreadCount === 0}
        >
          <CheckCheck
            size={20}
            color={unreadCount > 0 ? theme.colors.primary : theme.colors.outlineVariant}
            strokeWidth={2}
          />
        </Pressable>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <MealSpinner />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={() => handleItemPress(item)} />
          )}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center" style={{ paddingTop: 80 }}>
              <View
                style={{
                  width: 64, height: 64, borderRadius: 32,
                  backgroundColor: theme.colors.surfaceVariant,
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}
              >
                <BellOff size={28} color={theme.colors.onSurfaceVariant} strokeWidth={1.8} />
              </View>
              <AppText variant="semibold" style={{ fontSize: 15, color: theme.colors.onSurface, marginBottom: 6 }}>
                لا توجد إشعارات
              </AppText>
              <AppText style={{ fontSize: 13, color: theme.colors.onSurfaceVariant, textAlign: 'center', paddingHorizontal: 40 }}>
                ستظهر هنا إشعارات فريق الطيبات والتحديثات المهمة
              </AppText>
            </View>
          }
        />
      )}
    </View>
  );
}
