import { router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const signupSchema = z
  .object({
    email: z.string().email('بريد إلكتروني غير صحيح'),
    password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const { control, handleSubmit, setError } = useForm<SignupForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const { isLoading, errorMessage, signUpWithEmail, clearError } = useAuthStore();

  const submit = handleSubmit(async (values) => {
    clearError();
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = issue.path[0];
        if (name === 'email' || name === 'password' || name === 'confirmPassword') {
          setError(name, { type: 'manual', message: issue.message });
        }
      }
      return;
    }

    const ok = await signUpWithEmail({ email: parsed.data.email, password: parsed.data.password });
    if (!ok) return;
    router.replace('/(auth)/complete-profile' as never);
  });

  return (
    <View className="flex-1 bg-app-background px-6">
      <View className="flex-1 justify-center">
        <AppText variant="bold" className="text-center text-[22px] leading-8 text-app-text">
          {t('auth.signup.title')}
        </AppText>

        <View className="mt-7 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1">
                <AppText className="text-[13px] text-app-textMuted">{t('auth.signup.email')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('auth.signup.email')}
                  className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3 text-[14px] text-app-text"
                  editable={!isLoading}
                />
                {fieldState.error?.message ? (
                  <AppText className="text-[12px]" style={{ color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1">
                <AppText className="text-[13px] text-app-textMuted">{t('auth.signup.password')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  placeholder={t('auth.signup.password')}
                  className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3 text-[14px] text-app-text"
                  editable={!isLoading}
                />
                {fieldState.error?.message ? (
                  <AppText className="text-[12px]" style={{ color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1">
                <AppText className="text-[13px] text-app-textMuted">{t('auth.signup.confirmPassword')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  placeholder={t('auth.signup.confirmPassword')}
                  className="rounded-[14px] border border-app-lineSoft bg-app-surface px-4 py-3 text-[14px] text-app-text"
                  editable={!isLoading}
                />
                {fieldState.error?.message ? (
                  <AppText className="text-[12px]" style={{ color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          {errorMessage ? (
            <View className="rounded-xl bg-app-surface px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.error }}>
              <AppText className="text-[13px] leading-5" style={{ color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          <PrimaryButton title={t('auth.signup.submit')} onPress={submit} />

          <View className="mt-1 flex-row items-center gap-1" style={{ flexDirection: rowDir, justifyContent: 'center' }}>
            <AppText className="text-[13px] text-app-textMuted">{t('auth.signup.hasAccount')}</AppText>
            <Pressable onPress={() => router.replace('/(auth)/login' as never)} disabled={isLoading}>
              <AppText variant="semibold" className="text-[13px] text-app-primary">
                {t('auth.signup.loginLink')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

