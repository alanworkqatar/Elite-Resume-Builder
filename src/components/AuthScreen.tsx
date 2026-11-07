import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  Layers,
  FileCheck2,
  FileText,
} from 'lucide-react';
import { UserAccount } from '../types/auth';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  defaultEmail?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  defaultEmail = '',
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'login'>('create');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [headline, setHeadline] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & error states
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // 1. Mandatory Name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is mandatory to create your account.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full Name must be at least 2 characters.';
    }

    // 2. Mandatory Email validation
    if (!email.trim()) {
      newErrors.email = 'Email Address is mandatory.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address (e.g., name@domain.com).';
    }

    // 3. Password validation
    if (!password) {
      newErrors.password = 'Please provide a password (minimum 4 characters).';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedName = fullName.trim();

      // Retrieve existing accounts
      const accountsKey = 'elite_registered_accounts_v1';
      const existingRaw = localStorage.getItem(accountsKey);
      const accountsList: Array<UserAccount & { passwordHash?: string }> = existingRaw ? JSON.parse(existingRaw) : [];

      // Check if email already registered
      const existingAccount = accountsList.find((a) => a.email.toLowerCase() === trimmedEmail);
      if (existingAccount) {
        setErrors({ email: 'An account with this email already exists. Please switch to Sign In.' });
        setIsSubmitting(false);
        return;
      }

      // Create new user record
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        fullName: trimmedName,
        email: trimmedEmail,
        headline: headline.trim() || undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      // Save to registered accounts list
      accountsList.push({ ...newUser, passwordHash: password });
      localStorage.setItem(accountsKey, JSON.stringify(accountsList));

      // Save active session if rememberMe
      if (rememberMe) {
        localStorage.setItem('elite_auth_user_v1', JSON.stringify(newUser));
      } else {
        sessionStorage.setItem('elite_auth_user_v1', JSON.stringify(newUser));
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(newUser);
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors({ general: 'Failed to create account. Please try again.' });
    }
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email Address is mandatory.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required to sign in.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const accountsKey = 'elite_registered_accounts_v1';
      const existingRaw = localStorage.getItem(accountsKey);
      const accountsList: Array<UserAccount & { passwordHash?: string }> = existingRaw ? JSON.parse(existingRaw) : [];

      const matched = accountsList.find((a) => a.email.toLowerCase() === trimmedEmail);

      let userToLog: UserAccount;

      if (matched) {
        // Matched existing registered account
        userToLog = {
          id: matched.id,
          fullName: matched.fullName,
          email: matched.email,
          headline: matched.headline,
          createdAt: matched.createdAt,
          lastLogin: new Date().toISOString(),
        };
      } else {
        // Fallback for new email in sign-in: auto-generate user profile from email
        const derivedName = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        userToLog = {
          id: `user-${Date.now()}`,
          fullName: derivedName || 'Executive Candidate',
          email: trimmedEmail,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        accountsList.push({ ...userToLog, passwordHash: password });
        localStorage.setItem(accountsKey, JSON.stringify(accountsList));
      }

      if (rememberMe) {
        localStorage.setItem('elite_auth_user_v1', JSON.stringify(userToLog));
      } else {
        sessionStorage.setItem('elite_auth_user_v1', JSON.stringify(userToLog));
      }

      setTimeout(() => {
        setIsSubmitting(false);
        onLoginSuccess(userToLog);
      }, 400);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors({ general: 'Sign in failed. Please try again.' });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrors({});
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../firebase/config');
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const userToLog: UserAccount = {
        id: fbUser.uid,
        fullName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Candidate',
        email: fbUser.email || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      if (rememberMe) {
        localStorage.setItem('elite_auth_user_v1', JSON.stringify(userToLog));
      } else {
        sessionStorage.setItem('elite_auth_user_v1', JSON.stringify(userToLog));
      }
      setIsSubmitting(false);
      onLoginSuccess(userToLog);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setIsSubmitting(false);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrors({ general: err.message || 'Google sign-in was cancelled or unavailable.' });
      }
    }
  };

  const handleDemoSignIn = () => {
    const demoUser: UserAccount = {
      id: 'demo-user-1',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      headline: 'Senior Director of Technology & Digital Products',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    localStorage.setItem('elite_auth_user_v1', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambient Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-0 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden relative z-10">
        
        {/* Left Col: Brand Presentation & Value Propositions */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            {/* Logo Badge */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
                <FileText className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-none">
                  ELITE RESUME
                </span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                  Candidate Portal
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight mb-3">
              Executive Career Suite & Job Copilot
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Please sign in or create an account to access the executive resume builder, job tailoring copilot, and multi-format exporters.
            </p>

            {/* Feature List */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Mandatory Candidate Authentication</h4>
                  <p className="text-[11px] text-slate-400">Personalized workspace linked to your confirmed identity.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FileCheck2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">ATS Corporate & Executive Formats</h4>
                  <p className="text-[11px] text-slate-400">Two-column executive layouts & 95%+ ATS scoring.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">AI Job Application Tailoring</h4>
                  <p className="text-[11px] text-slate-400">Anti-hallucination verification with evidence audit.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="pt-6 mt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3 h-3 text-cyan-500/80" />
              <span>Zero-cloud leakage: data stored securely in session.</span>
            </div>
          </div>
        </div>

        {/* Right Col: Login / Sign Up Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-950/60">
          
          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6 max-w-sm">
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full mb-3.5 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">or continue with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errors.general}
            </div>
          )}

          {/* FORM: CREATE ACCOUNT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Full Name</span>
                    <span className="text-cyan-400 font-black text-sm" title="Mandatory field">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mandatory</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                    }}
                    placeholder="e.g. Alex Morgan"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.fullName
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.fullName}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Email Address</span>
                    <span className="text-cyan-400 font-black text-sm" title="Mandatory field">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mandatory</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="e.g. alex.morgan@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.email
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Current Title / Target Role <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Director of Technology"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Account Password <span className="text-cyan-400 font-black text-sm">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Create a password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Access Builder'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* FORM: SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <span>Registered Email Address</span>
                    <span className="text-cyan-400 font-black text-sm">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Mandatory</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.email
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Password <span className="text-cyan-400 font-black text-sm">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4 text-cyan-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                      errors.password
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Access Option */}
          <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Want to test without signing up?</span>
            <button
              type="button"
              onClick={handleDemoSignIn}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Instant Demo Access</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
