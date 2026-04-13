import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: Set<string>;
  setOnlineUsers: (userIds: string[]) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  isUserOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUserIds: new Set(),

  setOnlineUsers: (userIds) => {
    set({ onlineUserIds: new Set(userIds) });
  },

  addOnlineUser: (userId) => {
    const { onlineUserIds } = get();
    const newSet = new Set(onlineUserIds);
    newSet.add(userId);
    set({ onlineUserIds: newSet });
  },

  removeOnlineUser: (userId) => {
    const { onlineUserIds } = get();
    const newSet = new Set(onlineUserIds);
    newSet.delete(userId);
    set({ onlineUserIds: newSet });
  },

  isUserOnline: (userId) => {
    return get().onlineUserIds.has(userId);
  },
}));
