// <MealSpinner />
// <MealSpinner variant="pulse" size={80} speed="fast" />
// <MealSpinner variant="orbit" items={['🍚', '🍯', '🫒', '🌴']} label="جاري التحميل..." />
// <MealSpinner variant="arc" size={160} speed="slow" />

import React from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { ArcSpinner } from './ArcSpinner';
import { OrbitSpinner } from './OrbitSpinner';
import { PulseSpinner } from './PulseSpinner';
import type { MealSpinnerProps } from './types';

export { type MealSpinnerProps, type SpinnerSize, type SpinnerSpeed, type SpinnerVariant } from './types';

export function MealSpinner({ variant = 'orbit', label, labelStyle, ...rest }: MealSpinnerProps) {
  let spinner: React.ReactElement;

  if (variant === 'pulse') {
    spinner = <PulseSpinner {...rest} />;
  } else if (variant === 'arc') {
    spinner = <ArcSpinner {...rest} />;
  } else {
    spinner = <OrbitSpinner {...rest} />;
  }

  if (!label) return spinner;

  return (
    <View style={{ alignItems: 'center', gap: 14 }}>
      {spinner}
      <AppText
        variant="semibold"
        style={[{ fontSize: 14, color: '#6B7280' }, labelStyle]}
      >
        {label}
      </AppText>
    </View>
  );
}
