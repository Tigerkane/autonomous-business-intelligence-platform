import { getAnomalies, getForecast, getOverview, getSalesAnalysis } from './analytics';
import { databaseExists, getDatasetMeta, getSalesRows } from './db';
import type { SaleRow } from './types';

export const DEFAULT_PROVIDER = 'deterministic';

// Change this if your data is not in rupees (the homepage demo uses $)
const CUR = '₹';

// Must match the default used by the Forecast & Anomalies page and the API route
const ANOMALY_THRESHOLD = 3.5;

export interface ProviderInfo {
  id: string;
  label: string;
  model: string;
  configured: boolean;
  note: string;
}

export function availableProviders(): ProviderInfo[] {
  const ollamaCloudConfigured = Boolean(process.env.OLLAMA_API_KEY);

  return [
    {
      id: 'deterministic',
      label: 'Deterministic Mathematical Solver',
      model: 'In-memory solver',
      configured: true,
      note: 'Scans 100% of all rows (e.g. 1,000 rows) directly in memory and answers with zero hallucination.',
    },
    {
      id: 'ollama',
      label: 'Local Ollama · Llama 3.2',
      model: 'llama3.2',
      configured: false, // local port 11434 probe
      note: 'Local Ollama daemon running on http://localhost:11434.',
    },
    {
      id: 'ollama_cloud',
      label: 'Ollama Cloud · GPT-OSS 120B',
      model: 'gpt-oss:120b',
      configured: ollamaCloudConfigured,
      note: 'Hosted Ollama Cloud (ollama.com) running GPT-OSS 120B via OLLAMA_API_KEY.',
    },
  ];
}

export function buildContext(): string {
  if (!databaseExists()) {
    return 'No dataset loaded.';
  }

  const rows = getSalesRows();
  const meta = getDatasetMeta();
  const ov = getOverview(rows);
  const sa = getSalesAnalysis(rows);

  let fcSummary = 'Forecast not available (insufficient months).';
  try {
    const fc = getForecast(rows);
    fcSummary = `Best model: ${fc.model}, Backtest MAPE: ${fc.mape}%, Accuracy: ${fc.accuracy}%. Next month forecasted revenue: ₹${Math.round(fc.next_month_predicted).toLocaleString('en-IN')}.`;
  } catch {
    // continue
  }

  const an = getAnomalies(rows, 5, ANOMALY_THRESHOLD);
  const anomalySummary =
    an.total > 0
      ? `Detected ${an.total} anomalous days (rolling 31-day median baseline, threshold z >= ${ANOMALY_THRESHOLD}). Top anomaly: Date ${an.data[0]?.date}, Actual: ₹${Math.round(an.data[0]?.value).toLocaleString('en-IN')}, Expected: ₹${Math.round(an.data[0]?.expected).toLocaleString('en-IN')} (${an.data[0]?.deviation}).`
      : 'No anomalies detected.';

  const catSummary = sa.categories
    .map(
      (c) =>
        `- ${c.category}: Revenue ₹${Math.round(c.revenue).toLocaleString('en-IN')} (${c.share}% share), Units: ${c.units}, Orders: ${c.orders}, Avg Order: ₹${c.avg_order}`
    )
    .join('\n');

  const monthSummary = ov.monthly
    .map(
      (m) =>
        `- ${m.month}: ₹${Math.round(m.total_revenue).toLocaleString('en-IN')}${m.partial ? ' (partial month)' : ''}`
    )
    .join('\n');

  const ageSummary = ov.segments.age
    .map((a) => `${a.segment}: ${a.count} customers (₹${Math.round(a.revenue).toLocaleString('en-IN')})`)
    .join(', ');

  const genderSummary = ov.segments.gender
    .map((g) => `${g.segment}: ${g.count} customers (₹${Math.round(g.revenue).toLocaleString('en-IN')})`)
    .join(', ');

  return `
DATASET CONTEXT:
Filename: ${meta.filename || 'retail_sales.csv'}
Total Transactions / Rows: ${ov.dataset.rows}
Date Range: ${ov.dataset.start} to ${ov.dataset.end}
Total Revenue: ₹${Math.round(ov.kpis.total_sales).toLocaleString('en-IN')}
Total Units Sold: ${ov.kpis.total_quantity}
Average Transaction Value: ₹${ov.kpis.average_transaction}

MONTH-OVER-MONTH TRENDS:
${ov.trends.label ? `Comparing ${ov.trends.label}: Revenue ${ov.trends.revenue}%, Units ${ov.trends.units}%, Orders ${ov.trends.transactions}%, Avg Order ${ov.trends.avg}%` : 'Not enough full months for MoM'}

PRODUCT CATEGORY PERFORMANCE:
${catSummary}

MONTHLY REVENUE:
${monthSummary}

CUSTOMER DEMOGRAPHICS:
Age groups: ${ageSummary}
Gender: ${genderSummary}

ANOMALY DETECTION:
${anomalySummary}

SALES FORECAST (NEXT 6 MONTHS):
${fcSummary}

AUTOMATED BUSINESS INSIGHTS:
${sa.insights.join('\n')}
`.trim();
}

