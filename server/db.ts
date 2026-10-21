import fs from 'fs';
import path from 'path';
import { cleanSalesData, generateDemoDatasetCSV } from './cleaner';
import { DataQuality, qualityFromRows } from './quality';
import { DatasetMeta, KPIs, SaleRow } from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'retail_bi.json');
const META_FILE = path.join(DATA_DIR, 'dataset_meta.json');
const SAMPLE_CSV = path.join(DATA_DIR, 'retail_sales.csv');

// Metadata stored next to the data: file name, upload time and the validation / data quality summary
export type StoredMeta = DatasetMeta & { quality?: DataQuality };

// In-memory cache for fast analytical aggregation
let salesCache: SaleRow[] | null = null;
let metaCache: StoredMeta | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function initDatabase() {
  ensureDataDir();

  if (fs.existsSync(DB_FILE) && fs.existsSync(META_FILE)) {
    try {
      salesCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      metaCache = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
      if (salesCache && salesCache.length > 0) {
        console.log(`[DB] Loaded ${salesCache.length} rows from disk cache.`);
        return;
      }
    } catch (e) {
      console.warn('[DB] Failed to read disk cache, initializing fallback...');
    }
  }

  // Auto-seed with demo dataset so new sessions have active models and forecasts
  try {
    const csvContent = generateDemoDatasetCSV();
    const { rows, quality } = cleanSalesData(csvContent);
    saveSalesData(rows, 'demo_retail_sales.csv', quality);
    console.log(`[DB] Auto-seeded demo dataset with ${rows.length} rows.`);
  } catch (err) {
    salesCache = null;
    metaCache = null;
    console.warn('[DB] Started clean without auto-seed:', err);
  }
}

let isDbInit = false;
export function ensureDatabase() {
  if (!isDbInit) {
    isDbInit = true;
    initDatabase();
  }
}

export function databaseExists(): boolean {
  ensureDatabase();
  if (salesCache && salesCache.length > 0) return true;
  if (fs.existsSync(DB_FILE)) {
    try {
      salesCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (fs.existsSync(META_FILE)) {
        metaCache = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
      }
      return (salesCache && salesCache.length > 0) || false;
    } catch {
      return false;
    }
  }
  return false;
}

export function getSalesRows(): SaleRow[] {
  ensureDatabase();
  if (salesCache) return salesCache;
  if (databaseExists() && salesCache) return salesCache;
  return [];
}

export function saveSalesData(rows: SaleRow[], filename: string, quality?: DataQuality): void {
  ensureDataDir();
  salesCache = rows;
  metaCache = {
    filename,
    uploaded_at: new Date().toISOString(),
    ...(quality ? { quality } : {}),
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(rows), 'utf-8');
  fs.writeFileSync(META_FILE, JSON.stringify(metaCache), 'utf-8');
}

export function deleteDataset(): boolean {
  const existed = databaseExists();
  salesCache = null;
  metaCache = null;

  try {
    if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);
    if (fs.existsSync(META_FILE)) fs.unlinkSync(META_FILE);
  } catch (e) {
    console.error('Error deleting dataset files:', e);
  }

  return existed;
}

function readMeta(): StoredMeta {
  if (metaCache) return metaCache;
  if (fs.existsSync(META_FILE)) {
    try {
      metaCache = JSON.parse(fs.readFileSync(META_FILE, 'utf-8'));
      return metaCache!;
    } catch {
      // return default
    }
  }
  return {
    filename: 'Dataset',
    uploaded_at: new Date().toISOString(),
  };
}

export function getDatasetMeta(): StoredMeta {
  const meta = readMeta();
  if (!meta.quality) {
    // Datasets saved before validation summaries existed: recompute what we can from the stored rows
    const rows = getSalesRows();
    if (rows.length > 0) return { ...meta, quality: qualityFromRows(rows) };
  }
  return meta;
}

export function getSalesSummary(): {
  total_rows: number;
  total_quantity: number;
  total_sales: number;
  average_transaction: number;
} {
  const rows = getSalesRows();
  if (rows.length === 0) {
    return {
      total_rows: 0,
      total_quantity: 0,
      total_sales: 0,
      average_transaction: 0,
    };
  }

  let totalQuantity = 0;
  let totalSales = 0;

  for (const row of rows) {
    totalQuantity += row.quantity;
    totalSales += row.total_amount;
  }

  return {
    total_rows: rows.length,
    total_quantity: totalQuantity,
    total_sales: Math.round(totalSales * 100) / 100,
    average_transaction: Math.round((totalSales / rows.length) * 100) / 100,
  };
}

export function getKPIs(): KPIs {
  const summary = getSalesSummary();
  return {
    total_sales: summary.total_sales,
    total_quantity: summary.total_quantity,
    total_transactions: summary.total_rows,
    average_transaction: summary.average_transaction,
  };
}

export function getSalesPreview(limit = 10): SaleRow[] {
  const rows = getSalesRows();
  return rows.slice(0, Math.min(limit, 100));
}
