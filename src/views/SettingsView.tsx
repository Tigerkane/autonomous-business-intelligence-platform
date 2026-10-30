import React, { useEffect, useState } from 'react';
import {
  Settings,
  Bot,
  Database,
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
  Zap,
  Globe,
  Shield,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { LLMProvider } from '../types';
import { RemoveDataModal } from '../components/common/RemoveDataModal';

/* Glassmorphism card wrapper */
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; glowColor?: string }> = ({
  children,
  className = '',
  glowColor = 'indigo',
}) => {
  const glowMap: Record<string, string> = {
    indigo: 'hover:shadow-indigo-500/10',
    purple: 'hover:shadow-purple-500/10',
    emerald: 'hover:shadow-emerald-500/10',
    amber: 'hover:shadow-amber-500/10',
    rose: 'hover:shadow-rose-500/10',
  };
  return (
    <div
      className={`relative p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10 ${glowMap[glowColor] || ''} hover:border-white/[0.14] hover:shadow-xl transition-all duration-500 ${className}`}
    >
      {children}
    </div>
  );
};

/* Gradient icon container */
const GradientIcon: React.FC<{
  icon: React.ElementType;
  gradient: string;
}> = ({ icon: Icon, gradient }) => (
  <div
    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}
  >
    <Icon className="w-5 h-5 text-white" />
  </div>
);

export const SettingsView: React.FC = () => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const {
    dataset,
    loaded,
    filename,
    backendUp,
    refreshing,
    refresh,
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
      {/* Header with gradient accent */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black text-white tracking-tight relative">
          System & Model Diagnostics
        </h2>
        <p className="text-sm text-slate-400 mt-1 relative">
          Telemetry of analytical engines, language model integrations, and runtime data configuration.
        </p>
      </div>

      {/* Account & Session Management Card */}
      <GlassCard glowColor="indigo">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3.5">
            <GradientIcon icon={ShieldCheck} gradient="from-indigo-500 to-violet-600" />
            <div>
              <h3 className="text-base font-bold text-white">
                Account & Multi-Tenant Session
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                User credentials, cryptographic session token, and isolated storage boundaries
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          {isAuthenticated && user ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-base shrink-0 overflow-hidden shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/20">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {user.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-[11px] text-slate-500">
                      {user.role} · {user.company}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end text-xs text-slate-400 gap-1">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Scoped ID: {user.id}</span>
                  </div>
                  <span className="text-[11px] text-slate-500">7-Day Session Active · Isolated /data/users/{user.id}/</span>
                </div>
              </div>

              {/* Session Security */}
              <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                  Authenticated session protected by salted hashed tokens and CAPTCHA verification.
                </span>
                <span className="text-[11px] text-slate-500">
                  To sign out, use the Log Out option in the profile menu at the top right.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <div>
                <p className="text-sm font-bold text-white">
                  No Active User Session
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in or create an account with CAPTCHA verification to enable isolated per-user dataset workspaces.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('signup')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] font-semibold text-xs shadow-xs transition-all"
                >
                  <span>Register</span>
                </button>
                <button
                  onClick={() => openAuthModal('signin')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-400 hover:to-violet-500 font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Workspace Layout & Sidebar Display */}
      <GlassCard glowColor="indigo">
        <div className="flex items-center gap-3.5 mb-5">
          <GradientIcon icon={Layout} gradient="from-sky-500 to-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-white">
              Workspace Layout & Sidebar
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize workspace canvas width, toggle sidebar visibility, or use keyboard shortcuts
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-white block">
              Sidebar Mode: {sidebarHidden ? 'Hidden (Expanded Canvas)' : 'Visible (Standard Dock)'}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[11px] text-slate-300">Ctrl+B</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[11px] text-slate-300">Cmd+B</kbd> anywhere in the workspace to instantly toggle sidebar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSetSidebarHidden(false)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                !sidebarHidden
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span>Visible (Docked)</span>
            </button>

            <button
              onClick={() => handleSetSidebarHidden(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                sidebarHidden
                  ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20'
                  : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:border-white/[0.15] hover:text-white'
              }`}
            >
              <PanelLeftClose className="w-4 h-4" />
              <span>Hidden (Wide Canvas)</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* AI Models Card */}
      <GlassCard glowColor="purple">
        <div className="flex items-center gap-3.5 mb-5">
          <GradientIcon icon={Bot} gradient="from-purple-500 to-fuchsia-600" />
          <div>
            <h3 className="text-base font-bold text-white">
              Language Model Engines
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Providers powering the Ask AI Analyst interface and autonomous strategic reports
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] pt-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {p.label}
                  </span>
                  {p.id === defaultProvider && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold text-[10px] border border-purple-500/20">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">{p.note}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full font-bold text-[10px] ${
                  p.configured
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                }`}
              >
                {p.configured ? '● Configured & Online' : '○ Offline Fallback'}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Backend & Data Layer */}
      <GlassCard glowColor="emerald">
        <div className="flex items-center gap-3.5 mb-5">
          <GradientIcon icon={Database} gradient="from-emerald-500 to-teal-600" />
          <div>
            <h3 className="text-base font-bold text-white">
              Data & Runtime Environment
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Connection health, session storage, and active dataset telemetry
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06] border-t border-white/[0.06] pt-2">
          <div className="py-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Backend Engine
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Express + TypeScript analytical service running on port 3000
              </p>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full font-bold text-[10px] flex items-center gap-1.5 ${
                backendUp
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendUp ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {backendUp ? 'Online & Healthy' : 'Offline'}
            </span>
          </div>

          <div className="py-4 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Active Dataset
              </p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                {loaded
                  ? `${filename || 'Dataset'} · ${dataset?.total_rows?.toLocaleString()} rows stored`
                  : 'No dataset loaded in session (Clean starting folder)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-full font-bold text-[10px] ${
                  loaded
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                }`}
              >
                {loaded ? '● Loaded' : '○ Empty'}
              </span>
              <button
                onClick={() => refresh()}
                disabled={refreshing}
                className="p-2 rounded-xl border border-white/[0.08] hover:bg-white/[0.06] text-slate-400 hover:text-white transition-all"
                title="Refresh database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              {loaded && (
                <button
                  onClick={() => setShowRemoveModal(true)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-400 font-semibold text-[10px] hover:bg-rose-500/10 transition-all"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>


      <RemoveDataModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
      />
    </div>
  );
};