// ---------------------------------------------------------------------------
// Provider router
// ---------------------------------------------------------------------------

export async function askLLM(
  question: string,
  context: string,
  requestedProvider?: string
): Promise<{ answer: string; model: string; provider: string }> {
  const provider = requestedProvider || DEFAULT_PROVIDER;

  // 1. Local Ollama (llama3.2)
  if (provider === 'ollama') {
    try {
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `You are an Autonomous Business Intelligence Analyst. Based on the dataset summary below, answer the question accurately:\n\n${context}\n\nQuestion: ${question}`,
          stream: false,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as any;
        if (data.response) {
          return { answer: data.response, model: 'llama3.2', provider: 'ollama' };
        }
      }
    } catch {
      // local daemon not running or unreachable
    }

    return {
      answer: solveDeterministic(question),
      model: 'Deterministic Mathematical Solver (Ollama unavailable)',
      provider: 'ollama',
    };
  }

  // 2. Ollama Cloud (hosted API, GPT-OSS 120B)
  if (provider === 'ollama_cloud') {
    const key = process.env.OLLAMA_API_KEY;
    if (key) {
      try {
        const res = await fetch('https://ollama.com/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: 'gpt-oss:120b',
            stream: false,
            messages: [
              {
                role: 'system',
                content:
                  'You are the lead analytical AI engine for the Autonomous Business Intelligence Platform. Answer the user question strictly using the provided dataset aggregate statistics. Use bullet points and exact metrics. If the context does not contain the answer, say so.',
              },
              { role: 'user', content: `CONTEXT:\n${context}\n\nQUESTION:\n${question}` },
            ],
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const text = data.message?.content;
          if (text) {
            return { answer: text, model: 'gpt-oss:120b', provider: 'ollama_cloud' };
          }
        } else {
          console.warn('Ollama Cloud returned status', res.status);
        }
      } catch (err: any) {
        console.warn('Ollama Cloud query failed:', err.message);
      }
    }

    return {
      answer: solveDeterministic(question),
      model: 'Deterministic Mathematical Solver (Ollama Cloud unavailable)',
      provider: 'ollama_cloud',
    };
  }

  // 3. Deterministic Mathematical Solver (default; also catches any stale saved provider id)
  return {
    answer: solveDeterministic(question),
    model: 'Deterministic Mathematical Solver',
    provider: 'deterministic',
  };
}

// ---------------------------------------------------------------------------
// Deterministic Mathematical Solver
// Scans 100% of all rows directly in memory. Every number below is computed
// from the loaded dataset; nothing is generated or estimated by a language model.
// ---------------------------------------------------------------------------

const money = (n: number) => `${CUR}${Math.round(n).toLocaleString('en-IN')}`;
const num = (n: number) => Math.round(n).toLocaleString('en-IN');
const pct = (part: number, whole: number) => (whole > 0 ? ((part / whole) * 100).toFixed(1) : '0.0');

