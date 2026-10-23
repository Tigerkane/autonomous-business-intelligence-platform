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
/* All data is scoped per user id (uid).                               */
/* ------------------------------------------------------------------ */

const BACKEND: 'local' | 'blob' =
  (process.env.STORAGE_BACKEND as 'local' | 'blob' | undefined) ??
  (process.env.VERCEL ? 'blob' : 'local');

const BLOB_ACCESS = 'public' as const;

const safe = (uid: string) => uid.replace(/[^a-zA-Z0-9_-]/g, '_');
const pointerPath = (uid: string) => `abip/${safe(uid)}/current.json`;
const datasetsPrefix = (uid: string) => `abip/${safe(uid)}/datasets/`;

interface Storage {
  readPointer(uid: string): Promise<Pointer | null>;
  readRows(uid: string, id: string): Promise<SaleRow[]>;
  writeRows(uid: string, id: string, rows: SaleRow[]): Promise<void>;
  writePointer(uid: string, ptr: Pointer): Promise<void>; // atomic commit
  removeOtherDatasets(uid: string, keepId: string | null): Promise<void>;
  removePointer(uid: string): Promise<void>;
}

/* ---------- local filesystem backend ---------- */

const DATA_DIR = path.resolve(process.cwd(), 'data');
const userDir = (uid: string) => path.join(DATA_DIR, safe(uid));
const localPointer = (uid: string) => path.join(userDir(uid), 'current.json');
const localDatasets = (uid: string) => path.join(userDir(uid), 'datasets');

const localStorage: Storage = {
  async readPointer(uid) {
    try {
      return JSON.parse(fs.readFileSync(localPointer(uid), 'utf-8')) as Pointer;
    } catch {
      return null;
    }
  },
  async readRows(uid, id) {
    return JSON.parse(fs.readFileSync(path.join(localDatasets(uid), id, 'rows.json'), 'utf-8'));
  },
  async writeRows(uid, id, rows) {
    const dir = path.join(localDatasets(uid), id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'rows.json'), JSON.stringify(rows), 'utf-8');
  },
  async writePointer(uid, ptr) {
    fs.mkdirSync(userDir(uid), { recursive: true });
    const tmp = `${localPointer(uid)}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(ptr), 'utf-8');
    fs.renameSync(tmp, localPointer(uid)); // rename is atomic
  },
  async removeOtherDatasets(uid, keepId) {
    const dir = localDatasets(uid);
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      if (name !== keepId) fs.rmSync(path.join(dir, name), { recursive: true, force: true });
    }
  },
  async removePointer(uid) {
    const p = localPointer(uid);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  },
};

/* ---------- Vercel Blob backend ---------- */

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Blob fetch failed (${res.status})`);
  return (await res.json()) as T;
}

