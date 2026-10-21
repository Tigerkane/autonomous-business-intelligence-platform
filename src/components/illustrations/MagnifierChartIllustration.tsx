import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Magnifier over a chart (Analysis, Outliers, Insights)
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const MagnifierChartIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const danger = '#ef4444';
  const success = '#22c55e';
  const info = '#38bdf8';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Frame */}
      <rect x="40" y="30" width="240" height="180" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

      {/* Header bar */}
      <rect x="40" y="30" width="240" height="28" rx="14" fill={raised} />
      <line x1="40" y1="58" x2="280" y2="58" stroke={border} strokeWidth="1" />
      <rect x="55" y="42" width="60" height="6" rx="3" fill={border} />

      {/* Grid */}
      <line x1="55" y1="100" x2="265" y2="100" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="55" y1="140" x2="265" y2="140" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="55" y1="180" x2="265" y2="180" stroke={border} strokeWidth="1" />

      {/* Bar Columns */}
      <rect x="65" y="130" width="16" height="50" rx="4" fill={border} />
      <rect x="95" y="110" width="16" height="70" rx="4" fill={primary} />
      <rect x="125" y="140" width="16" height="40" rx="4" fill={border} />
      <rect x="155" y="85" width="16" height="95" rx="4" fill={info} />
      <rect x="185" y="120" width="16" height="60" rx="4" fill={border} />
      <rect x="215" y="70" width="16" height="110" rx="4" fill={danger} />
      <rect x="245" y="105" width="16" height="75" rx="4" fill={success} />

      {/* Magnifier Lens focusing on Anomaly Spike */}
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.18))">
        {/* Glass Glow */}
        <circle cx="215" cy="95" r="38" fill={isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(79, 70, 229, 0.12)'} stroke={primary} strokeWidth="3" />

        {/* Highlight inside Lens */}
        <path d="M 195 80 A 30 30 0 0 1 230 75" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

        {/* Magnifier Handle */}
        <line x1="242" y1="122" x2="278" y2="158" stroke={primary} strokeWidth="7" strokeLinecap="round" />
        <line x1="242" y1="122" x2="278" y2="158" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.3" />

        {/* Anomaly Target Icon in Lens */}
        <circle cx="215" cy="95" r="5" fill={danger} />
        <rect x="200" y="112" width="30" height="12" rx="4" fill={danger} />
        <text x="204" y="121" fontSize="9" fontWeight="800" fill="#ffffff" fontFamily="sans-serif">
          SPIKE
        </text>
      </g>
    </svg>
  );
};
