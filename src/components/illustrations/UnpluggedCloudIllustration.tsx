import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Unplugged cloud for offline / server unreachable states
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const UnpluggedCloudIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const danger = '#ef4444';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Glow Ring */}
      <circle cx="160" cy="110" r="85" fill={isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.05)'} />

      {/* Cloud Outline & Geometry */}
      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.12))">
        <path
          d="M 115 130 H 215 A 25 25 0 0 0 215 80 A 38 38 0 0 0 148 60 A 30 30 0 0 0 115 130 Z"
          fill={bg}
          stroke={border}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Small Disconnection Cross Badge on Cloud */}
        <circle cx="178" cy="85" r="14" fill={danger} />
        <path
          d="M 172 79 L 184 91 M 184 79 L 172 91"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Disconnected Cable Plugs Below */}
      <g>
        {/* Left Cable & Male Plug */}
        <path d="M 90 190 C 110 190 120 170 125 155" stroke={muted} strokeWidth="3" strokeLinecap="round" />
        <rect x="122" y="146" width="16" height="18" rx="4" fill={raised} stroke={border} strokeWidth="1.5" />
        {/* Prongs */}
        <line x1="138" y1="151" x2="148" y2="151" stroke={muted} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="138" y1="159" x2="148" y2="159" stroke={muted} strokeWidth="2.5" strokeLinecap="round" />

        {/* Electrical Spark / Disconnect Void Gap (25px distance) */}
        <path d="M 152 145 L 157 155 L 152 165" stroke={danger} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />

        {/* Right Female Socket & Cable */}
        <rect x="168" y="146" width="18" height="18" rx="4" fill={raised} stroke={border} strokeWidth="1.5" />
        <line x1="172" y1="151" x2="175" y2="151" stroke={border} strokeWidth="2" strokeLinecap="round" />
        <line x1="172" y1="159" x2="175" y2="159" stroke={border} strokeWidth="2" strokeLinecap="round" />
        <path d="M 186 155 C 195 170 205 190 230 190" stroke={muted} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};
