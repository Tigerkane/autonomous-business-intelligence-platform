# ABIP — Autonomous Business Intelligence Platform

An enterprise-grade autonomous retail intelligence web platform built with **Next.js 16**, **React 19**, **TypeScript**, and **Tailwind CSS**. ABIP transforms raw retail transaction CSVs into clean verified data models, executive scorecards, category profit decompositions, multi-period stock recommendations, time-series forecasts, statistical anomaly detection, AI-powered natural-language query assistance, and publication-ready PDF reports.

---

## Key Features

### 1. Robust Ingestion & Data Quality Engine
- **Resilient Parsing**: RFC 4180 CSV parsing, automatic UTF-8 BOM stripping, and header fuzzy-matching (Levenshtein distance).
- **Strict Validation (43+ Error Checks)**:
  - Drops rows with negative amounts/quantities or duplicate transaction IDs.
  - Flags total amount mismatches ($\text{Total} \ne \text{Quantity} \times \text{Price}$), ages outside 0–120 years, non-standard date formats (`DD/MM/YYYY`), future transaction dates, and invalid gender values.
  - Implements grounded default rules: missing ages convert to `0`, blank categories convert to `Unknown`.
  - Supports explicit `unit_cost` ingestion and calculates row-level gross profit ($Total - Quantity \times UnitCost$); detects and flags cost-exceeds-price anomalies.
- **Granular Issue Tracker**: Real-time table displaying exact row numbers, severity levels (Error vs Warning), and context snippets with clean CSV export.

### 2. Executive Dashboard & Real-Time KPIs
- **Core Scorecards**: Immediate aggregation of Total Revenue, Total Units Sold, Average Basket Value, Total Gross Profit, and Profit Margin %.
- **Month-over-Month (MoM) Trajectory**: Month-by-month revenue curve with percentage delta indicators for Revenue, Order Volume, Units, and Basket Size.
- **Category Profit Breakdown & Scorecard**: Category-level revenue, gross profit, margin %, and order counts with unified category color tokens (**Electronics** `#6366f1`, **Clothing** `#10b981`, **Beauty** `#f59e0b`).
- **Demographic Profiling**: Customer demographic age distribution across standard generational brackets and compact gender volume split.

### 3. Automated Insights & Stock Recommendations
- **Multi-Period Horizon Analysis**: Aggregates sales and margins across Trailing 3 Months (`3m`), Quarterly (`quarter`), Half-Yearly (`half`), and Annual (`year`) windows.
- **YoY Seasonal Growth Adjustments**: Next-period forecast leveraging same-season historical growth (when $\ge 2$ full seasonal cycles exist) or linear regression baseline to prevent seasonal peak distortions.
- **Actionable Inventory Guidance**: Computes category-level stock action recommendations (*"Increase stock"*, *"Maintain stock"*, *"Optimize stock"*) based on projected demand velocity.
- **Dynamic Executive Headlines**: Automated narrative generation synthesizing period-over-period revenue momentum, top category growth drivers, and stock guidance.

### 4. Sales Analysis & Gender Breakdown
- **Sales Decomposition**: Detailed category-level metrics (orders, units, revenue, gross profit, margin %, and average basket).
- **Dedicated Gender Intelligence**: Multi-segment order volume, units, revenue, and average basket for Female, Male, and Unknown demographics.
- **Guarded Automated Insights**: Statistically guarded commentary that flags spending variances only when exceeding $\pm 25\%$ of the mean basket value.

### 5. Time-Series Forecasting & Anomaly Detection
- **Walk-Forward ML Forecasting**: Linear regression and rolling average baseline evaluated via Mean Absolute Percentage Error (MAPE) backtesting.
- **Daily Revenue Outliers**: Modified z-score residual detection on 31-day rolling median baseline windows ($|z| \ge 3.5$) with interactive sensitivity slider.
- **Unusual Transaction Radar**: Per-category Tukey Interquartile Range (IQR) fences ($2.0 \times \text{IQR}$) to identify high-value transaction anomalies without skewing premium product lines.

