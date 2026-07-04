import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

interface SkeletonProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block used while real content (images, list rows) is
 * still loading. Compose with layout classNames to match the shape of the
 * content it stands in for (e.g. `h-[54px] w-[54px] rounded-[16px]`).
 */
export function Skeleton({ className, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View className={`bg-app-surfaceAlt ${className ?? ''}`} style={[{ opacity }, style]} />;
}
