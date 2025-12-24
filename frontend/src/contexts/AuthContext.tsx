import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { setAccessToken } from '../api/axios';

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => void;
  markLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

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
      })
      .catch(() => {
        localStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const logout = () => {
    setIsLoggedIn(false);
    setAccessToken('');
    localStorage.removeItem('refreshToken');
  };

  const markLoggedIn = () => {
    setIsLoggedIn(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, loading, logout, markLoggedIn }}>
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
