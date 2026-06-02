import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { BadgeCheck } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { useRTL } from '@/hooks/useRTL';
import type { HealthCondition } from '@/types';

export function ProfileStepHealthConditions(props: {
  conditions: HealthCondition[];
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const isEnglish = i18n.language?.startsWith('en');
  const options: OptionItem<string>[] = props.conditions.map((c) => ({
    key: c.code,
    label: isEnglish && c.name_en ? c.name_en : c.name,
    icon: { kind: 'image', name: c.image ?? 'dish', tint: false },
  }));

  return (
    <View style={{ gap: 20 }}>
      <View
        style={{
          borderRadius: 16,
          backgroundColor: theme.colors.surfaceVariant ?? theme.colors.surface,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: rowDir,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BadgeCheck size={20} color={theme.colors.onSurfaceVariant ?? theme.colors.onSurface} strokeWidth={1.75} />
        <AppText style={{ flex: 1, fontSize: 13, color: theme.colors.onSurfaceVariant ?? theme.colors.onSurface, lineHeight: 20 }}>
          {t('auth.completeProfile.healthConditions')}
        </AppText>
      </View>

      <OptionSelector
        mode="multiple"
        layout="iconStart"
        variant="soft"
        options={options}
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        iconSize={18}
        wrapperClassName="flex-row flex-wrap justify-between gap-y-3"
        itemClassName="w-[48%]"
      />

      {props.error ? (
        <AppText style={{ fontSize: 12, textAlign: 'center', color: theme.colors.error }}>
          {props.error}
        </AppText>
      ) : null}

      {props.value.length > 0 && (
        <AppText
          style={{
            fontSize: 12,
            color: theme.colors.primary,
            textAlign: 'center',
          }}
        >
          {props.value.length === 1 ? 'حالة واحدة محددة' : `${props.value.length} حالات محددة`}
        </AppText>
      )}
    </View>
  );
}
