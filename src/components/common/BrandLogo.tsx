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
  const uid = useId().replace(/:/g, '');

  const idPlate = `abip-plate-${uid}`;
  const idGlow = `abip-glow-${uid}`;
  const idRim = `abip-rim-${uid}`;
  const idPlateLight = `abip-plate-light-${uid}`;

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
        {/* Dark Mode Gradients */}
        <linearGradient id={idPlate} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#151A38" />
          <stop offset="50%" stopColor="#0B1124" />
          <stop offset="100%" stopColor="#030714" />
        </linearGradient>

        <radialGradient id={idGlow} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.30" />
          <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#030714" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={idRim} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#6366F1" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.75" />
        </linearGradient>

        {/* Light Mode Gradients */}
        <linearGradient id={idPlateLight} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Adaptive CSS classes based on .dark parent */}
        <style>{`
          .abip-b-base { fill: #FFFFFF; stroke: #E2E8F0; }
          .abip-b-glow { opacity: 0; }
          .abip-bar-1 { fill: #312E81; }
          .abip-bar-2 { fill: #4F46E5; }
          .abip-bar-3 { fill: #0D9488; }
          .abip-link-pri { stroke: #0D9488; stroke-width: 1.5px; }
          .abip-link-sec { stroke: #0D9488; stroke-width: 1.1px; opacity: 0.65; }
          .abip-link-mesh { stroke: #0D9488; stroke-width: 1.0px; opacity: 0.45; }
          .abip-node-1 { fill: #312E81; }
          .abip-node-2 { fill: #4F46E5; }
          .abip-node-3 { fill: #0D9488; }
          .abip-spark { fill: #0D9488; }
          .abip-spark-center { fill: #FFFFFF; }

          :root.dark .abip-b-base,
          .dark .abip-b-base { fill: url(#${idPlate}); stroke: url(#${idRim}); }
          :root.dark .abip-b-glow,
          .dark .abip-b-glow { opacity: 1; fill: url(#${idGlow}); }
          :root.dark .abip-bar-1,
          .dark .abip-bar-1 { fill: #6366F1; }
          :root.dark .abip-bar-2,
          .dark .abip-bar-2 { fill: #818CF8; }
          :root.dark .abip-bar-3,
          .dark .abip-bar-3 { fill: #38BDF8; }
          :root.dark .abip-link-pri,
          .dark .abip-link-pri { stroke: #A78BFA; stroke-width: 1.4px; }
          :root.dark .abip-link-sec,
          .dark .abip-link-sec { stroke: #A78BFA; stroke-width: 1.0px; opacity: 0.55; }
          :root.dark .abip-link-mesh,
          .dark .abip-link-mesh { stroke: #A78BFA; stroke-width: 0.9px; opacity: 0.35; }
          :root.dark .abip-node-1,
          .dark .abip-node-1 { fill: #6366F1; }
          :root.dark .abip-node-2,
          .dark .abip-node-2 { fill: #818CF8; }
          :root.dark .abip-node-3,
          .dark .abip-node-3 { fill: #38BDF8; }
          :root.dark .abip-spark,
          .dark .abip-spark { fill: #34D399; }
          :root.dark .abip-spark-center,
          .dark .abip-spark-center { fill: #FFFFFF; }
        `}</style>
      </defs>

      {/* Badge Backdrop: Adapts to Light (white squircle) or Dark (midnight glow) */}
      {withBadge && (
        <>
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="11"
            className="abip-b-base transition-colors duration-300"
            strokeWidth="1.2"
          />
          <rect
            x="2"
            y="2"
            width="40"
            height="40"
            rx="11"
            className="abip-b-glow transition-opacity duration-300 pointer-events-none"
          />
        </>
      )}

      {/* ====================================================== */}
      {/* MARK: Upward-Trending Bar Chart + Neural Net + Spark    */}
      {/* ====================================================== */}
      <g>
        {/* --- Three ascending bars ---- */}
        {/* Bar 1 (short — data ingestion) */}
        <rect x="9" y="24" width="5.5" height="11" rx="2.75" className="abip-bar-1 transition-colors duration-300" />

        {/* Bar 2 (medium — analysis) */}
        <rect x="19.25" y="17" width="5.5" height="18" rx="2.75" className="abip-bar-2 transition-colors duration-300" />

        {/* Bar 3 (tall — predictive insight) */}
        <rect x="29.5" y="10" width="5.5" height="25" rx="2.75" className="abip-bar-3 transition-colors duration-300" />

        {/* --- Neural network links between bars --- */}
        {/* Upper trend line: bar1-top → bar2-top → bar3-top */}
        <line x1="11.75" y1="25.5" x2="22" y2="18.5" className="abip-link-pri transition-colors duration-300" strokeLinecap="round" />
        <line x1="22" y1="18.5" x2="32.25" y2="11.5" className="abip-link-pri transition-colors duration-300" strokeLinecap="round" />

        {/* Lower mesh links */}
        <line x1="11.75" y1="30" x2="22" y2="28" className="abip-link-sec transition-colors duration-300" strokeLinecap="round" />
        <line x1="22" y1="28" x2="32.25" y2="24" className="abip-link-sec transition-colors duration-300" strokeLinecap="round" />

        {/* Cross-mesh diagonal */}
        <line x1="22" y1="18.5" x2="32.25" y2="24" className="abip-link-mesh transition-colors duration-300" strokeLinecap="round" strokeDasharray="2 1.5" />

        {/* --- Neural connection nodes --- */}
        {/* Node on bar 1 top */}
        <circle cx="11.75" cy="25.5" r="2.0" className="abip-node-1 transition-colors duration-300" />
        <circle cx="11.75" cy="25.5" r="0.9" fill="#FFFFFF" />

        {/* Node on bar 2 top */}
        <circle cx="22" cy="18.5" r="2.2" className="abip-node-2 transition-colors duration-300" />
        <circle cx="22" cy="18.5" r="1.0" fill="#FFFFFF" />

        {/* Node on bar 3 top (primary apex node) */}
        <circle cx="32.25" cy="11.5" r="2.4" className="abip-node-3 transition-colors duration-300" />
        <circle cx="32.25" cy="11.5" r="1.1" fill="#FFFFFF" />

        {/* Lower mesh nodes (smaller) */}
        <circle cx="22" cy="28" r="1.5" className="abip-link-sec transition-colors duration-300" />
        <circle cx="22" cy="28" r="0.65" fill="#FFFFFF" />

        <circle cx="32.25" cy="24" r="1.5" className="abip-node-3 transition-colors duration-300" />
        <circle cx="32.25" cy="24" r="0.65" fill="#FFFFFF" />

        {/* --- Autonomous Insight Spark (4-point star above bar 3) --- */}
        <path
          d="M 32.25 3.5 Q 32.25 5.8 34.5 5.8 Q 32.25 5.8 32.25 8.1 Q 32.25 5.8 30 5.8 Q 32.25 5.8 32.25 3.5 Z"
          className="abip-spark transition-colors duration-300"
        />
        <circle cx="32.25" cy="5.8" r="0.7" className="abip-spark-center transition-colors duration-300" />
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
              className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]} whitespace-nowrap`}
            >
              Autonomous{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent">
                BI
              </span>
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-teal-500/20 dark:border-indigo-500/25 shadow-2xs">
              ABIP
            </span>
          </div>

          {(subtitle || variant === 'full') && (
            <span
              className={`font-medium text-slate-500 dark:text-slate-400 mt-0.5 ${subtitleSizes[size]} tracking-normal whitespace-nowrap`}
            >
              {subtitle || 'Enterprise Retail Intelligence'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
