'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3 text-white">
      <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-400">
        Initializing Autonomous Business Intelligence Platform...
      </p>
    </div>
  ),
});

export default function HomePage() {
  return <App />;
}
