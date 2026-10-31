'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DatasetStatus } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  dataset: DatasetStatus | null;
  loaded: boolean;
  filename: string;
  ready: boolean;
  backendUp: boolean;
  refreshing: boolean;
  version: number;
  theme: 'dark' | 'light';
  setTheme: (mode: 'dark' | 'light') => void;
  toggleTheme: () => void;
  refresh: () => Promise<void>;
  uploadFile: (file: File) => Promise<any>;
  loadSample: () => Promise<any>;
  removeData: () => Promise<any>;
  downloadTemplate: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

const THEME_TRANSITION_MS = 350;

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, sessionReady } = useAuth();
  // Optimistically hydrate cached dataset status from sessionStorage for instant zero-flash render
  const [dataset, setDataset] = useState<DatasetStatus | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem('abip_cached_dataset');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(true); // Never block the initial app shell paint
  const [backendUp, setBackendUp] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [version, setVersion] = useState(0);
  const lastUser = useRef<string | null>(null);

  // Dark mode is always enforced — no light mode option
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Tracks the last applied theme so we only animate on real changes (not on first mount)
  const prevTheme = useRef<'dark' | 'light' | null>(null);
  const transitionTimer = useRef<number | null>(null);

  const applyTheme = useCallback((mode: 'dark' | 'light', animate: boolean) => {
    const root = document.documentElement;

    if (animate) {
      // Temporarily enable color transitions (see .theme-transition in globals.css)
      root.classList.add('theme-transition');
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
      transitionTimer.current = window.setTimeout(() => {
        root.classList.remove('theme-transition');
        transitionTimer.current = null;
      }, THEME_TRANSITION_MS);
    }

    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('abip_theme', mode);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const animate = prevTheme.current !== null && prevTheme.current !== theme;
    applyTheme(theme, animate);
    prevTheme.current = theme;
  }, [theme, applyTheme]);

  // Clean up any pending timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimer.current !== null) {
        window.clearTimeout(transitionTimer.current);
      }
    };
  }, []);

  const setTheme = useCallback((mode: 'dark' | 'light') => {
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const load = useCallback(async (bump = false) => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/data/status');
      if (res.ok) {
        const data = await res.json();
        const active = data.database_exists && (data.total_rows || 0) > 0 ? data : null;
        setDataset(active);
        setBackendUp(true);
        try {
          if (active) {
            sessionStorage.setItem('abip_cached_dataset', JSON.stringify(active));
          } else {
            sessionStorage.removeItem('abip_cached_dataset');
          }
        } catch {}
      } else {
        setDataset(null);
      }
    } catch (e) {
      console.warn('Backend not reachable:', e);
      setDataset(null);
      setBackendUp(false);
    } finally {
      setRefreshing(false);
      setReady(true);
      if (bump) setVersion((v) => v + 1);
    }
  }, []);

  // Trigger non-blocking status check on initial mount
  useEffect(() => {
    load(false);
  }, [load]);

  // Resync when authentication state changes
  useEffect(() => {
    if (!sessionReady) return;
    const who = user?.email ?? '';
    if (lastUser.current !== null && lastUser.current !== who) {
      setDataset(null);
      try {
        sessionStorage.removeItem('abip_cached_dataset');
      } catch {}
    }
    lastUser.current = who;
    load(true);
  }, [load, sessionReady, user?.email]);
  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const uploadFile = useCallback(
    async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Upload failed.');
      }

      const data = await res.json();
      await load(true);
      return data;
    },
    [load]
  );

  const loadSample = useCallback(async () => {
    const res = await fetch('/api/data/sample', { method: 'POST' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || 'Could not load sample dataset.');
    }
    const data = await res.json();
    await load(true);
    return data;
  }, [load]);

  const removeData = useCallback(async () => {
    const res = await fetch('/api/data', { method: 'DELETE' });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || 'Could not remove data.');
    }
    const data = await res.json();
    await load(true);
    return data;
  }, [load]);

  const downloadTemplate = useCallback(() => {
    window.location.href = '/api/data/template';
  }, []);

  const value = useMemo(
    () => ({
      dataset,
      loaded: Boolean(dataset && dataset.database_exists && (dataset.total_rows || 0) > 0),
      filename: dataset?.filename || '',
      ready,
      backendUp,
      refreshing,
      version,
      theme,
      setTheme,
      toggleTheme,
      refresh,
      uploadFile,
      loadSample,
      removeData,
      downloadTemplate,
    }),
    [
      dataset,
      ready,
      backendUp,
      refreshing,
      version,
      theme,
      setTheme,
      toggleTheme,
      refresh,
      uploadFile,
      loadSample,
      removeData,
      downloadTemplate,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
