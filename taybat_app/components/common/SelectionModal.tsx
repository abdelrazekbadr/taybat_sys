import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Modal, Portal, useTheme } from 'react-native-paper';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';

export type SelectionOption<T extends string | number> = {
  value: T;
  label: string;
};

export function SelectionModal<T extends string | number>(props: {
  visible: boolean;
  title: string;
  options: SelectionOption<T>[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <Portal>
      <Modal
        visible={props.visible}
        onDismiss={props.onDismiss}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          marginHorizontal: 18,
          borderRadius: 18,
          padding: 14,
          maxHeight: '78%',
        }}
      >
        <View className="mb-3" style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between' }}>
          <AppText variant="bold" className="text-[16px] text-app-text">
            {props.title}
          </AppText>
          <Pressable onPress={props.onDismiss} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
            <AppText className="text-[13px] text-app-primary">إغلاق</AppText>
          </Pressable>
        </View>

        <FlatList
          data={props.options}
          keyExtractor={(item) => String(item.value)}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View className="h-[1px] bg-app-lineSoft" />}
          renderItem={({ item }) => {
            const selected = props.selectedValue === item.value;
            return (
              <Pressable
                onPress={() => props.onSelect(item.value)}
                className="px-2 py-3"
                style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={{ flexDirection: rowDir, alignItems: 'center', justifyContent: 'space-between' }}>
                  <AppText className="text-[14px] text-app-text">{item.label}</AppText>
                  {selected ? (
                    <AppText variant="semibold" className="text-[12px]" style={{ color: theme.colors.primary }}>
                      ✓
                    </AppText>
                  ) : null}
                </View>
              </Pressable>
            );
          }}
        />
      </Modal>
    </Portal>
  );
}

