import { SaleRow } from './types';
import {
  DataQuality,
  ExtendedCleaningReport,
  ValidationIssue,
  buildWarnings,
  summarizeCoverage,
} from './quality';

export const REQUIRED_COLUMNS = [
  'Transaction ID',
  'Date',
  'Customer ID',
  'Gender',
  'Age',
  'Product Category',
  'Quantity',
  'Price per Unit',
  'Total Amount',
];

/**
 * Robust CSV parser that handles quotes, commas inside quotes, CRLF, and spaces.
 * lineNumbers[i] is the line in the original file where rows[i] starts (header = line 1).
 */
export function parseCSV(csvText: string): {
  headers: string[];
  rows: string[][];
  lineNumbers: number[];
} {
  const lines: string[][] = [];
  const lineNos: number[] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;
  let physicalLine = 1;
  let rowStartLine = 1;

  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuote) {
      currentRow.push(currentField.trim());
      if (currentRow.some((val) => val !== '')) {
        lines.push(currentRow);
        lineNos.push(rowStartLine);
      }
      currentRow = [];
      currentField = '';
      physicalLine++;
      rowStartLine = physicalLine;
    } else {
      if (char === '\n') physicalLine++;
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((val) => val !== '')) {
      lines.push(currentRow);
      lineNos.push(rowStartLine);
    }
  }

  if (lines.length === 0) {
    return { headers: [], rows: [], lineNumbers: [] };
  }

  const rawHeaders = lines[0].map((h) => h.replace(/^["']|["']$/g, '').trim());
  return { headers: rawHeaders, rows: lines.slice(1), lineNumbers: lineNos.slice(1) };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeName = (s: string) =>
  s
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

function levenshtein(a: string, b: string): number {
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function buildDate(y: number, m: number, d: number, ambiguous: boolean) {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Reject impossible dates such as 2025-02-30 (JS would roll them over)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return { iso: dt.toISOString().slice(0, 10), ambiguous };
}

/** Returns an ISO date, or null when the text is not a real calendar date. */
function parseDate(raw: string): { iso: string; ambiguous: boolean } | null {
  const s = (raw || '').trim();
  if (!s) return null;

  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD (optionally followed by a time)
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/);
  if (m) return buildDate(+m[1], +m[2], +m[3], false);

  // DD-MM-YYYY or MM-DD-YYYY (also with / or .)
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T\s].*)?$/);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    const y = +m[3];
    if (a > 12 && b <= 12) return buildDate(y, b, a, false); // clearly DD/MM
    if (b > 12 && a <= 12) return buildDate(y, a, b, false); // clearly MM/DD
    if (a <= 12 && b <= 12) return buildDate(y, b, a, a !== b); // ambiguous: assume DD/MM
    return null;
  }

  // Text months such as "15 Jan 2025" or "Jan 15, 2025"
  if (/[a-z]{3,}/i.test(s)) {
    const t = Date.parse(s);
    if (!isNaN(t)) {
      const d = new Date(t);
      return buildDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), false);
    }
  }
  return null;
}

/** Parses numbers such as 1200, "1,200.50", "₹1,200", "$5", "(500)". Returns null if blank or not numeric. */
function parseNumber(raw: string | undefined): number | null {
  if (raw === undefined) return null;
  let s = raw.trim();
  if (s === '') return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/[₹$€£\s,]/g, '');
  if (s === '' || !/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
  const n = Number(s);
  if (isNaN(n)) return null;
  return negative ? -Math.abs(n) : n;
}

class IssueTracker {
  private map = new Map<string, ValidationIssue>();

  add(code: string, label: string, severity: 'error' | 'warning', row: number, detail: string) {
    let issue = this.map.get(code);
    if (!issue) {
      issue = { code, label, severity, count: 0, examples: [] };
      this.map.set(code, issue);
    }
    issue.count++;
    if (issue.examples.length < 5) issue.examples.push({ row, detail });
  }

  list(): ValidationIssue[] {
    return [...this.map.values()].sort((a, b) =>
      a.severity === b.severity ? b.count - a.count : a.severity === 'error' ? -1 : 1
    );
  }
}

// ---------------------------------------------------------------------------
// Cleaning + validation
// ---------------------------------------------------------------------------