function groupSum<K extends string>(rows: SaleRow[], keyOf: (r: SaleRow) => K) {
  const map = new Map<K, { revenue: number; orders: number; units: number }>();
  for (const r of rows) {
    const k = keyOf(r);
    const cur = map.get(k) || { revenue: 0, orders: 0, units: 0 };
    cur.revenue += r.total_amount;
    cur.orders += 1;
    cur.units += r.quantity;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Whole-word matching so "average" does not match "age" and "segment" does not match "men".
// Longer stems (5+ letters, e.g. "categor", "anomal") match at the start of a word, so
// "categories" and "anomalies" still work. Short words (4 letters or fewer) must match
// the whole word, with an optional plural "s".
function has(q: string, ...words: string[]) {
  return words.some((w) => {
    const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = w.length <= 4 ? new RegExp(`\\b${esc}(s)?\\b`) : new RegExp(`\\b${esc}`);
    return re.test(q);
  });
}

export function solveDeterministic(question: string): string {
  if (!databaseExists()) {
    return 'No dataset is loaded yet. Upload a CSV or load the sample dataset first.';
  }

  const rows = getSalesRows();
  if (rows.length === 0) {
    return 'The loaded dataset has no valid rows.';
  }

  const q = question.toLowerCase();
  const totalRevenue = rows.reduce((s, r) => s + r.total_amount, 0);
  const totalUnits = rows.reduce((s, r) => s + r.quantity, 0);
  const receipt = `\n\n_Computed from ${num(rows.length)} of ${num(rows.length)} rows (100% scanned). No estimation or generated text._`;

  // Forecast
  if (has(q, 'forecast', 'predict', 'future', 'next month', 'projection')) {
    try {
      const fc = getForecast(rows);
      return `### Sales Forecast
- **Selected model**: ${fc.model}
- **Backtest MAPE**: ${fc.mape}% (accuracy ${fc.accuracy}%)
- **Next month forecast revenue**: ${money(fc.next_month_predicted)}

The model was chosen by walk-forward backtesting on your own monthly history.${receipt}`;
    } catch {
      return `### Sales Forecast\nThere are not enough full months of data to produce a reliable forecast.${receipt}`;
    }
  }

  // Anomalies
  if (has(q, 'anomal', 'outlier', 'spike', 'unusual', 'drop', 'dip')) {
    const an = getAnomalies(rows, 5, ANOMALY_THRESHOLD);
    if (an.total === 0) {
      return `### Anomaly Detection\nNo anomalies were detected at the current threshold (z >= ${ANOMALY_THRESHOLD}).${receipt}`;
    }
    const list = an.data
      .slice(0, 5)
      .map((a: any) => `- **${a.date}**: actual ${money(a.value)} vs expected ${money(a.expected)} (${a.deviation})`)
      .join('\n');
    return `### Anomaly Detection
**${an.total}** anomalous days found using a rolling 31-day median baseline with a modified z-score (threshold ${ANOMALY_THRESHOLD}). Top flagged days:
${list}${receipt}`;
  }

  // Category / product
  if (has(q, 'categor', 'product', 'best seller', 'bestseller', 'top selling')) {
    const cats = groupSum(rows, (r) => r.product_category);
    const worst = has(q, 'lowest', 'worst', 'least', 'weakest', 'bottom');
    const lead = worst ? cats[cats.length - 1] : cats[0];
    const table = cats
      .map(
        (c, i) =>
          `${i + 1}. **${c.key}**: ${money(c.revenue)} (${pct(c.revenue, totalRevenue)}%), ${num(c.orders)} orders, ${num(c.units)} units, avg order ${money(c.revenue / c.orders)}`
      )
      .join('\n');
    return `### Product Category Performance
**${worst ? 'Lowest' : 'Highest'} revenue category: ${lead.key}** with ${money(lead.revenue)} (${pct(lead.revenue, totalRevenue)}% of total).

All ${cats.length} categories ranked by revenue:
${table}${receipt}`;
  }

  // Gender
  if (has(q, 'gender', 'male', 'female', 'men', 'women')) {
    const g = groupSum(rows, (r) => r.gender);
    const table = g
      .map(
        (x) =>
          `- **${x.key}**: ${money(x.revenue)} (${pct(x.revenue, totalRevenue)}%), ${num(x.orders)} orders, avg order ${money(x.revenue / x.orders)}`
      )
      .join('\n');
    return `### Revenue by Gender
**${g[0].key}** customers generate the most revenue.
${table}${receipt}`;
  }

  // Age
  if (has(q, 'age', 'demographic', 'segment', 'generation')) {
    const bucket = (a: number) =>
      a < 25 ? '18-24' : a < 35 ? '25-34' : a < 45 ? '35-44' : a < 55 ? '45-54' : '55+';
    const g = groupSum(rows, (r) => bucket(r.age));
    const table = g
      .map(
        (x) =>
          `- **${x.key}**: ${money(x.revenue)} (${pct(x.revenue, totalRevenue)}%), ${num(x.orders)} orders, avg order ${money(x.revenue / x.orders)}`
      )
      .join('\n');
    return `### Revenue by Age Group
**${g[0].key}** is the highest-revenue age group.
${table}${receipt}`;
  }

  // Customers
  if (has(q, 'customer', 'buyer', 'client')) {
    const byCust = groupSum(rows, (r) => r.customer_id);
    const top = byCust
      .slice(0, 5)
      .map((c, i) => `${i + 1}. **${c.key}**: ${money(c.revenue)} across ${num(c.orders)} orders`)
      .join('\n');
    return `### Customers
- **Unique customers**: ${num(byCust.length)}
- **Average revenue per customer**: ${money(totalRevenue / byCust.length)}

Top 5 customers by revenue:
${top}${receipt}`;
  }

  // Monthly trends
  if (has(q, 'month', 'trend', 'growth', 'mom', 'season', 'best period', 'peak')) {
    const ov = getOverview(rows);
    const full = ov.monthly.filter((m: any) => !m.partial);
    const list = ov.monthly
      .map((m: any) => `- ${m.month}: ${money(m.total_revenue)}${m.partial ? ' (partial month)' : ''}`)
      .join('\n');
    let extra = '';
    if (full.length > 0) {
      const best = full.reduce((a: any, b: any) => (b.total_revenue > a.total_revenue ? b : a));
      const low = full.reduce((a: any, b: any) => (b.total_revenue < a.total_revenue ? b : a));
      extra = `\n**Best full month**: ${best.month} (${money(best.total_revenue)}). **Weakest full month**: ${low.month} (${money(low.total_revenue)}).`;
    }
    const mom = ov.trends.label
      ? `\n**Latest MoM (${ov.trends.label})**: revenue ${ov.trends.revenue}%, units ${ov.trends.units}%, orders ${ov.trends.transactions}%.`
      : '';
    return `### Monthly Revenue\n${list}${extra}${mom}${receipt}`;
  }

  // Average order value
  if (has(q, 'average', 'avg', 'aov', 'basket', 'per order', 'per transaction')) {
    return `### Average Order Value
- **Average transaction value**: ${money(totalRevenue / rows.length)}
- **Average units per transaction**: ${(totalUnits / rows.length).toFixed(2)}
- Based on ${num(rows.length)} transactions totalling ${money(totalRevenue)}.${receipt}`;
  }

  // Date range
  if (has(q, 'date range', 'period', 'timeframe', 'time frame', 'from when', 'how long')) {
    const dates = rows.map((r) => r.date).sort();
    return `### Dataset Coverage\n- **Date range**: ${dates[0]} to ${dates[dates.length - 1]}\n- **Rows**: ${num(rows.length)}${receipt}`;
  }

  // Totals
  if (has(q, 'total', 'revenue', 'sales', 'how many', 'transactions', 'orders', 'units', 'rows', 'overall', 'summary', 'overview')) {
    const dates = rows.map((r) => r.date).sort();
    const cats = groupSum(rows, (r) => r.product_category);
    return `### Dataset Overview
- **Total revenue**: ${money(totalRevenue)}
- **Transactions**: ${num(rows.length)}
- **Units sold**: ${num(totalUnits)}
- **Average transaction value**: ${money(totalRevenue / rows.length)}
- **Date range**: ${dates[0]} to ${dates[dates.length - 1]}
- **Categories**: ${cats.length} (top: ${cats[0].key}, ${money(cats[0].revenue)})${receipt}`;
  }

  // Unmatched question: be honest instead of guessing
  return `I couldn't match that question to a calculation I can run exactly. The solver can answer questions about:
- **Categories** (best/worst category, revenue by product)
- **Gender** and **age group** revenue
- **Customers** (top customers, unique customers)
- **Monthly trends** and growth
- **Average order value**
- **Totals** (revenue, transactions, units, date range)
- **Forecast** and **anomalies**

Try rephrasing, for example: "Which product category has the lowest revenue?"${receipt}`;
}