### 6. Deterministic Mathematical Solver & "Ask Your Data" AI
- **Deterministic Math Solver (Zero Hallucination)**:
  - High-performance in-memory calculation engine scanning **100% of transaction rows** with zero LLM hallucination, drift, or token costs.
  - Resolves natural language inquiries with verified statistical calculations:
    - **Sales & Revenue KPIs**: Total revenue, total units, transaction volumes, and average basket size.
    - **Category & Margin Rankings**: Best-selling product categories, weakest performers, gross margin %, and profitability.
    - **Customer Demographics**: Unique customer counts, demographic age distributions, and generational cohorts.
    - **Monthly Seasonality**: Peak and lowest grossing months, month-over-month trajectories, and velocity changes.
    - **Forecasting & Anomaly Spotting**: Walk-forward regression model predictions, MAPE backtest accuracy, and rolling median outlier dates.
    - **Gender Breakdown**: Volume, order count, and spending comparisons across Female, Male, and Unknown segments.
  - Verifiable mathematical receipts appended to every output: `Computed from N of N rows (100% scanned). No estimation or generated text.`
  - Works **100% offline** out-of-the-box without requiring any API keys, local daemon setups, or third-party accounts.
- **Pluggable LLM Integrations (Cloud & Local)**:
  - **Local Ollama**: Self-hosted local inference (`http://localhost:11434`, default `llama3.2`).
  - **Ollama Cloud**: Hosted cloud inference (`gpt-oss:120b`) with support for environment keys and in-browser session API key modal.
  - **Google Gemini & OpenAI**: Multi-provider adapters for cloud LLM APIs.
  - **Graceful Fallbacks**: Automatic fallback to the Deterministic Math Solver if external LLMs are unreachable or offline.

### 7. Interactive Landing Experience & Telemetry
- **Interactive Live Console**: Live retail sector presets (*Omnichannel Apparel*, *Consumer Tech*, *Fresh Grocery*) with interactive 2D SVG Line Charts and volume bars.
- **Walk-Forward Model Comparison**: Side-by-side Holt-Winters vs Linear Trend MAPE matrix.
- **Modern UI Polish**: Scroll-driven progress bar, section scroll reveal, marquee ticker, live telemetry console, and circular back-to-top floating control.

### 8. Executive PDF Reports
- **Server-Side Generation**: Built with `pdf-lib` without browser-headless dependencies.
- **High-Fidelity Document**: Multi-page report embedding vector branding, executive KPI scorecard, monthly trend breakdown, category profitability matrix, gender decomposition, and forecast projections.

### 9. Multi-User Security & Row-Level Security (RLS)
- **Supabase Authentication**: Secure user registration, sign-in, guest exploration, and session refresh via Next.js Proxy middleware.
- **Tenant Isolation**: Uploaded datasets and analytical caches are strictly isolated per authenticated user ID with Supabase Row-Level Security (RLS) policies.

---

## Full-Stack Next.js Architecture

ABIP is designed with a unified, monolithic architecture built entirely within **Next.js 16** — no external or separate backend service required:

