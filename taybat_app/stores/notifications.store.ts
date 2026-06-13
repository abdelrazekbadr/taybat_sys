import type { RealtimeChannel } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { notificationsRepository } from '@/repositories/notifications';
import { toUserMessage } from '@/shared/errors/AppError';
import type { AppNotification } from '@/types';

import { useUserStore } from './user.store';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';
const NOTIF_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — realtime channel handles live updates

interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  errorMessage: string;
  lastFetchedAt: number | null;

  loadNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  resetNotifications: () => void;
}

const initialState = {
  notifications: [] as AppNotification[],
  unreadCount: 0,
  isLoading: false,
  errorMessage: '',
  lastFetchedAt: null as number | null,
};

let realtimeChannel: RealtimeChannel | null = null;

function setupNotificationsChannel() {
  if (USE_MOCK || realtimeChannel) return;
  realtimeChannel = supabase
    .channel('app_notifications_feed')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'app_notifications' },
      (payload) => {
        const incoming = { ...(payload.new as AppNotification), is_read: false };
        useNotificationsStore.setState((state) => ({
          notifications: [incoming, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },
    )
    .subscribe();
}

function teardownNotificationsChannel() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  ...initialState,

  loadNotifications: async (force = false) => {
    const { lastFetchedAt } = get();
    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < NOTIF_CACHE_TTL_MS && get().notifications.length > 0) {
      return;
    }
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      const userId = user?.id ?? '';
      const userRegisteredAt = user?.registered_at ?? new Date(0).toISOString();
      const notifications = await notificationsRepository.getNotifications(userId, userRegisteredAt);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount, isLoading: false, lastFetchedAt: Date.now() });
      setupNotificationsChannel();
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  markAsRead: async (notificationId) => {
    const prev = get().notifications;
    const wasUnread = prev.find((n) => n.id === notificationId && !n.is_read);

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n,
      ),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
    }));

    try {
      const userId = useUserStore.getState().user?.id ?? '';
      await notificationsRepository.markAsRead(userId, notificationId);
    } catch (error: unknown) {
      set({ notifications: prev, errorMessage: toUserMessage(error) });
    }
  },

  markAllAsRead: async () => {
    const prev = get().notifications;
    const unreadIds = prev.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));

    try {
      const userId = useUserStore.getState().user?.id ?? '';
      await notificationsRepository.markAllAsRead(userId, unreadIds);
    } catch (error: unknown) {
      set({ notifications: prev, errorMessage: toUserMessage(error) });
    }
  },

  resetNotifications: () => {
    teardownNotificationsChannel();
    set({ ...initialState });
  },
}));
