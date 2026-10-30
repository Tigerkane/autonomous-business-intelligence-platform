import React from 'react';
import {
  Menu,
  RefreshCw,
  FileSpreadsheet,
  Home,
  LogOut,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { NavTab } from './Sidebar';
import { GithubIcon } from '../common/GithubIcon';

interface NavbarProps {
  currentTab: NavTab;
  onOpenMobile: () => void;
  onGoToUpload: () => void;
  onGoToHome: () => void;
  onGoToSettings?: () => void;
  sidebarHidden?: boolean;
  onToggleSidebar?: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  home: {
    title: 'Platform Overview',
    subtitle: 'Architecture and interactive project workflow',
  },
  dashboard: {
    title: 'Executive Dashboard',
    subtitle: 'Autonomous KPIs, sales trend, and customer demographics',
  },
  upload: {
    title: 'Dataset Management',
    subtitle: 'Ingest retail sales CSV, validate columns, and review session cache',
  },
  'sales-analysis': {
    title: 'Sales Performance Analysis',
    subtitle: 'Revenue patterns, category distribution, and weekday breakdown',
  },
  'forecast-anomalies': {
    title: 'Forecast & Anomaly Detection',
    subtitle: 'Walk-forward ML predictive models and modified z-score outliers',
  },
  'ask-data': {
    title: 'Ask Your Data',
    subtitle: 'Natural language analytical queries grounded by dataset telemetry',
  },
  reports: {
    title: 'Executive PDF Reports',
    subtitle: 'Publication-ready reports compiled directly to PDF vector format',
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Backend runtime, statistical modules, and model configuration',
  },
  signin: {
    title: 'Sign In',
    subtitle: 'Authenticate to access your analytics workspace',
  },
  signup: {
    title: 'Create Account',
    subtitle: 'Register your account to manage retail datasets',
  },
  '404': {
    title: 'Page Not Found',
    subtitle: 'The requested resource could not be found',
  },
  offline: {
    title: 'Server Unreachable',
    subtitle: 'The application is operating in offline-resilient mode',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onOpenMobile,
  onGoToUpload,
  onGoToHome,
  onGoToSettings,
  sidebarHidden = false,
  onToggleSidebar,
}) => {
  const { dataset, loaded, refreshing, refresh } = useData();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const info = TAB_TITLES[currentTab] || { title: 'Dashboard', subtitle: '' };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  return (
    <header className="sticky top-0 z-20 h-16 px-4 md:px-8 flex items-center backdrop-blur-md bg-white/90 dark:bg-[#060b19]/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Left: Sidebar Toggle & Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile hamburger menu */}
          <button
            onClick={onOpenMobile}
            className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Toggle: Hide / Show */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                sidebarHidden
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={sidebarHidden ? "Show sidebar (Ctrl+B)" : "Hide sidebar (Ctrl+B)"}
              aria-label={sidebarHidden ? "Show sidebar" : "Hide sidebar"}
              aria-expanded={!sidebarHidden}
            >
              {sidebarHidden ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-indigo-700 dark:text-indigo-300">Show Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  <span className="hidden xl:inline text-[11px] text-slate-500 dark:text-slate-400">Hide Sidebar</span>
                </>
              )}
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <button
                onClick={onGoToHome}
                className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>
              <span aria-hidden="true">/</span>
              <span className="font-medium capitalize text-slate-700 dark:text-slate-300 truncate">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {info.title}
            </h1>
          </div>
        </div>

        {/* Right: Actions, Dataset State, User Profile & Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Dataset status */}
          {loaded ? (
            <button
              onClick={onGoToUpload}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
              title="Click to view dataset records"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="truncate max-w-[120px] font-medium">{dataset?.filename || 'Dataset'}</span>
              <span className="text-slate-400 dark:text-slate-500 font-mono">
                {dataset?.total_rows?.toLocaleString()} rows
              </span>
            </button>
          ) : (
            <button
              onClick={onGoToUpload}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>Upload CSV Data</span>
            </button>
          )}

          {/* Refresh Data button */}
          <button
            onClick={() => refresh()}
            disabled={refreshing}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Refresh session data from backend"
            aria-label="Refresh session data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/Tigerkane/autonomous-business-intelligence-platform"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
            title="View Repository on GitHub"
            aria-label="View Repository on GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>

          {/* User Profile / Auth State in Navbar */}
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-80 transition-opacity focus:outline-none"
                aria-expanded={accountMenuOpen}
                aria-label="User Account Menu"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs ring-1 ring-indigo-400/30">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Account Dropdown Menu */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/10 shadow-xl py-3 z-50 animate-fade-in text-xs">
                  {/* User Header */}
                  <div className="px-4 pb-3 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>


                  {/* Navigation Links */}
                  <div className="px-2 pt-2">
                    {onGoToSettings && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          onGoToSettings();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Account & Settings</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        logout();
                        onGoToHome();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
