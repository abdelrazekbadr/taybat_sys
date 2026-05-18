import React from 'react';
import { View } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

import { useRTL } from '@/hooks/useRTL';

type ChipOption = {
  key: string;
  label: string;
};

export function ChipSelector(props: {
  options: ChipOption[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View className="flex-row flex-wrap gap-2" style={{ flexDirection: rowDir }}>
      {props.options.map((o) => {
        const selected = props.value === o.key;
        return (
          <Chip
            key={o.key}
            mode={selected ? 'flat' : 'outlined'}
            selected={selected}
            onPress={() => props.onChange(o.key)}
            style={{
              borderColor: selected ? theme.colors.primary : theme.colors.outline,
              backgroundColor: selected ? theme.colors.primary : 'transparent',
            }}
            textStyle={{
              color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
              fontFamily: theme.fonts.bodyMedium.fontFamily,
            }}
          >
            {o.label}
          </Chip>
        );
      })}
    </View>
  );
}

export function MultiChipSelector(props: {
  options: ChipOption[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  const toggle = (key: string) => {
    const exists = props.value.includes(key);
    props.onChange(exists ? props.value.filter((v) => v !== key) : [...props.value, key]);
  };

  return (
    <View className="flex-row flex-wrap gap-2" style={{ flexDirection: rowDir }}>
      {props.options.map((o) => {
        const selected = props.value.includes(o.key);
        return (
          <Chip
            key={o.key}
            mode={selected ? 'flat' : 'outlined'}
            selected={selected}
            onPress={() => toggle(o.key)}
            style={{
              borderColor: selected ? theme.colors.primary : theme.colors.outline,
              backgroundColor: selected ? theme.colors.primary : 'transparent',
            }}
            textStyle={{
              color: selected ? theme.colors.onPrimary : theme.colors.onSurface,
              fontFamily: theme.fonts.bodyMedium.fontFamily,
            }}
          >
            {o.label}
          </Chip>
        );
      })}
    </View>
  );
}

