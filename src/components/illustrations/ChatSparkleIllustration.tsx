import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: Chat bubbles with a sparkle (Ask Your Data, Conversational AI)
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const ChatSparkleIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const primarySoft = isDark ? '#818cf8' : '#6366f1';
  const warning = '#f59e0b';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Ambience */}
      <circle cx="160" cy="120" r="95" fill={isDark ? 'rgba(99, 102, 241, 0.08)' : 'rgba(79, 70, 229, 0.05)'} />

      {/* User Outbound Chat Bubble (Top Left) */}
      <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))">
        <rect x="50" y="45" width="165" height="56" rx="14" fill={raised} stroke={border} strokeWidth="1.5" />
        <rect x="66" y="60" width="115" height="7" rx="3.5" fill={primary} />
        <rect x="66" y="73" width="85" height="6" rx="3" fill={muted} />
        {/* Tail */}
        <path d="M 65 101 L 55 112 L 78 101 Z" fill={raised} stroke={border} strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* AI Assistant Inbound Chat Bubble (Bottom Right) */}
      <g filter="drop-shadow(0 6px 12px rgba(0,0,0,0.14))">
        <rect x="105" y="115" width="170" height="72" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

        {/* AI Answer Content with Micro Sparkle */}
        <rect x="122" y="132" width="135" height="8" rx="4" fill={primarySoft} />
        <rect x="122" y="146" width="120" height="6" rx="3" fill={muted} />
        <rect x="122" y="158" width="85" height="6" rx="3" fill={border} />

        {/* Tail */}
        <path d="M 255 187 L 270 198 L 245 187 Z" fill={bg} stroke={border} strokeWidth="1.5" strokeLinejoin="round" />
      </g>

      {/* Central Sparkle Cluster (Four-point flat stars) */}
      <g transform="translate(198, 38)">
        {/* Large Sparkle */}
        <path
          d="M 20 0 Q 20 15 35 15 Q 20 15 20 30 Q 20 15 5 15 Q 20 15 20 0 Z"
          fill={warning}
        />
        {/* Small Companion Sparkle */}
        <path
          d="M 38 24 Q 38 31 45 31 Q 38 31 38 38 Q 38 31 31 31 Q 38 31 38 24 Z"
          fill={primarySoft}
        />
      </g>

      {/* Left Accent Sparkle */}
      <path
        d="M 40 145 Q 40 151 46 151 Q 40 151 40 157 Q 40 151 34 151 Q 40 151 40 145 Z"
        fill={warning}
      />
    </svg>
  );
};
