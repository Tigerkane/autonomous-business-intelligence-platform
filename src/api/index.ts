/**
 * Unified API Client Module
 * Provides a single abstraction layer for all network data access.
 * Toggle `USE_MOCK = false` to connect seamlessly to production Express backend without touching UI components.
 */

export const USE_MOCK: boolean = true;

export interface SectorOverviewData {
  sectorId: string;
  sectorName: string;
  timeframe: string;
  isMockSample: true;
  kpis: {
    grossRevenue: number;
    momGrowthPercent: number;
    averageOrderValue: number;
    totalOrders: number;
    anomalyCount: number;
  };
  monthlyRevenueSeries: Array<{
    month: string;
    actual: number;
    forecast?: number;
    confidenceLower?: number;
    confidenceUpper?: number;
    isAnomaly?: boolean;
  }>;
  categoryMix: Array<{
    category: string;
    sharePercent: number;
    revenue: number;
    growthPercent: number;
  }>;
  outliersDetected: Array<{
    date: string;
    amount: number;
    expectedMedian: number;
    madZScore: number;
    anomalyType: 'Spike' | 'Dip';
  }>;
  modelComparison: {
    selectedModel: 'Holt-Winters (Additive)' | 'Holt-Winters (Multiplicative)' | 'Linear Trend' | 'Rolling 30-Day';
    mapeScore: number;
    recommendation: string;
  };
}

export const MOCK_SECTORS: Record<string, SectorOverviewData> = {
  apparel: {
    sectorId: 'apparel',
    sectorName: 'Omnichannel Apparel & Footwear',
    timeframe: 'FY 2026 (Sample Data)',
    isMockSample: true,
    kpis: {
      grossRevenue: 1842950,
      momGrowthPercent: 14.2,
      averageOrderValue: 78.4,
      totalOrders: 23507,
      anomalyCount: 3,
    },
    monthlyRevenueSeries: [
      { month: 'Jan', actual: 124000 },
      { month: 'Feb', actual: 131500 },
      { month: 'Mar', actual: 142800 },
      { month: 'Apr', actual: 139200 },
      { month: 'May', actual: 154100 },
      { month: 'Jun', actual: 162400 },
      { month: 'Jul', actual: 158900 },
      { month: 'Aug', actual: 149300, isAnomaly: true },
      { month: 'Sep', actual: 171200 },
      { month: 'Oct', actual: 185600 },
      { month: 'Nov', actual: 210400, forecast: 208500, confidenceLower: 198000, confidenceUpper: 219000 },
      { month: 'Dec', actual: 235800, forecast: 231000, confidenceLower: 219000, confidenceUpper: 243000 },
    ],
    categoryMix: [
      { category: 'Outerwear & Jackets', sharePercent: 38, revenue: 700321, growthPercent: 18.5 },
      { category: 'Footwear & Athletic', sharePercent: 27, revenue: 497596, growthPercent: 12.1 },
      { category: 'Denim & Essentials', sharePercent: 21, revenue: 387019, growthPercent: 8.4 },
      { category: 'Accessories', sharePercent: 14, revenue: 258013, growthPercent: 6.2 },
    ],
    outliersDetected: [
      { date: '2026-08-14', amount: 3200, expectedMedian: 5200, madZScore: -3.8, anomalyType: 'Dip' },
      { date: '2026-10-24', amount: 9800, expectedMedian: 5900, madZScore: 4.1, anomalyType: 'Spike' },
      { date: '2026-11-27', amount: 14200, expectedMedian: 6800, madZScore: 4.9, anomalyType: 'Spike' },
    ],
    modelComparison: {
      selectedModel: 'Holt-Winters (Additive)',
      mapeScore: 4.62,
      recommendation: 'Additive seasonality fits steady baseline growth with predictable holiday uplift.',
    },
  },
  electronics: {
    sectorId: 'electronics',
    sectorName: 'Consumer Electronics & Smart Devices',
    timeframe: 'FY 2026 (Sample Data)',
    isMockSample: true,
    kpis: {
      grossRevenue: 4291800,
      momGrowthPercent: 8.6,
      averageOrderValue: 312.5,
      totalOrders: 13733,
      anomalyCount: 2,
    },
    monthlyRevenueSeries: [
      { month: 'Jan', actual: 310000 },
      { month: 'Feb', actual: 295000 },
      { month: 'Mar', actual: 340000 },
      { month: 'Apr', actual: 322000 },
      { month: 'May', actual: 358000 },
      { month: 'Jun', actual: 375000 },
      { month: 'Jul', actual: 360000 },
      { month: 'Aug', actual: 345000 },
      { month: 'Sep', actual: 410000 },
      { month: 'Oct', actual: 425000 },
      { month: 'Nov', actual: 490000, forecast: 485000, confidenceLower: 460000, confidenceUpper: 510000 },
      { month: 'Dec', actual: 520000, forecast: 515000, confidenceLower: 490000, confidenceUpper: 540000 },
    ],
    categoryMix: [
      { category: 'Audio & Wearables', sharePercent: 42, revenue: 1802556, growthPercent: 14.8 },
      { category: 'Smart Home & Sensors', sharePercent: 28, revenue: 1201704, growthPercent: 9.3 },
      { category: 'Computing & Monitors', sharePercent: 18, revenue: 772524, growthPercent: 5.1 },
      { category: 'Cables & Power', sharePercent: 12, revenue: 515016, growthPercent: 4.0 },
    ],
    outliersDetected: [
      { date: '2026-09-18', amount: 28900, expectedMedian: 12400, madZScore: 4.6, anomalyType: 'Spike' },
      { date: '2026-11-28', amount: 34100, expectedMedian: 15200, madZScore: 5.2, anomalyType: 'Spike' },
    ],
    modelComparison: {
      selectedModel: 'Holt-Winters (Multiplicative)',
      mapeScore: 3.84,
      recommendation: 'Multiplicative model captures escalating Black Friday and Q4 multiplier dynamics.',
    },
  },
  grocery: {
    sectorId: 'grocery',
    sectorName: 'Organic Grocery & Fresh Essentials',
    timeframe: 'FY 2026 (Sample Data)',
    isMockSample: true,
    kpis: {
      grossRevenue: 890450,
      momGrowthPercent: 3.4,
      averageOrderValue: 42.1,
      totalOrders: 21150,
      anomalyCount: 1,
    },
    monthlyRevenueSeries: [
      { month: 'Jan', actual: 68000 },
      { month: 'Feb', actual: 69500 },
      { month: 'Mar', actual: 72000 },
      { month: 'Apr', actual: 71500 },
      { month: 'May', actual: 74200 },
      { month: 'Jun', actual: 76000 },
      { month: 'Jul', actual: 75500 },
      { month: 'Aug', actual: 73000 },
      { month: 'Sep', actual: 77800 },
      { month: 'Oct', actual: 79200 },
      { month: 'Nov', actual: 82500, forecast: 81800, confidenceLower: 78000, confidenceUpper: 85500 },
      { month: 'Dec', actual: 86000, forecast: 85200, confidenceLower: 81000, confidenceUpper: 89000 },
    ],
    categoryMix: [
      { category: 'Fresh Produce & Fruit', sharePercent: 45, revenue: 400702, growthPercent: 4.2 },
      { category: 'Pantry & Bulk Goods', sharePercent: 25, revenue: 222612, growthPercent: 2.8 },
      { category: 'Artisan Bakery', sharePercent: 18, revenue: 160281, growthPercent: 3.1 },
      { category: 'Cold Beverages', sharePercent: 12, revenue: 106854, growthPercent: 1.9 },
    ],
    outliersDetected: [
      { date: '2026-11-25', amount: 7200, expectedMedian: 2600, madZScore: 4.3, anomalyType: 'Spike' },
    ],
    modelComparison: {
      selectedModel: 'Linear Trend',
      mapeScore: 2.91,
      recommendation: 'Linear trend captures weekly repeat purchasing cycles with low seasonal variance.',
    },
  },
};

