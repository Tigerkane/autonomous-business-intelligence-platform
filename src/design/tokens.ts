/**
 * Design Tokens
 * Visual Identity: Confident, calm, analytical, dark-first with complete light theme.
 * All colors adhere to WCAG AA contrast standards.
 */

export const tokens = {
  colors: {
    dark: {
      background: '#0f172a', // Deep slate canvas
      surface: '#1e293b',    // Card / container surface
      raised: '#273449',     // Elevated / hover surface
      border: '#334155',     // Structural 1px border
      borderSubtle: '#1e293b',
      text: '#e2e8f0',       // Primary readable text (13.8:1 contrast on #0f172a)
      muted: '#94a3b8',      // Secondary text (5.5:1 contrast - WCAG AA)
      subtle: '#64748b',     // Captions & timestamps
      primary: '#6366f1',    // Indigo primary
      primaryHover: '#4f46e5',
      primarySoft: '#818cf8',
      primaryGlow: '0 0 16px -2px rgba(99, 102, 241, 0.45)',
      success: '#22c55e',    // Emerald success
      successSurface: 'rgba(34, 197, 94, 0.12)',
      warning: '#f59e0b',    // Amber warning
      warningSurface: 'rgba(245, 158, 11, 0.12)',
      danger: '#ef4444',     // Crimson danger / anomaly
      dangerSurface: 'rgba(239, 68, 68, 0.12)',
      info: '#38bdf8',       // Sky blue info
      infoSurface: 'rgba(56, 189, 248, 0.12)',
    },
    light: {
      background: '#f8fafc', // Crisp daylight canvas
      surface: '#ffffff',    // Pure white cards
      raised: '#f1f5f9',     // Slate-100 hover
      border: '#e2e8f0',     // Slate-200 border
      borderSubtle: '#f1f5f9',
      text: '#0f172a',       // Slate-900 primary (14.2:1 contrast)
      muted: '#64748b',      // Slate-500 secondary (4.6:1 contrast)
      subtle: '#94a3b8',     // Slate-400 caption
      primary: '#4f46e5',    // Indigo-600
      primaryHover: '#4338ca',
      primarySoft: '#6366f1',
      primaryGlow: '0 0 16px -2px rgba(79, 70, 229, 0.35)',
      success: '#16a34a',    // Green-600
      successSurface: '#f0fdf4',
      warning: '#d97706',    // Amber-600
      warningSurface: '#fffbeb',
      danger: '#dc2626',     // Red-600
      dangerSurface: '#fef2f2',
      info: '#0284c7',       // Sky-600
      infoSurface: '#f0f9ff',
    },
  },

  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    tabularNums: 'tabular-nums font-mono',
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
    elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px -3px rgba(99, 102, 241, 0.45)',
  },
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Electronics: '#6366f1',        // Indigo
  Clothing: '#10b981',           // Emerald
  Beauty: '#f59e0b',             // Amber
  'Home & Kitchen': '#06b6d4',   // Cyan
  Home: '#06b6d4',
  Kitchen: '#06b6d4',
  Sports: '#8b5cf6',             // Purple
  'Sports & Outdoors': '#8b5cf6',
  Books: '#ec4899',              // Pink
  Stationery: '#ec4899',
  Toys: '#f43f5e',               // Rose
  Automotive: '#64748b',         // Slate
  Grocery: '#84cc16',            // Lime
  Health: '#14b8a6',             // Teal
  Jewelry: '#d946ef',            // Fuchsia
};

export const FALLBACK_CATEGORY_PALETTE = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f43f5e',
  '#84cc16',
  '#d946ef',
  '#3b82f6',
];

export const GENDER_COLORS: Record<string, string> = {
  Male: '#6366f1',
  Female: '#ec4899',
  Unknown: '#64748b',
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCategoryColor(category: string, _index?: number): string {
  const trimmed = (category || '').trim();
  if (!trimmed) return '#94a3b8';

  const direct = CATEGORY_COLORS[trimmed];
  if (direct) return direct;

  const lower = trimmed.toLowerCase();
  for (const [key, color] of Object.entries(CATEGORY_COLORS)) {
    if (key.toLowerCase() === lower) return color;
  }

  // Deterministic color assignment so the same category ALWAYS gets the exact same color
  // across Executive Dashboard, Forecast & Anomalies, and Sales Analysis
  const hash = hashString(lower);
  return FALLBACK_CATEGORY_PALETTE[hash % FALLBACK_CATEGORY_PALETTE.length];
}

export function getGenderColor(gender: string): string {
  const trimmed = (gender || '').trim();
  const direct = GENDER_COLORS[trimmed];
  if (direct) return direct;

  const lower = trimmed.toLowerCase();
  for (const [key, color] of Object.entries(GENDER_COLORS)) {
    if (key.toLowerCase() === lower) return color;
  }
  return GENDER_COLORS.Unknown;
}
