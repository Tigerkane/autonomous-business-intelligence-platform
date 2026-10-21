import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bot,
  Database,
  Palette,
  Moon,
  Sun,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Code,
  Users,
  User,
  ShieldCheck,
  KeyRound,
  Lock,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  Layout,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { LLMProvider } from '../types';
import { RemoveDataModal } from '../components/common/RemoveDataModal';

export const SettingsView: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const {
    dataset,
    loaded,
    filename,
    backendUp,
    refreshing,
    refresh,
    theme,
    setTheme,
    toggleTheme,
  } = useData();
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<string>('deterministic');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('abip_sidebar_hidden') === 'true';
    } catch {
      return false;
    }
  });

  const handleSetSidebarHidden = (hidden: boolean) => {
    setSidebarHidden(hidden);
    try {
      localStorage.setItem('abip_sidebar_hidden', String(hidden));
      window.dispatchEvent(new Event('abip:sidebar-toggle'));
    } catch {}
  };

  useEffect(() => {
    fetch('/api/llm/providers')
      .then((res) => res.json())
      .then((d) => {
        if (d.providers) setProviders(d.providers);
        if (d.default) setDefaultProvider(d.default);
      })
      .catch((err) => console.warn(err));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          System & Model Diagnostics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Telemetry of analytical engines, language model integrations, interface theme, and runtime data configuration.
        </p>
      </div>

      {/* Account & Session Management Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Account & Multi-Tenant Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                User credentials, cryptographic session token, and isolated storage boundaries
              </p>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-100 dark:border-white/5 pt-4">
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-xs ring-2 ring-indigo-500/30">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {user.role} · {user.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400 gap-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Scoped ID: {user.id}</span>
                  </div>
                  <span className="text-[11px]">7-Day Session Active · Isolated /data/users/{user.id}/</span>
                </div>
              </div>

              {/* Session Security */}
              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Authenticated session protected by salted hashed tokens and CAPTCHA verification.
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  To sign out, use the Log Out option in the profile menu at the top right.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  No Active User Session
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sign in or create an account with CAPTCHA verification to enable isolated per-user dataset workspaces.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs shadow-xs transition-colors"
                >
                  <span>Register</span>
                </button>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs shadow-xs transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Interface Color Theme
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant mode switching with zero-flicker CSS variable persistence
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Active Mode: {theme === 'dark' ? 'Obsidian Midnight (Dark)' : 'Daylight Crisp (Light)'}
            </span>
            <span className="text-xs text-slate-400">
              Click either card below to switch themes immediately.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme('light')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                theme === 'light'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-700 shadow-xs ring-2 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Workspace Layout & Sidebar Display */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Workspace Layout & Sidebar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize workspace canvas width, toggle sidebar visibility, or use keyboard shortcuts
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-slate-900 dark:text-white block">
              Sidebar Mode: {sidebarHidden ? 'Hidden (Expanded Canvas)' : 'Visible (Standard Dock)'}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">Ctrl+B</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">Cmd+B</kbd> anywhere in the workspace to instantly toggle sidebar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetSidebarHidden(false)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                !sidebarHidden
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <PanelLeftOpen className="w-4 h-4 text-indigo-500" />
              <span>Visible (Docked)</span>
            </button>

            <button
              onClick={() => handleSetSidebarHidden(true)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                sidebarHidden
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <PanelLeftClose className="w-4 h-4 text-indigo-400" />
              <span>Hidden (Wide Canvas)</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Models Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Language Model Engines
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Providers powering the Ask AI Analyst interface and autonomous strategic reports
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 pt-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {p.label}
                  </span>
                  {p.id === defaultProvider && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-bold text-[10px]">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{p.note}</p>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  p.configured
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}
              >
                {p.configured ? 'Configured & Online' : 'Offline Fallback'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Backend & Data Layer */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data & Runtime Environment
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Connection health, session storage, and active dataset telemetry
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-white/5 border-t border-slate-100 dark:border-white/5 pt-2">
          <div className="py-3.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Backend Engine</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Express + TypeScript analytical service running on port 3000
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                backendUp
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {backendUp ? 'Online & Healthy' : 'Offline'}
            </span>
          </div>

          <div className="py-3.5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Active Dataset</p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {loaded
                  ? `${filename || 'Dataset'} · ${dataset?.total_rows?.toLocaleString()} rows stored`
                  : 'No dataset loaded in session (Clean starting folder)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                  loaded
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}
              >
                {loaded ? 'Loaded' : 'Empty'}
              </span>
              <button
                onClick={() => refresh()}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                title="Refresh database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {loaded && (
                <button
                  onClick={() => setShowRemoveModal(true)}
                  className="px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-semibold text-[10px] hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>


      <RemoveDataModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
      />
    </div>
  );
};
