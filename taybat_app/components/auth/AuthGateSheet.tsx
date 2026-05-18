import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Modal, Portal, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useAuthGateStore } from '@/stores/authGate.store';

export function AuthGateSheet() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isOpen, closeGate } = useAuthGateStore();

  return (
    <Portal>
      <Modal
        visible={isOpen}
        onDismiss={closeGate}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: 18,
          borderRadius: 22,
          padding: 16,
        }}
      >
        <AppText variant="bold" className="text-center text-[18px] text-app-text">
          {t('auth.gate.title')}
        </AppText>
        <AppText className="mt-2 text-center text-[13px] leading-6 text-app-muted">
          {t('auth.gate.subtitle')}
        </AppText>

        <View className="mt-5 gap-3">
          <PrimaryButton
            title={t('auth.gate.createAccount')}
            onPress={() => {
              closeGate();
              router.push('/(auth)/signup' as never);
            }}
          />
          <View className="rounded-xl border border-app-lineSoft bg-app-surface">
            <AppText
              variant="semibold"
              className="py-3 text-center text-[16px] text-app-primary"
              onPress={() => {
                closeGate();
                router.push('/(auth)/login' as never);
              }}
            >
              {t('auth.gate.login')}
            </AppText>
          </View>
          <View className="items-center">
            <AppText className="text-[13px] text-app-textMuted" onPress={closeGate}>
              {t('auth.gate.cancel')}
            </AppText>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

