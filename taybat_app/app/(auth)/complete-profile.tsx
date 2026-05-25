import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppText } from '@/components/common/AppText';
import { StepIndicator } from '@/components/common/StepIndicator';
import { ProfileStepBasic } from '@/components/auth/ProfileStepBasic';
import { ProfileStepHealth } from '@/components/auth/ProfileStepHealth';
import { ProfileStepGoals } from '@/components/auth/ProfileStepGoals';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/stores/auth.store';
import type { ActivityLevel, Gender } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'يرجى إدخال الاسم الكامل'),
});

type FormValues = {
  name: string;
  gender?: Gender;
  birth_year?: number;
  weight_kg?: number;
  height_cm?: number;
  activity_level?: ActivityLevel;
  health_goals: string[];
};

export default function CompleteProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, isLoading, errorMessage, completeProfile, clearError } = useAuthStore();

  const [step, setStep] = React.useState(0);
  const { setValue, watch, setError, formState } = useForm<FormValues>({
    defaultValues: {
      name: '',
      gender: undefined,
      birth_year: undefined,
      weight_kg: undefined,
      height_cm: undefined,
      activity_level: undefined,
      health_goals: [],
    },
  });

  const values = watch();

  React.useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login' as never);
    }
  }, [user]);

  const goNext = () => setStep((s) => Math.min(2, s + 1));
  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const submit = async () => {
    clearError();
    const base = schema.safeParse({ name: values.name.trim() });
    if (!base.success) {
      const message = base.error.issues[0]?.message ?? 'يرجى إدخال الاسم الكامل';
      setError('name', { type: 'manual', message });
      setStep(0);
      return;
    }

    const payload = {
      name: values.name.trim(),
      ...(values.gender ? { gender: values.gender } : null),
      ...(typeof values.birth_year === 'number' ? { birth_year: values.birth_year } : null),
      ...(typeof values.weight_kg === 'number' ? { weight_kg: values.weight_kg } : null),
      ...(typeof values.height_cm === 'number' ? { height_cm: values.height_cm } : null),
      ...(values.activity_level ? { activity_level: values.activity_level } : null),
      ...(values.health_goals.length ? { health_goals: values.health_goals } : null),
    };

    const ok = await completeProfile(payload);
    if (ok) {
      router.replace('/(main)' as never);
    }
  };

  return (
    <View className="flex-1 bg-app-background px-6">
      <View className="pt-14">
        <AppText variant="bold" className="text-center text-[22px] leading-8 text-app-text">
          {t('auth.completeProfile.title')}
        </AppText>
        <AppText className="mt-2 text-center text-[14px] leading-6 text-app-muted">
          {t('auth.completeProfile.subtitle')}
        </AppText>

        <View className="mt-6">
          <StepIndicator steps={3} activeIndex={step} />
        </View>
      </View>

      <View className="flex-1 justify-center">
        {step === 0 ? (
          <ProfileStepBasic
            name={values.name}
            onChangeName={(v) => setValue('name', v, { shouldDirty: true })}
            nameError={formState.errors.name?.message}
            gender={values.gender}
            onChangeGender={(v) => setValue('gender', v, { shouldDirty: true })}
            birthYear={values.birth_year}
            onChangeBirthYear={(v) => setValue('birth_year', v, { shouldDirty: true })}
            disabled={isLoading}
          />
        ) : null}

        {step === 1 ? (
          <ProfileStepHealth
            weightKg={values.weight_kg}
            onChangeWeightKg={(v) => setValue('weight_kg', v, { shouldDirty: true })}
            heightCm={values.height_cm}
            onChangeHeightCm={(v) => setValue('height_cm', v, { shouldDirty: true })}
            activityLevel={values.activity_level}
            onChangeActivityLevel={(v) => setValue('activity_level', v, { shouldDirty: true })}
            disabled={isLoading}
          />
        ) : null}

        {step === 2 ? (
          <ProfileStepGoals
            value={values.health_goals}
            onChange={(v) => setValue('health_goals', v, { shouldDirty: true })}
            disabled={isLoading}
          />
        ) : null}
      </View>

      <View className="pb-10 pt-4">
        {errorMessage ? (
          <View className="mb-3 rounded-xl bg-app-surface px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.error }}>
            <AppText className="text-[13px] leading-5" style={{ color: theme.colors.error }}>
              {errorMessage}
            </AppText>
          </View>
        ) : null}

        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.replace('/(main)' as never)}
            disabled={isLoading}
            style={({ pressed }) => [{ opacity: isLoading ? 0.5 : pressed ? 0.85 : 1 }]}
          >
            <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.skip')}</AppText>
          </Pressable>

          <View className="flex-row items-center gap-4">
            {step > 0 ? (
              <Pressable
                onPress={goBack}
                disabled={isLoading}
                style={({ pressed }) => [{ opacity: isLoading ? 0.5 : pressed ? 0.85 : 1 }]}
              >
                <AppText className="text-[13px] text-app-textMuted">{t('auth.completeProfile.back')}</AppText>
              </Pressable>
            ) : null}

            <View style={{ minWidth: 160 }}>
              <PrimaryButton
                title={step < 2 ? t('auth.completeProfile.next') : t('auth.completeProfile.save')}
                onPress={step < 2 ? goNext : submit}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
