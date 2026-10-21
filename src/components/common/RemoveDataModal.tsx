import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface RemoveDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RemoveDataModal: React.FC<RemoveDataModalProps> = ({ isOpen, onClose }) => {
  const { removeData, filename } = useData();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await removeData();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#111c44] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Remove Dataset?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action clears the current database session.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
          Are you sure you want to remove <span className="font-semibold text-slate-900 dark:text-white">{filename || 'this dataset'}</span>? All calculated KPIs, forecasts, and anomaly records will be cleared until a new CSV is uploaded.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? 'Removing...' : 'Yes, Remove Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
