import React, { useId } from 'react';

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
 * BrandIcon: Pure vector insignia for ABIP (Autonomous Business Intelligence Platform).
 * Combines an isometric data prism with ascending analytics facets and an autonomous neural node.
 */
export const BrandIcon: React.FC<{
  size?: number;
  className?: string;
  withBadge?: boolean;
}> = ({ size = 32, className = '', withBadge = true }) => {
  const uniqueId = useId().replace(/:/g, '');

  const gradPrimary = `abip-p-${uniqueId}`;
  const gradSecondary = `abip-s-${uniqueId}`;
  const gradAccent = `abip-a-${uniqueId}`;
  const gradPlate = `abip-plate-${uniqueId}`;
  const gradRim = `abip-rim-${uniqueId}`;

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
      <defs>
        {/* Deep Slate/Indigo gradient for badge background */}
        <linearGradient id={gradPlate} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Glossy rim highlight */}
        <linearGradient id={gradRim} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#6366F1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
        </linearGradient>

        {/* Primary facet: Rich indigo to royal violet */}
        <linearGradient id={gradPrimary} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Secondary facet: Electric cyan to dynamic cobalt */}
        <linearGradient id={gradSecondary} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Apex intelligence core: Vivid violet to magenta spark */}
        <linearGradient id={gradAccent} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        {/* Ambient glow filter for central node */}
        <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Optional Badge Backdrop (squircle tile with glowing border) */}
      {withBadge && (
        <>
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="11"
            fill={`url(#${gradPlate})`}
          />
          <rect
            x="2.5"
            y="2.5"
            width="39"
            height="39"
            rx="10.5"
            stroke={`url(#${gradRim})`}
            strokeWidth="1.2"
          />
        </>
      )}

      {/* ======================================================== */}
      {/* BESPOKE ABIP EMBLEM: Autonomous Isometric Data Prism      */}
      {/* ======================================================== */}
      <g transform={withBadge ? 'translate(0, 0)' : 'translate(0, 0)'}>
        {/* Top Facet: Diamond Apex representing Autonomous LLM & Decision Core */}
        <path
          d="M22 9L31.5 14.5L22 20L12.5 14.5L22 9Z"
          fill={`url(#${gradAccent})`}
          fillOpacity="0.95"
        />

        {/* Left Facet: Ascending Telemetry & Retail Metric Bars */}
        <path
          d="M11 16.5L20.5 22V33.5L11 28V16.5Z"
          fill={`url(#${gradPrimary})`}
        />
        {/* Micro-groove analytical lines on left facet */}
        <path
          d="M13.8 20.2L18.2 22.8V30.5L13.8 27.9V20.2Z"
          fill="#818CF8"
          fillOpacity="0.45"
        />

        {/* Right Facet: Predictive ML Vectors & Anomaly Boundary */}
        <path
          d="M23.5 22L33 16.5V28L23.5 33.5V22Z"
          fill={`url(#${gradSecondary})`}
        />
        {/* Micro-groove predictive trajectory on right facet */}
        <path
          d="M25.8 24.8L30.2 22.2V28.2L25.8 30.8V24.8Z"
          fill="#BAE6FD"
          fillOpacity="0.5"
        />

        {/* Autonomous Central Neural Nexus (Intersecting Luminescent Node) */}
        <circle
          cx="22"
          cy="20"
          r="2.6"
          fill="#FFFFFF"
          filter={`url(#glow-${uniqueId})`}
        />
        <circle
          cx="22"
          cy="20"
          r="1.2"
          fill="#38BDF8"
        />

        {/* Convergence Data Pips (Telemetry Pulses) */}
        <circle cx="11" cy="16.5" r="1.3" fill="#A855F7" />
        <circle cx="33" cy="16.5" r="1.3" fill="#38BDF8" />
        <circle cx="22" cy="34" r="1.3" fill="#818CF8" />
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
        <div className="flex flex-col min-w-0 leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight text-slate-900 dark:text-white ${textSizes[size]} whitespace-nowrap`}
            >
              Autonomous BI
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              ABIP
            </span>
          </div>

          {subtitle && (
            <span
              className={`font-medium text-slate-500 dark:text-slate-400 mt-0.5 ${subtitleSizes[size]} tracking-normal whitespace-nowrap`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
