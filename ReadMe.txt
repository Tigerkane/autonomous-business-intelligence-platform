================================================================================
          ABIP — AUTONOMOUS BUSINESS INTELLIGENCE PLATFORM
                     SETUP & EXECUTION GUIDE (ReadMe.txt)
================================================================================

1. PROJECT OVERVIEW
--------------------------------------------------------------------------------
ABIP (Autonomous Business Intelligence Platform) is an enterprise-grade retail 
intelligence platform built as a unified full-stack application using:
  - Framework: Next.js 16 (App Router & Route Handlers), React 19
  - Language:  TypeScript
  - Styling:   Tailwind CSS v4
  - Analytics: In-memory mathematical engine, linear regression & Tukey IQR
  - AI Engine: Deterministic zero-hallucination solver + pluggable LLM (Ollama,
               Gemini, OpenAI)
  - Security:  Supabase Auth, SSR Middleware, and Row-Level Security (RLS)
  - Reports:   Server-side PDF generation via pdf-lib


2. SYSTEM PREREQUISITES
--------------------------------------------------------------------------------
Before setting up the project, ensure your machine has:
  - Node.js:  v20.0.0 or higher (verify via: node -v)
  - npm:      v10.0.0 or higher (verify via: npm -v)
  - Git:      Installed and configured on your system

Optional (for extended cloud/AI capabilities):
  - Ollama:   Running locally on http://localhost:11434 (for offline LLM queries)
  - Supabase: A free Supabase project (for cloud user authentication and database)


3. SETUP & CONFIGURATION INSTRUCTIONS
--------------------------------------------------------------------------------
Follow these steps to set up the project on your local machine:

STEP 1: Navigate to Project Directory
  Open your terminal and ensure you are in the project root:
    cd "autonomous bi"

STEP 2: Install Node Dependencies
  Run npm to install all required dependencies:
    npm install

STEP 3: Configure Environment Variables
  Create a local configuration file named `.env` in the project root:
    cp .env.example .env

  Open `.env` in any text editor and adjust the settings:

  ----------------------------------------------------------------------------
  Variable Name                 Default / Example               Description
  ----------------------------------------------------------------------------
  APP_URL                       http://localhost:3000           Local application URL
  
  # Supabase Auth & Storage (Optional: Local guest mode works without these)
  NEXT_PUBLIC_SUPABASE_URL      https://your-id.supabase.co     Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY eyJhbGciOi...                   Public client key
  SUPABASE_SERVICE_ROLE_KEY     eyJhbGciOi...                   Server admin key
  
  # Storage Backend
  STORAGE_BACKEND               local                           "local" for disk storage
                                                                "blob" for Vercel Blob
  
  # AI / LLM Configuration
  LLM_PROVIDER                  deterministic                   Options:
                                                                - "deterministic" (recommended, zero-hallucination in-memory solver)
                                                                - "ollama" (local daemon)
                                                                - "ollama_cloud" (hosted)
                                                                - "gemini" (Google GenAI)
                                                                - "openai" (OpenAI API)
  LLM_BASE_URL                  http://localhost:11434          Local Ollama daemon URL
  LLM_MODEL                     llama3.2                        Model name for Ollama
  
  # Optional Cloud API Keys (Leave blank if using deterministic solver)
  OLLAMA_API_KEY                ""                              Ollama Cloud API key
  LLM_API_KEY                   ""                              Hosted LLM API key
  GEMINI_API_KEY                ""                              Google Gemini API key
  OPENAI_API_KEY                ""                              OpenAI API key
  ----------------------------------------------------------------------------

  NOTE: You can immediately run the application in "guest mode" using the default
  "deterministic" solver WITHOUT configuring any external cloud API keys or
  Supabase accounts.

STEP 4: Database Setup (Optional for Supabase Cloud Auth)
  If you wish to use Supabase cloud authentication and persistence:
  1. Open your Supabase Dashboard -> SQL Editor.
  2. Paste and run the DDL schema file located at:
       supabase/schema.sql
  3. Ensure Row-Level Security (RLS) is enabled.
  4. In Supabase Authentication -> URL Configuration, add your redirect URLs:
       http://localhost:3000/
       http://localhost:3000/auth/callback


4. INSTRUCTIONS ON HOW TO RUN THE PROJECT CODE
--------------------------------------------------------------------------------

