import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { ChipSelector } from '@/components/common/ChipSelector';
import { SelectionModal } from '@/components/common/SelectionModal';
import { useRTL } from '@/hooks/useRTL';
import type { Gender } from '@/types';

const birthYearOptions = Array.from({ length: 70 }).map((_, idx) => {
  const year = new Date().getFullYear() - (idx + 12);
  return { value: year, label: String(year) };
});

export function ProfileStepBasic(props: {
  name: string;
  onChangeName: (v: string) => void;
  nameError?: string;
  gender: Gender | undefined;
  onChangeGender: (v: Gender) => void;
  birthYear: number | undefined;
  onChangeBirthYear: (v: number) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();
  const [yearOpen, setYearOpen] = React.useState(false);

  return (
    <View className="gap-5">
      <View className="gap-1">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.name')}</AppText>
        <AppTextInput
          value={props.name}
          onChangeText={props.onChangeName}
          placeholder={t('auth.completeProfile.name')}
          className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3 text-[14px] text-app-text"
          editable={!props.disabled}
          returnKeyType="done"
        />
        {props.nameError ? (
          <AppText className="text-[12px]" style={{ color: theme.colors.error }}>
            {props.nameError}
          </AppText>
        ) : null}
      </View>

      <View className="gap-2">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.gender')}</AppText>
        <ChipSelector
          options={[
            { key: 'male', label: t('auth.completeProfile.male') },
            { key: 'female', label: t('auth.completeProfile.female') },
          ]}
          value={props.gender ?? null}
          onChange={(v) => props.onChangeGender(v as Gender)}
        />
      </View>

      <View className="gap-2">
        <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.birthYear')}</AppText>
        <Pressable
          onPress={() => setYearOpen(true)}
          disabled={props.disabled}
          className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3"
          style={({ pressed }) => [{ opacity: props.disabled ? 0.6 : pressed ? 0.9 : 1, flexDirection: rowDir }]}
        >
          <AppText className="text-[14px] text-app-text">
            {props.birthYear ? String(props.birthYear) : t('auth.completeProfile.select')}
          </AppText>
        </Pressable>
      </View>

      <SelectionModal
        visible={yearOpen}
        title={t('auth.completeProfile.birthYear')}
        options={birthYearOptions}
        selectedValue={props.birthYear ?? null}
        onDismiss={() => setYearOpen(false)}
        onSelect={(value) => {
          props.onChangeBirthYear(value);
          setYearOpen(false);
        }}
      />
    </View>
  );
}