/**
 * Fetch sector telemetry (mock or backend)
 */
export async function getSectorOverview(sectorId: string = 'apparel'): Promise<SectorOverviewData> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    return MOCK_SECTORS[sectorId] || MOCK_SECTORS.apparel;
  }

  const res = await fetch(`/api/data/sectors/${encodeURIComponent(sectorId)}`);
  if (!res.ok) {
    throw new Error(`Failed to load sector data: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Execute natural language query over sample or live dataset
 */
export async function queryNaturalLanguage(queryText: string, sectorId: string = 'apparel'): Promise<{
  query: string;
  answer: string;
  groundingMetric: string;
  sourceRowsEvaluated: number;
  sampleDataNotice: string;
}> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const clean = queryText.toLowerCase();

    if (clean.includes('margin') || clean.includes('highest') || clean.includes('category')) {
      return {
        query: queryText,
        answer: 'Outerwear & Jackets delivered the highest gross revenue at $700,321 (38% category share) with an 18.5% year-over-year expansion rate.',
        groundingMetric: 'Category Share: 38.0% · Revenue: $700.3k · Unit Velocity: +18.5%',
        sourceRowsEvaluated: 23507,
        sampleDataNotice: 'Sample data: Verified across 23,507 simulated transactions',
      };
    }

    if (clean.includes('outlier') || clean.includes('spike') || clean.includes('drop')) {
      return {
        query: queryText,
        answer: 'Two prominent positive spikes were flagged on Oct 24 ($9,800) and Nov 27 ($14,200), exceeding the 3.5 MAD modified z-score threshold.',
        groundingMetric: 'MAD Threshold: 3.5σ · Peak z-score: 4.9 · Baseline Delta: +108%',
        sourceRowsEvaluated: 365,
        sampleDataNotice: 'Sample data: Evaluated via rolling 31-day Median Absolute Deviation',
      };
    }

    return {
      query: queryText,
      answer: `Analysis of ${MOCK_SECTORS[sectorId]?.sectorName || 'retail operations'} shows resilient month-over-month trajectory with average basket size at $${MOCK_SECTORS[sectorId]?.kpis.averageOrderValue || 78.4}.`,
      groundingMetric: `AOV: $${MOCK_SECTORS[sectorId]?.kpis.averageOrderValue || 78.4} · MoM: +${MOCK_SECTORS[sectorId]?.kpis.momGrowthPercent || 14.2}%`,
      sourceRowsEvaluated: 18450,
      sampleDataNotice: 'Sample data: Synthesized across retail demographic cohorts',
    };
  }

  const res = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question: queryText, sectorId }),
  });
  if (!res.ok) {
    throw new Error('Query failed');
  }
  return res.json();
}
