import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { I18nextProvider } from 'react-i18next';
import { DevSettings, I18nManager, Platform, View, useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import i18n from '@/localization/i18n';
import { useAppStore } from '@/stores/app.store';
import { useThemeStore } from '@/stores/theme.store';
import { buildNavigationTheme, buildPaperTheme } from '@/theme';
import './_nativewind-interop';
import './global.css';

// iOS: all RTL is handled via explicit JS styles (row-reverse, textAlign).
// Disable native RTL flip so it never conflicts with those explicit overrides.
if (Platform.OS === 'ios') {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const systemIsDark = useColorScheme() === 'dark';
  const { mode, initializeThemeMode } = useThemeStore();
  const { initializeApp } = useAppStore();
  const language = useAppStore((s) => s.language);
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular: require('../assets/fonts/Cairo-Regular.ttf'),
    Cairo_600SemiBold: require('../assets/fonts/Cairo-SemiBold.ttf'),
    Cairo_700Bold: require('../assets/fonts/Cairo-Bold.ttf'),
    ...MaterialCommunityIcons.font,
  });
  const [isBootstrapped, setIsBootstrapped] = React.useState(false);
  const [isLangReady, setIsLangReady] = React.useState(false);
  const [isSplashHidden, setIsSplashHidden] = React.useState(false);
  const [rtlKey, setRtlKey] = React.useState(0);
  const didAttemptNativeReloadRef = React.useRef(false);

  React.useEffect(() => {
    if (fontError) {
      throw fontError;
    }
  }, [fontError]);

  React.useEffect(() => {
    const run = async () => {
      await initializeThemeMode();
      await initializeApp();
      setIsBootstrapped(true);
    };
    run().catch(() => {});
  }, [initializeApp, initializeThemeMode]);

  React.useEffect(() => {
    const run = async () => {
      if (!isBootstrapped) {
        return;
      }

      if (i18n.language !== language) {
        await i18n.changeLanguage(language);
      }

      const shouldRTL = language === 'ar';
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.documentElement.setAttribute('dir', shouldRTL ? 'rtl' : 'ltr');
      }

      if (Platform.OS !== 'ios' && I18nManager.isRTL !== shouldRTL) {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);

        if (Platform.OS === 'android' && !didAttemptNativeReloadRef.current) {
          didAttemptNativeReloadRef.current = true;
          try {
            await import('expo-updates').then((m) => m.reloadAsync());
            return;
          } catch {
            DevSettings.reload();
            return;
          }
        }

        setRtlKey((prev) => prev + 1);
      }

      setIsLangReady(true);
    };

    run().catch(() => setIsLangReady(true));
  }, [isBootstrapped, language]);

  React.useEffect(() => {
    const run = async () => {
      if (!isBootstrapped || !isLangReady || !fontsLoaded) {
        return;
      }
      await SplashScreen.hideAsync();
      setIsSplashHidden(true);
    };
    run().catch(() => setIsSplashHidden(true));
  }, [fontsLoaded, isBootstrapped, isLangReady]);

  const paperTheme = React.useMemo(
    () => buildPaperTheme({ mode, systemIsDark }),
    [mode, systemIsDark],
  );

  const navigationTheme = React.useMemo(
    () => buildNavigationTheme({ mode, systemIsDark }),
    [mode, systemIsDark],
  );

  if (!isBootstrapped || !isLangReady || !fontsLoaded || !isSplashHidden) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n} key={rtlKey}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <PaperProvider
            theme={paperTheme}
            settings={{
              icon: (props) => (
                <MaterialCommunityIcons
                  name={props.name as keyof typeof MaterialCommunityIcons.glyphMap}
                  color={props.color ?? paperTheme.colors.onSurface}
                  size={props.size ?? 24}
                  direction={props.direction}
                />
              ),
            }}
          >
            <ThemeProvider value={navigationTheme}>
              <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
                <StatusBar
                  style={paperTheme.dark ? 'light' : 'dark'}
                  backgroundColor={paperTheme.colors.background}
                />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: paperTheme.colors.background },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="splash" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(main)" />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </View>
            </ThemeProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
