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
          {/* Email Field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1.5">
                <AppText className="text-[13px] font-semibold text-app-text">
                  {t('auth.login.email')}
                </AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="example@email.com"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isLoading}
                  className={`rounded-[14px] border px-4 py-3.5 text-[14px] text-app-text ${
                    fieldState.error
                      ? 'border-red-400 bg-red-50'
                      : 'border-app-lineSoft bg-app-surface focus:border-app-primary'
                  }`}
                  style={{ opacity: isLoading ? 0.6 : 1 }}
                />
                {fieldState.error?.message ? (
                  <AppText className="text-[12px] font-medium" style={{ color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          {/* Password Field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1.5">
                <AppText className="text-[13px] font-semibold text-app-text">
                  {t('auth.login.password')}
                </AppText>
                <AppTextInput
                  ref={passwordRef}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry
                  placeholder="••••••••"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  editable={!isLoading}
                  className={`rounded-[14px] border px-4 py-3.5 text-[14px] text-app-text ${
                    fieldState.error
                      ? 'border-red-400 bg-red-50'
                      : 'border-app-lineSoft bg-app-surface focus:border-app-primary'
                  }`}
                  style={{ opacity: isLoading ? 0.6 : 1 }}
                />
                {fieldState.error?.message ? (
                  <AppText className="text-[12px] font-medium" style={{ color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          {/* Global Error */}
          {errorMessage ? (
            <View
              className="rounded-xl bg-red-50 px-4 py-3"
              style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.error }}
            >
              <AppText className="text-[13px] leading-5 font-medium" style={{ color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          {/* Submit Button */}
          <View className="mt-2">
            <PrimaryButton
              title={t('auth.login.submit')}
              onPress={submit}
              loading={isLoading}
            />
          </View>

          {/* Footer Links */}
          <View className="mt-2 items-center gap-4">
            <Pressable
              onPress={() => router.push('/(auth)/reset-password' as never)}
              disabled={isLoading}
              className="py-1"
            >
              <AppText className="text-[13px] font-medium text-app-primary">
                {t('auth.login.forgotPassword')}
              </AppText>
            </Pressable>

            <View
              className="flex-row items-center gap-1.5"
              style={{ flexDirection: rowDir, justifyContent: 'center' }}
            >
              <AppText className="text-[13px] text-app-textMuted">
                {t('auth.login.noAccount')}
              </AppText>
              <Pressable
                onPress={() => router.replace('/(auth)/signup' as never)}
                disabled={isLoading}
                className="py-1"
              >
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

