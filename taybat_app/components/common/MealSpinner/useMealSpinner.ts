import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

import type { SpinnerSpeed } from './types';

const SPEED_DURATION: Record<SpinnerSpeed, number> = {
  slow: 3000,
  normal: 2000,
  fast: 1000,
};

export function useMealSpinner(speed: SpinnerSpeed = 'normal') {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: SPEED_DURATION[speed],
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotation, speed]);

  const rotationStr = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const negRotationStr = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return { rotation, rotationStr, negRotationStr };
}
