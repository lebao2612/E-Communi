import { create } from 'zustand';
import api from '../api/axios';
import { Post } from '../types/post';
import { User } from '../types/user';

const FEED_PAGE_SIZE = 10;

interface FeedStoreState {
  allUsers: User[];
  allPosts: Post[];
  page: number;
  hasMore: boolean;
  isLoadingPosts: boolean;
  fetchSuggestedUsers: (currentUserId: string) => Promise<void>;
  fetchNextPage: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  prependNewPost: (post: Post) => void;
}

export const useFeedStore = create<FeedStoreState>((set, get) => ({
  allUsers: [],
  allPosts: [],
  page: 1,
  hasMore: true,
  isLoadingPosts: false,

  fetchSuggestedUsers: async (currentUserId) => {
    try {
      const res = await api.get('/api/users/getAllUsers');
      const users: User[] = res.data.users || res.data || [];
      set({ allUsers: users.filter((u) => u._id !== currentUserId) });
    } catch (error) {
      console.error('Failed to fetch suggested users:', error);
    }
  },

  fetchNextPage: async () => {
    const { isLoadingPosts, hasMore, page, allPosts } = get();
    if (isLoadingPosts || !hasMore) return;

    set({ isLoadingPosts: true });

    try {
      const res = await api.get(`/api/posts/getNewsFeed?page=${page}&limit=${FEED_PAGE_SIZE}`);
      const newPosts: Post[] = res.data.data || [];

      const existingIds = new Set(allPosts.map((post) => post._id));
      const uniqueNewPosts = newPosts.filter((post) => !existingIds.has(post._id));

      set({
        allPosts: [...allPosts, ...uniqueNewPosts],
        hasMore: newPosts.length >= FEED_PAGE_SIZE,
        page: newPosts.length >= FEED_PAGE_SIZE ? page + 1 : page,
      });
    } catch (error) {
      console.error('Error fetching news feed:', error);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  refreshFeed: async () => {
    set({ isLoadingPosts: true });

    try {
      const res = await api.get(`/api/posts/getNewsFeed?page=1&limit=${FEED_PAGE_SIZE}`);
      const firstPagePosts: Post[] = res.data.data || [];

      set({
        allPosts: firstPagePosts,
        page: firstPagePosts.length >= FEED_PAGE_SIZE ? 2 : 1,
        hasMore: firstPagePosts.length >= FEED_PAGE_SIZE,
      });
    } catch (error) {
      console.error('Error refreshing feed:', error);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  prependNewPost: (post) =>
    set((state) => ({
      allPosts: [post, ...state.allPosts],
    })),
}));
