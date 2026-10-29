import React, { useState, useEffect, useCallback, useId } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BrandIcon } from '../common/BrandLogo';

interface AuthModalProps {
  onAuthSuccess?: () => void;
}

const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateCaptchaCode(length = 5): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
  }
  return result;
}

interface CaptchaChar {
  char: string;
  x: number;
  y: number;
  rotation: number;
  color: string;
}

// RFC-compliant email regular expression
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const AuthModal: React.FC<AuthModalProps> = ({ onAuthSuccess }) => {
  const {
    authModalOpen,
    closeAuthModal,
    authModalMode,
    login,
    signup,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaChars, setCaptchaChars] = useState<CaptchaChar[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  const patternId = useId();

  const refreshCaptcha = useCallback(() => {
    setIsRefreshing(true);
    const code = generateCaptchaCode(5);
    setCaptchaCode(code);
    setCaptchaInput('');

    const colors = [
      '#4f46e5', // indigo-600
      '#6366f1', // indigo-500
      '#0284c7', // sky-600
      '#0d9488', // teal-600
      '#334155', // slate-700
      '#475569', // slate-600
      '#8b5cf6', // violet-500
    ];

    const chars: CaptchaChar[] = code.split('').map((char, index) => ({
      char,
      x: 26 + index * 34,
      y: 30 + (Math.random() * 6 - 3),
      rotation: Math.floor(Math.random() * 24) - 12,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setCaptchaChars(chars);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 200);
  }, []);

  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode);
      setError(null);
      setSuccessMessage(null);
      setHelperNotice(null);
      setCaptchaInput('');
      refreshCaptcha();
    }
  }, [authModalMode, authModalOpen, refreshCaptcha]);

  if (!authModalOpen) return null;

  const handleSwitchMode = (targetMode: 'signin' | 'signup') => {
    setMode(targetMode);
    setError(null);
    setSuccessMessage(null);
    setHelperNotice(null);
    setPassword('');
    setConfirmPassword('');
    setCaptchaInput('');
    refreshCaptcha();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setHelperNotice(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Common Validation: Email
    if (!trimmedEmail) {
      setError('Email address is required.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. analyst@retailbi.ai).');
      return;
    }

    // 2. Common Validation: Password
    if (!trimmedPassword) {
      setError('Password is required.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 3. Register Specific Validations
    if (mode === 'signup') {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError('Full Name is required.');
        return;
      }
      if (trimmedName.length < 2) {
        setError('Full Name must be at least 2 characters long.');
        return;
      }
      if (!confirmPassword.trim()) {
        setError('Please confirm your password.');
        return;
      }
      if (trimmedPassword !== confirmPassword.trim()) {
        setError('Passwords do not match. Please verify your password confirmation.');
        return;
      }
    }

    // 4. Security Verification (CAPTCHA) — Only required for Sign In, removed while registering
    if (mode === 'signin') {
      if (!captchaInput.trim()) {
        setError('Please enter the security verification code (CAPTCHA).');
        return;
      }

      if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
        setError('Incorrect CAPTCHA code. A new security code has been generated. Please try again.');
        refreshCaptcha();
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        // Sign In Flow
        await login(trimmedEmail, trimmedPassword);
        closeAuthModal();
        onAuthSuccess?.();
      } else {
        // Register Flow -> Save account and redirect to Sign In
        const trimmedName = name.trim();
        await signup(trimmedName, trimmedEmail, trimmedPassword, company);

        // Redirect back to sign in
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setCaptchaInput('');
        refreshCaptcha();
        setSuccessMessage(
          `Account successfully created for ${trimmedName}! Please sign in with your password to continue.`
        );
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please verify your details.');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-[#060b19] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xl overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <BrandIcon size={34} withBadge />
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Secure Authentication</span>
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {mode === 'signin' ? 'Sign in to platform' : 'Create analyst account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {mode === 'signin'
              ? 'Access session datasets, ML predictions, and retail executive reports.'
              : 'Register your account to manage retail datasets and generate insights.'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`pb-2 text-xs font-semibold border-b-2 mr-4 transition-colors cursor-pointer ${mode === 'signin'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`pb-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${mode === 'signup'
              ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Register
          </button>
        </div>

        {/* Success Alert Banner (e.g. after Registration directs back to Sign In) */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{successMessage}</div>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{error}</div>
          </div>
        )}

        {/* Info/Notice */}
        {helperNotice && (
          <div className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs">
            {helperNotice}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {mode === 'signup' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organization / Company <span className="text-slate-400 text-[10px]">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Retail Analytics Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="analyst@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() =>
                    setHelperNotice(
                      'If you recently registered, enter the password you chose during registration.'
                    )
                  }
                  className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Registration only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Security Verification (CAPTCHA) — Only for Sign In, removed while registering */}
          {mode === 'signin' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Security Verification (CAPTCHA) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400">Case-insensitive</span>
              </div>

              {/* Captcha Image & Refresh Button */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="relative flex-1 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden select-none px-2"
                  title="Security verification code"
                  aria-label={`Security CAPTCHA: ${captchaCode}`}
                >
                  <svg
                    className="w-full h-full max-w-[210px]"
                    viewBox="0 0 200 46"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern id={`grid-${patternId}`} width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(100, 116, 139, 0.12)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    {/* Grid background */}
                    <rect width="200" height="46" fill={`url(#grid-${patternId})`} />

                    {/* Anti-bot wavy noise lines */}
                    <path
                      d="M 5 23 Q 45 6 95 24 T 195 22"
                      fill="none"
                      stroke="rgba(99, 102, 241, 0.35)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M 10 32 Q 55 42 110 20 T 190 28"
                      fill="none"
                      stroke="rgba(14, 165, 233, 0.3)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M 15 14 Q 75 30 130 12 T 185 34"
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.35)"
                      strokeWidth="1"
                      strokeDasharray="4 3"
                    />

                    {/* Noise dots */}
                    <circle cx="28" cy="12" r="1.5" fill="rgba(99, 102, 241, 0.4)" />
                    <circle cx="78" cy="38" r="1.5" fill="rgba(14, 165, 233, 0.4)" />
                    <circle cx="122" cy="10" r="1.5" fill="rgba(99, 102, 241, 0.4)" />
                    <circle cx="168" cy="36" r="1.5" fill="rgba(148, 163, 184, 0.4)" />

                    {/* Captcha characters */}
                    {captchaChars.map((item, idx) => (
                      <text
                        key={idx}
                        x={item.x}
                        y={item.y}
                        fill={item.color}
                        fontSize="22"
                        fontWeight="800"
                        fontFamily="monospace"
                        letterSpacing="2"
                        transform={`rotate(${item.rotation}, ${item.x}, ${item.y})`}
                      >
                        {item.char}
                      </text>
                    ))}
                  </svg>
                </div>

                <button
                  type="button"
                  onClick={refreshCaptcha}
                  title="Change verification code"
                  aria-label="Generate new security code"
                  className="h-12 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Captcha text input */}
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Type the 5 characters above"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  maxLength={6}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono uppercase tracking-wider text-slate-900 dark:text-white placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder-slate-400 focus:outline-hidden focus:border-slate-900 dark:focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <span>{loading ? 'Verifying...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer Mode Switch Prompt */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
          {mode === 'signin' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
              >
                Sign in to your account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
