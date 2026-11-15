import React, { Suspense, lazy } from 'react';
import { SurplusHeader } from './components/SurplusHeader';
import { SurplusSidebar } from './components/SurplusSidebar';
import type { AuthenticatedSessionUser } from './components/AccessGateScreen';
import { apiFetchJson } from './utils/apiClient';
import {
  Compass,
  BookOpen,
  GraduationCap,
  Calculator,
  ChefHat,
  Mail,
  User,
  X,
  CheckCircle2,
  Lock,
  Award,
  Loader2,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  LogOut,
  Users,
  Crown,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { SupritamoneLogo } from './components/SupritamoneLogo';
import {
  ExamUnlockStatus,
  computeExamUnlockStatus,
  loadStoredExamProgress,
} from './data/examStatusUtils';

// Route/Tab Code-Splitting so initial load stays tiny & instantaneous
const AccessGateScreen = lazy(() =>
  import('./components/AccessGateScreen').then((m) => ({ default: m.AccessGateScreen }))
);
const AdminPortalView = lazy(() =>
  import('./components/AdminPortalView').then((m) => ({ default: m.AdminPortalView }))
);
const SurplusHomeView = lazy(() =>
  import('./components/SurplusHomeView').then((m) => ({ default: m.SurplusHomeView }))
);
const SurplusCoursesView = lazy(() =>
  import('./components/SurplusCoursesView').then((m) => ({ default: m.SurplusCoursesView }))
);
const SurplusCoursePlayer = lazy(() =>
  import('./components/SurplusCoursePlayer').then((m) => ({ default: m.SurplusCoursePlayer }))
);
const SurplusLibraryView = lazy(() =>
  import('./components/SurplusLibraryView').then((m) => ({ default: m.SurplusLibraryView }))
);
const SurplusCommunityView = lazy(() =>
  import('./components/SurplusCommunityView').then((m) => ({ default: m.SurplusCommunityView }))
);
const SurplusQuickWinsView = lazy(() =>
  import('./components/SurplusQuickWinsView').then((m) => ({ default: m.SurplusQuickWinsView }))
);
const SurplusNewslettersView = lazy(() =>
  import('./components/SurplusNewslettersView').then((m) => ({ default: m.SurplusNewslettersView }))
);
const SurplusCulinaryCoursesView = lazy(() =>
  import('./components/SurplusCulinaryCoursesView').then((m) => ({ default: m.SurplusCulinaryCoursesView }))
);
const SurplusWasteCalculator = lazy(() =>
  import('./components/SurplusWasteCalculator').then((m) => ({ default: m.SurplusWasteCalculator }))
);
const SurplusCertificateModal = lazy(() =>
  import('./components/SurplusCertificateModal').then((m) => ({ default: m.SurplusCertificateModal }))
);
const AboutDrBasuModal = lazy(() =>
  import('./components/AboutDrBasuModal').then((m) => ({ default: m.AboutDrBasuModal }))
);

const LEARNER_STORAGE_KEY = 'supritamone_learner_account';
const AUTH_TOKEN_STORAGE_KEY = 'supritamone_academy_session_token_v1';
const AUTH_USER_STORAGE_KEY = 'supritamone_academy_session_user_v1';
const AUTH_REMEMBER_UNTIL_KEY = 'supritamone_academy_remember_until_v1';
const REMEMBER_EMAIL_KEY = 'supritamone_remembered_email_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const RENEWAL_PLANS = [
  {
    id: 'individual' as const,
    title: 'Individual Annual Plan',
    price: '$99',
    cadence: 'per person / year',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/PXdVCwkJTu?source=app',
  },
  {
    id: 'team' as const,
    title: 'Team Brigade Plan',
    price: '$79',
    cadence: 'per chef / year (min 5)',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/K_Yuf5UfM?source=app',
  },
  {
    id: 'training' as const,
    title: 'Executive Advisory · Training',
    price: '$1499',
    cadence: 'per 5 chefs / year',
    ziinaPayUrl: 'https://pay.ziina.com/topinfluencer/V4v9zEpeg?source=app',
  },
];

