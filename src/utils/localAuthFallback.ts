// Client-side persistent auth & admin fallback for static-only deployments (where /api/* returns 404/405).
// Dynamically imported only when no backend server is reachable on /api/auth/* or /api/admin/*.

const STORAGE_KEY = 'supritamone_static_auth_store_v1';
const PERMANENT_ADMIN_EMAIL = 'supritamone@gmail.com';
const FACULTY_ADMIN_EMAIL = 'supritam.basu@supritamone.com';
const DEFAULT_ADMIN_RECOVERY_KEY = 'ZW-MASTER-791463';
const DEFAULT_ADMIN_PW_HASH = 'default:babaisona2029_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

type UserPaymentStatus = 'paid' | 'unpaid' | 'trial' | 'pending_approval' | 'admin';
type UserAccountStatus = 'active' | 'expired' | 'restricted' | 'pending_approval';

interface StoredAuthUser {
  email: string;
  name: string;
  passwordHash?: string;
  role: 'admin' | 'member';
  planId: 'admin' | 'trial' | 'individual' | 'team' | 'training' | 'partner_member';
  planTitle: string;
  paymentStatus: UserPaymentStatus;
  amountPaid: number;
  currency: string;
  workPlace?: string;
  designation?: string;
  chefSeats?: number;
  status: UserAccountStatus;
  restrictedByAdmin?: boolean;
  restrictedReason?: string;
  expiresAt: number | null;
  transactionRef?: string;
  source?: string;
  lastLoginAt?: number | null;
  loginCount?: number;
  lastIp?: string;
  deviceInfo?: string;
  createdAt: number;
  updatedAt: number;
}

interface LoginAuditEntry {
  id: string;
  email: string;
  name: string;
  action:
    | 'login'
    | 'partner_sso'
    | 'plan_activation'
    | 'trial_started'
    | 'blocked_expired'
    | 'blocked_restricted'
    | 'blocked_bad_password'
    | 'admin_action';
  status: 'success' | 'blocked' | 'info';
  detail: string;
  planId?: string;
  paymentStatus?: string;
  ip?: string;
  device?: string;
  timestamp: number;
}

interface StaticAuthStore {
  users: Record<string, StoredAuthUser>;
  loginLogs: LoginAuditEntry[];
  adminSettings: {
    displayName: string;
    notificationEmail: string;
    passwordHash: string;
    recoveryKey: string;
    resetCode?: string;
    resetExpiresAt?: number;
  };
}

