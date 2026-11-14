import React, { useState, Suspense, lazy } from 'react';
import {
  Lock,
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
  Eye,
  EyeOff,
  Menu,
} from 'lucide-react';
import { SupritamoneLogo } from './SupritamoneLogo';
import { SurplusHomeView, HomePlanId } from './SurplusHomeView';

const AboutDrBasuModal = lazy(() =>
  import('./AboutDrBasuModal').then((m) => ({ default: m.AboutDrBasuModal }))
);

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
  price: string;
  cadence: string;
  isTrial?: boolean;
  ziinaPayUrl?: string;
}

export const ACADEMY_PLANS: AccessPlanOption[] = [
  {
    id: 'trial',
    title: '3-Day Free Trial',
    price: '$0',
    cadence: 'free for 3 days',
    isTrial: true,
  },
  {
    id: 'individual',
    title: 'Individual',
    price: '$99',
    cadence: 'per person/year',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/PXdVCwkJTu?source=app',
  },
  {
    id: 'team',
    title: 'Team',
    price: '$79',
    cadence: 'per chef/year',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/K_Yuf5UfM?source=app',
  },
  {
    id: 'training',
    title: 'Training',
    price: '$1499',
    cadence: 'per 5 chefs/year',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/V4v9zEpeg?source=app',
  },
];

interface AccessGateScreenProps {
  onUnlocked: (user: AuthenticatedSessionUser, token: string) => void;
  onOpenAdminPortal?: () => void;
  initialNotice?: string | null;
}

