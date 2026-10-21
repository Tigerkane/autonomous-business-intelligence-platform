import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Broken chart for 404 not found
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const BrokenChart404Illustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const danger = '#ef4444';
  const primary = isDark ? '#6366f1' : '#4f46e5';
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
      {/* Outer Card Plate */}
      <rect x="40" y="30" width="240" height="175" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

      {/* Header Bar */}
      <rect x="40" y="30" width="240" height="28" rx="14" fill={raised} />
      <line x1="40" y1="58" x2="280" y2="58" stroke={border} strokeWidth="1" />
      <circle cx="55" cy="44" r="3.5" fill={danger} />
      <circle cx="66" cy="44" r="3.5" fill="#f59e0b" />
      <circle cx="77" cy="44" r="3.5" fill="#22c55e" />

      {/* Big 404 Watermark Typography */}
      <text
        x="160"
        y="125"
        textAnchor="middle"
        fontSize="56"
        fontWeight="800"
        fill={isDark ? 'rgba(99, 102, 241, 0.12)' : 'rgba(79, 70, 229, 0.08)'}
        fontFamily="sans-serif"
      >
        404
      </text>

      {/* Disjointed/Broken Line Chart */}
      <path
        d="M 60 150 L 95 130 L 125 140 L 145 105"
        stroke={primary}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="95" cy="130" r="3.5" fill={primary} />
      <circle cx="125" cy="140" r="3.5" fill={primary} />

      {/* Jagged Fracture / Lightning Break in the Middle */}
      <path
        d="M 148 100 L 158 116 L 152 128 L 166 142 L 175 148"
        stroke={danger}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dropping Broken Line Right Segment */}
      <path
        d="M 180 152 L 210 170 L 255 178"
        stroke={danger}
        strokeWidth="3"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <circle cx="210" cy="170" r="3.5" fill={danger} />
      <circle cx="255" cy="178" r="4.5" fill={danger} />

      {/* Warning Alert Badge */}
      <circle cx="160" cy="80" r="14" fill={danger} />
      <text x="160" y="86" textAnchor="middle" fontSize="16" fontWeight="900" fill="#ffffff" fontFamily="sans-serif">
        !
      </text>
    </svg>
  );
};
