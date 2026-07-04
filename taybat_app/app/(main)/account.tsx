import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ActivityIndicator, AppState, Image, Linking, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Switch } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { AlertTriangle, LogOut, Moon, Settings, Trash2, UserCog, Utensils, Star } from 'lucide-react-native';

import { AppTabBar } from '@/components/common/AppTabBar';
import { AppText } from '@/components/common/AppText';
import { SettingsRow } from '@/components/account/SettingsRow';
import { useRTL } from '@/hooks/useRTL';
import { getNotificationPermissionGranted } from '@/services/notifications';
import { useAccountStore } from '@/stores/account.store';
import { useAuthStore } from '@/stores/auth.store';
import { useNotificationSettingsStore } from '@/stores/notificationSettings.store';
import { useUserMealsStore } from '@/stores/userMeals.store';
import { useUserStore } from '@/stores/user.store';
import { getDefaultAvatarSource } from '@/utils/avatarUtils';
import type { AvatarConfig } from '@/types';

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      {title && (
        <AppText variant="bold" className="mb-2 px-1 text-[13px] text-app-textMuted">
          {title}
        </AppText>
      )}
      <View className="overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface">
        {children}
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-[1px] bg-app-lineSoft" />;
}

export default function AccountScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();

  const user = useUserStore((s) => s.user);
  const authStatus = useAuthStore((s) => s.status);
  const isGuest = authStatus === 'guest';
  const logout = useAccountStore((s) => s.logout);
  const deleteAccount = useAccountStore((s) => s.deleteAccount);
  const authLogout = useAuthStore((s) => s.logout);

  const fastReminder = useNotificationSettingsStore((s) => s.fastReminder);
  const mealReminder = useNotificationSettingsStore((s) => s.mealReminder);
  const ratingReminder = useNotificationSettingsStore((s) => s.ratingReminder);
  const notifIsLoaded = useNotificationSettingsStore((s) => s.isLoaded);
  const setFastReminder = useNotificationSettingsStore((s) => s.setFastReminder);
  const setMealReminder = useNotificationSettingsStore((s) => s.setMealReminder);
  const setRatingReminder = useNotificationSettingsStore((s) => s.setRatingReminder);
  const loadNotificationSettings = useNotificationSettingsStore((s) => s.loadSettings);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [notifGranted, setNotifGranted] = useState<boolean | null>(null);

  const checkPermission = useCallback(() => {
    getNotificationPermissionGranted()
      .then((granted) => setNotifGranted(granted))
      .catch(() => setNotifGranted(null));
  }, []);

  // Re-check on navigation focus (switching screens).
  useFocusEffect(
    useCallback(() => {
      checkPermission();
      if (!notifIsLoaded) {
        void loadNotificationSettings();
      }
    }, [checkPermission, notifIsLoaded, loadNotificationSettings]),
  );

  // Re-check when the app returns to the foreground (e.g. user came back from
  // OS Settings after granting/revoking notification permission).
  // useFocusEffect does NOT fire on foreground/background transitions — only
  // AppState catches that.
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current !== 'active' && nextState === 'active') {
        checkPermission();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [checkPermission]);

  if (!user && !isGuest) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const displayName = isGuest ? 'زائر' : (user!.name?.trim() || user!.email.split('@')[0]);
  const resolvedAvatar = isGuest ? null : (user!.avatar_config as AvatarConfig | null);
  const avatarBg =
    resolvedAvatar?.type === 'letter' && resolvedAvatar.color
      ? resolvedAvatar.color
      : theme.colors.surfaceVariant;
  const avatarLabel =
    resolvedAvatar?.type === 'emoji'
      ? resolvedAvatar.value
      : (user?.name?.trim()[0] ?? '؟');

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تسجيل الخروج',
        style: 'destructive',
        onPress: async () => {
          setIsLoggingOut(true);
          const ok = await logout();
          if (!ok) {
            setIsLoggingOut(false);
            Alert.alert('تعذّر تسجيل الخروج', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
            return;
          }
          await authLogout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    // Step 1 — explain what will be deleted
    Alert.alert(
      'حذف الحساب',
      'سيتم حذف جميع بياناتك نهائيًا:\n\n• الملف الشخصي\n• سجل الوجبات\n• التقييمات الأسبوعية\n• المنشورات والتفاعلات\n• سجل النقاط والعضوية\n\nلا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'متابعة',
          style: 'destructive',
          onPress: () => {
            // Step 2 — final irreversible confirmation
            Alert.alert(
              'تأكيد الحذف النهائي',
              'هل أنت متأكد تمامًا؟ لن تتمكن من استعادة حسابك أو بياناتك بعد الحذف.',
              [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'نعم، احذف حسابي',
                  style: 'destructive',
                  onPress: async () => {
                    setIsDeletingAccount(true);
                    const ok = await deleteAccount();
                    if (!ok) {
                      setIsDeletingAccount(false);
                      Alert.alert(
                        'تعذّر حذف الحساب',
                        useAccountStore.getState().errorMessage || 'حاول مرة أخرى لاحقًا',
                      );
                      return;
                    }
                    await authLogout();
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-app-background">
      <View
        className="px-[22px]"
        style={{ paddingTop: insets.top + 14, flexDirection: rowDir, alignItems: 'center' }}
      >
        <AppText variant="bold" className="text-[20px] text-app-navy">
          الإعدادات
        </AppText>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-between px-[22px] pb-10">
          <View>
            {/* Profile card */}
            <View
              className="mt-5 rounded-[22px] border border-app-lineSoft bg-app-surface p-4"
              style={{ flexDirection: rowDir, alignItems: 'center', gap: 16 }}
            >
              {resolvedAvatar ? (
                <View
                  className="h-[64px] w-[64px] items-center justify-center rounded-[22px]"
                  style={{ backgroundColor: avatarBg }}
                >
                  <AppText variant="bold" className="text-[28px] leading-[40px]" style={{ color: theme.colors.onSurface }}>
                    {avatarLabel}
                  </AppText>
                </View>
              ) : (
                <View className="h-[64px] w-[64px] overflow-hidden rounded-[22px]">
                  <Image
                    source={getDefaultAvatarSource(user?.gender ?? null, isGuest)}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              )}

              <View className="flex-1">
                <AppText variant="bold" className="text-[16px] leading-6 text-app-navy">
                  {displayName}
                </AppText>
                {!isGuest && (
                  <AppText variant="regular" className="mt-0.5 text-[13px] text-app-textMuted">
                    {user!.email}
                  </AppText>
                )}
              </View>
            </View>

            {/* Notification permission banner — shown only when OS permission is denied */}
            {notifGranted === false && (
              <View
                className="mt-4 flex-row items-center gap-3 rounded-[18px] border px-4 py-3.5"
                style={{
                  flexDirection: rowDir,
                  borderColor: '#f59e0b40',
                  backgroundColor: '#f59e0b0d',
                  gap: 12,
                }}
              >
                <AlertTriangle size={20} color="#f59e0b" strokeWidth={2} />
                <AppText variant="semibold" className="flex-1 text-[13px] leading-5" style={{ color: '#b45309', textAlign: isRTL ? 'right' : 'left' }}>
                  التذكيرات موقوفة على هذا الجهاز
                </AppText>
                <View
                  className="flex-row items-center gap-1.5 rounded-[999px] px-3 py-1.5"
                  style={{ flexDirection: rowDir, backgroundColor: '#f59e0b18' }}
                  // Pressable wrapper below
                >
                  <Settings size={14} color="#b45309" strokeWidth={2} />
                  <AppText
                    variant="semibold"
                    className="text-[12px] leading-5"
                    style={{ color: '#b45309' }}
                    onPress={() => void Linking.openSettings()}
                  >
                    فتح الإعدادات
                  </AppText>
                </View>
              </View>
            )}

            {/* Account section */}
            {!isGuest && (
              <Section title="الحساب">
                <SettingsRow
                  label="تعديل الملف الشخصي"
                  leftIcon={<UserCog size={18} color="#fff" strokeWidth={2} />}
                  iconBg={theme.colors.primary}
                  onPress={() => router.push('/(auth)/complete-profile' as never)}
                />
              </Section>
            )}

            {/* Reminders section */}
            <Section title="التذكيرات">
              {!notifIsLoaded ? (
                <View className="items-center py-6">
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
              ) : (
                <>
                  <SettingsRow
                    label="تذكير الصيام"
                    leftIcon={<Moon size={18} color="#fff" strokeWidth={2} />}
                    iconBg="#6366f1"
                    showChevron={false}
                    rightElement={
                      <Switch
                        value={fastReminder}
                        onValueChange={(v) => void setFastReminder(v)}
                        color={theme.colors.primary}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="تذكير تسجيل الوجبات"
                    leftIcon={<Utensils size={18} color="#fff" strokeWidth={2} />}
                    iconBg="#f59e0b"
                    showChevron={false}
                    rightElement={
                      <Switch
                        value={mealReminder}
                        onValueChange={(v) => void setMealReminder(v, useUserMealsStore.getState().todayMeals.length > 0)}
                        color={theme.colors.primary}
                      />
                    }
                  />
                  <Divider />
                  <SettingsRow
                    label="تذكير التقييم الأسبوعي"
                    leftIcon={<Star size={18} color="#fff" strokeWidth={2} />}
                    iconBg="#10b981"
                    showChevron={false}
                    rightElement={
                      <Switch
                        value={ratingReminder}
                        onValueChange={(v) => void setRatingReminder(v)}
                        color={theme.colors.primary}
                      />
                    }
                  />
                </>
              )}
            </Section>
          </View>

          {/* Bottom actions */}
          <View className="mt-10 gap-3">
            {isGuest ? (
              <>
                <Section>
                  <SettingsRow
                    label="تسجيل الدخول"
                    leftIcon={<LogOut size={18} color="#fff" strokeWidth={2} />}
                    iconBg={theme.colors.primary}
                    onPress={() => router.push('/(auth)/login' as never)}
                  />
                </Section>
                <Section>
                  <SettingsRow
                    label="إنشاء حساب جديد"
                    leftIcon={<UserCog size={18} color="#fff" strokeWidth={2} />}
                    iconBg={theme.colors.secondary}
                    onPress={() => router.push('/(auth)/signup' as never)}
                  />
                </Section>
              </>
            ) : (
              <>
                <Section>
                  <SettingsRow
                    label="تسجيل الخروج"
                    leftIcon={<LogOut size={18} color={theme.colors.error} strokeWidth={2} />}
                    iconBg={theme.colors.error + '18'}
                    destructive
                    onPress={isLoggingOut || isDeletingAccount ? undefined : handleLogout}
                    showChevron={false}
                    rightElement={
                      isLoggingOut ? <ActivityIndicator size="small" color={theme.colors.error} /> : undefined
                    }
                  />
                </Section>
                <Section>
                  <SettingsRow
                    label="حذف الحساب"
                    leftIcon={<Trash2 size={18} color={theme.colors.error} strokeWidth={2} />}
                    iconBg={theme.colors.error + '18'}
                    destructive
                    onPress={isDeletingAccount || isLoggingOut ? undefined : handleDeleteAccount}
                    showChevron={false}
                    rightElement={
                      isDeletingAccount ? <ActivityIndicator size="small" color={theme.colors.error} /> : undefined
                    }
                  />
                </Section>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <AppTabBar active="account" />
    </View>
  );
}
