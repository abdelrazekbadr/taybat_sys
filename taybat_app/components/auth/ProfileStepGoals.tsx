import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { MultiChipSelector } from '@/components/common/ChipSelector';

export function ProfileStepGoals(props: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.healthGoals')}</AppText>
      <View style={{ opacity: props.disabled ? 0.6 : 1 }}>
        <MultiChipSelector
          options={[
            { key: 'goal_inflammation', label: t('auth.completeProfile.goal_inflammation') },
            { key: 'goal_digestion', label: t('auth.completeProfile.goal_digestion') },
            { key: 'goal_weight', label: t('auth.completeProfile.goal_weight') },
            { key: 'goal_energy', label: t('auth.completeProfile.goal_energy') },
            { key: 'goal_condition', label: t('auth.completeProfile.goal_condition') },
          ]}
          value={props.value}
          onChange={props.onChange}
        />
      </View>
    </View>
  );
}

