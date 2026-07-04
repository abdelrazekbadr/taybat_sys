import { usePathname } from 'expo-router';
import { useEffect } from 'react';

import { trackScreen } from '@/services/analytics';

/**
 * Logs a Firebase `screen_view` whenever the active route changes.
 * Mount once near the root (inside the Stack). Uses the expo-router pathname
 * as the screen name so every navigation is captured without per-screen wiring.
 */
export function useScreenTracking(): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // Normalize "/" → "home" and strip the leading slash for readability.
    const screenName = pathname === '/' ? 'home' : pathname.replace(/^\//, '');
    void trackScreen(screenName);
  }, [pathname]);
}
