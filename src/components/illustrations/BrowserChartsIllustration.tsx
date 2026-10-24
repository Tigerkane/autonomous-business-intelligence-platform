import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Browser window with charts and floating KPI chips
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware, 100% vector SVG.
 */
export const BrowserChartsIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const primarySoft = isDark ? '#818cf8' : '#6366f1';
  const success = '#22c55e';
  const danger = '#ef4444';
  const text = isDark ? '#e2e8f0' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Glow */}
      <rect x="20" y="20" width="280" height="200" rx="16" fill={isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.05)'} />

      {/* Main Browser Window */}
      <rect x="30" y="25" width="260" height="185" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

      {/* Window Title Bar */}
      <rect x="30" y="25" width="260" height="26" rx="14" fill={raised} />
      <line x1="30" y1="51" x2="290" y2="51" stroke={border} strokeWidth="1" />
      <circle cx="44" cy="38" r="3.5" fill="#ef4444" />
      <circle cx="55" cy="38" r="3.5" fill="#f59e0b" />
      <circle cx="66" cy="38" r="3.5" fill="#22c55e" />
      <rect x="85" y="34" width="75" height="8" rx="4" fill={border} />

      {/* Main Chart Area */}
      <rect x="44" y="64" width="160" height="132" rx="10" fill={raised} stroke={border} strokeWidth="1" />

      {/* Grid Lines */}
      <line x1="56" y1="95" x2="192" y2="95" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="56" y1="130" x2="192" y2="130" stroke={border} strokeWidth="1" strokeDasharray="3 3" />
      <line x1="56" y1="165" x2="192" y2="165" stroke={border} strokeWidth="1" strokeDasharray="3 3" />

      {/* Area Curve Shading */}
      <path
        d="M 56 160 Q 85 145 110 120 T 155 105 T 192 85 L 192 175 L 56 175 Z"
        fill={isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(79, 70, 229, 0.12)'}
      />
      {/* Primary Line */}
      <path
        d="M 56 160 Q 85 145 110 120 T 155 105 T 192 85"
        stroke={primary}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Data Nodes */}
      <circle cx="85" cy="142" r="3" fill={primary} />
      <circle cx="110" cy="120" r="3" fill={primary} />
      <circle cx="155" cy="105" r="3" fill={primary} />
      <circle cx="192" cy="85" r="4" fill={success} />

      {/* Mini Bar Columns */}
      <rect x="62" y="145" width="8" height="30" rx="3" fill={border} />
      <rect x="80" y="130" width="8" height="45" rx="3" fill={primarySoft} />
      <rect x="98" y="115" width="8" height="60" rx="3" fill={border} />
      <rect x="116" y="100" width="8" height="75" rx="3" fill={primary} />
      <rect x="134" y="125" width="8" height="50" rx="3" fill={border} />
      <rect x="152" y="90" width="8" height="85" rx="3" fill={success} />

      {/* Floating Top KPI Chip 1 */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))">
        <rect x="195" y="60" width="90" height="44" rx="10" fill={bg} stroke={border} strokeWidth="1" />
        <rect x="205" y="70" width="34" height="5" rx="2" fill={muted} />
        <text x="205" y="92" fontSize="13" fontWeight="700" fill={text} fontFamily="sans-serif">
          ₹124.8k
        </text>
        <circle cx="270" cy="82" r="4" fill={success} />
      </g>

      {/* Floating Bottom KPI Chip 2 */}
      <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))">
        <rect x="185" y="120" width="105" height="48" rx="10" fill={bg} stroke={border} strokeWidth="1" />
        <rect x="195" y="131" width="48" height="5" rx="2" fill={muted} />
        <text x="195" y="154" fontSize="13" fontWeight="700" fill={primarySoft} fontFamily="sans-serif">
          +18.4% MoM
        </text>
      </g>
    </svg>
  );
};