const blobStorage: Storage = {
  async readPointer(uid) {
    try {
      const info = await head(pointerPath(uid));
      return await fetchJson<Pointer>(`${info.url}?t=${Date.now()}`); // cache-bust
    } catch {
      return null;
    }
  },
  async readRows(uid, id) {
    const info = await head(`${datasetsPrefix(uid)}${id}/rows.json`);
    return fetchJson<SaleRow[]>(info.url);
  },
  async writeRows(uid, id, rows) {
    await put(`${datasetsPrefix(uid)}${id}/rows.json`, JSON.stringify(rows), {
      access: BLOB_ACCESS,
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  },
  async writePointer(uid, ptr) {
    await put(pointerPath(uid), JSON.stringify(ptr), {
      access: BLOB_ACCESS,
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
  },
  async removeOtherDatasets(uid, keepId) {
    const prefix = datasetsPrefix(uid);
    const { blobs } = await list({ prefix });
    const stale = blobs.filter((b) => !keepId || !b.pathname.startsWith(`${prefix}${keepId}/`));
    if (stale.length) await del(stale.map((b) => b.url));
  },
  async removePointer(uid) {
    try {
      const info = await head(pointerPath(uid));
      await del(info.url);
    } catch {
      /* no pointer */
    }
  },
};

const storage: Storage = BACKEND === 'blob' ? blobStorage : localStorage;

/* ------------------------------------------------------------------ */
/* Per-user cache + public API                                         */
/* ------------------------------------------------------------------ */

type State = { rows: SaleRow[] | null; meta: StoredMeta | null; id: string | null };
const states = new Map<string, State>();
const seeding = new Map<string, Promise<void>>();

function st(uid: string): State {
  let s = states.get(uid);
  if (!s) {
    s = { rows: null, meta: null, id: null };
    states.set(uid, s);
  }
  return s;
}

/** Call (and await) at the start of every data-accessing route. */
export async function hydrate(uid: string): Promise<void> {
  const s = st(uid);

  for (let attempt = 0; attempt < 2; attempt++) {
    const ptr = await storage.readPointer(uid);
    if (!ptr) break;
    if (ptr.id === s.id) return;
    try {
      s.rows = await storage.readRows(uid, ptr.id);
      s.meta = ptr.meta;
      s.id = ptr.id;
      console.log(`[DB:${BACKEND}] Loaded ${s.rows.length} rows for ${safe(uid).slice(0, 8)}.`);
      return;
    } catch (e) {
      console.error('[DB] Failed to load dataset, retrying:', e);
    }
  }

  s.rows = null;
  s.meta = null;
  s.id = null;

  // Nothing stored for this user: auto-seed demo dataset once
  if (!seeding.has(uid)) {
    seeding.set(
      uid,
      (async () => {
        try {
          const { rows, quality } = cleanSalesData(generateDemoDatasetCSV());
          await saveSalesData(uid, rows, 'demo_retail_sales.csv', quality);
          console.log(`[DB:${BACKEND}] Auto-seeded demo dataset (${rows.length} rows).`);
        } catch (err) {
          console.warn('[DB] Started clean without auto-seed:', err);
        } finally {
          seeding.delete(uid);
        }
      })()
    );
  }
  await seeding.get(uid);
}

export function getSalesRows(uid: string): SaleRow[] {
  return st(uid).rows ?? [];
}

export function databaseExists(uid: string): boolean {
  return getSalesRows(uid).length > 0;
}

/** Atomic replace: write new versioned data, flip pointer last, then clean up. */
export async function saveSalesData(
  uid: string,
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

  await storage.writeRows(uid, id, rows); // 1) new data under a fresh path
  await storage.writePointer(uid, { id, meta }); // 2) commit

  Object.assign(st(uid), { rows, meta, id });

  try {
    await storage.removeOtherDatasets(uid, id); // 3) best-effort cleanup
  } catch (e) {
    console.warn('[DB] Old dataset cleanup failed (non-fatal):', e);
  }
}

export async function deleteDataset(uid: string): Promise<boolean> {
  const existed = databaseExists(uid);
  Object.assign(st(uid), { rows: null, meta: null, id: null });

  try {
    await storage.removePointer(uid);
    await storage.removeOtherDatasets(uid, null);
  } catch (e) {
    console.error('Error deleting dataset:', e);
  }
  return existed;
}

export function getDatasetMeta(uid: string): StoredMeta {
  const meta: StoredMeta = st(uid).meta ?? {
    filename: 'Dataset',
    uploaded_at: new Date().toISOString(),
  };
  if (!meta.quality) {
    const rows = getSalesRows(uid);
    if (rows.length > 0) return { ...meta, quality: qualityFromRows(rows) };
  }
  return meta;
}

export function getSalesSummary(uid: string): {
  total_rows: number;
  total_quantity: number;
  total_sales: number;
  average_transaction: number;
} {
  const rows = getSalesRows(uid);
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

export function getKPIs(uid: string): KPIs {
  const s = getSalesSummary(uid);
  return {
    total_sales: s.total_sales,
    total_quantity: s.total_quantity,
    total_transactions: s.total_rows,
    average_transaction: s.average_transaction,
  };
}

export function getSalesPreview(uid: string, limit = 10): SaleRow[] {
  return getSalesRows(uid).slice(0, Math.min(limit, 100));
}
