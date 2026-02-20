import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken } from '../api/axios';
import { User } from '../types/user';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null;
  logout: () => void;
  markLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/api/users/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setUser(null);
    }
  }, []);

  // AUTO REFRESH TOKEN KHI RELOAD APP
  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }

    api.post('/api/users/refresh-token', { refreshToken })
      .then(res => {
        setAccessToken(res.data.accessToken);
        setIsLoggedIn(true);
        fetchUser(); // Fetch user when token refreshes successfully
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchUser]);

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setAccessToken('');
    localStorage.removeItem('refreshToken');
  };

  const markLoggedIn = () => {
    setIsLoggedIn(true);
    fetchUser(); // Fetch user immediately after successful login
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, user, logout, markLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};
