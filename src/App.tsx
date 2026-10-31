import React, { Suspense, useState, lazy } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { HomepageView } from './views/HomepageView';

/* ------------------------------------------------------------------ */
/* Lazy-loaded workspace views for minimal bundle size                */
/* ------------------------------------------------------------------ */
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const SalesAnalysisView = lazy(() => import('./views/SalesAnalysisView').then(m => ({ default: m.SalesAnalysisView })));
const ForecastAnomaliesView = lazy(() => import('./views/ForecastAnomaliesView').then(m => ({ default: m.ForecastAnomaliesView })));
const ReportsView = lazy(() => import('./views/ReportsView').then(m => ({ default: m.ReportsView })));
const UploadDatasetView = lazy(() => import('./views/UploadDatasetView').then(m => ({ default: m.UploadDatasetView })));
const AskYourDataView = lazy(() => import('./views/AskYourDataView').then(m => ({ default: m.AskYourDataView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const AuthView = lazy(() => import('./views/AuthView').then(m => ({ default: m.AuthView })));
const ErrorView = lazy(() => import('./views/ErrorView').then(m => ({ default: m.ErrorView })));
const AuthModal = lazy(() => import('./components/auth/AuthModal').then(m => ({ default: m.AuthModal })));

/** Shimmering skeleton fallback shown while lazy chunks stream in */
const ViewFallback = () => (
  <div className="space-y-6 animate-pulse select-none">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <div className="w-56 h-7 bg-slate-800/80 rounded-lg mb-2" />
        <div className="w-80 max-w-full h-4 bg-slate-850 rounded" />
      </div>
      <div className="w-32 h-9 bg-slate-800/60 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-[#0e172e] border border-slate-800/80 p-5">
          <div className="w-20 h-3 bg-slate-700/60 rounded mb-3" />
          <div className="w-28 h-6 bg-slate-700/80 rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-72 rounded-2xl bg-[#0e172e] border border-slate-800/80 p-6" />
      <div className="h-72 rounded-2xl bg-[#0e172e] border border-slate-800/80 p-6" />
    </div>
  </div>
);

// Workspace pages that require a signed-in user
const PROTECTED_TABS: NavTab[] = [
  'dashboard',
  'upload',
  'sales-analysis',
  'forecast-anomalies',
  'ask-data',
  'reports',
  'settings',
];

function AppContent() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('abip_sidebar_hidden') === 'true';
      }
      return false;
    } catch {
      return false;
    }
  });
  const { loaded, refresh, backendUp } = useData();
  const { isAuthenticated, openAuthModal } = useAuth();

  const toggleSidebar = () => {
    setSidebarHidden((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('abip_sidebar_hidden', String(next));
        }
      } catch {}
      return next;
    });
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B or Cmd+B to toggle sidebar visibility
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };

    const handleExternalToggle = () => {
      try {
        setSidebarHidden(localStorage.getItem('abip_sidebar_hidden') === 'true');
      } catch {}
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('abip:sidebar-toggle', handleExternalToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('abip:sidebar-toggle', handleExternalToggle);
    };
  }, []);

  // Navigate to a tab; protected tabs open the sign-in modal for signed-out users
  const goToTab = (tab: NavTab) => {
    if (tab === 'signin' || tab === 'signup') {
      openAuthModal(tab);
      return;
    }
    if (PROTECTED_TABS.includes(tab) && !isAuthenticated) {
      setPendingTab(tab);
      openAuthModal('signin');
      return;
    }
    setCurrentTab(tab);
  };

  // After sign-in: go to the page the user originally clicked, else upload/dashboard
  const handleAuthSuccess = () => {
    if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    } else {
      setCurrentTab(loaded ? 'dashboard' : 'upload');
    }
  };

  // Safety net: a signed-out user can never see a workspace page
  // (covers logout while inside the workspace). Renders the homepage instead.
  const blocked = PROTECTED_TABS.includes(currentTab) && !isAuthenticated;

  // If on homepage, render full-bleed marketing and interactive demo homepage
  if (currentTab === 'home' || blocked) {
    return (
      <>
        <HomepageView onLaunchPlatform={(tab = 'upload') => goToTab(tab)} />
        <Suspense fallback={null}>
          <AuthModal onAuthSuccess={handleAuthSuccess} />
        </Suspense>
      </>
    );
  }

  // Public: Dedicated Split-Layout Sign In & Sign Up Screen
  if (currentTab === 'signin' || currentTab === 'signup') {
    return (
      <Suspense fallback={<ViewFallback />}>
        <AuthView
          initialMode={currentTab}
          onNavigateHome={() => setCurrentTab('home')}
          onAuthSuccess={handleAuthSuccess}
        />
      </Suspense>
    );
  }

  // Public: 404 Discontinuity Screen
  if (currentTab === '404') {
    return (
      <Suspense fallback={<ViewFallback />}>
        <ErrorView
          type="404"
          onNavigateHome={() => setCurrentTab('home')}
        />
      </Suspense>
    );
  }

  // Public: Server Unreachable / Offline Screen
  if (currentTab === 'offline') {
    return (
      <Suspense fallback={<ViewFallback />}>
        <ErrorView
          type="offline"
          onNavigateHome={() => setCurrentTab('home')}
          onRetry={async () => {
            await refresh();
            if (backendUp) setCurrentTab('dashboard');
          }}
        />
      </Suspense>
    );
  }

  // Otherwise, render full Enterprise AI Platform workspace layout
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors font-sans">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        sidebarHidden={sidebarHidden}
        onToggleSidebar={toggleSidebar}
      />

      <div
        className={`${
          sidebarHidden ? 'md:pl-0' : 'md:pl-64'
        } transition-[padding] duration-300 ease-in-out flex flex-col min-h-screen`}
      >
        <Navbar
          currentTab={currentTab}
          onOpenMobile={() => setMobileOpen(true)}
          sidebarHidden={sidebarHidden}
          onToggleSidebar={toggleSidebar}
          onGoToUpload={() => setCurrentTab('upload')}
          onGoToHome={() => setCurrentTab('home')}
          onGoToSettings={() => setCurrentTab('settings')}
        />

        <main className="flex-1 p-4 md:p-8" role="main" aria-label="Platform workspace">
          <Suspense fallback={<ViewFallback />}>
            {currentTab === 'dashboard' && (
              <DashboardView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'sales-analysis' && (
              <SalesAnalysisView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'forecast-anomalies' && (
              <ForecastAnomaliesView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'reports' && (
              <ReportsView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'upload' && (
              <UploadDatasetView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'ask-data' && (
              <AskYourDataView onNavigate={(tab) => setCurrentTab(tab)} />
            )}
            {currentTab === 'settings' && <SettingsView />}
          </Suspense>
        </main>
      </div>

      <Suspense fallback={null}>
        <AuthModal onAuthSuccess={handleAuthSuccess} />
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
