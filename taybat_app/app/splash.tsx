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
import { useAppStore } from '@/stores/app.store';
import { useAuthStore } from '@/stores/auth.store';
import { AppText } from '@/components/common/AppText';

const appIcon = require('../assets/images/app_icon.png');
const splashBg = require('../assets/images/app_splash_bg.png');
const splashLogo = require('../assets/images/app_splash_logo.png');

type SplashState =
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; message: string };

export default function SplashRoute() {
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
        Image.resolveAssetSource(appIcon);
        Image.resolveAssetSource(splashBg);

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
        const message = error instanceof Error ? error.message : 'Failed to load assets';
        setState({ status: 'error', message });
      }
    };

    run().catch(() => setState({ status: 'error', message: 'Failed to load assets' }));
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
    <View className="flex-1 bg-app-primary">
      <StatusBar style="light" />
      <ImageBackground
        source={splashBg}
        resizeMode="cover"
        className="h-full w-full flex-1"
        imageStyle={{ width: '100%', height: '100%', transform: [{ scale: 1.08 }] }}
      >
        <View className="absolute inset-0 bg-app-primary/85" />
        <LinearGradient
          colors={[theme.colors.secondary, theme.colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.22 }}
        />
        <View className="absolute inset-0 opacity-10">
          <View className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white" />
          <View className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white" />
        </View>

        <SafeAreaView edges={['bottom']} className="flex-1">
          <View className="flex-1 items-center justify-between px-6 py-16">
            <View className="h-1" />

            <View className="items-center">
              <View className="mb-5 h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10">
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

              {state.status === 'error' ? (
                <AppText className={`mt-4 text-sm text-white/90 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {state.message}
                </AppText>
              ) : null}
            </View>

            <View className="items-center gap-8">
              <View className="h-[2px] w-[140px] overflow-hidden rounded-full bg-white/20">
                <Animated.View
                  className="h-full w-[56px] rounded-full bg-white"
                  style={{ transform: [{ translateX: loaderTranslateX }] }}
                />
              </View>

              <AppText
                variant="semibold"
                className="text-center text-[14px] tracking-[3.2px] text-white/60"
              >
                {t('splash_footer')}
              </AppText>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
