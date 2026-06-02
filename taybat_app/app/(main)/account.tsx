import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { Check, Pencil, User, X } from 'lucide-react-native';
import { AppTabBar } from '@/components/common/AppTabBar';
import { AppText, AppTextInput } from '@/components/common/AppText';
import { AvatarPickerSheet } from '@/components/account/AvatarPickerSheet';
import { getDefaultAvatarSource } from '@/utils/avatarUtils';
import { SettingsRow } from '@/components/account/SettingsRow';
import { useRTL } from '@/hooks/useRTL';
import { useAccountStore } from '@/stores/account.store';
import { useAuthStore } from '@/stores/auth.store';
import { useMealPreferencesStore } from '@/stores/mealPreferences.store';
import { useUserStore } from '@/stores/user.store';
import type { AvatarConfig } from '@/types';
import { daysOnPlan } from '@/utils/statsUtils';
import { toArabicNumerals } from '@/utils/zoneUtils';

const maskEmail = (email: string) => {
  const at = email.indexOf('@');
  if (at <= 1) return email;
  const name = email.slice(0, at);
  const domain = email.slice(at);
  const shown = name.slice(0, 2);
  return `${shown}***${domain}`;
};

const firstLetter = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return '؟';
  return trimmed[0] ?? '؟';
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mt-6">
      <AppText variant="bold" className="mb-2 px-1 text-[13px] leading-5 text-app-textMuted">
        {title}
      </AppText>
      <View className="overflow-hidden rounded-[18px] border border-app-lineSoft bg-app-surface">{children}</View>
    </View>
  );
}

function Divider() {
  return <View className="h-[1px] bg-app-lineSoft" />;
}