A. STARTING THE DEVELOPMENT SERVER
   Run the following command in your terminal:
     npm run dev

   Once the server compiles:
     - Open your web browser and visit: http://localhost:3000
     - Changes made to source code will automatically hot-reload.

B. RUNNING THE AUTOMATED TEST SUITE
   The project includes 87 automated unit, mathematical, and end-to-end tests:
     npm test

   This executes tests across 4 suites:
     1. tests/cleaner.test.ts   (20 tests: CSV parsing, 43+ error checks, profit)
     2. tests/analytics.test.ts (38 tests: KPIs, revenue, trends, anomalies)
     3. tests/insights.test.ts  (15 tests: period analysis & stock recommendations)
     4. tests/e2e_pipeline.test.ts (14 tests: multi-user isolation & pipeline)

C. TYPE CHECKING AND LINTING
   To check for TypeScript compiler issues without building:
     npm run lint

D. BUILDING FOR PRODUCTION
   To compile and optimize the production application bundle:
     npm run build

E. RUNNING THE PRODUCTION SERVER LOCALLY
   To run the compiled production bundle locally:
     npm run start
   (or npm run preview)

F. CLEANING BUILD ARTIFACTS
   To clean the Next.js compilation cache (.next) and build directories:
     npm run clean


5. KEY FEATURES & HOW TO USE THE PLATFORM
--------------------------------------------------------------------------------
1. Uploading a Dataset:
   - Navigate to "Upload Dataset" in the sidebar.
   - Drag and drop your retail CSV file or click "Load Built-in Sample CSV" to 
     instantly populate the 1,000-row benchmark dataset.
   - The validation engine will scan rows, flag warnings/errors, and allow you
     to inspect anomalies or download the cleaned CSV.

2. Executive Dashboard:
   - View real-time revenue, order volume, average basket, and profit margins.
   - Inspect the Category Profit Breakdown scorecard (Electronics, Clothing, Beauty).
   - Review multi-period horizons (Trailing 3M, Quarterly, Half-Yearly, Annual)
     and automated inventory stock recommendations.

3. Forecast & Anomaly Detection:
   - Check walk-forward regression forecasts with backtested MAPE accuracy scores.
   - Adjust the anomaly sensitivity slider (2.5σ to 4.5σ) to inspect daily 
     revenue outliers.
   - Review unusual high-value transactions flagged by Tukey IQR fences.

4. Deterministic Mathematical Solver & "Ask Your Data" AI:
   - Built-in Deterministic Math Solver: Scans 100% of rows directly in memory
     with zero hallucination, zero token costs, and 100% offline capability.
   - Accurately computes answers to natural language questions regarding:
       * Revenue, unit volumes, order totals, and average basket size
       * Best/worst performing product categories, gross profit, and margin %
       * Unique customer count, average age, and demographic distributions
       * Highest/lowest grossing months and month-over-month trajectories
       * Walk-forward regression sales forecast and backtested MAPE error
       * Daily revenue anomaly spikes/dips and unusual transactions
       * Gender split comparisons (order counts, units, and revenue)
   - Every response includes an audit proof receipt (e.g. "Computed from 1,000 of 
     1,000 rows (100% scanned). No estimation or generated text.").
   - Pluggable AI: Seamlessly toggle between the Deterministic Solver, Local 
     Ollama (llama3.2), Hosted Ollama Cloud (gpt-oss:120b), Gemini, or OpenAI.

5. Executive PDF Reports:
   - Navigate to "Reports" in the sidebar.
   - Click "Generate Executive PDF Report" to download a vector-branded,
     publication-ready multi-page retail intelligence document.


6. TROUBLESHOOTING & TIPS
--------------------------------------------------------------------------------
- Port 3000 already in use:
  If port 3000 is occupied, you can run on a different port:
    npx next dev -p 3001

- Node version mismatch:
  Ensure Node.js is at least v20. Check your version with:
    node -v

- Local Ollama not responding:
  If using LLM_PROVIDER="ollama", ensure the Ollama daemon is running:
    ollama serve
  Or simply leave LLM_PROVIDER="deterministic" to use the built-in, in-memory
  zero-hallucination math solver that requires no local AI server.

- Supabase session warnings:
  If you haven't configured Supabase cloud keys, the app automatically runs in
  isolated guest mode with full access to analytics, cleaning, forecasting, and
  PDF generation.


================================================================================
For further design specifications, refer to DESIGN.md.
For detailed documentation and API references, refer to README.md.
================================================================================
