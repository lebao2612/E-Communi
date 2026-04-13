import React, { useEffect } from 'react';
import { User } from '../types/user';
import { useAuthStore } from '../stores/authStore';
import { getAccessToken } from '../api/axios';
import { useRealtimeStore } from '../stores/realtimeStore';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  logout: () => void;
  markLoggedIn: () => void;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const initialized = useAuthStore((state) => state.initialized);
  const logout = useAuthStore((state) => state.logout);
  const connectRealtime = useRealtimeStore((state) => state.connect);
  const disconnectRealtime = useRealtimeStore((state) => state.disconnect);

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const realtimeUrl = process.env.REACT_APP_REALTIME_URL || apiUrl;

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleLogoutEvent = () => {
      logout();
      disconnectRealtime();
    };
    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [logout, disconnectRealtime]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    const accessToken = getAccessToken();

    if (isLoggedIn && user && accessToken) {
      connectRealtime(realtimeUrl, accessToken);
      return;
    }

    disconnectRealtime();
  }, [initialized, isLoggedIn, user, realtimeUrl, connectRealtime, disconnectRealtime]);

  return <>{children}</>;
};

export const useAuth = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const markLoggedIn = useAuthStore((state) => state.markLoggedIn);

  return { isLoggedIn, loading, user, logout, markLoggedIn } as AuthContextType;
};
