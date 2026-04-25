import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qja_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('qja_token');
    localStorage.removeItem('qja_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('qja_token');
      if (!storedToken) { setLoading(false); return; }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token: t } = res.data.data;
    localStorage.setItem('qja_token', t);
    localStorage.setItem('qja_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const value = { user, token, login, logout, loading, isAdmin: user?.role === 'admin', isTeacher: user?.role === 'teacher', isStudent: user?.role === 'student' };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
