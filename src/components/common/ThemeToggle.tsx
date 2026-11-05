import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * ThemeToggle: Enterprise glassmorphic theme toggle button.
 * Smoothly switches between Light and Dark modes with icon rotation and scale physics,
 * matching ABIP's indigo/cyan/glass design system.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useData();
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-xs',
    lg: 'px-3 py-2 text-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300 cursor-pointer group ${
        sizeClasses[size]
      } bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/90 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 shadow-xs hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {/* Sun Icon (active in Light mode) */}
        <Sun
          className={`${iconSizes[size]} text-amber-500 transition-all duration-300 transform ${
            isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100'
          }`}
          aria-hidden="true"
        />

        {/* Moon Icon (active in Dark mode) */}
        <Moon
          className={`${iconSizes[size]} text-indigo-400 transition-all duration-300 transform ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0 absolute'
          }`}
          aria-hidden="true"
        />
      </div>

      {showLabel && (
        <span className="font-semibold text-slate-700 dark:text-slate-200 select-none">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};

