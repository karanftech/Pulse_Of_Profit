'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  email: string;
  name: string;
  mob_no?: string;
  avatar: string;
  bio: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'register';
  isLoadingAuth: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, mob_no: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://pulse-of-profit.onrender.com').replace(/\/$/, '');


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('bts_token');
    const savedUser = localStorage.getItem('bts_user');
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthModalOpen(false);
        } catch (e) {}
      }
      fetchUserProfile(savedToken);
    } else {
      setIsLoadingAuth(false);
      setIsAuthModalOpen(true);
    }
  }, []);

  const fetchUserProfile = async (jwtToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('bts_user', JSON.stringify(data));
        setIsAuthModalOpen(false);
      } else {
        localStorage.removeItem('bts_token');
        localStorage.removeItem('bts_user');
        setToken(null);
        setUser(null);
        setIsAuthModalOpen(true);
      }
    } catch (err) {
      console.warn('Backend offline or unreachable during auth check:', err);
      // Keep cached user if offline
      if (!user) {
        setIsAuthModalOpen(true);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Invalid email or password');
      }

      const data = await res.json();
      localStorage.setItem('bts_token', data.access_token);
      localStorage.setItem('bts_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Please make sure the Python server is running (python main.py in backend folder).');
      }
      throw err;
    }
  };

  const register = async (name: string, mob_no: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mob_no, email, password })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Registration failed');
      }

      const data = await res.json();
      localStorage.setItem('bts_token', data.access_token);
      localStorage.setItem('bts_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        throw new Error('Unable to connect to backend server. Please make sure the Python server is running (python main.py in backend folder).');
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('bts_token');
    localStorage.removeItem('bts_user');
    setToken(null);
    setUser(null);
    setIsAuthModalOpen(true);
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updated };
      localStorage.setItem('bts_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthModalOpen,
        authMode,
        isLoadingAuth,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateUserProfile
      }}
    >
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
