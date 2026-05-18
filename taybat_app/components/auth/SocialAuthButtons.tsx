import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';

export function SocialAuthButtons(props: { isLoading: boolean; onGooglePress: () => void }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View className="gap-3">
      <View className="items-center">
        <AppText className="text-[12px] text-app-textMuted">{t('auth.decision.orWith')}</AppText>
      </View>

      <Pressable
        onPress={props.onGooglePress}
        disabled={props.isLoading}
        className="h-12 rounded-xl border border-app-lineSoft bg-app-surface px-4"
        style={({ pressed }) => [
          {
            opacity: props.isLoading ? 0.6 : pressed ? 0.9 : 1,
            flexDirection: rowDir,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          },
        ]}
      >
        {props.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <MaterialCommunityIcons name="google" size={18} color={theme.colors.primary} />
        )}
        <AppText variant="semibold" className="text-[14px] text-app-text">
          {t('auth.decision.continueWithGoogle')}
        </AppText>
      </Pressable>
    </View>
  );
}

