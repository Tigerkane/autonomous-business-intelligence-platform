import React from 'react';

interface Props {
  className?: string;
  theme?: 'dark' | 'light';
}

/**
 * 2D Flat Illustration: CSV file with upload arrow
 * ViewBox: 0 0 320 240, under 3 KB, theme-aware.
 */
export const CsvUploadIllustration: React.FC<Props> = ({
  className = 'w-full h-auto',
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const bg = isDark ? '#1e293b' : '#ffffff';
  const raised = isDark ? '#273449' : '#f1f5f9';
  const border = isDark ? '#334155' : '#e2e8f0';
  const primary = isDark ? '#6366f1' : '#4f46e5';
  const success = '#22c55e';
  const muted = isDark ? '#94a3b8' : '#64748b';

  return (
    <svg
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Drop Zone Plate */}
      <rect x="35" y="25" width="250" height="190" rx="16" fill={raised} stroke={border} strokeWidth="1.5" strokeDasharray="6 6" />

      {/* Main CSV Document Card */}
      <g filter="drop-shadow(0 4px 8px rgba(0,0,0,0.12))">
        <rect x="85" y="45" width="150" height="150" rx="14" fill={bg} stroke={border} strokeWidth="1.5" />

        {/* Folded Corner Accent */}
        <path d="M 195 45 L 235 85 L 195 85 Z" fill={raised} stroke={border} strokeWidth="1.5" strokeLinejoin="round" />

        {/* CSV Badge Header */}
        <rect x="105" y="65" width="46" height="20" rx="6" fill={primary} />
        <text x="113" y="80" fontSize="11" fontWeight="800" fill="#ffffff" fontFamily="sans-serif">
          CSV
        </text>

        {/* Mock Spreadsheet Rows */}
        <rect x="105" y="100" width="105" height="6" rx="3" fill={muted} />
        <rect x="105" y="114" width="85" height="6" rx="3" fill={border} />
        <rect x="105" y="128" width="95" height="6" rx="3" fill={border} />
        <rect x="105" y="142" width="75" height="6" rx="3" fill={border} />

        {/* Floating Upload Arrow Badge */}
        <circle cx="160" cy="170" r="24" fill={success} />
        <path
          d="M 160 180 L 160 160 M 160 160 L 152 168 M 160 160 L 168 168"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};
