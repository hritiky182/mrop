import { AppNotification } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/data/mock/notifications';
import { getStoredItem, setStoredItem, STORAGE_KEYS } from '@/utils/storage';
import { getDataSourceConfig } from '@/config/dataSource';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';

export interface NotificationRepository {
  getAll(): Promise<AppNotification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
}

class MockNotificationRepository implements NotificationRepository {
  private getNotifs(): AppNotification[] {
    return getStoredItem<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, MOCK_NOTIFICATIONS);
  }

  private saveNotifs(notifs: AppNotification[]): void {
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }

  async getAll(): Promise<AppNotification[]> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    return this.getNotifs();
  }

  async markAsRead(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const notifs = this.getNotifs().map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.saveNotifs(notifs);
  }

  async markAllAsRead(): Promise<void> {
    await new Promise((r) => setTimeout(r, getDataSourceConfig().simulatedDelayMs));
    const notifs = this.getNotifs().map((n) => ({ ...n, read: true }));
    this.saveNotifs(notifs);
  }
}

class ApiNotificationRepository implements NotificationRepository {
  async getAll(): Promise<AppNotification[]> {
    return apiClient<AppNotification[]>(API_ENDPOINTS.NOTIFICATIONS);
  }

  async markAsRead(id: string): Promise<void> {
    return apiClient<void>(API_ENDPOINTS.NOTIFICATIONS_READ(id), {
      method: 'POST',
    });
  }

  async markAllAsRead(): Promise<void> {
    return apiClient<void>(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {
      method: 'POST',
    });
  }
}

export const notificationRepository: NotificationRepository =
  getDataSourceConfig().mode === 'api'
    ? new ApiNotificationRepository()
    : new MockNotificationRepository();
