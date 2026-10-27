# ABIP — Autonomous Business Intelligence Platform

An enterprise-grade autonomous retail intelligence web platform built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. ABIP transforms raw retail transaction CSVs into clean data models, executive scorecards, sales decompositions, time-series forecasts, anomaly detections, AI natural-language querying, and PDF reports.

---

## Key Features

1. **Robust Ingestion & Quality Validation**
   - Ingests retail CSV datasets with resilient RFC 4180 parsing, UTF-8 BOM stripping, and header fuzzy-matching (Levenshtein distance).
   - Strict validation catching 43+ error types: negative amounts, duplicate transaction IDs, age constraints (0–120), future transaction dates, non-standard date formats, and total mismatches ($Total \ne Quantity \times Price$).
   - Granular issue tracker highlighting exact row numbers and context snippets.

2. **Executive Dashboard & KPIs**
   - Real-time aggregation of Total Sales, Total Quantity, Average Basket, and Customer demographics.
   - Month-over-Month (MoM) trajectory with percentage delta trends.
   - Demographic distribution by age brackets and compact Male vs Female customer split.

3. **Sales Analysis & Gender Breakdown**
   - Unified category color tokens: **Electronics** (`#6366f1`), **Clothing** (`#10b981`), and **Beauty** (`#f59e0b`).
   - Dedicated **Gender Analysis**: order volumes, unit counts, revenue, average basket, and grouped category matrix for Female, Male, and Unknown.
   - Guarded automated insights: flags spending variations only when statistically significant ($> 25\%$ of mean basket).

4. **Forecasting & Anomaly Detection**
   - Time-series linear regression with lowest MAPE model selection and rolling average baseline.
   - **Daily Revenue Anomalies**: modified z-score residual detection on 31-day rolling median windows ($|z| \ge 3.5$).
   - **Unusual Transactions**: per-category Tukey IQR fences ($2.0 \times \text{IQR}$) to isolate statistical anomalies without penalizing premium categories.

5. **Ask Your Data (Configurable AI Analyst)**
   - Configurable LLM integration supporting **Ollama** (local), **Google Gemini**, and **OpenAI**.
   - Graceful offline fallback states when local LLM servers are unreachable.

6. **Executive PDF Reports**
   - High-fidelity downloadable PDF generated using `pdf-lib` with embedded vector brand identity, KPI scorecard, category metrics, gender decomposition, and forecasting summary.

7. **Multi-User Security & Row-Level Security (RLS)**
   - Supabase Auth authentication (Signup, Login, Session Refresh via Next.js Proxy middleware).
   - Datasets isolated per user ID with Row Level Security (RLS) policies.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.4.2 (App Router & Turbopack), React 19 |
| **Styling** | Tailwind CSS v4, Vanilla CSS Design System Tokens |
| **Visualization** | Chart.js 4.5, react-chartjs-2, Lucide Icons |
| **PDF Generation** | pdf-lib |
| **Auth & Storage** | Supabase Auth (`@supabase/ssr`), Vercel Blob / Local Storage Adapter |
| **Language & Tooling** | TypeScript 5.8+, TSX, Node.js 20+ |

---

## Project Structure

```
.
├── app/                        # Next.js App Router (Layout & API routes)
│   ├── api/
│   │   ├── analysis/sales/     # Sales & gender analytics route
│   │   ├── anomalies/          # Daily anomalies & unusual transactions
│   │   ├── ask/                # AI natural-language query route
│   │   ├── dashboard/          # KPI & overview routes
│   │   ├── forecast/           # Forecasting model route
│   │   ├── reports/generate/   # PDF report generator
│   │   └── upload/             # Ingestion & cleaning route
│   └── page.tsx                # SPA entry point
├── proxy.ts                    # Next.js SSR middleware for Supabase session refresh
├── server/                     # Core business logic & analytics engine
│   ├── analytics.ts            # Aggregations, forecasting, anomalies, gender logic
│   ├── cleaner.ts              # CSV parser, validation issue tracker, and data cleaner
│   ├── db.ts                   # Storage adapter (local dev + Vercel Blob with user isolation)
│   ├── llm.ts                  # Multi-provider LLM adapter (Ollama, Gemini, OpenAI)
│   └── report.ts               # Server-side PDF report builder
├── src/                        # UI Components and views
│   ├── components/             # Reusable UI components (Sidebar, Navbar, Modals, Branding)
│   ├── contexts/               # React Contexts (AuthContext, DataContext)
│   ├── design/                 # Design tokens (colors, currency formatters, spacing)
│   └── views/                  # View pages (Dashboard, Sales, Forecast, Reports, etc.)
├── supabase/                   # Supabase SQL schema & RLS policies
│   └── schema.sql              # Database DDL with RLS policies
├── tests/                      # Automated test suite
│   ├── fixtures/               # Clean, dirty, and anomaly benchmark CSV files
│   ├── cleaner.test.ts         # Validation rules and cleaner unit tests
│   ├── analytics.test.ts       # Mathematical benchmarks against reference values
│   ├── e2e_pipeline.test.ts    # End-to-end ingestion and database isolation tests
│   └── run-all.ts              # Master test runner
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js**: v20 or newer
- **npm**: v10 or newer
- (Optional) **Ollama**: running locally on `http://localhost:11434` for AI features
- (Optional) **Supabase Project**: for cloud authentication and RLS persistence

