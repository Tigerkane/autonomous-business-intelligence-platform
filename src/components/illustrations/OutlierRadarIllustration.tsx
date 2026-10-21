import React from 'react';

interface IllustrationProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat SVG: Modified MAD z-Score & Outlier Detection
 * Original vector graphic under 2.5 KB with full theme support.
 */
export const OutlierRadarIllustration: React.FC<IllustrationProps> = ({
  className = 'w-full h-auto max-w-[340px]',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const bgSurface = isDark ? '#0d1527' : '#ffffff';
  const bgSubtle = isDark ? '#131e36' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const primary = isDark ? '#818cf8' : '#4338ca';
  const primaryLight = isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(67, 56, 202, 0.1)';
  const danger = isDark ? '#fb7185' : '#e11d48';
  const dangerLight = isDark ? 'rgba(251, 113, 133, 0.2)' : 'rgba(225, 29, 72, 0.12)';

  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* Outer Card */}
      <rect x="6" y="6" width="308" height="208" rx="12" fill={bgSurface} stroke={border} strokeWidth="1.5" />

      {/* Header */}
      <rect x="18" y="18" width="80" height="8" rx="3" fill={primary} />
      <rect x="230" y="16" width="72" height="14" rx="4" fill={dangerLight} />
      <rect x="240" y="21" width="52" height="4" rx="2" fill={danger} />

      {/* Main Bell Curve Container */}
      <rect x="18" y="44" width="284" height="150" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />

      {/* Horizontal Axis */}
      <line x1="28" y1="168" x2="292" y2="168" stroke={border} strokeWidth="1.5" />

      {/* Median Center Line */}
      <line x1="160" y1="56" x2="160" y2="168" stroke={primary} strokeWidth="1.5" strokeDasharray="3 3" />
      <rect x="144" y="48" width="32" height="8" rx="2" fill={primary} />
      <rect x="149" y="51" width="22" height="2" rx="1" fill="#ffffff" />

      {/* Left/Right Threshold Cutoffs (+/- 3.5 MAD) */}
      <line x1="84" y1="90" x2="84" y2="168" stroke={danger} strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="236" y1="90" x2="236" y2="168" stroke={danger} strokeWidth="1.5" strokeDasharray="2 2" />

      {/* Bell Curve Body */}
      <path
        d="M 36 168 C 72 168 108 160 134 116 C 146 94 154 70 160 70 C 166 70 174 94 186 116 C 212 160 248 168 284 168 Z"
        fill={primaryLight}
      />
      <path
        d="M 36 168 C 72 168 108 160 134 116 C 146 94 154 70 160 70 C 166 70 174 94 186 116 C 212 160 248 168 284 168"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Standard Inlier Scatter Points */}
      <circle cx="128" cy="148" r="3" fill={primary} />
      <circle cx="144" cy="118" r="3" fill={primary} />
      <circle cx="152" cy="88" r="3" fill={primary} />
      <circle cx="166" cy="98" r="3" fill={primary} />
      <circle cx="178" cy="132" r="3" fill={primary} />
      <circle cx="196" cy="154" r="3" fill={primary} />

      {/* Anomalous Outlier Flags (Outside 3.5 z-score zone) */}
      <circle cx="56" cy="164" r="4.5" fill={danger} stroke={bgSurface} strokeWidth="1.5" />
      <rect x="42" y="142" width="28" height="12" rx="3" fill={danger} />
      <rect x="47" y="146" width="18" height="4" rx="1" fill="#ffffff" />

      <circle cx="264" cy="164" r="4.5" fill={danger} stroke={bgSurface} strokeWidth="1.5" />
      <rect x="250" y="142" width="28" height="12" rx="3" fill={danger} />
      <rect x="255" y="146" width="18" height="4" rx="1" fill="#ffffff" />
    </svg>
  );
};
