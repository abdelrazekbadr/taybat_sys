import { I18nManager, Platform } from 'react-native';

import { useAppStore } from '@/stores/app.store';

export function useRTL() {
  const language = useAppStore((s) => s.language);
  const isRTL = language === 'ar' || I18nManager.isRTL;
  // Android uses native RTL auto-flip via forceRTL+reload, so 'row' auto-flips there.
  // iOS disables native RTL flip (see _layout.tsx), so we drive row direction explicitly.
  const rowDir: 'row' | 'row-reverse' = Platform.OS === 'ios' && isRTL ? 'row-reverse' : 'row';
  return { isRTL, rowDir };
}
