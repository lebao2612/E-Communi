import { create } from 'zustand';
import api, { setAccessToken } from '../api/axios';
import { User } from '../types/user';

interface AuthState {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  initialized: boolean;
  initializing: boolean;
  initializeAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  markLoggedIn: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  loading: true,
  user: null,
  initialized: false,
  initializing: false,

  fetchUser: async () => {
    try {
      const res = await api.get('/api/users/me');
      set({ user: res.data });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      set({ user: null });
    }
  },

  initializeAuth: async () => {
    const { initialized, initializing, fetchUser } = get();

    if (initialized || initializing) {
      return;
    }

    set({ initializing: true, loading: true });

    try {
      // Gọi refresh-token với cookie httpOnly tự động đính kèm
      const res = await api.post('/api/users/refresh-token');
      setAccessToken(res.data.accessToken);
      set({ isLoggedIn: true });
      await fetchUser();
    } catch {
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      set({ isLoggedIn: false, user: null });
    } finally {
      set({ loading: false, initialized: true, initializing: false });
    }
  },

  logout: async () => {
    try {
      await api.post('/api/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      set({ isLoggedIn: false, user: null });
    }
  },

  markLoggedIn: () => {
    set({ isLoggedIn: true });
    void get().fetchUser();
  },
}));
