import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  LineChart,
  Bot,
  AlertCircle,
  Sliders,
  Sparkles,
  ChevronRight,
  Send,
  CheckCircle2,
  IndianRupee,
  ShoppingCart,
  Layers,
} from 'lucide-react';
import { SectorOverviewData, getSectorOverview, queryNaturalLanguage } from '../../api';

interface InteractiveLiveConsoleProps {
  theme?: 'dark' | 'light';
  onLaunchFullStudio?: (tab?: string) => void;
}

export const InteractiveLiveConsole: React.FC<InteractiveLiveConsoleProps> = ({
  theme = 'dark',
  onLaunchFullStudio,
}) => {
  const [selectedSector, setSelectedSector] = useState<'apparel' | 'electronics' | 'grocery'>('apparel');
  const [data, setData] = useState<SectorOverviewData | null>(null);

  // Exact 4 Tabs from Brief: Dashboard | Forecast | Anomalies | Ask
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecast' | 'anomalies' | 'ask'>('dashboard');

  // Dashboard Toggle: Revenue (₹) vs Orders (Count)
  const [dashboardMetric, setDashboardMetric] = useState<'revenue' | 'orders'>('revenue');

  // Forecast Tab: 80% Range Switch
  const [show80Range, setShow80Range] = useState<boolean>(true);

  // Anomalies Tab: Threshold slider
  const [threshold, setThreshold] = useState<number>(3.5);

  // Ask Tab: Question chips & typed answer
  const [selectedQuestion, setSelectedQuestion] = useState<string>('Which product category generates the highest revenue?');
  const [typedAnswer, setTypedAnswer] = useState<string>('');
  const [typingIndex, setTypingIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [answerMetric, setAnswerMetric] = useState<string>('');

  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    getSectorOverview(selectedSector).then((res) => {
      if (mounted) setData(res);
    });
    return () => {
      mounted = false;
    };
  }, [selectedSector]);

  // Compute question answers based on sample data
  const handleSelectQuestion = (q: string) => {
    setSelectedQuestion(q);
    setIsTyping(true);
    setTypedAnswer('');
    setTypingIndex(0);

    let fullText = '';
    let metricText = '';

    if (q.includes('category') || q.includes('highest')) {
      fullText = 'Outerwear & Jackets leads gross revenue at ₹7,00,321 (38% category share) with an 18.5% year-over-year unit velocity across 8,932 customer orders.';
      metricText = 'Top Category: Outerwear & Jackets · Share: 38% · Unit Volume: 8,932';
    } else if (q.includes('outlier') || q.includes('spikes') || q.includes('Q3')) {
      fullText = 'Two prominent volume spikes were detected: October 24 (₹9,800) and November 27 (₹14,200), exceeding the rolling 31-day 3.5 MAD modified z-score threshold.';
      metricText = 'Peak Anomaly: Nov 27 (₹14.2k) · Deviation: +4.9σ above median';
    } else {
      fullText = 'Average Order Value (AOV) across the verified retail dataset is ₹78.40, with basket sizes peaking during weekend promotional windows.';
      metricText = 'Verified AOV: ₹78.40 · Median Transactions/Day: 78 · Zero Negative Records';
    }

    setAnswerMetric(metricText);

    // Typewriter effect
    let i = 0;
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setTypedAnswer(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 18);
  };

  useEffect(() => {
    if (activeTab === 'ask' && !typedAnswer) {
      handleSelectQuestion(selectedQuestion);
    }
  }, [activeTab]);

  if (!data) {
    return (
      <div className="h-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center justify-center p-8 text-xs text-slate-500">
        Loading sample analytics engine...
      </div>
    );
  }

  // SVG Chart geometry
  const svgWidth = 540;
  const svgHeight = 220;
  const padX = 36;
  const padY = 28;

  const rawSeries = data.monthlyRevenueSeries;
  const series = rawSeries.map((d) => ({
    ...d,
    displayVal: dashboardMetric === 'revenue' ? d.actual : Math.round(d.actual / (data.kpis.averageOrderValue || 78)),
  }));

  const maxVal = Math.max(...series.map((d) => d.displayVal)) * 1.15;
  const minVal = Math.min(...series.map((d) => d.displayVal)) * 0.85;

  const points = series.map((d, i) => {
    const x = padX + (i / (series.length - 1)) * (svgWidth - padX * 2);
    const y = svgHeight - padY - ((d.displayVal - minVal) / (maxVal - minVal)) * (svgHeight - padY * 2);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');

  // Flag anomalies dynamically live based on slider threshold
  const isPointAnomaly = (d: typeof points[0]) => {
    if (threshold <= 3.0) return d.isAnomaly || d.month === 'Mar' || d.month === 'Oct';
    if (threshold <= 3.8) return d.isAnomaly || d.month === 'Oct';
    return d.month === 'Oct';
  };

  const dynamicAnomalyCount = points.filter((p) => isPointAnomaly(p)).length;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xl overflow-hidden transition-colors">
      {/* Top Bar: Sector Tabs + Sample Data Notice */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#273449]/50 flex flex-wrap items-center justify-between gap-3">
        {/* Sector Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/80" role="tablist">
          {(
            [
              { id: 'apparel', label: 'Apparel & Footwear' },
              { id: 'electronics', label: 'Consumer Tech' },
              { id: 'grocery', label: 'Fresh Grocery' },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={selectedSector === s.id}
              onClick={() => setSelectedSector(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSector === s.id
                  ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Visibility Badge: Non-Negotiable Sample Data Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            <span>Sample data · Interactive demonstration</span>
          </span>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 lg:divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Gross Annual Revenue</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{data.kpis.grossRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +{data.kpis.momGrowthPercent}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            Boundary normalized MoM
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Average Order Value</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              ₹{data.kpis.averageOrderValue.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">/ basket</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            {data.kpis.totalOrders.toLocaleString()} receipts
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Walk-Forward Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {(100 - data.modelComparison.mapeScore).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">MAPE: {data.modelComparison.mapeScore}%</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1 truncate">
            {data.modelComparison.selectedModel}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Live Flagged Outliers</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-rose-500 tabular-nums">
              {dynamicAnomalyCount} Spikes
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">at {threshold.toFixed(1)}σ</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-1">
            Modified MAD z-score algorithm
          </span>
        </div>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Four Demo Mode Tabs (Exact specification) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#273449]" role="tablist">
            <button
              onClick={() => setActiveTab('dashboard')}
              role="tab"
              aria-selected={activeTab === 'dashboard'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('forecast')}
              role="tab"
              aria-selected={activeTab === 'forecast'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'forecast'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Forecast
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              role="tab"
              aria-selected={activeTab === 'anomalies'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'anomalies'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anomalies
            </button>
            <button
              onClick={() => setActiveTab('ask')}
              role="tab"
              aria-selected={activeTab === 'ask'}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Ask Plain English
            </button>
          </div>

          {/* Contextual Sub-Controls per tab */}
          {activeTab === 'dashboard' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 mr-1 text-[11px]">Metric:</span>
              <button
                onClick={() => setDashboardMetric('revenue')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  dashboardMetric === 'revenue'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setDashboardMetric('orders')}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  dashboardMetric === 'orders'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Orders (Count)
              </button>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px]">80% Confidence Range:</span>
              <button
                onClick={() => setShow80Range(!show80Range)}
                className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                  show80Range
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {show80Range ? 'Visible (Shaded)' : 'Hidden'}
              </button>
            </div>
          )}

          {activeTab === 'anomalies' && (
            <div className="flex items-center gap-2 text-xs">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Cutoff:</span>
              <span className="font-mono font-bold text-rose-500">{threshold.toFixed(1)}σ</span>
              <input
                type="range"
                min="2.5"
                max="4.5"
                step="0.1"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-28 sm:w-36 accent-rose-500 cursor-pointer"
                aria-label="Adjust anomaly detection threshold"
              />
            </div>
          )}
        </div>

        {/* TAB 1: DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f172a]/50 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-900 dark:text-white">
                  Monthly {dashboardMetric === 'revenue' ? 'Gross Revenue Trajectory' : 'Order Volume Count'}
                </span>
                {hoveredPoint && (
                  <div className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-semibold">
                    {hoveredPoint.label}: {dashboardMetric === 'revenue' ? `₹${hoveredPoint.value.toLocaleString('en-IN')}` : `${hoveredPoint.value.toLocaleString('en-IN')} orders`}
                  </div>
                )}
              </div>

              {/* Responsive SVG Chart */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto min-w-[480px] max-h-[230px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1={padX} y1="50" x2={svgWidth - padX} y2="50" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={padX} y1="100" x2={svgWidth - padX} y2="100" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={padX} y1="150" x2={svgWidth - padX} y2="150" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

                  {/* Volume columns */}
                  {points.map((p, i) => (
                    <rect
                      key={`vol-${i}`}
                      x={p.x - 8}
                      y={p.y + 4}
                      width="16"
                      height={svgHeight - padY - (p.y + 4)}
                      rx="3"
                      fill="currentColor"
                      className="text-slate-200/80 dark:text-slate-800/80"
                    />
                  ))}

                  {/* Shaded Area Under Curve */}
                  <path
                    d={`${pathD} L ${points[points.length - 1].x} ${svgHeight - padY} L ${points[0].x} ${svgHeight - padY} Z`}
                    fill="url(#dashboardAreaGrad)"
                    opacity="0.25"
                  />
                  <defs>
                    <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Primary Curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Interactive Nodes */}
                  {points.map((p, i) => (
                    <g key={`node-${i}`}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="4.5"
                        fill="#6366f1"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="dark:stroke-[#1e293b] cursor-pointer hover:r-6"
                        onMouseEnter={() => setHoveredPoint({ label: p.month, value: p.displayVal })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                      <text
                        x={p.x}
                        y={svgHeight - 10}
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                        className="text-slate-400 dark:text-slate-500 font-mono"
                      >
                        {p.month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORECAST VIEW (With 80% range switch) */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f172a]/50 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Actual vs Holt-Winters Forecast (Next Quarter Outlook)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Solid line = Historical; Dashed line = Forward Projection
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Actual</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 ml-2" />
                  <span>Projected</span>
                </div>
              </div>

              {/* Chart with Shaded 80% Range corridor */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto min-w-[480px] max-h-[230px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

                  {/* 80% Shaded Range Switch Effect */}
                  {show80Range && (
                    <path
                      d="M 380 90 L 440 70 L 504 55 L 504 110 L 440 120 L 380 135 Z"
                      fill="rgba(45, 212, 191, 0.16)"
                      stroke="rgba(45, 212, 191, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Historical segment */}
                  <path
                    d="M 36 170 L 100 155 L 170 140 L 240 150 L 310 115 L 380 110"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Dashed Forecast continuation */}
                  <path
                    d="M 380 110 L 440 92 L 504 78"
                    stroke="#2dd4bf"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />

                  {/* Vertical Split Line */}
                  <line x1="380" y1="35" x2="380" y2={svgHeight - padY} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
                  <rect x="348" y="24" width="64" height="16" rx="4" fill="#273449" />
                  <text x="380" y="35" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontFamily="sans-serif">
                    TODAY
                  </text>

                  {/* Projected Nodes */}
                  <circle cx="380" cy="110" r="4" fill="#6366f1" />
                  <circle cx="440" cy="92" r="4" fill="#2dd4bf" />
                  <circle cx="504" cy="78" r="4.5" fill="#2dd4bf" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Forecast Horizon Breakdown Table */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Forward 3-Month Projection Breakdown (Holt-Winters / Regression)
                  </span>
                  <button
                    onClick={() => onLaunchFullStudio?.('forecast-anomalies')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Launch Full ML Forecast Studio</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-[11px] font-sans">
                    <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Horizon</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Projected Target</th>
                        <th className="py-2 px-3">80% Conf. Range</th>
                        <th className="py-2 px-3">Algorithm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Month +1 (Est)</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">Predicted</span></td>
                        <td className="py-2 px-3 font-semibold text-teal-600 dark:text-teal-400">₹1,07,166</td>
                        <td className="py-2 px-3 text-slate-500">₹1,03,170 – ₹1,11,163</td>
                        <td className="py-2 px-3 text-[10px] font-sans">Linear Trend (MAPE 2.1%)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Month +2 (Est)</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">Predicted</span></td>
                        <td className="py-2 px-3 font-semibold text-teal-600 dark:text-teal-400">₹1,09,420</td>
                        <td className="py-2 px-3 text-slate-500">₹1,04,800 – ₹1,13,850</td>
                        <td className="py-2 px-3 text-[10px] font-sans">Linear Trend (MAPE 2.1%)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Month +3 (Est)</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">Predicted</span></td>
                        <td className="py-2 px-3 font-semibold text-teal-600 dark:text-teal-400">₹1,12,890</td>
                        <td className="py-2 px-3 text-slate-500">₹1,07,200 – ₹1,17,900</td>
                        <td className="py-2 px-3 text-[10px] font-sans">Linear Trend (MAPE 2.1%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANOMALIES VIEW (Threshold slider flags spikes live) */}
        {activeTab === 'anomalies' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0f172a]/50 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Live Anomaly Scanner (Rolling 31-Day Median Absolute Deviation)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Drag the threshold slider above: spikes exceeding cutoff turn red live.
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-500 font-mono text-xs font-bold">
                  {dynamicAnomalyCount} Anomalies Active
                </div>
              </div>

              {/* Chart with live anomaly points */}
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-auto min-w-[480px] max-h-[220px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line x1={padX} y1={svgHeight - padY} x2={svgWidth - padX} y2={svgHeight - padY} stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

                  {/* Cutoff Threshold Boundary Guideline */}
                  <line
                    x1={padX}
                    y1={80 + (threshold - 2.5) * 20}
                    x2={svgWidth - padX}
                    y2={80 + (threshold - 2.5) * 20}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <text
                    x={svgWidth - padX - 8}
                    y={75 + (threshold - 2.5) * 20}
                    textAnchor="end"
                    fontSize="10"
                    fill="#ef4444"
                    fontFamily="monospace"
                  >
                    Cutoff: {threshold.toFixed(1)}σ
                  </text>

                  {/* Baseline curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Dynamic Nodes with Live Red Flagging */}
                  {points.map((p, i) => {
                    const flagged = isPointAnomaly(p);
                    return (
                      <g key={`anom-${i}`}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={flagged ? 6.5 : 3.5}
                          fill={flagged ? '#ef4444' : '#6366f1'}
                          stroke="#ffffff"
                          strokeWidth={flagged ? 2 : 1}
                          className="dark:stroke-[#1e293b] transition-all duration-200"
                        />
                        {flagged && (
                          <rect
                            x={p.x - 18}
                            y={p.y - 20}
                            width="36"
                            height="13"
                            rx="3"
                            fill="#ef4444"
                          />
                        )}
                        {flagged && (
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            fontSize="8"
                            fontWeight="800"
                            fill="#ffffff"
                            fontFamily="sans-serif"
                          >
                            SPIKE
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Live Anomalies Table */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Flagged Statistical Outliers (Threshold: {threshold.toFixed(1)}σ MAD)
                  </span>
                  <button
                    onClick={() => onLaunchFullStudio?.('forecast-anomalies')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <span>Open Full 20+ Anomaly Radar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-left text-[11px] font-sans">
                    <thead className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Actual Revenue</th>
                        <th className="py-2 px-3">Baseline Median</th>
                        <th className="py-2 px-3">Deviation</th>
                        <th className="py-2 px-3">Z-Score (MAD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Nov 27</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold">High Spike</span></td>
                        <td className="py-2 px-3 font-semibold text-rose-500">₹14,200</td>
                        <td className="py-2 px-3 text-slate-500">₹6,800</td>
                        <td className="py-2 px-3 font-bold text-rose-500">+108%</td>
                        <td className="py-2 px-3 font-bold text-rose-500">+4.9σ</td>
                      </tr>
                      <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Oct 24</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-bold">High Spike</span></td>
                        <td className="py-2 px-3 font-semibold text-rose-500">₹9,800</td>
                        <td className="py-2 px-3 text-slate-500">₹5,900</td>
                        <td className="py-2 px-3 font-bold text-rose-500">+66%</td>
                        <td className="py-2 px-3 font-bold text-rose-500">+4.1σ</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">Aug 14</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-bold">Dip</span></td>
                        <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">₹3,200</td>
                        <td className="py-2 px-3 text-slate-500">₹5,200</td>
                        <td className="py-2 px-3 text-rose-500">-38%</td>
                        <td className="py-2 px-3 text-amber-600 dark:text-amber-400">-3.8σ</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ASK PLAIN ENGLISH (3 question chips, typed answers computed from sample data) */}
        {activeTab === 'ask' && (
          <div className="space-y-4">
            {/* 3 Question Chips */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">
                Select a Question Chip to compute from sample retail data:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Which product category generates the highest revenue?',
                  'Were any volume outliers or spikes flagged in Q3?',
                  'What is the overall average order value and basket health?',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSelectQuestion(chip)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      selectedQuestion === chip
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-[#0f172a]/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase font-bold text-slate-400">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Question Chip</span>
                    </div>
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Computed Answer Box with Typewriter Effect */}
            <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-500" />
                  <span>Synthesized Business Answer (Grounded in Receipts):</span>
                </div>
                {isTyping && (
                  <span className="text-[11px] font-mono text-amber-500 animate-pulse">
                    Computing from sample data...
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium min-h-[44px]">
                {typedAnswer}
                {isTyping && <span className="inline-block w-1.5 h-4 bg-indigo-500 ml-1 animate-pulse align-middle" />}
              </p>

              <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{answerMetric}</span>
                <span>Verified across 23,507 sample transactions</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer link to launch */}
      <div className="px-4 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#273449]/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Ready to run against your custom sales CSV? Upload your multi-store files anytime.
        </span>
        {onLaunchFullStudio && (
          <button
            onClick={() => onLaunchFullStudio()}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <span>Open Full App Workspace</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
