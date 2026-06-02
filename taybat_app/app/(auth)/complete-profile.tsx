import { router } from 'expo-router';
import React from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OutlineButton } from '@/components/common/OutlineButton';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { StepIndicator } from '@/components/common/StepIndicator';
import { ProfileStepBasic } from '@/components/auth/ProfileStepBasic';
import { ProfileStepHealth } from '@/components/auth/ProfileStepHealth';
import { ProfileStepGoals } from '@/components/auth/ProfileStepGoals';
import { ProfileStepHealthConditions } from '@/components/auth/ProfileStepHealthConditions';
import { createLogger } from '@/lib/logger';
import { useAuthStore } from '@/stores/auth.store';
import { useHealthConditionsStore } from '@/stores/healthConditions.store';
import { useHealthGoalsStore } from '@/stores/healthGoals.store';
import { useRTL } from '@/hooks/useRTL';
import { parseCsvStringList, parseISODateParts, toFiniteNumber } from '@/utils/parseUtils';
import type { ActivityLevel, Gender } from '@/types';

const log = createLogger('CompleteProfile');

const schema = z.object({
  name: z.string().min(2, 'يرجى إدخال الاسم الكامل'),
});

type FormValues = {
  name: string;
  gender?: Gender;
  birth_year?: number;
  birth_month?: number;
  birth_day?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: ActivityLevel;
  health_goals_codes: string[];
  health_conditions_codes: string[];
};

