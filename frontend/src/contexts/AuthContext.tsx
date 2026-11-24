import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; role: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('titleflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('titleflow_token');
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('titleflow_user', JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem('titleflow_token');
          localStorage.removeItem('titleflow_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const data = await api.login(credentials);
    localStorage.setItem('titleflow_token', data.access_token);
    localStorage.setItem('titleflow_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const register = async (data: { email: string; password: string; full_name: string; role: string; phone?: string }) => {
    await api.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('titleflow_user', JSON.stringify(u));
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
