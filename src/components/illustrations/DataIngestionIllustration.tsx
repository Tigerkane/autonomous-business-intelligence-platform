import React from 'react';

interface IllustrationProps {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat SVG: Multi-Format Ingestion & 9-Field Schema Pipeline
 * Clean vector illustration under 2.5 KB with full theme support.
 */
export const DataIngestionIllustration: React.FC<IllustrationProps> = ({
  className = 'w-full h-auto max-w-[340px]',
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const bgSurface = isDark ? '#0d1527' : '#ffffff';
  const bgSubtle = isDark ? '#131e36' : '#f8fafc';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const primary = isDark ? '#818cf8' : '#4338ca';
  const accent = isDark ? '#2dd4bf' : '#0d9488';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const success = isDark ? '#34d399' : '#10b981';

  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      {/* Container Card */}
      <rect x="6" y="6" width="308" height="208" rx="12" fill={bgSurface} stroke={border} strokeWidth="1.5" />

      {/* Header Pipeline Status */}
      <rect x="18" y="18" width="60" height="8" rx="3" fill={primary} />
      <rect x="236" y="18" width="66" height="12" rx="4" fill={isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(16, 185, 129, 0.12)'} />
      <rect x="248" y="21" width="42" height="6" rx="2" fill={success} />

      {/* Left Input: CSV Stream Packet */}
      <rect x="20" y="46" width="94" height="148" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />
      <rect x="30" y="58" width="42" height="8" rx="2" fill={textMuted} />
      <rect x="30" y="74" width="74" height="6" rx="2" fill={primary} />
      <rect x="30" y="86" width="64" height="6" rx="2" fill={border} />
      <rect x="30" y="98" width="70" height="6" rx="2" fill={border} />
      <rect x="30" y="110" width="58" height="6" rx="2" fill={border} />
      <rect x="30" y="122" width="68" height="6" rx="2" fill={border} />
      <rect x="30" y="134" width="60" height="6" rx="2" fill={border} />
      <rect x="30" y="146" width="72" height="6" rx="2" fill={border} />
      <rect x="30" y="162" width="40" height="16" rx="4" fill={primary} />
      <rect x="38" y="167" width="24" height="6" rx="2" fill="#ffffff" />

      {/* Middle Transformation Connectors (flat flow arrows) */}
      <path d="M 124 90 L 146 90" stroke={primary} strokeWidth="2" strokeDasharray="3 3" />
      <polygon points="150,90 144,87 144,93" fill={primary} />

      <path d="M 124 130 L 146 130" stroke={accent} strokeWidth="2" strokeDasharray="3 3" />
      <polygon points="150,130 144,127 144,133" fill={accent} />

      {/* Right Output: Normalized 9-Column Matrix */}
      <rect x="156" y="46" width="144" height="148" rx="8" fill={bgSubtle} stroke={border} strokeWidth="1" />

      {/* Table Rows with Verification Badges */}
      <g transform="translate(166, 56)">
        <rect x="0" y="0" width="84" height="6" rx="2" fill={primary} />
        <circle cx="116" cy="3" r="4" fill={success} />
      </g>
      <line x1="156" y1="72" x2="300" y2="72" stroke={border} strokeWidth="1" />

      <g transform="translate(166, 80)">
        <rect x="0" y="0" width="68" height="5" rx="2" fill={textMuted} />
        <circle cx="116" cy="2.5" r="4" fill={success} />
      </g>
      <line x1="156" y1="94" x2="300" y2="94" stroke={border} strokeWidth="1" />

      <g transform="translate(166, 102)">
        <rect x="0" y="0" width="76" height="5" rx="2" fill={textMuted} />
        <circle cx="116" cy="2.5" r="4" fill={success} />
      </g>
      <line x1="156" y1="116" x2="300" y2="116" stroke={border} strokeWidth="1" />

      <g transform="translate(166, 124)">
        <rect x="0" y="0" width="62" height="5" rx="2" fill={textMuted} />
        <circle cx="116" cy="2.5" r="4" fill={success} />
      </g>
      <line x1="156" y1="138" x2="300" y2="138" stroke={border} strokeWidth="1" />

      <g transform="translate(166, 146)">
        <rect x="0" y="0" width="80" height="5" rx="2" fill={textMuted} />
        <circle cx="116" cy="2.5" r="4" fill={success} />
      </g>
      <line x1="156" y1="160" x2="300" y2="160" stroke={border} strokeWidth="1" />

      <rect x="166" y="170" width="92" height="12" rx="3" fill={isDark ? 'rgba(45, 212, 191, 0.15)' : 'rgba(13, 148, 136, 0.12)'} />
      <rect x="174" y="174" width="64" height="4" rx="2" fill={accent} />
    </svg>
  );
};