const STEP_META = [
  { title: 'بياناتك الأساسية',     subtitle: 'نبدأ بالتعرف عليك' },
  { title: 'بياناتك الصحية',       subtitle: 'لتخصيص تجربة أفضل مع النظام' },
  { title: 'أهدافك الصحية',        subtitle: 'ما الذي تسعى لتحقيقه؟' },
  { title: 'حالاتك الصحية',        subtitle: 'حدد حالتك الصحيه لمتابعتها' },
] as const;

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isRTL, rowDir } = useRTL();
  const { user, isLoading, errorMessage, completeProfile, clearError } = useAuthStore();
  const profile = useAuthStore((s) => s.profile);
  const goals = useHealthGoalsStore((s) => s.goals);
  const fetchGoals = useHealthGoalsStore((s) => s.fetchGoals);
  const conditions = useHealthConditionsStore((s) => s.conditions);
  const fetchConditions = useHealthConditionsStore((s) => s.fetchConditions);

  const [step, setStep] = React.useState(0);
  const { setValue, watch, setError, clearErrors, formState } = useForm<FormValues>({
    defaultValues: {
      name: '',
      gender: undefined,
      birth_year: undefined,
      birth_month: undefined,
      birth_day: undefined,
      weight_kg: undefined,
      height_cm: undefined,
      activity_level: undefined,
      health_goals_codes: [],
      health_conditions_codes: [],
    },
  });

  const values = watch();
  const didHydrateFromProfileRef = React.useRef(false);

  React.useEffect(() => {
    if (!profile || didHydrateFromProfileRef.current) return;
    didHydrateFromProfileRef.current = true;

    const dirty = formState.dirtyFields;

    if (!dirty.name && typeof profile.name === 'string' && profile.name.trim().length > 0) {
      setValue('name', profile.name, { shouldDirty: false });
    }
    if (!dirty.gender && (profile.gender === 'male' || profile.gender === 'female')) {
      setValue('gender', profile.gender, { shouldDirty: false });
    }

    const birth = typeof profile.birth_date === 'string' ? parseISODateParts(profile.birth_date) : null;
    if (birth) {
      if (!dirty.birth_year) setValue('birth_year', birth.year, { shouldDirty: false });
      if (!dirty.birth_month) setValue('birth_month', birth.month, { shouldDirty: false });
      if (!dirty.birth_day) setValue('birth_day', birth.day, { shouldDirty: false });
    }

    const weight = toFiniteNumber(profile.weight_kg);
    if (!dirty.weight_kg && typeof weight === 'number') setValue('weight_kg', weight, { shouldDirty: false });

    const height = toFiniteNumber(profile.height_cm);
    if (!dirty.height_cm && typeof height === 'number') setValue('height_cm', height, { shouldDirty: false });

    if (!dirty.activity_level && profile.activity_level) {
      setValue('activity_level', profile.activity_level, { shouldDirty: false });
    }

    if (!dirty.health_goals_codes) {
      const codes = parseCsvStringList(profile.health_goals_codes);
      if (codes.length > 0) setValue('health_goals_codes', codes, { shouldDirty: false });
    }

    if (!dirty.health_conditions_codes) {
      const codes = parseCsvStringList(profile.health_conditions_codes);
      if (codes.length > 0) setValue('health_conditions_codes', codes, { shouldDirty: false });
    }
  }, [formState.dirtyFields, profile, setValue]);

  React.useEffect(() => {
    if (goals.length === 0) {
      fetchGoals();
    }
  }, [fetchGoals, goals.length]);

  React.useEffect(() => {
    if (conditions.length === 0) {
      fetchConditions();
    }
  }, [conditions.length, fetchConditions]);

  React.useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login' as never);
    }
  }, [user]);

  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isLoading) {
        return true;
      }
      if (step > 0) {
        setStep((s) => Math.max(0, s - 1));
        return true;
      }
      return false;
    });

    return () => sub.remove();
  }, [isLoading, step]);

  const goNext = () => setStep((s) => Math.min(3, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const buildBirthDate = (y?: number, m?: number, d?: number) => {
    if (typeof y !== 'number' || typeof m !== 'number' || typeof d !== 'number') return null;
    const yy = String(y).padStart(4, '0');
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    const iso = `${yy}-${mm}-${dd}`;
    const dt = new Date(`${iso}T00:00:00.000Z`);
    if (Number.isNaN(dt.getTime())) return null;
    const valid =
      dt.getUTCFullYear() === y &&
      dt.getUTCMonth() + 1 === m &&
      dt.getUTCDate() === d;
    return valid ? iso : null;
  };

  const markStepErrors = (stepIndex: number) => {
    let ok = true;

    if (stepIndex === 0) {
      if (values.name.trim().length < 2) {
        setError('name', { type: 'manual', message: 'يرجى إدخال الاسم الكامل' });
        ok = false;
      }
      if (values.gender !== 'male' && values.gender !== 'female') {
        setError('gender', { type: 'manual', message: 'يرجى اختيار الجنس' });
        ok = false;
      }
      if (buildBirthDate(values.birth_year, values.birth_month, values.birth_day) === null) {
        setError('birth_year', { type: 'manual', message: 'يرجى اختيار تاريخ الميلاد' });
        ok = false;
      }
      return ok;
    }

    if (stepIndex === 1) {
      if (typeof values.weight_kg !== 'number' || !Number.isFinite(values.weight_kg)) {
        setError('weight_kg', { type: 'manual', message: 'يرجى اختيار الوزن' });
        ok = false;
      }
      if (typeof values.height_cm !== 'number' || !Number.isFinite(values.height_cm)) {
        setError('height_cm', { type: 'manual', message: 'يرجى اختيار الطول' });
        ok = false;
      }
      const a = values.activity_level;
      if (a !== 'sedentary' && a !== 'light' && a !== 'moderate' && a !== 'active') {
        setError('activity_level', { type: 'manual', message: 'يرجى اختيار مستوى النشاط' });
        ok = false;
      }
      return ok;
    }

    if (stepIndex === 2 && values.health_goals_codes.length === 0) {
      setError('health_goals_codes', { type: 'manual', message: 'اختر هدفاً واحداً على الأقل' });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (isLoading) return;
    const ok = markStepErrors(step);
    if (!ok) return;
    goNext();
  };

  const submit = async () => {
    if (isLoading) return;
    clearError();
    const base = schema.safeParse({ name: values.name.trim() });
    if (!base.success) {
      const message = base.error.issues[0]?.message ?? 'يرجى إدخال الاسم الكامل';
      setError('name', { type: 'manual', message });
      setStep(0);
      return;
    }
    if (!markStepErrors(0)) {
      setStep(0);
      return;
    }
    if (!markStepErrors(1)) {
      setStep(1);
      return;
    }
    if (!markStepErrors(2)) {
      setStep(2);
      return;
    }

    const birth_date = buildBirthDate(values.birth_year, values.birth_month, values.birth_day);
    if (!birth_date) {
      setStep(0);
      return;
    }

    const payload = {
      name: values.name.trim(),
      gender: values.gender!,
      birth_date,
      weight_kg: values.weight_kg!,
      height_cm: values.height_cm!,
      activity_level: values.activity_level!,
      health_goals_codes: values.health_goals_codes.join(','),
      health_conditions_codes: values.health_conditions_codes.length > 0 ? values.health_conditions_codes.join(',') : undefined,
    };

    const ok = await completeProfile(payload);
    log.debug('[CompleteProfile] completeProfile returned ok:', ok, '| isLoading:', useAuthStore.getState().isLoading, '| profile_completed:', useAuthStore.getState().user?.profile_completed);
    if (ok) {
      log.debug('[CompleteProfile] calling router.replace /(main)');
      router.replace('/(main)' as never);
    } else {
      log.debug('[CompleteProfile] ok=false, errorMessage:', useAuthStore.getState().errorMessage);
    }
  };

  const isLastStep = step === 3;
  const meta = STEP_META[step];

  const androidRTL = Platform.OS === 'android' && isRTL;
  const gradStart = androidRTL ? { x: 1, y: 0 } : { x: 0, y: 0 };
  const gradEnd = androidRTL ? { x: 0, y: 1 } : { x: 1, y: 1 };
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-app-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={gradStart}
        end={gradEnd}
        style={{ paddingTop: insets.top + 12, paddingBottom: 44, paddingHorizontal: 20 }}
      >
        <View style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          {step > 0 ? (
            <Pressable
              onPress={goBack}
              disabled={isLoading}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                padding: 8,
                marginStart: -8,
              })}
              accessibilityLabel={t('auth.completeProfile.back')}
            >
              <BackIcon size={22} color={theme.colors.onPrimary} strokeWidth={2} />
            </Pressable>
          ) : (
            <View style={{ width: 38 }} />
          )}
          <View style={{ width: 38 }} />
        </View>

        <AppText
          variant="bold"
          style={{ fontSize: 22, color: theme.colors.onPrimary, lineHeight: 32 }}
        >
          {meta.title}
        </AppText>
        <AppText style={{ fontSize: 14, color: theme.colors.onPrimary, opacity: 0.75, marginTop: 4 }}>
          {meta.subtitle}
        </AppText>
      </LinearGradient>

      <View
        className="flex-1 -mt-7 rounded-t-[28px] bg-app-surface overflow-hidden"
      >
        <View className="px-6 pt-6 pb-2">
            <StepIndicator steps={4} activeIndex={step} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}
        >
          {step === 0 && (
            <ProfileStepBasic
              name={values.name}
              onChangeName={(v) => { clearErrors('name'); setValue('name', v, { shouldDirty: true }); }}
              nameError={formState.errors.name?.message}
              gender={values.gender}
              onChangeGender={(v) => { clearErrors('gender'); setValue('gender', v, { shouldDirty: true }); }}
              genderError={formState.errors.gender?.message}
              birthYear={values.birth_year}
              onChangeBirthYear={(v) => { clearErrors('birth_year'); setValue('birth_year', v, { shouldDirty: true }); }}
              birthMonth={values.birth_month}
              onChangeBirthMonth={(v) => { clearErrors('birth_year'); setValue('birth_month', v, { shouldDirty: true }); }}
              birthDay={values.birth_day}
              onChangeBirthDay={(v) => { clearErrors('birth_year'); setValue('birth_day', v, { shouldDirty: true }); }}
              birthDateError={formState.errors.birth_year?.message}
              disabled={isLoading}
            />
          )}

          {step === 1 && (
            <ProfileStepHealth
              weightKg={values.weight_kg}
              onChangeWeightKg={(v) => { clearErrors('weight_kg'); setValue('weight_kg', v, { shouldDirty: true }); }}
              weightError={formState.errors.weight_kg?.message}
              heightCm={values.height_cm}
              onChangeHeightCm={(v) => { clearErrors('height_cm'); setValue('height_cm', v, { shouldDirty: true }); }}
              heightError={formState.errors.height_cm?.message}
              activityLevel={values.activity_level}
              onChangeActivityLevel={(v) => { clearErrors('activity_level'); setValue('activity_level', v, { shouldDirty: true }); }}
              activityError={formState.errors.activity_level?.message}
              disabled={isLoading}
            />
          )}

          {step === 2 && (
            <ProfileStepGoals
              goals={goals}
              value={values.health_goals_codes}
              onChange={(v) => { clearErrors('health_goals_codes'); setValue('health_goals_codes', v, { shouldDirty: true }); }}
              error={formState.errors.health_goals_codes?.message}
              disabled={isLoading}
            />
          )}

          {step === 3 && (
            <ProfileStepHealthConditions
              conditions={conditions}
              value={values.health_conditions_codes}
              onChange={(v) => { setValue('health_conditions_codes', v, { shouldDirty: true }); }}
              disabled={isLoading}
            />
          )}
        </ScrollView>

        <View
          style={{
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: 24,
            paddingTop: 12,
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outlineVariant ?? theme.colors.outline,
          }}
          className="bg-app-surface"
        >
          {errorMessage ? (
            <View
              style={{
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: theme.colors.errorContainer ?? theme.colors.surface,
                borderStartWidth: 3,
                borderStartColor: theme.colors.error,
              }}
            >
              <AppText style={{ fontSize: 13, lineHeight: 20, color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          <View style={{ flexDirection: rowDir, gap: 10 }}>
            {step > 0 ? (
              <OutlineButton
                title={t('auth.completeProfile.back')}
                onPress={goBack}
                disabled={isLoading}
                flex={0.7}
                textColor={theme.colors.primary}
                icon={<PrevIcon size={18} color={theme.colors.primary} strokeWidth={2.5} />}
              />
            ) : null}

            <View style={{ flex: 1 }}>
              <PrimaryButton
                title={isLastStep ? t('auth.completeProfile.save') : t('auth.completeProfile.next')}
                onPress={isLastStep ? submit : handleNext}
                loading={isLoading}
                disabled={isLoading}
                trailingIcon={!isLastStep && isRTL ? <NextIcon size={18} color={theme.colors.onPrimary} strokeWidth={2.8} /> : undefined}
                leadingIcon={!isLastStep && !isRTL ? <NextIcon size={18} color={theme.colors.onPrimary} strokeWidth={2.8} /> : undefined}
              />
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
