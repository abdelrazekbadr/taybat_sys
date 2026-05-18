import React from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppText } from '@/components/common/AppText';

interface SocialAuthButtonsProps {
  isLoading: boolean;
  onGooglePress: () => void;
}

export function SocialAuthButtons({ isLoading, onGooglePress }: SocialAuthButtonsProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const surfaceColor = theme.dark ? '#1e293b' : '#ffffff';
  const borderColor = theme.dark ? '#334155' : '#E2E8F0';

  return (
    <Pressable
      onPress={onGooglePress}
      disabled={isLoading}
      style={({ pressed }) => ({
        height: 54,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor,
        backgroundColor: surfaceColor,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoading ? 0.55 : pressed ? 0.8 : 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme.dark ? 0 : 0.06,
        shadowRadius: 3,
        elevation: theme.dark ? 0 : 1,
      })}
    >
      {/* Inner View owns flexDirection — prevents AppText RTL text-align from leaking out */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <>
            <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
            <AppText
              variant="semibold"
              style={{ fontSize: 15, color: theme.dark ? '#f1f5f9' : '#1e293b', textAlign: 'center' }}
            >
              {t('auth.decision.continueWithGoogle')}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}