export function cleanSalesData(csvContent: string): {
  rows: SaleRow[];
  report: ExtendedCleaningReport;
  quality: DataQuality;
} {
  // Excel often saves CSVs with a UTF-8 byte-order mark, which would corrupt the first header name
  const text = csvContent.replace(/^\uFEFF/, '');
  const { headers, rows, lineNumbers } = parseCSV(text);

  if (headers.length === 0) {
    throw new Error('The file is empty.');
  }

  if (headers.length === 1 && /[;\t|]/.test(headers[0])) {
    throw new Error(
      'This file does not look comma-separated (it appears to use semicolons, tabs or pipes). Re-save it as a comma-separated CSV and upload it again.'
    );
  }

  // Match required columns ignoring case, spaces, underscores and hyphens
  const headerMap = new Map<string, number>();
  headers.forEach((h, idx) => {
    const key = normalizeName(h);
    if (!headerMap.has(key)) headerMap.set(key, idx);
  });

  const missingColumns: string[] = [];
  const colIndexes: Record<string, number> = {};

  for (const col of REQUIRED_COLUMNS) {
    const idx = headerMap.get(normalizeName(col));
    if (idx === undefined) {
      missingColumns.push(col);
    } else {
      colIndexes[col] = idx;
    }
  }

  if (missingColumns.length > 0) {
    const usedIdx = new Set(Object.values(colIndexes));
    const hints: string[] = [];
    for (const col of missingColumns) {
      let best: { h: string; d: number } | null = null;
      headers.forEach((h, idx) => {
        if (usedIdx.has(idx)) return;
        const d = levenshtein(normalizeName(h), normalizeName(col));
        if (d <= 3 && (!best || d < best.d)) best = { h, d };
      });
      if (best) hints.push(`Rename "${(best as { h: string }).h}" to "${col}".`);
    }
    throw new Error(
      [
        `Missing required column${missingColumns.length > 1 ? 's' : ''}: ${missingColumns.join(', ')}.`,
        `Columns found in your file: ${headers.join(', ')}.`,
        ...hints,
      ].join('\n')
    );
  }

  if (rows.length === 0) {
    throw new Error('The file has a header row but no data rows.');
  }

  const rowsBefore = rows.length;
  let duplicatesRemoved = 0;
  let duplicateIdConflicts = 0;
  let invalidDatesRemoved = 0;
  let numericMissingRowsRemoved = 0;
  let negativeRemoved = 0;
  let zeroRemoved = 0;
  let ambiguousDates = 0;
  let totalMismatchRows = 0;

  const tracker = new IssueTracker();

  // Blank cells per required column, counted on the raw file before any cleaning
  const missingValues: Record<string, number> = {};
  for (const col of REQUIRED_COLUMNS) {
    let blanks = 0;
    for (const row of rows) {
      const v = row[colIndexes[col]];
      if (v === undefined || v.trim() === '') blanks++;
    }
    missingValues[col] = blanks;
  }

  const seenById = new Map<string, { line: number; signature: string }>();
  const seenSignatures = new Set<string>();
  const cleanedRows: SaleRow[] = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const line = lineNumbers[r];

    const transactionId = (row[colIndexes['Transaction ID']] || '').trim();
    const rawDate = row[colIndexes['Date']] || '';
    const customerId = (row[colIndexes['Customer ID']] || 'Unknown').trim();
    const rawGender = row[colIndexes['Gender']];
    let gender = 'Unknown';
    if (rawGender === undefined || rawGender.trim() === '') {
      gender = 'Unknown';
    } else {
      const gTrim = rawGender.trim();
      const gLower = gTrim.toLowerCase();
      if (gLower === 'male') {
        gender = 'Male';
      } else if (gLower === 'female') {
        gender = 'Female';
      } else {
        tracker.add(
          'invalid_gender',
          'with invalid Gender value (accepted: Male, Female; blank becomes Unknown)',
          'warning',
          line,
          `"${gTrim}"`
        );
        gender = 'Unknown';
      }
    }
    const rawAge = row[colIndexes['Age']];
    const category = (row[colIndexes['Product Category']] || 'Unknown').trim();
    const rawQuantity = row[colIndexes['Quantity']];
    const rawPrice = row[colIndexes['Price per Unit']];
    const rawTotal = row[colIndexes['Total Amount']];

    // 1. Date
    const parsedDate = parseDate(rawDate);
    if (!parsedDate) {
      invalidDatesRemoved++;
      tracker.add(
        'invalid_date',
        'with invalid or unreadable dates',
        'error',
        line,
        rawDate.trim() === '' ? 'blank date' : `"${rawDate.trim()}"`
      );
      continue;
    }

    // 2. Numeric columns (a blank Age is kept as 0; a non-numeric Age drops the row)
    const ageBlank = rawAge === undefined ? false : rawAge.trim() === '';
    const ageParsed = parseNumber(rawAge);
    const quantity = parseNumber(rawQuantity);
    const price = parseNumber(rawPrice);
    const total = parseNumber(rawTotal);

    const badNumeric: string[] = [];
    if (!ageBlank && ageParsed === null) badNumeric.push(`Age "${rawAge ?? ''}"`);
    if (quantity === null) badNumeric.push(`Quantity "${rawQuantity ?? ''}"`);
    if (price === null) badNumeric.push(`Price per Unit "${rawPrice ?? ''}"`);
    if (total === null) badNumeric.push(`Total Amount "${rawTotal ?? ''}"`);

    if (badNumeric.length > 0) {
      numericMissingRowsRemoved++;
      tracker.add(
        'missing_numeric',
        'with missing or non-numeric Age, Quantity, Price or Total',
        'error',
        line,
        badNumeric.join(', ')
      );
      continue;
    }

    const age = ageParsed ?? 0;
    const q = quantity as number;
    const p = price as number;
    const t = total as number;

    // 3. Business constraints
    if (q < 0 || p < 0 || t < 0) {
      negativeRemoved++;
      const parts: string[] = [];
      if (q < 0) parts.push(`Quantity ${q}`);
      if (p < 0) parts.push(`Price ${p}`);
      if (t < 0) parts.push(`Total ${t}`);
      tracker.add(
        'negative_amount',
        'with negative Quantity, Price or Total',
        'error',
        line,
        parts.join(', ')
      );
      continue;
    }
    if (q === 0 || p === 0 || t === 0) {
      zeroRemoved++;
      const parts: string[] = [];
      if (q === 0) parts.push('Quantity 0');
      if (p === 0) parts.push('Price 0');
      if (t === 0) parts.push('Total 0');
      tracker.add(
        'zero_amount',
        'with zero Quantity, Price or Total',
        'error',
        line,
        parts.join(', ')
      );
      continue;
    }

    // 4. Duplicates (only valid rows count, so a bad first copy never blocks a good second copy)
    const signature = row.join('|||');
    if (transactionId !== '') {
      const first = seenById.get(transactionId);
      if (first) {
        duplicatesRemoved++;
        const conflict = first.signature !== signature;
        if (conflict) duplicateIdConflicts++;
        tracker.add(
          'duplicate_id',
          'with duplicate Transaction IDs (first occurrence kept)',
          'error',
          line,
          `${transactionId} (first seen on row ${first.line}${conflict ? ', different values' : ''})`
        );
        continue;
      }
      seenById.set(transactionId, { line, signature });
    } else {
      if (seenSignatures.has(signature)) {
        duplicatesRemoved++;
        tracker.add(
          'duplicate_id',
          'with duplicate Transaction IDs (first occurrence kept)',
          'error',
          line,
          'identical row with a blank Transaction ID'
        );
        continue;
      }
      seenSignatures.add(signature);
      tracker.add('blank_id', 'with a blank Transaction ID (kept)', 'warning', line, 'blank Transaction ID');
    }

    // Warnings on rows that are kept
    if (parsedDate.ambiguous) {
      ambiguousDates++;
      tracker.add(
        'ambiguous_date',
        'with ambiguous dates read as DD/MM/YYYY (kept)',
        'warning',
        line,
        `"${rawDate.trim()}"`
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}/.test(rawDate.trim())) {
      tracker.add(
        'wrong_date_format',
        'with non-standard date format (expected YYYY-MM-DD, e.g. DD/MM/YYYY)',
        'warning',
        line,
        `"${rawDate.trim()}"`
      );
    }
    const todayIso = new Date().toISOString().slice(0, 10);
    if (parsedDate.iso > todayIso) {
      tracker.add(
        'future_date',
        'with future transaction dates',
        'warning',
        line,
        `"${parsedDate.iso}"`
      );
    }
    if (!ageBlank && (age < 0 || age > 120)) {
      tracker.add(
        'invalid_age',
        'with Age outside valid range (0-120 years)',
        'warning',
        line,
        `Age ${age}`
      );
    }
    if (Math.abs(t - q * p) > Math.max(1, 0.01 * t)) {
      totalMismatchRows++;
      tracker.add(
        'total_mismatch',
        'where Total Amount differs from Quantity × Price by more than 1% (kept)',
        'warning',
        line,
        `${q} × ${p} = ${Math.round(q * p * 100) / 100}, file says ${t}`
      );
    }

    cleanedRows.push({
      transaction_id: transactionId,
      date: parsedDate.iso,
      customer_id: customerId,
      gender: gender,
      age: Math.round(age),
      product_category: category,
      quantity: Math.round(q),
      price_per_unit: p,
      total_amount: t,
    });
  }

  const report: ExtendedCleaningReport = {
    rows_before: rowsBefore,
    rows_after: cleanedRows.length,
    duplicates_removed: duplicatesRemoved,
    invalid_dates_removed: invalidDatesRemoved,
    numeric_missing_rows_removed: numericMissingRowsRemoved,
    invalid_business_rows_removed: negativeRemoved + zeroRemoved,
    columns: [
      'transaction_id',
      'date',
      'customer_id',
      'gender',
      'age',
      'product_category',
      'quantity',
      'price_per_unit',
      'total_amount',
    ],
    duplicate_id_conflicts: duplicateIdConflicts,
    negative_values_removed: negativeRemoved,
    zero_values_removed: zeroRemoved,
    ambiguous_dates: ambiguousDates,
    total_mismatch_rows: totalMismatchRows,
  };

  const coverage = summarizeCoverage(cleanedRows);
  const quality: DataQuality = {
    source: 'upload',
    rows_in_file: rowsBefore,
    rows_kept: cleanedRows.length,
    rows_dropped: rowsBefore - cleanedRows.length,
    ...coverage,
    missing_values: missingValues,
    warnings: buildWarnings(coverage, cleanedRows.length, rowsBefore),
    issues: tracker.list(),
  };

  return { rows: cleanedRows, report, quality };
}

