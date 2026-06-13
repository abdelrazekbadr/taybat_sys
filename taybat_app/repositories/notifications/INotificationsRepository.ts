import type { AppNotification } from '@/types';

export interface INotificationsRepository {
  getNotifications(userId: string, userRegisteredAt: string): Promise<AppNotification[]>;
  markAsRead(userId: string, notificationId: number): Promise<void>;
  markAllAsRead(userId: string, notificationIds: number[]): Promise<void>;
}
