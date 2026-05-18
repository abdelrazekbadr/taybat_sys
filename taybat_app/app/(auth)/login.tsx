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

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const { control, handleSubmit, setError } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const { isLoading, errorMessage, loginWithEmail, clearError } = useAuthStore();

  const submit = handleSubmit(async (values) => {
    clearError();
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = issue.path[0];
        if (name === 'email' || name === 'password') {
          setError(name, { type: 'manual', message: issue.message });
        }
      }
      return;
    }

    const ok = await loginWithEmail(parsed.data);
    if (!ok) return;
    const user = useAuthStore.getState().user;
    router.replace((user?.profile_completed ? '/(main)' : '/(auth)/complete-profile') as never);
  });

  return (
    <View className="flex-1 bg-app-background px-6">
      <View className="flex-1 justify-center">
        <AppText variant="bold" className="text-center text-[22px] leading-8 text-app-text">
          {t('auth.login.title')}
        </AppText>

        <View className="mt-7 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1">
                <AppText className="text-[13px] text-app-textMuted">{t('auth.login.email')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('auth.login.email')}
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
                <AppText className="text-[13px] text-app-textMuted">{t('auth.login.password')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  placeholder={t('auth.login.password')}
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

          <PrimaryButton title={t('auth.login.submit')} onPress={submit} />

          <View className="mt-1 items-center gap-3">
            <Pressable onPress={() => router.push('/(auth)/reset-password' as never)} disabled={isLoading}>
              <AppText className="text-[13px] text-app-primary">{t('auth.login.forgotPassword')}</AppText>
            </Pressable>

            <View className="flex-row items-center gap-1" style={{ flexDirection: rowDir, justifyContent: 'center' }}>
              <AppText className="text-[13px] text-app-textMuted">{t('auth.login.noAccount')}</AppText>
              <Pressable onPress={() => router.replace('/(auth)/signup' as never)} disabled={isLoading}>
                <AppText variant="semibold" className="text-[13px] text-app-primary">
                  {t('auth.login.signUpLink')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

