import React from 'react';
import { NativeModules, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { ChevronDown } from 'lucide-react-native';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { useRTL } from '@/hooks/useRTL';
import type { Gender } from '@/types';
import { SelectionModal } from '@/components/common/SelectionModal';

export function ProfileStepBasic(props: {
  name: string;
  onChangeName: (v: string) => void;
  nameError?: string;
  gender: Gender | undefined;
  onChangeGender: (v: Gender) => void;
  genderError?: string;
  birthYear: number | undefined;
  onChangeBirthYear: (v: number) => void;
  birthMonth: number | undefined;
  onChangeBirthMonth: (v: number) => void;
  birthDay: number | undefined;
  onChangeBirthDay: (v: number) => void;
  birthDateError?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();
  const [dobOpen, setDobOpen] = React.useState(false);
  const [yearOpen, setYearOpen] = React.useState(false);
  const [monthOpen, setMonthOpen] = React.useState(false);
  const [dayOpen, setDayOpen] = React.useState(false);
  const [nameFocused, setNameFocused] = React.useState(false);

  const DatePickerComponent = React.useMemo(() => {
    try {
      if (!NativeModules.RNDatePicker) return null;
      return require('react-native-date-picker').default as React.ComponentType<{
        modal?: boolean;
        open: boolean;
        date: Date;
        mode?: 'date';
        maximumDate?: Date;
        onConfirm: (date: Date) => void;
        onCancel: () => void;
      }>;
    } catch {
      return null;
    }
  }, []);

  const genderOptions: OptionItem<Gender>[] = [
    { key: 'male', label: t('auth.completeProfile.male'), icon: 'man' },
    { key: 'female', label: t('auth.completeProfile.female'), icon: 'woman' },
  ];

  const surfaceVariant = theme.colors.surfaceVariant ?? theme.colors.surface;
  const outline = theme.colors.outlineVariant ?? theme.colors.outline;
  const labelColor = theme.colors.onSurfaceVariant ?? theme.colors.onSurface;

  const nameBorderColor = props.nameError
    ? theme.colors.error
    : nameFocused
    ? theme.colors.primary
    : outline;

  const selectedDob =
    typeof props.birthYear === 'number' && typeof props.birthMonth === 'number' && typeof props.birthDay === 'number'
      ? new Date(props.birthYear, props.birthMonth - 1, props.birthDay)
      : new Date(2000, 0, 1);

  const dobLabel =
    typeof props.birthYear === 'number' && typeof props.birthMonth === 'number' && typeof props.birthDay === 'number'
      ? `${String(props.birthDay).padStart(2, '0')}/${String(props.birthMonth).padStart(2, '0')}/${props.birthYear}`
      : t('auth.completeProfile.select');

  const yearOptions = React.useMemo(() => {
    return Array.from({ length: 95 }).map((_, idx) => {
      const year = new Date().getFullYear() - (idx + 8);
      return { value: year, label: String(year) };
    });
  }, []);

  const monthOptions = React.useMemo(() => {
    return Array.from({ length: 12 }).map((_, idx) => {
      const value = idx + 1;
      return { value, label: String(value) };
    });
  }, []);

  const dayOptions = React.useMemo(() => {
    const y = props.birthYear;
    const m = props.birthMonth;
    const maxDays =
      typeof y === 'number' && typeof m === 'number'
        ? new Date(y, m, 0).getDate()
        : 31;
    return Array.from({ length: maxDays }).map((_, idx) => {
      const value = idx + 1;
      return { value, label: String(value) };
    });
  }, [props.birthMonth, props.birthYear]);

  const calculatedAge = React.useMemo(() => {
    if (
      typeof props.birthYear !== 'number' ||
      typeof props.birthMonth !== 'number' ||
      typeof props.birthDay !== 'number'
    ) return null;
    const today = new Date();
    let age = today.getFullYear() - props.birthYear;
    const m = today.getMonth() + 1 - props.birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < props.birthDay)) age--;
    return age > 0 ? age : null;
  }, [props.birthYear, props.birthMonth, props.birthDay]);

  return (
    <View style={{ gap: 20 }}>

      {/* ── Name ── */}
      <View style={{ gap: 6 }}>
        <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
          {t('auth.completeProfile.name')}
        </AppText>
        <View
          style={{
            height: 52,
            borderRadius: 26,
            borderWidth: 1.5,
            borderColor: nameBorderColor,
            backgroundColor: surfaceVariant,
            flexDirection: rowDir,
            alignItems: 'center',
            paddingHorizontal: 18,
          }}
        >
          <AppTextInput
            value={props.name}
            onChangeText={props.onChangeName}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder={t('auth.completeProfile.name')}
            placeholderTextColor={labelColor}
            editable={!props.disabled}
            returnKeyType="done"
            style={{ flex: 1, height: '100%', fontSize: 14, color: theme.colors.onSurface }}
          />
        </View>
        {props.nameError ? (
          <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
            {props.nameError}
          </AppText>
        ) : null}
      </View>

      {/* ── Gender — large cards ── */}
      <View style={{ gap: 8 }}>
        <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
          {t('auth.completeProfile.gender')}
        </AppText>
        <OptionSelector
          mode="single"
          layout="iconTop"
          variant="soft"
          options={genderOptions}
          value={props.gender ?? null}
          onChange={props.onChangeGender}
          disabled={props.disabled}
          iconSize={26}
          wrapperClassName="flex-row gap-3"
          itemClassName="flex-1"
        />
        {props.genderError ? (
          <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
            {props.genderError}
          </AppText>
        ) : null}
      </View>

      {/* ── Date of Birth (Year / Month / Day) ── */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 8 }}>
          <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
            {t('auth.completeProfile.birthDate')}
          </AppText>
          {calculatedAge !== null && (
            <View className="rounded-full bg-app-successSoft px-[10px] py-[2px]">
              <AppText variant="semibold" style={{ fontSize: 12, color: theme.colors.primary }}>
                {`العمر: ${calculatedAge} سنة`}
              </AppText>
            </View>
          )}
        </View>

        <Pressable
          onPress={() => {
            if (DatePickerComponent) {
              setDobOpen(true);
              return;
            }
            setYearOpen(true);
          }}
          disabled={props.disabled}
          style={({ pressed }) => ({
            height: 52,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: props.birthDateError ? theme.colors.error : outline,
            backgroundColor: surfaceVariant,
            flexDirection: rowDir,
            alignItems: 'center',
            paddingHorizontal: 14,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <AppText style={{ flex: 1, fontSize: 14, color: dobLabel === t('auth.completeProfile.select') ? labelColor : theme.colors.onSurface }}>
            {dobLabel}
          </AppText>
          <ChevronDown size={16} color={labelColor} strokeWidth={1.5} />
        </Pressable>
        {props.birthDateError ? (
          <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
            {props.birthDateError}
          </AppText>
        ) : null}
      </View>

      {DatePickerComponent ? (
        <DatePickerComponent
          modal
          open={dobOpen}
          date={selectedDob}
          mode="date"
          maximumDate={new Date()}
          onConfirm={(date) => {
            props.onChangeBirthYear(date.getFullYear());
            props.onChangeBirthMonth(date.getMonth() + 1);
            props.onChangeBirthDay(date.getDate());
            setDobOpen(false);
          }}
          onCancel={() => setDobOpen(false)}
        />
      ) : null}

      <SelectionModal
        visible={yearOpen}
        title={t('auth.completeProfile.birthYear')}
        options={yearOptions}
        selectedValue={props.birthYear ?? null}
        onDismiss={() => setYearOpen(false)}
        onSelect={(value) => {
          props.onChangeBirthYear(value);
          setYearOpen(false);
          setMonthOpen(true);
        }}
      />

      <SelectionModal
        visible={monthOpen}
        title={t('auth.completeProfile.birthMonth')}
        options={monthOptions}
        selectedValue={props.birthMonth ?? null}
        onDismiss={() => setMonthOpen(false)}
        onSelect={(value) => {
          props.onChangeBirthMonth(value);
          setMonthOpen(false);
          setDayOpen(true);
        }}
      />

      <SelectionModal
        visible={dayOpen}
        title={t('auth.completeProfile.birthDay')}
        options={dayOptions}
        selectedValue={props.birthDay ?? null}
        onDismiss={() => setDayOpen(false)}
        onSelect={(value) => {
          props.onChangeBirthDay(value);
          setDayOpen(false);
        }}
      />
    </View>
  );
}
