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
import { Eye, EyeOff, Lock } from 'lucide-react-native';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const schema = z
  .object({
    password: z.string().min(8, 'كلمة المرور ٨ أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

export default function ResetNewPasswordScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const footerBottom = useBottomInset(24);

  const { isLoading, errorMessage, updatePassword, initializeAuth, clearError } = useAuthStore();
  const { rowDir } = useRTL();
  const [showPass, setShowPass] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { control, handleSubmit, setError } = useForm<Form>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    clearError();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const name = issue.path[0] as 'password' | 'confirmPassword';
        setError(name, { type: 'manual', message: issue.message });
      }
      return;
    }
    const ok = await updatePassword(parsed.data.password);
    if (ok) {
      // initializeAuth loads the refreshed session → layout guard redirects to main
      await initializeAuth();
      // Fallback: if session wasn't established, go to login
      if (useAuthStore.getState().status === 'unauthenticated') {
        router.replace('/(auth)/login' as never);
      }
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
            <Lock size={36} color="#ffffff" strokeWidth={1.5} />
          </View>
        </View>
        <AppText
          variant="bold"
          style={{ fontSize: 22, color: '#ffffff', textAlign: 'center', lineHeight: 32 }}
        >
          كلمة مرور جديدة
        </AppText>
        <AppText
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 6 }}
        >
          أدخل كلمة مرور قوية لحماية حسابك
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
          {/* New password field */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <View style={{ gap: 6 }}>
                <AppText style={{ fontSize: 13, color: '#64748B' }}>كلمة المرور الجديدة</AppText>
                <View
                  style={{
                    flexDirection: rowDir,
                    alignItems: 'center',
                    height: 52,
                    borderRadius: 26,
                    borderWidth: 1.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: fieldState.error ? theme.colors.error : '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <Pressable onPress={() => setShowPass((v) => !v)} style={{ paddingHorizontal: 16 }}>
                    {showPass
                      ? <EyeOff size={18} color="#94A3B8" strokeWidth={1.5} />
                      : <Eye size={18} color="#94A3B8" strokeWidth={1.5} />}
                  </Pressable>
                  <AppTextInput
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPass}
                    placeholder="٨ أحرف على الأقل"
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                    style={{ flex: 1, height: '100%', fontSize: 14, color: '#1e293b', paddingHorizontal: 8, textAlign: 'right' }}
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

          {/* Confirm password field */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value }, fieldState }) => (
              <View style={{ gap: 6 }}>
                <AppText style={{ fontSize: 13, color: '#64748B' }}>تأكيد كلمة المرور</AppText>
                <View
                  style={{
                    flexDirection: rowDir,
                    alignItems: 'center',
                    height: 52,
                    borderRadius: 26,
                    borderWidth: 1.5,
                    backgroundColor: '#F8FAFC',
                    borderColor: fieldState.error ? theme.colors.error : '#E2E8F0',
                    overflow: 'hidden',
                  }}
                >
                  <Pressable onPress={() => setShowConfirm((v) => !v)} style={{ paddingHorizontal: 16 }}>
                    {showConfirm
                      ? <EyeOff size={18} color="#94A3B8" strokeWidth={1.5} />
                      : <Eye size={18} color="#94A3B8" strokeWidth={1.5} />}
                  </Pressable>
                  <AppTextInput
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showConfirm}
                    placeholder="أعد إدخال كلمة المرور"
                    editable={!isLoading}
                    placeholderTextColor="#9CA3AF"
                    style={{ flex: 1, height: '100%', fontSize: 14, color: '#1e293b', paddingHorizontal: 8, textAlign: 'right' }}
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
            title="حفظ كلمة المرور"
            onPress={submit}
            loading={isLoading}
            disabled={isLoading}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
