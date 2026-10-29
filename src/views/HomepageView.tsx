import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  UploadCloud,
  LineChart,
  Bot,
  FileText,
  LogOut,
  Sliders,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Database,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  Zap,
  Eye,
  ArrowUp,
} from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { NavTab } from '../components/layout/Sidebar';
import { GithubIcon } from '../components/common/GithubIcon';
import { BrandLogo } from '../components/common/BrandLogo';
import { InteractiveLiveConsole } from '../components/dashboard/InteractiveLiveConsole';

/* ------------------------------------------------------------------ */
/* Floating Dots Background (Canvas) — Spread across entire page       */
/* ------------------------------------------------------------------ */
const FloatingParticles: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    interface DotParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      opacity: number;
      baseOpacity: number;
      pulseSpeed: number;
      pulseOffset: number;
      color: string;
    }
    const particles: DotParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // Harmonious palette precisely matching the interactive console & dark theme
    const palette = [
      'rgba(129, 140, 248,', // soft indigo (accuracy & chart line)
      'rgba(167, 139, 250,', // vibrant violet
      'rgba(56, 189, 248,',  // electric cyan
      'rgba(52, 211, 153,',  // emerald green (growth & live badges)
      'rgba(244, 114, 182,', // rose accent (outlier spikes)
    ];

    // Spread floating dots across the whole screen till end
    const count = Math.min(110, Math.max(65, Math.floor((window.innerWidth * window.innerHeight) / 10000)));
    for (let i = 0; i < count; i++) {
      const baseOp = Math.random() * 0.5 + 0.2;
      const color = palette[Math.floor(Math.random() * palette.length)];
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.0 + 0.8,
        opacity: baseOp,
        baseOpacity: baseOp,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2,
        color,
      });
    }

    let time = 0;
    const draw = () => {
      time += 1;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;

        // Gentle organic twinkle
        const currentOpacity = p.baseOpacity + Math.sin(time * p.pulseSpeed + p.pulseOffset) * 0.15;
        const clampedOpacity = Math.max(0.12, Math.min(0.85, currentOpacity));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${clampedOpacity})`;
        ctx.shadowBlur = p.r * 2.5;
        ctx.shadowColor = `${p.color} ${clampedOpacity * 0.75})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-30 ${className}`}
      style={{ opacity: 0.95 }}
    />
  );
};

/* ------------------------------------------------------------------ */
/* Stat badge used in dynamic metrics row below hero                   */
/* ------------------------------------------------------------------ */
const StatBadge: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  suffix?: string;
  label: string;
  sublabel?: string;
  live?: boolean;
}> = ({ icon, value, suffix = '', label, sublabel, live = false }) => {
  return (
    <div className="flex items-center gap-3.5 group">
      <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 shadow-xs">
        {icon}
      </div>
      <div>
        <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight flex items-center gap-2">
          <span>{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</span>
          {live && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</div>
        {sublabel && (
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{sublabel}</div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Feature Card with soft elevation & glow, NO harsh borders          */
/* ------------------------------------------------------------------ */
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
  glowColor: string;
  cta: string;
  onClick: () => void;
}> = ({ icon, title, description, accentColor, glowColor, cta, onClick }) => (
  <div
    onClick={onClick}
    className="homepage-feature-card relative p-6 rounded-3xl bg-white/85 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group overflow-hidden"
  >
    {/* Ambient hover glow */}
    <div
      className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
      style={{ background: glowColor }}
    />

    <div className="flex items-center justify-between mb-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${accentColor} group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
        {icon}
      </div>
      <span className={`text-[11px] font-semibold ${accentColor} opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1`}>
        <span>{cta}</span>
        <ArrowRight className="w-3 h-3" />
      </span>
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
      {title}
    </h3>
    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
      {description}
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Step Card for "How It Works" with clean rounded background         */
/* ------------------------------------------------------------------ */
const StepCard: React.FC<{
  stepNumber: string;
  stepColor: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ stepNumber, stepColor, title, description, icon }) => (
  <div className="relative p-7 rounded-3xl bg-white/85 dark:bg-slate-800/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white ${stepColor} shadow-md`}>
        {stepNumber}
      </div>
      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Phase {stepNumber}
      </span>
    </div>
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Smooth Scroll Reveal Component (Framer Motion)                     */
/* ------------------------------------------------------------------ */
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}> = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 35 };
      case 'down':
        return { opacity: 0, y: -35 };
      case 'left':
        return { opacity: 0, x: -35 };
      case 'right':
        return { opacity: 0, x: 35 };
      default:
        return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/* Marquee Capabilities Badges                                        */
