# Frontend Design Constitution & Architecture Specification

A flat, 2D, illustration-led frontend architecture designed for the Autonomous Retail Business Intelligence Platform. Built with React, TypeScript, Tailwind CSS, and strict WCAG AA contrast rules.

---

## 1. Design Tokens (`src/design/tokens.ts`)

All visual styling adheres to centralized design tokens without hard-coded color values:

| Token Category | Values / Scale | Purpose |
| :--- | :--- | :--- |
| **Colors (Light)** | Canvas: `#f8fafc`, Surface: `#ffffff`, Border: `#e2e8f0`, TextPrimary: `#0f172a` (14.2:1 contrast), Primary: `#4338ca` (6.2:1), Accent: `#0d9488`, Warning: `#b45309`, Danger: `#be123c`, Success: `#15803d` | Daytime crisp readability (100% WCAG AA compliant) |
| **Colors (Dark)** | Canvas: `#060b19`, Surface: `#0d1527`, Border: `#1e293b`, TextPrimary: `#f8fafc` (15.5:1 contrast), Primary: `#818cf8` (7.1:1), Accent: `#2dd4bf`, Danger: `#fb7185` | Deep Obsidian Midnight palette with optical weight balance |
| **Radii** | `xs: 4px`, `sm: 6px`, `md: 8px`, `lg: 12px`, `xl: 16px`, `pill: 9999px` | Strict 2D rounded rectangle rules |
| **Spacing** | 4px harmonic grid (`4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `48px`, `64px`) | Consistent spatial hierarchy |
| **Typography** | `caption: 11px`, `bodySmall: 12px`, `body: 14px`, `bodyLarge: 16px`, `headingSmall: 18px`, `headingMedium: 24px`, `display: 44px` | Strict scale with tabular numerals for data alignment |
| **Shadows** | `subtle`, `card`, `elevated`, `focus` | 2D soft flat elevation, no heavy or skeuomorphic drop shadows |

---

## 2. Component Inventory

The frontend layout is modular and componentized:

1. **`InteractiveLiveConsole.tsx`**:
   - The interactive centerpiece of the landing experience.
   - Live Retail Sector Tabs (*Omnichannel Apparel*, *Consumer Tech*, *Fresh Grocery*).
   - Interactive 2D SVG Line Chart with histogram volume bars and hover point inspections.
   - Interactive Anomaly Sensitivity Slider (MAD z-score range from 2.5σ to 4.5σ).
   - Walk-Forward Model Comparison Matrix (Holt-Winters vs Linear Trend with MAPE error).
   - Natural Language Query Terminal with grounded answer synthesis.
   - Visibly labelled: `Sample data · Live interactive engine`.

2. **`HomepageView.tsx`**:
   - Flat 2D vector hero presentation.
   - 4-Pillar Analytical Architecture tabs (Ingestion Gate, Walk-Forward ML, Outlier Radar, Natural Language AI).
   - Project Team Section: **Shreyas Mogalapalli**, **Saniya**, **Shlok**, **Navya** with full role titles visible and no clipping.

3. **`Sidebar.tsx` & `Navbar.tsx`**:
   - Full workspace navigation with responsive mobile drawer.
   - Account menu with single centralized Log Out action.

4. **`AuthModal.tsx`**:
   - Pure login and registration with interactive 5-character visual CAPTCHA verification.
   - Automatic role assignment.
   - Automatic redirect to Sign In upon registration.

---

## 3. Original 2D Flat SVG Illustrations

All illustrations are written as standalone, theme-aware React SVG components (< 3 KB each, zero external image assets, `aria-hidden="true"`):

1. **`HeroAnalyticsIllustration.tsx`** (~2.8 KB):
   - 2D multi-layer console frame depicting real-time analytics curves, confidence intervals, anomaly flags, and mini donut breakdown.
2. **`DataIngestionIllustration.tsx`** (~2.2 KB):
   - 2D vector graphic showing incoming multi-format CSV packets passing through streaming sanitization into a verified 9-column matrix.
3. **`ForecastingIllustration.tsx`** (~2.1 KB):
   - 2D vector diagram of walk-forward backtesting showing historical training segments, projection corridors, and confidence boundaries.
4. **`OutlierRadarIllustration.tsx`** (~2.3 KB):
   - 2D bell curve displaying median absolute deviation (MAD) cutoffs with inliers and flagged outlier anomalies outside the 3.5σ threshold.

---

## 4. How to Wire the Real Backend API

All network requests flow strictly through a single module: `src/api/index.ts`.

To switch the entire application from sample mock data to your live Express backend:

1. Open `src/api/index.ts`.
2. Toggle the `USE_MOCK` boolean flag:
   ```typescript
   // Change from:
   export const USE_MOCK: boolean = true;

   // To:
   export const USE_MOCK: boolean = false;
   ```
3. The API client will automatically direct requests to the Express `/api/*` endpoints (`/api/data/status`, `/api/data/sectors/:id`, `/api/ask`, `/api/upload`, etc.) without needing to change a single line of UI component code.
