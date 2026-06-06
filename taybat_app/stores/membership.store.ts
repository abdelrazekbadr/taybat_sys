import { create } from 'zustand';

import { membershipRepository } from '@/repositories/membership';
import { toUserMessage } from '@/shared/errors/AppError';
import type {
  MembershipConfig,
  MembershipTier,
  MembershipTrack,
  PointEventActionKey,
  PointEventReferenceType,
} from '@/types';
import { createLogger } from '@/lib/logger';

import { useUserStore } from './user.store';

const log = createLogger('membership');

interface MembershipState {
  // Config — loaded once at app init, persists for the session
  config: MembershipConfig | null;

  // Current user's rolling-window totals
  committedPoints: number;
  supporterPoints: number;
  committedTier: MembershipTier | null;
  supporterTier: MembershipTier | null;
  windowStart: string | null;

  isLoading: boolean;
  errorMessage: string;

  /**
   * Load config + tiers + rules once.
   * Call from the (main) layout after auth is confirmed.
   */
  init: () => Promise<void>;

  /**
   * Fetch rolling-window membership for the current user.
   * Auto-inits config if not yet loaded.
   */
  fetchMembership: () => Promise<void>;

  /**
   * Fire-and-forget: record a point event for the current user.
   * Silently no-ops for guests (no user in store).
   * Optimistically adds points locally so UI updates instantly.
   * Pass mealRefId for add_daily_meal and share_meal so dedup works correctly.
   */
  recordEvent: (
    track: MembershipTrack,
    actionKey: PointEventActionKey,
    referenceId?: string,
    referenceType?: PointEventReferenceType,
    mealRefId?: number,
  ) => Promise<void>;

  /**
   * Delete the committed day event for a specific date.
   * Only called when the last meal of that day is deleted.
   * Refreshes totals from server after deletion.
   */
  deleteDayEvent: (date: string) => Promise<void>;

  resetMembership: () => void;
}

const initialState = {
  config:          null as MembershipConfig | null,
  committedPoints: 0,
  supporterPoints: 0,
  committedTier:   null as MembershipTier | null,
  supporterTier:   null as MembershipTier | null,
  windowStart:     null as string | null,
  isLoading:       false,
  errorMessage:    '',
};

function resolveNextTier(
  config: MembershipConfig | null,
  track: MembershipTrack,
  points: number,
): MembershipTier | null {
  if (!config) return null;
  const tiers = config.tiers
    .filter((t) => t.track === track)
    .sort((a, b) => b.minPoints - a.minPoints);
  return tiers.find((t) => points >= t.minPoints) ?? tiers[tiers.length - 1] ?? null;
}

export const useMembershipStore = create<MembershipState>((set, get) => ({
  ...initialState,

  init: async () => {
    if (get().config) return; // already loaded
    try {
      const config = await membershipRepository.getConfig();
      set({ config });
    } catch (error: unknown) {
      log.error('init failed', error);
    }
  },

  fetchMembership: async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    // Auto-init config on first fetch if init() was not called yet
    if (!get().config) await get().init();

    set({ isLoading: true, errorMessage: '' });
    try {
      const membership = await membershipRepository.getUserMembership(user.id);
      set({
        committedPoints: membership.committedPoints,
        supporterPoints: membership.supporterPoints,
        committedTier:   membership.committedTier,
        supporterTier:   membership.supporterTier,
        windowStart:     membership.windowStart,
        isLoading:       false,
      });
    } catch (error: unknown) {
      set({ errorMessage: toUserMessage(error), isLoading: false });
      log.error('fetchMembership failed', error);
    }
  },

  recordEvent: async (track, actionKey, referenceId, referenceType, mealRefId) => {
    const user = useUserStore.getState().user;
    if (!user) return;

    // Optimistic local update — find the rule's point value from config
    const config = get().config;
    if (config) {
      const rule = config.rules.find((r) => r.actionKey === actionKey && r.track === track && r.isActive);
      if (rule) {
        if (track === 'committed') {
          const next = get().committedPoints + rule.points;
          set({
            committedPoints: next,
            committedTier:   resolveNextTier(config, 'committed', next),
          });
        } else {
          const next = get().supporterPoints + rule.points;
          set({
            supporterPoints: next,
            supporterTier:   resolveNextTier(config, 'supporter', next),
          });
        }
      }
    }

    try {
      await membershipRepository.recordEvent(user.id, track, actionKey, referenceId, referenceType, mealRefId);
    } catch (error: unknown) {
      log.error('recordEvent failed', error);
      void get().fetchMembership();
    }
  },

  deleteDayEvent: async (date) => {
    const user = useUserStore.getState().user;
    if (!user) return;
    try {
      await membershipRepository.deleteDayPointEvent(date);
      void get().fetchMembership();
    } catch (error: unknown) {
      log.error('deleteDayEvent failed', error);
    }
  },

  resetMembership: () => set({ ...initialState }),
}));
