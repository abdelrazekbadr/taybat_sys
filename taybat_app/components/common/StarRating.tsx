import { Star } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { getZoneMeta } from '@/utils/zoneUtils';

interface StarRatingProps {
  value: number;
  size?: number;
  gap?: number;
}

const EMPTY_COLOR = 'rgba(148, 163, 184, 0.55)';

export function StarRating({ value = 5, size = 13, gap = 2 }: StarRatingProps) {
  const rounded = Math.min(5, Math.max(1, Math.round(value)));
  const zone = (6 - rounded) as 1 | 2 | 3 | 4 | 5;
  const { color } = getZoneMeta(zone);

  return (
    <View className="flex-row items-center" style={{ gap }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color={i <= Math.floor(value) ? color : EMPTY_COLOR}
          fill={i <= Math.floor(value) ? color : 'transparent'}
          strokeWidth={1.5}
        />
      ))}
    </View>
  );
}
