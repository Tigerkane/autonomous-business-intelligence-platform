import React, { Suspense, useState, lazy } from 'react';
import { DataProvider, useData } from './contexts/DataContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { AuthView } from './views/AuthView';
import { ErrorView } from './views/ErrorView';
import { UploadDatasetView } from './views/UploadDatasetView';
import { AskYourDataView } from './views/AskYourDataView';
import { SettingsView } from './views/SettingsView';

/* ------------------------------------------------------------------ */
/* Lazy-loaded views (Chart.js, pdf-lib, canvas-confetti heavy)        */
/* These get code-split into separate chunks to reduce initial bundle  */
/* ------------------------------------------------------------------ */
const HomepageView = lazy(() => import('./views/HomepageView').then(m => ({ default: m.HomepageView })));
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const SalesAnalysisView = lazy(() => import('./views/SalesAnalysisView').then(m => ({ default: m.SalesAnalysisView })));
const ForecastAnomaliesView = lazy(() => import('./views/ForecastAnomaliesView').then(m => ({ default: m.ForecastAnomaliesView })));
const ReportsView = lazy(() => import('./views/ReportsView').then(m => ({ default: m.ReportsView })));

/** Minimal loading spinner shown while lazy chunks stream in */
const ViewFallback = () => (
  <div className="flex items-center justify-center h-64 gap-3 animate-pulse">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-sm text-slate-400 font-medium">Loading view…</span>
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
      return localStorage.getItem('abip_sidebar_hidden') === 'true';
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
        localStorage.setItem('abip_sidebar_hidden', String(next));
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
        <Suspense fallback={<ViewFallback />}>
          <HomepageView onLaunchPlatform={(tab = 'upload') => goToTab(tab)} />
        </Suspense>
        <AuthModal onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  // Public: Dedicated Split-Layout Sign In & Sign Up Screen
  if (currentTab === 'signin' || currentTab === 'signup') {
    return (
      <AuthView
        initialMode={currentTab}
        onNavigateHome={() => setCurrentTab('home')}
        onAuthSuccess={handleAuthSuccess}
      />
    );
  }

  // Public: 404 Discontinuity Screen
  if (currentTab === '404') {
    return (
      <ErrorView
        type="404"
        onNavigateHome={() => setCurrentTab('home')}
      />
    );
  }

  // Public: Server Unreachable / Offline Screen
  if (currentTab === 'offline') {
    return (
      <ErrorView
        type="offline"
        onNavigateHome={() => setCurrentTab('home')}
        onRetry={async () => {
          await refresh();
          if (backendUp) setCurrentTab('dashboard');
        }}
      />
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
          </Suspense>
          {currentTab === 'upload' && (
            <UploadDatasetView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'ask-data' && (
            <AskYourDataView onNavigate={(tab) => setCurrentTab(tab)} />
          )}
          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      <AuthModal onAuthSuccess={handleAuthSuccess} />
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