function readCachedAuthState(): { user: AuthenticatedSessionUser | null; hasOptimisticSession: boolean } {
  if (typeof window === 'undefined') {
    return { user: null, hasOptimisticSession: false };
  }
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hasPartnerRedirectParam = Boolean(
      searchParams.get('from') ||
        searchParams.get('source') ||
        searchParams.get('ref') ||
        searchParams.get('partner') ||
        searchParams.get('sso')
    );
    if (hasPartnerRedirectParam) {
      return { user: null, hasOptimisticSession: false };
    }
    const sessToken = sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const sessUser = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (sessToken && sessUser) {
      const parsed = JSON.parse(sessUser) as AuthenticatedSessionUser;
      if (parsed && parsed.email) {
        return { user: parsed, hasOptimisticSession: true };
      }
    }

    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    const rememberUntilRaw = localStorage.getItem(AUTH_REMEMBER_UNTIL_KEY);
    if (rememberUntilRaw && Date.now() > Number(rememberUntilRaw)) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_REMEMBER_UNTIL_KEY);
      return { user: null, hasOptimisticSession: false };
    }
    if (token && rawUser) {
      const parsed = JSON.parse(rawUser) as AuthenticatedSessionUser;
      if (parsed && parsed.email) {
        return { user: parsed, hasOptimisticSession: true };
      }
    }
  } catch {
    // Ignore storage read errors
  }
  return { user: null, hasOptimisticSession: false };
}

function deriveNameFromEmail(email: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (cleanEmail === 'basueats@gmail.com') {
    return 'Supritam Basu';
  }
  const local = cleanEmail.split('@')[0] || '';
  const words = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 'Culinary Professional';
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface LearnerAccount {
  email: string;
  chosenName: string;
}

const ViewLoadingFallback: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="min-h-[45vh] w-full flex flex-col items-center justify-center gap-2.5 p-6 text-neutral-500">
    <Loader2 className="w-6 h-6 animate-spin text-neutral-900" />
    <span className="text-xs font-medium tracking-wide">{label}</span>
  </div>
);

