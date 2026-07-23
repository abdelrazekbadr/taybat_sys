import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';

import { createLogger } from '@/lib/logger';

const log = createLogger('network');

interface NetworkState {
  /** True when the device has a usable internet connection. Optimistic default (true)
   *  so the first render attempts a fetch; NetInfo corrects it within a tick. */
  isOnline: boolean;
  /** True the moment connectivity is regained after being offline — lets the sync
   *  engine (Phase 3) know it should flush the outbox. Consumers reset it. */
  justCameOnline: boolean;
  setOnline: (isOnline: boolean) => void;
  clearJustCameOnline: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  isOnline: true,
  justCameOnline: false,

  setOnline: (isOnline) => {
    const wasOffline = !get().isOnline;
    set({ isOnline, justCameOnline: isOnline && wasOffline });
  },

  clearJustCameOnline: () => set({ justCameOnline: false }),
}));

// A connection counts as usable only when connected AND the internet is reachable.
// `isInternetReachable` can be null while NetInfo probes — treat null as "assume online"
// so we never wrongly block the user on a slow probe.
function deriveOnline(state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean {
  if (state.isConnected === false) return false;
  if (state.isInternetReachable === false) return false;
  return true;
}

let unsubscribe: (() => void) | null = null;

/** Start listening for connectivity changes. Call once at app bootstrap. */
export function initNetworkListener(): void {
  if (unsubscribe) return;
  unsubscribe = NetInfo.addEventListener((state) => {
    const online = deriveOnline(state);
    if (online !== useNetworkStore.getState().isOnline) {
      log.debug('connectivity change → online:', online);
    }
    useNetworkStore.getState().setOnline(online);
  });
  // Seed the initial value.
  void NetInfo.fetch().then((state) => {
    useNetworkStore.getState().setOnline(deriveOnline(state));
  });
}

/** Non-React accessor for repositories / services. */
export function isOnline(): boolean {
  return useNetworkStore.getState().isOnline;
}
