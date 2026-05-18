import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { ChipSelector } from '@/components/common/ChipSelector';
import { SelectionModal } from '@/components/common/SelectionModal';
import { useRTL } from '@/hooks/useRTL';
import type { ActivityLevel } from '@/types';

const weightOptions = Array.from({ length: 171 }).map((_, idx) => {
  const value = idx + 30;
  return { value, label: `${value}` };
});

const heightOptions = Array.from({ length: 101 }).map((_, idx) => {
  const value = idx + 120;
  return { value, label: `${value}` };
});

export function ProfileStepHealth(props: {
  weightKg: number | undefined;
  onChangeWeightKg: (v: number) => void;
  heightCm: number | undefined;
  onChangeHeightCm: (v: number) => void;
  activityLevel: ActivityLevel | undefined;
  onChangeActivityLevel: (v: ActivityLevel) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { rowDir } = useRTL();
  const [weightOpen, setWeightOpen] = React.useState(false);
  const [heightOpen, setHeightOpen] = React.useState(false);

  return (
    <View className="gap-5">
      <View className="gap-2">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.weight')}</AppText>
        <Pressable
          onPress={() => setWeightOpen(true)}
          disabled={props.disabled}
          className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3"
          style={({ pressed }) => [{ opacity: props.disabled ? 0.6 : pressed ? 0.9 : 1, flexDirection: rowDir }]}
        >
          <AppText className="text-[14px] text-app-text">
            {typeof props.weightKg === 'number' ? `${props.weightKg}` : t('auth.completeProfile.select')}
          </AppText>
        </Pressable>
      </View>

      <View className="gap-2">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.height')}</AppText>
        <Pressable
          onPress={() => setHeightOpen(true)}
          disabled={props.disabled}
          className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3"
          style={({ pressed }) => [{ opacity: props.disabled ? 0.6 : pressed ? 0.9 : 1, flexDirection: rowDir }]}
        >
          <AppText className="text-[14px] text-app-text">
            {typeof props.heightCm === 'number' ? `${props.heightCm}` : t('auth.completeProfile.select')}
          </AppText>
        </Pressable>
      </View>

      <View className="gap-2">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.activityLevel')}</AppText>
        <ChipSelector
          options={[
            { key: 'sedentary', label: t('auth.completeProfile.sedentary') },
            { key: 'light', label: t('auth.completeProfile.light') },
            { key: 'moderate', label: t('auth.completeProfile.moderate') },
            { key: 'active', label: t('auth.completeProfile.active') },
          ]}
          value={props.activityLevel ?? null}
          onChange={(v) => props.onChangeActivityLevel(v as ActivityLevel)}
        />
      </View>

      <SelectionModal
        visible={weightOpen}
        title={t('auth.completeProfile.weight')}
        options={weightOptions}
        selectedValue={props.weightKg ?? null}
        onDismiss={() => setWeightOpen(false)}
        onSelect={(value) => {
          props.onChangeWeightKg(value);
          setWeightOpen(false);
        }}
      />

      <SelectionModal
        visible={heightOpen}
        title={t('auth.completeProfile.height')}
        options={heightOptions}
        selectedValue={props.heightCm ?? null}
        onDismiss={() => setHeightOpen(false)}
        onSelect={(value) => {
          props.onChangeHeightCm(value);
          setHeightOpen(false);
        }}
      />
    </View>
  );
}

