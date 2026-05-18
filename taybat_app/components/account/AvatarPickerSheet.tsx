import React from 'react';
import { Pressable, View } from 'react-native';
import { Modal, Portal, useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';
import { themeTokens } from '@/theme';
import type { AvatarConfig, AvatarType } from '@/types';

import { SegmentedToggle } from './SegmentedToggle';

const EMOJI_PRESETS = ['🌿', '🌱', '🧑‍⚕️', '💪', '⭐', '🎯', '🏆', '🌸'];

const COLOR_PRESETS = [
  themeTokens.colors.brand.emerald,
  themeTokens.colors.brand.teal,
  themeTokens.colors.brand.gold,
  themeTokens.colors.brand.rose,
  themeTokens.colors.brand.purple,
  themeTokens.colors.brand.orange,
];

const firstLetter = (name: string) => {
  const trimmed = name.trim();
  if (!trimmed) return '؟';
  return trimmed[0] ?? '؟';
};

export interface AvatarPickerSheetProps {
  visible: boolean;
  name: string;
  value: AvatarConfig | null;
  onDismiss: () => void;
  onSelect: (config: AvatarConfig) => void;
}

export function AvatarPickerSheet({ visible, name, value, onDismiss, onSelect }: AvatarPickerSheetProps) {
  const theme = useTheme();
  const { rowDir } = useRTL();
  const [activeTab, setActiveTab] = React.useState<AvatarType>(value?.type ?? 'letter');

  React.useEffect(() => {
    if (visible) {
      setActiveTab(value?.type ?? 'letter');
    }
  }, [value?.type, visible]);

  const currentLetter = firstLetter(name);
  const currentColor = value?.type === 'letter' ? value.color ?? COLOR_PRESETS[0] : COLOR_PRESETS[0];
  const previewLabel = value?.type === 'emoji' ? value.value : currentLetter;
  const previewBg = value?.type === 'emoji' ? theme.colors.surfaceVariant : currentColor;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          justifyContent: 'flex-end',
          margin: 0,
        }}
        style={{ margin: 0 }}
      >
        <View className="rounded-t-[24px] bg-app-surface px-5 pb-6 pt-4" style={{ borderTopColor: theme.colors.outlineVariant, borderTopWidth: 1 }}>
          <View className="flex-row items-center justify-between" style={{ flexDirection: rowDir }}>
            <AppText variant="bold" className="text-[16px] leading-6 text-app-navy">
              اختر صورتك الشخصية
            </AppText>
            <Pressable onPress={onDismiss} className="px-2 py-1" style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
              <AppText className="text-[13px] leading-5 text-app-textMuted">إغلاق</AppText>
            </Pressable>
          </View>

          <View className="mt-4 items-center">
            <View
              className="h-[76px] w-[76px] items-center justify-center rounded-[28px]"
              style={{ backgroundColor: previewBg }}
            >
              <AppText variant="bold" className="text-[34px] leading-[40px]" style={{ color: theme.colors.onSurface }}>
                {previewLabel}
              </AppText>
            </View>
          </View>

          <View className="mt-4">
            <SegmentedToggle
              options={[
                { label: 'الأحرف', value: 'letter' },
                { label: 'الرموز', value: 'emoji' },
              ]}
              value={activeTab}
              onChange={setActiveTab}
            />
          </View>

          {activeTab === 'letter' ? (
            <View className="mt-4">
              <AppText variant="semibold" className="mb-2 text-[13px] leading-5 text-app-textMuted">
                اختر اللون
              </AppText>
              <View className="flex-row flex-wrap gap-3" style={{ flexDirection: rowDir }}>
                {COLOR_PRESETS.map((color) => {
                  const isSelected = value?.type === 'letter' && value.color === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => onSelect({ type: 'letter', value: currentLetter, color })}
                      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
                    >
                      <View
                        className="h-[38px] w-[38px] rounded-[14px]"
                        style={{
                          backgroundColor: color,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: isSelected ? theme.colors.primary : 'transparent',
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View className="mt-4">
              <AppText variant="semibold" className="mb-2 text-[13px] leading-5 text-app-textMuted">
                اختر رمزاً
              </AppText>
              <View className="flex-row flex-wrap gap-2" style={{ flexDirection: rowDir }}>
                {EMOJI_PRESETS.map((emoji) => {
                  const isSelected = value?.type === 'emoji' && value.value === emoji;
                  return (
                    <Pressable
                      key={emoji}
                      onPress={() => onSelect({ type: 'emoji', value: emoji })}
                      className="h-[44px] w-[44px] items-center justify-center rounded-[16px] border"
                      style={({ pressed }) => [
                        { opacity: pressed ? 0.9 : 1 },
                        {
                          borderColor: isSelected ? theme.colors.primary : theme.colors.outlineVariant,
                          backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surface,
                        },
                      ]}
                    >
                      <AppText className="text-[20px] leading-[24px]">{emoji}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </Portal>
  );
}
