import type { CleaningReport, SaleRow } from './types';

export interface IssueExample {
  /** Line number in the uploaded file (the header row is line 1) */
  row: number;
  detail: string;
}

export interface ValidationIssue {
  code: string;
  /** Completes the sentence "N rows ..." (e.g. "with invalid or unreadable dates") */
  label: string;
  /** error = the rows were dropped, warning = the rows were kept */
  severity: 'error' | 'warning';
  count: number;
  examples: IssueExample[];
}

export interface DataQuality {
  /** upload = computed from the original file, stored = recomputed from saved rows */
  source: 'upload' | 'stored';
  rows_in_file: number;
  rows_kept: number;
  rows_dropped: number;
  date_start: string;
  date_end: string;
  span_days: number;
  months_with_data: number;
  days_with_sales: number;
  avg_transactions_per_day: number;
  /** Blank cells per required column, counted in the original file */
  missing_values: Record<string, number>;
  warnings: string[];
  issues: ValidationIssue[];
}

export interface ExtendedCleaningReport extends CleaningReport {
  duplicate_id_conflicts: number;
  negative_values_removed: number;
  zero_values_removed: number;
  ambiguous_dates: number;
  total_mismatch_rows: number;
}

/** One-line summary of the issues that caused rows to be dropped (for error messages). */
export function describeIssues(q: DataQuality): string {
  const errs = q.issues.filter((i) => i.severity === 'error' && i.count > 0);
  if (errs.length === 0) return '';
  return (
    errs
      .map((i) => {
        const where = i.examples.length
          ? ` (e.g. ${i.examples.map((e) => `row ${e.row}`).join(', ')})`
          : '';
        return `${i.count} ${i.count === 1 ? 'row' : 'rows'} ${i.label}${where}`;
      })
      .join('; ') + '.'
  );
}

interface Coverage {
  date_start: string;
  date_end: string;
  span_days: number;
  months_with_data: number;
  days_with_sales: number;
  avg_transactions_per_day: number;
}

export function summarizeCoverage(rows: SaleRow[]): Coverage {
  if (rows.length === 0) {
    return {
      date_start: '',
      date_end: '',
      span_days: 0,
      months_with_data: 0,
      days_with_sales: 0,
      avg_transactions_per_day: 0,
    };
  }
  const days = new Set<string>();
  const months = new Set<string>();
  let min = rows[0].date;
  let max = rows[0].date;
  for (const r of rows) {
    days.add(r.date);
    months.add(r.date.slice(0, 7));
    if (r.date < min) min = r.date;
    if (r.date > max) max = r.date;
  }
  const span =
    Math.round((Date.parse(`${max}T00:00:00Z`) - Date.parse(`${min}T00:00:00Z`)) / 86400000) + 1;
  return {
    date_start: min,
    date_end: max,
    span_days: span,
    months_with_data: months.size,
    days_with_sales: days.size,
    avg_transactions_per_day: Math.round((rows.length / span) * 100) / 100,
  };
}

export function buildWarnings(c: Coverage, rowsKept: number, rowsInFile: number): string[] {
  const w: string[] = [];
  if (rowsKept === 0) return w;

  if (c.months_with_data < 6) {
    w.push(
      `Very short history: only ${c.months_with_data} month(s) of data (${c.date_start} to ${c.date_end}). The forecast will be unreliable.`
    );
  } else if (c.months_with_data < 24) {
    w.push(
      `Short history: ${c.months_with_data} months of data (${c.date_start} to ${c.date_end}). Forecasts are indicative only; 24+ months are needed to model seasonality.`
    );
  }

  if (c.avg_transactions_per_day < 5) {
    w.push(
      `Low volume: about ${c.avg_transactions_per_day} transactions per day on average, so daily revenue and anomaly scores will be noisy.`
    );
  }

  const gapDays = c.span_days - c.days_with_sales;
  if (c.span_days > 0 && gapDays / c.span_days > 0.1) {
    w.push(
      `${gapDays} of ${c.span_days} days in the date range have no sales (${Math.round((gapDays / c.span_days) * 100)}%).`
    );
  }

  if (rowsKept < 100) {
    w.push(`Small dataset: only ${rowsKept} valid rows. Statistics may not be representative.`);
  }

  const dropped = rowsInFile - rowsKept;
  if (rowsInFile > 0 && dropped / rowsInFile > 0.1) {
    w.push(
      `${dropped} of ${rowsInFile} rows (${Math.round((dropped / rowsInFile) * 100)}%) were dropped during validation. Check the source file.`
    );
  }
  return w;
}

/** Quality summary recomputed from stored rows (used when no upload-time summary was saved). */
export function qualityFromRows(rows: SaleRow[]): DataQuality {
  const c = summarizeCoverage(rows);
  return {
    source: 'stored',
    rows_in_file: rows.length,
    rows_kept: rows.length,
    rows_dropped: 0,
    ...c,
    missing_values: {},
    warnings: buildWarnings(c, rows.length, rows.length),
    issues: [],
  };
}
