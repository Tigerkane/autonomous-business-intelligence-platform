/**
 * Design Tokens
 * Visual Identity: Graphite ramp, instrument-grade, high analytical contrast.
 * Derived per unslop guidelines: neutral chrome, deliberate accent, tabular figures.
 */

export const tokens = {
  colors: {
    dark: {
      background: '#000000', // Pitch black canvas
      surface: '#0f0f10',    // Card surface
      raised: '#19191b',     // Elevated / hover surface
      border: 'rgba(255, 255, 255, 0.08)', // Hairline border
      borderSubtle: 'rgba(255, 255, 255, 0.05)',
      text: '#ededed',       // Primary readable text
      muted: '#a1a1a6',      // Secondary text
      subtle: '#85858b',     // Captions & timestamps
      primary: '#6366f1',    // Indigo accent
      primaryHover: '#4f46e5',
      primarySoft: '#818cf8',
      primaryGlow: 'none',
      success: '#4cc38a',    // Semantic success
      successSurface: 'rgba(76, 195, 138, 0.12)',
      warning: '#f59e0b',    // Semantic warning
      warningSurface: 'rgba(245, 158, 11, 0.12)',
      danger: '#e5484d',     // Semantic danger / anomaly
      dangerSurface: 'rgba(229, 72, 77, 0.12)',
      info: '#38bdf8',       // Sky blue info
      infoSurface: 'rgba(56, 189, 248, 0.12)',
    },
    light: {
      background: '#fafafa', // Crisp graphite daylight canvas
      surface: '#ffffff',    // White cards
      raised: '#f4f4f5',     // Raised hover
      border: '#e5e5e5',     // Hairline border
      borderSubtle: '#f0f0f0',
      text: '#171717',       // Slate-950 primary
      muted: '#525252',      // Neutral-600 secondary
      subtle: '#737373',     // Neutral-500 caption
      primary: '#4f46e5',    // Indigo primary
      primaryHover: '#4338ca',
      primarySoft: '#6366f1',
      primaryGlow: 'none',
      success: '#16a34a',    // Green success
      successSurface: '#f0fdf4',
      warning: '#d97706',    // Amber warning
      warningSurface: '#fffbeb',
      danger: '#dc2626',     // Red danger
      dangerSurface: '#fef2f2',
      info: '#0284c7',       // Sky info
      infoSurface: '#f0f9ff',
    },
  },

  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontDisplay: '"Space Grotesk", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    tabularNums: 'tabular-nums font-mono',
  },

  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    card: '0 1px 2px rgba(0, 0, 0, 0.04)',
    elevated: '0 4px 12px rgba(0, 0, 0, 0.06)',
    glow: 'none',
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
