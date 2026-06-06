import { STORAGE_KEYS } from '@/shared/storage/storageKeys';
import { storageService } from '@/shared/storage/storageService';
import type { AppNotification } from '@/types';
import { mockDelay } from '@/utils/mockDelay';
import type { INotificationsRepository } from './INotificationsRepository';

const MOCK_NOTIFICATIONS: Omit<AppNotification, 'is_read'>[] = [
  {
    id: 1,
    type: 'new_post',
    title: 'فريق الطيبات',
    body: 'أهلاً بكم في مجتمع عائلة الطيبات 🌿 نسعد بانضمامكم لهذه الرحلة الصحية المميزة.',
    image_url: null,
    action_type: 'community_post',
    action_ref: '1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

async function getReadIds(): Promise<Set<number>> {
  try {
    const value = await storageService.get<unknown>(STORAGE_KEYS.NOTIFICATION_READS);
    if (!Array.isArray(value)) return new Set();
    return new Set(value.filter((v): v is number => typeof v === 'number'));
  } catch {
    return new Set();
  }
}

export class NotificationsRepositoryMock implements INotificationsRepository {
  async getNotifications(_userId: string): Promise<AppNotification[]> {
    await mockDelay(200);
    const readIds = await getReadIds();
    return MOCK_NOTIFICATIONS.map((n) => ({ ...n, is_read: readIds.has(n.id) }));
  }

  async markAsRead(_userId: string, notificationId: number): Promise<void> {
    await mockDelay(100);
    const readIds = await getReadIds();
    readIds.add(notificationId);
    await storageService.set(STORAGE_KEYS.NOTIFICATION_READS, [...readIds]);
  }

  async markAllAsRead(_userId: string, notificationIds: number[]): Promise<void> {
    await mockDelay(100);
    const readIds = await getReadIds();
    notificationIds.forEach((id) => readIds.add(id));
    await storageService.set(STORAGE_KEYS.NOTIFICATION_READS, [...readIds]);
  }
}
