import fs from 'fs';
import path from 'path';
import { put, head, del, list } from '@vercel/blob';
import { cleanSalesData, generateDemoDatasetCSV } from './cleaner';
import { DataQuality, qualityFromRows } from './quality';
import { DatasetMeta, KPIs, SaleRow } from './types';

export type StoredMeta = DatasetMeta & { quality?: DataQuality };
type Pointer = { id: string; meta: StoredMeta };

/* ------------------------------------------------------------------ */
/* Storage adapter: local files in dev, Vercel Blob in deployment      */
/* ------------------------------------------------------------------ */

// Blob on Vercel (VERCEL env var is set automatically), local files otherwise.
// Override with STORAGE_BACKEND=local|blob if you ever need to.
const BACKEND: 'local' | 'blob' =
  (process.env.STORAGE_BACKEND as 'local' | 'blob' | undefined) ??
  (process.env.VERCEL ? 'blob' : 'local');

// Blob only: public-access blobs. See the access note in the reply.
const BLOB_ACCESS = 'public' as const;

const POINTER_PATH = 'abip/current.json';
const DATASETS_PREFIX = 'abip/datasets/';

interface Storage {
  readPointer(): Promise<Pointer | null>;
  readRows(id: string): Promise<SaleRow[]>;
  writeRows(id: string, rows: SaleRow[]): Promise<void>;
  writePointer(ptr: Pointer): Promise<void>; // the atomic "commit"
  removeOtherDatasets(keepId: string | null): Promise<void>; // null = remove all
  removePointer(): Promise<void>;
}

/* ---------- local filesystem backend ---------- */

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_POINTER = path.join(DATA_DIR, 'current.json');
const LOCAL_DATASETS = path.join(DATA_DIR, 'datasets');

const localStorage: Storage = {
  async readPointer() {
    try {
      return JSON.parse(fs.readFileSync(LOCAL_POINTER, 'utf-8')) as Pointer;
    } catch {
      return null;
    }
  },
  async readRows(id) {
    return JSON.parse(fs.readFileSync(path.join(LOCAL_DATASETS, id, 'rows.json'), 'utf-8'));
  },
  async writeRows(id, rows) {
    const dir = path.join(LOCAL_DATASETS, id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'rows.json'), JSON.stringify(rows), 'utf-8');
  },
  async writePointer(ptr) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${LOCAL_POINTER}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(ptr), 'utf-8');
    fs.renameSync(tmp, LOCAL_POINTER); // rename is atomic
  },
  async removeOtherDatasets(keepId) {
    if (!fs.existsSync(LOCAL_DATASETS)) return;
    for (const name of fs.readdirSync(LOCAL_DATASETS)) {
      if (name !== keepId) fs.rmSync(path.join(LOCAL_DATASETS, name), { recursive: true, force: true });
    }
  },
  async removePointer() {
    if (fs.existsSync(LOCAL_POINTER)) fs.unlinkSync(LOCAL_POINTER);
  },
};

