import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { ChevronDown, Ruler, Scale } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
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

const ACTIVITY_OPTIONS: { key: ActivityLevel; labelKey: string; hint: string }[] = [
  { key: 'sedentary', labelKey: 'auth.completeProfile.sedentary', hint: 'قليل الحركة : جالس معظم الوقت' },
  { key: 'light',     labelKey: 'auth.completeProfile.light',     hint: 'حركة خفيفة : 1 إلى 3 أيام بالأسبوع' },
  { key: 'moderate',  labelKey: 'auth.completeProfile.moderate',  hint: 'حركة متوسطة : 3 إلى 5 أيام بالأسبوع' },
  { key: 'active',    labelKey: 'auth.completeProfile.active',    hint: 'حركة عالية : يومياً' },
];

export function ProfileStepHealth(props: {
  weightKg: number | undefined;
  onChangeWeightKg: (v: number) => void;
  weightError?: string;
  heightCm: number | undefined;
  onChangeHeightCm: (v: number) => void;
  heightError?: string;
  activityLevel: ActivityLevel | undefined;
  onChangeActivityLevel: (v: ActivityLevel) => void;
  activityError?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const { rowDir } = useRTL();
  const theme = useTheme();
  const [weightOpen, setWeightOpen] = React.useState(false);
  const [heightOpen, setHeightOpen] = React.useState(false);

  const surfaceVariant = theme.colors.surfaceVariant ?? theme.colors.surface;
  const outline = theme.colors.outlineVariant ?? theme.colors.outline;
  const labelColor = theme.colors.onSurfaceVariant ?? theme.colors.onSurface;
  const activityOptions: OptionItem<ActivityLevel>[] = ACTIVITY_OPTIONS.map((opt) => ({
    key: opt.key,
    label: opt.hint,
    icon: `level_${opt.key}`,
  }));

  return (
    <View style={{ gap: 20 }}>

      {/* ── Weight + Height side by side ── */}
      <View style={{ flexDirection: rowDir, gap: 12 }}>
        {/* Weight */}
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
            {t('auth.completeProfile.weight')}
          </AppText>
          <Pressable
            onPress={() => setWeightOpen(true)}
            disabled={props.disabled}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: props.weightError ? theme.colors.error : outline,
              backgroundColor: surfaceVariant,
              flexDirection: rowDir,
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Scale size={16} color={labelColor} strokeWidth={1.5} />
            <AppText style={{ flex: 1, fontSize: 14, color: props.weightKg ? theme.colors.onSurface : labelColor }}>
              {typeof props.weightKg === 'number' ? `${props.weightKg}   كجم` : '--- كجم'}
            </AppText>
            <ChevronDown size={14} color={labelColor} strokeWidth={1.5} />
          </Pressable>
          {props.weightError ? (
            <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
              {props.weightError}
            </AppText>
          ) : null}
        </View>

        {/* Height */}
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
            {t('auth.completeProfile.height')}
          </AppText>
          <Pressable
            onPress={() => setHeightOpen(true)}
            disabled={props.disabled}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: props.heightError ? theme.colors.error : outline,
              backgroundColor: surfaceVariant,
              flexDirection: rowDir,
              alignItems: 'center',
              paddingHorizontal: 14,
              gap: 6,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Ruler size={16} color={labelColor} strokeWidth={1.5} />
            <AppText style={{ flex: 1, fontSize: 14, color: props.heightCm ? theme.colors.onSurface : labelColor }}>
              {typeof props.heightCm === 'number' ? `${props.heightCm}   سم` : '--- سم'}
            </AppText>
            <ChevronDown size={14} color={labelColor} strokeWidth={1.5} />
          </Pressable>
          {props.heightError ? (
            <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
              {props.heightError}
            </AppText>
          ) : null}
        </View>
      </View>

      {/* ── Activity Level — card list ── */}
      <View style={{ gap: 8 }}>
        <AppText variant="semibold" style={{ fontSize: 13, color: props.activityError ? theme.colors.error : labelColor }}>
          {t('auth.completeProfile.activityLevel')}
        </AppText>
        <OptionSelector
          mode="single"
          layout="iconStart"
          variant="soft"
          options={activityOptions}
          value={props.activityLevel ?? null}
          onChange={props.onChangeActivityLevel}
          disabled={props.disabled}
          containerDirection="column"
          wrapperClassName="gap-2"
          itemClassName=""
        />
        {props.activityError ? (
          <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
            {props.activityError}
          </AppText>
        ) : null}
      </View>

      <SelectionModal
        visible={weightOpen}
        title={t('auth.completeProfile.weight')}
        options={weightOptions}
        selectedValue={props.weightKg ?? null}
        onDismiss={() => setWeightOpen(false)}
        onSelect={(value) => { props.onChangeWeightKg(value); setWeightOpen(false); }}
      />

      <SelectionModal
        visible={heightOpen}
        title={t('auth.completeProfile.height')}
        options={heightOptions}
        selectedValue={props.heightCm ?? null}
        onDismiss={() => setHeightOpen(false)}
        onSelect={(value) => { props.onChangeHeightCm(value); setHeightOpen(false); }}
      />
    </View>
  );
}
