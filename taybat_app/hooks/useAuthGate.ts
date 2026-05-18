import { useCallback } from 'react';

import { useAuthGateStore } from '@/stores/authGate.store';
import { useAuthStore } from '@/stores/auth.store';

export function useAuthGate() {
  const status = useAuthStore((s) => s.status);
  const openGate = useAuthGateStore((s) => s.openGate);

  const requireAuth = useCallback(
    (action: () => unknown | Promise<unknown>) => {
      if (status === 'authenticated') {
        void action();
        return;
      }
      openGate();
    },
    [openGate, status],
  );

  return { requireAuth };
}
