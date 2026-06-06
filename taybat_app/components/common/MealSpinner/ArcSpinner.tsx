import React from 'react';
import { Animated, View } from 'react-native';

import type { MealSpinnerProps } from './types';
import { useMealSpinner } from './useMealSpinner';

const DOT_OPACITIES = [1, 0.85, 0.65, 0.45, 0.25, 0.1];

export function ArcSpinner({ size = 120, speed = 'normal' }: MealSpinnerProps) {
  const { rotationStr } = useMealSpinner(speed);

  const dotSize = size * 0.11;
  const radius  = size * 0.38;

  return (
    <Animated.View
      style={{
        width:  size,
        height: size,
        alignSelf: 'center',
        transform: [{ rotate: rotationStr }],
      }}
    >
      {DOT_OPACITIES.map((opacity, i) => {
        const angle = (2 * Math.PI / DOT_OPACITIES.length) * i;
        const left  = size / 2 + radius * Math.cos(angle) - dotSize / 2;
        const top   = size / 2 + radius * Math.sin(angle) - dotSize / 2;

        return (
          <View
            key={i}
            style={{
              position:     'absolute',
              width:        dotSize,
              height:       dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: '#AAAAAA',
              opacity,
              left,
              top,
            }}
          />
        );
      })}
    </Animated.View>
  );
}
