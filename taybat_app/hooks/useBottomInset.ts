import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns a safe bottom padding value for use in footer/button areas.
 *
 * On Android, Samsung One UI (and other OEMs) enforce edge-to-edge display
 * while react-native-safe-area-context reports insets.bottom = 0.
 * A 40dp floor covers all nav modes: gesture bar (~34dp) and button bar (~48dp).
 *
 * Usage:
 *   const bottom = useBottomInset(20);  // nav bar height + 20dp breathing room
 *   <View style={{ paddingBottom: bottom }} />
 */
export function useBottomInset(extra = 0): number {
  const { bottom } = useSafeAreaInsets();
  // 48dp = standard Android navigation bar height (button nav).
  // Samsung One UI and other OEMs enforce edge-to-edge while reporting insets.bottom = 0,
  // so we always guarantee at least one full nav bar height worth of clearance.
  const safe = Platform.OS === 'android' ? Math.max(bottom, 48) : bottom;
  return safe + extra;
}
