import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { BadgeCheck } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { useRTL } from '@/hooks/useRTL';
import type { HealthGoal } from '@/types';

export function ProfileStepGoals(props: {
  goals: HealthGoal[];
  value: number[];
  onChange: (v: number[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const isEnglish = i18n.language?.startsWith('en');
  const options: OptionItem<number>[] = props.goals.map((g) => ({
    key: g.id,
    label: isEnglish && g.name_en ? g.name_en : g.name,
    icon: { kind: 'image', name: g.image ?? 'dish', tint: false },
  }));

  return (
    <View style={{ gap: 20 }}>

      {/* Info card */}
      <View
        style={{
          borderRadius: 16,
          backgroundColor: theme.colors.primaryContainer,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: rowDir,
          alignItems: 'center',
          gap: 10,
        }}
      >
        <BadgeCheck size={20} color={theme.colors.primary} strokeWidth={1.75} />
        <AppText style={{ flex: 1, fontSize: 13, color: theme.colors.primary, lineHeight: 20 }}>
           لتجربة افضل  اختر هدف او اكثر
        </AppText>
      </View>

      {/* Badge grid */}
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

      {/* Selected count */}
      {props.value.length > 0 && (
        <AppText
          style={{
            fontSize: 12,
            color: theme.colors.primary,
            textAlign: 'center',
          }}
        >
          {props.value.length === 1
            ? 'هدف واحد محدد'
            : `${props.value.length} أهداف محددة`}
        </AppText>
      )}
    </View>
  );
}
