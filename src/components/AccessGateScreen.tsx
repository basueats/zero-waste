import React, { useState } from 'react';
import {
  Lock,
  Check,
  ShieldCheck,
  Mail,
  KeyRound,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Users,
  Crown,
  Clock,
  User,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';

export interface AuthenticatedSessionUser {
  email: string;
  name: string;
  role: 'admin' | 'member';
  planId: string;
  planTitle: string;
  expiresAt: number | null;
  source: string;
}

interface AccessPlanOption {
  id: 'trial' | 'individual' | 'team' | 'training';
  title: string;
  badge?: string;
  description: string;
  price: string;
  cadence: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  isTrial?: boolean;
  ziinaPayUrl?: string;
}

export const ACADEMY_PLANS: AccessPlanOption[] = [
  {
    id: 'trial',
    title: '3-Day Free Trial',
    badge: 'START RISK FREE',
    description: 'Instant 72-hour full unrestricted brigade access without credit card.',
    price: '$0',
    cadence: 'free for 3 days',
    features: [
      'Full access to all 60+ zero-waste recipes',
      'Catalogue of byproducts & upcycling tips',
      'Interactive kitchen inventory dashboard',
      'Live community food rescue dispatch',
      'Unlimited access across mobile & tablet',
      'No upfront payment or card required',
    ],
    buttonText: 'START 3-DAY FREE TRIAL',
    isTrial: true,
  },
  {
    id: 'individual',
    title: 'Individual',
    description: 'Annual subscription. No per-module fees. Full access on every plan.',
    price: '$99',
    cadence: 'per person/year',
    features: [
      'A library of zero-waste recipes',
      'Catalogue of byproducts and tips',
      'Training courses for chefs',
      'Best practices & SOP downloads',
      'Exclusive live masterclass Q&A calls with master mentors',
      'Members only newsletter',
      'Printable kitchen posters & prep guides',
      'Unlimited access to all resources',
      'Access to all future content',
      'Mobile app access',
    ],
    buttonText: 'JOIN NOW',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/PXdVCwkJTu?source=app',
  },
  {
    id: 'team',
    title: 'Team',
    badge: 'MOST POPULAR',
    description: 'Minimum 5 chefs included. Perfect for restaurant and hotel brigades.',
    price: '$79',
    cadence: 'per chef/year',
    features: [
      'Everything in Individual plan, plus:',
      'Team progress tracking & analytics',
      'Engagement reports for Head Chefs',
      'Minimum 5 chefs included',
      'Dedicated brigade onboarding kit',
      'Shared kitchen recipe binder',
      'Priority live Q&A sessions',
    ],
    buttonText: 'GET STARTED',
    highlighted: true,
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/K_Yuf5UfM?source=app',
  },
  {
    id: 'training',
    title: 'Training',
    badge: 'EXECUTIVE ADVISORY',
    description: 'Comprehensive operational transformation and executive culinary advisory.',
    price: '$1499',
    cadence: 'per 5 chefs/year',
    features: [
      'Everything in the Team plan, plus:',
      '3x tailored private online sessions',
      'Private dedicated brigade advisory channel',
      'Food waste data review & bin audit analysis',
      'Customized menu circularity roadmap',
      'Certified Zero Waste Brigade credential',
    ],
    buttonText: 'ENQUIRE NOW',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/V4v9zEpeg?source=app',
  },
];

interface AccessGateScreenProps {
  onUnlocked: (user: AuthenticatedSessionUser, token: string) => void;
  initialNotice?: string | null;
}

export const AccessGateScreen: React.FC<AccessGateScreenProps> = ({
  onUnlocked,
  initialNotice = null,
}) => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(initialNotice);

  // Plan Checkout / Trial Activation Modal state
  const [selectedPlan, setSelectedPlan] = useState<AccessPlanOption | null>(null);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [chefSeats, setChefSeats] = useState<number>(5);
  const [transactionRef, setTransactionRef] = useState('');
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const isPermanentAdminInput = loginEmail.trim().toLowerCase() === 'supritamone@gmail.com';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authenticated) {
        setLoginError(data?.error || 'Unable to verify credentials.');
        setLoginLoading(false);
        return;
      }
      onUnlocked(data.user, data.token);
    } catch {
      setLoginError('Network connection error while signing in. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOpenPlanModal = (plan: AccessPlanOption) => {
    setSelectedPlan(plan);
    setSignupError(null);
    setHasOpenedPayment(false);
    setTransactionRef('');
    if (loginEmail.trim()) {
      setSignupEmail(loginEmail.trim());
    }
  };

  const handleActivatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setSignupError(null);
    setSignupLoading(true);

    try {
      const res = await fetch('/api/auth/activate-plan', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
          chefSeats: selectedPlan.id === 'team' ? Math.max(5, chefSeats) : undefined,
          transactionRef: transactionRef.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authenticated) {
        setSignupError(data?.error || 'Unable to activate plan. Please check your details.');
        setSignupLoading(false);
        return;
      }
      onUnlocked(data.user, data.token);
    } catch {
      setSignupError('Connection error while activating membership. Please retry.');
    } finally {
      setSignupLoading(false);
    }
  };

  const scrollToPlans = () => {
    const el = document.getElementById('academy-pricing-plans');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Gate Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1">
              <SupritamoneLogo size="sm" />
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
              <Lock className="w-3.5 h-3.5" />
              <span>Members-Only Culinary Academy</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="https://zerowaste.supritamone.com/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span>zerowaste.supritamone.com</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
            <button
              onClick={scrollToPlans}
              className="px-3.5 py-1.5 rounded-lg bg-[#a435f0] hover:bg-[#8710d8] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              View Plans
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Access Hero & Sign-In */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Protected Curriculum Summary */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Protected Portal · Authorized Members Only</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
              The Zero Waste Kitchen Academy & Chef Diploma
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Already signed in on{' '}
              <a
                href="https://zerowaste.supritamone.com/"
                className="text-emerald-400 underline hover:text-emerald-300 font-semibold"
              >
                https://zerowaste.supritamone.com/
              </a>{' '}
              (Free Trial or any paid plan)? Routing from that site unlocks the Academy automatically with no extra login required. Direct visitors can sign in with their email &amp; password or choose a plan below.
            </p>

            {/* 3 Clear Ways to Unlock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. No Second Login</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Users routed from <strong className="text-slate-200">zerowaste.supritamone.com</strong> enter automatically
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>2. Member Login</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Use your registered email & password (or Admin account)
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3. Select Any Plan</span>
                </span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Start with our $0 3-Day Free Trial or enroll your kitchen brigade
                </p>
              </div>
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-7 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Sign In to Academy</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Use your zerowaste.supritamone.com or Academy credentials
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {isPermanentAdminInput && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Master Admin recognized: Permanent unrestricted access enabled.</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="gate-login-email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Address</span>
                  </label>
                  <input
                    id="gate-login-email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="chef@restaurant.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#a435f0]/30 focus:border-[#a435f0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="gate-login-password" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>Password {isPermanentAdminInput ? '(Optional for Admin)' : ''}</span>
                  </label>
                  <input
                    id="gate-login-password"
                    type="password"
                    required={!isPermanentAdminInput}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={isPermanentAdminInput ? 'Permanent Admin Access' : 'Enter your password'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#a435f0]/30 focus:border-[#a435f0]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Unlock Academy</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
                <span>Already signed in on partner site?</span>
                <a
                  href="https://zerowaste.supritamone.com/"
                  className="font-bold text-[#a435f0] hover:underline inline-flex items-center gap-1"
                >
                  <span>Go to zerowaste.supritamone.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Exact Plans Pricing Section */}
        <section id="academy-pricing-plans" className="pt-4 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              Instant Brigade & Chef Access
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Start with a 3-Day Free Trial or Enroll Your Brigade
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Transparent pricing in USD ($). Unlock all 12 Sections, 24 Chapters (26h 00m Video Mastery), 120 Assessment Questions, and the Official Certificate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
            {ACADEMY_PLANS.map((plan) => {
              const isHighlighted = Boolean(plan.highlighted);
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    isHighlighted
                      ? 'bg-white text-slate-900 ring-4 ring-[#a435f0]/40 shadow-2xl border-2 border-[#a435f0]'
                      : 'bg-slate-900/95 text-slate-100 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 min-h-[24px]">
                        <h3 className={`text-lg font-extrabold ${isHighlighted ? 'text-slate-900' : 'text-white'}`}>
                          {plan.title}
                        </h3>
                        {plan.badge && (
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                              plan.isTrial
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isHighlighted
                                  ? 'bg-[#a435f0] text-white'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <p className={`text-xs leading-relaxed ${isHighlighted ? 'text-slate-600' : 'text-slate-400'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className={`pb-4 border-b ${isHighlighted ? 'border-slate-200' : 'border-slate-800'}`}>
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-4xl font-black tracking-tight ${isHighlighted ? 'text-slate-900' : 'text-white'}`}>
                          {plan.price}
                        </span>
                        <span className={`text-xs font-bold uppercase ${isHighlighted ? 'text-slate-500' : 'text-slate-400'}`}>
                          USD
                        </span>
                      </div>
                      <span className={`text-xs block mt-0.5 ${isHighlighted ? 'text-slate-500' : 'text-slate-400'}`}>
                        {plan.cadence}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <p className={`text-xs font-bold ${isHighlighted ? 'text-slate-800' : 'text-slate-300'}`}>
                        What&apos;s included:
                      </p>
                      <ul className="space-y-2">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs leading-snug">
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                plan.isTrial
                                  ? 'text-emerald-400'
                                  : isHighlighted
                                    ? 'text-[#a435f0]'
                                    : 'text-emerald-400'
                              }`}
                            />
                            <span className={isHighlighted ? 'text-slate-700' : 'text-slate-300'}>
                              {feat}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => handleOpenPlanModal(plan)}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        plan.isTrial
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg'
                          : isHighlighted
                            ? 'bg-[#a435f0] hover:bg-[#8710d8] text-white shadow-lg'
                            : 'bg-white hover:bg-slate-200 text-slate-950'
                      }`}
                    >
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer Support */}
      <footer className="border-t border-slate-800/80 py-5 px-4 text-center text-xs text-slate-500">
        <span>Supritamone Academy · Executive Zero Waste Culinary Certification · Support: </span>
        <a href="mailto:supritam.basu@supritamone.com" className="text-slate-300 hover:underline">
          supritam.basu@supritamone.com
        </a>
      </footer>

      {/* Checkout / Trial Activation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedPlan.isTrial ? (
                  <Clock className="w-5 h-5 text-emerald-400" />
                ) : selectedPlan.id === 'team' ? (
                  <Users className="w-5 h-5 text-[#a435f0]" />
                ) : selectedPlan.id === 'training' ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-blue-400" />
                )}
                <div>
                  <h3 className="font-bold text-sm">{selectedPlan.title}</h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedPlan.price} USD {selectedPlan.cadence}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActivatePlan} className="p-6 space-y-4 text-xs">
              {signupError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="plan-full-name" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name (Printed on Certificate)</span>
                </label>
                <input
                  id="plan-full-name"
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Chef Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#a435f0]/30 focus:border-[#a435f0]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-email" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Work / Academy Email ID</span>
                </label>
                <input
                  id="plan-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#a435f0]/30 focus:border-[#a435f0]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-password" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Create Login Password (min 4 characters)</span>
                </label>
                <input
                  id="plan-password"
                  type="password"
                  required
                  minLength={4}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create password for future sign-ins"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#a435f0]/30 focus:border-[#a435f0]"
                />
              </div>

              {selectedPlan.id === 'team' && (
                <div className="space-y-1.5">
                  <label htmlFor="plan-seats" className="font-bold text-slate-700 block">
                    Number of Chef Seats (Minimum 5 chefs · $79 USD/chef/year)
                  </label>
                  <input
                    id="plan-seats"
                    type="number"
                    min={5}
                    value={chefSeats}
                    onChange={(e) => setChefSeats(Math.max(5, Number(e.target.value) || 5))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                  />
                  <p className="text-[11px] font-bold text-[#a435f0]">
                    Total Team Annual Investment: ${Math.max(5, chefSeats) * 79} USD / year
                  </p>
                </div>
              )}

              {!selectedPlan.isTrial && selectedPlan.ziinaPayUrl && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Step 1: Complete Secure Payment</span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedPlan.id === 'team'
                        ? `$${Math.max(5, chefSeats) * 79} USD`
                        : `${selectedPlan.price} USD`}
                    </span>
                  </div>
                  <a
                    href={selectedPlan.ziinaPayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHasOpenedPayment(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#a435f0] hover:bg-[#8710d8] text-white font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Proceed to Checkout ({selectedPlan.price} USD)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="space-y-1">
                    <label htmlFor="plan-tx-ref" className="font-semibold text-slate-700 block">
                      Step 2: Payment Confirmation ID / Order Reference (after checkout)
                    </label>
                    <input
                      id="plan-tx-ref"
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder={hasOpenedPayment ? 'Paste payment receipt / reference ID' : 'Optional confirmation ID'}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>
              )}

              {selectedPlan.isTrial && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>72-hour full unrestricted brigade access starts immediately. No credit card required.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {signupLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{selectedPlan.isTrial ? 'Start 3-Day Free Trial' : 'Complete & Unlock Access'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
