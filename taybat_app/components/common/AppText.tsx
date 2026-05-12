import React from 'react';
import { I18nManager, Platform, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps } from 'react-native';

import { useAppStore } from '@/stores/app.store';

export type AppTextVariant = 'regular' | 'semibold' | 'bold';

type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  className?: string;
};

export function AppText({ variant = 'regular', className, ...props }: AppTextProps) {
  const language = useAppStore((s) => s.language);
  const variantClass =
    variant === 'bold' ? 'font-cairo-bold' : variant === 'semibold' ? 'font-cairo-semibold' : 'font-cairo';

  const isRTL = language === 'ar' || I18nManager.isRTL;
  // Android: native RTL flip is active after forceRTL+reload — writingDirection
  // alone is sufficient (textAlign:'right' would conflict with the flipped axis).
  // iOS: native RTL flip is disabled (see _layout.tsx), so we need explicit
  // textAlign:'right' to right-align Arabic text within each container.
  const baseStyle = isRTL
    ? (Platform.OS === 'ios'
        ? ({ writingDirection: 'rtl', textAlign: 'right' } as const)
        : ({ writingDirection: 'rtl' } as const))
    : ({ writingDirection: 'ltr' } as const);
  const style = [baseStyle, props.style];

  return (
    <RNText
      {...props}
      allowFontScaling={props.allowFontScaling ?? false}
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
  const style = [baseStyle, props.style];

  return (
    <RNTextInput
      {...props}
      allowFontScaling={props.allowFontScaling ?? false}
      style={style}
      className={`${variantClass}${className ? ` ${className}` : ''}`}
    />
  );
}