### Installation

```bash
git clone https://github.com/Tigerkane/autonomous-business-intelligence-platform.git
cd autonomous-business-intelligence-platform
npm install
```

### Environment Configuration

Create a local `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Key environment variables:

```ini
# Supabase Configuration (Optional for cloud auth/storage; local dev fallback enabled)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Storage Backend (local for development, blob for Vercel production)
STORAGE_BACKEND=local

# LLM Provider Configuration (ollama | gemini | openai)
LLM_PROVIDER=ollama
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2
# Optional API Keys for cloud LLMs:
# GEMINI_API_KEY=your-gemini-key
# OPENAI_API_KEY=your-openai-key
```

### Running Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the platform.

---

## Automated Test Suite

ABIP includes a test suite that runs against reference benchmark CSV datasets (`abip_sales_clean.csv`, `abip_sales_dirty.csv`, and `abip_sales_anomaly_test.csv`).

To execute all tests:

```bash
npm test
```

### What is verified:

1. **Cleaner & Ingestion Tests (`tests/cleaner.test.ts`)**:
   - Clean dataset: 1,000 valid rows, 0 dropped rows, 0 errors.
   - Dirty dataset: Successfully catches and identifies all 43 injected errors:
     - 6 negative quantity/amount errors (dropped)
     - 3 duplicate transaction IDs (dropped)
     - 8 total mismatch warnings ($Total \ne Quantity \times Price$)
     - 5 age out of bounds (outside 0–120 years)
     - 5 non-standard date format warnings (e.g. `DD/MM/YYYY`)
     - 4 future transaction dates
     - 2 invalid gender values
     - Ground rules: 6 blank ages converted to 0; 3 blank categories converted to `Unknown`.

2. **Analytics & Math Benchmarks (`tests/analytics.test.ts`)**:
   - Total Sales: ₹3,03,025 | Total Units: 2,507 | Average Basket: ₹303
   - Unique Customers: 369 | Average Age: 40.6
   - Category Breakdown: Electronics (₹2,03,700), Clothing (₹61,715), Beauty (₹37,610)
   - Monthly Revenue: Jan (₹46,455), Feb (₹50,830), Mar (₹52,140), Apr (₹47,645), May (₹50,400), Jun (₹55,555)
   - Trends: Jun vs May Revenue (+10.2%), Orders (-3.3%), Units (+1.2%), Basket (+14%)
   - Next Month Forecast: ₹51,200
   - Anomalies on Clean: 0 daily revenue anomalies, 16 unusual transactions (all Beauty, ₹400)
   - Anomalies on Anomaly Test CSV: Exactly 5 daily revenue anomalies on `2026-02-10`, `2026-03-25`, `2026-04-20`, `2026-05-22`, `2026-06-15`.
   - Gender Analysis: Female (496 orders, 1,246 units, ₹1,51,150), Male (504 orders, 1,261 units, ₹1,51,875). Insight: "Spending is similar across genders."

3. **End-to-End Pipeline & Security (`tests/e2e_pipeline.test.ts`)**:
   - Ingestion $\to$ Clean $\to$ Atomic user database write $\to$ Hydration $\to$ Analytics verification.
   - Strict user data isolation: User B cannot access User A's uploaded dataset.

---

## Production Build & Linting

Verify type safety and compile the production bundle:

```bash
# Type check with TypeScript compiler
npm run lint

# Production build
npm run build
```

---

## Deployment Checklist

When deploying to production (e.g., **Vercel**):

1. **Environment Variables**:
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Set `SUPABASE_SERVICE_ROLE_KEY` (kept strictly on server side).
   - Set `STORAGE_BACKEND=blob` and configure `@vercel/blob` storage token (`BLOB_READ_WRITE_TOKEN`).
   - If using cloud LLM, set `LLM_PROVIDER=gemini` or `openai` along with `GEMINI_API_KEY` or `OPENAI_API_KEY`.

2. **Supabase Database Setup**:
   - In your Supabase dashboard, execute `supabase/schema.sql`.
   - Confirm Row Level Security (RLS) is enabled on all tables.
   - Add your production domain to the Supabase Authentication URL redirect allowlist (`https://<your-domain>/` and `https://<your-domain>/auth/callback`).

3. **Health Check**:
   - Ping `/api/health` to confirm server status and version information.
