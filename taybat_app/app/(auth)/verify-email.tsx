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
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomInset } from '@/hooks/useBottomInset';
import { MailCheck } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const RESEND_SECONDS = 60;

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const footerBottom = useBottomInset(32);
  const { rowDir } = useRTL();
  const { email } = useLocalSearchParams<{ email?: string }>();

  const { isLoading, errorMessage, verifyEmailOtp, resendVerificationEmail, clearError } =
    useAuthStore();

  const [otpError, setOtpError] = React.useState(false);
  const [resentSuccess, setResentSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(RESEND_SECONDS);

  // Countdown timer for resend button
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // Sync store error → OTP error state
  React.useEffect(() => {
    if (errorMessage) setOtpError(true);
  }, [errorMessage]);

  if (!email) {
    router.replace('/(auth)/login' as never);
    return null;
  }

  const handleComplete = async (code: string) => {
    clearError();
    setOtpError(false);
    const ok = await verifyEmailOtp(email, code);
    if (ok) {
      router.replace('/(auth)/complete-profile' as never);
    } else {
      setOtpError(true);
    }
  };

  const handleResend = async () => {
    clearError();
    setOtpError(false);
    setResentSuccess(false);
    const ok = await resendVerificationEmail(email);
    if (ok) {
      setResentSuccess(true);
      setCountdown(RESEND_SECONDS);
    }
  };

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
        {/* Icon */}
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
            <MailCheck size={36} color="#ffffff" strokeWidth={1.5} />
          </View>
        </View>

        <AppText
          variant="bold"
          style={{ fontSize: 22, color: '#ffffff', textAlign: 'center', lineHeight: 32 }}
        >
          {t('auth.verifyEmail.title')}
        </AppText>
        <AppText
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            textAlign: 'center',
            marginTop: 6,
          }}
        >
          {t('auth.verifyEmail.body')}
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
        {/* Scrollable content — OTP + status messages only */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 28,
            paddingTop: 36,
            paddingBottom: 16,
            gap: 28,
          }}
        >
          {/* Hint */}
          <AppText
            style={{
              fontSize: 14,
              color: '#64748B',
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {t('auth.verifyEmail.hint')}
          </AppText>

          {/* OTP boxes */}
          <OtpInput
            onComplete={handleComplete}
            disabled={isLoading}
            error={otpError}
            onReset={() => { setOtpError(false); clearError(); }}
          />

          {/* Loading indicator while verifying */}
          {isLoading && (
            <View style={{ alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <AppText style={{ fontSize: 13, color: '#94A3B8', marginTop: 8 }}>
                جارٍ التحقق…
              </AppText>
            </View>
          )}

          {/* Error message */}
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

          {/* Resent success message */}
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
                {t('auth.verifyEmail.resentMessage')}
              </AppText>
            </View>
          ) : null}
        </ScrollView>

        {/* Fixed footer — always visible above the Android nav bar */}
        <View
          style={{
            paddingBottom: footerBottom,
            paddingHorizontal: 28,
            paddingTop: 12,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Pressable
            onPress={handleResend}
            disabled={isLoading || countdown > 0}
            style={({ pressed }) => ({
              opacity: countdown > 0 || isLoading ? 0.45 : pressed ? 0.7 : 1,
              flexDirection: rowDir,
              alignItems: 'center',
              gap: 4,
            })}
          >
            <AppText
              variant="semibold"
              style={{ fontSize: 14, color: theme.colors.primary }}
            >
              {t('auth.verifyEmail.resend')}
            </AppText>
            {countdown > 0 && (
              <AppText style={{ fontSize: 13, color: '#94A3B8' }}>
                ({t('auth.verifyEmail.resendIn')} {countdown}s)
              </AppText>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.replace('/(auth)/login' as never)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: 4 })}
          >
            <AppText style={{ fontSize: 13, color: '#94A3B8' }}>
              {t('auth.verifyEmail.backToLogin')}
            </AppText>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