export function getCSVTemplate(): string {
  return [
    'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount',
    'TXN001,2023-01-15,CUST101,Female,28,Beauty,2,500,1000',
    'TXN002,2023-01-16,CUST102,Male,34,Electronics,1,1200,1200',
    'TXN003,2023-01-17,CUST103,Female,45,Clothing,3,350,1050',
    'TXN004,2023-02-05,CUST104,Male,22,Electronics,2,600,1200',
    'TXN005,2023-02-14,CUST105,Female,31,Beauty,4,250,1000',
  ].join('\n');
}

export function generateDemoDatasetCSV(): string {
  const categories = ['Electronics', 'Clothing', 'Beauty'];
  const prices: Record<string, number[]> = {
    Electronics: [300, 500, 800, 1200, 1500],
    Clothing: [150, 250, 350, 500, 750],
    Beauty: [80, 150, 250, 400, 500],
  };
  const genders = ['Male', 'Female'];
  const rows: string[] = [
    'Transaction ID,Date,Customer ID,Gender,Age,Product Category,Quantity,Price per Unit,Total Amount',
  ];

  // Generate 1000 deterministic realistic rows across 2023
  let txn = 1;
  const startDate = new Date(Date.UTC(2023, 0, 1));

  for (let i = 0; i < 1000; i++) {
    const dayOffset = Math.floor((i / 1000) * 364);
    const date = new Date(startDate);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    const dateStr = date.toISOString().slice(0, 10);

    const category = categories[i % categories.length];
    const catPrices = prices[category];
    const price = catPrices[(i * 7 + 3) % catPrices.length];
    const quantity = 1 + (i % 4);
    const total = price * quantity;
    const gender = genders[(i * 3) % 2];
    const age = 18 + ((i * 13 + 7) % 52);
    const customerId = `CUST${String(100 + (i % 180)).padStart(4, '0')}`;

    rows.push(
      `${txn},${dateStr},${customerId},${gender},${age},${category},${quantity},${price},${total}`
    );
    txn++;
  }

  return rows.join('\n');
}
