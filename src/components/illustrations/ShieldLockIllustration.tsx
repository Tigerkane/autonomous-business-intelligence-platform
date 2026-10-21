import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Shield with lock (Auth, Privacy, Security)
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const ShieldLockIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const success = '#22c55e';
  const text = isDark ? '#e2e8f0' : '#0f172a';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Ring */}
      <circle cx="160" cy="115" r="85" fill={isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.05)'} />

      {/* Main Shield Geometry */}
      <g filter="drop-shadow(0 6px 14px rgba(0,0,0,0.18))">
        <path
          d="M 160 35 L 225 58 C 225 130 185 175 160 195 C 135 175 95 130 95 58 Z"
          fill={bg}
          stroke={border}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Shield Accent */}
        <path
          d="M 160 48 L 212 66 C 212 124 180 162 160 178 C 140 162 108 124 108 66 Z"
          fill={raised}
        />

        {/* Lock Shackle */}
        <path
          d="M 144 105 L 144 92 C 144 83 151 76 160 76 C 169 76 176 83 176 92 L 176 105"
          stroke={primary}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Lock Body */}
        <rect x="135" y="102" width="50" height="42" rx="8" fill={primary} />

        {/* Lock Keyhole */}
        <circle cx="160" cy="118" r="4.5" fill="#ffffff" />
        <rect x="158.5" y="120" width="3" height="10" rx="1.5" fill="#ffffff" />

        {/* Verified Security Badge */}
        <circle cx="215" cy="155" r="16" fill={success} />
        <path
          d="M 208 155 L 213 160 L 223 149"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
