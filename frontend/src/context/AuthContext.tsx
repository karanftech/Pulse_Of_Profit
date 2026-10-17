'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  isLandingPageVisible: boolean;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  isLoadingAuth: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  dismissLandingPage: () => void;
  login: (email: string, password?: string) => Promise<void>;
  register: (name?: string, mob_no?: string, email?: string, password?: string) => Promise<void>;
  authenticateWithEmail: (email: string) => Promise<void>;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  invalidateSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      const envUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!envUrl || envUrl.includes('onrender.com')) {
        return 'http://localhost:8000';
      }
    }
  }
  return (process.env.NEXT_PUBLIC_API_URL || 'https://pulse-of-profit.onrender.com').replace(/\/$/, '');
};

export const API_BASE_URL = getApiBaseUrl();
const SESSION_DURATION_MS = 48 * 60 * 1000;


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLandingPageVisible, setIsLandingPageVisible] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const clearSession = () => {
    localStorage.removeItem('bts_token');
    localStorage.removeItem('bts_user');
    localStorage.removeItem('bts_session_expires_at');
    setToken(null);
    setUser(null);
    setIsAuthModalOpen(false);
    setIsLandingPageVisible(true);
  };

  const startSession = (sessionToken: string, profile: UserProfile) => {
    localStorage.setItem('bts_token', sessionToken);
    localStorage.setItem('bts_user', JSON.stringify(profile));
    localStorage.setItem('bts_session_expires_at', String(Date.now() + SESSION_DURATION_MS));
    setToken(sessionToken);
    setUser(profile);
    setIsAuthModalOpen(false);
    setIsLandingPageVisible(false);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('bts_token');
    const savedUser = localStorage.getItem('bts_user');
    if (savedToken) {
      const savedExpiry = Number(localStorage.getItem('bts_session_expires_at'));
      if (savedExpiry && savedExpiry <= Date.now()) {
        clearSession();
        setIsLoadingAuth(false);
        return;
      }
      if (!savedExpiry) {
        localStorage.setItem('bts_session_expires_at', String(Date.now() + SESSION_DURATION_MS));
      }
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
      setIsAuthModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const expiresAt = Number(localStorage.getItem('bts_session_expires_at'));
    const endSessionIfExpired = () => {
      if (Date.now() >= expiresAt) clearSession();
    };
    const timeout = window.setTimeout(endSessionIfExpired, Math.max(0, expiresAt - Date.now()));
    window.addEventListener('focus', endSessionIfExpired);
    document.addEventListener('visibilitychange', endSessionIfExpired);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('focus', endSessionIfExpired);
      document.removeEventListener('visibilitychange', endSessionIfExpired);
    };
  }, [token]);

  // Check account status while the site is open so an admin block takes effect promptly.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const validateAccount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && (response.status === 401 || response.status === 403)) clearSession();
      } catch {
        // A temporary network failure does not invalidate a cached session.
      }
    };
    const interval = window.setInterval(validateAccount, 15000);
    window.addEventListener('focus', validateAccount);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', validateAccount);
    };
  }, [token]);

  const fetchUserProfile = async (jwtToken: string) => {
    // Only server-issued JWTs may unlock protected routes.
    if (jwtToken.startsWith('email_') || jwtToken.startsWith('offline_')) {
      clearSession();
      setIsLoadingAuth(false);
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
      } else if (res.status === 401 || res.status === 403) {
        clearSession();
      } else {
        // If saved user profile exists in localStorage, maintain session
        const savedUser = localStorage.getItem('bts_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
            setIsAuthModalOpen(false);
          } catch (e) {
            setIsAuthModalOpen(false);
          }
        } else {
          setIsAuthModalOpen(false);
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
          setIsAuthModalOpen(false);
        }
      } else {
        setIsAuthModalOpen(false);
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(false);
    if (mode === 'register') {
      router.push('/register');
    } else {
      router.push('/login');
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setIsLandingPageVisible(true);
  };

  const dismissLandingPage = () => setIsLandingPageVisible(false);

  const authenticateWithEmail = async (email: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const baseUrl = getApiBaseUrl();

    // Helper to log user in directly on client
    const loginDirectly = (profileData: Partial<UserProfile>, tokenStr: string) => {
      const displayName = profileData?.name || trimmedEmail.split('@')[0].charAt(0).toUpperCase() + trimmedEmail.split('@')[0].slice(1);
      const existingUser: UserProfile = {
        email: trimmedEmail,
        name: displayName,
        mob_no: profileData?.mob_no || '',
        avatar: profileData?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trimmedEmail}`,
        bio: profileData?.bio || 'Member of Pulse of Profit community.'
      };
      startSession(tokenStr, existingUser);
    };

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      // 1. Try email-auth endpoint first
      let res = await fetch(`${baseUrl}/api/auth/email-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
        signal: controller.signal
      });

      // 2. If endpoint not deployed yet (404), fallback to register endpoint
      if (res.status === 404) {
        res = await fetch(`${baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedEmail.split('@')[0],
            mob_no: '',
            email: trimmedEmail,
            password: ''
          }),
          signal: controller.signal
        });
      }

      window.clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        loginDirectly(data.user, data.access_token);
        return;
      }

      // If response is not ok, inspect error detail
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Authentication failed');
    } catch (err: any) {
      window.clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Server request timed out. Please verify that your backend server is running and try again.');
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
        startSession(data.access_token, data.user);
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
        startSession(data.access_token, data.user);
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
        isLandingPageVisible,
        authMode,
        setAuthMode,
        isLoadingAuth,
        openAuthModal,
        closeAuthModal,
        dismissLandingPage,
        login,
        register,
        authenticateWithEmail,
        updateUserProfile,
        invalidateSession: clearSession
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
