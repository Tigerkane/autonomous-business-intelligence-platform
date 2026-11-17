import React from 'react';

export interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'compact' | 'full';
  subtitle?: string;
  showSubtitle?: boolean;
  withBadge?: boolean;
  onClick?: () => void;
}

/**
 * BrandIcon: ABIP (Autonomous Business Intelligence Platform) adaptive logo mark.
 *
 * Concept: An upward-trending 3-bar chart connected by thin neural network node-and-line
 * links between bars, crowned by an autonomous insight spark at the apex.
 *
 * Adaptive Theme:
 * - Light Mode: Clean crisp white badge with slate/indigo border, deep indigo & bright teal bars.
 * - Dark Mode: Dark obsidian squircle with ambient cyan/indigo glow rim, vibrant electric bars.
 */
export const BrandIcon: React.FC<{
  size?: number;
  className?: string;
  withBadge?: boolean;
}> = ({ size = 32, className = '', withBadge = true }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="ABIP Logo"
    >
      {/* Badge Backdrop: Clean quiet neutral plate */}
      {withBadge && (
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="10"
          className="fill-slate-100 dark:fill-[#19191b] stroke-slate-200 dark:stroke-white/[0.08]"
          strokeWidth="1"
        />
      )}

      {/* Upward-Trending 3-Bar Chart + Telemetry Links */}
      <g>
        {/* Three ascending telemetry bars */}
        <rect x="9.5" y="24" width="5" height="11" rx="2.5" className="fill-slate-400 dark:fill-slate-600" />
        <rect x="19.5" y="17" width="5" height="18" rx="2.5" className="fill-slate-700 dark:fill-slate-400" />
        <rect x="29.5" y="10" width="5" height="25" rx="2.5" className="fill-indigo-600 dark:fill-indigo-400" />

        {/* Telemetry connector lines */}
        <line x1="12" y1="25.5" x2="22" y2="18.5" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="22" y1="18.5" x2="32" y2="11.5" className="stroke-indigo-500 dark:stroke-indigo-400" strokeWidth="1.2" strokeLinecap="round" />

        {/* Apex node */}
        <circle cx="12" cy="25.5" r="1.6" className="fill-slate-500 dark:fill-slate-400" />
        <circle cx="22" cy="18.5" r="1.8" className="fill-slate-700 dark:fill-slate-300" />
        <circle cx="32" cy="11.5" r="2.2" className="fill-indigo-600 dark:fill-indigo-400" />
        <circle cx="32" cy="11.5" r="0.9" fill="#ffffff" />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'compact',
  subtitle,
  withBadge = true,
  onClick,
}) => {
  const pixelSizes = {
    xs: 20,
    sm: 26,
    md: 34,
    lg: 42,
    xl: 50,
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const subtitleSizes = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${
        isClickable ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      <div className="relative shrink-0 transition-transform duration-200 group-hover:scale-105">
        <BrandIcon size={pixelSizes[size]} withBadge={withBadge} />
      </div>

      {variant !== 'icon' && (
        <div className="flex flex-col min-w-0 leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold tracking-tight text-slate-900 dark:text-white ${textSizes[size]} whitespace-nowrap`}
            >
              Autonomous{' '}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                BI
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
              ABIP
            </span>
          </div>

          {(subtitle || variant === 'full') && (
            <span
              className={`text-slate-500 dark:text-slate-400 ${subtitleSizes[size]} tracking-normal whitespace-nowrap`}
            >
              {subtitle || 'Enterprise retail intelligence'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
