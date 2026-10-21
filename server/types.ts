export interface SaleRow {
  transaction_id: string;
  date: string; // YYYY-MM-DD
  customer_id: string;
  gender: string;
  age: number;
  product_category: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
}

export interface DatasetMeta {
  filename: string;
  uploaded_at: string;
}

export interface CleaningReport {
  rows_before: number;
  rows_after: number;
  duplicates_removed: number;
  invalid_dates_removed: number;
  numeric_missing_rows_removed: number;
  invalid_business_rows_removed: number;
  columns: string[];
}

export interface KPIs {
  total_sales: number;
  total_quantity: number;
  total_transactions: number;
  average_transaction: number;
}
