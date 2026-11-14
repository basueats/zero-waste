import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  User,
  KeyRound,
  Mail,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Search,
  RefreshCw,
  Download,
  UserPlus,
  CheckCircle2,
  Ban,
  Clock,
  DollarSign,
  Users,
  Activity,
  Trash2,
  Lock,
  Unlock,
  LogOut,
  Settings,
  X,
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

export interface AdminManagedUser {
  email: string;
  name: string;
  role: 'admin' | 'member';
  planId: 'admin' | 'trial' | 'individual' | 'team' | 'training' | 'partner_member';
  planTitle: string;
  paymentStatus: 'paid' | 'unpaid' | 'trial' | 'pending_approval' | 'admin';
  amountPaid: number;
  currency: string;
  workPlace?: string;
  designation?: string;
  chefSeats?: number | null;
  status: 'active' | 'expired' | 'restricted' | 'pending_approval';
  restrictedByAdmin?: boolean;
  restrictedReason?: string;
  expiresAt: number | null;
  transactionRef?: string;
  source?: string;
  lastLoginAt?: number | null;
  loginCount: number;
  lastIp?: string;
  deviceInfo?: string;
  createdAt: number;
  updatedAt: number;
  daysRunning: number;
  daysLeft: number | null;
  hoursLeft: number | null;
  trialExpired: boolean;
  isPermanentAdmin: boolean;
}

export interface AdminLoginLog {
  id: string;
  email: string;
  name: string;
  action: string;
  status: 'success' | 'blocked' | 'info';
  detail: string;
  planId?: string;
  paymentStatus?: string;
  ip?: string;
  device?: string;
  timestamp: number;
}

interface AdminOverviewResponse {
  stats: {
    totalUsers: number;
    memberCount: number;
    paidUsers: number;
    unpaidUsers: number;
    activeTrials: number;
    restrictedOrExpired: number;
    pendingApproval: number;
    totalRevenueUsd: number;
    totalLogins: number;
  };
  users: AdminManagedUser[];
  loginLogs: AdminLoginLog[];
  adminProfile: {
    displayName: string;
    notificationEmail: string;
    recoveryKey?: string;
  };
}

interface AdminPortalViewProps {
  onBackToApp: () => void;
}

const ADMIN_TOKEN_KEY = 'supritamone_admin_token_v1';

