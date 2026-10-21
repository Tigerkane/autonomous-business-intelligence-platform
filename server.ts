import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getAnomalies,
  getForecast,
  getOverview,
  getSalesAnalysis,
  getUnusualTransactions,
} from './server/analytics';
import {
  cleanSalesData,
  generateDemoDatasetCSV,
  getCSVTemplate,
} from './server/cleaner';
import {
  databaseExists,
  deleteDataset,
  getDatasetMeta,
  getKPIs,
  getSalesPreview,
  getSalesRows,
  getSalesSummary,
  initDatabase,
  saveSalesData,
} from './server/db';
import {
  askLLM,
  availableProviders,
  buildContext,
  DEFAULT_PROVIDER,
} from './server/llm';
import { describeIssues } from './server/quality';
import { generatePDFReport } from './server/report';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Upload configuration with 25MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers for development flexibility
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Initialize database
initDatabase();

// ==========================================
// HEALTH & ROOT ENDPOINTS
// ==========================================
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api', (_req, res) => {
  res.json({
    message: 'Autonomous Business Intelligence Platform API',
    status: 'running',
    version: '0.3.0',
  });
});

// ==========================================
// DATASET MANAGEMENT ENDPOINTS
// ==========================================
app.get('/api/data/status', (_req, res) => {
  if (!databaseExists()) {
    return res.json({
      database_exists: false,
      rows: 0,
    });
  }
  const summary = getSalesSummary();
  const meta = getDatasetMeta();
  return res.json({
    database_exists: true,
    ...summary,
    ...meta,
  });
});

app.post('/api/upload', upload.single('file') as any, (req: Request, res: Response) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ detail: 'No file selected.' });
    }

    const filename = req.file.originalname || 'uploaded_sales.csv';
    if (!filename.toLowerCase().endsWith('.csv')) {
      return res.status(400).json({ detail: 'Only CSV files are supported.' });
    }

    const text = req.file.buffer.toString('utf-8');
    const { rows, report, quality } = cleanSalesData(text);

    if (rows.length === 0) {
      return res.status(422).json({
        detail: `No valid rows remain after validation. ${describeIssues(quality)}`.trim(),
      });
    }

    saveSalesData(rows, filename, quality);

    const dropped = report.rows_before - report.rows_after;
    return res.json({
      message:
        dropped > 0
          ? `CSV uploaded. ${dropped} of ${report.rows_before} rows were dropped during validation.`
          : 'CSV uploaded and processed successfully.',
      filename,
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
      quality,
    });
  } catch (err: any) {
    console.error('Upload processing error:', err);
    return res.status(422).json({ detail: err.message || 'Failed to process CSV file.' });
  }
});

app.post('/api/data/sample', (_req, res) => {
  try {
    const csvContent = generateDemoDatasetCSV();
    const { rows, report, quality } = cleanSalesData(csvContent);
    saveSalesData(rows, 'demo_retail_sales.csv', quality);

    return res.json({
      message: 'Demo dataset generated and loaded successfully.',
      filename: 'demo_retail_sales.csv',
      database: 'retail_bi.db',
      table: 'sales',
      ...report,
      quality,
    });
  } catch (err: any) {
    return res.status(500).json({ detail: `Could not generate demo dataset: ${err.message}` });
  }
});

app.get('/api/data/template', (_req, res) => {
  const template = getCSVTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="retail_sales_template.csv"');
  return res.send(template);
});

app.delete('/api/data', (_req, res) => {
  const deleted = deleteDataset();
  return res.json({ deleted });
});

app.get('/api/data/preview', (req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 10, 1), 100);
  const data = getSalesPreview(limit);
  return res.json({
    rows: data.length,
    data,
  });
});

app.get('/api/data/summary', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  return res.json(getSalesSummary());
});

// ==========================================
// DASHBOARD & ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/dashboard/kpis', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  return res.json(getKPIs());
});

app.get('/api/dashboard/sales-trend', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  const rows = getSalesRows();
  const dailyMap = new Map<string, number>();
  for (const r of rows) {
    dailyMap.set(r.date, (dailyMap.get(r.date) || 0) + r.total_amount);
  }
  const sortedDates = Array.from(dailyMap.keys()).sort();
  const data = sortedDates.map((date) => ({
    date,
    sales: Math.round(dailyMap.get(date)! * 100) / 100,
  }));
  return res.json({ data });
});

app.get('/api/dashboard/category-sales', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  const rows = getSalesRows();
  const catMap = new Map<string, number>();
  for (const r of rows) {
    catMap.set(r.product_category, (catMap.get(r.product_category) || 0) + r.total_amount);
  }
  const data = Array.from(catMap.entries())
    .map(([category, sales]) => ({
      category,
      sales: Math.round(sales * 100) / 100,
    }))
    .sort((a, b) => b.sales - a.sales);
  return res.json({ data });
});

app.get('/api/dashboard/overview', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  try {
    return res.json(getOverview());
  } catch (err: any) {
    return res.status(422).json({ detail: err.message });
  }
});

app.get('/api/analysis/sales', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  try {
    return res.json(getSalesAnalysis());
  } catch (err: any) {
    return res.status(422).json({ detail: err.message });
  }
});

app.get('/api/forecast', (_req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  try {
    return res.json(getForecast());
  } catch (err: any) {
    return res.status(422).json({ detail: err.message });
  }
});

app.get('/api/anomalies', (req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : 500;
  const limit = isNaN(limitQuery) ? 500 : limitQuery;
  const thresholdQuery = req.query.threshold ? parseFloat(req.query.threshold as string) : 3.5;
  const threshold = isNaN(thresholdQuery) ? 3.5 : thresholdQuery;
  return res.json(getAnomalies(undefined, limit, threshold));
});

app.get('/api/anomalies/transactions', (req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet.' });
  }
  const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : 200;
  const limit = isNaN(limitQuery) ? 200 : Math.min(Math.max(limitQuery, 1), 1000);
  return res.json(getUnusualTransactions(undefined, limit));
});

// ==========================================
// NATURAL LANGUAGE AI Q&A
// ==========================================
app.get('/api/llm/providers', (_req, res) => {
  const providers = availableProviders();
  return res.json({
    default: DEFAULT_PROVIDER,
    providers,
  });
});

app.post('/api/ask', async (req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet. Upload a CSV first.' });
  }

  const { question, provider } = req.body || {};
  if (!question || typeof question !== 'string' || question.trim().length < 2) {
    return res.status(400).json({ detail: 'Please provide a valid question.' });
  }

  try {
    const context = buildContext();
    const result = await askLLM(question.trim(), context, provider);
    return res.json({
      question,
      answer: result.answer,
      provider: result.provider,
      model: result.model,
    });
  } catch (err: any) {
    console.error('Ask error:', err);
    return res.status(500).json({ detail: err.message || 'AI analysis request failed.' });
  }
});

// ==========================================
// REPORT GENERATION (PDF)
// ==========================================
app.post('/api/reports/generate', async (req, res) => {
  if (!databaseExists()) {
    return res.status(404).json({ detail: 'No dataset has been uploaded yet. Upload a CSV first.' });
  }

  const type = req.body?.type || 'executive';
  const provider = req.body?.provider;

  try {
    const pdfBytes = await generatePDFReport(type, provider);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ABIP_${type}_report.pdf"`);
    return res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('Report generation error:', err);
    return res.status(500).json({ detail: `Could not build the report: ${err.message}` });
  }
});

// ==========================================
// DEV SERVER & VITE INTEGRATION
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: HOST,
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[ABIP] Server running at http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ABIP] Fatal server error:', err);
});
