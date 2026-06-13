import type { SupabaseClient } from '@supabase/supabase-js';

import { ServerError } from '@/shared/errors/AppError';
import type { AppNotification } from '@/types';
import type { INotificationsRepository } from './INotificationsRepository';

export class NotificationsRepositorySupabase implements INotificationsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getNotifications(userId: string, userRegisteredAt: string): Promise<AppNotification[]> {
    // Cutoff = latest of (90 days ago, user's registration date).
    // Prevents new users from seeing historical notifications and caps data to 90 days.
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
    const cutoff = userRegisteredAt > ninetyDaysAgo.toISOString()
      ? userRegisteredAt
      : ninetyDaysAgo.toISOString();

    const [{ data: notifications, error: nErr }, { data: reads, error: rErr }] = await Promise.all([
      this.client
        .from('app_notifications')
        .select('*')
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false }),
      this.client
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', userId),
    ]);

    if (nErr) throw new ServerError(nErr);
    if (rErr) throw new ServerError(rErr);

    const readIds = new Set((reads ?? []).map((r: { notification_id: number }) => r.notification_id));

    return (notifications ?? []).map((n) => ({
      ...n,
      is_read: readIds.has(n.id),
    })) as AppNotification[];
  }

  async markAsRead(userId: string, notificationId: number): Promise<void> {
    const { error } = await this.client
      .from('notification_reads')
      .upsert({ user_id: userId, notification_id: notificationId }, { onConflict: 'user_id,notification_id' });
    if (error) throw new ServerError(error);
  }

  async markAllAsRead(userId: string, notificationIds: number[]): Promise<void> {
    if (!notificationIds.length) return;
    const rows = notificationIds.map((id) => ({ user_id: userId, notification_id: id }));
    const { error } = await this.client
      .from('notification_reads')
      .upsert(rows, { onConflict: 'user_id,notification_id' });
    if (error) throw new ServerError(error);
  }
}