function formatTimestamp(ts?: number | null): string {
  if (!ts) return 'Never';
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(ts?: number | null): string {
  if (!ts) return 'No login yet';
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onBackToApp }) => {
  const [checkingSession, setCheckingSession] = useState(true);
  const [adminSession, setAdminSession] = useState<{
    username: string;
    displayName: string;
    notificationEmail: string;
  } | null>(null);
  const [adminToken, setAdminToken] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || '';
    }
    return '';
  });

  // Login Gate state
  const [usernameInput, setUsernameInput] = useState('supritamone@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessMsg, setLoginSuccessMsg] = useState<string | null>(null);

  // Forgot / Reset Password flow state
  const [showForgotFlow, setShowForgotFlow] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotEmail, setForgotEmail] = useState('supritamone@gmail.com');
  const [forgotVerification, setForgotVerification] = useState('');
  const [forgotResetCode, setForgotResetCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Dashboard state
  const [overview, setOverview] = useState<AdminOverviewResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [actionBusyEmail, setActionBusyEmail] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'users' | 'billing' | 'logs' | 'settings'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'paid' | 'unpaid' | 'trial' | 'restricted' | 'admin'
  >('all');
  const [billingFilter, setBillingFilter] = useState<'all' | 'paid' | 'unpaid' | 'pending'>('all');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [bulkConfirmMode, setBulkConfirmMode] = useState<'selected' | 'all' | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Add User modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserWorkPlace, setNewUserWorkPlace] = useState('');
  const [newUserDesignation, setNewUserDesignation] = useState('');
  const [newUserPlan, setNewUserPlan] = useState<'individual' | 'team' | 'training' | 'trial'>('individual');
  const [newUserPaymentStatus, setNewUserPaymentStatus] = useState<'paid' | 'unpaid' | 'trial' | 'pending_approval'>('paid');
  const [newUserSeats, setNewUserSeats] = useState(5);
  const [creatingUser, setCreatingUser] = useState(false);

  // Admin Settings form state
  const [profileDisplayName, setProfileDisplayName] = useState('Dr. Chef Supritam Basu');
  const [profileNotificationEmail, setProfileNotificationEmail] = useState('supritam.basu@supritamone.com');
  const [profileCurrentPassword, setProfileCurrentPassword] = useState('');
  const [profileNewPassword, setProfileNewPassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [adminRecoveryKey, setAdminRecoveryKey] = useState('');
  const [copiedRecoveryKey, setCopiedRecoveryKey] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const showToast = useCallback((type: 'ok' | 'err', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }, []);

  const authHeaders = useCallback(
    (tokenOverride?: string): HeadersInit => {
      const tok = tokenOverride || adminToken;
      return tok
        ? { 'Content-Type': 'application/json', 'X-Admin-Token': tok }
        : { 'Content-Type': 'application/json' };
    },
    [adminToken]
  );

  const fetchOverview = useCallback(
    async (tokenOverride?: string) => {
      setLoadingData(true);
      try {
        const res = await fetch('/api/admin/overview', {
          credentials: 'include',
          headers: authHeaders(tokenOverride),
        });
        if (!res.ok) {
          if (res.status === 401) {
            setAdminSession(null);
          }
          return;
        }
        const data: AdminOverviewResponse = await res.json();
        setOverview(data);
        if (data.adminProfile) {
          setProfileDisplayName(data.adminProfile.displayName);
          setProfileNotificationEmail(data.adminProfile.notificationEmail);
          if (data.adminProfile.recoveryKey) {
            setAdminRecoveryKey(data.adminProfile.recoveryKey);
          }
        }
      } catch {
        showToast('err', 'Failed to load subscriber telemetry.');
      } finally {
        setLoadingData(false);
      }
    },
    [authHeaders, showToast]
  );

  // Check existing admin session on mount
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const res = await fetch('/api/admin/session', {
          credentials: 'include',
          headers: adminToken ? { 'X-Admin-Token': adminToken } : undefined,
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.authenticated && data?.admin) {
            setAdminSession(data.admin);
            await fetchOverview(adminToken);
          }
        }
      } catch {
        // Ignore startup check failure
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [adminToken, fetchOverview]);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccessMsg(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput.trim(),
          password: passwordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.authenticated) {
        setLoginError(data?.error || 'Invalid administrator credentials.');
        setLoginLoading(false);
        return;
      }
      const newToken = data.token || '';
      setAdminToken(newToken);
      if (typeof window !== 'undefined' && newToken) {
        localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
      }
      setAdminSession(data.admin);
      setPasswordInput('');
      await fetchOverview(newToken);
    } catch {
      setLoginError('Network error while authenticating Admin Portal.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForgotVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);
    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotEmail.trim(),
          verificationAnswer: forgotVerification.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.verified) {
        setForgotError(data?.error || 'Identity verification failed.');
        setForgotLoading(false);
        return;
      }
      setForgotResetCode(data.resetCode || '');
      setForgotStep('reset');
    } catch {
      setForgotError('Network error while verifying Admin identity.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: forgotEmail.trim(),
          resetCode: forgotResetCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setForgotError(data?.error || 'Could not reset Admin password.');
        setForgotLoading(false);
        return;
      }
      setUsernameInput(forgotEmail.trim());
      setPasswordInput('');
      setShowForgotFlow(false);
      setForgotStep('verify');
      setForgotVerification('');
      setForgotResetCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setLoginSuccessMsg('Admin password reset successfully! Sign in below with your new password.');
    } catch {
      setForgotError('Network error while updating password.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAdminSignOut = async () => {
    setAdminSession(null);
    setOverview(null);
    setAdminToken('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  };

  const handleUserAction = async (
    email: string,
    action: 'approve_paid' | 'mark_unpaid' | 'restrict' | 'expire_trial' | 'extend_trial' | 'unrestrict' | 'delete',
    extra?: { planId?: string; reason?: string; trialDays?: number }
  ) => {
    setActionBusyEmail(email);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ email, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('err', data?.error || 'Action failed.');
        return;
      }
      await fetchOverview();
      const actionLabels: Record<string, string> = {
        approve_paid: `Marked ${email} as Paid & Active for 1 Year.`,
        mark_unpaid: `Flagged ${email} as Unpaid.`,
        restrict: `Restricted portal access for ${email}.`,
        expire_trial: `Ended trial & locked access for ${email}.`,
        extend_trial: `Granted +3 Days Free Trial to ${email}.`,
        unrestrict: `Restored active access for ${email}.`,
        delete: `Removed ${email} from registry.`,
      };
      showToast('ok', actionLabels[action] || 'Updated user record.');
    } catch {
      showToast('err', 'Network error executing user update.');
    } finally {
      setActionBusyEmail(null);
    }
  };

  const handleBulkDelete = async (mode: 'selected' | 'all') => {
    setBulkDeleting(true);
    try {
      const payload =
        mode === 'all'
          ? { deleteAll: true }
          : { emails: Array.from(selectedEmails) };

      const res = await fetch('/api/admin/users/bulk-delete', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('err', data?.error || 'Bulk delete failed.');
        return;
      }
      setSelectedEmails(new Set());
      setBulkConfirmMode(null);
      await fetchOverview();
      showToast(
        'ok',
        `Deleted ${data.deletedCount} user(s). Master Admin account remains protected.`
      );
    } catch {
      showToast('err', 'Network error executing bulk delete.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelectUser = (email: string) => {
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(email)) {
        next.delete(email);
      } else {
        next.add(email);
      }
      return next;
    });
  };

  const handleEnforceExpiredTrials = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/enforce-expired-trials', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('err', data?.error || 'Unable to scan expired trials.');
        return;
      }
      await fetchOverview();
      showToast(
        'ok',
        data.restrictedCount > 0
          ? `Restricted ${data.restrictedCount} ended trial user(s).`
          : 'All ended free trial accounts are already restricted.'
      );
    } catch {
      showToast('err', 'Failed to enforce trial restrictions.');
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          name: newUserName.trim(),
          email: newUserEmail.trim(),
          password: newUserPassword.trim() || undefined,
          workPlace: newUserWorkPlace.trim(),
          designation: newUserDesignation.trim(),
          planId: newUserPlan,
          paymentStatus: newUserPlan === 'trial' ? 'trial' : newUserPaymentStatus,
          chefSeats: newUserPlan === 'team' ? Math.max(5, newUserSeats) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('err', data?.error || 'Could not create subscriber.');
        return;
      }
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserWorkPlace('');
      setNewUserDesignation('');
      await fetchOverview();
      showToast('ok', `Added ${data.user.email} to registry.`);
    } catch {
      showToast('err', 'Network error creating user.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profileNewPassword.trim() && profileNewPassword.trim() !== profileConfirmPassword.trim()) {
      showToast('err', 'New password and confirmation password do not match.');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({
          displayName: profileDisplayName.trim(),
          notificationEmail: profileNotificationEmail.trim(),
          currentPassword: profileCurrentPassword || undefined,
          newPassword: profileNewPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast('err', data?.error || 'Could not update profile.');
        return;
      }
      setProfileCurrentPassword('');
      setProfileNewPassword('');
      setProfileConfirmPassword('');
      await fetchOverview();
      showToast('ok', profileNewPassword.trim() ? 'Admin password & profile updated!' : 'Admin settings saved.');
    } catch {
      showToast('err', 'Network error saving Admin settings.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRegenerateRecoveryKey = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
        body: JSON.stringify({ regenerateRecoveryKey: true }),
      });
      const data = await res.json();
      if (res.ok && data?.adminProfile?.recoveryKey) {
        setAdminRecoveryKey(data.adminProfile.recoveryKey);
        showToast('ok', 'Generated new Master Admin Recovery Key. Save it securely.');
      } else {
        showToast('err', data?.error || 'Could not regenerate key.');
      }
    } catch {
      showToast('err', 'Network error regenerating recovery key.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportCsv = () => {
    if (!overview?.users) return;
    const headers = [
      'Email',
      'Name',
      'Role',
      'Workplace',
      'Designation',
      'Plan',
      'Payment Status',
      'Amount Paid USD',
      'Account Status',
      'Login Count',
      'Last Login',
      'Last IP',
      'Device',
      'Expires At',
      'Transaction Ref',
    ];
    const rows = overview.users.map((u) => [
      u.email,
      u.name,
      u.role,
      u.workPlace || '',
      u.designation || '',
      u.planTitle,
      u.paymentStatus,
      String(u.amountPaid || 0),
      u.status,
      String(u.loginCount || 0),
      u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : '',
      u.lastIp || '',
      u.deviceInfo || '',
      u.expiresAt ? new Date(u.expiresAt).toISOString() : 'Never',
      u.transactionRef || '',
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supritamone-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    const list = overview?.users || [];
    const q = searchQuery.trim().toLowerCase();
    return list.filter((u) => {
      if (statusFilter === 'paid' && u.paymentStatus !== 'paid') return false;
      if (
        statusFilter === 'unpaid' &&
        u.paymentStatus !== 'unpaid' &&
        u.paymentStatus !== 'pending_approval'
      ) {
        return false;
      }
      if (statusFilter === 'trial' && (u.planId !== 'trial' || u.status !== 'active' || u.trialExpired)) {
        return false;
      }
      if (
        statusFilter === 'restricted' &&
        u.status !== 'restricted' &&
        u.status !== 'expired' &&
        !u.trialExpired
      ) {
        return false;
      }
      if (statusFilter === 'admin' && u.role !== 'admin') return false;

      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.workPlace || '').toLowerCase().includes(q) ||
        (u.designation || '').toLowerCase().includes(q) ||
        (u.transactionRef || '').toLowerCase().includes(q) ||
        (u.lastIp || '').toLowerCase().includes(q) ||
        u.planTitle.toLowerCase().includes(q)
      );
    });
  }, [overview?.users, searchQuery, statusFilter]);

  const selectableFilteredUsers = useMemo(
    () => filteredUsers.filter((u) => !u.isPermanentAdmin),
    [filteredUsers]
  );

  const selectableTotalCount = useMemo(
    () => (overview?.users || []).filter((u) => !u.isPermanentAdmin).length,
    [overview?.users]
  );

  const allFilteredSelected =
    selectableFilteredUsers.length > 0 &&
    selectableFilteredUsers.every((u) => selectedEmails.has(u.email));

  const toggleSelectAllFiltered = () => {
    if (selectableFilteredUsers.length === 0) return;
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) {
        selectableFilteredUsers.forEach((u) => next.delete(u.email));
      } else {
        selectableFilteredUsers.forEach((u) => next.add(u.email));
      }
      return next;
    });
  };

  const billingUsers = useMemo(() => {
    const list = (overview?.users || []).filter((u) => u.role !== 'admin');
    if (billingFilter === 'paid') return list.filter((u) => u.paymentStatus === 'paid');
    if (billingFilter === 'unpaid') return list.filter((u) => u.paymentStatus === 'unpaid');
    if (billingFilter === 'pending') return list.filter((u) => u.paymentStatus === 'pending_approval');
    return list;
  }, [overview?.users, billingFilter]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0d1522] text-white flex flex-col items-center justify-center gap-3 p-4">
        <Loader2 className="w-7 h-7 animate-spin text-[#00c86d]" />
        <p className="text-xs font-medium text-slate-300">Checking Administrator Portal session...</p>
      </div>
    );
  }

  // ADMINISTRATOR LOGIN & FORGOT PASSWORD VIEW
  if (!adminSession) {
    return (
      <div className="min-h-screen bg-[#0d1522] text-white flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-[#1a2230] border border-[#283344] rounded-2xl shadow-2xl p-6 sm:p-9 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#00c86d]/10 border border-[#00c86d]/30 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-[#00c86d]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white">
                {showForgotFlow ? 'Reset Admin Password' : 'Administrator Access'}
              </h1>
              <p className="text-xs text-slate-400">
                {showForgotFlow
                  ? 'Verify recovery details for supritamone@gmail.com to set a new password'
                  : 'Zero Waste Platform Management & Subscriber Registry'}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131b27] border border-[#2c384b] text-[11px] font-medium text-[#00c86d]">
              <Mail className="w-3 h-3" />
              <span>supritamone@gmail.com</span>
            </div>
          </div>

          {!showForgotFlow ? (
            <>
              {loginSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{loginSuccessMsg}</span>
                </div>
              )}

              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleAdminSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-username-input"
                    className="block text-[11px] font-bold uppercase tracking-wider text-slate-300"
                  >
                    ADMIN USERNAME (EMAIL)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-username-input"
                      type="email"
                      autoComplete="username"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="supritamone@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="admin-password-input"
                      className="block text-[11px] font-bold uppercase tracking-wider text-slate-300"
                    >
                      ADMIN PASSWORD
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotFlow(true);
                        setForgotStep('verify');
                        setForgotEmail(usernameInput.trim() || 'supritamone@gmail.com');
                        setForgotError(null);
                      }}
                      className="text-[11px] font-semibold text-[#00c86d] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="admin-password-input"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 rounded-xl bg-[#00c86d] hover:bg-[#00b060] disabled:opacity-60 text-[#051b11] text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>SIGN IN TO ADMIN PORTAL</span>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              {forgotError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotStep === 'verify' ? (
                <form onSubmit={handleForgotVerify} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      ADMIN EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="supritamone@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      RECOVERY VERIFICATION
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotVerification}
                      onChange={(e) => setForgotVerification(e.target.value)}
                      placeholder="Backup email, Recovery Key, or CPD Provider #"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                    <p className="text-[11px] text-slate-400">
                      Enter your registered backup notification email (e.g. supritam.basu@supritamone.com) or saved Admin Recovery Key.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-xl bg-[#00c86d] hover:bg-[#00b060] disabled:opacity-60 text-[#051b11] text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>VERIFY &amp; CONTINUE</span>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Identity verified for {forgotEmail}. Set your new Admin password below.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      NEW ADMIN PASSWORD (MIN 6 CHARS)
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#131b27] border border-[#2c384b] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00c86d]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-xl bg-[#00c86d] hover:bg-[#00b060] disabled:opacity-60 text-[#051b11] text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>SAVE NEW ADMIN PASSWORD</span>}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            {showForgotFlow ? (
              <button
                type="button"
                onClick={() => {
                  setShowForgotFlow(false);
                  setForgotError(null);
                }}
                className="inline-flex items-center gap-1.5 text-[#00c86d] hover:underline font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Sign In</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowForgotFlow(true);
                  setForgotStep('verify');
                  setForgotEmail(usernameInput.trim() || 'supritamone@gmail.com');
                  setForgotError(null);
                }}
                className="inline-flex items-center gap-1.5 text-[#00c86d] hover:underline font-medium cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset / Recover Access</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToApp}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  const stats = overview?.stats || {
    totalUsers: 0,
    memberCount: 0,
    paidUsers: 0,
    unpaidUsers: 0,
    activeTrials: 0,
    restrictedOrExpired: 0,
    pendingApproval: 0,
    totalRevenueUsd: 0,
    totalLogins: 0,
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 font-sans">
      {/* Responsive Top Admin Bar across Mobile, Tablet, Laptop, Desktop */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-black text-[#00c86d] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold font-heading text-black leading-tight truncate">
                Zero Waste Admin Portal
              </h1>
              <p className="text-[11px] text-neutral-500 truncate">
                {adminSession.displayName} · {adminSession.username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fetchOverview()}
              disabled={loadingData}
              className="px-2.5 sm:px-3 py-2 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer"
              title="Refresh user data & login logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-2.5 sm:px-3 py-2 rounded-lg border border-neutral-200 hover:border-black text-xs font-semibold text-neutral-700 flex items-center gap-1.5 cursor-pointer"
              title="Export CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              onClick={onBackToApp}
              className="px-3 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Website</span>
            </button>

            <button
              onClick={handleAdminSignOut}
              className="p-2 rounded-lg border border-neutral-200 hover:border-red-300 hover:text-red-700 text-neutral-500 cursor-pointer"
              title="Sign Out of Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {toastMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              toastMsg.type === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMsg.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="cursor-pointer opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 6 KPI Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-neutral-500 text-[11px] font-bold uppercase">
              <span>Total Users</span>
              <Users className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-2xl font-black font-heading text-black">{stats.totalUsers}</p>
            <p className="text-[11px] text-neutral-500">{stats.memberCount} Brigade Members</p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 text-[11px] font-bold uppercase">
              <span>Paid Members</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black font-heading text-emerald-700">{stats.paidUsers}</p>
            <p className="text-[11px] font-semibold text-emerald-800">
              ${stats.totalRevenueUsd.toLocaleString()} USD Collected
            </p>
          </div>

          <div className="bg-white border border-amber-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-amber-800 text-[11px] font-bold uppercase">
              <span>Unpaid / Pending</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black font-heading text-amber-700">{stats.unpaidUsers}</p>
            <p className="text-[11px] text-amber-800">{stats.pendingApproval} Awaiting Approval</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-neutral-600 text-[11px] font-bold uppercase">
              <span>Active Trials</span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black font-heading text-black">{stats.activeTrials}</p>
            <p className="text-[11px] text-neutral-500">3-Day (72h) Running</p>
          </div>

          <div className="bg-white border border-red-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-red-700 text-[11px] font-bold uppercase">
              <span>Restricted</span>
              <Ban className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-black font-heading text-red-700">{stats.restrictedOrExpired}</p>
            <p className="text-[11px] text-red-700">Trial Ended / Locked</p>
          </div>

          <div className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-neutral-600 text-[11px] font-bold uppercase">
              <span>Total Logins</span>
              <Activity className="w-4 h-4 text-neutral-500" />
            </div>
            <p className="text-2xl font-black font-heading text-black">{stats.totalLogins}</p>
            <p className="text-[11px] text-neutral-500">Tracked SSO &amp; App Logins</p>
          </div>
        </section>

        {/* Primary Tab Switcher + Global Admin Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 bg-white border border-neutral-200 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'users' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              All Users &amp; Trial Control ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'billing' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Paid &amp; Unpaid Ledger
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'logs' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Login &amp; Lockout Logs ({overview?.loginLogs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings' ? 'bg-black text-white' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Admin Settings</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleEnforceExpiredTrials}
              className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Restrict Ended Trials</span>
            </button>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ALL USERS & ACCESS RESTRICTIONS */}
        {activeTab === 'users' && (
          <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user name, email, workplace, IP, TxID..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as const, label: 'All' },
                  { id: 'paid' as const, label: 'Paid' },
                  { id: 'unpaid' as const, label: 'Unpaid / Pending' },
                  { id: 'trial' as const, label: 'Active Trials' },
                  { id: 'restricted' as const, label: 'Restricted / Ended' },
                  { id: 'admin' as const, label: 'Admins' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                      statusFilter === f.id
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bulk Selection & Delete All Toolbar */}
            <div className="px-4 sm:px-5 py-2.5 bg-neutral-50 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 font-bold text-neutral-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    disabled={selectableFilteredUsers.length === 0}
                    onChange={toggleSelectAllFiltered}
                    className="w-4 h-4 rounded accent-black cursor-pointer disabled:opacity-40"
                  />
                  <span>
                    {allFilteredSelected && selectableFilteredUsers.length > 0
                      ? 'Deselect All'
                      : `Select All (${selectableFilteredUsers.length})`}
                  </span>
                </label>

                {selectedEmails.size > 0 && (
                  <span className="text-[11px] font-semibold text-neutral-600 bg-white border border-neutral-200 px-2 py-0.5 rounded-md">
                    {selectedEmails.size} selected
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedEmails.size > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedEmails(new Set())}
                      className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:border-black text-[11px] font-semibold text-neutral-700 cursor-pointer"
                    >
                      Clear Selection
                    </button>
                    <button
                      type="button"
                      disabled={bulkDeleting}
                      onClick={() => setBulkConfirmMode('selected')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected ({selectedEmails.size})</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={bulkDeleting || selectableTotalCount === 0}
                  onClick={() => setBulkConfirmMode('all')}
                  className="px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-700 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All ({selectableTotalCount})</span>
                </button>
              </div>
            </div>

            {/* Inline Two-Step Bulk Delete Confirmation Banner */}
            {bulkConfirmMode && (
              <div className="px-4 sm:px-5 py-3 bg-red-50 border-b border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-start sm:items-center gap-2 text-red-900 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    {bulkConfirmMode === 'all'
                      ? `Permanently delete all ${selectableTotalCount} non-admin user account(s)? Master Admin (supritamone@gmail.com) stays active.`
                      : `Permanently delete ${selectedEmails.size} selected user account(s)? This cannot be undone.`}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={bulkDeleting}
                    onClick={() => setBulkConfirmMode(null)}
                    className="px-3 py-1.5 rounded-lg border border-red-200 bg-white text-neutral-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={bulkDeleting}
                    onClick={() => handleBulkDelete(bulkConfirmMode)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {bulkDeleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Stacked Cards View (< md) */}
            <div className="md:hidden divide-y divide-neutral-100">
              {filteredUsers.map((u) => {
                const isBusy = actionBusyEmail === u.email;
                const isLocked = u.status === 'restricted' || u.status === 'expired' || u.trialExpired;
                const isChecked = selectedEmails.has(u.email);
                return (
                  <div key={`m-${u.email}`} className={`p-4 space-y-3 text-xs ${isChecked ? 'bg-red-50/40' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {!u.isPermanentAdmin && (
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectUser(u.email)}
                            aria-label={`Select ${u.email}`}
                            className="w-4 h-4 mt-0.5 rounded accent-black cursor-pointer shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate">{u.name}</p>
                          <p className="font-mono text-[11px] text-neutral-600 break-all">{u.email}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{u.planTitle}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] shrink-0 ${
                          u.isPermanentAdmin
                            ? 'bg-neutral-900 text-white'
                            : isLocked
                              ? 'bg-red-600 text-white'
                              : u.paymentStatus === 'paid'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 text-white'
                        }`}
                      >
                        {u.isPermanentAdmin ? 'MASTER ADMIN' : isLocked ? 'RESTRICTED' : u.paymentStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-500">
                      <span>
                        Paid: <strong className="text-neutral-900">${u.amountPaid} USD</strong>
                      </span>
                      <span>·</span>
                      <span>
                        {u.expiresAt === null
                          ? 'Lifetime Access'
                          : u.daysLeft !== null && u.daysLeft > 0
                            ? `${u.daysLeft}d left`
                            : 'Expired'}
                      </span>
                      <span>·</span>
                      <span>{u.loginCount} login(s)</span>
                    </div>

                    {!u.isPermanentAdmin && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {u.paymentStatus !== 'paid' && (
                          <button
                            disabled={isBusy}
                            onClick={() => handleUserAction(u.email, 'approve_paid')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            +1 Yr Paid
                          </button>
                        )}
                        {isLocked ? (
                          <button
                            disabled={isBusy}
                            onClick={() => handleUserAction(u.email, 'unrestrict')}
                            className="px-3 py-1.5 rounded-lg bg-black text-white font-bold text-[11px] cursor-pointer"
                          >
                            Unrestrict
                          </button>
                        ) : (
                          <button
                            disabled={isBusy}
                            onClick={() => handleUserAction(u.email, 'restrict')}
                            className="px-3 py-1.5 rounded-lg border border-red-300 text-red-700 font-bold text-[11px] cursor-pointer"
                          >
                            Restrict
                          </button>
                        )}
                        <button
                          disabled={isBusy}
                          onClick={() => handleUserAction(u.email, 'extend_trial', { trialDays: 3 })}
                          className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 font-semibold text-[11px] cursor-pointer"
                        >
                          +3d Trial
                        </button>
                        <button
                          disabled={isBusy}
                          onClick={() => handleUserAction(u.email, 'delete')}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No subscriber records match your current filter.
                </div>
              )}
            </div>

            {/* Desktop & Tablet Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="py-3 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        disabled={selectableFilteredUsers.length === 0}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Select all users"
                        className="w-4 h-4 rounded accent-black cursor-pointer disabled:opacity-40"
                      />
                    </th>
                    <th className="py-3 px-4">Subscriber &amp; Workplace</th>
                    <th className="py-3 px-4">Plan &amp; Source</th>
                    <th className="py-3 px-4">Payment ($USD)</th>
                    <th className="py-3 px-4">Trial / Validity</th>
                    <th className="py-3 px-4">Login Activity</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {filteredUsers.map((u) => {
                    const isBusy = actionBusyEmail === u.email;
                    const isLocked = u.status === 'restricted' || u.status === 'expired' || u.trialExpired;
                    const isChecked = selectedEmails.has(u.email);
                    return (
                      <tr
                        key={u.email}
                        className={`transition-colors align-top ${isChecked ? 'bg-red-50/40' : 'hover:bg-neutral-50/70'}`}
                      >
                        <td className="py-3.5 pl-4 pr-2">
                          {u.isPermanentAdmin ? (
                            <span title="Master Admin Protected" className="inline-flex mt-2">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectUser(u.email)}
                              aria-label={`Select ${u.email}`}
                              className="w-4 h-4 mt-2 rounded accent-black cursor-pointer"
                            />
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                u.isPermanentAdmin
                                  ? 'bg-emerald-600 text-white'
                                  : isLocked
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-neutral-900 text-white'
                              }`}
                            >
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-neutral-900">{u.name}</span>
                                {u.isPermanentAdmin && (
                                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    MASTER ADMIN
                                  </span>
                                )}
                              </div>
                              <p className="text-neutral-600 font-mono text-[11px] break-all">{u.email}</p>
                              {(u.workPlace || u.designation) && (
                                <p className="text-[11px] text-neutral-400">
                                  {[u.designation, u.workPlace].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          <span className="font-semibold text-neutral-900 block">{u.planTitle}</span>
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            Source: {u.source || 'web'}
                          </span>
                          {u.transactionRef && (
                            <span className="text-[10px] font-mono text-neutral-500 block">
                              Ref: {u.transactionRef}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {u.paymentStatus === 'paid' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                              PAID · ${u.amountPaid} USD
                            </span>
                          )}
                          {u.paymentStatus === 'unpaid' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-bold text-[10px]">
                              UNPAID · $0 USD
                            </span>
                          )}
                          {u.paymentStatus === 'trial' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-bold text-[10px]">
                              3-DAY TRIAL · $0 USD
                            </span>
                          )}
                          {u.paymentStatus === 'pending_approval' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                              PENDING APPROVAL
                            </span>
                          )}
                          {u.paymentStatus === 'admin' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 text-white font-bold text-[10px]">
                              UNRESTRICTED ADMIN
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-1">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">
                              <Ban className="w-3 h-3" />
                              <span>{u.trialExpired ? 'TRIAL ENDED · RESTRICTED' : 'RESTRICTED'}</span>
                            </span>
                          ) : u.status === 'pending_approval' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500 text-white font-bold text-[10px]">
                              PENDING
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
                              ACTIVE
                            </span>
                          )}
                          <p className="text-[11px] text-neutral-600">
                            {u.expiresAt === null
                              ? 'Lifetime / Permanent'
                              : u.daysLeft !== null && u.daysLeft > 0
                                ? `${u.daysLeft}d remaining`
                                : 'Expired'}
                          </p>
                          <p className="text-[10px] text-neutral-400">
                            Active {u.daysRunning}d · Joined {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                          {u.restrictedReason && isLocked && (
                            <p className="text-[10px] text-red-600 max-w-[200px] leading-snug">
                              {u.restrictedReason}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 space-y-0.5">
                          <p className="font-bold text-neutral-900">{u.loginCount} login(s)</p>
                          <p className="text-[11px] text-neutral-600">{formatRelative(u.lastLoginAt)}</p>
                          <p className="text-[10px] text-neutral-400">{formatTimestamp(u.lastLoginAt)}</p>
                          {(u.lastIp || u.deviceInfo) && (
                            <p className="text-[10px] font-mono text-neutral-500">
                              {[u.lastIp, u.deviceInfo].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {u.isPermanentAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Permanent Access</span>
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center justify-end gap-1.5">
                              {u.paymentStatus !== 'paid' && (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'approve_paid')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  +1 Yr Paid
                                </button>
                              )}

                              {u.paymentStatus === 'paid' && (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'mark_unpaid')}
                                  className="px-2 py-1 rounded-lg border border-amber-300 text-amber-800 hover:bg-amber-50 text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  Mark Unpaid
                                </button>
                              )}

                              {!isLocked && u.planId === 'trial' && (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'expire_trial')}
                                  className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                  End Trial &amp; Lock
                                </button>
                              )}

                              {isLocked ? (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'unrestrict')}
                                  className="px-2.5 py-1 rounded-lg bg-black hover:bg-neutral-800 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Unlock className="w-3 h-3" />
                                  <span>Unrestrict</span>
                                </button>
                              ) : (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'restrict')}
                                  className="px-2.5 py-1 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-[10px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Restrict</span>
                                </button>
                              )}

                              <button
                                disabled={isBusy}
                                onClick={() => handleUserAction(u.email, 'extend_trial', { trialDays: 3 })}
                                className="px-2 py-1 rounded-lg border border-neutral-200 hover:border-black text-neutral-700 text-[10px] font-semibold cursor-pointer disabled:opacity-50"
                                title="Grant +3 days trial access"
                              >
                                +3d Trial
                              </button>

                              {!u.isPermanentAdmin && (
                                <button
                                  disabled={isBusy}
                                  onClick={() => handleUserAction(u.email, 'delete')}
                                  className="p-1 rounded-lg border border-neutral-200 hover:border-red-300 hover:text-red-700 text-neutral-400 cursor-pointer disabled:opacity-50"
                                  title="Delete user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-500 text-xs">
                        No subscriber records match your current search/filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: PAID & UNPAID LEDGER */}
        {activeTab === 'billing' && (
          <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold font-heading text-black">Paid vs. Unpaid Subscriber Ledger</h2>
                <p className="text-xs text-neutral-500">
                  Total Revenue Collected: <strong className="text-emerald-700">${stats.totalRevenueUsd.toLocaleString()} USD</strong> across{' '}
                  <strong>{stats.paidUsers}</strong> paid accounts · <strong>{stats.unpaidUsers}</strong> unpaid/pending.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all' as const, label: 'All Billing' },
                  { id: 'paid' as const, label: 'Paid Only' },
                  { id: 'unpaid' as const, label: 'Unpaid Only' },
                  { id: 'pending' as const, label: 'Pending Approval' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setBillingFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                      billingFilter === f.id
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:text-black'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Stacked Cards View (< md) */}
            <div className="md:hidden divide-y divide-neutral-100">
              {billingUsers.map((u) => (
                <div key={`mb-${u.email}`} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{u.name}</p>
                      <p className="font-mono text-[11px] text-neutral-500 break-all">{u.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        u.paymentStatus === 'paid'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : u.paymentStatus === 'trial'
                            ? 'bg-blue-50 text-blue-800 border border-blue-200'
                            : u.paymentStatus === 'pending_approval'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {u.paymentStatus.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-600">
                    <span>{u.planTitle}</span>
                    <span className="font-mono font-bold text-neutral-900">${u.amountPaid} USD</span>
                  </div>
                  {u.transactionRef && (
                    <p className="font-mono text-[11px] text-neutral-500">Ref: {u.transactionRef}</p>
                  )}
                  <div className="pt-1">
                    {u.paymentStatus !== 'paid' ? (
                      <button
                        onClick={() => handleUserAction(u.email, 'approve_paid')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                      >
                        Approve &amp; Mark Paid
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUserAction(u.email, 'mark_unpaid')}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-[11px] font-bold cursor-pointer"
                      >
                        Mark Unpaid
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {billingUsers.length === 0 && (
                <div className="p-8 text-center text-xs text-neutral-500">
                  No billing records match your filter.
                </div>
              )}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase text-neutral-500">
                  <tr>
                    <th className="py-3 px-4">Subscriber</th>
                    <th className="py-3 px-4">Plan Tier</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4 text-right">Billing Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {billingUsers.map((u) => (
                    <tr key={u.email} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{u.name}</p>
                        <p className="text-[11px] font-mono text-neutral-500">{u.email}</p>
                      </td>
                      <td className="py-3 px-4 text-neutral-800 font-medium">{u.planTitle}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : u.paymentStatus === 'trial'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : u.paymentStatus === 'pending_approval'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {u.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                        ${u.amountPaid} USD
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                        {u.transactionRef || '—'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        {u.paymentStatus !== 'paid' ? (
                          <button
                            onClick={() => handleUserAction(u.email, 'approve_paid')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer"
                          >
                            Approve &amp; Mark Paid
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(u.email, 'mark_unpaid')}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-bold cursor-pointer"
                          >
                            Mark Unpaid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: LOGIN & RESTRICTION AUDIT LOGS */}
        {activeTab === 'logs' && (
          <section className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-neutral-100">
              <h2 className="text-base font-bold font-heading text-black">
                Real-Time Login, Partner SSO &amp; Post-Trial Lockout Log
              </h2>
              <p className="text-xs text-neutral-500">
                Tracks every password login, automatic{' '}
                <span className="font-mono text-black">zerowaste.supritamone.com</span> SSO arrival, trial start,
                paid conversion, and blocked attempt after trial expiration.
              </p>
            </div>
            {/* Mobile Stacked Cards View (< md) */}
            <div className="md:hidden divide-y divide-neutral-100">
              {(overview?.loginLogs || []).map((log) => (
                <div key={`mlog-${log.id}`} className="p-4 space-y-1.5 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{log.name}</p>
                      <p className="font-mono text-[11px] text-neutral-500 break-all">{log.email}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        log.status === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.status === 'blocked'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                      }`}
                    >
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-snug">{log.detail}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400 font-mono">
                    <span>{formatTimestamp(log.timestamp)}</span>
                    <span>{[log.ip, log.device].filter(Boolean).join(' · ') || '—'}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-bold uppercase text-neutral-500">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Event</th>
                    <th className="py-3 px-4">Detail</th>
                    <th className="py-3 px-4">IP / Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {(overview?.loginLogs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-500 text-[11px]">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-neutral-900">{log.name}</p>
                        <p className="font-mono text-[11px] text-neutral-500">{log.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.status === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : log.status === 'blocked'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                          }`}
                        >
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-700">{log.detail}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                        {[log.ip, log.device].filter(Boolean).join(' · ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: ADMIN SETTINGS & RECOVERY */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xs">
              <div>
                <h2 className="text-base font-bold font-heading text-black">Administrator Profile &amp; Password Reset</h2>
                <p className="text-xs text-neutral-500">
                  Primary Admin Username: <span className="font-mono text-black font-semibold">supritamone@gmail.com</span>
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral-700 block">Administrator Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileDisplayName}
                      onChange={(e) => setProfileDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral-700 block">Backup Notification Email</label>
                    <input
                      type="email"
                      required
                      value={profileNotificationEmail}
                      onChange={(e) => setProfileNotificationEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 space-y-3">
                  <p className="font-bold text-neutral-900 text-xs">Change or Reset Admin Password</p>

                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral-700 block">Current Password (Optional verification)</label>
                    <input
                      type="password"
                      value={profileCurrentPassword}
                      onChange={(e) => setProfileCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-neutral-700 block">New Password (min 6 chars)</label>
                      <input
                        type="password"
                        minLength={6}
                        value={profileNewPassword}
                        onChange={(e) => setProfileNewPassword(e.target.value)}
                        placeholder="Leave blank to keep existing"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-neutral-700 block">Confirm New Password</label>
                      <input
                        type="password"
                        minLength={6}
                        value={profileConfirmPassword}
                        onChange={(e) => setProfileConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {savingProfile ? 'Saving...' : 'Save Admin Settings & Password'}
                </button>
              </form>
            </section>

            <section className="lg:col-span-5 bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs h-fit">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold font-heading text-black">Master Recovery Key</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Save this recovery key or use your backup email (<span className="font-mono text-black">{profileNotificationEmail}</span>) on the Admin login screen&apos;s{' '}
                <strong>Forgot Password?</strong> flow if you ever need to reset your password later.
              </p>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-sm text-neutral-900 tracking-wide">
                  {adminRecoveryKey || 'ZW-MASTER-791463'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard && adminRecoveryKey) {
                      navigator.clipboard.writeText(adminRecoveryKey);
                      setCopiedRecoveryKey(true);
                      setTimeout(() => setCopiedRecoveryKey(false), 2000);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:border-black text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedRecoveryKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRecoveryKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                disabled={savingProfile}
                onClick={handleRegenerateRecoveryKey}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 hover:border-black text-xs font-bold text-neutral-800 cursor-pointer"
              >
                Generate New Recovery Key
              </button>
            </section>
          </div>
        )}
      </main>

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="px-5 py-4 bg-black text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#00c86d]" />
                <h3 className="font-bold text-sm">Add Subscriber / Brigade Member</h3>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Chef Full Name"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="chef@hotel.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Kitchen / Property</label>
                  <input
                    type="text"
                    value={newUserWorkPlace}
                    onChange={(e) => setNewUserWorkPlace(e.target.value)}
                    placeholder="Grand Resort Kitchen"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Designation / Role</label>
                  <input
                    type="text"
                    value={newUserDesignation}
                    onChange={(e) => setNewUserDesignation(e.target.value)}
                    placeholder="Executive Sous Chef"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Subscription Plan</label>
                  <select
                    value={newUserPlan}
                    onChange={(e) =>
                      setNewUserPlan(e.target.value as 'individual' | 'team' | 'training' | 'trial')
                    }
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-black"
                  >
                    <option value="individual">Individual ($99/yr)</option>
                    <option value="team">Team Brigade ($79/chef/yr)</option>
                    <option value="training">Executive Advisory ($1499/yr)</option>
                    <option value="trial">3-Day Free Trial ($0 / 72h)</option>
                  </select>
                </div>

                {newUserPlan !== 'trial' && (
                  <div className="space-y-1">
                    <label className="font-bold text-neutral-700 block">Payment Status</label>
                    <select
                      value={newUserPaymentStatus}
                      onChange={(e) =>
                        setNewUserPaymentStatus(
                          e.target.value as 'paid' | 'unpaid' | 'pending_approval'
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs bg-white focus:outline-none focus:border-black"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                      <option value="pending_approval">Pending Approval</option>
                    </select>
                  </div>
                )}
              </div>

              {newUserPlan === 'team' && (
                <div className="space-y-1">
                  <label className="font-bold text-neutral-700 block">Chef Seats (Min 5)</label>
                  <input
                    type="number"
                    min={5}
                    value={newUserSeats}
                    onChange={(e) => setNewUserSeats(Math.max(5, Number(e.target.value) || 5))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-neutral-700 block">Initial Password (Optional)</label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Optional login password (min 4 chars)"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-neutral-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold cursor-pointer disabled:opacity-60"
                >
                  {creatingUser ? 'Saving...' : 'Create Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
