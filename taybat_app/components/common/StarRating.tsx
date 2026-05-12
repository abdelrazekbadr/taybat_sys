import { Star } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StarRatingProps {
  value: number;
  size?: number;
  gap?: number;
}

const STAR_COLORS: Record<number, string> = {
  5: '#10B981',  // green zone
  4: '#F5C24A',  // yellow zone
  3: '#F08A4B',  // orange zone
  2: '#9B7AC8',  // purple zone
  1: '#E36A6A',  // red zone
};

const EMPTY_COLOR = '#D1D5DB';

export function StarRating({ value = 5, size = 13, gap = 2 }: StarRatingProps) {
  const rounded = Math.min(5, Math.max(1, Math.round(value)));
  const color = STAR_COLORS[rounded] ?? '#10B981';

  return (
    <View style={[styles.row, { gap }]}>
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
