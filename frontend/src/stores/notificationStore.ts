import { create } from 'zustand';
import api from '../api/axios';
import { AppNotification, GetNotificationsResponse } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addRealtimeNotification: (notification: AppNotification) => void;
  resetNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  page: 1,
  hasMore: true,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get<GetNotificationsResponse>('/api/notifications?page=1&limit=20');
      set({
        notifications: response.data.notifications,
        unreadCount: response.data.unreadCount,
        page: 1,
        hasMore: response.data.page < response.data.totalPages,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get<{ unreadCount: number }>('/api/notifications/unread-count');
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
    }
  },

  markAsRead: async (id: string) => {
    // Optimistic UI update
    set((state) => {
      const targetNotif = state.notifications.find((n) => n._id === id);
      const isAlreadyRead = targetNotif?.read;
      return {
        notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
        unreadCount: !isAlreadyRead && state.unreadCount > 0 ? state.unreadCount - 1 : state.unreadCount,
      };
    });

    try {
      const response = await api.patch<{ notification: AppNotification; unreadCount: number }>(
        `/api/notifications/${id}/read`
      );
      set({ unreadCount: response.data.unreadCount });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    // Optimistic UI update
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    try {
      await api.patch('/api/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  addRealtimeNotification: (newNotif: AppNotification) => {
    set((state) => {
      // Avoid duplicate notifications in array
      const filtered = state.notifications.filter((n) => n._id !== newNotif._id);
      return {
        notifications: [newNotif, ...filtered],
        unreadCount: state.unreadCount + 1,
      };
    });
  },

  resetNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      page: 1,
      hasMore: true,
    });
  },
}));
