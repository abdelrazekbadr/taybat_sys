import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText, AppTextInput } from '@/components/common/AppText';
import { useAuthStore } from '@/stores/auth.store';
import { useRTL } from '@/hooks/useRTL';
import { storageService } from '@/api/storage/storageService';
import { STORAGE_KEYS } from '@/api/storage/storageKeys';

const splashLogo = require('../../assets/images/login_bg.png');

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_H = Math.min(SCREEN_H * 0.32, 260);
const LOGO_SIZE = Math.min(HERO_H * 0.65, 160);

const loginSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور 8 أحرف على الأقل'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { rowDir } = useRTL();
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const { control, handleSubmit, setError } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const { isLoading, errorMessage, loginWithEmail, loginWithOAuth, clearError, setGuestMode } =
    useAuthStore();

  useEffect(() => {
    storageService.get<boolean>(STORAGE_KEYS.REMEMBER_ME).then((v) => {
      if (v) setRememberMe(true);
    });
  }, []);

  const handleRememberToggle = () => {
    const next = !rememberMe;
    setRememberMe(next);
    storageService.set(STORAGE_KEYS.REMEMBER_ME, next);
  };

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

  const handleGoogle = async () => {
    clearError();
    const ok = await loginWithOAuth('google');
    if (!ok) return;
    const user = useAuthStore.getState().user;
    router.replace((user?.profile_completed ? '/(main)' : '/(auth)/complete-profile') as never);
  };

  const handleFacebook = async () => {
    clearError();
    const ok = await loginWithOAuth('facebook');
    if (!ok) return;
    const user = useAuthStore.getState().user;
    router.replace((user?.profile_completed ? '/(main)' : '/(auth)/complete-profile') as never);
  };

  const handleGuest = () => {
    setGuestMode();
    router.replace('/(main)' as never);
  };

  const isDark = theme.dark;
  const cardBg = isDark ? 'bg-app-navy' : 'bg-white';
  const inputBg = isDark ? 'bg-app-navy' : 'bg-[#F8FAFC]';
  const borderCls = isDark ? 'border-[#334155]' : 'border-[#E2E8F0]';
  const mutedText = isDark ? 'text-[#94a3b8]' : 'text-[#64748B]';
  const veryMuted = isDark ? 'text-[#64748B]' : 'text-[#94A3B8]';
  const lineCls = isDark ? 'bg-[#334155]' : 'bg-[#E8ECEF]';
  const socialBg = isDark ? 'bg-app-navy' : 'bg-white';

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDark ? 'bg-app-navy' : 'bg-app-background'}`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
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
                className="self-center -top-5 w-[70vw] h-[70vw]"
                resizeMode="contain"
              />
          </View>
        </LinearGradient>

        {/* ── Card ── */}
        <View
          className={`flex-1 -mt-[28px] rounded-t-[28px] px-6 pt-7 ${cardBg}`}
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* Greeting */}
          <View className="items-center mb-6">
            <AppText variant="bold" className="text-center text-[26px]" style={{ lineHeight: 36, color: theme.colors.primary }}>
              {t('auth.login.titleLine1')}
            </AppText>
          </View>

          {/* Form fields */}
          <View className="gap-[14px]">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value }, fieldState }) => (
                <View>
                  <View
                    className={`items-center h-[52px] rounded-[26px] border ${inputBg} ${fieldState.error ? 'border-[#fb7185]' : borderCls}`}
                    style={{ flexDirection: rowDir }}
                  >
                    <View className="px-4">
                      <Mail
                        size={18}
                        color={fieldState.error ? theme.colors.error : '#94A3B8'}
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
                      placeholder={t('auth.login.email')}
                      editable={!isLoading}
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      className="flex-1 h-full text-[14px]"
                      style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                    />
                  </View>
                  {fieldState.error?.message ? (
                    <AppText className="text-[12px] mt-1 text-start" style={{ color: theme.colors.error }}>
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
                <View>
                  <View
                    className={`items-center h-[52px] rounded-[26px] border ${inputBg} ${fieldState.error ? 'border-[#fb7185]' : borderCls}`}
                    style={{ flexDirection: rowDir }}
                  >
                    <View className="px-4">
                      <Lock
                        size={18}
                        color={fieldState.error ? theme.colors.error : '#94A3B8'}
                        strokeWidth={1.5}
                      />
                    </View>
                    <AppTextInput
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      placeholder={t('auth.login.password')}
                      editable={!isLoading}
                      placeholderTextColor={isDark ? '#64748B' : '#9CA3AF'}
                      className="flex-1 h-full text-[14px]"
                      style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      className="px-4"
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="#94A3B8" strokeWidth={1.5} />
                      ) : (
                        <Eye size={18} color="#94A3B8" strokeWidth={1.5} />
                      )}
                    </Pressable>
                  </View>
                  {fieldState.error?.message ? (
                    <AppText className="text-[12px] mt-1 text-start" style={{ color: theme.colors.error }}>
                      {fieldState.error.message}
                    </AppText>
                  ) : null}
                </View>
              )}
            />

            {/* Remember me + Forgot password */}
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={handleRememberToggle}
                className="flex-row items-center gap-2"
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <View
                  className="w-5 h-5 rounded items-center justify-center"
                  style={{
                    borderWidth: 1.5,
                    borderColor: rememberMe ? theme.colors.primary : isDark ? '#475569' : '#CBD5E1',
                    backgroundColor: rememberMe ? theme.colors.primary : 'transparent',
                  }}
                >
                  {rememberMe && (
                    <MaterialCommunityIcons name="check" size={13} color="#ffffff" />
                  )}
                </View>
                <AppText className={`text-[13px] ${mutedText}`}>
                  {t('auth.login.rememberMe')}
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => router.push('/(auth)/reset-password' as never)}
                disabled={isLoading}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <AppText className="text-[13px]" style={{ color: theme.colors.primary }}>
                  {t('auth.login.forgotPassword')}
                </AppText>
              </Pressable>
            </View>

            {/* Error */}
            {errorMessage ? (
              <View
                className="rounded-xl px-[14px] py-[10px]"
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#FEF2F2',
                  borderLeftWidth: 3,
                  borderLeftColor: theme.colors.error,
                }}
              >
                <AppText className="text-[13px] leading-5" style={{ color: theme.colors.error }}>
                  {errorMessage}
                </AppText>
              </View>
            ) : null}

            {/* Login button */}
            <Pressable
              onPress={submit}
              disabled={isLoading}
              style={{
                backgroundColor: theme.colors.primary,
                height: 54,
                borderRadius: 27,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <AppText variant="semibold" className="text-[15.5px] text-white">
                  {t('auth.login.submit')}
                </AppText>
              )}
            </Pressable>

            {/* OR divider */}
            <View className="flex-row items-center gap-3">
              <View className={`flex-1 h-px ${lineCls}`} />
              <AppText className={`text-[12px] ${veryMuted}`}>
                {t('auth.decision.orWith')}
              </AppText>
              <View className={`flex-1 h-px ${lineCls}`} />
            </View>

            {/* Social buttons — full-width outline pills */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={handleGoogle}
                disabled={isLoading}
                className={`flex-1 h-[52px] flex-row items-center justify-center gap-2 rounded-[26px] border ${socialBg}`}
                style={{
                  borderColor: isDark ? '#334155' : '#D1D5DB',
                  opacity: isLoading ? 0.5 : undefined,
                }}
              >
                <MaterialCommunityIcons name="google" size={22} color="#EA4335" />
                <AppText variant="semibold" className="text-[14px] text-app-text">
                  Google
                </AppText>
              </Pressable>

              <Pressable
                onPress={handleFacebook}
                disabled={isLoading}
                className={`flex-1 h-[52px] flex-row items-center justify-center gap-2 rounded-[26px] border ${socialBg}`}
                style={{
                  borderColor: isDark ? '#334155' : '#D1D5DB',
                  opacity: isLoading ? 0.5 : undefined,
                }}
              >
                <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
                <AppText variant="semibold" className="text-[14px] text-app-text">
                  Facebook
                </AppText>
              </Pressable>
            </View>

            {/* No account → Sign up */}
            <View className={`flex-row items-center justify-center gap-1`} style={{ flexDirection: rowDir }}>
              <AppText className={`text-[13px] text-center ${mutedText}`}>
                {t('auth.login.noAccount')}
              </AppText>
              <Pressable
                onPress={() => router.replace('/(auth)/signup' as never)}
                disabled={isLoading}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <AppText variant="semibold" className="text-[13px] text-center" style={{ color: theme.colors.primary }}>
                  {t('auth.login.signUpLink')}
                </AppText>
              </Pressable>
            </View>

            {/* Browse as guest */}
            <Pressable
              onPress={handleGuest}
              className="items-center py-1"
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <AppText className={`text-[13px] text-center ${veryMuted}`}>
                {t('auth.decision.browseFirst')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
