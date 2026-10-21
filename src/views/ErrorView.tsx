import React from 'react';
import { ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { BrokenChart404Illustration } from '../components/illustrations/BrokenChart404Illustration';
import { UnpluggedCloudIllustration } from '../components/illustrations/UnpluggedCloudIllustration';
import { BrandLogo } from '../components/common/BrandLogo';

interface ErrorViewProps {
  type: '404' | 'offline';
  onNavigateHome: () => void;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  type,
  onNavigateHome,
  onRetry,
}) => {
  const is404 = type === '404';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors">
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-sm">
        <BrandLogo size="sm" variant="full" />
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            {is404 ? (
              <BrokenChart404Illustration className="w-full max-w-[280px]" />
            ) : (
              <UnpluggedCloudIllustration className="w-full max-w-[280px]" />
            )}
          </div>

          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {is404 ? 'Resource Not Found' : 'Connection Disrupted'}
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {is404 ? '404 · Analytical Chart Discontinuity' : 'Server Currently Unreachable'}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              {is404
                ? 'The requested analytical workspace, route, or dataset view does not exist or has been removed.'
                : 'Unable to reach the Express analytical backend engine. Verify local service health on port 3000.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Platform</span>
            </button>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-slate-800">
        Autonomous Business Intelligence Platform · Health Diagnostics
      </footer>
    </div>
  );
};
