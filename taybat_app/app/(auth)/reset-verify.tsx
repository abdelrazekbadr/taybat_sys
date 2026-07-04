import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
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
import { ShieldCheck } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/stores/auth.store';

const RESEND_SECONDS = 60;

export default function ResetVerifyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = useBottomInset(40);
  const { email } = useLocalSearchParams<{ email?: string }>();

  const { isLoading, errorMessage, verifyResetOtp, sendPasswordReset, clearError } = useAuthStore();

  const [otpError, setOtpError] = React.useState(false);
  const [resentSuccess, setResentSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(RESEND_SECONDS);

  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  React.useEffect(() => {
    if (errorMessage) setOtpError(true);
  }, [errorMessage]);

  if (!email) {
    router.replace('/(auth)/reset-password' as never);
    return null;
  }

  const handleComplete = async (code: string) => {
    clearError();
    setOtpError(false);
    const ok = await verifyResetOtp(email, code);
    if (ok) {
      router.replace('/(auth)/reset-new-password' as never);
    } else {
      setOtpError(true);
    }
  };

  const handleResend = async () => {
    clearError();
    setOtpError(false);
    setResentSuccess(false);
    const ok = await sendPasswordReset(email);
    if (ok) {
      setResentSuccess(true);
      setCountdown(RESEND_SECONDS);
    }
  };

  const canResend = !isLoading && countdown <= 0;

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
            <ShieldCheck size={36} color="#ffffff" strokeWidth={1.5} />
          </View>
        </View>
        <AppText
          variant="bold"
          style={{ fontSize: 22, color: '#ffffff', textAlign: 'center', lineHeight: 32 }}
        >
          أدخل رمز التحقق
        </AppText>
        <AppText
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6 }}
        >
          أرسلنا رمزاً مكوناً من ٦ أرقام إلى
        </AppText>
        <AppText
          variant="semibold"
          style={{ fontSize: 14, color: '#ffffff', textAlign: 'center', marginTop: 4 }}
        >
          {email}
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
            paddingBottom: bottomPad,
            gap: 24,
          }}
        >
          {/* Hint */}
          <AppText style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
            تحقق من بريدك الإلكتروني وأدخل الرمز المكون من ٦ أرقام
          </AppText>

          {/* OTP boxes */}
          <OtpInput
            onComplete={handleComplete}
            disabled={isLoading}
            error={otpError}
            onReset={() => { setOtpError(false); clearError(); }}
          />

          {/* Verifying indicator */}
          {isLoading && (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
                جارٍ التحقق…
              </AppText>
            </View>
          )}

          {/* OTP error */}
          {otpError && errorMessage ? (
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

          {/* Resent success */}
          {resentSuccess ? (
            <View
              style={{
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: theme.colors.primaryContainer,
                borderStartWidth: 3,
                borderStartColor: theme.colors.primary,
              }}
            >
              <AppText style={{ fontSize: 13, lineHeight: 20, color: theme.colors.primary }}>
                تم إعادة إرسال الرمز بنجاح
              </AppText>
            </View>
          ) : null}

          {/* Resend button */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Pressable
              onPress={handleResend}
              disabled={!canResend}
              style={{ opacity: canResend ? 1 : 0.45, alignItems: 'center', gap: 4 }}
            >
              <AppText variant="semibold" style={{ fontSize: 14, color: theme.colors.primary }}>
                إعادة إرسال الرمز
              </AppText>
              {countdown > 0 && (
                <AppText style={{ fontSize: 13, color: '#94A3B8' }}>
                  ({countdown}ث)
                </AppText>
              )}
            </Pressable>
          </View>

          {/* Back to login */}
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => router.replace('/(auth)/login' as never)}>
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
