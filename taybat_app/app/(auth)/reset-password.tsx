import { router } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomInset } from '@/hooks/useBottomInset';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail } from 'lucide-react-native';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const schema = z.object({
  email: z.string().email({ message: 'بريد إلكتروني غير صحيح' }),
});
type Form = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const footerBottom = useBottomInset(24);

  const { isLoading, errorMessage, sendPasswordReset, clearError } = useAuthStore();
  const { rowDir } = useRTL();
  const [isEmailFocused, setIsEmailFocused] = React.useState(false);

  const { control, handleSubmit, setError } = useForm<Form>({ defaultValues: { email: '' } });

  const submit = handleSubmit(async (values) => {
    clearError();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError('email', { type: 'manual', message: parsed.error.issues[0]?.message ?? 'بريد إلكتروني غير صحيح' });
      return;
    }
    const ok = await sendPasswordReset(parsed.data.email);
    if (ok) {
      router.push({ pathname: '/(auth)/reset-verify', params: { email: parsed.data.email } } as never);
    }
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f1f5f9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      {/* ── Gradient header ── */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 16, paddingBottom: 52, paddingHorizontal: 24 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Mail size={36} color="#ffffff" strokeWidth={1.5} />
          </View>
        </View>
        <AppText
          variant="bold"
          style={{ fontSize: 22, color: '#ffffff', textAlign: 'center', lineHeight: 32 }}
        >
          نسيت كلمة المرور؟
        </AppText>
        <AppText
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6 }}
        >
          أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
        </AppText>
      </LinearGradient>

      {/* ── White card ── */}
      <View
        style={{
          flex: 1,
          marginTop: -28,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: 36,
            paddingBottom: footerBottom,
            gap: 16,
          }}
        >
          {/* Email field */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <View style={{ gap: 6 }}>
                <AppText style={{ fontSize: 13, color: '#64748B' }}>البريد الإلكتروني</AppText>
                <View
                  style={{
                    flexDirection: rowDir,
                    alignItems: 'center',
                    height: 52,
                    borderRadius: 26,
                    borderWidth: 1.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: fieldState.error
                      ? theme.colors.error
                      : isEmailFocused
                        ? theme.colors.primary
                        : '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ paddingHorizontal: 16 }}>
                    <Mail
                      size={18}
                      color={
                        fieldState.error
                          ? theme.colors.error
                          : isEmailFocused
                            ? theme.colors.primary
                            : '#94A3B8'
                      }
                      strokeWidth={1.5}
                    />
                  </View>
                  <AppTextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    placeholder="أدخل بريدك الإلكتروني"
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                    style={{ flex: 1, height: '100%', fontSize: 14, color: '#1e293b', textAlign: 'right' }}
                  />
                </View>
                {fieldState.error?.message ? (
                  <AppText style={{ fontSize: 12, color: theme.colors.error }}>
                    {fieldState.error.message}
                  </AppText>
                ) : null}
              </View>
            )}
          />

          {/* Store error banner */}
          {errorMessage ? (
            <View
              style={{
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: '#FEF2F2',
                borderStartWidth: 3,
                borderStartColor: theme.colors.error,
              }}
            >
              <AppText style={{ fontSize: 13, lineHeight: 20, color: theme.colors.error }}>
                {errorMessage}
              </AppText>
            </View>
          ) : null}

          {/* Submit */}
          <PrimaryButton
            title="إرسال رمز التحقق"
            onPress={submit}
            loading={isLoading}
            disabled={isLoading}
          />

          {/* Back link */}
          <View style={{ alignItems: 'center', marginTop: 4 }}>
            <Pressable
              onPress={() => { clearError(); router.replace('/(auth)/login' as never); }}
              disabled={isLoading}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <AppText style={{ fontSize: 13, color: '#94A3B8' }}>
                العودة إلى تسجيل الدخول
              </AppText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
