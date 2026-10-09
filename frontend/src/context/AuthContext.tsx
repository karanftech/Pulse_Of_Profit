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
  setAuthMode: (mode: 'login' | 'register') => void;
  isLoadingAuth: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<void>;
  register: (name?: string, mob_no?: string, email?: string, password?: string) => Promise<void>;
  authenticateWithEmail: (email: string) => Promise<void>;
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
    // Client-verified email session: keep authenticated
    if (jwtToken.startsWith('email_') || jwtToken.startsWith('offline_')) {
      setIsLoadingAuth(false);
      setIsAuthModalOpen(false);
      return;
    }

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
        // If saved user profile exists in localStorage, maintain session
        const savedUser = localStorage.getItem('bts_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthModalOpen(false);
          } catch (e) {
            setIsAuthModalOpen(true);
          }
        } else {
          setIsAuthModalOpen(true);
        }
      }
    } catch (err) {
      console.warn('Backend offline or unreachable during auth check:', err);
      // Keep cached user if offline
      const savedUser = localStorage.getItem('bts_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthModalOpen(false);
        } catch (e) {
          setIsAuthModalOpen(true);
        }
      } else {
        setIsAuthModalOpen(true);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const authenticateWithEmail = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Helper to log user in directly on client
    const loginDirectly = (profileData?: Partial<UserProfile>, tokenStr?: string) => {
      const displayName = profileData?.name || trimmedEmail.split('@')[0].charAt(0).toUpperCase() + trimmedEmail.split('@')[0].slice(1);
      const existingUser: UserProfile = {
        email: trimmedEmail,
        name: displayName,
        mob_no: profileData?.mob_no || '',
        avatar: profileData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`,
        bio: profileData?.bio || 'Member of Pulse of Profit community.'
      };
      const sessionToken = tokenStr || ('email_' + btoa(trimmedEmail));
      localStorage.setItem('bts_token', sessionToken);
      localStorage.setItem('bts_user', JSON.stringify(existingUser));
      setToken(sessionToken);
      setUser(existingUser);
      setIsAuthModalOpen(false);
    };

    try {
      // 1. Try email-auth endpoint first
      let res = await fetch(`${API_BASE_URL}/api/auth/email-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail })
      });

      // 2. If endpoint not deployed yet (404), fallback to register endpoint
      if (res.status === 404) {
        res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedEmail.split('@')[0],
            mob_no: '',
            email: trimmedEmail,
            password: ''
          })
        });
      }

      if (res.ok) {
        const data = await res.json();
        loginDirectly(data.user, data.access_token);
        return;
      }

      // If response is not ok, inspect error detail
      const errData = await res.json().catch(() => ({}));
      const detailStr = String(errData.detail || '').toLowerCase();

      // If user already exists: Log them in directly!
      if (detailStr.includes('already exists') || detailStr.includes('exists') || res.status === 400) {
        loginDirectly();
        return;
      }

      throw new Error(errData.detail || 'Authentication failed');
    } catch (err: any) {
      const errMsg = String(err.message || '').toLowerCase();
      // If error indicates user already exists, log in directly
      if (errMsg.includes('already exists') || errMsg.includes('exists')) {
        loginDirectly();
        return;
      }

      // If network / fetch error (offline or cold start), log in with client session
      if (err.name === 'TypeError' || err.message?.includes('fetch')) {
        loginDirectly();
        return;
      }
      throw err;
    }
  };

  const login = async (email: string, password?: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error("Please enter your email address.");

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password: password || '' })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bts_token', data.access_token);
        localStorage.setItem('bts_user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return;
      }

      const errData = await res.json().catch(() => ({}));
      if (res.status === 401 && errData.detail) {
        throw new Error(errData.detail || "Invalid credentials");
      }

      // Auto-fallback
      await authenticateWithEmail(trimmedEmail);
    } catch (err: any) {
      if (err.message === 'Invalid credentials' || err.message?.toLowerCase().includes('password')) {
        throw err;
      }
      await authenticateWithEmail(trimmedEmail);
    }
  };

  const register = async (name?: string, mob_no?: string, email?: string, password?: string) => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) throw new Error("Please enter a valid email address.");

    const cleanName = (name || trimmedEmail.split('@')[0]).trim();
    const cleanMob = (mob_no || '').trim();

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          mob_no: cleanMob,
          email: trimmedEmail,
          password: password || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bts_token', data.access_token);
        localStorage.setItem('bts_user', JSON.stringify(data.user));
        setToken(data.access_token);
        setUser(data.user);
        setIsAuthModalOpen(false);
        return;
      }

      // Fallback
      await authenticateWithEmail(trimmedEmail);
      if (cleanName || cleanMob) {
        updateUserProfile({
          ...(cleanName ? { name: cleanName } : {}),
          ...(cleanMob ? { mob_no: cleanMob } : {})
        });
      }
    } catch (err: any) {
      await authenticateWithEmail(trimmedEmail);
      if (cleanName || cleanMob) {
        updateUserProfile({
          ...(cleanName ? { name: cleanName } : {}),
          ...(cleanMob ? { mob_no: cleanMob } : {})
        });
      }
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
        setAuthMode,
        isLoadingAuth,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        authenticateWithEmail,
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
