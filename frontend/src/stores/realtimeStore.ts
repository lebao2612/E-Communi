import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { usePresenceStore } from './presenceStore';
import { playNotificationSound } from '../utils/notificationSound';

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
    set({ socket: null, connected: false });
  },
}));