export default function App() {
  const initialAuthSnapshot = React.useMemo(() => readCachedAuthState(), []);

  const [activeNavTab, setActiveNavTab] = React.useState<string>(() => {
    if (
      typeof window !== 'undefined' &&
      /\/(terms-conditions|cookie-policy|privacy-policy)/i.test(window.location.pathname)
    ) {
      return 'home';
    }
    return 'courses';
  });
  const [activeSection, setActiveSection] = React.useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [completedLessonsCount] = React.useState<number>(2);

  // Access Gate & Admin Portal State (optimistically hydrated for returning users -> 0ms first paint)
  const [authUser, setAuthUser] = React.useState<AuthenticatedSessionUser | null>(initialAuthSnapshot.user);
  const [isCheckingAccess, setIsCheckingAccess] = React.useState<boolean>(!initialAuthSnapshot.hasOptimisticSession);
  const [gateNotice, setGateNotice] = React.useState<string | null>(null);
  const [showAdminPortal, setShowAdminPortal] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/admin' || window.location.hash === '#admin';
    }
    return false;
  });

  // Signed-in learner profile (defaults to user's email/name, persisted in localStorage)
  const [learnerAccount, setLearnerAccount] = React.useState<LearnerAccount>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LEARNER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.email || parsed.chosenName)) {
            return {
              email: parsed.email || 'basueats@gmail.com',
              chosenName: parsed.chosenName || '',
            };
          }
        }
      } catch {
        // Ignore storage errors
      }
    }
    return {
      email: 'basueats@gmail.com',
      chosenName: 'Supritam Basu',
    };
  });

  const resolvedCertificateName = React.useMemo(() => {
    const trimmed = learnerAccount.chosenName.trim();
    if (trimmed) return trimmed;
    return deriveNameFromEmail(learnerAccount.email);
  }, [learnerAccount]);

  const todayFormatted = React.useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
  }, []);

  // Account Sign-In Modal draft state
  const [showAccountModal, setShowAccountModal] = React.useState<boolean>(false);
  const [draftEmail, setDraftEmail] = React.useState<string>(learnerAccount.email);
  const [draftName, setDraftName] = React.useState<string>(learnerAccount.chosenName);

  // Auto-adapted Mobile/Tablet Drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = React.useState<boolean>(false);

  // Modals
  const [showCertifyModal, setShowCertifyModal] = React.useState<boolean>(false);
  const [showCertLockedModal, setShowCertLockedModal] = React.useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = React.useState<boolean>(false);

  // Locked Account Renewal Modal state
  const [renewPlan, setRenewPlan] = React.useState<(typeof RENEWAL_PLANS)[number] | null>(null);
  const [renewPassword, setRenewPassword] = React.useState('');
  const [renewSeats, setRenewSeats] = React.useState(5);
  const [renewTxRef, setRenewTxRef] = React.useState('');
  const [renewLoading, setRenewLoading] = React.useState(false);
  const [renewError, setRenewError] = React.useState<string | null>(null);

  const isAccountLocked = React.useMemo(() => {
    if (!authUser) return false;
    if (authUser.role === 'admin' || authUser.email.toLowerCase() === 'supritamone@gmail.com') {
      return false;
    }
    const expiredNow =
      authUser.expiresAt !== null &&
      authUser.expiresAt !== undefined &&
      Date.now() > authUser.expiresAt;
    return Boolean(
      authUser.isLocked ||
        authUser.status === 'restricted' ||
        authUser.status === 'expired' ||
        expiredNow
    );
  }, [authUser]);

  // Global Overall Exam Status (Certificate unlocks ONLY when all 12 section exams passed with >= 37% overall score)
  const [examStatus, setExamStatus] = React.useState<ExamUnlockStatus>(() => {
    const stored = loadStoredExamProgress();
    return computeExamUnlockStatus(stored.passedQuizzes, stored.quizScores);
  });

  const handleOpenCertificate = React.useCallback(() => {
    if (examStatus.isUnlocked) {
      setShowCertLockedModal(false);
      setShowCertifyModal(true);
    } else {
      setShowCertLockedModal(true);
    }
  }, [examStatus.isUnlocked]);

  const applyAuthenticatedSession = React.useCallback(
    (user: AuthenticatedSessionUser, token: string, resetTab = true, rememberMe?: boolean) => {
      const shouldRemember = rememberMe ?? user.rememberMe ?? true;
      const hydratedUser = { ...user, rememberMe: shouldRemember };
      setAuthUser(hydratedUser);
      setGateNotice(null);
      if (resetTab) {
        setActiveNavTab('courses');
        setActiveSection('');
        setSelectedCourseId(null);
      }
      const updatedLearner: LearnerAccount = {
        email: hydratedUser.email,
        chosenName: hydratedUser.name || deriveNameFromEmail(hydratedUser.email),
      };
      setLearnerAccount(updatedLearner);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(updatedLearner));
          localStorage.setItem(REMEMBER_EMAIL_KEY, hydratedUser.email);
          if (shouldRemember) {
            localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(hydratedUser));
            localStorage.setItem(AUTH_REMEMBER_UNTIL_KEY, String(Date.now() + THIRTY_DAYS_MS));
            sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
          } else {
            sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
            sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(hydratedUser));
            localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
            localStorage.removeItem(AUTH_REMEMBER_UNTIL_KEY);
          }
        } catch {
          // Ignore storage errors
        }
      }
    },
    []
  );

  const handleSignOut = React.useCallback(() => {
    setAuthUser(null);
    setSelectedCourseId(null);
    setActiveNavTab('home');
    setIsMobileDrawerOpen(false);
    setRenewPlan(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(AUTH_USER_STORAGE_KEY);
        localStorage.removeItem(AUTH_REMEMBER_UNTIL_KEY);
        sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
      fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {
        // Ignore network errors on logout
      });
    }
  }, []);

  // Verify Partner Redirect (https://zerowaste.supritamone.com/) or Stored Auth Session Cookie/Token on startup
  React.useEffect(() => {
    let cancelled = false;
    const verifyAccess = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashQuery = window.location.hash.includes('?')
          ? window.location.hash.slice(window.location.hash.indexOf('?'))
          : '';
        const hashParams = new URLSearchParams(hashQuery);

        const getParam = (key: string) => searchParams.get(key) || hashParams.get(key) || '';
        const fromParam =
          getParam('from') ||
          getParam('source') ||
          getParam('ref') ||
          getParam('partner') ||
          (getParam('sso') ? 'partner_sso' : '');
        const emailParam = getParam('email');
        const nameParam = getParam('name');
        const planParam = getParam('plan') || getParam('trial') || 'partner_member';
        const refUrl = document.referrer || '';

        const partnerSources = [
          'zerowaste',
          'zerowaste.supritamone.com',
          'partner_sso',
          'supritamone',
          'trial',
          'paid',
          'pro',
          'individual',
          'team',
          'training',
        ];
        const refLower = refUrl.toLowerCase();
        const looksLikePartnerReferrer =
          /(?:^|\/\/)(?:www\.)?zerowaste\.supritamone\.com(?:[/:?#]|$)/i.test(refLower);
        const looksLikePartnerRedirect =
          looksLikePartnerReferrer || partnerSources.includes(fromParam.toLowerCase());

        // 1. Auto-unlock immediately if routed from https://zerowaste.supritamone.com/
        if (looksLikePartnerRedirect) {
          const res = await apiFetchJson<{
            authenticated?: boolean;
            user?: AuthenticatedSessionUser;
            token?: string;
            error?: string;
          }>('/api/auth/verify-redirect', {
            method: 'POST',
            retries: 1,
            body: JSON.stringify({
              referrer: refUrl,
              fromParam,
              email: emailParam,
              name: nameParam,
              planId: planParam,
            }),
          });
          if (res.ok && res.data?.authenticated && res.data.user && res.data.token && !cancelled) {
            applyAuthenticatedSession(res.data.user, res.data.token, true);
            if (window.location.search && fromParam) {
              window.history.replaceState({}, '', window.location.pathname);
            }
            setIsCheckingAccess(false);
            return;
          } else if (res.status === 403 && !cancelled) {
            setAuthUser(null);
            setGateNotice(
              res.errorMessage ||
                'Your 3-Day Free Trial has ended or access was restricted. Select a paid plan or contact Admin.'
            );
          }
        }

        // 2. Validate server session (cookie or Bearer token from sessionStorage/localStorage)
        const savedToken =
          sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY) || localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
        const res = await apiFetchJson<{
          authenticated?: boolean;
          user?: AuthenticatedSessionUser;
          token?: string;
          restricted?: boolean;
          expired?: boolean;
          error?: string;
        }>('/api/auth/session', {
          retries: 1,
          headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : undefined,
        });
        if (res.ok && res.data?.authenticated && res.data.user) {
          if (!cancelled) {
            applyAuthenticatedSession(
              res.data.user,
              res.data.token || savedToken || '',
              !initialAuthSnapshot.hasOptimisticSession,
              res.data.user.rememberMe
            );
            setIsCheckingAccess(false);
          }
          return;
        }
        if (savedToken) {
          localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          localStorage.removeItem(AUTH_USER_STORAGE_KEY);
          localStorage.removeItem(AUTH_REMEMBER_UNTIL_KEY);
          sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
          sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
        }
        if (!cancelled) {
          setAuthUser(null);
          if (res.data?.restricted || res.data?.expired || (savedToken && res.data?.error)) {
            setGateNotice(
              res.data?.error || 'Your session or trial has expired. Sign in or select a plan to restore access.'
            );
          }
        }
      } catch {
        // Ignore transient network errors
      } finally {
        if (!cancelled) {
          setIsCheckingAccess(false);
        }
      }
    };

    verifyAccess();
    return () => {
      cancelled = true;
    };
  }, [applyAuthenticatedSession, initialAuthSnapshot.hasOptimisticSession]);

  // Auto-close slide-out drawer when viewport expands to desktop
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectNavTab = (tab: string) => {
    setActiveNavTab(tab);
    setActiveSection('');
    setIsMobileDrawerOpen(false);
    if (tab === 'the-zero-waste-kitchen-course') {
      setSelectedCourseId('food-waste-prevention-chefs');
    } else {
      setSelectedCourseId(null);
      if (tab === 'home' && typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    setActiveNavTab('home');
    setActiveSection('');
    setSelectedCourseId(null);
    setIsMobileDrawerOpen(false);
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 60);
  };

  const handleSelectSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSelectedCourseId(null);
    setIsMobileDrawerOpen(false);
    if (sectionId === 'waste-calculator') {
      setActiveNavTab('calculator');
    } else if (sectionId === 'ask-dr-basu') {
      setActiveNavTab('community');
    } else {
      setActiveNavTab('quick-wins');
    }
  };

  const handleOpenCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveNavTab('courses');
    setActiveSection('');
    setIsMobileDrawerOpen(false);
  };

  if (showAdminPortal) {
    return (
      <Suspense fallback={<ViewLoadingFallback label="Loading Administrator Portal..." />}>
        <AdminPortalView
          onBackToApp={() => {
            setShowAdminPortal(false);
            if (typeof window !== 'undefined' && (window.location.pathname === '/admin' || window.location.hash === '#admin')) {
              window.history.replaceState({}, '', '/');
            }
          }}
        />
      </Suspense>
    );
  }

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-7 h-7 animate-spin text-black" />
        <p className="text-xs font-semibold text-neutral-500 tracking-wide">
          Loading Supritamone Academy...
        </p>
      </div>
    );
  }

  if (!authUser) {
    return (
      <Suspense fallback={<ViewLoadingFallback label="Loading Supritamone Academy..." />}>
        <AccessGateScreen
          onUnlocked={(user, token, rememberMe) => applyAuthenticatedSession(user, token, true, rememberMe)}
          onOpenAdminPortal={() => setShowAdminPortal(true)}
          initialNotice={gateNotice}
        />
      </Suspense>
    );
  }

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewPlan) return;
    setRenewError(null);
    setRenewLoading(true);
    try {
      const res = await apiFetchJson<{
        authenticated?: boolean;
        user?: AuthenticatedSessionUser;
        token?: string;
        error?: string;
      }>('/api/auth/activate-plan', {
        method: 'POST',
        body: JSON.stringify({
          planId: renewPlan.id,
          name: authUser.name,
          email: authUser.email,
          password: renewPassword,
          chefSeats: renewPlan.id === 'team' ? Math.max(5, renewSeats) : undefined,
          transactionRef: renewTxRef.trim() || undefined,
          rememberMe: authUser.rememberMe !== false,
        }),
      });
      if (!res.ok || !res.data?.authenticated || !res.data.user || !res.data.token) {
        setRenewError(res.errorMessage || 'Unable to renew membership. Please check your details.');
        return;
      }
      setRenewPlan(null);
      setRenewPassword('');
      setRenewTxRef('');
      applyAuthenticatedSession(res.data.user, res.data.token, true, authUser.rememberMe !== false);
    } finally {
      setRenewLoading(false);
    }
  };

  if (isAccountLocked) {
    const expiredMessage =
      authUser.lockReason ||
      (authUser.planId === 'trial'
        ? 'Your 3-Day Free Trial has ended — All Academy features are automatically locked. Upgrade to a paid plan below to restore full access.'
        : `Your ${authUser.planTitle || 'Membership Plan'} period has finished — All Academy features are automatically locked. Renew below to restore access.`);

    const lockedModules = [
      { title: '26h Zero Waste Kitchen Course', desc: '12 modules, 24 narrated chapters & section exams' },
      { title: '500+ Recipe & Byproduct Library', desc: 'Rind, stem, bone & peel repurposing database' },
      { title: 'Live Kitchen Waste Calculator', desc: 'Food cost recovery & GP% impact simulator' },
      { title: 'Executive Culinary Newsletters', desc: 'Weekly waste-reduction briefs & station playbooks' },
      { title: 'Global Masterclass Series', desc: 'Chef-led demonstrations & yield SOPs' },
      { title: 'Official CPD Certificate & Community', desc: 'Verified certificate & Dr. Basu advisory' },
    ];

    return (
      <div className="min-h-screen bg-slate-50 text-neutral-900 font-sans antialiased flex flex-col">
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 safe-pt">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
            <SupritamoneLogo size="md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-neutral-900">{authUser.name}</p>
                <p className="text-[11px] font-mono text-neutral-500">{authUser.email}</p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Auto-Restricted</span>
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-black text-xs font-bold text-neutral-800 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="space-y-1.5 flex-1">
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded">
                  Membership Expired · All Features Locked
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading text-black">
                  Account Signed In — Academy Access Auto-Restricted
                </h1>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">{expiredMessage}</p>
                <p className="text-[11px] text-neutral-500 pt-1">
                  Signed in as <strong className="text-neutral-900">{authUser.email}</strong> · Previous plan:{' '}
                  <strong className="text-neutral-900">{authUser.planTitle}</strong>
                </p>
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Locked Academy Modules (Upgrade Required)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {lockedModules.map((mod) => (
                <div
                  key={mod.title}
                  aria-disabled="true"
                  className="bg-white/80 border border-neutral-200 rounded-2xl p-4 space-y-2 opacity-75 select-none"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-800">{mod.title}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 text-white text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>LOCKED</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-snug">{mod.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold font-heading text-black">
                Upgrade or Renew Paid Membership to Unlock Instantly
              </h2>
              <p className="text-xs text-neutral-600">
                Choose an annual plan below to restore full unrestricted access for <strong>{authUser.email}</strong>.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RENEWAL_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white border border-neutral-200 hover:border-black transition-colors rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {plan.id === 'team' ? (
                        <Users className="w-5 h-5 text-emerald-600" />
                      ) : plan.id === 'training' ? (
                        <Crown className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        1 Year Full Access
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-black">{plan.title}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black font-heading text-black">{plan.price}</span>
                      <span className="text-[11px] text-neutral-500">USD · {plan.cadence}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRenewPlan(plan);
                      setRenewError(null);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Unlock with {plan.title.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>

        {renewPlan && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white text-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 w-full max-w-md overflow-hidden">
              <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">Renew · {renewPlan.title}</h3>
                  <p className="text-[11px] text-neutral-400">
                    {renewPlan.price} USD {renewPlan.cadence} · {authUser.email}
                  </p>
                </div>
                <button
                  onClick={() => setRenewPlan(null)}
                  className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleRenewSubmit} className="p-5 space-y-4 text-xs">
                {renewError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800">{renewError}</div>
                )}

                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                  <div className="flex items-center justify-between font-bold text-neutral-900">
                    <span>Step 1: Complete Secure Payment</span>
                    <span>
                      {renewPlan.id === 'team' ? `$${Math.max(5, renewSeats) * 79} USD` : `${renewPlan.price} USD`}
                    </span>
                  </div>
                  <a
                    href={renewPlan.ziinaPayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Checkout ({renewPlan.price} USD)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <input
                    type="text"
                    value={renewTxRef}
                    onChange={(e) => setRenewTxRef(e.target.value)}
                    placeholder="Payment Confirmation / Reference ID"
                    className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                  />
                </div>

                {renewPlan.id === 'team' && (
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Number of Chef Seats (Min 5)</label>
                    <input
                      type="number"
                      min={5}
                      value={renewSeats}
                      onChange={(e) => setRenewSeats(Math.max(5, Number(e.target.value) || 5))}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-xs"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-neutral-700 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Confirm / Set Account Password (min 4 chars)</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={renewPassword}
                    onChange={(e) => setRenewPassword(e.target.value)}
                    placeholder="Enter password for your account"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRenewPlan(null)}
                    className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renewLoading}
                    className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {renewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Unlock Full Access</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-clip ${activeNavTab === 'home' ? 'bg-white text-[#111111]' : 'bg-slate-50 text-slate-900'} font-sans antialiased flex flex-col selection:bg-black selection:text-white`}>
      {/* If a course player is open, render the full-screen course player interface */}
      {selectedCourseId ? (
        <main className="flex-1 w-full">
          <Suspense fallback={<ViewLoadingFallback label="Loading 26h Zero Waste Course Player..." />}>
            <SurplusCoursePlayer
              courseId={selectedCourseId}
              learnerName={resolvedCertificateName}
              onBackToCourses={() => setSelectedCourseId(null)}
              onGoHome={() => {
                setSelectedCourseId(null);
                handleSelectNavTab('home');
              }}
              onOpenCertify={handleOpenCertificate}
              onExamStatusChange={setExamStatus}
            />
          </Suspense>
        </main>
      ) : (
        <>
          {/* Top Navigation Bar */}
          <SurplusHeader
            activeNavTab={activeNavTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCertify={handleOpenCertificate}
            onSelectNavTab={handleSelectNavTab}
            onScrollToSection={handleScrollToSection}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onToggleMobileDrawer={() => setIsMobileDrawerOpen((prev) => !prev)}
            learnerName={resolvedCertificateName}
            learnerEmail={learnerAccount.email}
            planTitle={authUser.planTitle}
            isCertificateUnlocked={examStatus.isUnlocked}
            onOpenAccountModal={() => {
              setDraftEmail(learnerAccount.email);
              setDraftName(learnerAccount.chosenName);
              setShowAccountModal(true);
            }}
            onOpenAdminPortal={() => setShowAdminPortal(true)}
            onOpenAbout={() => setShowAboutModal(true)}
            onSignOut={handleSignOut}
          />

          {/* Mobile & Tablet Drawer Overlay */}
          {isMobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                onClick={() => setIsMobileDrawerOpen(false)}
              />
              <div className="relative z-10 w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
                <SurplusSidebar
                  currentSection={activeSection}
                  onSelectSection={handleSelectSection}
                  activeNavTab={activeNavTab}
                  onSelectNavTab={handleSelectNavTab}
                  completedLessonsCount={completedLessonsCount}
                  isCertificateUnlocked={examStatus.isUnlocked}
                  examStatus={examStatus}
                  onOpenCertify={() => {
                    handleOpenCertificate();
                    setIsMobileDrawerOpen(false);
                  }}
                  onCloseDrawer={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>
          )}

          {/* AUTO-CALIBRATED RESPONSIVE PORTAL: Full-width clean front page on Home, Sidebar Workspace on internal Academy views */}
          {activeNavTab === 'home' ? (
            <main className="flex-1 w-full bg-white pb-16 lg:pb-0">
              <Suspense fallback={<ViewLoadingFallback label="Loading Home..." />}>
                <SurplusHomeView
                  onOpenCourse={handleOpenCourse}
                  onOpenLibrary={() => handleSelectNavTab('library')}
                  onOpenCertify={handleOpenCertificate}
                  onOpenSection={handleSelectSection}
                  onSelectNavTab={handleSelectNavTab}
                  onOpenAdminPortal={() => setShowAdminPortal(true)}
                  isCertificateUnlocked={examStatus.isUnlocked}
                  examStatus={examStatus}
                />
              </Suspense>
            </main>
          ) : (
            <div className="flex-1 flex max-w-7xl w-full mx-auto">
              {/* Desktop Left Sidebar */}
              <div className="hidden lg:block shrink-0">
                <SurplusSidebar
                  currentSection={activeSection}
                  onSelectSection={handleSelectSection}
                  activeNavTab={activeNavTab}
                  onSelectNavTab={handleSelectNavTab}
                  completedLessonsCount={completedLessonsCount}
                  isCertificateUnlocked={examStatus.isUnlocked}
                  examStatus={examStatus}
                  onOpenCertify={handleOpenCertificate}
                />
              </div>

              {/* Main Content Area */}
              <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-24 lg:pb-8 w-full max-w-full">
                <Suspense fallback={<ViewLoadingFallback label="Loading module..." />}>
                  {activeNavTab === 'culinary-courses' ? (
                    <SurplusCulinaryCoursesView
                      onBackToZeroWaste={() => handleSelectNavTab('courses')}
                    />
                  ) : activeNavTab === 'calculator' || activeSection === 'waste-calculator' ? (
                    <SurplusWasteCalculator
                      onOpenLibrary={() => handleSelectNavTab('library')}
                      onOpenCourse={handleOpenCourse}
                    />
                  ) : activeNavTab === 'courses' ? (
                    <SurplusCoursesView
                      onOpenCourse={handleOpenCourse}
                      searchQuery={searchQuery}
                    />
                  ) : activeNavTab === 'library' ? (
                    <SurplusLibraryView searchQuery={searchQuery} />
                  ) : activeNavTab === 'newsletter' || activeNavTab === 'the-zero-waste-kitchen-course' ? (
                    <SurplusNewslettersView
                      onOpenCourse={handleOpenCourse}
                      searchQuery={searchQuery}
                    />
                  ) : activeSection === 'ask-dr-basu' || activeNavTab === 'events' ? (
                    <SurplusCommunityView initialSubTab="ask" />
                  ) : (
                    <SurplusQuickWinsView
                      sectionId={activeSection || 'start-here'}
                      onOpenCourse={handleOpenCourse}
                      onOpenCalculator={() => {
                        setActiveNavTab('calculator');
                        setActiveSection('waste-calculator');
                      }}
                    />
                  )}
                </Suspense>
              </main>
            </div>
          )}

          {/* MOBILE BOTTOM NAVIGATION BAR */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 sm:px-2 pt-1.5 safe-pb flex items-center justify-around shadow-lg">
            <button
              onClick={() => handleSelectNavTab('home')}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'home' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 mb-0.5" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('courses')}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'courses' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4 mb-0.5" />
              <span>Zero Waste</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('culinary-courses')}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'culinary-courses' ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 mb-0.5" />
              <span>Culinary</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('calculator')}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-lg text-[10px] font-bold transition-colors relative ${
                activeNavTab === 'calculator' || activeSection === 'waste-calculator'
                  ? 'text-emerald-700 bg-emerald-50 rounded-lg'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Calculator className="w-4 h-4 mb-0.5 text-emerald-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <span>Calculator</span>
            </button>

            <button
              onClick={() => handleSelectNavTab('library')}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2.5 rounded-lg text-[10px] font-bold transition-colors ${
                activeNavTab === 'library' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4 mb-0.5" />
              <span>Library</span>
            </button>
          </nav>
        </>
      )}

      {/* MODAL 1: Official Supritamone Academy Zero Waste Certificate Generator (Lazy-loaded when opened) */}
      {showCertifyModal && (
        <Suspense fallback={null}>
          <SurplusCertificateModal
            isOpen={showCertifyModal}
            onClose={() => setShowCertifyModal(false)}
            defaultLearnerName={resolvedCertificateName}
            completionDateDefault={todayFormatted}
          />
        </Suspense>
      )}

      {/* MODAL 3: Learner Login / Account Identity Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Learner Sign-In & Certificate Name</h3>
                  <p className="text-[11px] text-slate-400">Your certificate uses your chosen name or email ID</p>
                </div>
              </div>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updated: LearnerAccount = {
                  email: draftEmail.trim() || 'basueats@gmail.com',
                  chosenName: draftName.trim(),
                };
                setLearnerAccount(updated);
                if (typeof window !== 'undefined') {
                  localStorage.setItem(LEARNER_STORAGE_KEY, JSON.stringify(updated));
                }
                setShowAccountModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="space-y-1.5">
                <label htmlFor="learner-email-input" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>Login Email ID</span>
                </label>
                <input
                  id="learner-email-input"
                  type="email"
                  required
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="chef@restaurant.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="learner-name-input" className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chosen Full Name (Optional — defaults to Email ID)</span>
                </label>
                <input
                  id="learner-name-input"
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={`Leave blank to use "${deriveNameFromEmail(draftEmail)}"`}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-[11px] text-amber-900 block font-semibold">Name Printed on Certificate:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {draftName.trim() || deriveNameFromEmail(draftEmail)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                >
                  Save & Apply to Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Certificate Locked Notice Modal (Requires Overall Total Exam >= 37% Pass) */}
      {showCertLockedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Certificate Locked</h3>
                  <p className="text-[11px] text-slate-400">Pass overall total exam (≥ 37%) to unlock</p>
                </div>
              </div>
              <button
                onClick={() => setShowCertLockedModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Overall Total Exam Score</span>
                  <span className="font-mono">{examStatus.overallScorePercent}% / 37% Required</span>
                </div>
                <div className="w-full bg-amber-200/70 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, examStatus.overallScorePercent)}%` }}
                  />
                </div>
                <p className="text-[11px] text-amber-800">
                  Section Exams Passed: <strong>{examStatus.passedCount} of {examStatus.totalQuizzes}</strong> (10 questions per quiz, ≥ 37% passing mark).
                </p>
              </div>

              <p className="leading-relaxed text-slate-600">
                Your official <strong>Supritamone Academy Zero Waste Certificate</strong> unlocks automatically once all {examStatus.totalQuizzes} section exams are completed with an overall total score of <strong>37% or higher</strong>.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowCertLockedModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowCertLockedModal(false);
                    setSelectedCourseId('food-waste-prevention-chefs');
                  }}
                  className="px-5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Open Course Exams</span>
                </button>
              </div>
            </div>
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
}
