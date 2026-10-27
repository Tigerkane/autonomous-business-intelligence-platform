import React from 'react';
import {
  Home,
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  LineChart,
  Bot,
  FileText,
  Settings,
  X,
  LogOut,
  User,
  PanelLeftClose,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { BrandLogo } from '../common/BrandLogo';

export type NavTab =
  | 'home'
  | 'signin'
  | 'signup'
  | '404'
  | 'offline'
  | 'dashboard'
  | 'upload'
  | 'sales-analysis'
  | 'forecast-anomalies'
  | 'ask-data'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  sidebarHidden?: boolean;
  onToggleSidebar?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  sidebarHidden = false,
  onToggleSidebar,
}) => {
  const { dataset, loaded, backendUp } = useData();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems = [
    {
      id: 'home' as NavTab,
      label: 'Platform Overview',
      icon: Home,
      meta: null,
    },
    {
      id: 'dashboard' as NavTab,
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      meta: null,
    },
    {
      id: 'upload' as NavTab,
      label: 'Upload Dataset',
      icon: UploadCloud,
      meta: loaded ? `${dataset?.total_rows} rows` : null,
    },
    {
      id: 'sales-analysis' as NavTab,
      label: 'Sales Analysis',
      icon: TrendingUp,
      meta: null,
    },
    {
      id: 'forecast-anomalies' as NavTab,
      label: 'Forecast & Anomalies',
      icon: LineChart,
      meta: 'ML',
    },
    {
      id: 'ask-data' as NavTab,
      label: 'Ask Your Data',
      icon: Bot,
      meta: 'AI',
    },
    {
      id: 'reports' as NavTab,
      label: 'PDF Reports',
      icon: FileText,
      meta: null,
    },
    {
      id: 'settings' as NavTab,
      label: 'System Settings',
      icon: Settings,
      meta: null,
    },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-[#060b19] border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            onSelectTab('home');
            onCloseMobile();
          }}
          className="flex items-center text-left group"
        >
          <BrandLogo size="md" variant="full" />
        </button>
        <div className="flex items-center gap-1">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Hide sidebar (Ctrl+B)"
              aria-label="Hide sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Dataset / Server status strip - unboxed typography */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${backendUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>Server {backendUp ? 'Connected' : 'Offline'}</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
          {loaded ? 'Session Active' : 'No Data'}
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Platform navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.meta && (
                <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                  {item.meta}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                onSelectTab('home');
                onCloseMobile();
              }}
              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in to manage persistent sessions and report exports.
            </p>
            <button
              onClick={() => {
                openAuthModal('signin');
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent / Collapsible Sidebar */}
      <aside
        className={`hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col z-30 transition-transform duration-300 ease-in-out ${
          sidebarHidden ? '-translate-x-full' : 'translate-x-0'
        }`}
        aria-hidden={sidebarHidden}
      >
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
