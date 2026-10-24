import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';

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

const supabase = createClient();

function formatJoinedAt(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

async function mapUserToProfile(sbUser: User): Promise<UserProfile> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, company, role')
    .eq('id', sbUser.id)
    .single();

  const name =
    profile?.name ||
    sbUser.user_metadata?.name ||
    sbUser.email?.split('@')[0] ||
    'User';
  const company = profile?.company || 'Retail Enterprise';
  const role = profile?.role || 'Enterprise Business Analyst';

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    name,
    company,
    role,
    joinedAt: formatJoinedAt(sbUser.created_at),
  };
}

const DEMO_ACCOUNTS: Record<string, string> = {
  analyst: 'analyst@retailbi.ai',
  executive: 'director@retailbi.ai',
  shreyas: 'analyst@retailbi.ai',
  saniya: 'director@retailbi.ai',
  shlok: 'analyst@retailbi.ai',
  navya: 'director@retailbi.ai',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: sbUser } }) => {
      if (sbUser) {
        setUser(await mapUserToProfile(sbUser));
      }
      setSessionReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSessionReady(false);
        if (session?.user) {
          setUser(await mapUserToProfile(session.user));
        } else {
          setUser(null);
        }
        setSessionReady(true);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = useCallback((mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password || '',
    });
    if (error) throw new Error('Invalid email or password.');
    setAuthModalOpen(false);
    return true;
  }, []);

  const signup = useCallback(async (name: string, email: string, password?: string, company?: string) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password || '',
      options: {
        data: { name: name.trim(), company: company?.trim() || '' },
      },
    });
    if (error) throw new Error(error.message);
    await supabase.auth.signOut();
    return true;
  }, []);

  const loginAsDemo = useCallback(async (type: DemoProfileKey) => {
    const demoEmail = DEMO_ACCOUNTS[type];
    const { error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: 'Demo@12345',
    });
    if (error) {
      console.error('Demo login failed:', error.message);
      return;
    }
    setAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