/* ---------- Vercel Blob backend ---------- */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Blob fetch failed (${res.status})`);
  return (await res.json()) as T;
}

const blobStorage: Storage = {
  async readPointer() {
    try {
      const info = await head(POINTER_PATH);
      return await fetchJson<Pointer>(`${info.url}?t=${Date.now()}`); // cache-bust
    } catch {
      return null;
    }
  },
  async readRows(id) {
    const info = await head(`${DATASETS_PREFIX}${id}/rows.json`);
    return fetchJson<SaleRow[]>(info.url);
  },
  async writeRows(id, rows) {
    await put(`${DATASETS_PREFIX}${id}/rows.json`, JSON.stringify(rows), {
      access: BLOB_ACCESS,
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  },
  async writePointer(ptr) {
    await put(POINTER_PATH, JSON.stringify(ptr), {
      access: BLOB_ACCESS,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
  },
  async removeOtherDatasets(keepId) {
    const { blobs } = await list({ prefix: DATASETS_PREFIX });
    const stale = blobs.filter((b) => !keepId || !b.pathname.startsWith(`${DATASETS_PREFIX}${keepId}/`));
    if (stale.length) await del(stale.map((b) => b.url));
  },
  async removePointer() {
    try {
      const info = await head(POINTER_PATH);
      await del(info.url);
    } catch {
      /* no pointer */
    }
  },
};

const storage: Storage = BACKEND === 'blob' ? blobStorage : localStorage;

/* ------------------------------------------------------------------ */
/* Cache + public API (same exports as before)                         */
/* ------------------------------------------------------------------ */

let salesCache: SaleRow[] | null = null;
let metaCache: StoredMeta | null = null;
let cachedId: string | null = null;
let seedPromise: Promise<void> | null = null;

/** Call (and await) at the start of every data-accessing route. */
export async function hydrate(): Promise<void> {
  const ptr = await storage.readPointer();

  if (ptr) {
    if (ptr.id !== cachedId) {
      try {
        salesCache = await storage.readRows(ptr.id);
        metaCache = ptr.meta;
        cachedId = ptr.id;
        console.log(`[DB:${BACKEND}] Loaded ${salesCache.length} rows.`);
      } catch (e) {
        console.error('[DB] Failed to load dataset:', e);
        salesCache = null;
        metaCache = null;
        cachedId = null;
      }
    }
    return;
  }

  salesCache = null;
  metaCache = null;
  cachedId = null;

  // Nothing stored: auto-seed the demo dataset once
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const { rows, quality } = cleanSalesData(generateDemoDatasetCSV());
        await saveSalesData(rows, 'demo_retail_sales.csv', quality);
        console.log(`[DB:${BACKEND}] Auto-seeded demo dataset with ${rows.length} rows.`);
      } catch (err) {
        console.warn('[DB] Started clean without auto-seed:', err);
      } finally {
        seedPromise = null;
      }
    })();
  }
  await seedPromise;
}

export function databaseExists(): boolean {
  return !!salesCache && salesCache.length > 0;
}

export function getSalesRows(): SaleRow[] {
  return salesCache ?? [];
}

/** Atomic replace: write new versioned data, flip pointer last, then clean up old versions. */
export async function saveSalesData(
  rows: SaleRow[],
  filename: string,
  quality?: DataQuality
): Promise<void> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const meta: StoredMeta = {
    filename,
    uploaded_at: new Date().toISOString(),
    ...(quality ? { quality } : {}),
  };

  await storage.writeRows(id, rows); // 1) new data under a fresh path
  await storage.writePointer({ id, meta }); // 2) commit

  salesCache = rows;
  metaCache = meta;
  cachedId = id;

  try {
    await storage.removeOtherDatasets(id); // 3) best-effort cleanup
  } catch (e) {
    console.warn('[DB] Old dataset cleanup failed (non-fatal):', e);
  }
}

export async function deleteDataset(): Promise<boolean> {
  const existed = databaseExists();
  salesCache = null;
  metaCache = null;
  cachedId = null;

  try {
    await storage.removePointer(); // readers immediately see "no dataset"
    await storage.removeOtherDatasets(null);
  } catch (e) {
    console.error('Error deleting dataset:', e);
  }
  return existed;
}

export function getDatasetMeta(): StoredMeta {
  const meta: StoredMeta = metaCache ?? {
    filename: 'Dataset',
    uploaded_at: new Date().toISOString(),
  };
  if (!meta.quality) {
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
    return { total_rows: 0, total_quantity: 0, total_sales: 0, average_transaction: 0 };
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
  const s = getSalesSummary();
  return {
    total_sales: s.total_sales,
    total_quantity: s.total_quantity,
    total_transactions: s.total_rows,
    average_transaction: s.average_transaction,
  };
}

export function getSalesPreview(limit = 10): SaleRow[] {
  return getSalesRows().slice(0, Math.min(limit, 100));
}
