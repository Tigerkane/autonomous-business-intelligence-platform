import React from 'react';

interface IllustrationProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat SVG: Walk-Forward MAPE Time-Series Model Selector
 * Original vector graphic under 2.5 KB with full theme support.
 */
export const ForecastingIllustration: React.FC<IllustrationProps> = ({
  className = 'w-full h-auto max-w-[340px]',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const bgSurface = isDark ? '#0d1527' : '#ffffff';
  const bgSubtle = isDark ? '#131e36' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const primary = isDark ? '#818cf8' : '#4338ca';
  const primaryLight = isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.1)';
  const accent = isDark ? '#2dd4bf' : '#0d9488';
  const textMuted = isDark ? '#64748b' : '#94a3b8';

  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* Frame */}
      <rect x="6" y="6" width="308" height="208" rx="12" fill={bgSurface} stroke={border} strokeWidth="1.5" />

      {/* Header Bar */}
      <rect x="18" y="18" width="90" height="8" rx="3" fill={primary} />
      <rect x="214" y="16" width="88" height="14" rx="4" fill={primaryLight} />
      <rect x="224" y="21" width="68" height="4" rx="2" fill={primary} />

      {/* Chart Canvas */}
      <rect x="18" y="44" width="284" height="150" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />

      {/* Grid Lines */}
      <line x1="28" y1="80" x2="292" y2="80" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="28" y1="116" x2="292" y2="116" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="28" y1="152" x2="292" y2="152" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="28" y1="180" x2="292" y2="180" stroke={border} strokeWidth="1" />

      {/* Walk-Forward Train/Test split marker */}
      <line x1="188" y1="52" x2="188" y2="180" stroke={textMuted} strokeWidth="1.5" strokeDasharray="4 2" />
      <rect x="156" y="52" width="30" height="10" rx="2" fill={border} />
      <rect x="160" y="55" width="22" height="4" rx="1" fill={textMuted} />
      <rect x="192" y="52" width="36" height="10" rx="2" fill={primaryLight} />
      <rect x="196" y="55" width="28" height="4" rx="1" fill={primary} />

      {/* Confidence corridor in projected region */}
      <path
        d="M 188 120 L 222 108 L 256 94 L 286 86 L 286 128 L 256 132 L 222 138 L 188 144 Z"
        fill={primaryLight}
      />

      {/* Historical Sales Curve */}
      <path
        d="M 36 156 L 66 142 L 96 148 L 126 124 L 156 132 L 188 116"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forecast Line */}
      <path
        d="M 188 116 L 222 104 L 256 92 L 286 82"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodes */}
      <circle cx="66" cy="142" r="3" fill={primary} />
      <circle cx="96" cy="148" r="3" fill={primary} />
      <circle cx="126" cy="124" r="3" fill={primary} />
      <circle cx="156" cy="132" r="3" fill={primary} />
      <circle cx="188" cy="116" r="3.5" fill={primary} />
      <circle cx="222" cy="104" r="3" fill={accent} />
      <circle cx="256" cy="92" r="3" fill={accent} />
      <circle cx="286" cy="82" r="3" fill={accent} />
    </svg>
  );
};
