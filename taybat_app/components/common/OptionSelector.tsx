import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { ICON_SOURCES } from '@/utils/iconSources';

export type OptionDescriptor =
  | { kind: 'lucide'; Icon: LucideIcon }
  | { kind: 'image'; name: string; tint?: boolean };

export type OptionItem<K extends string | number> = {
  key: K;
  label: string;
  /** Full descriptor OR a plain string shorthand for { kind: 'image', name } */
  icon?: OptionDescriptor | string;
};

type Layout = 'iconTop' | 'iconStart';
type Variant = 'soft' | 'solid';

type BaseProps<K extends string | number> = {
  options: OptionItem<K>[];
  disabled?: boolean;
  layout?: Layout;
  variant?: Variant;
  iconSize?: number;
  containerDirection?: 'row' | 'column';
  wrapperClassName?: string;
  itemClassName?: string;
};

type SingleProps<K extends string | number> = BaseProps<K> & {
  mode: 'single';
  value: K | null;
  onChange: (value: K) => void;
};

type MultipleProps<K extends string | number> = BaseProps<K> & {
  mode: 'multiple';
  value: K[];
  onChange: (value: K[]) => void;
};

function AssetImage({ name, size, color, tint }: { name: string; size: number; color: string; tint?: boolean }) {
  const isRemote = /^https?:\/\//.test(name);
  if (isRemote) {
    return (
      <Image
        source={{ uri: name }}
        style={{ width: size, height: size, ...(tint ? { tintColor: color } : null) }}
        resizeMode="contain"
      />
    );
  }
  const src = ICON_SOURCES[name];
  if (!src) return null;
  return (
    <Image
      source={src}
      style={{ width: size, height: size, ...(tint ? { tintColor: color } : null) }}
      resizeMode="contain"
    />
  );
}

export function OptionSelector<K extends string | number>(props: SingleProps<K> | MultipleProps<K>) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const layout: Layout = props.layout ?? 'iconStart';
  const variant: Variant = props.variant ?? (layout === 'iconTop' ? 'soft' : 'solid');
  const containerFlexDirection = props.containerDirection === 'column' ? 'column' : rowDir;

  const isSelected = (key: K) => {
    if (props.mode === 'single') return props.value === key;
    return props.value.includes(key);
  };

  const handlePress = (key: K) => {
    if (props.disabled) return;
    if (props.mode === 'single') {
      props.onChange(key);
      return;
    }
    const exists = props.value.includes(key);
    props.onChange(exists ? props.value.filter((v) => v !== key) : [...props.value, key]);
  };

  const baseWrapperClassName = layout === 'iconTop' ? 'flex-row gap-2' : 'flex-row flex-wrap justify-between gap-y-3';
  const wrapperClassName = props.wrapperClassName ?? baseWrapperClassName;

  return (
    <View className={wrapperClassName} style={{ flexDirection: containerFlexDirection }}>
      {props.options.map((opt) => {
        const selected = isSelected(opt.key);
        const inactive = Boolean(props.disabled);

        const borderColor = selected ? theme.colors.primary : theme.colors.outlineVariant;
        const backgroundColor =
          variant === 'solid'
            ? selected ? theme.colors.primary : theme.colors.surface
            : selected ? theme.colors.primaryContainer : theme.colors.surface;

        const contentColor =
          variant === 'solid'
            ? selected ? theme.colors.onPrimary : theme.colors.onSurfaceVariant
            : selected ? theme.colors.onPrimaryContainer : theme.colors.onSurfaceVariant;

        const innerClassName =
          layout === 'iconTop'
            ? 'items-center justify-center rounded-[16px] border p-2.5'
            : 'flex-row items-center gap-2 rounded-[14px] border px-3 py-3';

        const iconSize = props.iconSize ?? (layout === 'iconTop' ? 22 : 18);
        const labelClassName = layout === 'iconTop' ? 'mt-1 text-center text-[11px] leading-5' : 'flex-1 text-[12.5px] leading-5';

        return (
          <Pressable
            key={String(opt.key)}
            onPress={() => handlePress(opt.key)}
            disabled={inactive}
            className={props.itemClassName ?? (layout === 'iconTop' ? 'flex-1' : 'w-[48%]')}
            style={({ pressed }) => [{ opacity: inactive ? 0.4 : pressed ? (layout === 'iconTop' ? 0.85 : 0.9) : 1 }]}
          >
            <View
              className={innerClassName}
              style={{
                flexDirection: layout === 'iconStart' ? rowDir : undefined,
                borderColor,
                backgroundColor,
              }}
            >
              {opt.icon ? (() => {
                const icon: OptionDescriptor = typeof opt.icon === 'string' ? { kind: 'image', name: opt.icon } : opt.icon;
                return icon.kind === 'lucide'
                  ? <icon.Icon size={iconSize} color={contentColor} strokeWidth={2.4} />
                  : <AssetImage name={icon.name} size={iconSize} color={contentColor} tint={icon.tint} />;
              })() : null}
              <AppText variant="semibold" className={labelClassName} style={{ color: contentColor }}>
                {opt.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