function deriveDisplayName(email: string): string {
  return (email.split('@')[0] || 'Zero Waste Chef')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

async function hashSecret(secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(`supritamone-zw:${secret}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `sha256:${hex}`;
  }
  return `plain:${btoa(unescape(encodeURIComponent(secret)))}`;
}

async function verifySecret(secret: string, storedHash?: string): Promise<boolean> {
  if (!storedHash) return false;
  if (storedHash === DEFAULT_ADMIN_PW_HASH) {
    return secret === 'Babaisona2029@';
  }
  if (storedHash.startsWith('sha256:')) {
    const candidate = await hashSecret(secret);
    return candidate === storedHash;
  }
  if (storedHash.startsWith('plain:')) {
    return `plain:${btoa(unescape(encodeURIComponent(secret)))}` === storedHash;
  }
  return false;
}

function encodeToken(payload: Record<string, unknown>): string {
  const json = JSON.stringify({ ...payload, issuedAt: Date.now() });
  const encoded = btoa(unescape(encodeURIComponent(json)));
  return `zwlocal.${encoded}`;
}

function decodeToken(token: string): Record<string, unknown> | null {
  if (!token || !token.startsWith('zwlocal.')) return null;
  try {
    const raw = token.slice('zwlocal.'.length);
    const json = decodeURIComponent(escape(atob(raw)));
    const parsed = JSON.parse(json) as Record<string, unknown>;
    if (parsed.expiresAt && Date.now() > Number(parsed.expiresAt)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function loadStore(): StaticAuthStore {
  const now = Date.now();
  let parsed: Partial<StaticAuthStore> | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw) as Partial<StaticAuthStore>;
    } catch {
      parsed = null;
    }
  }

  const store: StaticAuthStore = {
    users: parsed?.users && typeof parsed.users === 'object' ? { ...parsed.users } : {},
    loginLogs: Array.isArray(parsed?.loginLogs) ? [...parsed.loginLogs] : [],
    adminSettings: {
      displayName: parsed?.adminSettings?.displayName || 'Dr. Chef Supritam Basu',
      notificationEmail: parsed?.adminSettings?.notificationEmail || FACULTY_ADMIN_EMAIL,
      passwordHash: parsed?.adminSettings?.passwordHash || DEFAULT_ADMIN_PW_HASH,
      recoveryKey: parsed?.adminSettings?.recoveryKey || DEFAULT_ADMIN_RECOVERY_KEY,
      resetCode: parsed?.adminSettings?.resetCode,
      resetExpiresAt: parsed?.adminSettings?.resetExpiresAt,
    },
  };

  if (!store.users[PERMANENT_ADMIN_EMAIL]) {
    store.users[PERMANENT_ADMIN_EMAIL] = {
      email: PERMANENT_ADMIN_EMAIL,
      name: 'Supritamone Master Admin',
      role: 'admin',
      planId: 'admin',
      planTitle: 'Permanent Executive Admin Access',
      paymentStatus: 'admin',
      amountPaid: 0,
      currency: 'USD',
      workPlace: 'Supritamone Academy HQ',
      designation: 'Master Administrator',
      status: 'active',
      restrictedByAdmin: false,
      expiresAt: null,
      source: 'admin_root',
      lastLoginAt: now,
      loginCount: 1,
      lastIp: 'Browser',
      deviceInfo: 'Web Browser',
      createdAt: now,
      updatedAt: now,
    };
  }

  // Enforce automatic post-trial lockout for expired trials
  let modified = false;
  for (const [key, u] of Object.entries(store.users)) {
    if (
      u.email !== PERMANENT_ADMIN_EMAIL &&
      u.role !== 'admin' &&
      u.planId === 'trial' &&
      u.expiresAt &&
      now > u.expiresAt &&
      u.status !== 'restricted'
    ) {
      store.users[key] = {
        ...u,
        status: 'restricted',
        paymentStatus: 'unpaid',
        restrictedReason: u.restrictedReason || '3-Day Free Trial Ended — Auto-Restricted',
        updatedAt: now,
      };
      modified = true;
    }
  }

  if (modified || !parsed) {
    saveStore(store);
  }
  return store;
}

function saveStore(store: StaticAuthStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota errors
  }
}

function recordAudit(store: StaticAuthStore, entry: Omit<LoginAuditEntry, 'id' | 'timestamp'>): void {
  store.loginLogs = [
    {
      ...entry,
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    },
    ...(store.loginLogs || []),
  ].slice(0, 300);
}

function isUserBlocked(
  record: StoredAuthUser | undefined,
  now: number
): { blocked: boolean; code: 'restricted' | 'expired' | null; message: string } {
  if (!record) {
    return { blocked: true, code: 'restricted', message: 'Account not found or removed.' };
  }
  if (record.email.toLowerCase() === PERMANENT_ADMIN_EMAIL || record.role === 'admin') {
    return { blocked: false, code: null, message: '' };
  }
  if (record.status === 'restricted' || record.restrictedByAdmin) {
    return {
      blocked: true,
      code: 'restricted',
      message:
        record.restrictedReason ||
        'Your access has been restricted after trial expiration or by the Administrator. Please upgrade to a paid plan to restore access.',
    };
  }
  if (record.status === 'pending_approval') {
    return {
      blocked: true,
      code: 'restricted',
      message: 'Your payment verification is pending Administrator approval.',
    };
  }
  if (record.status === 'expired' || (record.expiresAt && now > record.expiresAt)) {
    return {
      blocked: true,
      code: 'expired',
      message: 'Your 3-Day Free Trial or subscription period has ended. Choose a paid plan below to unlock full access.',
    };
  }
  return { blocked: false, code: null, message: '' };
}

function getHeader(headers: HeadersInit | undefined, name: string): string {
  if (!headers) return '';
  const h = new Headers(headers);
  return h.get(name) || '';
}

function parseBody(body: BodyInit | null | undefined): Record<string, unknown> {
  if (typeof body !== 'string' || !body.trim()) return {};
  try {
    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function jsonResult(status: number, data: Record<string, unknown>) {
  const err = typeof data.error === 'string' ? data.error : null;
  return {
    ok: status >= 200 && status < 300,
    status,
    data,
    errorMessage: err,
    isNetworkError: false,
  };
}

export async function handleStaticAuthFallback(
  url: string,
  init: RequestInit
): Promise<{
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
  errorMessage: string | null;
  isNetworkError: boolean;
} | null> {
  if (!url.startsWith('/api/auth/') && !url.startsWith('/api/admin/')) {
    return null;
  }

  const pathname = url.split('?')[0];
  const body = parseBody(init.body);
  const store = loadStore();
  const now = Date.now();
  const authHeader = getHeader(init.headers, 'Authorization');
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const adminTokenHeader = getHeader(init.headers, 'X-Admin-Token').trim() || bearerToken;

  // ==================== MEMBER AUTH FALLBACK ====================
  if (pathname === '/api/auth/session') {
    const decoded = decodeToken(bearerToken);
    if (!decoded || typeof decoded.email !== 'string') {
      return jsonResult(200, { authenticated: false });
    }
    const cleanEmail = decoded.email.toLowerCase();
    if (cleanEmail !== PERMANENT_ADMIN_EMAIL) {
      const check = isUserBlocked(store.users[cleanEmail], now);
      if (check.blocked) {
        return jsonResult(200, {
          authenticated: false,
          restricted: check.code === 'restricted',
          expired: check.code === 'expired',
          error: check.message,
        });
      }
    }
    return jsonResult(200, { authenticated: true, user: decoded, token: bearerToken });
  }

  if (pathname === '/api/auth/logout') {
    return jsonResult(200, { authenticated: false, loggedOut: true });
  }

  if (pathname === '/api/auth/login') {
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const cleanPassword = String(body.password || '');
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return jsonResult(400, { error: 'Please enter a valid email address.' });
    }

    if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
      const ok = await verifySecret(cleanPassword, store.adminSettings.passwordHash);
      if (!ok) {
        return jsonResult(401, {
          error: 'Incorrect password for supritamone@gmail.com. Use Forgot Password or enter your Admin password.',
        });
      }
      const adminUser = store.users[PERMANENT_ADMIN_EMAIL];
      adminUser.lastLoginAt = now;
      adminUser.loginCount = (adminUser.loginCount || 0) + 1;
      adminUser.updatedAt = now;
      recordAudit(store, {
        email: PERMANENT_ADMIN_EMAIL,
        name: adminUser.name,
        action: 'login',
        status: 'success',
        detail: 'Permanent Master Admin signed in',
        planId: 'admin',
        paymentStatus: 'admin',
        ip: 'Browser',
        device: 'Web Browser',
      });
      saveStore(store);

      const sessionPayload = {
        email: PERMANENT_ADMIN_EMAIL,
        name: adminUser.name,
        role: 'admin',
        planId: 'admin',
        planTitle: 'Permanent Executive Admin Access',
        expiresAt: null,
        source: 'permanent_admin',
      };
      return jsonResult(200, {
        authenticated: true,
        user: sessionPayload,
        token: encodeToken(sessionPayload),
      });
    }

    const record = store.users[cleanEmail];
    if (!record) {
      return jsonResult(401, {
        error:
          'No active membership found for this email. Click "Start 3-Day Free Trial" below to create your account and unlock access immediately.',
      });
    }

    if (record.passwordHash) {
      const ok = await verifySecret(cleanPassword, record.passwordHash);
      if (!ok) {
        return jsonResult(401, { error: 'Incorrect password for this account. Please check your password and retry.' });
      }
    } else if (cleanPassword.length < 4) {
      return jsonResult(401, { error: 'Enter your password (min 4 characters).' });
    }

    const blockCheck = isUserBlocked(record, now);
    if (blockCheck.blocked) {
      return jsonResult(403, {
        restricted: blockCheck.code === 'restricted',
        expired: blockCheck.code === 'expired',
        error: blockCheck.message,
      });
    }

    record.lastLoginAt = now;
    record.loginCount = (record.loginCount || 0) + 1;
    record.updatedAt = now;
    recordAudit(store, {
      email: record.email,
      name: record.name,
      action: 'login',
      status: 'success',
      detail: `Member login (${record.planTitle})`,
      planId: record.planId,
      paymentStatus: record.paymentStatus,
      ip: 'Browser',
      device: 'Web Browser',
    });
    saveStore(store);

    const sessionPayload = {
      email: record.email,
      name: record.name,
      role: record.role,
      planId: record.planId,
      planTitle: record.planTitle,
      expiresAt: record.role === 'admin' ? null : record.expiresAt,
      source: record.source || 'login_credentials',
    };
    return jsonResult(200, {
      authenticated: true,
      user: sessionPayload,
      token: encodeToken(sessionPayload),
    });
  }

  if (pathname === '/api/auth/activate-plan') {
    const cleanPlan = String(body.planId || 'trial').trim().toLowerCase() as
      | 'trial'
      | 'individual'
      | 'team'
      | 'training';
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const cleanPassword = String(body.password || '');
    const cleanName = String(body.name || '').trim() || deriveDisplayName(cleanEmail || 'chef');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return jsonResult(400, { error: 'A valid email address is required.' });
    }
    if (!['trial', 'individual', 'team', 'training'].includes(cleanPlan)) {
      return jsonResult(400, { error: 'Invalid subscription plan selected.' });
    }
    if (cleanEmail !== PERMANENT_ADMIN_EMAIL && cleanPassword.length < 4) {
      return jsonResult(400, { error: 'Please create a password (at least 4 characters) for future sign-ins.' });
    }

    if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
      const ok = await verifySecret(cleanPassword, store.adminSettings.passwordHash);
      if (!ok) {
        return jsonResult(401, {
          error: 'supritamone@gmail.com is the Master Admin account. Please sign in with your Admin password.',
        });
      }
      const adminPayload = {
        email: PERMANENT_ADMIN_EMAIL,
        name: cleanName || 'Supritamone Master Admin',
        role: 'admin',
        planId: 'admin',
        planTitle: 'Permanent Executive Admin Access',
        expiresAt: null,
        source: 'permanent_admin',
      };
      return jsonResult(200, {
        authenticated: true,
        user: adminPayload,
        token: encodeToken(adminPayload),
      });
    }

    const existing = store.users[cleanEmail];
    if (
      cleanPlan === 'trial' &&
      existing &&
      existing.planId === 'trial' &&
      (existing.status === 'expired' || existing.status === 'restricted' || existing.restrictedByAdmin)
    ) {
      return jsonResult(403, {
        expired: true,
        error: 'A 3-Day Free Trial was already used for this email and has ended. Please select Individual, Team, or Executive Advisory.',
      });
    }

    const seatsCount = Math.max(5, Number(body.chefSeats) || 5);
    const PLAN_META: Record<'trial' | 'individual' | 'team' | 'training', { title: string; durationMs: number; amount: number }> = {
      trial: { title: '3-Day Free Trial ($0 / 72h)', durationMs: 3 * DAY_MS, amount: 0 },
      individual: { title: 'Individual Annual Plan ($99/yr)', durationMs: 365 * DAY_MS, amount: 99 },
      team: {
        title: `Team Brigade Plan (${seatsCount} Chefs · $79/chef/yr)`,
        durationMs: 365 * DAY_MS,
        amount: seatsCount * 79,
      },
      training: { title: 'EXECUTIVE ADVISORY · Training ($1499/5 chefs/yr)', durationMs: 365 * DAY_MS, amount: 1499 },
    };

    const meta = PLAN_META[cleanPlan];
    const expiresAt = now + meta.durationMs;
    const paymentStatus: UserPaymentStatus = cleanPlan === 'trial' ? 'trial' : 'paid';
    const ref =
      String(body.transactionRef || '').trim() ||
      (cleanPlan === 'trial' ? `TRIAL-${now.toString(36).toUpperCase()}` : `ZN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`);

    const updatedRecord: StoredAuthUser = {
      email: cleanEmail,
      name: cleanName,
      passwordHash: await hashSecret(cleanPassword),
      role: 'member',
      planId: cleanPlan,
      planTitle: meta.title,
      paymentStatus,
      amountPaid: meta.amount,
      currency: 'USD',
      workPlace: String(body.workPlace || existing?.workPlace || '').trim(),
      designation: String(body.designation || existing?.designation || '').trim(),
      chefSeats: cleanPlan === 'team' ? seatsCount : cleanPlan === 'training' ? 5 : undefined,
      status: 'active',
      restrictedByAdmin: false,
      expiresAt,
      transactionRef: ref,
      source: 'direct_plan_enrollment',
      lastLoginAt: now,
      loginCount: (existing?.loginCount || 0) + 1,
      lastIp: 'Browser',
      deviceInfo: 'Web Browser',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    store.users[cleanEmail] = updatedRecord;
    recordAudit(store, {
      email: cleanEmail,
      name: cleanName,
      action: cleanPlan === 'trial' ? 'trial_started' : 'plan_activation',
      status: 'success',
      detail: `${meta.title} activated (${ref})`,
      planId: cleanPlan,
      paymentStatus,
      ip: 'Browser',
      device: 'Web Browser',
    });
    saveStore(store);

    const sessionPayload = {
      email: updatedRecord.email,
      name: updatedRecord.name,
      role: 'member',
      planId: updatedRecord.planId,
      planTitle: updatedRecord.planTitle,
      expiresAt: updatedRecord.expiresAt,
      source: updatedRecord.source || 'direct_plan_enrollment',
    };
    return jsonResult(200, {
      authenticated: true,
      user: sessionPayload,
      token: encodeToken(sessionPayload),
    });
  }

  if (pathname === '/api/auth/reset-password') {
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const cleanName = String(body.fullName || body.verificationValue || '').trim().toLowerCase();
    const cleanNewPw = String(body.newPassword || '');
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return jsonResult(400, { error: 'Please enter your registered email address.' });
    }
    if (cleanNewPw.length < 4) {
      return jsonResult(400, { error: 'New password must be at least 4 characters.' });
    }
    const record = store.users[cleanEmail];
    if (!record) {
      return jsonResult(404, { error: 'No account found for that email address.' });
    }
    const blockCheck = isUserBlocked(record, now);
    if (blockCheck.blocked) {
      return jsonResult(403, { error: blockCheck.message });
    }
    const matchesName = cleanName && record.name.trim().toLowerCase() === cleanName;
    const matchesRef = Boolean(record.transactionRef && cleanName === record.transactionRef.trim().toLowerCase());
    if (!matchesName && !matchesRef) {
      return jsonResult(403, {
        error: 'Verification failed. Enter the exact Full Name or Order/Trial Reference ID registered on this account.',
      });
    }
    record.passwordHash = await hashSecret(cleanNewPw);
    record.updatedAt = now;
    saveStore(store);
    return jsonResult(200, { ok: true, message: 'Password updated! You can now sign in with your new password.' });
  }

  if (pathname === '/api/auth/verify-redirect') {
    const cleanEmail = String(body.email || '').trim().toLowerCase() || 'member@zerowaste.supritamone.com';
    const existing = store.users[cleanEmail];
    if (existing && cleanEmail !== PERMANENT_ADMIN_EMAIL) {
      const check = isUserBlocked(existing, now);
      if (check.blocked) {
        return jsonResult(403, {
          authenticated: false,
          restricted: check.code === 'restricted',
          expired: check.code === 'expired',
          error: check.message,
        });
      }
    }
    const isAdmin = cleanEmail === PERMANENT_ADMIN_EMAIL;
    const resolvedName = String(body.name || '').trim() || existing?.name || deriveDisplayName(cleanEmail);
    const sessionPayload = {
      email: cleanEmail,
      name: resolvedName,
      role: isAdmin ? 'admin' : 'member',
      planId: isAdmin ? 'admin' : existing?.planId || 'partner_member',
      planTitle: isAdmin ? 'Permanent Executive Admin Access' : existing?.planTitle || 'Verified Member',
      expiresAt: isAdmin ? null : existing?.expiresAt ?? now + 30 * DAY_MS,
      source: 'redirect_zerowaste.supritamone.com',
    };
    return jsonResult(200, {
      authenticated: true,
      user: sessionPayload,
      token: encodeToken(sessionPayload),
    });
  }

  // ==================== ADMIN PORTAL FALLBACK ====================
  const decodedAdmin = decodeToken(adminTokenHeader);
  const isAdminAuthed = Boolean(decodedAdmin && decodedAdmin.scope === 'supritamone_admin');

  if (pathname === '/api/admin/session') {
    if (!isAdminAuthed || !decodedAdmin) {
      return jsonResult(200, { authenticated: false });
    }
    return jsonResult(200, {
      authenticated: true,
      admin: {
        username: decodedAdmin.username,
        displayName: decodedAdmin.displayName,
        notificationEmail: decodedAdmin.notificationEmail,
      },
    });
  }

  if (pathname === '/api/admin/logout') {
    return jsonResult(200, { authenticated: false, loggedOut: true });
  }

  if (pathname === '/api/admin/login') {
    const cleanUser = String(body.username || '').trim().toLowerCase();
    const cleanPassword = String(body.password || '');
    if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
      return jsonResult(401, { error: `Invalid admin username. Sign in using ${PERMANENT_ADMIN_EMAIL}.` });
    }
    const ok = await verifySecret(cleanPassword, store.adminSettings.passwordHash);
    if (!ok) {
      return jsonResult(401, { error: 'Invalid administrator password. Click "Forgot Password?" to reset it.' });
    }
    const adminPayload = {
      username: PERMANENT_ADMIN_EMAIL,
      displayName: store.adminSettings.displayName,
      notificationEmail: store.adminSettings.notificationEmail,
      scope: 'supritamone_admin',
      expiresAt: now + 7 * DAY_MS,
    };
    recordAudit(store, {
      email: cleanUser,
      name: adminPayload.displayName,
      action: 'admin_action',
      status: 'success',
      detail: 'Signed into Zero Waste Administrator Portal',
      ip: 'Browser',
      device: 'Web Browser',
    });
    saveStore(store);
    return jsonResult(200, {
      authenticated: true,
      admin: {
        username: adminPayload.username,
        displayName: adminPayload.displayName,
        notificationEmail: adminPayload.notificationEmail,
      },
      token: encodeToken(adminPayload),
    });
  }

  if (pathname === '/api/admin/forgot-password') {
    const cleanUser = String(body.username || body.email || '').trim().toLowerCase();
    const cleanVerify = String(body.verificationAnswer || body.verificationValue || '').trim().toLowerCase();
    if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
      return jsonResult(404, { error: `Admin password reset is only available for ${PERMANENT_ADMIN_EMAIL}.` });
    }
    const valid = [
      store.adminSettings.notificationEmail.toLowerCase(),
      FACULTY_ADMIN_EMAIL.toLowerCase(),
      store.adminSettings.recoveryKey.toLowerCase(),
      '791463',
    ];
    if (!cleanVerify || !valid.includes(cleanVerify)) {
      return jsonResult(403, {
        error:
          'Identity verification failed. Enter your Backup Notification Email (e.g. supritam.basu@supritamone.com), Recovery Key, or CPD Provider ID.',
      });
    }
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    store.adminSettings.resetCode = resetCode;
    store.adminSettings.resetExpiresAt = now + 15 * 60 * 1000;
    saveStore(store);
    return jsonResult(200, { ok: true, verified: true, resetCode, expiresInMinutes: 15 });
  }

  if (pathname === '/api/admin/reset-password') {
    const cleanUser = String(body.username || body.email || '').trim().toLowerCase();
    const cleanCode = String(body.resetCode || '').trim();
    const cleanNewPw = String(body.newPassword || '');
    if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
      return jsonResult(400, { error: `Invalid admin username. Expected ${PERMANENT_ADMIN_EMAIL}.` });
    }
    if (cleanNewPw.length < 6) {
      return jsonResult(400, { error: 'New admin password must be at least 6 characters.' });
    }
    if (
      !store.adminSettings.resetCode ||
      !store.adminSettings.resetExpiresAt ||
      now > store.adminSettings.resetExpiresAt ||
      cleanCode !== store.adminSettings.resetCode
    ) {
      return jsonResult(403, { error: 'Invalid or expired password reset verification code.' });
    }
    store.adminSettings.passwordHash = await hashSecret(cleanNewPw);
    delete store.adminSettings.resetCode;
    delete store.adminSettings.resetExpiresAt;
    saveStore(store);
    return jsonResult(200, { ok: true, message: 'Admin password updated.' });
  }

  if (!isAdminAuthed) {
    return jsonResult(401, { authenticated: false, error: 'Administrator authentication required.' });
  }

  if (pathname === '/api/admin/overview') {
    const allUsers = Object.values(store.users).map((u) => {
      const isPermanentAdmin = u.email.toLowerCase() === PERMANENT_ADMIN_EMAIL;
      const msSinceCreated = Math.max(0, now - (u.createdAt || now));
      const msRemaining = u.expiresAt ? u.expiresAt - now : null;
      return {
        ...u,
        daysRunning: Math.max(1, Math.ceil(msSinceCreated / DAY_MS)),
        daysLeft: msRemaining !== null ? Math.ceil(msRemaining / DAY_MS) : null,
        hoursLeft: msRemaining !== null ? Math.max(0, Math.ceil(msRemaining / (60 * 60 * 1000))) : null,
        trialExpired: Boolean(u.planId === 'trial' && u.expiresAt && now > u.expiresAt),
        isPermanentAdmin,
      };
    });
    allUsers.sort((a, b) => (b.lastLoginAt || b.updatedAt || 0) - (a.lastLoginAt || a.updatedAt || 0));
    const nonAdmin = allUsers.filter((u) => u.role !== 'admin');
    return jsonResult(200, {
      stats: {
        totalUsers: allUsers.length,
        memberCount: nonAdmin.length,
        paidUsers: nonAdmin.filter((u) => u.paymentStatus === 'paid').length,
        unpaidUsers: nonAdmin.filter((u) => u.paymentStatus === 'unpaid' || u.paymentStatus === 'pending_approval').length,
        activeTrials: nonAdmin.filter((u) => u.planId === 'trial' && u.status === 'active' && !u.trialExpired).length,
        restrictedOrExpired: nonAdmin.filter((u) => u.status === 'restricted' || u.status === 'expired' || u.trialExpired).length,
        pendingApproval: nonAdmin.filter((u) => u.status === 'pending_approval' || u.paymentStatus === 'pending_approval').length,
        totalRevenueUsd: nonAdmin.reduce((s, u) => (u.paymentStatus === 'paid' ? s + (u.amountPaid || 0) : s), 0),
        totalLogins: allUsers.reduce((s, u) => s + (u.loginCount || 0), 0),
      },
      users: allUsers,
      loginLogs: store.loginLogs || [],
      adminProfile: {
        displayName: store.adminSettings.displayName,
        notificationEmail: store.adminSettings.notificationEmail,
        recoveryKey: store.adminSettings.recoveryKey,
      },
    });
  }

  if (pathname === '/api/admin/users/create') {
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return jsonResult(400, { error: 'Valid subscriber email is required.' });
    }
    const cleanPlan = (String(body.planId || 'individual') as StoredAuthUser['planId']);
    const cleanPay = (String(body.paymentStatus || 'paid') as UserPaymentStatus);
    const created: StoredAuthUser = {
      email: cleanEmail,
      name: String(body.name || '').trim() || deriveDisplayName(cleanEmail),
      passwordHash: body.password ? await hashSecret(String(body.password)) : undefined,
      role: 'member',
      planId: cleanPlan,
      planTitle: cleanPlan === 'trial' ? '3-Day Free Trial ($0 / 72h)' : 'Verified Member Plan',
      paymentStatus: cleanPay,
      amountPaid: cleanPlan === 'trial' ? 0 : 99,
      currency: 'USD',
      workPlace: String(body.workPlace || '').trim(),
      designation: String(body.designation || '').trim(),
      status: 'active',
      restrictedByAdmin: false,
      expiresAt: now + (cleanPlan === 'trial' ? 3 * DAY_MS : 365 * DAY_MS),
      createdAt: now,
      updatedAt: now,
      loginCount: 0,
    };
    store.users[cleanEmail] = created;
    saveStore(store);
    return jsonResult(200, { ok: true, user: created });
  }

  if (pathname === '/api/admin/users/action') {
    const cleanEmail = String(body.email || '').trim().toLowerCase();
    const action = String(body.action || '');
    if (!cleanEmail || cleanEmail === PERMANENT_ADMIN_EMAIL || !store.users[cleanEmail]) {
      return jsonResult(400, { error: 'Subscriber not found or protected.' });
    }
    const u = store.users[cleanEmail];
    if (action === 'delete') {
      delete store.users[cleanEmail];
    } else if (action === 'approve_paid') {
      u.paymentStatus = 'paid';
      u.status = 'active';
      u.restrictedByAdmin = false;
      u.expiresAt = now + 365 * DAY_MS;
    } else if (action === 'mark_unpaid') {
      u.paymentStatus = 'unpaid';
    } else if (action === 'restrict') {
      u.status = 'restricted';
      u.restrictedByAdmin = true;
    } else if (action === 'expire_trial') {
      u.status = 'restricted';
      u.paymentStatus = 'unpaid';
      u.expiresAt = now - 1000;
    } else if (action === 'extend_trial') {
      u.status = 'active';
      u.restrictedByAdmin = false;
      u.expiresAt = now + 3 * DAY_MS;
    } else if (action === 'unrestrict') {
      u.status = 'active';
      u.restrictedByAdmin = false;
      if (u.expiresAt && u.expiresAt < now) u.expiresAt = now + 30 * DAY_MS;
    }
    u.updatedAt = now;
    saveStore(store);
    return jsonResult(200, { ok: true });
  }

  if (pathname === '/api/admin/users/bulk-delete') {
    let deletedCount = 0;
    if (body.deleteAll) {
      for (const k of Object.keys(store.users)) {
        if (k !== PERMANENT_ADMIN_EMAIL) {
          delete store.users[k];
          deletedCount++;
        }
      }
    } else if (Array.isArray(body.emails)) {
      for (const rawEmail of body.emails) {
        const k = String(rawEmail || '').trim().toLowerCase();
        if (k && k !== PERMANENT_ADMIN_EMAIL && store.users[k]) {
          delete store.users[k];
          deletedCount++;
        }
      }
    }
    saveStore(store);
    return jsonResult(200, { ok: true, deletedCount });
  }

  if (pathname === '/api/admin/enforce-expired-trials') {
    return jsonResult(200, { ok: true, restrictedCount: 0 });
  }

  if (pathname === '/api/admin/profile') {
    if (body.regenerateRecoveryKey) {
      store.adminSettings.recoveryKey = `ZW-MASTER-${Math.floor(100000 + Math.random() * 900000)}`;
    }
    if (typeof body.displayName === 'string' && body.displayName.trim()) {
      store.adminSettings.displayName = body.displayName.trim();
    }
    if (typeof body.notificationEmail === 'string' && body.notificationEmail.trim()) {
      store.adminSettings.notificationEmail = body.notificationEmail.trim();
    }
    if (typeof body.newPassword === 'string' && body.newPassword.trim()) {
      store.adminSettings.passwordHash = await hashSecret(body.newPassword.trim());
    }
    saveStore(store);
    return jsonResult(200, { ok: true, adminProfile: store.adminSettings });
  }

  return null;
}
