import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Animated, Easing, I18nManager, Image, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

import { STORAGE_KEYS } from '@/api/storage/storageKeys';
import { storageService } from '@/api/storage/storageService';
import { AppText } from '@/components/common/AppText';
import { useAppStore } from '@/stores/app.store';
import { useAuthStore } from '@/stores/auth.store';

const splashBg = require('../assets/images/app_splash_bg.png');
const splashLogo = require('../assets/images/app_splash_logo.png');

type SplashState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

export default function SplashRouteWeb() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language } = useAppStore();
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const isRTL = language === 'ar' || I18nManager.isRTL;
  const [state, setState] = React.useState<SplashState>({ status: 'loading' });
  const [redirectTo, setRedirectTo] = React.useState<string | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        await initializeAuth();
        const status = useAuthStore.getState().status;
        const hasSeen = (await storageService.get<boolean>(STORAGE_KEYS.HAS_SEEN_ONBOARDING)) === true;

        const next =
          status === 'authenticated' || status === 'guest'
            ? '/(main)'
            : hasSeen
              ? '/(auth)/auth-decision'
              : '/(auth)/onboarding';
        setRedirectTo(next);
        setState({ status: 'ready' });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load';
        setState({ status: 'error', message });
      }
    };

    run().catch(() => setState({ status: 'error', message: 'Failed to load' }));
  }, [initializeAuth]);

  const loaderX = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderX, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loaderX, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [loaderX]);

  const loaderTranslateX = loaderX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 84],
  });

  if (state.status === 'ready' && redirectTo) {
    return <Redirect href={redirectTo as never} />;
  }

return (
  <View className="flex-1 bg-app-primary w-screen h-screen">
    <StatusBar style="light" />

    {/* FULL SCREEN BACKGROUND */}
    <ImageBackground
      source={splashBg}
      resizeMode="cover"
      style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      imageStyle={{ width: '100%', height: '100%', transform: [{ scale: 1.08 }] }}
    >
      {/* Overlay */}
      <View className="absolute inset-0 bg-app-primary/85" />

      <LinearGradient
        colors={[theme.colors.secondary, theme.colors.primary]}
        className="absolute inset-0"
        style={{ opacity: 0.22 }}
      />
    </ImageBackground>

    {/* CONTENT */}
    <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-between px-6 py-16">
        
        <View />

        {/* Center */}
        <View className="items-center">
          <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/20">
            <Image source={splashLogo} className="h-14 w-14" resizeMode="contain" />
          </View>

          <AppText
            variant="bold"
            className={`mb-2 text-[32px] tracking-tight text-white ${isRTL ? 'text-right' : 'text-left'}`}
          >
            {t('splash_title')}
          </AppText>

          <AppText className={`text-lg text-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('splash_tagline')}
          </AppText>

          {state.status === 'error' && (
            <AppText className={`mt-4 text-sm text-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
              {state.message}
            </AppText>
          )}
        </View>

        {/* Bottom */}
        <View className="items-center gap-8">
          <View className="h-[2px] w-[140px] overflow-hidden rounded-full bg-white/20">
            <Animated.View
              className="h-full w-[56px] rounded-full bg-white"
              style={{ transform: [{ translateX: loaderTranslateX }] }}
            />
          </View>

          <AppText
            variant="semibold"
            className="text-center text-[14px] tracking-[3px] text-white/60"
          >
            {t('splash_footer')}
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  </View>
);
}