export default function AccountScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir } = useRTL();

  const { user } = useUserStore();

  const {
    isEditingName,
    draftName,
    avatarConfig,
    isLoading,
    isSaving,
    errorMessage,
    initializeAccount,
    setDraftName,
    startEditName,
    cancelEditName,
    confirmEditName,
    updateAvatar,
    logout,
  } = useAccountStore();

  const authLogout = useAuthStore((s) => s.logout);

  const { favoriteMealIds, initializePreferences } = useMealPreferencesStore();

  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  useEffect(() => {
    initializeAccount();
  }, [initializeAccount]);

  useEffect(() => {
    initializePreferences();
  }, [initializePreferences]);

  const favoriteCount = favoriteMealIds.length;

  if (!user || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const dayNumber = daysOnPlan(user.plan_start_date);
  const journeyDaysLabel = `${toArabicNumerals(dayNumber)} يوم`;
  const resolvedAvatar = (avatarConfig ?? user.avatar_config) as AvatarConfig | null;
  const avatarLabel = resolvedAvatar?.type === 'emoji' ? resolvedAvatar.value : firstLetter(user.name ?? '');
  const avatarBg = resolvedAvatar?.type === 'letter' && resolvedAvatar.color ? resolvedAvatar.color : theme.colors.surfaceVariant;

  return (
    <View className="flex-1 bg-app-background">
      <View
        className="px-[22px]"
        style={{ paddingTop: insets.top + 14, flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <AppText variant="bold" className="text-[20px] leading-7 text-app-navy">
          حسابي
        </AppText>
        <Pressable
          onPress={() => router.push('/(main)/user-profile')}
          className="h-[44px] w-[44px] items-center justify-center rounded-full border border-app-line bg-app-surface"
          style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
        >
          <User size={20} color={theme.colors.onSurface} strokeWidth={2.2} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-[22px] pb-10">
          <Pressable
            onPress={() => setAvatarPickerVisible(true)}
            className="mt-5 flex-row items-center gap-4 rounded-[22px] border border-app-lineSoft bg-app-surface p-4"
            style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, flexDirection: rowDir }]}
          >
            {resolvedAvatar ? (
              <View
                className="h-[80px] w-[80px] items-center justify-center rounded-[28px]"
                style={{ backgroundColor: avatarBg }}
              >
                <AppText variant="bold" className="text-[34px] leading-[50px]" style={{ color: theme.colors.onSurface }}>
                  {avatarLabel}
                </AppText>
              </View>
            ) : (
              <View className="h-[80px] w-[80px] overflow-hidden rounded-[28px]">
                <Image
                  source={getDefaultAvatarSource(user.gender)}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              </View>
            )}

            <View className="flex-1">
              <AppText variant="bold" className="text-[16px] leading-6 text-app-navy">
                {user.name}
              </AppText>
              <View className="mt-1 self-start rounded-[999px] bg-app-surfaceAlt px-3 py-1">
                <AppText variant="semibold" className="text-[12px] leading-5 text-app-textMuted">
                  في الرحلة منذ {journeyDaysLabel}
                </AppText>
              </View>
            </View>
          </Pressable>

          <Section title="حسابي">
            {!isEditingName ? (
              <>
                <SettingsRow
                  label="الاسم"
                  showChevron={false}
                  rightElement={
                    <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
                      <AppText className="text-[13px] leading-5 text-app-textMuted">{user.name}</AppText>
                      <Pressable onPress={startEditName} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                        <Pencil size={18} color={theme.colors.onSurfaceVariant} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                  }
                />
                <Divider />
              </>
            ) : (
              <>
                <View className="px-4 py-3.5">
                  <View className="flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
                    <AppText variant="semibold" className="text-[14px] leading-6 text-app-navy">
                      الاسم
                    </AppText>
                  </View>
                  <View className="mt-2 flex-row items-center gap-2" style={{ flexDirection: rowDir }}>
                    <AppTextInput
                      value={draftName}
                      onChangeText={setDraftName}
                      placeholder="اكتب اسمك"
                      className="flex-1 rounded-[14px] border border-app-lineSoft bg-app-background px-3 py-3 text-[14px] text-app-text"
                      editable={!isSaving}
                      returnKeyType="done"
                    />
                    <Pressable
                      onPress={async () => {
                        const ok = await confirmEditName();
                        if (!ok) {
                          Alert.alert('تعذّر حفظ الاسم', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
                        }
                      }}
                      disabled={isSaving}
                      className="h-[44px] w-[44px] items-center justify-center rounded-[16px] border border-app-lineSoft bg-app-surface"
                      style={({ pressed }) => [{ opacity: isSaving ? 0.4 : pressed ? 0.9 : 1 }]}
                    >
                      <Check size={20} color={theme.colors.primary} strokeWidth={2.8} />
                    </Pressable>
                    <Pressable
                      onPress={cancelEditName}
                      disabled={isSaving}
                      className="h-[44px] w-[44px] items-center justify-center rounded-[16px] border border-app-lineSoft bg-app-surface"
                      style={({ pressed }) => [{ opacity: isSaving ? 0.4 : pressed ? 0.9 : 1 }]}
                    >
                      <X size={20} color={theme.colors.onSurfaceVariant} strokeWidth={2.8} />
                    </Pressable>
                  </View>
                </View>
                <Divider />
              </>
            )}

            <SettingsRow
              label="البريد الإلكتروني"
              value={maskEmail(user.email)}
              onPress={() => Alert.alert('البريد الإلكتروني', 'لتغيير بريدك تواصل مع الدعم')}
            />
            <Divider />
            <SettingsRow label="الصورة الشخصية" onPress={() => setAvatarPickerVisible(true)} />
          </Section>

          <Section title="تفضيلات الوجبات">
            <SettingsRow
              label="الوجبات المفضلة"
              value={`${toArabicNumerals(favoriteCount)} مفضلة`}
              onPress={() => router.push('/(main)/meal-preferences')}
            />
          </Section>

          {/* <Section title="الخصوصية والأمان">
            <View className="px-4 py-3.5">
              <AppText variant="semibold" className="text-[14px] leading-6 text-app-navy">
                رؤية منشوراتي
              </AppText>
              <View className="mt-2">
                <SegmentedToggle<PostVisibility>
                  options={[
                    { label: 'عام', value: 'public' },
                    { label: 'متابعون فقط', value: 'followers' },
                  ]}
                  value={postVisibility}
                  onChange={async (v) => {
                    const ok = await updatePostVisibility(v);
                    if (!ok) {
                      Alert.alert('تعذّر حفظ الإعداد', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
                    }
                  }}
                />
              </View>
            </View>
            <Divider />
            <View className="px-4 py-3.5">
              <AppText variant="semibold" className="text-[14px] leading-6 text-app-navy">
                من يستطيع متابعتي
              </AppText>
              <View className="mt-2">
                <SegmentedToggle<FollowPermission>
                  options={[
                    { label: 'الجميع', value: 'everyone' },
                    { label: 'بموافقتي', value: 'approved' },
                  ]}
                  value={followPermission}
                  onChange={async (v) => {
                    const ok = await updateFollowPermission(v);
                    if (!ok) {
                      Alert.alert('تعذّر حفظ الإعداد', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
                    }
                  }}
                />
              </View>
            </View>
          </Section>

          <Section title="إعدادات التطبيق">
            <View className="px-4 py-3.5">
              <AppText variant="semibold" className="text-[14px] leading-6 text-app-navy">
                اللغة
              </AppText>
              <View className="mt-2">
                <SegmentedToggle<'ar' | 'en'>
                  options={[
                    { label: 'العربية', value: 'ar' },
                    { label: 'English', value: 'en' },
                  ]}
                  value={language}
                  onChange={(v) => setLanguage(v)}
                />
              </View>
            </View>
            <Divider />
            <View className="px-4 py-3.5">
              <AppText variant="semibold" className="text-[14px] leading-6 text-app-navy">
                المظهر
              </AppText>
              <View className="mt-2">
                <SegmentedToggle<'light' | 'dark' | 'system'>
                  options={[
                    { label: 'فاتح', value: 'light' },
                    { label: 'داكن', value: 'dark' },
                    { label: 'تلقائي', value: 'system' },
                  ]}
                  value={mode}
                  onChange={(v) => setMode(v)}
                />
              </View>
            </View>
          </Section> */}

          {!!errorMessage && (
            <View className="mt-4 rounded-[14px] border border-app-lineSoft bg-app-surface p-3">
              <AppText className="text-[12.5px] leading-5" style={{ color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          )}

          <Pressable
            onPress={() => {
              Alert.alert('تسجيل الخروج', 'هل تريد تسجيل الخروج؟', [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'تسجيل الخروج',
                  style: 'destructive',
                  onPress: async () => {
                    // 1. Clear all user preference data from every feature store
                    const ok = await logout();
                    if (!ok) {
                      Alert.alert('تعذّر تسجيل الخروج', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
                      return;
                    }
                    // 2. Clear auth session — route guard in _layout.tsx handles navigation
                    await authLogout();
                  },
                },
              ]);
            }}
            disabled={isSaving}
            className="mt-8 items-center justify-center rounded-[18px] border border-app-lineSoft bg-app-surface py-4"
            style={({ pressed }) => [{ opacity: isSaving ? 0.5 : pressed ? 0.9 : 1 }]}
          >
            <AppText variant="bold" className="text-[15px] leading-6" style={{ color: theme.colors.error }}>
              تسجيل الخروج
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      <AppTabBar active="account" />

      <AvatarPickerSheet
        visible={avatarPickerVisible}
        name={user.name ?? ''}
        value={resolvedAvatar}
        onDismiss={() => setAvatarPickerVisible(false)}
        onSelect={async (config) => {
          const ok = await updateAvatar(config);
          if (!ok) {
            Alert.alert('تعذّر حفظ الصورة', useAccountStore.getState().errorMessage || 'حاول مرة أخرى');
            return;
          }
          setAvatarPickerVisible(false);
        }}
      />
    </View>
  );
}
