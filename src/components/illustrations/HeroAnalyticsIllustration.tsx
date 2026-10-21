import React from 'react';

interface IllustrationProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat SVG Illustration: Modern Retail Analytics Dashboard Console
 * Original, under 3 KB, theme-aware, 100% vector SVG without external dependencies.
 */
export const HeroAnalyticsIllustration: React.FC<IllustrationProps> = ({
  className = 'w-full h-auto max-w-[480px]',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Flat 2D Palette derived from Design Tokens
  const bgSurface = isDark ? '#0d1527' : '#ffffff';
  const bgSubtle = isDark ? '#131e36' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const primary = isDark ? '#818cf8' : '#4338ca';
  const primaryLight = isDark ? 'rgba(129, 140, 248, 0.2)' : 'rgba(67, 56, 202, 0.1)';
  const accent = isDark ? '#2dd4bf' : '#0d9488';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const barMuted = isDark ? '#1e293b' : '#e2e8f0';

  return (
    <svg
      viewBox="0 0 460 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* Outer Console Frame */}
      <rect x="10" y="10" width="440" height="280" rx="14" fill={bgSurface} stroke={border} strokeWidth="1.5" />

      {/* Header Bar */}
      <rect x="10" y="10" width="440" height="38" rx="14" fill={bgSubtle} />
      <line x1="10" y1="48" x2="450" y2="48" stroke={border} strokeWidth="1" />

      {/* Control Dots (flat, 2D) */}
      <circle cx="28" cy="29" r="4.5" fill={isDark ? '#ef4444' : '#f87171'} />
      <circle cx="42" cy="29" r="4.5" fill={isDark ? '#f59e0b' : '#fbbf24'} />
      <circle cx="56" cy="29" r="4.5" fill={isDark ? '#10b981' : '#34d399'} />

      {/* Title mock line */}
      <rect x="80" y="24" width="96" height="10" rx="4" fill={textMuted} />
      <rect x="360" y="23" width="70" height="12" rx="4" fill={primaryLight} />
      <rect x="372" y="26" width="46" height="6" rx="2" fill={primary} />

      {/* Left Widget: Metric Summary Cards */}
      <rect x="26" y="64" width="126" height="64" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />
      <rect x="36" y="74" width="54" height="6" rx="2" fill={textMuted} />
      <rect x="36" y="86" width="76" height="14" rx="3" fill={textPrimary} />
      <rect x="36" y="106" width="42" height="6" rx="2" fill={accent} />

      <rect x="26" y="138" width="126" height="64" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />
      <rect x="36" y="148" width="62" height="6" rx="2" fill={textMuted} />
      <rect x="36" y="160" width="58" height="14" rx="3" fill={textPrimary} />
      <rect x="36" y="180" width="48" height="6" rx="2" fill={primary} />

      {/* Mini Donut Chart in bottom left */}
      <rect x="26" y="212" width="126" height="62" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />
      <circle cx="54" cy="243" r="18" stroke={border} strokeWidth="6" fill="none" />
      <circle
        cx="54"
        cy="243"
        r="18"
        stroke={primary}
        strokeWidth="6"
        strokeDasharray="60 120"
        strokeDashoffset="15"
        fill="none"
      />
      <circle
        cx="54"
        cy="243"
        r="18"
        stroke={accent}
        strokeWidth="6"
        strokeDasharray="30 120"
        strokeDashoffset="-45"
        fill="none"
      />
      <rect x="82" y="230" width="56" height="6" rx="2" fill={textPrimary} />
      <rect x="82" y="242" width="40" height="5" rx="2" fill={textMuted} />
      <rect x="82" y="252" width="48" height="5" rx="2" fill={textMuted} />

      {/* Right Canvas: Main Analytical Curve Area */}
      <rect x="166" y="64" width="268" height="210" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />

      {/* Chart Header Bar */}
      <rect x="180" y="78" width="100" height="8" rx="3" fill={textPrimary} />
      <rect x="372" y="77" width="48" height="10" rx="3" fill={primaryLight} />

      {/* Grid Lines */}
      <line x1="180" y1="120" x2="420" y2="120" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="180" y1="160" x2="420" y2="160" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="180" y1="200" x2="420" y2="200" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="180" y1="240" x2="420" y2="240" stroke={border} strokeWidth="1" />

      {/* Background Confidence Fan */}
      <path
        d="M 184 210 L 224 195 L 264 202 L 304 165 L 344 145 L 384 130 L 416 118 L 416 156 L 384 162 L 344 175 L 304 190 Z"
        fill={primaryLight}
      />

      {/* Time-Series Actuals Path */}
      <path
        d="M 184 212 L 224 196 L 264 204 L 304 168 L 344 148 L 384 136 L 416 122"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Forecast Dotted Continuation */}
      <path
        d="M 384 136 L 416 122"
        stroke={accent}
        strokeWidth="2.5"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />

      {/* Data Nodes */}
      <circle cx="224" cy="196" r="3.5" fill={primary} />
      <circle cx="264" cy="204" r="3.5" fill={primary} />
      <circle cx="304" cy="168" r="3.5" fill={primary} />
      <circle cx="344" cy="148" r="3.5" fill={primary} />

      {/* Anomaly Node Flag */}
      <circle cx="384" cy="136" r="5" fill="#f43f5e" stroke={bgSurface} strokeWidth="2" />
      <rect x="362" y="112" width="44" height="15" rx="3" fill="#f43f5e" />
      <rect x="368" y="117" width="32" height="5" rx="2" fill="#ffffff" />

      {/* Volume Micro Bars */}
      <rect x="194" y="230" width="8" height="10" rx="2" fill={barMuted} />
      <rect x="220" y="222" width="8" height="18" rx="2" fill={barMuted} />
      <rect x="246" y="226" width="8" height="14" rx="2" fill={barMuted} />
      <rect x="272" y="214" width="8" height="26" rx="2" fill={primary} />
      <rect x="298" y="218" width="8" height="22" rx="2" fill={barMuted} />
      <rect x="324" y="206" width="8" height="34" rx="2" fill={accent} />
      <rect x="350" y="212" width="8" height="28" rx="2" fill={barMuted} />
      <rect x="376" y="198" width="8" height="42" rx="2" fill="#f43f5e" />
      <rect x="402" y="204" width="8" height="36" rx="2" fill={primary} />
    </svg>
  );
};
