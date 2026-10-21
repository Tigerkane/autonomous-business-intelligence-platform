import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Table as TableIcon,
  Sparkles,
  Search,
  ArrowRight,
  Download,
  FileText,
  Calendar,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useData } from '../contexts/DataContext';
import { RemoveDataModal } from '../components/common/RemoveDataModal';
import { NavTab } from '../components/layout/Sidebar';
import { DataQuality, ValidationIssue } from '../types';

const inr = (v?: number) => '₹' + Math.round(v || 0).toLocaleString('en-IN');

const fmtDate = (iso?: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '-';

const issueText = (i: ValidationIssue) =>
  `${i.count.toLocaleString('en-IN')} ${i.count === 1 ? 'row' : 'rows'} ${i.label}`;

interface UploadDatasetViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const UploadDatasetView: React.FC<UploadDatasetViewProps> = ({ onNavigate }) => {
  const {
    dataset,
    loaded,
    filename,
    version,
    uploadFile,
    loadSample,
    downloadTemplate,
    refreshing,
    refresh,
  } = useData();

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [previewLimit, setPreviewLimit] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [cleaningReport, setCleaningReport] = useState<any | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loaded) {
      setPreviewRows([]);
      setPreviewColumns([]);
      return;
    }

    fetch(`/api/data/preview?limit=${previewLimit}`)
      .then((res) => {
        if (!res.ok) return { data: [] };
        return res.json();
      })
      .then((body) => {
        const rows = body.data || [];
        setPreviewRows(rows);
        if (rows.length > 0) {
          setPreviewColumns(Object.keys(rows[0]));
        }
      })
      .catch((err) => console.warn('Preview error:', err));
  }, [loaded, version, previewLimit]);

  const handleFileDrop = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Only CSV files (.csv) are supported.');
      return;
    }
    setUploadError(null);
    setUploading(true);

    try {
      const result = await uploadFile(file);
      setCleaningReport(result);
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    } catch (err: any) {
      setUploadError(err.message || 'CSV upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDemoClick = async () => {
    setUploadError(null);
    setUploading(true);
    try {
      const result = await loadSample();
      setCleaningReport(result);
      confetti({ particleCount: 75, spread: 50, origin: { y: 0.7 } });
    } catch (err: any) {
      setUploadError(err.message || 'Could not load demo data.');
    } finally {
      setUploading(false);
    }
  };

  const quality: DataQuality | undefined = dataset?.quality;

  const filteredRows = previewRows.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => String(val).toLowerCase().includes(term));
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Data Hub & CSV Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {loaded
              ? 'Active session database powering all real-time forecasts, outliers, and reports.'
              : 'The platform folder starts clean with no pre-loaded dataset. Upload your sales CSV or generate demo data.'}
          </p>
        </div>

        {loaded && (
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs font-semibold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Upload failed. Nothing was changed.</p>
            <p className="whitespace-pre-line font-medium leading-relaxed">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Validation result after ingestion */}
      {cleaningReport &&
        (() => {
          const rowsBefore: number = cleaningReport.rows_before ?? 0;
          const rowsAfter: number = cleaningReport.rows_after ?? 0;
          const dropped = Math.max(rowsBefore - rowsAfter, 0);
          const dropIssues: ValidationIssue[] = (cleaningReport.quality?.issues || []).filter(
            (i: ValidationIssue) => i.severity === 'error' && i.count > 0
          );
          const hasDrops = dropped > 0;
          const stat = (label: string, value: React.ReactNode) => (
            <div
              className={`p-3 rounded-xl bg-white/70 dark:bg-white/5 border ${
                hasDrops ? 'border-amber-500/20' : 'border-emerald-500/20'
              }`}
            >
              <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">
                {label}
              </span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{value}</span>
            </div>
          );

          return (
            <div
              className={`p-5 rounded-2xl border ${
                hasDrops
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2.5 mb-1">
                {hasDrops ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                )}
                <h4 className="font-bold text-sm">
                  {hasDrops
                    ? `${dropped.toLocaleString('en-IN')} of ${rowsBefore.toLocaleString('en-IN')} rows were dropped during validation`
                    : `All ${rowsAfter.toLocaleString('en-IN')} rows passed validation`}
                </h4>
              </div>

              {hasDrops && (
                <ul className="mt-2 space-y-1 text-xs leading-relaxed">
                  {dropIssues.map((issue) => (
                    <li key={issue.code}>
                      <span className="font-bold">{issueText(issue)}</span>
                      {issue.examples.length > 0 && (
                        <span className="text-slate-600 dark:text-slate-400">
                          {' '}
                          — e.g.{' '}
                          {issue.examples
                            .slice(0, 3)
                            .map((e) => `row ${e.row}: ${e.detail}`)
                            .join(' · ')}
                        </span>
                      )}
                    </li>
                  ))}
                  <li className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    Row numbers are lines in your file (the header is row 1). Valid rows were kept; the rows
                    above were not loaded.
                  </li>
                </ul>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                {stat('Valid Rows', rowsAfter.toLocaleString('en-IN'))}
                {stat('Duplicate IDs Pruned', cleaningReport.duplicates_removed ?? 0)}
                {stat('Invalid Dates Pruned', cleaningReport.invalid_dates_removed ?? 0)}
                {stat(
                  'Zero / Negative Pruned',
                  (cleaningReport.invalid_business_rows_removed ?? 0) +
                    (cleaningReport.numeric_missing_rows_removed ?? 0)
                )}
              </div>
            </div>
          );
        })()}

      {/* When Dataset is Loaded: Active Dataset Stats & Preview Table */}
      {loaded && dataset && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {filename || 'retail_sales.csv'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dataset.uploaded_at
                    ? `Uploaded ${new Date(dataset.uploaded_at).toLocaleString()}`
                    : 'Active analytical session'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => refresh()}
                disabled={refreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowRemoveModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Data
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Rows
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {dataset.total_rows?.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Units Sold
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {dataset.total_quantity?.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Total Sales Revenue
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {inr(dataset.total_sales)}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Avg. Basket Size
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {inr(dataset.average_transaction)}
              </p>
            </div>
          </div>

          {/* Data Quality */}
          {quality && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Data Quality</h4>
                {quality.source === 'stored' && (
                  <span className="text-[11px] text-slate-400">
                    Computed from the stored rows. Re-upload the original file to see dropped-row and
                    missing-value details.
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date Range
                  </p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {fmtDate(quality.date_start)} → {fmtDate(quality.date_end)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{quality.span_days} days</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    History
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {quality.months_with_data} months
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {quality.days_with_sales} days with sales
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Valid Rows
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {quality.rows_kept.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {quality.source === 'upload'
                      ? quality.rows_dropped > 0
                        ? `${quality.rows_dropped.toLocaleString('en-IN')} of ${quality.rows_in_file.toLocaleString('en-IN')} dropped`
                        : 'none dropped'
                      : 'rows in the database'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Volume
                  </p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {quality.avg_transactions_per_day}/day
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">avg transactions</p>
                </div>
              </div>

              {quality.source === 'upload' && (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Blank cells in your file
                  </p>
                  {Object.values(quality.missing_values).every((n) => n === 0) ? (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> No missing values in any required column.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(quality.missing_values)
                        .filter(([, n]) => n > 0)
                        .map(([col, n]) => (
                          <span
                            key={col}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-semibold text-amber-700 dark:text-amber-300"
                          >
                            {col}: {n.toLocaleString('en-IN')}
                          </span>
                        ))}
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    How blanks are handled: a blank Date, Quantity, Price per Unit or Total Amount drops the
                    row. A blank Customer ID, Gender or Product Category is labelled "Unknown". A blank Age
                    is kept as 0. A blank Transaction ID is kept.
                  </p>
                </div>
              )}

              {quality.warnings.length > 0 ? (
                <ul className="space-y-1.5">
                  {quality.warnings.map((w) => (
                    <li
                      key={w}
                      className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-800 dark:text-amber-300"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No data quality warnings.
                </p>
              )}

              {quality.issues.filter((i) => i.severity === 'warning' && i.count > 0).length > 0 && (
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {quality.issues
                    .filter((i) => i.severity === 'warning' && i.count > 0)
                    .map((issue) => (
                      <li key={issue.code}>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {issueText(issue)}
                        </span>
                        {issue.examples.length > 0 && (
                          <span>
                            {' '}
                            — e.g.{' '}
                            {issue.examples
                              .slice(0, 3)
                              .map((e) => `row ${e.row}: ${e.detail}`)
                              .join(' · ')}
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {/* Data Preview Table */}
          {previewColumns.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Data Preview
                  </h4>
                  <span className="text-xs text-slate-400">
                    (Showing first {previewRows.length} rows)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter records..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <select
                    value={previewLimit}
                    onChange={(e) => setPreviewLimit(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value={10}>10 rows</option>
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200/80 dark:border-white/10 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200/80 dark:border-white/10">
                      {previewColumns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]"
                        >
                          {col.replace(/_/g, ' ')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
                    {filteredRows.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        {previewColumns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap"
                          >
                            {col === 'total_amount' || col === 'price_per_unit'
                              ? `₹${Number(row[col]).toLocaleString('en-IN')}`
                              : String(row[col] ?? '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Dropzone */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0d1527] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {loaded ? 'Replace Active Dataset' : 'Upload Retail Sales CSV'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {loaded
              ? 'Uploading a new CSV replaces the active session database cleanly.'
              : 'Drag & drop any retail sales CSV below, or use the demo generator to test.'}
          </p>
        </div>

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
              handleFileDrop(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
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
                handleFileDrop(e.target.files[0]);
              }
            }}
          />

          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            {uploading ? 'Processing and standardizing dataset...' : 'Click to browse or drag & drop CSV'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Required columns: Transaction ID, Date, Customer ID, Gender, Age, Product Category, Quantity, Price per Unit, Total Amount
          </p>

          <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            Files processed in-memory
          </span>
        </div>

        {/* Action Buttons: Demo Generation & Template */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Header Template</span>
          </button>

          <button
            onClick={handleDemoClick}
            disabled={uploading || refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Demo Dataset (1,000 Rows)</span>
          </button>
        </div>
      </div>

      <RemoveDataModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
      />
    </div>
  );
};
