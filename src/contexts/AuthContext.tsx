import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  avatar?: string;
  joinedAt: string;
}

export type DemoProfileKey = 'analyst' | 'executive' | 'shreyas' | 'saniya' | 'shlok' | 'navya';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  sessionReady: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, company?: string) => Promise<boolean>;
  loginAsDemo: (type: DemoProfileKey) => void;
  logout: () => void;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
}

const STORAGE_KEY = 'abip_auth_user';

export const DEMO_PROFILES: Record<DemoProfileKey, UserProfile> = {
  analyst: {
    id: 'usr_analyst',
    name: 'Enterprise Data Analyst',
    email: 'analyst@retailbi.ai',
    role: 'Senior Business Intelligence Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
  executive: {
    id: 'usr_executive',
    name: 'Retail Strategy Director',
    email: 'director@retailbi.ai',
    role: 'Commercial Strategy & Forecasting Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
  // Backward compatibility keys for existing storage sessions
  shreyas: {
    id: 'usr_analyst',
    name: 'Enterprise Data Analyst',
    email: 'analyst@retailbi.ai',
    role: 'Senior Business Intelligence Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
  saniya: {
    id: 'usr_executive',
    name: 'Retail Strategy Director',
    email: 'director@retailbi.ai',
    role: 'Commercial Strategy & Forecasting Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
  shlok: {
    id: 'usr_analyst',
    name: 'Enterprise Data Analyst',
    email: 'analyst@retailbi.ai',
    role: 'Senior Business Intelligence Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
  navya: {
    id: 'usr_executive',
    name: 'Retail Strategy Director',
    email: 'director@retailbi.ai',
    role: 'Commercial Strategy & Forecasting Lead',
    company: 'Global Retail Corp',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    joinedAt: 'October 2026',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_STORAGE_KEY = 'abip_registered_users';

interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  company?: string;
  role: string;
  joinedAt: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Start unauthenticated so landing page shows fresh sign-in experience
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    setSessionReady(false);
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user ? { email: user.email } : {}),
    })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSessionReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    let registeredUsers: Record<string, RegisteredAccount> = {};
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {
      registeredUsers = {};
    }

    const existing = registeredUsers[cleanEmail];
    if (existing) {
      if (existing.password && password && existing.password !== password) {
        throw new Error('Invalid password. Please check your credentials and try again.');
      }
      const userProfile: UserProfile = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role,
        company: existing.company || 'Retail Enterprise',
        joinedAt: existing.joinedAt,
      };
      setUser(userProfile);
      setAuthModalOpen(false);
      return true;
    }

    // Provision new user session for valid credentials
    const namePart = email.split('@')[0] || 'Analyst';
    const formattedName =
      namePart
        .split(/[._-]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ') || 'Retail Analyst';

    const authenticatedUser: UserProfile = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: formattedName,
      email: email.trim(),
      role: 'Business Intelligence Analyst',
      company: 'Enterprise Retail Operations',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    registeredUsers[cleanEmail] = {
      ...authenticatedUser,
      password: password || '',
    };
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }

    setUser(authenticatedUser);
    setAuthModalOpen(false);
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, password?: string, company?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    let registeredUsers: Record<string, RegisteredAccount> = {};
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) registeredUsers = JSON.parse(stored);
    } catch {
      registeredUsers = {};
    }

    if (registeredUsers[cleanEmail]) {
      throw new Error('An account with this email address already exists. Please sign in instead.');
    }

    const newAccount: RegisteredAccount = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      name: name.trim(),
      email: email.trim(),
      password: password || '',
      role: 'Enterprise Business Analyst',
      company: company?.trim() || 'Retail Enterprise',
      joinedAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };

    registeredUsers[cleanEmail] = newAccount;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }

    // Direct back to sign in (do NOT auto-login user on signup)
    return true;
  }, []);

  const loginAsDemo = useCallback((type: DemoProfileKey) => {
    setUser(DEMO_PROFILES[type]);
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        sessionReady,
        login,
        signup,
        loginAsDemo,
        logout,
        openAuthModal,
        closeAuthModal,
        authModalOpen,
        authModalMode,
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
