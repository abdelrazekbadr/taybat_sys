import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import type { MealSpinnerProps } from './types';

const SPEED_DURATION: Record<string, number> = {
  slow: 3000,
  normal: 2000,
  fast: 1000,
};

const DEFAULT_PLATE = '🍽️';

export function PulseSpinner({ size = 120, speed = 'normal', plateEmoji = DEFAULT_PLATE }: MealSpinnerProps) {
  const theme = useTheme();

  const ring0 = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const duration = SPEED_DURATION[speed] ?? 2000;
    const stagger  = Math.floor(duration / 3);

    const makeLoop = (val: Animated.Value) =>
      Animated.loop(
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      );

    const composite = Animated.parallel([
      Animated.sequence([Animated.delay(0),          makeLoop(ring0)]),
      Animated.sequence([Animated.delay(stagger),    makeLoop(ring1)]),
      Animated.sequence([Animated.delay(stagger * 2), makeLoop(ring2)]),
    ]);

    composite.start();
    return () => composite.stop();
  }, [ring0, ring1, ring2, speed]);

  const interpolate = (val: Animated.Value) => ({
    scale:   val.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    opacity: val.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.85, 0.35, 0] }),
  });

  const rings = [ring0, ring1, ring2].map(interpolate);
  const plateFontSize = size * 0.25;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
      {rings.map(({ scale, opacity }, i) => (
        <Animated.View
          key={i}
          style={{
            position:    'absolute',
            width:       size,
            height:      size,
            borderRadius: size / 2,
            borderWidth:  2,
            borderColor:  theme.colors.primary,
            transform:   [{ scale }],
            opacity,
          }}
        />
      ))}
      <Text style={{ fontSize: plateFontSize }}>{plateEmoji}</Text>
    </View>
  );
}
