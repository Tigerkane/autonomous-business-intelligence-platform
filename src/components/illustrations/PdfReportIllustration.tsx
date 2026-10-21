import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: PDF document with download badge
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const PdfReportIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const danger = '#ef4444';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Stacked Sheet Behind */}
      <rect x="75" y="35" width="160" height="170" rx="14" fill={raised} stroke={border} strokeWidth="1" />

      {/* Main Front PDF Sheet */}
      <g filter="drop-shadow(0 4px 10px rgba(0,0,0,0.15))">
        <rect x="90" y="45" width="145" height="155" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

        {/* Folded Corner */}
        <path d="M 195 45 L 235 85 L 195 85 Z" fill={raised} stroke={border} strokeWidth="1.5" />

        {/* PDF Badge */}
        <rect x="110" y="65" width="44" height="20" rx="6" fill={danger} />
        <text x="118" y="79" fontSize="11" fontWeight="800" fill="#ffffff" fontFamily="sans-serif">
          PDF
        </text>

        {/* Header Title Line */}
        <rect x="110" y="100" width="85" height="8" rx="3" fill={primary} />

        {/* Miniature Chart in Document */}
        <rect x="110" y="116" width="105" height="42" rx="6" fill={raised} stroke={border} strokeWidth="1" />
        <path d="M 115 146 L 135 136 L 155 142 L 180 126 L 205 132" stroke={primary} strokeWidth="2" strokeLinecap="round" />
        <rect x="118" y="148" width="8" height="6" rx="1" fill={border} />
        <rect x="138" y="142" width="8" height="12" rx="1" fill={border} />
        <rect x="158" y="146" width="8" height="8" rx="1" fill={border} />
        <rect x="178" y="132" width="8" height="22" rx="1" fill={primary} />
        <rect x="198" y="138" width="8" height="16" rx="1" fill={border} />

        {/* Bottom Report Text lines */}
        <rect x="110" y="166" width="90" height="5" rx="2" fill={muted} />
        <rect x="110" y="176" width="70" height="5" rx="2" fill={border} />

        {/* Floating Download Action Badge */}
        <circle cx="215" cy="180" r="22" fill={primary} />
        <path
          d="M 215 169 L 215 187 M 215 187 L 208 180 M 215 187 L 222 180"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
