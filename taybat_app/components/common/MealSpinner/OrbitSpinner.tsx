import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import type { MealSpinnerProps } from './types';
import { useMealSpinner } from './useMealSpinner';

const DEFAULT_ITEMS = ['🍚', '🍯', '🫒', '🌴'];
const DEFAULT_PLATE = '🍽️';

export function OrbitSpinner({ size = 120, speed = 'normal', items = DEFAULT_ITEMS, plateEmoji = DEFAULT_PLATE }: MealSpinnerProps) {
  const { rotationStr, negRotationStr } = useMealSpinner(speed);

  const plateSize = size * 0.34;
  const itemSize  = size * 0.22;
  const radius    = size * 0.4;
  const plateFontSize = plateSize * 0.65;
  const itemFontSize  = itemSize  * 0.65;

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      {/* Center plate — rotates clockwise */}
      <Animated.View
        style={[
          styles.plate,
          {
            width:  plateSize,
            height: plateSize,
            borderRadius: plateSize / 2,
            top:  size / 2 - plateSize / 2,
            left: size / 2 - plateSize / 2,
            transform: [{ rotate: rotationStr }],
          },
        ]}
      >
        <Text style={{ fontSize: plateFontSize }}>{plateEmoji}</Text>
      </Animated.View>

      {/* Orbit container — rotates carrying all items */}
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotationStr }] }]}>
        {items.map((emoji, i) => {
          // Start from the top (−90°) so first item appears at 12 o'clock
          const angle = (2 * Math.PI / items.length) * i - Math.PI / 2;
          const x = size / 2 + radius * Math.cos(angle) - itemSize / 2;
          const y = size / 2 + radius * Math.sin(angle) - itemSize / 2;

          return (
            <Animated.View
              key={i}
              style={[
                styles.foodItem,
                {
                  width:  itemSize,
                  height: itemSize,
                  borderRadius: itemSize / 2,
                  left: x,
                  top:  y,
                  transform: [{ rotate: negRotationStr }],
                },
              ]}
            >
              <Text style={{ fontSize: itemFontSize }}>{emoji}</Text>
            </Animated.View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  foodItem: {
    position: 'absolute',
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
});
