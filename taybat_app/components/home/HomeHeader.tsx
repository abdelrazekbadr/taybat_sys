import { LinearGradient } from 'expo-linear-gradient';
import { Award, Bell } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { toArabicNumerals } from '@/utils/zoneUtils';

interface HomeHeaderProps {
  name: string;
  subscriberId: number;
  onBellPress?: () => void;
  hasNotification?: boolean;
}

export function HomeHeader({ name, subscriberId, onBellPress, hasNotification = true }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const initials = name.slice(0, 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, flexDirection: rowDir }]}>
      <View style={[styles.left, { flexDirection: rowDir }]}>
        <View style={styles.avatarWrapper}>
          <LinearGradient
            colors={['#1ED49A', '#0CA170']}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <AppText variant="bold" style={styles.avatarInitial}>{initials}</AppText>
          </LinearGradient>
          {/* position badge on the outer corner of the avatar — flips with RTL */}
          <View style={[styles.medalBadge, isRTL ? styles.medalBadgeRTL : styles.medalBadgeLTR]}>
            <Award size={13} color="#E5A000" fill="#E5A000" strokeWidth={0} />
          </View>
        </View>

        <View style={styles.nameBlock}>
          <AppText style={styles.greeting}>صباح الخير،</AppText>
          <AppText variant="bold" style={styles.name}>{name}</AppText>
          <View style={styles.subBadge}>
            <AppText variant="bold" style={styles.subText}>
              رقم الاشتراك: {toArabicNumerals(subscriberId)}
            </AppText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.bellBtn} onPress={onBellPress} activeOpacity={0.7}>
        <Bell size={20} color="#0F2A36" strokeWidth={2} />
        {hasNotification && <View style={styles.notifDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 24,
  },
  medalBadge: {
    position: 'absolute',
    bottom: -3,
    width: 22,
    height: 22,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalBadgeLTR: {
    left: -3,
  },
  medalBadgeRTL: {
    right: -3,
  },
  nameBlock: {
    gap: 2,
  },
  greeting: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
  },
  name: {
    fontSize: 16.5,
    color: '#0F2A36',
    lineHeight: 22,
  },
  subBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
    alignSelf: 'flex-start',
  },
  subText: {
    fontSize: 11,
    color: '#059669',
    lineHeight: 16,
  },
  bellBtn: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5EBF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FB7185',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
