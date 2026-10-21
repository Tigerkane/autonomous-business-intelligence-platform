# Autonomous Business Intelligence Platform

A single-tenant web app that turns an uploaded transaction file into a cleaned dataset, data quality report, and business insights, with no manual spreadsheet work.

Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**, with a Node server layer and optional Python utilities for anomaly checks.

---

## Features

- **File ingestion**: upload a CSV of transactions and have it parsed and validated on the server.
- **Row-level error reporting**: invalid rows are reported with the row number and the reason they were rejected.
- **Data cleaning**
  - Duplicates are detected strictly by **Transaction ID**; the first valid row is kept.
  - Strict date parsing: ambiguous formats (e.g. `DD/MM/YYYY`) produce a warning, and impossible calendar dates are rejected.
- **Data quality card**: summary of rows received, accepted, rejected, duplicates removed, and warnings.
- **Insights dashboard**: month-over-month (MoM) insight cards and a main-driver column highlighting what moved the numbers.
- **Anomaly checks**: optional Python script (`check_anomalies.py`) for flagging unusual records.

> **Scope note:** this project is a **single-tenant** application that works on files you upload. It does not provide multi-tenant accounts, per-organization isolation, or a hosted multi-user service.

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Frontend   | Next.js (App Router), React, Tailwind CSS |
| Language   | TypeScript                              |
| Server     | Node.js (`server.ts`, `server/` modules) |
| Analysis   | Python 3 (optional, `check_anomalies.py`) |

---

## Project Structure

```
.
├── app/                 # Next.js App Router pages and routes
├── src/                 # UI components and views
├── server/              # Server-side logic
│   ├── cleaner.ts       # Cleaning and duplicate removal
│   └── quality.ts       # Validation metrics for the quality card
├── data/                # Local data files (not committed)
├── public/              # Static assets
├── server.ts            # Node server entry
├── check_anomalies.py   # Optional anomaly detection script
├── .env.example         # Template for required environment variables
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm (or Bun, since a `bun.lock` is included)
- Python 3.10+ (only if you use the anomaly script)

### Installation

```bash
git clone https://github.com/Tigerkane/autonomous-business-intelligence-platform.git
cd autonomous-business-intelligence-platform
npm install
```

### Environment variables

Copy the template and fill in your own values:

```bash
cp .env.example .env
```

Never commit `.env`. It is listed in `.gitignore`.

### Run in development

```bash
npm run dev
```

Open <http://localhost:3000>.

### Build for production

```bash
npm run build
npm start
```

### Optional: Python anomaly script

```bash
python -m venv .venv
source .venv/bin/activate        # fish: source .venv/bin/activate.fish
pip install -r requirements.txt  # if you have one
python check_anomalies.py
```

---

## Expected Input Format

Upload a CSV with a header row. At minimum, each record should include:

| Column           | Description                          |
| ---------------- | ------------------------------------ |
| `Transaction ID` | Unique identifier, used for dedup    |
| `Date`           | Transaction date                     |
| `Amount`         | Numeric transaction value            |

Adjust this table to match the columns your parser actually requires.

Rows that fail validation are not silently dropped; they appear in the error report with the row number and reason.

---

## Deployment

- **Vercel** works for the Next.js frontend and API routes.
- If your app depends on the custom `server.ts` Node server, deploy on a host that can run a long-lived Node process (Render, Railway, Fly.io).
- Set the variables from `.env.example` in your host's dashboard.

---

## Limitations

- Single-tenant: no user accounts or data isolation between organizations.
- Data is processed from uploaded files; there is no live connection to external business systems.
- Date formats like `DD/MM/YYYY` are inherently ambiguous and are flagged, not guessed.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Make your changes with clear commit messages.
3. Open a pull request describing what changed and why.

---

## License

Add a license of your choice (for example MIT) and state it here.
