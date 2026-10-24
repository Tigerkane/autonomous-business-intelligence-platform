import React, { useState } from 'react';
import {
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  LineChart,
  Bot,
  FileText,
  Sun,
  Moon,
  LogOut,
  User,
  Sliders,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Layers,
  Database,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { NavTab } from '../components/layout/Sidebar';
import { GithubIcon } from '../components/common/GithubIcon';
import { BrandLogo } from '../components/common/BrandLogo';
import { BrowserChartsIllustration } from '../components/illustrations/BrowserChartsIllustration';
import { CsvUploadIllustration } from '../components/illustrations/CsvUploadIllustration';
import { MagnifierChartIllustration } from '../components/illustrations/MagnifierChartIllustration';
import { PdfReportIllustration } from '../components/illustrations/PdfReportIllustration';
import { ChatSparkleIllustration } from '../components/illustrations/ChatSparkleIllustration';
import { ShieldLockIllustration } from '../components/illustrations/ShieldLockIllustration';
import { InteractiveLiveConsole } from '../components/dashboard/InteractiveLiveConsole';

interface HomepageViewProps {
  onLaunchPlatform: (initialTab?: NavTab) => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({ onLaunchPlatform }) => {
  const { loaded, theme, toggleTheme, loadSample } = useData();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [loadingSample, setLoadingSample] = useState(false);

  // Hero interactive mini-sample card state
  const [heroMetric, setHeroMetric] = useState<'revenue' | 'orders'>('revenue');

  // FAQ Accordion open states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mobile navigation sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handlePrimaryLaunch = () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
    } else {
      onLaunchPlatform(loaded ? 'dashboard' : 'upload');
    }
  };

  const handleQuickLoadSample = async () => {
    setLoadingSample(true);
    try {
      await loadSample();
      onLaunchPlatform('dashboard');
    } catch {
      onLaunchPlatform('upload');
    } finally {
      setLoadingSample(false);
    }
  };

  const faqs = [
    {
      q: 'What CSV format does the platform expect?',
      a: 'The engine expects standard retail transaction CSVs with 9 standard fields: Transaction ID, Date (YYYY-MM-DD), Customer ID, Gender, Age, Product Category, Quantity, Price per Unit, and Total Amount. Empty rows, duplicate transaction IDs, and negative amounts are automatically sanitized.',
    },
    {
      q: 'How does the walk-forward forecasting work?',
      a: 'The engine runs walk-forward backtesting on your monthly history, comparing a linear trend against a recent 3-month average. It scores each model on out-of-sample Mean Absolute Percentage Error (MAPE), automatically picks the lower-error one, and projects 6 months ahead with an approximate 80% confidence band. With short histories (under 24 months) the page shows a low-history warning.',
    },
    {
      q: 'Why use a rolling median and modified z-score for anomaly detection instead of standard z-scores?',
      a: 'Standard mean/standard-deviation z-scores are distorted by extreme outliers (the mean shifts with the spike). The platform compares the revenue of each day to a rolling 31-day median baseline and scores the gap with a modified z-score built on the Median Absolute Deviation (MAD). Medians are not pulled by a single spike, so genuine outliers stay visible. Days scoring 3.5 or higher are flagged, and 5 or higher is marked High. A second check flags individual transactions that are unusual for their own product category using IQR fences.',
    },
    {
      q: 'How are natural language queries answered?',
      a: 'Queries are deterministic and grounded: user questions are mapped to mathematical dataset aggregations before passing telemetry to a local Ollama LLM. Every figure generated includes exact row-receipt citations, preventing AI hallucinations.',
    },
    {
      q: 'Is my uploaded data private and secure?',
      a: 'Yes. Datasets are parsed and isolated in per-user session memory with strict tenant boundaries. Raw files are not shared with public training models or external aggregators.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-600 selection:text-white">
      {/* ============================================================ */}
      {/* 1. STICKY TOP NAV */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-[#0f172a]/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center text-left cursor-pointer"
            aria-label="Scroll to top"
          >
            <BrandLogo size="md" variant="full" />
          </button>

          {/* Clean Anchor Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Interactive Demo
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              FAQ
            </a>
            <a href="#team" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Team
            </a>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* GitHub Repo */}
            <a
              href="https://github.com/Tigerkane/autonomous-business-intelligence-platform"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              title="View Repository on GitHub"
              aria-label="View Repository on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            {/* Theme Toggle (Light / Dark mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle visual theme"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>

            {/* User Account / Sign In */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onLaunchPlatform('signin')}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile Sidebar Navigation Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Open navigation sidebar"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Get Started CTA */}
            <button
              onClick={handlePrimaryLaunch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <span>{isAuthenticated ? (loaded ? 'Open Dashboard' : 'Upload Data') : 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-white dark:bg-[#060b19] border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <BrandLogo size="md" variant="full" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                title="Hide sidebar"
                aria-label="Close navigation sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Features
              </a>
              <a
                href="#interactive-demo"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Interactive Demo
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                FAQ
              </a>
              <a
                href="#team"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Project Team
              </a>
            </nav>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handlePrimaryLaunch();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
              >
                <span>{isAuthenticated ? (loaded ? 'Open Dashboard' : 'Upload Data') : 'Get Started'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HERO SECTION */}
      {/* H1: "Turn a sales CSV into decisions." + 2 CTAs + interactive sample-chart card + hero art */}
      {/* ============================================================ */}
      <section className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Unboxed Metadata Header */}
              <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>Autonomous Business Intelligence</span>
                <span aria-hidden="true">·</span>
                <span>Retail Data Pipelines</span>
                <span aria-hidden="true">·</span>
                <span>Time-Series ML</span>
              </div>

              {/* Exact H1 from Brief */}
              <h1
                className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]"
                style={{ textWrap: 'balance' } as any}
              >
                Turn a sales CSV into decisions.
              </h1>

              <p className="text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Upload your retail sales transactions and immediately receive autonomous KPIs, walk-forward forecasting models, rolling-median anomaly detection, plain-English Q&A, and publication-ready PDF reports.
              </p>

              {/* Primary CTA */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={handlePrimaryLaunch}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>{isAuthenticated ? 'Open Analytics Workspace' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive Mini Sample-Chart Card in Hero */}
              <div className="pt-4 max-w-lg mx-auto lg:mx-0">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Live Sample Preview:
                    </span>
                    {/* Revenue / Orders toggle */}
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                      <button
                        onClick={() => setHeroMetric('revenue')}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${heroMetric === 'revenue' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        Revenue
                      </button>
                      <button
                        onClick={() => setHeroMetric('orders')}
                        className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${heroMetric === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                          }`}
                      >
                        Orders
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 font-mono tabular-nums">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {heroMetric === 'revenue' ? '₹18,42,950' : '23,507 orders'}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      +14.2% MoM
                    </span>
                  </div>

                  {/* Micro sparkline */}
                  <div className="mt-2 h-7 flex items-end gap-1">
                    {[38, 45, 52, 48, 62, 68, 64, 58, 74, 82, 92, 100].map((val, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-xs bg-indigo-600/30 dark:bg-indigo-400/30 hover:bg-indigo-600 transition-colors"
                        style={{ height: `${val}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Art Column (320x240 Illustration with gentle float) */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="animate-gentle-float w-full max-w-[420px]">
                <BrowserChartsIllustration className="w-full h-auto drop-shadow-xl" theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SIX FEATURE CARDS */}
      {/* dashboard, scored forecasts, anomaly detection, ask in plain English, PDF reports, private accounts */}
      {/* ============================================================ */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Six Built-In Autonomous Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything required to go from raw multi-column transactions to executive strategic clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Executive Dashboard */}
            <div
              onClick={() => onLaunchPlatform('dashboard')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Executive Dashboard
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated MoM KPIs, weekly revenue area trends (3M/6M/All), product category breakdown, and dual-dimension customer segmentation donut.
              </p>
            </div>

            {/* Feature 2: Scored Forecasts */}
            <div
              onClick={() => onLaunchPlatform('forecast-anomalies')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-teal-400 dark:hover:border-teal-500 hover:shadow-md transition-all cursor-pointer group space-y-3 ring-1 ring-teal-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <LineChart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Forecast</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Scored Forecasts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Walk-forward backtesting evaluates candidate algorithms, assigns Out-of-Sample MAPE scores, and projects future trajectories with shaded 80% confidence bands.
              </p>
            </div>

            {/* Feature 3: Anomaly Detection */}
            <div
              onClick={() => onLaunchPlatform('forecast-anomalies')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-rose-400 dark:hover:border-rose-500 hover:shadow-md transition-all cursor-pointer group space-y-3 ring-1 ring-rose-500/10"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Anomalies</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Anomaly Detection
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Flags unusual revenue days against a rolling 31-day median baseline using a modified z-score (threshold 3.5), and unusual transactions per product category using IQR fences.
              </p>
            </div>

            {/* Feature 4: Ask in Plain English */}
            <div
              onClick={() => onLaunchPlatform('ask-data')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Ask AI</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Ask in Plain English
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Connects to a local Ollama model. Maps questions into mathematical metrics and responds with zero hallucination.
              </p>
            </div>

            {/* Feature 5: PDF Reports */}
            <div
              onClick={() => onLaunchPlatform('reports')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Generate</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                PDF Reports
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates vector PDF stakeholder briefs with executive scorecards, sales breakdown tables, forecast curves, and strategic insights ready to print or email.
              </p>
            </div>

            {/* Feature 6: Private Accounts */}
            <div
              onClick={() => onLaunchPlatform('signin')}
              className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Private Accounts
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Dedicated multi-tenant isolation, cryptographic token verification, client-side CAPTCHA verification, and isolated session dataset workspaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE DEMO (Tabs: Dashboard | Forecast | Anomalies | Ask) */}
      {/* ============================================================ */}
      <section id="interactive-demo" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Live Demo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Explore the Autonomous Intelligence Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Switch between tabs below to preview the Dashboard, toggle 80% forecast ranges, adjust the anomaly threshold, and query plain-English questions.
            </p>
          </div>

          <InteractiveLiveConsole
            theme={theme}
            onLaunchFullStudio={handlePrimaryLaunch}
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. "HOW IT WORKS" 3-STEP STEPPER WITH ART PER STEP */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              How It Works: Three Steps to Foresight
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              A transparent, deterministic workflow designed for high-velocity retail operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex flex-col justify-between space-y-6">
              <div className="flex justify-center">
                <CsvUploadIllustration className="w-full max-w-[220px]" theme={theme} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  Step 01
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload & Sanitize CSV
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Drop your sales CSV. The engine validates 9 columns, normalizes multi-format dates to ISO 8601, and rejects duplicate transactions and negative records.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex flex-col justify-between space-y-6">
              <div className="flex justify-center">
                <MagnifierChartIllustration className="w-full max-w-[220px]" theme={theme} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                  Step 02
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Model & Detect Anomalies
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Walk-forward backtesting selects the minimum MAPE forecasting model, while a rolling 31-day median baseline with a modified z-score surfaces unusual revenue days and transactions.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex flex-col justify-between space-y-6">
              <div className="flex justify-center">
                <PdfReportIllustration className="w-full max-w-[220px]" theme={theme} />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                  Step 03
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Decide & Share Reports
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Review executive scorecards, query store telemetry in plain English, and generate vector PDF reports formatted for board presentations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FAQ ACCORDION */}
      {/* ============================================================ */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything you need to know about the platform algorithms and data pipeline.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PROJECT TEAM SECTION */}
      {/* Clean Teammate Name & Full Role without truncation or matter */}
      {/* ============================================================ */}
      <section id="team" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Project Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Core contributors & engineering leads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* Shreyas Mogalapalli */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center gap-4 sm:gap-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                SM
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Shreyas Mogalapalli
                </h3>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 whitespace-normal break-words leading-relaxed">
                  Project Lead & System Architect
                </p>
              </div>
            </div>

            {/* Saniya */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center gap-4 sm:gap-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                S
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Saniya
                </h3>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 whitespace-normal break-words leading-relaxed">
                  Machine Learning & Modeling Lead
                </p>
              </div>
            </div>

            {/* Shlok */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center gap-4 sm:gap-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                S
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Shlok
                </h3>
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-1 whitespace-normal break-words leading-relaxed">
                  Backend Infrastructure & Ingestion
                </p>
              </div>
            </div>

            {/* Navya */}
            <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e293b] flex items-center gap-4 sm:gap-5 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                N
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Navya
                </h3>
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 mt-1 whitespace-normal break-words leading-relaxed">
                  BI Analytics & UX Intelligence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. CTA BANNER */}
      {/* ============================================================ */}
      <section className="py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="px-6 py-5 sm:px-8 sm:py-6 rounded-2xl bg-indigo-600 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h2 className="text-lg sm:text-xl font-black">
                Ready to turn your sales CSV into foresight?
              </h2>
              <p className="text-xs text-indigo-100 max-w-md leading-relaxed">
                Upload your retail sales CSV or try the sample dataset.
              </p>
            </div>
            <button
              onClick={handlePrimaryLaunch}
              className="px-5 py-2.5 rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FOOTER */}
      {/* ============================================================ */}
      <footer className="py-8 bg-white dark:bg-[#0f172a] text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" variant="compact" />
            <span>·</span>
            <span>ABIP: Autonomous Business Intelligence Platform</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-slate-400">Sample data preview</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#interactive-demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Demo
            </a>
            <a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              FAQ
            </a>
            <a href="#team" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Team
            </a>
            <button
              onClick={handlePrimaryLaunch}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {isAuthenticated ? 'Open Workspace' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