/* ------------------------------------------------------------------ */
const MARQUEE_ITEMS = [
  { icon: '⚡', text: 'Walk-Forward MAPE Model Scoring' },
  { icon: '🎯', text: '31-Day Median Anomaly Radar (3.5 Threshold)' },
  { icon: '🛡️', text: 'Supabase Multi-Tenant Row Level Security' },
  { icon: '📊', text: 'Executive Vector PDF Brief Generator' },
  { icon: '🤖', text: 'Deterministic Mathematical Solver & Ollama LLM' },
  { icon: '🧹', text: '9-Column Retail CSV Auto-Sanitization' },
  { icon: '🇮🇳', text: 'Indian Rupee Currency Formatting (₹)' },
  { icon: '👥', text: 'Dual-Dimension Customer Demographics' },
  { icon: '📈', text: 'Out-of-Sample 80% Confidence Trajectories' },
];

/* ------------------------------------------------------------------ */
/* Main HomepageView Component                                         */
/* ------------------------------------------------------------------ */
interface HomepageViewProps {
  onLaunchPlatform: (initialTab?: NavTab) => void;
}

export const HomepageView: React.FC<HomepageViewProps> = ({ onLaunchPlatform }) => {
  const { loaded } = useData();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [navScrolled, setNavScrolled] = useState(false);

  // Scroll Progress and Scroll-to-Top State
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const [scrollProgressPercent, setScrollProgressPercent] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setScrollProgressPercent(Math.round(latest * 100));
      setShowScrollTop(latest > 0.08);
    });
  }, [scrollYProgress]);

  // Scrollspy to detect active section
  useEffect(() => {
    const sectionIds = ['features', 'interactive-demo', 'how-it-works', 'faq', 'team'];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionIds[i]);
          return;
        }
      }
      setActiveSection('');
    };
    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  // Enforce pure dark mode on homepage
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    try {
      localStorage.setItem('abip_theme', 'dark');
    } catch {
      // ignore
    }
  }, []);

  // Hero interactive metric toggle
  const [heroMetric, setHeroMetric] = useState<'revenue' | 'orders'>('revenue');

  // Continuously fluctuating values that update every time
  const [revenueValue, setRevenueValue] = useState(1842950);
  const [ordersValue, setOrdersValue] = useState(23507);
  const [growthRate, setGrowthRate] = useState(14.2);
  const [processedRows, setProcessedRows] = useState(128450);
  const [avgLatency, setAvgLatency] = useState(14);
  const [forecastConf, setForecastConf] = useState(82);
  const [sparklineData, setSparklineData] = useState([38, 45, 52, 48, 62, 68, 64, 58, 74, 82, 92, 100]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRevenueValue((prev) => prev + Math.floor(Math.random() * 380) + 95);
      setOrdersValue((prev) => prev + Math.floor(Math.random() * 4) + 1);
      setGrowthRate((prev) => +(14.0 + Math.random() * 0.6).toFixed(1));
      setProcessedRows((prev) => prev + Math.floor(Math.random() * 18) + 6);
      setAvgLatency(11 + Math.floor(Math.random() * 5));
      setForecastConf(81 + Math.floor(Math.random() * 4));
      setSparklineData((prev) => {
        const next = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        const step = Math.floor((Math.random() - 0.45) * 14);
        next.push(Math.min(100, Math.max(35, last + step)));
        return next;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  // Nav background on scroll
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrimaryLaunch = () => {
    if (!isAuthenticated) {
      openAuthModal('signin');
    } else {
      onLaunchPlatform(loaded ? 'dashboard' : 'upload');
    }
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Interactive Demo', href: '#interactive-demo' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Team', href: '#team' },
  ];

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
    <div className="relative min-h-screen bg-[#0a0f1e] text-slate-100 selection:bg-indigo-600 selection:text-white overflow-x-hidden">
      {/* Global ambient background glow that extends smoothly till the end of the entire page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="homepage-gradient-orb homepage-gradient-orb-1" />
        <div className="homepage-gradient-orb homepage-gradient-orb-2" />
        <div className="homepage-gradient-orb homepage-gradient-orb-3" />
        <div className="homepage-gradient-orb homepage-gradient-orb-4" />
      </div>

      {/* Floating dots spread across entire page till end — No lines */}
      <FloatingParticles />

      {/* Top Scroll-Driven Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 z-50 origin-left shadow-[0_0_12px_rgba(99,102,241,0.85)]"
        style={{ scaleX }}
      />

      {/* ============================================================ */}
      {/* 1. STICKY TOP NAV                                            */}
      {/* ============================================================ */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          navScrolled
            ? 'backdrop-blur-xl bg-[#0a0f1e]/85 shadow-md shadow-indigo-950/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center text-left cursor-pointer"
            aria-label="Scroll to top"
          >
            <BrandLogo size="md" variant="full" />
          </button>

          {/* Navigation Links with Scrollspy Highlight */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-slate-400">
            {navLinks.map((item) => {
              const isActive = activeSection === item.href.replace('#', '');
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative py-1 transition-colors duration-300 ${
                    isActive
                      ? 'text-indigo-400 font-bold after:w-full'
                      : 'hover:text-white text-slate-400 after:w-0'
                  } after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-indigo-500 after:transition-all after:duration-300 hover:after:w-full`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* GitHub */}
            <a
              href="https://github.com/Tigerkane/autonomous-business-intelligence-platform"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 transition-all duration-300 hover:scale-105"
              title="View Repository on GitHub"
              aria-label="View Repository on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            {/* User / Sign In */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2">
                <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={handlePrimaryLaunch}
              className="homepage-cta-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer hover:scale-[1.03]"
            >
              <span>{isAuthenticated ? (loaded ? 'Dashboard' : 'Upload') : 'Get Started'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full bg-white dark:bg-[#0c1222] shadow-2xl z-10 p-5">
            <div className="flex items-center justify-between pb-4">
              <BrandLogo size="md" variant="full" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                aria-label="Close navigation sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handlePrimaryLaunch();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-lg cursor-pointer"
              >
                <span>{isAuthenticated ? (loaded ? 'Open Dashboard' : 'Upload Data') : 'Get Started'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content with Scroll Reveal */}
            <ScrollReveal direction="left" className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Tag pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-400/10 text-xs font-semibold text-indigo-600 dark:text-indigo-400 homepage-tag-glow shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Autonomous BI Platform — Retail Data Intelligence</span>
              </div>

              {/* Main heading */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]"
                style={{ textWrap: 'balance' } as any}
              >
                Turn a sales CSV into{' '}
                <span className="homepage-gradient-text">
                  strategic decisions
                </span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Upload retail sales transactions and instantly receive autonomous KPIs, walk-forward forecasting, anomaly detection, plain-English Q&A, and publication-ready PDF reports.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                <button
                  onClick={handlePrimaryLaunch}
                  className="homepage-cta-primary inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 hover:shadow-indigo-500/40 transition-all duration-300 cursor-pointer hover:scale-[1.03]"
                >
                  <span>{isAuthenticated ? 'Open Analytics Workspace' : 'Get Started Free'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>

            {/* Right: Live Autonomous Telemetry Card with Scroll Reveal */}
            <ScrollReveal direction="right" delay={0.15} className="lg:col-span-5 flex items-center justify-center">
              <div className="w-full max-w-[440px] homepage-hero-card p-6 rounded-3xl bg-white/85 dark:bg-slate-800/60 backdrop-blur-xl shadow-2xl shadow-indigo-950/10 dark:shadow-indigo-500/5">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Live Telemetry Stream
                    </span>
                  </div>
                  {/* Metric Toggle */}
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-[11px] font-semibold">
                    <button
                      onClick={() => setHeroMetric('revenue')}
                      className={`px-2.5 py-1 rounded-md transition-all duration-300 cursor-pointer ${
                        heroMetric === 'revenue'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setHeroMetric('orders')}
                      className={`px-2.5 py-1 rounded-md transition-all duration-300 cursor-pointer ${
                        heroMetric === 'orders'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Orders
                    </button>
                  </div>
                </div>

                {/* Metric Display */}
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight transition-all duration-300">
                    {heroMetric === 'revenue'
                      ? `₹${revenueValue.toLocaleString('en-IN')}`
                      : ordersValue.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" />
                    +{growthRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-4 font-mono">
                  <span>Continuous live stream</span>
                  <span className="text-emerald-500 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time
                  </span>
                </div>

                {/* Dynamic live sparkline */}
                <div className="h-16 flex items-end gap-[3px] px-1">
                  {sparklineData.map((val, idx) => (
                    <div
                      key={`${heroMetric}-${idx}`}
                      className="flex-1 rounded-sm bg-gradient-to-t from-indigo-600/40 to-indigo-500/80 dark:from-indigo-400/30 dark:to-indigo-400/70 hover:from-indigo-600 hover:to-indigo-500 transition-all duration-500 homepage-sparkline-bar"
                      style={{
                        height: `${val}%`,
                        transition: 'height 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  ))}
                </div>

                {/* Mini labels */}
                <div className="flex justify-between mt-2 text-[9px] text-slate-400 dark:text-slate-500 font-mono px-1">
                  <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Live</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2b. LIVE STREAMING METRICS ROW                               */}
      {/* ============================================================ */}
      <section className="py-6">
        <ScrollReveal direction="up" className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <StatBadge
            icon={<Database className="w-4 h-4" />}
            value={processedRows}
            suffix="+"
            label="Live Streamed Records"
            sublabel="Updating real-time"
            live={true}
          />
          <StatBadge
            icon={<Zap className="w-4 h-4" />}
            value={avgLatency}
            suffix="ms"
            label="Model Latency"
            sublabel="Instant evaluation"
            live={true}
          />
          <StatBadge
            icon={<LineChart className="w-4 h-4" />}
            value={forecastConf}
            suffix="%"
            label="Forecast Confidence"
            sublabel="Walk-Forward MAPE"
            live={true}
          />
          <StatBadge
            icon={<ShieldCheck className="w-4 h-4" />}
            value={100}
            suffix="%"
            label="Data Isolation"
            sublabel="Zero External Sharing"
          />
        </ScrollReveal>
      </section>

      {/* ============================================================ */}
      {/* 2c. CONTINUOUS SCROLLING CAPABILITIES MARQUEE                */}
      {/* ============================================================ */}
      <section className="py-6 overflow-hidden relative select-none">
        <div className="absolute left-0 inset-y-0 w-28 bg-gradient-to-r from-[#0a0f1e] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-28 bg-gradient-to-l from-[#0a0f1e] to-transparent z-10 pointer-events-none" />

        <div className="homepage-marquee-track flex items-center gap-4 py-2">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 backdrop-blur-md text-xs font-semibold text-slate-300 transition-colors shrink-0 shadow-2xs hover:border-indigo-500/40"
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SIX BUILT-IN AUTONOMOUS CAPABILITIES                      */}
      {/* ============================================================ */}
      <section id="features" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Six Built-In Autonomous Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything required to go from raw multi-column transactions to executive strategic clarity.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ScrollReveal delay={0.05} direction="up">
              <FeatureCard
                icon={<BarChart3 className="w-5 h-5" />}
                title="Executive Dashboard"
                description="Automated MoM KPIs, weekly revenue area trends (3M/6M/All), product category breakdown, and dual-dimension customer segmentation donut."
                accentColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                glowColor="rgba(99, 102, 241, 0.08)"
                cta="Explore"
                onClick={() => onLaunchPlatform('dashboard')}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.12} direction="up">
              <FeatureCard
                icon={<LineChart className="w-5 h-5" />}
                title="Scored Forecasts"
                description="Walk-forward backtesting evaluates candidate algorithms, assigns Out-of-Sample MAPE scores, and projects future trajectories with shaded 80% confidence bands."
                accentColor="bg-teal-500/10 text-teal-600 dark:text-teal-400"
                glowColor="rgba(20, 184, 166, 0.08)"
                cta="View Forecast"
                onClick={() => onLaunchPlatform('forecast-anomalies')}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.18} direction="up">
              <FeatureCard
                icon={<Sliders className="w-5 h-5" />}
                title="Anomaly Detection"
                description="Flags unusual revenue days against a rolling 31-day median baseline using a modified z-score (threshold 3.5), and unusual transactions per product category using IQR fences."
                accentColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                glowColor="rgba(244, 63, 94, 0.08)"
                cta="View Anomalies"
                onClick={() => onLaunchPlatform('forecast-anomalies')}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.24} direction="up">
              <FeatureCard
                icon={<Bot className="w-5 h-5" />}
                title="Ask in Plain English"
                description="Connects to a local Ollama model. Maps questions into mathematical metrics and responds with zero hallucination."
                accentColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
                glowColor="rgba(168, 85, 247, 0.08)"
                cta="Ask AI"
                onClick={() => onLaunchPlatform('ask-data')}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.30} direction="up">
              <FeatureCard
                icon={<FileText className="w-5 h-5" />}
                title="PDF Reports"
                description="Generates vector PDF stakeholder briefs with executive scorecards, sales breakdown tables, forecast curves, and strategic insights ready to print or email."
                accentColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                glowColor="rgba(245, 158, 11, 0.08)"
                cta="Generate"
                onClick={() => onLaunchPlatform('reports')}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.36} direction="up">
              <FeatureCard
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Private Accounts"
                description="Dedicated multi-tenant isolation, cryptographic token verification, client-side CAPTCHA verification, and isolated session dataset workspaces."
                accentColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                glowColor="rgba(16, 185, 129, 0.08)"
                cta="Sign In"
                onClick={() => openAuthModal('signin')}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. INTERACTIVE DEMO (Tabs: Dashboard, Forecast, Anomalies, Q&A) */}
      {/* ============================================================ */}
      <section id="interactive-demo" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Live Demo
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Explore the Autonomous Intelligence Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Switch between tabs below to preview the Dashboard, toggle 80% forecast ranges, adjust the anomaly threshold, and query plain-English questions.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15}>
            <InteractiveLiveConsole
              theme="dark"
              onLaunchFullStudio={handlePrimaryLaunch}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW IT WORKS                                              */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Three Steps to Foresight
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              A transparent, deterministic workflow designed for high-velocity retail operations.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.08} direction="up">
              <StepCard
                stepNumber="01"
                stepColor="bg-indigo-600"
                title="Upload & Sanitize CSV"
                description="Drop your sales CSV. The engine validates 9 columns, normalizes multi-format dates to ISO 8601, and rejects duplicate transactions and negative records."
                icon={<UploadCloud className="w-6 h-6 text-indigo-500" />}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.18} direction="up">
              <StepCard
                stepNumber="02"
                stepColor="bg-teal-600"
                title="Model & Detect Anomalies"
                description="Walk-forward backtesting selects the minimum MAPE model, while a rolling 31-day median baseline with modified z-score surfaces unusual revenue days."
                icon={<Eye className="w-6 h-6 text-teal-500" />}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.28} direction="up">
              <StepCard
                stepNumber="03"
                stepColor="bg-amber-600"
                title="Decide & Share Reports"
                description="Review executive scorecards, query store telemetry in plain English, and generate vector PDF reports formatted for board presentations."
                icon={<FileText className="w-6 h-6 text-amber-500" />}
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. FAQ ACCORDION                                             */}
      {/* ============================================================ */}
      <section id="faq" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Everything you need to know about the algorithms and data pipeline.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.1} className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
                    isOpen
                      ? 'bg-white dark:bg-slate-800/80 shadow-md shadow-indigo-500/5'
                      : 'bg-white/75 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800/60'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-bold text-sm text-slate-900 dark:text-white cursor-pointer group"
                    aria-expanded={isOpen}
                  >
                    <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {faq.q}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isOpen ? 'bg-indigo-600 text-white rotate-180' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PROJECT TEAM                                              */}
      {/* ============================================================ */}
      <section id="team" className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" className="text-center max-w-xl mx-auto mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
              The Team
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Project Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Core contributors & engineering leads
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: 'Shreyas Mogalapalli', initials: 'SM', role: 'Project Lead & System Architect', color: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900', roleColor: 'text-indigo-600 dark:text-indigo-400' },
              { name: 'Saniya', initials: 'S', role: 'Machine Learning & Modeling Lead', color: 'bg-indigo-600 text-white', roleColor: 'text-indigo-600 dark:text-indigo-400' },
              { name: 'Shlok', initials: 'S', role: 'Backend Infrastructure & Ingestion', color: 'bg-teal-600 text-white', roleColor: 'text-teal-600 dark:text-teal-400' },
              { name: 'Navya', initials: 'N', role: 'BI Analytics & UX Intelligence', color: 'bg-violet-600 text-white', roleColor: 'text-violet-600 dark:text-violet-400' },
            ].map((member, idx) => (
              <ScrollReveal key={member.name} delay={idx * 0.08} direction="up">
                <div className="p-6 rounded-3xl bg-white/75 dark:bg-slate-800/40 backdrop-blur-sm flex items-center gap-4 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-14 h-14 rounded-2xl ${member.color} flex items-center justify-center font-bold text-base shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {member.name}
                    </h3>
                    <p className={`text-sm font-semibold ${member.roleColor} mt-1 whitespace-normal break-words leading-relaxed`}>
                      {member.role}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. CTA BANNER                                                */}
      {/* ============================================================ */}
      <section className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="homepage-cta-banner relative px-6 py-5 sm:px-8 sm:py-6 rounded-2xl overflow-hidden shadow-lg">
              {/* Animated gradient background */}
              <div className="absolute inset-0 homepage-cta-gradient" />
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 via-indigo-700/80 to-violet-700/90" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                    Ready to turn your sales CSV into foresight?
                  </h2>
                  <p className="text-xs text-indigo-100/80 max-w-sm leading-relaxed">
                    Upload your retail sales data and receive executive decision intelligence.
                  </p>
                </div>
                <button
                  onClick={handlePrimaryLaunch}
                  className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs transition-all duration-300 shrink-0 shadow-md hover:shadow-lg cursor-pointer hover:scale-[1.02]"
                >
                  Get Started Free
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FOOTER                                                    */}
      {/* ============================================================ */}
      <footer className="py-8 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" variant="compact" />
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-medium">ABIP: Autonomous Business Intelligence Platform</span>
          </div>

          <div className="flex items-center gap-6">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={handlePrimaryLaunch}
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {isAuthenticated ? 'Open Workspace' : 'Sign In'}
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Circular Back-to-Top Button with Progress Indicator */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-[#0d162e]/90 hover:bg-indigo-600 text-white shadow-2xl backdrop-blur-xl border border-indigo-500/30 transition-all duration-300 hover:scale-110 group cursor-pointer"
          title="Scroll back to top"
          aria-label="Scroll back to top"
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={81.68}
                strokeDashoffset={81.68 - (81.68 * scrollProgressPercent) / 100}
                className="text-indigo-400 group-hover:text-white transition-all duration-150"
                strokeLinecap="round"
              />
            </svg>
            <ArrowUp className="w-4 h-4 absolute text-indigo-300 group-hover:text-white transition-colors" />
          </div>
        </motion.button>
      )}
    </div>
  );
};
