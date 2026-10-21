import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  Database,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../../contexts/DataContext';

interface EmptyStateProps {
  onGoToUpload?: () => void;
  title?: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Dataset Loaded in Session',
  subtitle = 'Upload your retail sales CSV or generate a demo dataset to start autonomous business intelligence.',
}) => {
  const { uploadFile, loadSample, downloadTemplate, refreshing } = useData();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV (.csv) files are supported.');
      return;
    }
    setError(null);
    setUploading(true);

    try {
      await uploadFile(file);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV file.');
    } finally {
      setUploading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setUploading(true);
    try {
      await loadSample();
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      setError(err.message || 'Could not load demo data.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-6">
      {/* Hero Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-500/5 shadow-inner">
          <Database className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {subtitle}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed transition-all bg-white dark:bg-[#0d1527] shadow-sm ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/10'
            : 'border-slate-300 dark:border-white/10 hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {uploading ? 'Processing and standardizing data...' : 'Drag & drop your sales CSV here'}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
          Or click to browse from your device. Ingested records undergo automated duplicate elimination, date formatting, and business rule sanitation.
        </p>

        <button
          type="button"
          disabled={uploading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Browse CSV File</span>
        </button>
      </div>

      {/* Quick Action Cards: Demo Dataset or Download Template */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Instant Test Dataset</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Don't have a CSV ready? Generate 1,000 realistic retail transactions (Electronics, Clothing, Beauty) with seasonal patterns and anomalies.
            </p>
          </div>
          <button
            onClick={handleDemo}
            disabled={uploading || refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Demo Dataset (1,000 Rows)</span>
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white mb-1.5">
              <Download className="w-4 h-4 text-indigo-500" />
              <span>CSV Header Template</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Download the standard CSV template with pre-filled sample rows to format your data in Excel or Google Sheets.
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Supported Columns Guide */}
      <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400">
        <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:text-slate-400 block mb-2">
          Required Column Schema
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            'Transaction ID',
            'Date (YYYY-MM-DD)',
            'Customer ID',
            'Gender',
            'Age',
            'Product Category',
            'Quantity',
            'Price per Unit',
            'Total Amount',
          ].map((col) => (
            <span
              key={col}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#131d38] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-800 dark:text-slate-200"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
