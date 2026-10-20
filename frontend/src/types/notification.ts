import { User } from './user';
import { Post } from './post';

export type NotificationType = 'like' | 'comment' | 'follow';

export interface AppNotification {
  _id: string;
  recipient: string;
  sender: User;
  type: NotificationType;
  post?: Post | null;
  comment?: string | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
  page: number;
  totalPages: number;
  total: number;
}