export const AccessGateScreen: React.FC<AccessGateScreenProps> = ({
  onUnlocked,
  onOpenAdminPortal,
  initialNotice = null,
}) => {
  const [showSignInModal, setShowSignInModal] = useState(Boolean(initialNotice));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(initialNotice);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);

  // Member Forgot Password state
  const [showMemberForgot, setShowMemberForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetVerification, setResetVerification] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Plan Checkout / Trial Activation Modal state
  const [selectedPlan, setSelectedPlan] = useState<AccessPlanOption | null>(null);
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupWorkPlace, setSignupWorkPlace] = useState('');
  const [chefSeats, setChefSeats] = useState<number>(5);
  const [transactionRef, setTransactionRef] = useState('');
  const [hasOpenedPayment, setHasOpenedPayment] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const isPermanentAdminInput = loginEmail.trim().toLowerCase() === 'supritamone@gmail.com';
  const isResetAdminInput = resetEmail.trim().toLowerCase() === 'supritamone@gmail.com';

  const scrollToElement = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenPlanModal = (planId: HomePlanId) => {
    const found = ACADEMY_PLANS.find((p) => p.id === planId) || ACADEMY_PLANS[0];
    setSelectedPlan(found);
    setSignupError(null);
    setHasOpenedPayment(false);
    setTransactionRef('');
    if (loginEmail.trim()) {
      setSignupEmail(loginEmail.trim());
    }
  };

  const handleLockedFeaturePrompt = (featureLabel: string) => {
    setLoginError(
      `Sign in or start your 3-Day Free Trial to unlock ${featureLabel}.`
    );
    setShowSignInModal(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);
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

  const handleMemberPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    if (isResetAdminInput) {
      if (onOpenAdminPortal) {
        setShowSignInModal(false);
        onOpenAdminPortal();
      } else {
        setResetError('Please reset Admin password via the Admin Portal Forgot Password option.');
      }
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail.trim(),
          fullName: resetVerification.trim(),
          verificationValue: resetVerification.trim(),
          newPassword: resetNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data?.error || 'Unable to verify your account details.');
        return;
      }
      setLoginEmail(resetEmail.trim());
      setLoginPassword('');
      setShowMemberForgot(false);
      setResetVerification('');
      setResetNewPassword('');
      setLoginError(null);
      setLoginSuccess('Your password has been reset. You can now sign in below.');
    } catch {
      setResetError('Network error while resetting password. Please try again.');
    } finally {
      setResetLoading(false);
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
          workPlace: signupWorkPlace.trim(),
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

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased flex flex-col selection:bg-black selection:text-white">
      {/* Minimal Top Navigation matching zerowaste.supritamone.com across Mobile, Tablet, Laptop & Desktop */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-neutral-200 safe-pt">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 lg:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2 -ml-1 rounded-lg text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center text-left focus:outline-none cursor-pointer shrink-0"
                title="Supritamone Zero Waste Academy"
              >
                <SupritamoneLogo size="md" />
              </button>
            </div>

            <nav className="hidden lg:flex items-center justify-center gap-3.5 xl:gap-5 2xl:gap-6 text-[11px] xl:text-xs font-medium text-neutral-500 min-w-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="h-16 inline-flex items-center border-b-2 border-black text-black font-bold cursor-pointer whitespace-nowrap"
              >
                ZERO WASTE App
              </button>
              <button
                onClick={() => scrollToElement('problem-solution')}
                className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black cursor-pointer whitespace-nowrap"
              >
                Problem &amp; Solutions
              </button>
              <button
                onClick={() => handleLockedFeaturePrompt('Recipes & Byproducts')}
                className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black cursor-pointer whitespace-nowrap"
              >
                Recipes &amp; Byproducts
              </button>
              <button
                onClick={() => scrollToElement('pricing')}
                className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black cursor-pointer whitespace-nowrap"
              >
                Training &amp; Pricing
              </button>
              <button
                onClick={() => scrollToElement('faq')}
                className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black cursor-pointer whitespace-nowrap"
              >
                FAQ
              </button>
              <button
                onClick={() => setShowAboutModal(true)}
                className="h-16 inline-flex items-center border-b-2 border-transparent hover:text-black cursor-pointer whitespace-nowrap"
              >
                About
              </button>
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold text-neutral-700 hover:text-black transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Portal</span>
                </button>
              )}

              <button
                onClick={() => {
                  setLoginError(initialNotice);
                  setLoginSuccess(null);
                  setShowMemberForgot(false);
                  setShowSignInModal(true);
                  setIsMobileMenuOpen(false);
                }}
                className="px-2.5 sm:px-3.5 py-2 rounded-lg border border-neutral-300 hover:border-black text-[11px] sm:text-xs font-bold text-neutral-900 transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleOpenPlanModal('trial');
                }}
                className="px-2.5 sm:px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-[11px] sm:text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="sm:hidden">Free Trial</span>
                <span className="hidden sm:inline">Start Free Trial</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile & Tablet Drop-Down Navigation Menu (< lg) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fadeIn">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-black bg-neutral-100 cursor-pointer"
            >
              ZERO WASTE App
            </button>
            <button
              onClick={() => scrollToElement('problem-solution')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Problem &amp; Solutions
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLockedFeaturePrompt('Recipes & Byproducts');
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Recipes &amp; Byproducts
            </button>
            <button
              onClick={() => scrollToElement('pricing')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              Training &amp; Pricing
            </button>
            <button
              onClick={() => scrollToElement('faq')}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setShowAboutModal(true);
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              About
            </button>
            {onOpenAdminPortal && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAdminPortal();
                }}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-2 mt-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Restriction / Expired Trial Alert Strip (shown only when blocked or expired) */}
      {initialNotice && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 text-xs text-red-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{initialNotice}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollToElement('pricing')}
                className="px-3 py-1 rounded-md bg-black text-white font-bold text-[11px] cursor-pointer"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowSignInModal(true)}
                className="px-3 py-1 rounded-md border border-red-300 bg-white text-red-800 font-bold text-[11px] cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Minimal Front Home Page copied from zerowaste.supritamone.com */}
      <main className="flex-1 w-full bg-white">
        <SurplusHomeView
          isGuestPreview
          onOpenCourse={() => handleLockedFeaturePrompt('the 26h Zero Waste Kitchen Course')}
          onOpenLibrary={() => handleLockedFeaturePrompt('the 500+ Recipe & Byproduct Library')}
          onOpenCertify={() => handleLockedFeaturePrompt('Official Certification')}
          onOpenSection={(sectionId) =>
            handleLockedFeaturePrompt(
              sectionId === 'waste-calculator' ? 'the Live Waste Calculator' : 'Academy Modules'
            )
          }
          onSelectNavTab={(tab) => handleLockedFeaturePrompt(`Academy (${tab})`)}
          onOpenAdminPortal={onOpenAdminPortal}
          onSelectPlan={handleOpenPlanModal}
        />
      </main>

      {/* MEMBER SIGN-IN & FORGOT PASSWORD MODAL */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="px-5 sm:px-6 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <h2 className="font-bold text-sm">
                    {showMemberForgot ? 'Reset Password · Supritamone Academy' : 'Member Sign-In · Supritamone Academy'}
                  </h2>
                  <p className="text-[11px] text-neutral-400">
                    {showMemberForgot
                      ? 'Verify your registered account details to set a new password'
                      : 'Sign in with your active trial or membership credentials'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSignInModal(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                aria-label="Close sign in modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              {!showMemberForgot ? (
                <>
                  {loginSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loginSuccess}</span>
                    </div>
                  )}

                  {loginError && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {isPermanentAdminInput && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Master Admin recognized: Enter your admin password to unlock unrestricted access.</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="gate-login-email" className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Email Address</span>
                      </label>
                      <input
                        id="gate-login-email"
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="chef@restaurant.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <label htmlFor="gate-login-password" className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Password</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowMemberForgot(true);
                            setResetEmail(loginEmail.trim());
                            setResetError(null);
                          }}
                          className="text-[11px] font-semibold text-neutral-600 hover:text-black underline cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          id="gate-login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={isPermanentAdminInput ? 'Enter admin password' : 'Enter your password'}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1 cursor-pointer"
                          aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {loginLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Sign In &amp; Unlock Academy</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                    <span>New chef or brigade?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSignInModal(false);
                        handleOpenPlanModal('trial');
                      }}
                      className="font-bold text-black hover:underline cursor-pointer"
                    >
                      Start 3-Day Free Trial →
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleMemberPasswordReset} className="space-y-4">
                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label htmlFor="reset-email-input" className="text-xs font-bold text-neutral-700 block">
                      Registered Email Address
                    </label>
                    <input
                      id="reset-email-input"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="chef@restaurant.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                    />
                  </div>

                  {isResetAdminInput ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2.5">
                      <p className="font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Master Admin Recovery</span>
                      </p>
                      <p className="text-emerald-900 leading-relaxed">
                        For security, Master Admin password resets use the Admin Portal verification flow (backup email or Admin Recovery Key).
                      </p>
                      {onOpenAdminPortal && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowSignInModal(false);
                            onOpenAdminPortal();
                          }}
                          className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Open Admin Portal Reset →
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label htmlFor="reset-verify-input" className="text-xs font-bold text-neutral-700 block">
                          Verification (Registered Full Name or Payment Ref ID)
                        </label>
                        <input
                          id="reset-verify-input"
                          type="text"
                          required
                          value={resetVerification}
                          onChange={(e) => setResetVerification(e.target.value)}
                          placeholder="Full name on account or Transaction Ref"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="reset-new-pw-input" className="text-xs font-bold text-neutral-700 block">
                          New Password (min 4 characters)
                        </label>
                        <input
                          id="reset-new-pw-input"
                          type="password"
                          required
                          minLength={4}
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          placeholder="Enter new login password"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-3 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        {resetLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>Verify &amp; Reset Password</span>
                        )}
                      </button>
                    </>
                  )}

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMemberForgot(false);
                        setResetError(null);
                      }}
                      className="font-bold text-black hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT / TRIAL ACTIVATION MODAL */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="px-6 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {selectedPlan.isTrial ? (
                  <Clock className="w-5 h-5 text-emerald-400" />
                ) : selectedPlan.id === 'team' ? (
                  <Users className="w-5 h-5 text-emerald-400" />
                ) : selectedPlan.id === 'training' ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                )}
                <div>
                  <h3 className="font-bold text-sm">{selectedPlan.title}</h3>
                  <p className="text-[11px] text-neutral-400">
                    {selectedPlan.price} USD {selectedPlan.cadence}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="plan-full-name" className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Full Name (For Certificate)</span>
                  </label>
                  <input
                    id="plan-full-name"
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Chef Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="plan-workplace" className="font-bold text-neutral-700 block">
                    Kitchen / Hotel Property
                  </label>
                  <input
                    id="plan-workplace"
                    type="text"
                    value={signupWorkPlace}
                    onChange={(e) => setSignupWorkPlace(e.target.value)}
                    placeholder="Property / Restaurant"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-email" className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Work / Academy Email ID</span>
                </label>
                <input
                  id="plan-email"
                  type="email"
                  required
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plan-password" className="font-bold text-neutral-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              {selectedPlan.id === 'team' && (
                <div className="space-y-1.5">
                  <label htmlFor="plan-seats" className="font-bold text-neutral-700 block">
                    Number of Chef Seats (Minimum 5 chefs · $79 USD/chef/year)
                  </label>
                  <input
                    id="plan-seats"
                    type="number"
                    min={5}
                    value={chefSeats}
                    onChange={(e) => setChefSeats(Math.max(5, Number(e.target.value) || 5))}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-sm text-neutral-900"
                  />
                  <p className="text-[11px] font-bold text-emerald-700">
                    Total Team Annual Investment: ${Math.max(5, chefSeats) * 79} USD / year
                  </p>
                </div>
              )}

              {!selectedPlan.isTrial && selectedPlan.ziinaPayUrl && (
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900">Step 1: Complete Secure Payment</span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
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
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Proceed to Checkout ({selectedPlan.price} USD)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <div className="space-y-1">
                    <label htmlFor="plan-tx-ref" className="font-semibold text-neutral-700 block">
                      Step 2: Payment Confirmation ID / Order Reference (after checkout)
                    </label>
                    <input
                      id="plan-tx-ref"
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder={hasOpenedPayment ? 'Paste payment receipt / reference ID' : 'Optional confirmation ID'}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-900"
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
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signupLoading}
                  className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 disabled:opacity-60 text-white font-bold flex items-center gap-1.5 cursor-pointer"
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
      {/* About Dr. Supritam Basu Popup Modal */}
      {showAboutModal && (
        <Suspense fallback={null}>
          <AboutDrBasuModal
            isOpen={showAboutModal}
            onClose={() => setShowAboutModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
};
