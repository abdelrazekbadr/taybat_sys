import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeartPulse, UtensilsCrossed } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const splashLogo = require('../../assets/images/app_splash_logo.png');

function FeatureCard({
  icon: Icon,
  label,
  rowDir,
  tone,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  rowDir: 'row' | 'row-reverse';
  tone: 'primary' | 'secondary';
}) {
  const theme = useTheme();
  const iconColor = tone === 'primary' ? theme.colors.primary : theme.colors.secondary;
  const iconBgClass = tone === 'primary' ? 'bg-app-successSoft' : 'bg-app-card';

  return (
    <View
      className="flex-1 rounded-2xl bg-app-surface p-3 shadow-sm"
      style={{
        flexDirection: rowDir,
        alignItems: 'center',
        gap: 10,
        elevation: 2,
      }}
    >
      <View
        className={`h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] ${iconBgClass}`}
      >
        <Icon size={16} color={iconColor} />
      </View>
      <AppText variant="semibold" className="flex-1 text-[11.5px] leading-[17px] text-app-text">
        {label}
      </AppText>
    </View>
  );
}

export default function AuthDecisionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir, isRTL } = useRTL();

  const { loginWithOAuth, setGuestMode, isLoading, errorMessage } = useAuthStore();

  const handleGoogle = async () => {
    const ok = await loginWithOAuth('google');
    if (!ok) return;
    const user = useAuthStore.getState().user;
    router.replace((user?.profile_completed ? '/(main)' : '/(auth)/complete-profile') as never);
  };

  return (
    <View className="flex-1 bg-app-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom,
        }}
      >
        {/* ── Brand section ── */}
        <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
          <View
            className="shadow-sm"
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: theme.colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image source={splashLogo} style={{ width: 52, height: 52 }} resizeMode="contain" />
          </View>

          <AppText variant="bold" className="mt-4 text-center text-[22px] leading-8 text-app-text">
            {t('auth.decision.title')}
          </AppText>

          <AppText className="mt-1.5 px-2 text-center text-[13.5px] leading-[21px] text-app-textSoft">
            {t('auth.decision.subtitle')}
          </AppText>

          {/* Feature cards */}
          <View style={{ flexDirection: rowDir, gap: 10, width: '100%', marginTop: 16 }}>
            <FeatureCard
              icon={UtensilsCrossed}
              label="سجّل وجباتك يومياً"
              rowDir={rowDir}
              tone="primary"
            />
            <FeatureCard
              icon={HeartPulse}
              label="تابع صحتك وتحسّنك"
              rowDir={rowDir}
              tone="secondary"
            />
          </View>
        </View>

        {/* ── Spacer: small fixed gap, not flex ── */}
        <View style={{ height: 24 }} />

        {/* ── Auth card: sits below with natural spacing ── */}
        <View className="mx-4 rounded-3xl bg-app-surface shadow-sm">
          {/* Trust badge */}
          <View className="items-center w-full pt-5 mb-3 px-5">
            <AppText
              className="text-xs text-app-muted2"
              style={{ textAlign: 'center' }}
            >
              {t('auth.decision.trustBadge')}
            </AppText>
          </View>

          {/* Google button */}
          <View className="px-5 mb-3">
            <Pressable
              onPress={handleGoogle}
              disabled={isLoading}
              className="relative h-12 w-full items-center justify-center rounded-2xl border border-app-line bg-app-surface active:bg-gray-50"
              style={({ pressed }) => [{ opacity: isLoading ? 0.5 : pressed ? 0.85 : 1 }]}
            >
              {isLoading ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}
              {!isLoading ? (
                <>
                  <View
                    className="absolute top-0 h-12 items-center justify-center"
                    style={isRTL ? { right: 16 } : { left: 16 }}
                  >
                    <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                  </View>
                  <AppText variant="semibold" className="text-center text-[15px] text-app-text">
                    {t('auth.decision.continueWithGoogle')}
                  </AppText>
                </>
              ) : null}
            </Pressable>
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-2 mb-3 px-5">
            <View className="h-px flex-1 bg-app-lineSoft" />
            <AppText className="text-xs text-app-muted2">{t('auth.decision.orWithEmail')}</AppText>
            <View className="h-px flex-1 bg-app-lineSoft" />
          </View>

          {/* Primary CTA */}
          <View className="px-5 mb-3">
            <Pressable
              onPress={() => router.push('/(auth)/signup' as never)}
              className="h-[52px] w-full items-center justify-center rounded-2xl bg-app-primary shadow-sm active:bg-emerald-600"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <AppText variant="semibold" className="text-center text-[15.5px] text-white">
                {t('auth.decision.createAccount')}
              </AppText>
            </Pressable>
          </View>

          {/* Secondary CTA */}
          <View className="px-5 mb-3">
            <Pressable
              onPress={() => router.push('/(auth)/login' as never)}
              className="h-[50px] w-full items-center justify-center rounded-2xl border-2 border-app-primary bg-transparent active:bg-emerald-50"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <AppText variant="semibold" className="text-center text-[15px] text-app-primary">
                {t('auth.decision.login')}
              </AppText>
            </Pressable>
          </View>

          {errorMessage ? (
            <View className="px-5 mb-3">
              <View
                className="rounded-xl bg-app-surfaceAlt px-4 py-2.5"
                style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.error }}
              >
                <AppText style={{ fontSize: 13, lineHeight: 20, color: theme.colors.error }}>
                  {errorMessage}
                </AppText>
              </View>
            </View>
          ) : null}

          {/* Tertiary */}
          <View className="px-5 pb-4">
            <Pressable
              onPress={() => {
                setGuestMode();
                router.replace('/(main)' as never);
              }}
              className="items-center active:bg-gray-50"
              style={({ pressed }) => [{ opacity: pressed ? 0.65 : 1, paddingVertical: 0 }]}
            >
              <AppText
                className="text-center text-[13px] text-app-muted"
                style={{ textDecorationLine: 'underline' }}
              >
                {t('auth.decision.browseFirst')}
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* ── Bottom spacer: only if needed for scroll ── */}
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}