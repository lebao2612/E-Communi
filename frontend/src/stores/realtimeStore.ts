import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { usePresenceStore } from './presenceStore';
import { playNotificationSound } from '../utils/notificationSound';
import { useMessageStore } from './messageStore';
import { useAuthStore } from './authStore';
import api from '../api/axios';

interface RealtimeState {
  socket: Socket | null;
  connected: boolean;
  connect: (url: string, token: string) => Socket | null;
  disconnect: () => void;
}

let activeSocket: Socket | null = null;

export const useRealtimeStore = create<RealtimeState>((set) => ({
  socket: null,
  connected: false,

  connect: (url, token) => {
    if (!token) {
      return null;
    }

    if (activeSocket) {
      if (!activeSocket.connected) {
        activeSocket.auth = { token };
        activeSocket.connect();
      }
      set({ socket: activeSocket, connected: activeSocket.connected });
      return activeSocket;
    }

    const socket = io(url, {
      auth: {
        token,
      },
    });

    socket.on('connect', () => {
      socket.emit('join');
      set({ connected: true });

      void api.get('/api/messages/unread/summary')
        .then((res) => {
          const summary = res.data?.data || {};
          useMessageStore.getState().setUnreadCountByFriendId(summary);
        })
        .catch((error) => {
          console.error('Failed to hydrate unread summary:', error);
        });
    });

    socket.on('disconnect', () => {
      set({ connected: false });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('payload_error', (payload) => {
      console.error('Socket payload error:', payload);
    });

    // Presence events
    socket.on('online_users', (userIds: string[]) => {
      console.log('📋 Online users:', userIds);
      usePresenceStore.getState().setOnlineUsers(userIds);
    });

    socket.on('user_online', (data: { userId: string }) => {
      console.log('🟢 User online:', data.userId);
      usePresenceStore.getState().addOnlineUser(data.userId);
    });

    socket.on('user_offline', (data: { userId: string }) => {
      console.log('⚫ User offline:', data.userId);
      usePresenceStore.getState().removeOnlineUser(data.userId);
    });

    // Global message listener - play notification sound for all incoming messages
    socket.on('receiveMessage', (message: any) => {
      console.log('📨 Message received:', message);
      const currentUserId = useAuthStore.getState().user?._id;
      const conversationFriendId = currentUserId && message.user1 === currentUserId
        ? message.user2
        : message.user1;

      useMessageStore.getState().appendMessage(conversationFriendId, message);

      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const selectedFriendId = useMessageStore.getState().selectedFriendId;
      const isMessagePage = currentPath.startsWith('/message');
      const isActiveConversation = isMessagePage && selectedFriendId === conversationFriendId;

      if (!isActiveConversation) {
        useMessageStore.getState().incrementUnreadCount(conversationFriendId);
      }

      // Play notification sound regardless of which page user is on
      playNotificationSound(0.3);
    });

    activeSocket = socket;
    set({ socket, connected: socket.connected });
    return socket;
  },

  disconnect: () => {
    if (activeSocket) {
      activeSocket.removeAllListeners();
      activeSocket.disconnect();
      activeSocket = null;
    }
    useMessageStore.getState().resetAllUnreadCounts();
    set({ socket: null, connected: false });
  },
}));