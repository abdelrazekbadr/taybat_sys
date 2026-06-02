import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
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
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';

const splashLogo = require('../../assets/images/food/dish2.png');

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.min(SCREEN_H * .30, 200);

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
  const insets = useSafeAreaInsets();
  const { rowDir } = useRTL();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { control, handleSubmit, setError, watch, trigger } = useForm<SignupForm>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
    mode: 'onTouched',
    reValidateMode: 'onChange',
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
    const result = await signUpWithEmail({ email: parsed.data.email, password: parsed.data.password });
    if (!result) return;
    if (result === 'pending_confirmation') {
      router.replace({ pathname: '/(auth)/verify-email', params: { email: parsed.data.email } } as never);
      return;
    }
    router.replace('/(auth)/complete-profile' as never);
  });

  const isDark = theme.dark;
  const cardBg = isDark ? 'bg-app-navy' : 'bg-white';
  const inputBg = isDark ? 'bg-app-navy' : 'bg-[#F8FAFC]';
  const borderDefault = isDark ? '#334155' : '#E2E8F0';
  const mutedText = isDark ? 'text-[#94a3b8]' : 'text-[#64748B]';
  const scrollBottomPadding = Platform.OS === 'android' ? 150 : 24;

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDark ? 'bg-app-navy' : 'bg-app-background'}`}
      behavior="height"
    >
      <StatusBar style="light" />

      <ScrollView
      className={cardBg}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        contentContainerStyle={{
          ...(Platform.OS === 'android' ? { flexGrow: 0 } : null),
          paddingBottom: insets.bottom + scrollBottomPadding,
        }}
      >
        {/* ── Gradient hero ── */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: HERO_H + insets.top, overflow: 'hidden' }}
        >
          <View className="flex-1 items-center justify-center">
            <Image
              source={splashLogo}
              className="self-center  w-[35vw] h-[35vw]"
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        {/* ── Card ── */}
        <View
          className={`flex-1 -mt-[28px] rounded-t-[28px] px-6 pt-7 ${cardBg}`}
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Title */}
          <View className="items-center mb-6">
            <AppText
              variant="bold"
              className="text-center text-[26px]"
              style={{ lineHeight: 36, color: theme.colors.primary }}
            >
              {t('auth.signup.title')}
            </AppText>
            <AppText className={`mt-1 text-center text-[12px] ${mutedText}`}>
             قم بإنشاء حساب لتجربة افضل في تخصيص الوجبات وآداء التقييمات
            </AppText>
          </View>

          {/* ── Form fields ── */}
          <View className="gap-[14px]">

            {/* Email */}
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'البريد الإلكتروني مطلوب',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'بريد إلكتروني غير صحيح' },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => {
                const hasError = !!fieldState.error;
                const isFocused = focusedField === 'email';
                const borderColor = hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : borderDefault;
                return (
                  <View>
                    <View
                      className={`items-center h-[52px] rounded-[26px] ${inputBg}`}
                      style={{ flexDirection: rowDir, borderColor, borderWidth: 1.5 }}
                    >
                      <View className="px-4">
                        <Mail
                          size={18}
                          color={hasError ? theme.colors.error : isFocused ? theme.colors.primary : '#94A3B8'}
                          strokeWidth={1.5}
                        />
                      </View>
                      <AppTextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setFocusedField(null); }}
                        onFocus={() => setFocusedField('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholder={t('auth.signup.email')}
                        placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                        returnKeyType="next"
                        editable={!isLoading}
                        className="flex-1 h-full text-[14px]"
                        style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                        accessibilityLabel={t('auth.signup.email')}
                        accessibilityHint="أدخل بريدك الإلكتروني لإنشاء حساب"
                      />
                    </View>
                    {hasError ? (
                      <AppText className="text-[12px] mt-1 ms-3" style={{ color: theme.colors.error }}>
                        {fieldState.error?.message}
                      </AppText>
                    ) : null}
                  </View>
                );
              }}
            />

            {/* Password */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'كلمة المرور مطلوبة',
                minLength: { value: 8, message: 'كلمة المرور 8 أحرف على الأقل' },
              }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => {
                const hasError = !!fieldState.error;
                const isFocused = focusedField === 'password';
                const borderColor = hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : borderDefault;
                return (
                  <View>
                    <View
                      className={`items-center h-[52px] rounded-[26px] ${inputBg}`}
                      style={{ flexDirection: rowDir, borderColor, borderWidth: 1.5 }}
                    >
                      <View className="px-4">
                        <Lock
                          size={18}
                          color={hasError ? theme.colors.error : isFocused ? theme.colors.primary : '#94A3B8'}
                          strokeWidth={1.5}
                        />
                      </View>
                      <AppTextInput
                        value={value}
                        onChangeText={(v) => { onChange(v); trigger('confirmPassword'); }}
                        onBlur={() => { onBlur(); setFocusedField(null); }}
                        onFocus={() => setFocusedField('password')}
                        secureTextEntry={!showPassword}
                        placeholder={t('auth.signup.password')}
                        placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                        returnKeyType="next"
                        editable={!isLoading}
                        className="flex-1 h-full text-[14px]"
                        style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                        accessibilityLabel={t('auth.signup.password')}
                        accessibilityHint="كلمة المرور يجب أن تكون 8 أحرف على الأقل"
                      />
                      <Pressable
                        onPress={() => setShowPassword((v) => !v)}
                        className="px-4"
                        accessibilityLabel={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword
                          ? <EyeOff size={18} color="#94A3B8" strokeWidth={1.5} />
                          : <Eye size={18} color="#94A3B8" strokeWidth={1.5} />}
                      </Pressable>
                    </View>
                    {hasError ? (
                      <AppText className="text-[12px] mt-1 ms-3" style={{ color: theme.colors.error }}>
                        {fieldState.error?.message}
                      </AppText>
                    ) : null}
                  </View>
                );
              }}
            />

            {/* Confirm Password */}
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'يرجى تأكيد كلمة المرور',
                validate: (v) => v === watch('password') || 'كلمات المرور غير متطابقة',
              }}
              render={({ field: { onChange, onBlur, value }, fieldState }) => {
                const hasError = !!fieldState.error;
                const isFocused = focusedField === 'confirmPassword';
                const borderColor = hasError
                  ? theme.colors.error
                  : isFocused
                  ? theme.colors.primary
                  : borderDefault;
                return (
                  <View>
                    <View
                      className={`items-center h-[52px] rounded-[26px] ${inputBg}`}
                      style={{ flexDirection: rowDir, borderColor, borderWidth: 1.5 }}
                    >
                      <View className="px-4">
                        <Lock
                          size={18}
                          color={hasError ? theme.colors.error : isFocused ? theme.colors.primary : '#94A3B8'}
                          strokeWidth={1.5}
                        />
                      </View>
                      <AppTextInput
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setFocusedField(null); }}
                        onFocus={() => setFocusedField('confirmPassword')}
                        secureTextEntry={!showConfirm}
                        placeholder={t('auth.signup.confirmPassword')}
                        placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                        returnKeyType="done"
                        onSubmitEditing={submit}
                        editable={!isLoading}
                        className="flex-1 h-full text-[14px]"
                        style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                        accessibilityLabel={t('auth.signup.confirmPassword')}
                        accessibilityHint="أعد كتابة كلمة المرور للتأكيد"
                      />
                      <Pressable
                        onPress={() => setShowConfirm((v) => !v)}
                        className="px-4"
                        accessibilityLabel={showConfirm ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                      >
                        {showConfirm
                          ? <EyeOff size={18} color="#94A3B8" strokeWidth={1.5} />
                          : <Eye size={18} color="#94A3B8" strokeWidth={1.5} />}
                      </Pressable>
                    </View>
                    {hasError ? (
                      <AppText className="text-[12px] mt-1 ms-3" style={{ color: theme.colors.error }}>
                        {fieldState.error?.message}
                      </AppText>
                    ) : null}
                  </View>
                );
              }}
            />

            {/* Global error */}
            {errorMessage ? (
              <View
                className="rounded-[14px] px-[14px] py-[10px]"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#FEF2F2',
                  borderStartWidth: 3,
                  borderStartColor: theme.colors.error,
                }}
              >
                <AppText className="text-[13px] leading-5" style={{ color: theme.colors.error }}>
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            {/* Submit */}
            <PrimaryButton title={t('auth.signup.submit')} onPress={submit} loading={isLoading} disabled={isLoading} />

            {/* Already have account */}
            <View
              className="mt-1 items-center gap-1"
              style={{ flexDirection: rowDir, justifyContent: 'center' }}
            >
              <AppText className={`text-[13px] ${mutedText}`}>
                {t('auth.signup.hasAccount')}
              </AppText>
              <Pressable
                onPress={() => router.replace('/(auth)/login' as never)}
                disabled={isLoading}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                accessibilityLabel={t('auth.signup.loginLink')}
                accessibilityRole="link"
              >
                <AppText variant="semibold" className="text-[13px]" style={{ color: theme.colors.primary }}>
                  {t('auth.signup.loginLink')}
                </AppText>
              </Pressable>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
