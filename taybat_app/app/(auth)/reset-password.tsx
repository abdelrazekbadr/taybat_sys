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

const resetSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  const { control, handleSubmit, setError } = useForm<ResetForm>({ defaultValues: { email: '' } });

  const { isLoading, errorMessage, sendPasswordReset, clearError } = useAuthStore();
  const [isSent, setIsSent] = React.useState(false);

  const submit = handleSubmit(async (values) => {
    clearError();
    setIsSent(false);
    const parsed = resetSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = issue.path[0];
        if (name === 'email') {
          setError('email', { type: 'manual', message: issue.message });
        }
      }
      return;
    }

    const ok = await sendPasswordReset(parsed.data.email);
    if (ok) setIsSent(true);
  });

  return (
    <View className="flex-1 bg-app-background px-6">
      <View className="flex-1 justify-center">
        <AppText variant="bold" className="text-center text-[22px] leading-8 text-app-text">
          {t('auth.reset.title')}
        </AppText>
        <AppText className="mt-2 text-center text-[14px] leading-6 text-app-muted">
          {t('auth.reset.subtitle')}
        </AppText>

        <View className="mt-7 gap-4">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <View className="gap-1">
                <AppText className="text-[13px] text-app-textMuted">{t('auth.reset.email')}</AppText>
                <AppTextInput
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('auth.reset.email')}
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

          {isSent ? (
            <View className="rounded-xl bg-app-surface px-4 py-3" style={{ borderLeftWidth: 3, borderLeftColor: theme.colors.primary }}>
              <AppText className="text-[13px] leading-5" style={{ color: theme.colors.primary }}>
                {t('auth.reset.successMessage')}
              </AppText>
            </View>
          ) : null}

          <PrimaryButton title={t('auth.reset.submit')} onPress={submit} />

          <View className="mt-1 items-center">
            <Pressable onPress={() => router.replace('/(auth)/login' as never)} disabled={isLoading}>
              <AppText className="text-[13px] text-app-primary">{t('auth.reset.backToLogin')}</AppText>
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center" style={{ flexDirection: rowDir }}>
            <Pressable onPress={() => router.back()} disabled={isLoading}>
              <AppText className="text-[12px] text-app-textMuted">{t('auth.completeProfile.back')}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

