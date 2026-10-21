import React, { useState } from 'react';
import {
  FileText,
  Download,
  CheckCircle,
  BarChart3,
  LineChart,
  Bot,
  Eye,
  X,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../contexts/DataContext';
import { EmptyState } from '../components/common/EmptyState';
import { NavTab } from '../components/layout/Sidebar';

interface ReportsViewProps {
  onNavigate: (tab: NavTab) => void;
}

const REPORT_TYPES = [
  {
    id: 'executive',
    title: 'Executive Summary Report',
    description:
      'High-level KPIs, top insights, and business recommendations. Tailored for executive leadership and stakeholder reviews.',
    icon: BarChart3,
    color: 'from-indigo-600 to-indigo-700',
    badge: 'Most Popular',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    id: 'sales',
    title: 'Sales Performance Report',
    description:
      'Deep dive into revenue trends, category market shares, and monthly performance trajectory.',
    icon: FileText,
    color: 'from-emerald-600 to-emerald-700',
    badge: 'Comprehensive',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'forecast',
    title: 'Forecast & Anomaly Report',
    description:
      '6-month predictive sales horizon, walk-forward MAPE scoring, and robust modified z-score outliers.',
    icon: LineChart,
    color: 'from-amber-600 to-amber-700',
    badge: 'ML-Powered',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'ai',
    title: 'AI Insights & Strategy Report',
    description:
      'Strategic findings, hidden risks, and actionable recommendations synthesized by autonomous AI analysis.',
    icon: Bot,
    color: 'from-purple-600 to-purple-700',
    badge: 'AI Generated',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
];

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const { loaded, filename, dataset } = useData();
  const [generating, setGenerating] = useState<Record<string, number>>({});
  const [downloaded, setDownloaded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  if (!loaded) {
    return <EmptyState onGoToUpload={() => onNavigate('upload')} />;
  }

  const handleGenerate = async (id: string, title: string, previewOnly = false) => {
    setError(null);
    setGenerating((prev) => ({ ...prev, [id]: 15 }));

    const progressTimer = setInterval(() => {
      setGenerating((prev) => ({
        ...prev,
        [id]: Math.min((prev[id] || 0) + (id === 'ai' ? 8 : 25), 90),
      }));
    }, 300);

    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: id }),
      });

      clearInterval(progressTimer);
      setGenerating((prev) => ({ ...prev, [id]: 100 }));

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || 'Report generation failed.');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (previewOnly) {
        setPreviewBlobUrl(url);
        setPreviewTitle(title);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `ABIP_${id}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 10000);

        setDownloaded((prev) => ({ ...prev, [id]: true }));
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err: any) {
      clearInterval(progressTimer);
      setError(err.message || 'Could not generate report.');
    } finally {
      setTimeout(() => {
        setGenerating((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Executive PDF Document Studio
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Generate publication-ready PDF reports from active dataset telemetry: {filename || 'retail_sales.csv'} ({dataset?.total_rows?.toLocaleString()} transactions).
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          const isGenerating = report.id in generating;
          const progress = generating[report.id] || 0;
          const isDone = downloaded[report.id];

          return (
            <div
              key={report.id}
              className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-indigo-500/40 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${report.color} flex items-center justify-center text-white shadow-xs`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${report.badgeColor}`}
                  >
                    {report.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {report.description}
                </p>
              </div>

              <div>
                {/* Generation Progress Bar */}
                {isGenerating && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      <span>Synthesizing vector PDF...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={() => handleGenerate(report.id, report.title, false)}
                    disabled={isGenerating}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {isDone ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-300" />
                        <span>Downloaded!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleGenerate(report.id, report.title, true)}
                    disabled={isGenerating}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-colors"
                    title="Preview in browser"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {previewTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewBlobUrl}
                  download="ABIP_report.pdf"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save PDF
                </a>
                <button
                  onClick={() => setPreviewBlobUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950">
              <iframe
                src={previewBlobUrl}
                className="w-full h-full border-0"
                title="Report PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
