import React from 'react';
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const BOX_SIZE = 52;
const BOX_RADIUS = 16;
const OTP_LENGTH = 6;

interface OtpInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
  onReset?: () => void; // called when user clears after error
}

export function OtpInput({ onComplete, disabled, error, onReset }: OtpInputProps) {
  const theme = useTheme();
  const [digits, setDigits] = React.useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focused, setFocused] = React.useState<number | null>(null);
  const inputRefs = React.useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!disabled) {
        inputRefs.current[0]?.focus();
      }
    }, 80);
    return () => clearTimeout(t);
  }, [disabled]);

  // Clear and re-focus when parent signals an error reset
  React.useEffect(() => {
    if (!error) return;
    // leave digits visible so user sees what was wrong
  }, [error]);

  const focus = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChangeText = (text: string, index: number) => {
    if (error && onReset) onReset();

    // Handle paste of a full OTP code
    const clean = text.replace(/\D/g, '');
    if (clean.length === OTP_LENGTH) {
      const next = clean.split('');
      setDigits(next);
      focus(OTP_LENGTH - 1);
      onComplete(clean);
      return;
    }

    const digit = clean.slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      focus(index + 1);
    }

    if (next.every((d) => d !== '')) {
      onComplete(next.join(''));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        setDigits(next);
        focus(index - 1);
      }
    }
  };

  const clearAll = () => {
    setDigits(Array(OTP_LENGTH).fill(''));
    focus(0);
    onReset?.();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => {
        const isFocused = focused === index;
        const hasError = error;
        const borderColor = hasError
          ? theme.colors.error
          : isFocused
          ? theme.colors.primary
          : '#E2E8F0';
        const backgroundColor = hasError
          ? '#FEF2F2'
          : isFocused
          ? theme.colors.primaryContainer
          : '#F8FAFC';

        return (
          <TextInput
            key={index}
            ref={(ref) => { inputRefs.current[index] = ref; }}
            value={digits[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => setFocused(index)}
            onBlur={() => setFocused(null)}
            keyboardType="number-pad"
            maxLength={index === 0 ? OTP_LENGTH : 1}
            editable={!disabled}
            selectTextOnFocus
            style={{
              width: BOX_SIZE,
              height: BOX_SIZE,
              borderRadius: BOX_RADIUS,
              borderWidth: isFocused || hasError ? 2 : 1.5,
              borderColor,
              backgroundColor,
              textAlign: 'center',
              fontSize: 22,
              fontFamily: 'Cairo-Bold',
              color: hasError ? theme.colors.error : '#1e293b',
            }}
            onPress={() => {
              if (error) clearAll();
            }}
          />
        );
      })}
    </View>
  );
}
