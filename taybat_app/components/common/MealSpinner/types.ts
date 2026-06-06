import type { TextStyle } from 'react-native';

export type SpinnerVariant = 'orbit' | 'pulse' | 'arc';
export type SpinnerSize = 80 | 120 | 160;
export type SpinnerSpeed = 'slow' | 'normal' | 'fast';

export interface MealSpinnerProps {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  speed?: SpinnerSpeed;
  items?: string[];
  plateEmoji?: string;
  label?: string;
  labelStyle?: TextStyle;
}
