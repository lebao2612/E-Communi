import { create } from 'zustand';
import { Message } from '../types/message';
import { User } from '../types/user';

interface MessageStoreState {
  allUsers: User[];
  selectedFriendId: string | null;
  messagesByFriendId: Record<string, Message[]>;
  nextCursorByFriendId: Record<string, string | null>;
  hasMoreByFriendId: Record<string, boolean>;
  loadingOlderByFriendId: Record<string, boolean>;
  inputText: string;
  friendSearch: string;
  setAllUsers: (users: User[]) => void;
  setSelectedFriendId: (friendId: string | null) => void;
  setInputText: (text: string) => void;
  setFriendSearch: (search: string) => void;
  setConversation: (friendId: string, messages: Message[], nextCursor: string | null, hasMore: boolean) => void;
  appendMessage: (friendId: string, message: Message) => void;
  prependOlderMessages: (friendId: string, olderMessages: Message[], nextCursor: string | null, hasMore: boolean) => void;
  setLoadingOlder: (friendId: string, value: boolean) => void;
}

export const useMessageStore = create<MessageStoreState>((set) => ({
  allUsers: [],
  selectedFriendId: null,
  messagesByFriendId: {},
  nextCursorByFriendId: {},
  hasMoreByFriendId: {},
  loadingOlderByFriendId: {},
  inputText: '',
  friendSearch: '',

  setAllUsers: (users) => set({ allUsers: users }),

  setSelectedFriendId: (friendId) => set({ selectedFriendId: friendId }),

  setInputText: (text) => set({ inputText: text }),

  setFriendSearch: (search) => set({ friendSearch: search }),

  setConversation: (friendId, messages, nextCursor, hasMore) =>
    set((state) => ({
      messagesByFriendId: {
        ...state.messagesByFriendId,
        [friendId]: messages,
      },
      nextCursorByFriendId: {
        ...state.nextCursorByFriendId,
        [friendId]: nextCursor,
      },
      hasMoreByFriendId: {
        ...state.hasMoreByFriendId,
        [friendId]: hasMore,
      },
      loadingOlderByFriendId: {
        ...state.loadingOlderByFriendId,
        [friendId]: false,
      },
    })),

  appendMessage: (friendId, message) =>
    set((state) => ({
      messagesByFriendId: {
        ...state.messagesByFriendId,
        [friendId]: [...(state.messagesByFriendId[friendId] || []), message],
      },
    })),

  prependOlderMessages: (friendId, olderMessages, nextCursor, hasMore) =>
    set((state) => ({
      messagesByFriendId: {
        ...state.messagesByFriendId,
        [friendId]: [...olderMessages, ...(state.messagesByFriendId[friendId] || [])],
      },
      nextCursorByFriendId: {
        ...state.nextCursorByFriendId,
        [friendId]: nextCursor,
      },
      hasMoreByFriendId: {
        ...state.hasMoreByFriendId,
        [friendId]: hasMore,
      },
    })),

  setLoadingOlder: (friendId, value) =>
    set((state) => ({
      loadingOlderByFriendId: {
        ...state.loadingOlderByFriendId,
        [friendId]: value,
      },
    })),
}));
