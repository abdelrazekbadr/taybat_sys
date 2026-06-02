import React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Check } from 'lucide-react-native';

import { AppText } from '@/components/common/AppText';
import { useRTL } from '@/hooks/useRTL';

export function StepIndicator(props: { steps: number; activeIndex: number }) {
  const theme = useTheme();
  const { rowDir } = useRTL();

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      {/* Numbered circles + connecting lines */}
      <View style={{ flexDirection: rowDir, alignItems: 'center' }}>
        {Array.from({ length: props.steps }).map((_, idx) => {
          const isActive = idx === props.activeIndex;
          const isDone = idx < props.activeIndex;
          const isLast = idx === props.steps - 1;
          const circleBg = isDone || isActive ? theme.colors.primary : '#E2E8F0';

          return (
            <React.Fragment key={idx}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: circleBg,
                }}
              >
                {isDone ? (
                  <Check size={15} color="white" strokeWidth={2.5} />
                ) : (
                  <AppText
                    variant="bold"
                    style={{ fontSize: 13, color: isActive ? 'white' : '#94A3B8' }}
                  >
                    {idx + 1}
                  </AppText>
                )}
              </View>
              {!isLast && (
                <View
                  style={{
                    width: 36,
                    height: 2,
                    backgroundColor: idx < props.activeIndex ? theme.colors.primary : '#E2E8F0',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Step count label */}
      <AppText style={{ fontSize: 12, color: '#94A3B8' }}>
        الخطوة {props.activeIndex + 1} من {props.steps}
      </AppText>
    </View>
  );
}
