import { create } from 'zustand';
import axios from 'axios';
import { Post } from '../types/post';
import { User } from '../types/user';

interface SearchStoreState {
  query: string;
  activeTab: 'users' | 'posts';
  users: User[];
  posts: Post[];
  loading: boolean;
  recentSearches: string[];
  setQuery: (query: string) => void;
  setActiveTab: (tab: 'users' | 'posts') => void;
  fetchUsersOnly: (query: string) => Promise<void>;
  fetchAllResults: (query: string) => Promise<void>;
  addRecentSearch: (query: string) => void;
  clearResults: () => void;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  query: '',
  activeTab: 'users',
  users: [],
  posts: [],
  loading: false,
  recentSearches: [],

  setQuery: (query) => set({ query }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchUsersOnly: async (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      set({ users: [], loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/api/search?q=${normalizedQuery}&type=users`);
      if (response.data.success) {
        set({ users: response.data.data.users || [] });
      }
    } catch (error) {
      console.error('Error fetching user search results:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchAllResults: async (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      set({ users: [], posts: [], loading: false });
      return;
    }

    set({ loading: true });
    try {
      const response = await axios.get(`${API_URL}/api/search?q=${normalizedQuery}&type=all`);
      if (response.data.success) {
        set({
          users: response.data.data.users || [],
          posts: response.data.data.posts || [],
        });
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      set({ loading: false });
    }
  },

  addRecentSearch: (query) => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const nextRecentSearches = [
      normalizedQuery,
      ...get().recentSearches.filter((value) => value.toLowerCase() !== normalizedQuery.toLowerCase()),
    ].slice(0, 10);

    set({ recentSearches: nextRecentSearches });
  },

  clearResults: () => set({ users: [], posts: [] }),
}));
