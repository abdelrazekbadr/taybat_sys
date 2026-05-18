import { router } from 'expo-router';
import React from 'react';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const splashLogo = require('../../assets/images/app_splash_logo.png');

export default function AuthDecisionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const { loginWithOAuth, setGuestMode, isLoading, errorMessage } = useAuthStore();

  const handleGoogle = async () => {
    const ok = await loginWithOAuth('google');
    if (!ok) return;
    const user = useAuthStore.getState().user;
    router.replace((user?.profile_completed ? '/(main)' : '/(auth)/complete-profile') as never);
  };

  return (
    <View className="flex-1 bg-app-background px-6">
      <View className="flex-1 justify-center">
        <View className="items-center">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border border-app-lineSoft bg-app-surface">
            <Image source={splashLogo} className="h-14 w-14 bg-gray-100" resizeMode="contain" />
          </View>

          <AppText variant="bold" className="text-center text-[22px] leading-8 text-app-text">
            {t('auth.decision.title')}
          </AppText>
          <AppText className="mt-2 text-center text-[14px] leading-6 text-app-muted">
            {t('auth.decision.subtitle')}
          </AppText>
        </View>

        <View className="mt-8 gap-4">
          <SocialAuthButtons isLoading={isLoading} onGooglePress={handleGoogle} />

          <View className="mt-2 gap-3">
            <PrimaryButton title={t('auth.decision.createAccount')} onPress={() => router.push('/(auth)/signup' as never)} />
            <View className="rounded-xl border border-app-lineSoft bg-app-surface">
              <View className="px-3 py-2.5" style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'center' }}>
                <AppText
                  variant="semibold"
                  className="text-[16px] text-app-primary"
                  onPress={() => router.push('/(auth)/login' as never)}
                >
                  {t('auth.decision.login')}
                </AppText>
              </View>
            </View>
          </View>

          {errorMessage ? (
            <View className="rounded-xl bg-app-surface px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.error }}>
              <AppText className="text-[13px] leading-5" style={{ color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          <View className="mt-2 items-center">
            <AppText
              className="text-[13px] leading-6 text-app-textMuted"
              onPress={() => {
                setGuestMode();
                router.replace('/(main)' as never);
              }}
            >
              {t('auth.decision.browseFirst')}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}

