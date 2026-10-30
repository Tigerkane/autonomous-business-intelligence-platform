import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  LineChart,
  Bot,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
  User,
  ShieldCheck,
  Menu,
  X,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { NavTab } from './Sidebar';
import { BrandLogo } from '../common/BrandLogo';

interface HeaderNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentTab, onSelectTab }) => {
  const { dataset, loaded, theme, toggleTheme, loadSample, refreshing } = useData();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as NavTab, label: 'Guide & Home', icon: Home },
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as NavTab, label: 'Data Hub', icon: UploadCloud },
    { id: 'sales-analysis' as NavTab, label: 'Sales Insights', icon: TrendingUp },
    { id: 'forecast-anomalies' as NavTab, label: 'ML Studio', icon: LineChart },
    { id: 'ask-data' as NavTab, label: 'Ask AI', icon: Bot },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#070d1e]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => onSelectTab('home')}
          >
            <BrandLogo size="md" variant="full" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Dataset Telemetry Pill */}
            {loaded ? (
              <button
                onClick={() => onSelectTab('upload')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                title="Active dataset records"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="truncate max-w-[110px]">{dataset?.filename || 'Dataset'}</span>
                <span className="text-[10px] opacity-80">
                  ({dataset?.total_rows?.toLocaleString()})
                </span>
              </button>
            ) : (
              <button
                onClick={() => onSelectTab('upload')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
            )}

            {/* User Auth Info / Button */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <div
                  className="hidden md:flex flex-col text-right cursor-pointer"
                  onClick={() => onSelectTab('settings')}
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                    {user.role}
                  </span>
                </div>
                <div
                  className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs cursor-pointer"
                  onClick={() => onSelectTab('settings')}
                  title={`Signed in as ${user.name}`}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  title="Sign Out / Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Navigation Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-200/80 dark:border-white/10 space-y-1 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