- **Frontend (Client Layer)**:
  - **Next.js 16 App Router & React 19 Client Components**: Interactive single-page application views with zero-flash client routing.
  - **Tailwind CSS v4 & Harmonic Design Tokens**: Strict WCAG AA contrast compliance, responsive grid, and custom dark/light theme tokens.
  - **Dynamic 2D Visualizations**: Chart.js 4.5 (`react-chartjs-2`), custom SVG line/histogram charts, and Lucide icons.
  - **State Management**: Zero-latency React Contexts ([`AuthContext`](file:///home/shreyas/autonomous%20bi/src/contexts/AuthContext.tsx) and [`DataContext`](file:///home/shreyas/autonomous%20bi/src/contexts/DataContext.tsx)).

- **Backend (Server Layer)**:
  - **Next.js 16 Route Handlers (`app/api/*`)**: High-performance RESTful API endpoints running on the Node.js server runtime.
  - **Deterministic Mathematical Solver ([`server/llm.ts`](file:///home/shreyas/autonomous%20bi/server/llm.ts))**: Built-in zero-hallucination solver scanning 100% of rows directly in memory with exact calculation receipts.
  - **In-Memory Analytics & Forecast Engine ([`server/analytics.ts`](file:///home/shreyas/autonomous%20bi/server/analytics.ts))**: Linear regression, rolling baseline residuals, and Tukey IQR fences computed server-side.
  - **Automated Insights Engine ([`server/insights.ts`](file:///home/shreyas/autonomous%20bi/server/insights.ts))**: Multi-period sales aggregations and inventory stock recommendations.
  - **Data Cleaner & Validation Pipeline ([`server/cleaner.ts`](file:///home/shreyas/autonomous%20bi/server/cleaner.ts))**: Resilient RFC 4180 parsing, fuzzy header mapping, and 43+ error checks.
  - **PDF Generation ([`server/report.ts`](file:///home/shreyas/autonomous%20bi/server/report.ts))**: Server-side vector PDF generation using `pdf-lib`.
  - **AI / LLM Broker ([`server/llm.ts`](file:///home/shreyas/autonomous%20bi/server/llm.ts))**: Multi-provider inference broker (Local Ollama, Ollama Cloud, Gemini, OpenAI) with automatic deterministic fallback.
  - **Middleware & Security ([`proxy.ts`](file:///home/shreyas/autonomous%20bi/proxy.ts))**: Next.js proxy middleware for automatic Supabase auth token verification and session refreshes.

| Layer | Technologies | Role / Highlights |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16.4.2, React 19.0, Tailwind CSS v4 | App Router, responsive views, interactive live console |
| **Backend** | Next.js 16 Route Handlers (`app/api/*`), Node.js 20+ | REST API endpoints, validation pipeline, analytics engine |
| **Deterministic Solver**| In-memory TypeScript row scanner | Zero-hallucination mathematical proof solver for natural language questions |
| **Middleware** | Next.js Proxy (`proxy.ts`), Supabase SSR | Server-side authentication and session token refreshing |
| **Data Engine** | In-memory TypeScript, RFC 4180 parsing | Resilient data ingestion, 43+ quality checks, profit modeling |
| **Visualization**| Chart.js 4.5, react-chartjs-2, Lucide Icons | 2D vector charts, radar plots, harmonic theme tokens |
| **PDF Engine** | pdf-lib | Server-side vector PDF report compilation |
| **AI / LLM** | Deterministic Solver, Ollama, Gemini, OpenAI | Multi-provider query synthesis with offline fallbacks |
| **Auth & Storage**| Supabase Auth, Vercel Blob / Local Adapter | Multi-tenant isolation per UID with Row-Level Security |

---

## Project Structure

```
.
├── app/                             # Next.js App Router (Full-Stack Layout & API Routes)
│   ├── api/
│   │   ├── analysis/sales/          # Category sales & gender analysis
│   │   ├── anomalies/               # Daily anomalies & unusual transactions
│   │   │   └── transactions/        # Tukey IQR outlier transactions
│   │   ├── ask/                     # AI natural language query interface
│   │   ├── dashboard/               # Executive dashboard endpoints
│   │   │   ├── category-sales/      # Category sales & profit scorecard
│   │   │   ├── kpis/                # Aggregate KPI scorecard
│   │   │   ├── overview/            # High-level overview metrics
│   │   │   └── sales-trend/         # Monthly revenue trajectory
│   │   ├── data/                    # Dataset preview, status, sample, summary & template
│   │   ├── forecast/                # Time-series forecasting model
│   │   ├── health/                  # Server health check endpoint
│   │   ├── insights/                # Automated period analysis & stock recommendations
│   │   ├── llm/providers/           # Available LLM providers endpoint
│   │   ├── reports/generate/        # Server-side executive PDF generation
│   │   └── upload/                  # CSV ingestion and cleaning pipeline
│   ├── globals.css                  # Global Tailwind CSS and theme styles
│   ├── layout.tsx                   # Root HTML layout & fonts
│   └── page.tsx                     # Single-Page Application root (mounts App.tsx)
├── data/                            # Local storage directory for user-isolated datasets
├── lib/                             # Shared client/server utility modules
│   ├── supabase/
│   │   ├── client.ts                # Supabase browser client
│   │   └── server.ts                # Supabase server client
│   └── user.ts                      # User authentication & tenant ID resolution
├── proxy.ts                         # Next.js SSR middleware for Supabase session refresh
├── public/                          # Static assets, logos showcase & favicons
├── scripts/                         # Maintenance and route patching scripts
├── server/                          # Server-side analytics, data cleaning & ML engine
│   ├── analytics.ts                 # Aggregations, forecasting, anomalies, gender logic
│   ├── cleaner.ts                   # RFC 4180 parser, fuzzy header mapping, validation engine
│   ├── db.ts                        # Storage adapter (Local dev & Vercel Blob with UID isolation)
│   ├── insights.ts                  # Period aggregations, stock guidance & headline generation
│   ├── llm.ts                       # Deterministic Math Solver (zero-hallucination) & LLM broker
│   ├── quality.ts                   # Data quality assessment and validation issues tracker
│   ├── report.ts                    # High-fidelity vector PDF report builder
│   └── types.ts                     # Server-side domain types & interfaces
├── src/                             # Client-side React 19 application
│   ├── api/
│   │   └── index.ts                 # Unified client API facade with mock data toggle
│   ├── components/                  # Modular UI component library
│   │   ├── auth/                    # AuthModal.tsx (Sign-in, registration, visual CAPTCHA)
│   │   ├── common/                  # BrandLogo, EmptyState, GithubIcon, RemoveDataModal
│   │   ├── dashboard/               # InsightsPanel, InteractiveLiveConsole
│   │   ├── illustrations/           # Original 2D flat vector SVG illustrations
│   │   └── layout/                  # HeaderNav, Navbar, Sidebar
│   ├── contexts/                    # React Contexts (AuthContext.tsx, DataContext.tsx)
│   ├── design/
│   │   └── tokens.ts                # Centralized design system tokens (colors, radii, spacing)
│   ├── views/                       # Single-page application views
│   │   ├── AskYourDataView.tsx      # Natural language conversational analyst
│   │   ├── AuthView.tsx             # Authentication and CAPTCHA modal
│   │   ├── DashboardView.tsx        # Executive KPIs, profit scorecard & trajectory
│   │   ├── ErrorView.tsx            # Error boundary and fallback display
│   │   ├── ForecastAnomaliesView.tsx# Forecasting model & anomaly radar
│   │   ├── HomepageView.tsx         # Modern landing page & interactive live console
│   │   ├── ReportsView.tsx          # PDF report generator & preview
│   │   ├── SalesAnalysisView.tsx    # Category sales & gender breakdown
│   │   ├── SettingsView.tsx         # User settings & configuration
│   │   └── UploadDatasetView.tsx    # CSV drag-and-drop & data quality issue tracker
│   ├── App.tsx                      # Central single-page view router & orchestrator
│   ├── index.css                    # Design system styling & custom token utilities
│   └── types.ts                     # Frontend domain interfaces & types
├── supabase/                        # Database schemas and security rules
│   └── schema.sql                   # Supabase PostgreSQL DDL with RLS policies
├── tests/                           # Comprehensive automated test suite (87 tests)
│   ├── fixtures/                    # Clean, dirty, and anomaly benchmark CSV datasets
│   ├── cleaner.test.ts              # Data validation rules & quality unit tests (20 tests)
│   ├── analytics.test.ts            # Mathematical benchmarks against reference data (38 tests)
│   ├── insights.test.ts             # Period analysis & stock recommendation tests (15 tests)
│   ├── e2e_pipeline.test.ts         # Ingestion, hydration & tenant isolation tests (14 tests)
│   └── run-all.ts                   # Master test runner
├── DESIGN.md                        # Design system & WCAG AA tokens specification
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Scripts & dependencies
└── tsconfig.json                    # TypeScript configuration
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.0.0` or higher
- **npm**: `v10.0.0` or higher
- (Optional) **Ollama**: running locally on `http://localhost:11434` for offline local LLM features
- (Optional) **Supabase Project**: for cloud authentication and RLS persistence

### Installation

```bash
# Clone the repository
git clone https://github.com/Tigerkane/autonomous-business-intelligence-platform.git
cd autonomous-business-intelligence-platform

# Install dependencies
npm install
```

### Environment Configuration

Create a local `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your variables as needed:

```ini
# Application URL
APP_URL="http://localhost:3000"

# Supabase Authentication & Database (Optional for local guest mode)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Storage Backend (local for development, blob for Vercel production)
STORAGE_BACKEND="local"

# LLM Provider Configuration ("deterministic" | "ollama" | "ollama_cloud" | "gemini" | "openai")
LLM_PROVIDER="deterministic"
LLM_BASE_URL="http://localhost:11434"
LLM_MODEL="llama3.2"

# Optional Hosted Provider Keys
OLLAMA_API_KEY=""
LLM_API_KEY=""
# GEMINI_API_KEY=""
# OPENAI_API_KEY=""
```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Reference

The Next.js App Router exposes a full suite of typed REST API endpoints:

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Health check returning service status, timestamp, and version |
| `/api/upload` | `POST` | Uploads and sanitizes CSV dataset with full validation report |
| `/api/data/status` | `GET` | Returns dataset loading state and record counts for active user |
| `/api/data/preview` | `GET` | Fetches paginated rows from the current cleaned dataset |
| `/api/data/sample` | `POST` | Loads built-in 1,000-row retail benchmark dataset |
| `/api/data/template` | `GET` | Downloads canonical sample CSV template |
| `/api/dashboard/kpis` | `GET` | Aggregated executive KPIs (Revenue, Units, Basket, Profit, Margin) |
| `/api/dashboard/overview` | `GET` | High-level summary with demographic and category splits |
| `/api/dashboard/sales-trend`| `GET` | Monthly revenue trajectory and period trend deltas |
| `/api/dashboard/category-sales` | `GET` | Category sales breakdown with profit and margin calculations |
| `/api/analysis/sales` | `GET` | In-depth category performance and gender decomposition |
| `/api/insights` | `GET` | Multi-period horizon analysis (`3m`, `quarter`, `half`, `year`) and inventory recommendations |
| `/api/forecast` | `GET` | Time-series regression projection and MAPE accuracy score |
| `/api/anomalies` | `GET` | Daily revenue anomalies based on rolling median baseline |
| `/api/anomalies/transactions` | `GET` | Unusual transactions identified via per-category Tukey IQR |
| `/api/ask` | `POST` | Natural language question answering via LLM or deterministic solver |
| `/api/llm/providers` | `GET` | Lists available LLM providers and configuration status |
| `/api/reports/generate` | `POST` | Generates and streams downloadable executive PDF report |

---

## Automated Test Suite

ABIP features an end-to-end automated test suite verifying mathematical accuracy, error detection, period projections, and multi-user data isolation.

To run the complete test suite:

```bash
npm test
```

### Test Coverage Summary (87 Tests Passed)

```
====================================================
   ABIP (Autonomous BI Platform) Automated Test Suite
====================================================

--- Running Data Cleaner & Validation Tests (20 tests) ---
  ✓ Clean CSV yields exactly 1,000 rows
  ✓ Clean CSV has 0 rows dropped and 0 error-level issues
  ✓ Dirty CSV: catches and drops 3 duplicate transaction IDs
  ✓ Dirty CSV: catches and drops 6 negative quantity/amount rows
  ✓ Dirty CSV keeps 991 valid rows (9 dropped for fatal errors)
  ✓ Issue tracker flags 8 total amount mismatches (Total != Qty * Price)
  ✓ Issue tracker flags 5 Age values outside 0–120 years
  ✓ Issue tracker flags 5 non-standard date formats (DD/MM/YYYY)
  ✓ Issue tracker flags 4 future transaction dates
  ✓ Issue tracker flags 2 invalid gender values
  ✓ Blank Age values converted to 0
  ✓ Blank Product Category converted to Unknown (3 rows)
  ✓ Cost column parsing, fallback unit cost, and profit computation
  ✓ Triggers warning when Unit Cost exceeds Price per Unit

--- Running Analytics & Benchmark Tests (38 tests) ---
  ✓ Total revenue matches exactly: ₹3,03,025
  ✓ Total units matches exactly: 2,507 | Average basket: ₹303
  ✓ Total profit and profit margins computed and positive
  ✓ Unique customers: 369 | Average age: 40.6
  ✓ Category Revenue: Electronics (₹2,03,700), Clothing (₹61,715), Beauty (₹37,610)
  ✓ Category Profit: Computed and positive across all product categories
  ✓ Monthly Trajectory: Jan (₹46,455), Feb (₹50,830), Mar (₹52,140), Apr (₹47,645), May (₹50,400), Jun (₹55,555)
  ✓ Jun vs May Trends: Revenue (+10.2%), Orders (-3.3%), Units (+1.2%), Basket (+14%)
  ✓ Next Month Forecast: ₹51,200
  ✓ Daily revenue anomalies on clean CSV: 0
  ✓ Unusual transactions on clean CSV: 16 (all Beauty, ₹400)
  ✓ Anomaly CSV: Exactly 5 daily revenue anomalies on expected dates (2026-02-10, 03-25, 04-20, 05-22, 06-15)
  ✓ Gender Analysis: Female (496 orders, 1,246 units, ₹1,51,150), Male (504 orders, 1,261 units, ₹1,51,875)
  ✓ Guarded gender insight: Flags "Spending is similar across genders."

--- Running Period Analysis & Stock Recommendation Tests (15 tests) ---
  ✓ Multi-period windows: 3-month, quarterly, half-yearly, annual aggregation
  ✓ Period forecasts non-negative and bounded within dataset totals
  ✓ Distinct projections for trailing 3-month vs quarterly cycles
  ✓ Top stock recommendation aligns with highest forecast revenue
  ✓ Category inventory action boundaries (at most one "Increase stock" action)
  ✓ Executive dynamic headline narrative generation

--- Running End-to-End Pipeline & Storage Tests (14 tests) ---
  ✓ Pipeline ingestion: CSV parsed into 1,000 structured rows
  ✓ Atomic database write: User A dataset saved and verified
  ✓ Row-Level Security: User B has NO dataset access (strict tenant isolation)
  ✓ Hydration: Stored rows correctly populate overview, sales, gender, and forecast metrics
  ✓ Dataset deletion: User A dataset purged cleanly
====================================================
TEST RUN FINISHED in ~0.6s
Total tests: 87 | Passed: 87 | Failed: 0
====================================================
```

---

## Production Build & Quality Checks

Run TypeScript type checks and produce the production Next.js build:

```bash
# Type check without emitting files
npm run lint

# Compile production bundle
npm run build

# Start production server
npm run start
```

---

## Deployment Guide (Vercel + Supabase)

### 1. Supabase Setup
1. In your Supabase project dashboard, open the **SQL Editor**.
2. Run the database script located at [`supabase/schema.sql`](file:///home/shreyas/autonomous%20bi/supabase/schema.sql).
3. Confirm Row-Level Security (RLS) is enabled.
4. Under **Authentication $\to$ URL Configuration**, add your production domain to the redirect allowlist (`https://<your-domain>/` and `https://<your-domain>/auth/callback`).

### 2. Vercel Configuration
1. Import the repository into Vercel.
2. In **Project Settings $\to$ Environment Variables**, configure:
   - `APP_URL`: Your production domain (`https://<your-app>.vercel.app`)
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (strictly server-side)
   - `STORAGE_BACKEND`: `blob`
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob read/write token
   - `LLM_PROVIDER`: `deterministic` (default) or `ollama_cloud` / `gemini` / `openai`
   - `OLLAMA_API_KEY` or `GEMINI_API_KEY`: API keys for hosted LLM access
3. Deploy the project. The Next.js App Router and edge middleware will automatically configure SSR session handling.

---

## Design System

The frontend adheres to the **ABIP Design Constitution** documented in [`DESIGN.md`](file:///home/shreyas/autonomous%20bi/DESIGN.md):
- **Contrast**: 100% WCAG AA compliant (14.2:1 light text contrast, 15.5:1 dark mode text contrast).
- **Color Palettes**: Harmonic light canvas (`#f8fafc`) and obsidian midnight dark canvas (`#060b19`).
- **Typography & Geometry**: Strict 4px harmonic spatial grid, 2D flat rounded rectangles, and tabular numeral alignment for financial figures.
- **Illustrations**: Original, lightweight, theme-aware 2D SVG vector illustrations (< 3 KB each with zero external dependencies).

---

## License

This project is licensed under the MIT License.
