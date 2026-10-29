import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
  let profile: { name?: string; company?: string; role?: string } | null = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('name, company, role')
      .eq('id', sbUser.id)
      .single();
    profile = data;
  } catch {
    // profiles table missing or blocked by RLS: fall back to auth metadata
    profile = null;
  }

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
  // Tracks the signed-in user id so a tab refocus (which makes Supabase re-emit
  // SIGNED_IN for the same user) does not reset the session or the loaded data.
  const currentUserId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Initial session check
    supabase.auth
      .getUser()
      .then(async ({ data: { user: sbUser } }) => {
        if (sbUser) {
          const profile = await mapUserToProfile(sbUser);
          if (!cancelled) { currentUserId.current = sbUser.id; setUser(profile); }
        }
      })
      .catch(() => {
        // no session or network error: treat as logged out
      })
      .finally(() => {
        if (!cancelled) setSessionReady(true);
      });

    // Do NOT await other Supabase calls directly inside this callback: it can
    // deadlock the auth client. Defer the work with setTimeout instead.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // INITIAL_SESSION is handled by getUser() above.
        // TOKEN_REFRESHED does not change who the user is.
        if (event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') return;
        // Same user re-announced (e.g. switching back to this browser tab): ignore.
        if (event === 'SIGNED_IN' && session?.user?.id && session.user.id === currentUserId.current) return;

        setTimeout(async () => {
          if (cancelled) return;
          setSessionReady(false);
          if (session?.user) {
            const profile = await mapUserToProfile(session.user);
            if (!cancelled) { currentUserId.current = session.user.id; setUser(profile); }
          } else {
            currentUserId.current = null;
            setUser(null);
          }
          if (!cancelled) setSessionReady(true);
        }, 0);
      }
    );

    return () => {
      cancelled = true;
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
