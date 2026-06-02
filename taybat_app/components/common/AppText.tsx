import React from 'react';
import { I18nManager, Platform, StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';

import { useAppStore } from '@/stores/app.store';
import { nf, nlh } from '@/utils/normalizeFont';

export type AppTextVariant = 'regular' | 'semibold' | 'bold';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  className?: string;
};

const FONT_SIZE_MAP: Record<string, number> = {
  'text-xs': 12,
  'text-sm': 14,
  'text-base': 16,
  'text-lg': 18,
  'text-xl': 20,
  'text-2xl': 24,
  'text-3xl': 30,
  'text-4xl': 36,
  'text-5xl': 48,
  'text-6xl': 60,
};

function extractPxValue(className: string | undefined, prefix: 'text' | 'leading'): number | undefined {
  if (!className) return undefined;
  const re = prefix === 'text' ? /(?:^|\s)text-\[(\d+(?:\.\d+)?)px\](?=\s|$)/ : /(?:^|\s)leading-\[(\d+(?:\.\d+)?)px\](?=\s|$)/;
  const m = className.match(re);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : undefined;
}

function extractFontSizeFromClassName(className: string | undefined): number | undefined {
  const px = extractPxValue(className, 'text');
  if (typeof px === 'number') return px;
  if (!className) return undefined;
  const parts = className.split(/\s+/).filter(Boolean);
  for (const token of parts) {
    const mapped = FONT_SIZE_MAP[token];
    if (typeof mapped === 'number') return mapped;
  }
  return undefined;
}

function extractLineHeightFromClassName(className: string | undefined): number | undefined {
  return extractPxValue(className, 'leading');
}

export function AppText({ variant = 'regular', className, ...props }: AppTextProps) {
  const language = useAppStore((s) => s.language);
  const variantClass =
    variant === 'bold' ? 'font-cairo-bold' : variant === 'semibold' ? 'font-cairo-semibold' : 'font-cairo';

  const isRTL = language === 'ar' || I18nManager.isRTL;
  const baseStyle = isRTL
    ? (Platform.OS === 'ios'
        ? ({ writingDirection: 'rtl', textAlign: 'right' } as const)
        : ({ writingDirection: 'rtl' } as const))
    : ({ writingDirection: 'ltr' } as const);

  // includeFontPadding:false removes Android's invisible extra padding around text lines
  // that makes text appear visually taller/larger than on iOS.
  const flat = StyleSheet.flatten(props.style);
  const rawFontSize = typeof flat?.fontSize === 'number' ? flat.fontSize : extractFontSizeFromClassName(className);
  const rawLineHeight = typeof flat?.lineHeight === 'number' ? flat.lineHeight : extractLineHeightFromClassName(className);
  const override: TextStyle = {
    ...(typeof rawFontSize === 'number' ? { fontSize: nf(rawFontSize) } : null),
    ...(typeof rawLineHeight === 'number' ? { lineHeight: nlh(rawLineHeight) } : null),
  };
  const style = [{ includeFontPadding: false }, baseStyle, props.style, Object.keys(override).length ? override : null];

  return (
    <RNText
      {...props}
      allowFontScaling={false}
      style={style}
      className={`${variantClass}${className ? ` ${className}` : ''}`}
    />
  );
}

type AppTextInputProps = TextInputProps & {
  variant?: AppTextVariant;
  className?: string;
};

export function AppTextInput({ variant = 'regular', className, ...props }: AppTextInputProps) {
  const language = useAppStore((s) => s.language);
  const variantClass =
    variant === 'bold' ? 'font-cairo-bold' : variant === 'semibold' ? 'font-cairo-semibold' : 'font-cairo';

  const isRTL = language === 'ar' || I18nManager.isRTL;
  const baseStyle = isRTL
    ? ({ writingDirection: 'rtl', textAlign: 'right' } as const)
    : ({ writingDirection: 'ltr' } as const);

  const flat = StyleSheet.flatten(props.style);
  const rawFontSize = typeof flat?.fontSize === 'number' ? flat.fontSize : extractFontSizeFromClassName(className);
  const rawLineHeight = typeof flat?.lineHeight === 'number' ? flat.lineHeight : extractLineHeightFromClassName(className);
  const override: TextStyle = {
    ...(typeof rawFontSize === 'number' ? { fontSize: nf(rawFontSize) } : null),
    ...(typeof rawLineHeight === 'number' ? { lineHeight: nlh(rawLineHeight) } : null),
  };
  const style = [baseStyle, props.style, Object.keys(override).length ? override : null];

  return (
    <RNTextInput
      {...props}
      allowFontScaling={false}
      style={style}
      className={`${variantClass}${className ? ` ${className}` : ''}`}
    />
  );
}
