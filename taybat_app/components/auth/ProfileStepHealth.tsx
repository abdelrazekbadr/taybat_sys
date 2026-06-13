import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { ChevronDown, Frown, Laugh, Meh, PartyPopper, Ruler, Scale, Smile } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OptionSelector, type OptionItem } from '@/components/common/OptionSelector';
import { SelectionModal } from '@/components/common/SelectionModal';
import { useRTL } from '@/hooks/useRTL';
import type { ActivityLevel, WeeklyScore } from '@/types';

const weightOptions = Array.from({ length: 171 }).map((_, idx) => {
  const value = idx + 30;
  return { value, label: `${value}` };
});

const heightOptions = Array.from({ length: 101 }).map((_, idx) => {
  const value = idx + 120;
  return { value, label: `${value}` };
});

const SCORE_OPTIONS: OptionItem<WeeklyScore>[] = [
  { key: 1, icon: { kind: 'lucide', Icon: Frown },       label: 'سيء جداً' },
  { key: 2, icon: { kind: 'lucide', Icon: Meh },         label: 'سيء' },
  { key: 3, icon: { kind: 'lucide', Icon: Smile },       label: 'عادي' },
  { key: 4, icon: { kind: 'lucide', Icon: Laugh },       label: 'جيد' },
  { key: 5, icon: { kind: 'lucide', Icon: PartyPopper }, label: 'ممتاز' },
];

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
  initialHealthScore: WeeklyScore | null;
  onChangeInitialHealthScore: (v: WeeklyScore) => void;
  initialHealthScoreError?: string;
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
          <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 6 }}>
            <Scale size={15} color={labelColor} strokeWidth={1.5} />
            <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
              {t('auth.completeProfile.weight')}
            </AppText>
          </View>
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
              justifyContent: 'flex-start',
              paddingHorizontal: 14,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 6 }}>
              <ChevronDown size={14} color={labelColor} strokeWidth={1.5} />
              <AppText
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: props.weightKg ? theme.colors.onSurface : labelColor,
                }}
              >
                {typeof props.weightKg === 'number' ? `${props.weightKg} كجم` : '--- كجم'}
              </AppText>
              
            </View>
          </Pressable>
          {props.weightError ? (
            <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
              {props.weightError}
            </AppText>
          ) : null}
        </View>

        {/* Height */}
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 6 }}>
            <Ruler size={15} color={labelColor} strokeWidth={1.5} />
            <AppText variant="semibold" style={{ fontSize: 13, color: labelColor }}>
              {t('auth.completeProfile.height')}
            </AppText>
          </View>
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
              justifyContent: 'flex-start',
              paddingHorizontal: 14,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <View style={{ flexDirection: rowDir, alignItems: 'center', gap: 6 }}>
              <ChevronDown size={14} color={labelColor} strokeWidth={1.5} />
              <AppText
                style={{
                  fontSize: 14,
                  lineHeight: 20,
                  color: props.heightCm ? theme.colors.onSurface : labelColor,
                }}
              >
                {typeof props.heightCm === 'number' ? `${props.heightCm} سم` : '--- سم'}
              </AppText>
            </View>
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

      {/* ── Baseline health score ── */}
      <View style={{ gap: 8 }}>
        <AppText variant="semibold" style={{ fontSize: 13, color: props.initialHealthScoreError ? theme.colors.error : labelColor }}>
          ما هو تقييم صحتك بشكل عام قبل التزامك بنظام الطيبات؟
        </AppText>
        <AppText style={{ fontSize: 12, color: labelColor, opacity: 0.7 }}>
          سيساعدنا هذا في قياس تقدمك الحقيقي مع النظام
        </AppText>
        <OptionSelector
          mode="single"
          layout="iconTop"
          variant="soft"
          options={SCORE_OPTIONS}
          value={props.initialHealthScore}
          onChange={props.onChangeInitialHealthScore}
          disabled={props.disabled}
          wrapperClassName="flex-row gap-2"
          itemClassName="flex-1"
        />
        {props.initialHealthScoreError ? (
          <AppText style={{ fontSize: 12, marginStart: 8, color: theme.colors.error }}>
            {props.initialHealthScoreError}
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
