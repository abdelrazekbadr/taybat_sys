import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperLightTheme,
  type MD3Theme,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationLightTheme,
  type Theme as NavigationTheme,
} from '@react-navigation/native';

import { themeTokens } from './tokens';

export type ThemeMode = 'system' | 'light' | 'dark';

export function isDarkMode(params: { mode: ThemeMode; systemIsDark: boolean }) {
  return params.mode === 'dark' || (params.mode === 'system' && params.systemIsDark);
}

export function buildPaperTheme(params: {
  mode: ThemeMode;
  systemIsDark: boolean;
}): MD3Theme {
  const dark = isDarkMode(params);
  const brand = themeTokens.colors.brand;
  const palette = dark ? themeTokens.colors.dark : themeTokens.colors.light;
  const base = dark ? PaperDarkTheme : PaperLightTheme;

  const regular = 'Cairo_400Regular';
  const semiBold = 'Cairo_600SemiBold';
  const bold = 'Cairo_700Bold';

  const fonts = Object.fromEntries(
    Object.entries(base.fonts).map(([key, value]) => {
      const fontWeight = typeof value.fontWeight === 'string' ? Number(value.fontWeight) : undefined;
      const family = fontWeight && fontWeight >= 700 ? bold : fontWeight && fontWeight >= 600 ? semiBold : regular;
      return [key, { ...value, fontFamily: family }];
    }),
  ) as MD3Theme['fonts'];

  return {
    ...base,
    fonts,
    colors: {
      ...base.colors,
      primary: brand.emerald,
      secondary: brand.teal,
      background: palette.background,
      surface: palette.surface,
      onSurface: palette.text,
      onBackground: palette.text,
      outline: palette.border,
      error: brand.rose,
    },
  };
}

export function buildNavigationTheme(params: {
  mode: ThemeMode;
  systemIsDark: boolean;
}): NavigationTheme {
  const paperTheme = buildPaperTheme(params);
  const dark = isDarkMode(params);
  const base = dark ? NavigationDarkTheme : NavigationLightTheme;

  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: paperTheme.colors.primary,
      background: paperTheme.colors.background,
      card: paperTheme.colors.surface,
      text: paperTheme.colors.onSurface,
      border: paperTheme.colors.outline,
      notification: themeTokens.colors.brand.gold,
    },
  };
}
