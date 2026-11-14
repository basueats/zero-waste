import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TTS_DISK_CACHE_DIR = path.join(__dirname, '.tts-cache');
try {
  fs.mkdirSync(TTS_DISK_CACHE_DIR, { recursive: true });
} catch {
  // Ignore if read-only; memory cache still works
}

const AUTH_STORE_PATH = path.join(__dirname, '.supritamone-auth.json');
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto.createHash('sha256').update(`supritamone-academy-${process.env.GEMINI_API_KEY || 'local-dev'}`).digest('hex');

const PERMANENT_ADMIN_EMAIL = 'supritamone@gmail.com';
const FACULTY_ADMIN_EMAIL = 'supritam.basu@supritamone.com';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Babaisona2029@';
const DEFAULT_ADMIN_RECOVERY_KEY = process.env.ADMIN_RECOVERY_KEY || 'ZW-MASTER-791463';
const SESSION_COOKIE_NAME = 'supritamone_academy_session';
const ADMIN_COOKIE_NAME = 'supritamone_admin_session';

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

interface AdminSettings {
  displayName: string;
  notificationEmail: string;
  passwordHash?: string;
  recoveryKey?: string;
  resetTokenHash?: string;
  resetTokenExpiresAt?: number;
}

interface AuthStoreData {
  users: Record<string, StoredAuthUser>;
  loginLogs: LoginAuditEntry[];
  adminSettings: AdminSettings;
}

const nowInit = Date.now();
const DAY_MS = 24 * 60 * 60 * 1000;

const SEED_PARTNER_USERS: Array<StoredAuthUser> = [
  {
    email: 'supritamone@gmail.com',
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
    lastLoginAt: nowInit,
    loginCount: 1,
    lastIp: '127.0.0.1',
    deviceInfo: 'Web Browser',
    createdAt: nowInit,
    updatedAt: nowInit,
  },
];

const DEFAULT_LOGIN_LOGS: LoginAuditEntry[] = [
  {
    id: 'log-seed-1',
    email: 'supritamone@gmail.com',
    name: 'Supritamone Master Admin',
    action: 'login',
    status: 'success',
    detail: 'Permanent Executive Admin initialized',
    planId: 'admin',
    paymentStatus: 'admin',
    ip: '127.0.0.1',
    device: 'Web Browser',
    timestamp: nowInit,
  },
];

function inferPaymentAndAmount(u: Partial<StoredAuthUser>): { paymentStatus: UserPaymentStatus; amountPaid: number } {
  if (u.email === PERMANENT_ADMIN_EMAIL || u.role === 'admin' || u.planId === 'admin') {
    return { paymentStatus: 'admin', amountPaid: 0 };
  }
  if (u.paymentStatus) {
    return { paymentStatus: u.paymentStatus, amountPaid: Number(u.amountPaid || 0) };
  }
  if (u.status === 'expired' || u.status === 'restricted') {
    return { paymentStatus: 'unpaid', amountPaid: 0 };
  }
  if (u.planId === 'trial') {
    return { paymentStatus: 'trial', amountPaid: 0 };
  }
  if (u.planId === 'individual') {
    return { paymentStatus: u.transactionRef ? 'paid' : 'unpaid', amountPaid: u.transactionRef ? 99 : 0 };
  }
  if (u.planId === 'team') {
    const amt = Math.max(5, Number(u.chefSeats || 5)) * 79;
    return { paymentStatus: u.transactionRef ? 'paid' : 'unpaid', amountPaid: u.transactionRef ? amt : 0 };
  }
  if (u.planId === 'training') {
    return { paymentStatus: u.transactionRef ? 'paid' : 'unpaid', amountPaid: u.transactionRef ? 1499 : 0 };
  }
  return { paymentStatus: u.transactionRef ? 'paid' : 'trial', amountPaid: Number(u.amountPaid || 0) };
}

function hydrateUserRecord(raw: Partial<StoredAuthUser>, emailKey: string, now: number): { user: StoredAuthUser; changed: boolean } {
  let changed = false;
  const { paymentStatus: inferredPay, amountPaid: inferredAmt } = inferPaymentAndAmount({ ...raw, email: emailKey });
  const user: StoredAuthUser = {
    email: emailKey,
    name: raw.name || deriveDisplayName(emailKey),
    passwordHash: raw.passwordHash,
    role: emailKey === PERMANENT_ADMIN_EMAIL ? 'admin' : raw.role || 'member',
    planId: emailKey === PERMANENT_ADMIN_EMAIL ? 'admin' : (raw.planId as StoredAuthUser['planId']) || 'trial',
    planTitle:
      emailKey === PERMANENT_ADMIN_EMAIL
        ? 'Permanent Executive Admin Access'
        : raw.planTitle || 'Verified Member',
    paymentStatus: inferredPay,
    amountPaid: raw.amountPaid !== undefined ? Number(raw.amountPaid) : inferredAmt,
    currency: raw.currency || 'USD',
    workPlace: raw.workPlace || '',
    designation: raw.designation || '',
    chefSeats: raw.chefSeats,
    status: emailKey === PERMANENT_ADMIN_EMAIL ? 'active' : raw.status || 'active',
    restrictedByAdmin: emailKey === PERMANENT_ADMIN_EMAIL ? false : Boolean(raw.restrictedByAdmin),
    restrictedReason: emailKey === PERMANENT_ADMIN_EMAIL ? undefined : raw.restrictedReason,
    expiresAt: emailKey === PERMANENT_ADMIN_EMAIL ? null : raw.expiresAt ?? null,
    transactionRef: raw.transactionRef,
    source: raw.source || 'zerowaste.supritamone.com',
    lastLoginAt: raw.lastLoginAt ?? raw.updatedAt ?? raw.createdAt ?? null,
    loginCount: raw.loginCount ?? 1,
    lastIp: raw.lastIp || '127.0.0.1',
    deviceInfo: raw.deviceInfo || 'Web Browser',
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };

  if (!raw.paymentStatus || raw.currency === undefined || raw.loginCount === undefined) {
    changed = true;
  }

  // Enforce automatic post-trial lockout when 3-day free trial expires
  if (
    user.email !== PERMANENT_ADMIN_EMAIL &&
    user.role !== 'admin' &&
    user.planId === 'trial' &&
    user.expiresAt &&
    now > user.expiresAt &&
    user.status !== 'restricted'
  ) {
    user.status = 'restricted';
    user.paymentStatus = 'unpaid';
    user.restrictedReason = user.restrictedReason || '3-Day Free Trial Ended — Auto-Restricted';
    user.updatedAt = now;
    changed = true;
  }

  // Guarantee supritamone@gmail.com always remains unrestricted active admin
  if (emailKey === PERMANENT_ADMIN_EMAIL) {
    user.role = 'admin';
    user.planId = 'admin';
    user.planTitle = 'Permanent Executive Admin Access';
    user.paymentStatus = 'admin';
    user.status = 'active';
    user.restrictedByAdmin = false;
    user.restrictedReason = undefined;
    user.expiresAt = null;
  }

  return { user, changed };
}

function deriveDisplayName(email: string): string {
  return (email.split('@')[0] || 'Zero Waste Chef')
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function loadAuthStore(): AuthStoreData {
  let data: AuthStoreData = {
    users: {},
    loginLogs: [...DEFAULT_LOGIN_LOGS],
    adminSettings: {
      displayName: 'Dr. Chef Supritam Basu',
      notificationEmail: FACULTY_ADMIN_EMAIL,
    },
  };
  try {
    if (fs.existsSync(AUTH_STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(AUTH_STORE_PATH, 'utf-8'));
      if (parsed && typeof parsed === 'object') {
        if (parsed.users && typeof parsed.users === 'object') {
          data.users = parsed.users;
        }
        if (Array.isArray(parsed.loginLogs)) {
          data.loginLogs = parsed.loginLogs;
        }
        if (parsed.adminSettings && typeof parsed.adminSettings === 'object') {
          data.adminSettings = {
            displayName: parsed.adminSettings.displayName || 'Dr. Chef Supritam Basu',
            notificationEmail: parsed.adminSettings.notificationEmail || FACULTY_ADMIN_EMAIL,
            passwordHash: parsed.adminSettings.passwordHash,
            recoveryKey: parsed.adminSettings.recoveryKey,
            resetTokenHash: parsed.adminSettings.resetTokenHash,
            resetTokenExpiresAt: parsed.adminSettings.resetTokenExpiresAt,
          };
        }
      }
    }
  } catch {
    // Initialize fresh store
  }

  const now = Date.now();
  let modified = false;

  if (!data.adminSettings.passwordHash) {
    data.adminSettings.passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD);
    modified = true;
  }
  if (!data.adminSettings.recoveryKey) {
    data.adminSettings.recoveryKey = DEFAULT_ADMIN_RECOVERY_KEY;
    modified = true;
  }

  for (const seed of SEED_PARTNER_USERS) {
    const key = seed.email.toLowerCase();
    if (!data.users[key]) {
      data.users[key] = { ...seed, email: key };
      modified = true;
    }
  }

  for (const [key, rawUser] of Object.entries(data.users)) {
    const lowerKey = key.toLowerCase();
    const { user, changed } = hydrateUserRecord(rawUser, lowerKey, now);
    data.users[lowerKey] = user;
    if (lowerKey !== key) {
      delete data.users[key];
      modified = true;
    }
    if (changed) {
      modified = true;
    }
  }

  if (modified) {
    saveAuthStore(data);
  }
  return data;
}

function saveAuthStore(data: AuthStoreData): void {
  try {
    fs.writeFileSync(AUTH_STORE_PATH, JSON.stringify(data, null, 2));
  } catch {
    // Ignore disk errors in read-only environments
  }
}

function getClientIp(req: express.Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
}

function getDeviceSummary(req: express.Request): string {
  const ua = String(req.headers['user-agent'] || '');
  if (!ua) return 'Unknown Client';
  if (/curl/i.test(ua)) return 'CLI / cURL';
  const browser = /Edg\//i.test(ua)
    ? 'Edge'
    : /Chrome\//i.test(ua)
      ? 'Chrome'
      : /Firefox\//i.test(ua)
        ? 'Firefox'
        : /Safari\//i.test(ua)
          ? 'Safari'
          : 'Browser';
  const os = /iPhone|iPad/i.test(ua)
    ? 'iOS'
    : /Android/i.test(ua)
      ? 'Android'
      : /Mac OS X/i.test(ua)
        ? 'macOS'
        : /Windows/i.test(ua)
          ? 'Windows'
          : /Linux/i.test(ua)
            ? 'Linux'
            : 'Device';
  return `${browser} · ${os}`;
}

function recordLoginAudit(
  store: AuthStoreData,
  entry: Omit<LoginAuditEntry, 'id' | 'timestamp'>
): void {
  const item: LoginAuditEntry = {
    ...entry,
    id: `log-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: Date.now(),
  };
  store.loginLogs = [item, ...(store.loginLogs || [])].slice(0, 400);
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

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(originalHex, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

function signSessionToken(payload: {
  email: string;
  name: string;
  role: 'admin' | 'member';
  planId: string;
  planTitle: string;
  expiresAt: number | null;
  source: string;
}): string {
  const fullPayload = { ...payload, issuedAt: Date.now() };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySessionToken(token: string): {
  email: string;
  name: string;
  role: 'admin' | 'member';
  planId: string;
  planTitle: string;
  expiresAt: number | null;
  source: string;
} | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (!decoded || !decoded.email) return null;
    if (decoded.email.toLowerCase() === PERMANENT_ADMIN_EMAIL) {
      return {
        ...decoded,
        role: 'admin',
        planId: 'admin',
        planTitle: 'Permanent Executive Admin Access',
        expiresAt: null,
      };
    }
    if (decoded.expiresAt && Date.now() > Number(decoded.expiresAt)) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

function signAdminToken(payload: {
  username: string;
  displayName: string;
  notificationEmail: string;
}): string {
  const fullPayload = {
    ...payload,
    scope: 'supritamone_admin',
    expiresAt: Date.now() + 7 * DAY_MS,
  };
  const encoded = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string): {
  username: string;
  displayName: string;
  notificationEmail: string;
} | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(encoded).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8'));
    if (!decoded || decoded.scope !== 'supritamone_admin') return null;
    if (decoded.expiresAt && Date.now() > Number(decoded.expiresAt)) return null;
    return {
      username: decoded.username,
      displayName: decoded.displayName,
      notificationEmail: decoded.notificationEmail,
    };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) {
      try {
        out[key] = decodeURIComponent(val);
      } catch {
        out[key] = val;
      }
    }
  }
  return out;
}

function buildCookieAttributes(req: express.Request, maxAgeSeconds: number): string[] {
  const host = String(req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
  const isHttps = req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
  const attrs = ['Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  if (isHttps) {
    attrs.push('Secure');
  }
  if (host === 'supritamone.com' || host.endsWith('.supritamone.com')) {
    attrs.push('Domain=.supritamone.com');
  }
  return attrs;
}

function setSessionCookie(req: express.Request, res: express.Response, token: string): void {
  const attrs = buildCookieAttributes(req, 30 * 24 * 60 * 60);
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; ${attrs.join('; ')}`);
}

function clearSessionCookie(req: express.Request, res: express.Response): void {
  const host = String(req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
  const isHttps = req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
  const base = ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0', ...(isHttps ? ['Secure'] : [])];
  const cookiesToClear = [`${SESSION_COOKIE_NAME}=; ${base.join('; ')}`];
  if (host === 'supritamone.com' || host.endsWith('.supritamone.com')) {
    cookiesToClear.push(`${SESSION_COOKIE_NAME}=; ${[...base, 'Domain=.supritamone.com'].join('; ')}`);
  }
  res.setHeader('Set-Cookie', cookiesToClear);
}

function setAdminCookie(req: express.Request, res: express.Response, token: string): void {
  const attrs = buildCookieAttributes(req, 7 * 24 * 60 * 60);
  res.setHeader('Set-Cookie', `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; ${attrs.join('; ')}`);
}

function clearAdminCookie(req: express.Request, res: express.Response): void {
  const host = String(req.hostname || req.headers.host || '').toLowerCase().split(':')[0];
  const isHttps = req.secure || String(req.headers['x-forwarded-proto'] || '').toLowerCase() === 'https';
  const base = ['Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0', ...(isHttps ? ['Secure'] : [])];
  const cookiesToClear = [`${ADMIN_COOKIE_NAME}=; ${base.join('; ')}`];
  if (host === 'supritamone.com' || host.endsWith('.supritamone.com')) {
    cookiesToClear.push(`${ADMIN_COOKIE_NAME}=; ${[...base, 'Domain=.supritamone.com'].join('; ')}`);
  }
  res.setHeader('Set-Cookie', cookiesToClear);
}

function isPartnerOriginUrl(rawUrl: string | undefined | null): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  try {
    const u = new URL(rawUrl.trim());
    const host = u.hostname.toLowerCase();
    return host === 'zerowaste.supritamone.com' || host === 'www.zerowaste.supritamone.com';
  } catch {
    return /(?:^|\/\/)(?:www\.)?zerowaste\.supritamone\.com(?:[/:?#]|$)/i.test(rawUrl);
  }
}

function isPartnerQueryIndicator(val: unknown): boolean {
  const clean = String(val || '').trim().toLowerCase();
  return [
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
  ].includes(clean);
}

function issuePartnerRedirectSession(opts: {
  email?: string;
  name?: string;
  planId?: string;
  ip?: string;
  device?: string;
}): {
  user?: {
    email: string;
    name: string;
    role: 'admin' | 'member';
    planId: string;
    planTitle: string;
    expiresAt: number | null;
    source: string;
  };
  token?: string;
  blockedReason?: string;
  blockedCode?: 'restricted' | 'expired';
} {
  const store = loadAuthStore();
  const now = Date.now();
  const rawEmail = String(opts.email || '').trim().toLowerCase();
  const cleanEmail = rawEmail && rawEmail.includes('@') ? rawEmail : 'member@zerowaste.supritamone.com';
  const existing = store.users[cleanEmail];
  const isAdmin = cleanEmail === PERMANENT_ADMIN_EMAIL || existing?.role === 'admin';

  // Enforce Admin restriction / ended trial even if user returns via partner link
  if (existing && !isAdmin) {
    const check = isUserBlocked(existing, now);
    if (check.blocked) {
      recordLoginAudit(store, {
        email: cleanEmail,
        name: existing.name,
        action: check.code === 'expired' ? 'blocked_expired' : 'blocked_restricted',
        status: 'blocked',
        detail: `SSO arrival blocked: ${check.message}`,
        planId: existing.planId,
        paymentStatus: existing.paymentStatus,
        ip: opts.ip,
        device: opts.device,
      });
      saveAuthStore(store);
      return {
        blockedReason: check.message,
        blockedCode: check.code || 'restricted',
      };
    }
  }

  const resolvedName =
    String(opts.name || '').trim() ||
    existing?.name ||
    (cleanEmail === 'member@zerowaste.supritamone.com'
      ? 'Zero Waste Member'
      : deriveDisplayName(cleanEmail));

  const requestedPlanRaw = String(opts.planId || '').trim().toLowerCase();
  const allowedPlans = ['admin', 'trial', 'individual', 'team', 'training', 'partner_member'] as const;
  const resolvedPlanId = isAdmin
    ? 'admin'
    : existing?.planId ||
      (allowedPlans.includes(requestedPlanRaw as StoredAuthUser['planId'])
        ? (requestedPlanRaw as StoredAuthUser['planId'])
        : 'partner_member');

  const resolvedPlanTitle = isAdmin
    ? 'Permanent Executive Admin Access'
    : existing?.planTitle ||
      (resolvedPlanId === 'trial'
        ? '3-Day Free Trial (Partner SSO)'
        : 'Verified Member · zerowaste.supritamone.com');

  const defaultExpiry = resolvedPlanId === 'trial' ? now + 3 * DAY_MS : now + 30 * DAY_MS;
  const resolvedExpiry = isAdmin ? null : existing?.expiresAt ? Math.max(existing.expiresAt, now + DAY_MS) : defaultExpiry;

  const paymentStatus: UserPaymentStatus = isAdmin
    ? 'admin'
    : existing?.paymentStatus || (resolvedPlanId === 'trial' ? 'trial' : 'paid');
  const amountPaid = isAdmin
    ? 0
    : existing?.amountPaid !== undefined
      ? existing.amountPaid
      : resolvedPlanId === 'individual'
        ? 99
        : resolvedPlanId === 'team'
          ? 395
          : resolvedPlanId === 'training'
            ? 1499
            : 0;

  store.users[cleanEmail] = {
    ...(existing || {}),
    email: cleanEmail,
    name: resolvedName,
    role: isAdmin ? 'admin' : 'member',
    planId: resolvedPlanId,
    planTitle: resolvedPlanTitle,
    paymentStatus,
    amountPaid,
    currency: existing?.currency || 'USD',
    workPlace: existing?.workPlace || 'zerowaste.supritamone.com',
    designation: existing?.designation || 'Culinary Brigade Member',
    status: 'active',
    restrictedByAdmin: false,
    expiresAt: resolvedExpiry,
    source: existing?.source || 'redirect_zerowaste.supritamone.com',
    lastLoginAt: now,
    loginCount: (existing?.loginCount || 0) + 1,
    lastIp: opts.ip || existing?.lastIp || '127.0.0.1',
    deviceInfo: opts.device || existing?.deviceInfo || 'Web Browser',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  recordLoginAudit(store, {
    email: cleanEmail,
    name: resolvedName,
    action: 'partner_sso',
    status: 'success',
    detail: `Auto-unlocked via zerowaste.supritamone.com (${resolvedPlanTitle})`,
    planId: resolvedPlanId,
    paymentStatus,
    ip: opts.ip,
    device: opts.device,
  });
  saveAuthStore(store);

  const sessionPayload = {
    email: cleanEmail,
    name: resolvedName,
    role: (isAdmin ? 'admin' : 'member') as 'admin' | 'member',
    planId: resolvedPlanId,
    planTitle: resolvedPlanTitle,
    expiresAt: resolvedExpiry,
    source: 'redirect_zerowaste.supritamone.com',
  };

  const token = signSessionToken(sessionPayload);
  return { user: sessionPayload, token };
}

const app = express();
const portArgIndex = process.argv.indexOf('--port');
const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
const PORT = !isNaN(cliPort) ? cliPort : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

app.use(express.json({ limit: '10mb' }));

// Lazy Gemini API Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface SentenceTiming {
  start: number;
  end: number;
}

export interface CachedLectureAudio {
  audio: string;
  mimeType: string;
  duration: number;
  sentenceTimings: SentenceTiming[];
}

// In-memory + disk TTS caches
const ttsAudioCache = new Map<string, string>();
const lectureTtsCache = new Map<string, CachedLectureAudio>();
const ttsInFlight = new Map<string, Promise<{ audio?: string; errorDetail?: string; statusCode?: number }>>();
const lectureInFlight = new Map<string, Promise<CachedLectureAudio | { errorDetail: string; statusCode: number }>>();

function hashCacheKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

function readDiskCacheJson<T>(prefix: string, rawKey: string): T | null {
  try {
    const filePath = path.join(TTS_DISK_CACHE_DIR, `${prefix}_${hashCacheKey(rawKey)}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    }
  } catch {
    // Ignore disk cache read errors
  }
  return null;
}

function writeDiskCacheJson(prefix: string, rawKey: string, payload: unknown): void {
  try {
    const filePath = path.join(TTS_DISK_CACHE_DIR, `${prefix}_${hashCacheKey(rawKey)}.json`);
    fs.writeFileSync(filePath, JSON.stringify(payload));
  } catch {
    // Ignore disk cache write errors
  }
}

// Concurrency queue for upstream Gemini TTS (prevents burst quota/rate-limit spikes while serving tabs smoothly)
let activeTtsRequests = 0;
const MAX_CONCURRENT_TTS = 3;
const ttsWaitQueue: Array<() => void> = [];

async function acquireTtsSlot(): Promise<void> {
  if (activeTtsRequests < MAX_CONCURRENT_TTS) {
    activeTtsRequests++;
    return;
  }
  await new Promise<void>((resolve) => {
    ttsWaitQueue.push(() => {
      activeTtsRequests++;
      resolve();
    });
  });
}

function releaseTtsSlot(): void {
  activeTtsRequests = Math.max(0, activeTtsRequests - 1);
  const next = ttsWaitQueue.shift();
  if (next) next();
}

const CANONICAL_FENRIR_VOICE = 'Fenrir';
const DEFAULT_CALM_STYLE =
  'Calm, deep, steady, unhurried human male baritone voice of an experienced executive master chef and university professor teaching in a quiet studio, consistent pitch, warm tone, and even pacing throughout';

async function generateTtsWithRetry(
  ai: GoogleGenAI,
  cleanText: string,
  voice: string,
  style: string
): Promise<{ audio?: string; errorDetail?: string; statusCode?: number }> {
  // Use gemini-3.8-flash-lite-tts consistently so voice & studio tone never shift; fail over only on hard daily exhaustion
  const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
  let lastError = 'Unknown error';
  let lastStatus = 502;

  for (const modelName of modelsToTry) {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanText,
                  speechMetadata: {
                    style: style || DEFAULT_CALM_STYLE,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || 'Fenrir' },
              },
            },
          },
        });
        const candidate = response.candidates?.[0];
        const data = candidate?.content?.parts?.[0]?.inlineData?.data;
        if (data) return { audio: data };
        lastError = `${modelName}: No audio part (finishReason=${candidate?.finishReason || 'none'})`;
        lastStatus = 502;
      } catch (err: any) {
        lastError = err?.message || String(err);
        const isRateLimit = lastError.includes('429') || lastError.includes('RESOURCE_EXHAUSTED');
        const isUnavailable = lastError.includes('503') || lastError.includes('UNAVAILABLE');
        lastStatus = isRateLimit ? 429 : 502;
        console.warn(`TTS [${modelName}] attempt ${attempt} notice:`, lastError.slice(0, 220));
        // On daily/project quota exhaustion, skip remaining retries on this model and try fallback model
        if (lastError.includes('PerDay') || lastError.includes('GenerateRequestsPerDay')) {
          break;
        }
        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, isRateLimit || isUnavailable ? 1400 * attempt : 500));
        }
      }
    }
  }
  return { errorDetail: lastError, statusCode: lastStatus };
}

// Parse WAV RIFF chunks and align sentence timings to real silence valleys in the PCM waveform
function parseWavInfoAndAlignSentences(base64Audio: string, sentences: string[]): {
  duration: number;
  sentenceTimings: SentenceTiming[];
} {
  const buf = Buffer.from(base64Audio, 'base64');
  let sampleRate = 24000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataSize = Math.max(0, buf.length - 44);

  if (buf.length >= 44 && buf.toString('ascii', 0, 4) === 'RIFF') {
    let offset = 12;
    while (offset + 8 <= buf.length) {
      const id = buf.toString('ascii', offset, offset + 4);
      const size = buf.readUInt32LE(offset + 4);
      if (id === 'fmt ' && offset + 24 <= buf.length) {
        numChannels = buf.readUInt16LE(offset + 10) || 1;
        sampleRate = buf.readUInt32LE(offset + 12) || 24000;
        bitsPerSample = buf.readUInt16LE(offset + 22) || 16;
      } else if (id === 'data') {
        dataOffset = offset + 8;
        dataSize = Math.min(size, buf.length - dataOffset);
        break;
      }
      if (size === 0) break;
      offset += 8 + size + (size % 2);
    }
  }

  const bytesPerSample = Math.max(1, (bitsPerSample / 8) * numChannels);
  const totalSamples = Math.floor(dataSize / bytesPerSample);
  const totalDuration = Math.max(1, totalSamples / sampleRate);

  if (sentences.length <= 1) {
    return {
      duration: totalDuration,
      sentenceTimings: [{ start: 0, end: totalDuration }],
    };
  }

  // Weight each sentence by speakable characters + punctuation pauses
  const weights = sentences.map((s) => {
    const clean = s.trim();
    const punctMatches = clean.match(/[,;:—–-]/g)?.length || 0;
    return Math.max(8, clean.length + punctMatches * 5);
  });
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  // Compute 20ms RMS energy profile across the WAV PCM stream (for 16-bit PCM)
  const frameMs = 0.02;
  const samplesPerFrame = Math.max(1, Math.floor(sampleRate * frameMs));
  const numFrames = Math.floor(totalSamples / samplesPerFrame);
  const frameRms: number[] = new Array(numFrames).fill(0);

  if (bitsPerSample === 16 && numFrames > 0) {
    for (let f = 0; f < numFrames; f++) {
      let sumSq = 0;
      const startSample = f * samplesPerFrame;
      for (let i = 0; i < samplesPerFrame; i++) {
        const byteIdx = dataOffset + (startSample + i) * bytesPerSample;
        if (byteIdx + 1 < buf.length) {
          const val = buf.readInt16LE(byteIdx) / 32768;
          sumSq += val * val;
        }
      }
      frameRms[f] = Math.sqrt(sumSq / samplesPerFrame);
    }
  }

  // Snap each expected sentence boundary to the deepest pause valley within +/-3.2s
  const boundaries: number[] = [0];
  let cumWeight = 0;
  for (let i = 0; i < sentences.length - 1; i++) {
    cumWeight += weights[i];
    const expectedTime = (cumWeight / totalWeight) * totalDuration;
    const minTime = Math.min(totalDuration - 0.5 * (sentences.length - 1 - i), boundaries[i] + 1.0);
    const maxTime = Math.max(minTime, totalDuration - 0.5 * (sentences.length - 1 - i));

    let bestTime = Math.max(minTime, Math.min(maxTime, expectedTime));
    if (numFrames > 10) {
      const searchStart = Math.max(minTime, expectedTime - 3.2);
      const searchEnd = Math.min(maxTime, expectedTime + 3.2);
      const startFrame = Math.max(1, Math.floor(searchStart / frameMs));
      const endFrame = Math.min(numFrames - 2, Math.ceil(searchEnd / frameMs));

      let bestScore = Number.POSITIVE_INFINITY;
      for (let f = startFrame; f <= endFrame; f++) {
        // 100ms smoothed silence average centered at frame f
        const windowEnergy =
          (frameRms[Math.max(0, f - 2)] +
            frameRms[Math.max(0, f - 1)] +
            frameRms[f] +
            frameRms[Math.min(numFrames - 1, f + 1)] +
            frameRms[Math.min(numFrames - 1, f + 2)]) /
          5;
        // Slight bias toward expected proportional timestamp so ties pick the closest natural pause
        const distancePenalty = Math.abs(f * frameMs - expectedTime) * 0.002;
        const score = windowEnergy + distancePenalty;
        if (score < bestScore) {
          bestScore = score;
          bestTime = f * frameMs;
        }
      }
    }
    boundaries.push(Number(bestTime.toFixed(3)));
  }
  boundaries.push(Number(totalDuration.toFixed(3)));

  const sentenceTimings: SentenceTiming[] = [];
  for (let i = 0; i < sentences.length; i++) {
    sentenceTimings.push({
      start: boundaries[i],
      end: Math.max(boundaries[i] + 0.3, boundaries[i + 1]),
    });
  }

  return { duration: totalDuration, sentenceTimings };
}

// Check AI status
app.get('/api/ai/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    available: hasKey,
    model: 'gemini-4-hydrogen',
    ttsModel: 'gemini-3.8-flash-lite-tts',
  });
});

// ==================== SUPRITAMONE ACCESS GATE & AUTH ENDPOINTS ====================

// Verify existing bearer token, HTTP session cookie, or direct Referer from zerowaste.supritamone.com
app.get('/api/auth/session', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE_NAME] || '';
  const candidateToken = bearerToken || cookieToken;
  const verified = verifySessionToken(candidateToken);
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (verified) {
    const store = loadAuthStore();
    const now = Date.now();
    const cleanEmail = verified.email.toLowerCase();
    if (cleanEmail !== PERMANENT_ADMIN_EMAIL) {
      const record = store.users[cleanEmail];
      const blockCheck = isUserBlocked(record, now);
      if (blockCheck.blocked) {
        clearSessionCookie(req, res);
        return res.status(403).json({
          authenticated: false,
          restricted: blockCheck.code === 'restricted',
          expired: blockCheck.code === 'expired',
          error: blockCheck.message,
        });
      }
    }
    setSessionCookie(req, res, candidateToken);
    return res.json({
      authenticated: true,
      user: verified,
      token: candidateToken,
    });
  }

  const headerReferrer = String(req.headers.referer || req.headers.referrer || '');
  if (isPartnerOriginUrl(headerReferrer)) {
    const partnerSession = issuePartnerRedirectSession({ ip, device });
    if (partnerSession.blockedReason) {
      return res.status(403).json({
        authenticated: false,
        restricted: partnerSession.blockedCode === 'restricted',
        expired: partnerSession.blockedCode === 'expired',
        error: partnerSession.blockedReason,
      });
    }
    if (partnerSession.token && partnerSession.user) {
      setSessionCookie(req, res, partnerSession.token);
      return res.json({
        authenticated: true,
        user: partnerSession.user,
        token: partnerSession.token,
      });
    }
  }

  return res.status(401).json({ authenticated: false, error: 'Session locked or expired' });
});

// Verify redirect arriving from https://zerowaste.supritamone.com/
app.post('/api/auth/verify-redirect', (req, res) => {
  const {
    referrer = '',
    fromParam = '',
    email = '',
    name = '',
    planId = 'partner_member',
  } = req.body || {};

  const headerReferrer = String(req.headers.referer || req.headers.referrer || '');
  const cookies = parseCookies(req.headers.cookie);
  const existingCookieUser = verifySessionToken(cookies[SESSION_COOKIE_NAME] || '');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  const isVerifiedRedirect =
    isPartnerOriginUrl(referrer) ||
    isPartnerOriginUrl(headerReferrer) ||
    isPartnerQueryIndicator(fromParam) ||
    Boolean(existingCookieUser && existingCookieUser.source === 'redirect_zerowaste.supritamone.com');

  if (!isVerifiedRedirect) {
    return res.status(403).json({
      authenticated: false,
      error: 'Direct access requires redirect from https://zerowaste.supritamone.com/, valid login, or active plan.',
    });
  }

  const partnerResult = issuePartnerRedirectSession({
    email: email || existingCookieUser?.email,
    name: name || existingCookieUser?.name,
    planId: planId || existingCookieUser?.planId,
    ip,
    device,
  });

  if (partnerResult.blockedReason || !partnerResult.token || !partnerResult.user) {
    clearSessionCookie(req, res);
    return res.status(403).json({
      authenticated: false,
      restricted: partnerResult.blockedCode === 'restricted',
      expired: partnerResult.blockedCode === 'expired',
      error: partnerResult.blockedReason || 'Your trial has ended or access was restricted.',
    });
  }

  setSessionCookie(req, res, partnerResult.token);
  return res.json({
    authenticated: true,
    user: partnerResult.user,
    token: partnerResult.token,
  });
});

// Explicit logout clears HTTP session cookie
app.post('/api/auth/logout', (req, res) => {
  clearSessionCookie(req, res);
  return res.json({ authenticated: false, loggedOut: true });
});

// Member & Permanent Admin Sign-In (supritamone@gmail.com always accessible)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const store = loadAuthStore();
  const now = Date.now();

  // Rule: supritamone@gmail.com retains permanent unrestricted Master Admin access, protected by Admin password
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    const adminHash = store.adminSettings.passwordHash || '';
    if (!cleanPassword || !adminHash || !verifyPassword(cleanPassword, adminHash)) {
      recordLoginAudit(store, {
        email: PERMANENT_ADMIN_EMAIL,
        name: 'Master Admin Attempt',
        action: 'blocked_bad_password',
        status: 'blocked',
        detail: 'Incorrect password on Member Sign-In for Master Admin',
        planId: 'admin',
        paymentStatus: 'admin',
        ip,
        device,
      });
      saveAuthStore(store);
      return res.status(401).json({
        error: 'Incorrect password for supritamone@gmail.com. Use Forgot Password or enter your Admin password.',
      });
    }

    const adminUser = store.users[PERMANENT_ADMIN_EMAIL];
    adminUser.lastLoginAt = now;
    adminUser.loginCount = (adminUser.loginCount || 0) + 1;
    adminUser.lastIp = ip;
    adminUser.deviceInfo = device;
    adminUser.updatedAt = now;
    recordLoginAudit(store, {
      email: PERMANENT_ADMIN_EMAIL,
      name: adminUser.name,
      action: 'login',
      status: 'success',
      detail: 'Permanent Master Admin signed in',
      planId: 'admin',
      paymentStatus: 'admin',
      ip,
      device,
    });
    saveAuthStore(store);

    const sessionPayload = {
      email: PERMANENT_ADMIN_EMAIL,
      name: adminUser.name || 'Supritamone Master Admin',
      role: 'admin' as const,
      planId: 'admin',
      planTitle: 'Permanent Executive Admin Access',
      expiresAt: null,
      source: 'permanent_admin',
    };
    const token = signSessionToken(sessionPayload);
    setSessionCookie(req, res, token);
    return res.json({ authenticated: true, user: sessionPayload, token });
  }

  const record = store.users[cleanEmail];
  if (!record) {
    recordLoginAudit(store, {
      email: cleanEmail,
      name: deriveDisplayName(cleanEmail),
      action: 'blocked_bad_password',
      status: 'blocked',
      detail: 'Login attempt for unregistered email',
      ip,
      device,
    });
    saveAuthStore(store);
    return res.status(401).json({
      error:
        'No active membership found for this email. Redirect via https://zerowaste.supritamone.com/ or select a plan below to unlock access.',
    });
  }

  // Validate password
  if (record.passwordHash) {
    if (!cleanPassword || !verifyPassword(cleanPassword, record.passwordHash)) {
      recordLoginAudit(store, {
        email: cleanEmail,
        name: record.name,
        action: 'blocked_bad_password',
        status: 'blocked',
        detail: 'Incorrect password attempt',
        planId: record.planId,
        paymentStatus: record.paymentStatus,
        ip,
        device,
      });
      saveAuthStore(store);
      return res.status(401).json({ error: 'Incorrect password for this account. Please check your password and retry.' });
    }
  } else if (cleanPassword.length < 4) {
    return res.status(401).json({
      error: 'Enter your password (min 4 characters) or sign in directly from https://zerowaste.supritamone.com/.',
    });
  }

  // Check Admin restriction / post-trial lockout
  const blockCheck = isUserBlocked(record, now);
  if (blockCheck.blocked) {
    recordLoginAudit(store, {
      email: cleanEmail,
      name: record.name,
      action: blockCheck.code === 'expired' ? 'blocked_expired' : 'blocked_restricted',
      status: 'blocked',
      detail: blockCheck.message,
      planId: record.planId,
      paymentStatus: record.paymentStatus,
      ip,
      device,
    });
    saveAuthStore(store);
    return res.status(403).json({
      restricted: blockCheck.code === 'restricted',
      expired: blockCheck.code === 'expired',
      error: blockCheck.message,
    });
  }

  record.lastLoginAt = now;
  record.loginCount = (record.loginCount || 0) + 1;
  record.lastIp = ip;
  record.deviceInfo = device;
  record.updatedAt = now;
  recordLoginAudit(store, {
    email: record.email,
    name: record.name,
    action: 'login',
    status: 'success',
    detail: `Member login (${record.planTitle})`,
    planId: record.planId,
    paymentStatus: record.paymentStatus,
    ip,
    device,
  });
  saveAuthStore(store);

  const isAdmin = record.role === 'admin';
  const sessionPayload = {
    email: record.email,
    name: record.name,
    role: record.role,
    planId: record.planId,
    planTitle: record.planTitle,
    expiresAt: isAdmin ? null : record.expiresAt,
    source: record.source || 'login_credentials',
  };
  const token = signSessionToken(sessionPayload);
  setSessionCookie(req, res, token);
  return res.json({ authenticated: true, user: sessionPayload, token });
});

// Activate 3-Day Free Trial OR Enroll/Purchase Plan (Individual $99, Team $79/chef, Training $1499)
app.post('/api/auth/activate-plan', (req, res) => {
  const { planId, email, name, password, transactionRef, chefSeats, workPlace, designation } = req.body || {};
  const cleanPlan = String(planId || 'trial').trim().toLowerCase() as 'trial' | 'individual' | 'team' | 'training';
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const cleanName = String(name || '').trim() || deriveDisplayName(cleanEmail || 'chef');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!['trial', 'individual', 'team', 'training'].includes(cleanPlan)) {
    return res.status(400).json({ error: 'Invalid subscription plan selected.' });
  }
  if (cleanEmail !== PERMANENT_ADMIN_EMAIL && cleanPassword.length < 4) {
    return res.status(400).json({ error: 'Please create a password (at least 4 characters) for future sign-ins.' });
  }

  const store = loadAuthStore();
  const now = Date.now();
  const existing = store.users[cleanEmail];

  // Always keep supritamone@gmail.com protected by its Admin password
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    const adminHash = store.adminSettings.passwordHash || '';
    if (!cleanPassword || !adminHash || !verifyPassword(cleanPassword, adminHash)) {
      return res.status(401).json({
        error: 'supritamone@gmail.com is the Master Admin account. Please sign in with your Admin password.',
      });
    }
    const adminPayload = {
      email: PERMANENT_ADMIN_EMAIL,
      name: cleanName || 'Supritamone Master Admin',
      role: 'admin' as const,
      planId: 'admin',
      planTitle: 'Permanent Executive Admin Access',
      expiresAt: null,
      source: 'permanent_admin',
    };
    const adminToken = signSessionToken(adminPayload);
    setSessionCookie(req, res, adminToken);
    return res.json({ authenticated: true, user: adminPayload, token: adminToken });
  }

  if (
    cleanPlan === 'trial' &&
    existing &&
    existing.planId === 'trial' &&
    (existing.status === 'expired' || existing.status === 'restricted' || existing.restrictedByAdmin)
  ) {
    recordLoginAudit(store, {
      email: cleanEmail,
      name: cleanName,
      action: 'blocked_expired',
      status: 'blocked',
      detail: 'Blocked repeat 3-Day Free Trial after trial already ended',
      planId: 'trial',
      paymentStatus: 'unpaid',
      ip,
      device,
    });
    saveAuthStore(store);
    return res.status(403).json({
      expired: true,
      error: 'A 3-Day Free Trial was already used for this email and has ended. Please select Individual, Team, or Executive Advisory.',
    });
  }

  const seatsCount = Math.max(5, Number(chefSeats) || 5);
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

  const updatedRecord: StoredAuthUser = {
    email: cleanEmail,
    name: cleanName,
    passwordHash: hashPassword(cleanPassword),
    role: 'member',
    planId: cleanPlan,
    planTitle: meta.title,
    paymentStatus,
    amountPaid: meta.amount,
    currency: 'USD',
    workPlace: String(workPlace || existing?.workPlace || '').trim(),
    designation: String(designation || existing?.designation || '').trim(),
    chefSeats: cleanPlan === 'team' ? seatsCount : cleanPlan === 'training' ? 5 : undefined,
    status: 'active',
    restrictedByAdmin: false,
    restrictedReason: undefined,
    expiresAt,
    transactionRef:
      transactionRef ||
      (cleanPlan === 'trial' ? `TRIAL-${now.toString(36).toUpperCase()}` : `ZN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`),
    source: 'direct_plan_enrollment',
    lastLoginAt: now,
    loginCount: (existing?.loginCount || 0) + 1,
    lastIp: ip,
    deviceInfo: device,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  store.users[cleanEmail] = updatedRecord;
  recordLoginAudit(store, {
    email: cleanEmail,
    name: cleanName,
    action: cleanPlan === 'trial' ? 'trial_started' : 'plan_activation',
    status: 'success',
    detail: `${meta.title} activated (${updatedRecord.transactionRef})`,
    planId: cleanPlan,
    paymentStatus,
    ip,
    device,
  });
  saveAuthStore(store);

  const sessionPayload = {
    email: updatedRecord.email,
    name: updatedRecord.name,
    role: 'member' as const,
    planId: updatedRecord.planId,
    planTitle: updatedRecord.planTitle,
    expiresAt: updatedRecord.expiresAt,
    source: updatedRecord.source || 'direct_plan_enrollment',
  };

  const token = signSessionToken(sessionPayload);
  setSessionCookie(req, res, token);
  return res.json({ authenticated: true, user: sessionPayload, token });
});

// Member Forgot / Reset Password (verifies registered email + matching Full Name or Reference)
app.post('/api/auth/reset-password', (req, res) => {
  const { email, fullName, verificationValue, newPassword } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanName = String(fullName || verificationValue || '').trim().toLowerCase();
  const cleanNewPw = String(newPassword || '');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter your registered email address.' });
  }
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    return res.status(400).json({
      isAdminAccount: true,
      error: 'Please use Forgot Password inside the Admin Portal for the Master Admin account.',
    });
  }
  if (cleanNewPw.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters.' });
  }

  const store = loadAuthStore();
  const record = store.users[cleanEmail];
  if (!record) {
    return res.status(404).json({ error: 'No account found for that email address.' });
  }

  const blockCheck = isUserBlocked(record, Date.now());
  if (blockCheck.blocked) {
    return res.status(403).json({ error: blockCheck.message });
  }

  const matchesName = cleanName && record.name.trim().toLowerCase() === cleanName;
  const matchesRef = Boolean(record.transactionRef && cleanName === record.transactionRef.trim().toLowerCase());
  if (!matchesName && !matchesRef) {
    return res.status(403).json({
      error: 'Verification failed. Enter the exact Full Name or Order/Trial Reference ID registered on this account.',
    });
  }

  record.passwordHash = hashPassword(cleanNewPw);
  record.updatedAt = Date.now();
  recordLoginAudit(store, {
    email: record.email,
    name: record.name,
    action: 'login',
    status: 'info',
    detail: 'Member password reset via self-service verification',
    planId: record.planId,
    paymentStatus: record.paymentStatus,
    ip,
    device,
  });
  saveAuthStore(store);

  return res.json({
    ok: true,
    message: 'Password updated! You can now sign in with your new password.',
  });
});

// ==================== ADMINISTRATOR PORTAL API ENDPOINTS ====================

function resolveAdminSession(req: express.Request): {
  username: string;
  displayName: string;
  notificationEmail: string;
} | null {
  const cookies = parseCookies(req.headers.cookie);
  const adminHeader = String(req.headers['x-admin-token'] || '').trim();
  const bearerHeader = String(req.headers.authorization || '').startsWith('Bearer ')
    ? String(req.headers.authorization).slice(7).trim()
    : '';
  const adminToken = adminHeader || bearerHeader || cookies[ADMIN_COOKIE_NAME] || '';
  const verifiedAdmin = verifyAdminToken(adminToken);
  if (verifiedAdmin) return verifiedAdmin;

  // Also allow signed-in supritamone@gmail.com Master Admin session cookie seamlessly
  const memberUser = verifySessionToken(cookies[SESSION_COOKIE_NAME] || '');
  if (memberUser && memberUser.email.toLowerCase() === PERMANENT_ADMIN_EMAIL) {
    const store = loadAuthStore();
    return {
      username: PERMANENT_ADMIN_EMAIL,
      displayName: store.adminSettings.displayName,
      notificationEmail: store.adminSettings.notificationEmail,
    };
  }
  return null;
}

function requireAdminMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const admin = resolveAdminSession(req);
  if (!admin) {
    return res.status(401).json({ authenticated: false, error: 'Administrator authentication required.' });
  }
  (req as express.Request & { adminSession?: typeof admin }).adminSession = admin;
  next();
}

app.get('/api/admin/session', (req, res) => {
  const admin = resolveAdminSession(req);
  if (!admin) {
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, admin });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
    return res.status(401).json({
      error: `Invalid admin username. Sign in using ${PERMANENT_ADMIN_EMAIL}.`,
    });
  }

  const store = loadAuthStore();
  const storedHash = store.adminSettings.passwordHash || '';
  const passwordOk = Boolean(cleanPassword && storedHash && verifyPassword(cleanPassword, storedHash));

  if (!passwordOk) {
    recordLoginAudit(store, {
      email: cleanUser,
      name: 'Administrator Attempt',
      action: 'blocked_bad_password',
      status: 'blocked',
      detail: 'Incorrect password on Administrator Portal',
      ip,
      device,
    });
    saveAuthStore(store);
    return res.status(401).json({ error: 'Invalid administrator password. Click "Forgot Password?" to reset it.' });
  }

  const adminPayload = {
    username: PERMANENT_ADMIN_EMAIL,
    displayName: store.adminSettings.displayName || 'Dr. Chef Supritam Basu',
    notificationEmail: store.adminSettings.notificationEmail || FACULTY_ADMIN_EMAIL,
  };
  const token = signAdminToken(adminPayload);
  setAdminCookie(req, res, token);

  recordLoginAudit(store, {
    email: cleanUser,
    name: adminPayload.displayName,
    action: 'admin_action',
    status: 'success',
    detail: 'Signed into Zero Waste Administrator Portal',
    ip,
    device,
  });
  saveAuthStore(store);

  return res.json({ authenticated: true, admin: adminPayload, token });
});

app.post('/api/admin/forgot-password', (req, res) => {
  const { username, email, verificationAnswer, verificationValue } = req.body || {};
  const cleanUser = String(username || email || '').trim().toLowerCase();
  const cleanVerify = String(verificationAnswer || verificationValue || '').trim().toLowerCase();
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
    return res.status(404).json({
      error: `Admin password reset is only available for ${PERMANENT_ADMIN_EMAIL}.`,
    });
  }

  const store = loadAuthStore();
  const validAnswers = [
    store.adminSettings.notificationEmail?.trim().toLowerCase(),
    FACULTY_ADMIN_EMAIL.toLowerCase(),
    store.adminSettings.recoveryKey?.trim().toLowerCase(),
    '791463',
  ].filter(Boolean) as string[];

  if (!cleanVerify || !validAnswers.includes(cleanVerify)) {
    recordLoginAudit(store, {
      email: cleanUser,
      name: store.adminSettings.displayName,
      action: 'blocked_bad_password',
      status: 'blocked',
      detail: 'Failed recovery verification during Admin Forgot Password',
      ip,
      device,
    });
    saveAuthStore(store);
    return res.status(403).json({
      error:
        'Identity verification failed. Enter your Backup Notification Email (e.g. supritam.basu@supritamone.com), Recovery Key, or CPD Provider ID.',
    });
  }

  const resetCode = crypto.randomInt(100000, 999999).toString();
  store.adminSettings.resetTokenHash = hashPassword(resetCode);
  store.adminSettings.resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;

  recordLoginAudit(store, {
    email: cleanUser,
    name: store.adminSettings.displayName,
    action: 'admin_action',
    status: 'info',
    detail: 'Verified Admin identity & issued 15-minute password reset code',
    ip,
    device,
  });
  saveAuthStore(store);

  return res.json({
    ok: true,
    verified: true,
    resetCode,
    expiresInMinutes: 15,
    message: 'Identity verified. Set your new Admin password below.',
  });
});

app.post('/api/admin/reset-password', (req, res) => {
  const { username, email, resetCode, newPassword } = req.body || {};
  const cleanUser = String(username || email || '').trim().toLowerCase();
  const cleanCode = String(resetCode || '').trim();
  const cleanNewPw = String(newPassword || '');
  const ip = getClientIp(req);
  const device = getDeviceSummary(req);

  if (cleanUser !== PERMANENT_ADMIN_EMAIL) {
    return res.status(400).json({ error: `Invalid admin username. Expected ${PERMANENT_ADMIN_EMAIL}.` });
  }
  if (cleanNewPw.length < 6) {
    return res.status(400).json({ error: 'New admin password must be at least 6 characters.' });
  }

  const store = loadAuthStore();
  if (
    !store.adminSettings.resetTokenHash ||
    !store.adminSettings.resetTokenExpiresAt ||
    Date.now() > store.adminSettings.resetTokenExpiresAt
  ) {
    return res.status(400).json({ error: 'Reset session expired. Please request a fresh password reset.' });
  }

  if (!verifyPassword(cleanCode, store.adminSettings.resetTokenHash)) {
    return res.status(403).json({ error: 'Invalid password reset verification code.' });
  }

  store.adminSettings.passwordHash = hashPassword(cleanNewPw);
  delete store.adminSettings.resetTokenHash;
  delete store.adminSettings.resetTokenExpiresAt;

  recordLoginAudit(store, {
    email: cleanUser,
    name: store.adminSettings.displayName,
    action: 'admin_action',
    status: 'success',
    detail: 'Admin password was reset successfully via Forgot Password flow',
    ip,
    device,
  });
  saveAuthStore(store);

  return res.json({
    ok: true,
    message: 'Admin password has been updated. You can now sign in with your new password.',
  });
});

app.post('/api/admin/logout', (req, res) => {
  clearAdminCookie(req, res);
  return res.json({ authenticated: false, loggedOut: true });
});

app.get('/api/admin/overview', requireAdminMiddleware, (req, res) => {
  const store = loadAuthStore();
  const now = Date.now();
  const allUsers = Object.values(store.users).map((u) => {
    const isPermanentAdmin = u.email.toLowerCase() === PERMANENT_ADMIN_EMAIL;
    const msSinceCreated = Math.max(0, now - (u.createdAt || now));
    const daysRunning = Math.max(1, Math.ceil(msSinceCreated / DAY_MS));
    const msRemaining = u.expiresAt ? u.expiresAt - now : null;
    const daysLeft = msRemaining !== null ? Math.ceil(msRemaining / DAY_MS) : null;
    const hoursLeft = msRemaining !== null ? Math.max(0, Math.ceil(msRemaining / (60 * 60 * 1000))) : null;
    const trialExpired = Boolean(u.planId === 'trial' && u.expiresAt && now > u.expiresAt);

    return {
      email: u.email,
      name: u.name,
      role: u.role,
      planId: u.planId,
      planTitle: u.planTitle,
      paymentStatus: u.paymentStatus,
      amountPaid: Number(u.amountPaid || 0),
      currency: u.currency || 'USD',
      workPlace: u.workPlace || '',
      designation: u.designation || '',
      chefSeats: u.chefSeats || null,
      status: u.status,
      restrictedByAdmin: Boolean(u.restrictedByAdmin),
      restrictedReason: u.restrictedReason || '',
      expiresAt: u.expiresAt,
      transactionRef: u.transactionRef || '',
      source: u.source || '',
      lastLoginAt: u.lastLoginAt || null,
      loginCount: u.loginCount || 0,
      lastIp: u.lastIp || '',
      deviceInfo: u.deviceInfo || '',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      daysRunning,
      daysLeft,
      hoursLeft,
      trialExpired,
      isPermanentAdmin,
    };
  });

  allUsers.sort((a, b) => (b.lastLoginAt || b.updatedAt || 0) - (a.lastLoginAt || a.updatedAt || 0));

  const nonAdminUsers = allUsers.filter((u) => u.role !== 'admin');
  const paidUsers = nonAdminUsers.filter((u) => u.paymentStatus === 'paid').length;
  const unpaidUsers = nonAdminUsers.filter(
    (u) => u.paymentStatus === 'unpaid' || u.paymentStatus === 'pending_approval'
  ).length;
  const activeTrials = nonAdminUsers.filter(
    (u) => u.planId === 'trial' && u.status === 'active' && !u.trialExpired
  ).length;
  const restrictedOrExpired = nonAdminUsers.filter(
    (u) => u.status === 'restricted' || u.status === 'expired' || u.trialExpired
  ).length;
  const pendingApproval = nonAdminUsers.filter(
    (u) => u.status === 'pending_approval' || u.paymentStatus === 'pending_approval'
  ).length;
  const totalRevenueUsd = nonAdminUsers.reduce(
    (sum, u) => (u.paymentStatus === 'paid' ? sum + (u.amountPaid || 0) : sum),
    0
  );
  const totalLogins = allUsers.reduce((sum, u) => sum + (u.loginCount || 0), 0);

  return res.json({
    stats: {
      totalUsers: allUsers.length,
      memberCount: nonAdminUsers.length,
      paidUsers,
      unpaidUsers,
      activeTrials,
      restrictedOrExpired,
      pendingApproval,
      totalRevenueUsd,
      totalLogins,
    },
    users: allUsers,
    loginLogs: store.loginLogs || [],
    adminProfile: {
      displayName: store.adminSettings.displayName,
      notificationEmail: store.adminSettings.notificationEmail,
      recoveryKey: store.adminSettings.recoveryKey || DEFAULT_ADMIN_RECOVERY_KEY,
    },
  });
});

app.post('/api/admin/users/create', requireAdminMiddleware, (req, res) => {
  const {
    email,
    name,
    password = '',
    workPlace = '',
    designation = '',
    planId = 'individual',
    paymentStatus = 'paid',
    amountPaid,
    chefSeats = 5,
    daysValid,
    transactionRef = '',
  } = req.body || {};

  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid subscriber email is required.' });
  }
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    return res.status(400).json({ error: 'Master Admin account is managed automatically.' });
  }

  const store = loadAuthStore();
  const now = Date.now();
  const allowedPlans = ['trial', 'individual', 'team', 'training', 'partner_member'] as const;
  const cleanPlan = allowedPlans.includes(planId) ? planId : 'individual';
  const cleanPay: UserPaymentStatus = ['paid', 'unpaid', 'trial', 'pending_approval'].includes(paymentStatus)
    ? paymentStatus
    : 'paid';

  const defaultDays = cleanPlan === 'trial' ? 3 : 365;
  const resolvedDays = Math.max(0, Number(daysValid ?? defaultDays));
  const seats = Math.max(5, Number(chefSeats || 5));
  const defaultAmount =
    cleanPay === 'paid'
      ? cleanPlan === 'individual'
        ? 99
        : cleanPlan === 'team'
          ? seats * 79
          : cleanPlan === 'training'
            ? 1499
            : 99
      : 0;
  const resolvedAmount = amountPaid !== undefined && amountPaid !== '' ? Number(amountPaid) : defaultAmount;

  const planTitles: Record<string, string> = {
    trial: '3-Day Free Trial ($0 / 72h)',
    individual: 'Individual Annual Plan ($99/yr)',
    team: `Team Brigade Plan (${seats} Chefs · $79/chef/yr)`,
    training: 'EXECUTIVE ADVISORY · Training ($1499/5 chefs/yr)',
    partner_member: 'Verified Member · zerowaste.supritamone.com',
  };

  const status: UserAccountStatus =
    cleanPay === 'pending_approval'
      ? 'pending_approval'
      : cleanPay === 'unpaid' && resolvedDays === 0
        ? 'restricted'
        : 'active';

  store.users[cleanEmail] = {
    email: cleanEmail,
    name: String(name || '').trim() || deriveDisplayName(cleanEmail),
    passwordHash: String(password || '').trim() ? hashPassword(String(password).trim()) : store.users[cleanEmail]?.passwordHash,
    role: 'member',
    planId: cleanPlan,
    planTitle: planTitles[cleanPlan] || 'Verified Member',
    paymentStatus: cleanPay,
    amountPaid: resolvedAmount,
    currency: 'USD',
    workPlace: String(workPlace || '').trim(),
    designation: String(designation || '').trim(),
    chefSeats: cleanPlan === 'team' ? seats : cleanPlan === 'training' ? 5 : undefined,
    status,
    restrictedByAdmin: status === 'restricted',
    restrictedReason: status === 'restricted' ? 'Unpaid — Restricted by Administrator' : undefined,
    expiresAt: resolvedDays > 0 ? now + resolvedDays * DAY_MS : now - 1000,
    transactionRef: String(transactionRef || '').trim() || `ADM-${now.toString(36).toUpperCase()}`,
    source: 'admin_panel_created',
    lastLoginAt: store.users[cleanEmail]?.lastLoginAt || null,
    loginCount: store.users[cleanEmail]?.loginCount || 0,
    lastIp: store.users[cleanEmail]?.lastIp || 'Added by Admin',
    deviceInfo: store.users[cleanEmail]?.deviceInfo || 'Admin Registry',
    createdAt: store.users[cleanEmail]?.createdAt || now,
    updatedAt: now,
  };

  recordLoginAudit(store, {
    email: cleanEmail,
    name: store.users[cleanEmail].name,
    action: 'admin_action',
    status: 'info',
    detail: `Admin created/updated user (${planTitles[cleanPlan]}, ${cleanPay.toUpperCase()} · $${resolvedAmount})`,
    planId: cleanPlan,
    paymentStatus: cleanPay,
    ip: getClientIp(req),
    device: 'Admin Portal',
  });
  saveAuthStore(store);

  return res.json({ ok: true, user: store.users[cleanEmail] });
});

app.post('/api/admin/users/action', requireAdminMiddleware, (req, res) => {
  const { email, action, planId, amountPaid, reason, trialDays } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanAction = String(action || '').trim().toLowerCase();

  if (!cleanEmail) {
    return res.status(400).json({ error: 'User email is required.' });
  }
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    return res.status(403).json({
      error: `${PERMANENT_ADMIN_EMAIL} is the Permanent Master Admin and can never be restricted, expired, or deleted.`,
    });
  }

  const store = loadAuthStore();
  const user = store.users[cleanEmail];
  if (!user) {
    return res.status(404).json({ error: 'Subscriber account not found.' });
  }

  const now = Date.now();
  let detailMsg = '';

  switch (cleanAction) {
    case 'approve_paid': {
      const targetPlan = (['individual', 'team', 'training'].includes(String(planId || ''))
        ? planId
        : user.planId === 'trial'
          ? 'individual'
          : user.planId) as StoredAuthUser['planId'];
      const defaultAmt =
        targetPlan === 'individual' ? 99 : targetPlan === 'team' ? Math.max(5, user.chefSeats || 5) * 79 : targetPlan === 'training' ? 1499 : 99;
      user.planId = targetPlan;
      user.planTitle =
        targetPlan === 'individual'
          ? 'Individual Annual Plan ($99/yr)'
          : targetPlan === 'team'
            ? `Team Brigade Plan (${Math.max(5, user.chefSeats || 5)} Chefs · $79/chef/yr)`
            : targetPlan === 'training'
              ? 'EXECUTIVE ADVISORY · Training ($1499/5 chefs/yr)'
              : 'Paid Annual Membership';
      user.paymentStatus = 'paid';
      user.amountPaid = amountPaid !== undefined ? Number(amountPaid) : Math.max(user.amountPaid || 0, defaultAmt);
      user.status = 'active';
      user.restrictedByAdmin = false;
      user.restrictedReason = undefined;
      user.expiresAt = now + 365 * DAY_MS;
      user.transactionRef = user.transactionRef || `ZN-PAID-${now.toString(36).toUpperCase()}`;
      user.updatedAt = now;
      detailMsg = `Marked PAID ($${user.amountPaid} USD) & unlocked for 365 days`;
      break;
    }
    case 'mark_unpaid': {
      user.paymentStatus = 'unpaid';
      user.amountPaid = 0;
      user.updatedAt = now;
      detailMsg = 'Payment status set to UNPAID';
      break;
    }
    case 'restrict': {
      user.status = 'restricted';
      user.restrictedByAdmin = true;
      user.restrictedReason = String(reason || '').trim() || 'Access restricted by Administrator (Unpaid / Trial Ended)';
      user.updatedAt = now;
      detailMsg = `Restricted access: ${user.restrictedReason}`;
      break;
    }
    case 'expire_trial': {
      user.status = 'restricted';
      user.paymentStatus = 'unpaid';
      user.restrictedByAdmin = true;
      user.restrictedReason = '3-Day Free Trial Ended — Please upgrade to a paid plan';
      user.expiresAt = now - 1000;
      user.updatedAt = now;
      detailMsg = 'Ended Free Trial & locked account immediately';
      break;
    }
    case 'extend_trial': {
      const days = Math.max(1, Number(trialDays || 3));
      const baseTime = user.expiresAt && user.expiresAt > now ? user.expiresAt : now;
      user.planId = 'trial';
      user.planTitle = '3-Day Free Trial ($0 / 72h)';
      user.paymentStatus = 'trial';
      user.status = 'active';
      user.restrictedByAdmin = false;
      user.restrictedReason = undefined;
      user.expiresAt = baseTime + days * DAY_MS;
      user.updatedAt = now;
      detailMsg = `Granted +${days} days free trial access`;
      break;
    }
    case 'unrestrict': {
      user.status = 'active';
      user.restrictedByAdmin = false;
      user.restrictedReason = undefined;
      if (!user.expiresAt || user.expiresAt <= now) {
        user.expiresAt = now + 30 * DAY_MS;
      }
      user.updatedAt = now;
      detailMsg = 'Restored active portal access';
      break;
    }
    case 'delete': {
      const removedName = user.name;
      delete store.users[cleanEmail];
      recordLoginAudit(store, {
        email: cleanEmail,
        name: removedName,
        action: 'admin_action',
        status: 'info',
        detail: 'Subscriber deleted from registry by Admin',
        ip: getClientIp(req),
        device: 'Admin Portal',
      });
      saveAuthStore(store);
      return res.json({ ok: true, deleted: true });
    }
    default:
      return res.status(400).json({ error: `Unsupported action: ${cleanAction}` });
  }

  recordLoginAudit(store, {
    email: user.email,
    name: user.name,
    action: 'admin_action',
    status: cleanAction === 'restrict' || cleanAction === 'expire_trial' ? 'blocked' : 'info',
    detail: detailMsg,
    planId: user.planId,
    paymentStatus: user.paymentStatus,
    ip: getClientIp(req),
    device: 'Admin Portal',
  });
  saveAuthStore(store);

  return res.json({ ok: true, user });
});

app.post('/api/admin/users/bulk-delete', requireAdminMiddleware, (req, res) => {
  const { emails, deleteAll } = req.body || {};
  const store = loadAuthStore();
  let deletedCount = 0;

  if (deleteAll === true) {
    for (const key of Object.keys(store.users)) {
      if (key.toLowerCase() === PERMANENT_ADMIN_EMAIL) continue;
      delete store.users[key];
      deletedCount++;
    }
    // Remove stale non-admin logs on full wipe and record clean summary
    store.loginLogs = (store.loginLogs || []).filter(
      (l) => l.email.toLowerCase() === PERMANENT_ADMIN_EMAIL
    );
    recordLoginAudit(store, {
      email: PERMANENT_ADMIN_EMAIL,
      name: store.adminSettings.displayName,
      action: 'admin_action',
      status: 'info',
      detail: `Deleted all non-admin users (${deletedCount} account(s) removed)`,
      ip: getClientIp(req),
      device: 'Admin Portal',
    });
  } else if (Array.isArray(emails) && emails.length > 0) {
    for (const rawEmail of emails) {
      const cleanKey = String(rawEmail || '').trim().toLowerCase();
      if (!cleanKey || cleanKey === PERMANENT_ADMIN_EMAIL) continue;
      if (store.users[cleanKey]) {
        delete store.users[cleanKey];
        deletedCount++;
      }
    }
    recordLoginAudit(store, {
      email: PERMANENT_ADMIN_EMAIL,
      name: store.adminSettings.displayName,
      action: 'admin_action',
      status: 'info',
      detail: `Bulk deleted ${deletedCount} selected subscriber account(s)`,
      ip: getClientIp(req),
      device: 'Admin Portal',
    });
  } else {
    return res.status(400).json({ error: 'Provide emails array or deleteAll: true.' });
  }

  saveAuthStore(store);
  return res.json({
    ok: true,
    deletedCount,
    remainingUsers: Object.keys(store.users).length,
  });
});

app.post('/api/admin/enforce-expired-trials', requireAdminMiddleware, (req, res) => {
  const store = loadAuthStore();
  const now = Date.now();
  let restrictedCount = 0;

  for (const user of Object.values(store.users)) {
    if (user.email.toLowerCase() === PERMANENT_ADMIN_EMAIL || user.role === 'admin') continue;
    const isTrialEnded =
      user.planId === 'trial' &&
      user.paymentStatus !== 'paid' &&
      user.expiresAt !== null &&
      now > user.expiresAt;
    if (isTrialEnded && (user.status !== 'restricted' || !user.restrictedByAdmin)) {
      user.status = 'restricted';
      user.paymentStatus = 'unpaid';
      user.restrictedByAdmin = true;
      user.restrictedReason = '3-Day Free Trial Ended — Upgrade to Paid Plan';
      user.updatedAt = now;
      restrictedCount++;
      recordLoginAudit(store, {
        email: user.email,
        name: user.name,
        action: 'blocked_expired',
        status: 'blocked',
        detail: 'Batch enforcement locked ended 3-Day Free Trial user',
        planId: user.planId,
        paymentStatus: 'unpaid',
        ip: getClientIp(req),
        device: 'Admin Portal',
      });
    }
  }

  saveAuthStore(store);
  return res.json({ ok: true, restrictedCount });
});

app.post('/api/admin/profile', requireAdminMiddleware, (req, res) => {
  const { displayName, notificationEmail, newPassword, currentPassword, regenerateRecoveryKey } = req.body || {};
  const store = loadAuthStore();
  if (typeof displayName === 'string' && displayName.trim()) {
    store.adminSettings.displayName = displayName.trim();
  }
  if (typeof notificationEmail === 'string' && notificationEmail.includes('@')) {
    store.adminSettings.notificationEmail = notificationEmail.trim().toLowerCase();
  }
  if (typeof newPassword === 'string' && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ error: 'New admin password must be at least 6 characters.' });
    }
    if (currentPassword && store.adminSettings.passwordHash && !verifyPassword(String(currentPassword), store.adminSettings.passwordHash)) {
      return res.status(403).json({ error: 'Current password did not match.' });
    }
    store.adminSettings.passwordHash = hashPassword(newPassword.trim());
  }
  if (regenerateRecoveryKey === true) {
    store.adminSettings.recoveryKey = `ZW-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  recordLoginAudit(store, {
    email: PERMANENT_ADMIN_EMAIL,
    name: store.adminSettings.displayName,
    action: 'admin_action',
    status: 'info',
    detail: newPassword
      ? 'Updated Admin profile & reset Admin password'
      : regenerateRecoveryKey
        ? 'Regenerated Master Admin Recovery Key'
        : 'Updated Admin profile details',
    ip: getClientIp(req),
    device: 'Admin Portal',
  });
  saveAuthStore(store);
  return res.json({
    ok: true,
    adminProfile: {
      displayName: store.adminSettings.displayName,
      notificationEmail: store.adminSettings.notificationEmail,
      recoveryKey: store.adminSettings.recoveryKey || DEFAULT_ADMIN_RECOVERY_KEY,
    },
  });
});

// Endpoint: Synthesize a full lecture as ONE unbroken human male voice WAV track with pause-aligned captions
app.post('/api/tts/lecture', async (req, res) => {
  try {
    const {
      sentences,
    } = req.body;

    if (!Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'sentences array is required' });
    }

    const cleanSentences = sentences.map((s) => String(s || '').trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      return res.status(400).json({ error: 'sentences cannot be empty' });
    }

    // Always lock voice & studio tone across every tab, browser, and mobile device
    const resolvedVoice = CANONICAL_FENRIR_VOICE;
    const style = DEFAULT_CALM_STYLE;
    const rawKey = `lecture_${resolvedVoice}_${cleanSentences.join(' | ')}`;

    if (lectureTtsCache.has(rawKey)) {
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.json({ ...lectureTtsCache.get(rawKey)!, voice: resolvedVoice, cached: true });
    }

    const diskHit = readDiskCacheJson<CachedLectureAudio>('lec', rawKey);
    if (diskHit?.audio) {
      lectureTtsCache.set(rawKey, diskHit);
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.json({ ...diskHit, voice: resolvedVoice, cached: true });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini client unavailable' });
    }

    let pending = lectureInFlight.get(rawKey);
    if (!pending) {
      pending = (async () => {
        await acquireTtsSlot();
        try {
          // Join sentences cleanly so the speaker breathes naturally between points
          const combinedScript = cleanSentences.join(' ... ');
          const result = await generateTtsWithRetry(ai, combinedScript, resolvedVoice, style);
          if (!result.audio) {
            return {
              errorDetail: result.errorDetail || 'No audio returned',
              statusCode: result.statusCode || 502,
            };
          }
          const { duration, sentenceTimings } = parseWavInfoAndAlignSentences(result.audio, cleanSentences);
          const payload: CachedLectureAudio = {
            audio: result.audio,
            mimeType: 'audio/wav',
            duration,
            sentenceTimings,
          };
          return payload;
        } finally {
          releaseTtsSlot();
        }
      })();
      lectureInFlight.set(rawKey, pending);
    }

    const result = await pending;
    lectureInFlight.delete(rawKey);

    if ('errorDetail' in result) {
      return res.status(result.statusCode).json({
        error: result.statusCode === 429 ? 'Daily speech synthesis quota reached' : 'Speech generation failed',
        detail: result.errorDetail,
      });
    }

    if (lectureTtsCache.size > 100) {
      const firstKey = lectureTtsCache.keys().next().value;
      if (firstKey) lectureTtsCache.delete(firstKey);
    }
    lectureTtsCache.set(rawKey, result);
    writeDiskCacheJson('lec', rawKey, result);

    return res.json({ ...result, cached: false });
  } catch (err: any) {
    console.error('Error generating lecture speech:', err);
    return res.status(500).json({
      error: 'Lecture TTS failed: ' + (err?.message || String(err)),
    });
  }
});

// Endpoint: Single-line TTS (disk + memory cached, shares consistent Fenrir voice)
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
    } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim();
    const resolvedVoice = CANONICAL_FENRIR_VOICE;
    const style = DEFAULT_CALM_STYLE;
    const cacheKey = `${resolvedVoice}_${cleanText}`;

    if (ttsAudioCache.has(cacheKey)) {
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.json({
        audio: ttsAudioCache.get(cacheKey),
        mimeType: 'audio/wav',
        voice: resolvedVoice,
        cached: true,
      });
    }

    const diskHit = readDiskCacheJson<{ audio: string }>('tts', cacheKey);
    if (diskHit?.audio) {
      ttsAudioCache.set(cacheKey, diskHit.audio);
      res.setHeader('Cache-Control', 'private, max-age=86400');
      return res.json({
        audio: diskHit.audio,
        mimeType: 'audio/wav',
        voice: resolvedVoice,
        cached: true,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini client unavailable' });
    }

    let pending = ttsInFlight.get(cacheKey);
    if (!pending) {
      pending = (async () => {
        await acquireTtsSlot();
        try {
          return await generateTtsWithRetry(ai, cleanText, resolvedVoice, style);
        } finally {
          releaseTtsSlot();
        }
      })();
      ttsInFlight.set(cacheKey, pending);
    }

    const result = await pending;
    ttsInFlight.delete(cacheKey);

    if (!result.audio) {
      return res.status(result.statusCode || 502).json({
        error: result.statusCode === 429 ? 'Daily speech synthesis quota reached' : 'No audio returned from speech model',
        detail: result.errorDetail,
      });
    }

    if (ttsAudioCache.size > 1000) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, result.audio);
    writeDiskCacheJson('tts', cacheKey, { audio: result.audio });

    return res.json({
      audio: result.audio,
      mimeType: 'audio/wav',
      cached: false,
    });
  } catch (err: any) {
    console.error('Error generating speech with Gemini TTS:', err);
    return res.status(500).json({
      error: 'TTS generation failed: ' + (err?.message || String(err)),
    });
  }
});

// Endpoint: Lecture AI Assistant Question Answering
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question, lectureTitle, context } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        answer: `Regarding "${lectureTitle || 'Zero Waste Culinary Protocol'}": Focus on strict tare-weight station separation, pH control (<4.6 for fermentations), and turning vegetable trims into high-margin reductions or stocks. For detailed review, email supritam.basu@supritamone.com.`,
      });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `You are Dr. Chef Supritam Basu's teaching assistant for Supritamone Academy. Answer concisely and practically in 2-4 sentences.\nLecture: ${lectureTitle || ''}\nSlide Context: ${context || ''}\nStudent Question: ${question}`,
    });
    return res.json({
      answer: response.text || 'Please apply the station tare-weight and circular repurposing formula shown on the current slide.',
    });
  } catch {
    return res.json({
      answer: 'Apply the tare-weight audit benchmark and circular recovery formula shown in the active slide deck. You can also reach instructor support at supritam.basu@supritamone.com.',
    });
  }
});

// Endpoint: Generate / Expand Course Module using Gemini
app.post('/api/ai/generate-module', async (req, res) => {
  try {
    const { topic, context, newsletterNumber, targetAudience } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API Key is not configured on the server. You can still use the built-in 12 modules and pre-compiled newsletter curriculum.',
      });
    }

    const prompt = `You are a Master Culinary Educator and Sustainability Specialist designing an accredited Alison Diploma course module based on "The Zero Waste Kitchen" newsletter series (newsletter #${newsletterNumber || 'special issue'}: "${topic}").
Context notes provided: ${context || 'None'}.
Target Audience: ${targetAudience || 'Culinary students, home cooks, chefs, and hospitality managers'}.

Create a comprehensive Alison-format course module in valid JSON with this exact structure:
{
  "title": "Module Title matching Alison formatting (e.g., 'Module X: Root-to-Stem Vegetable Utilization')",
  "shortDescription": "2-3 sentence overview of why this culinary waste minimization technique matters.",
  "learningOutcomes": [
    "5 to 6 Bloom's Taxonomy learning outcomes starting with action verbs like 'Instruct', 'Develop', 'Identify', 'Describe', 'Formulate', 'Calculate'",
    "...",
    "..."
  ],
  "lessons": [
    {
      "id": "lesson-1",
      "title": "Topic 1: Clear Descriptive Lesson Title",
      "readTimeMinutes": 8,
      "sections": [
        {
          "heading": "Conceptual Foundation",
          "content": "In-depth instructional text detailing scientific principles, safety thresholds, and culinary techniques."
        },
        {
          "heading": "Actionable Scrap Conversion Formula & Technique",
          "content": "Step-by-step practical kitchen execution formula (e.g. ratios, curing percentages, blanching temperatures)."
        },
        {
          "heading": "Practical Master Recipe / Scrap Blueprint",
          "content": "A high-utility recipe or preservation protocol utilizing what is normally discarded."
        }
      ],
      "scrapWasteMetrics": {
        "wasteDivertedPercentage": "85%",
        "householdAnnualSavingsUSD": "$320",
        "co2ReductionKg": "14.2 kg"
      },
      "keyTakeaways": [
        "Takeaway bullet 1",
        "Takeaway bullet 2",
        "Takeaway bullet 3"
      ]
    },
    {
      "id": "lesson-2",
      "title": "Topic 2: Secondary Advanced Technique",
      "readTimeMinutes": 7,
      "sections": [
        {
          "heading": "Culinary Methodology",
          "content": "Detailed instructional text."
        },
        {
          "heading": "Storage & Food Safety Controls",
          "content": "Safe temperature ranges, acidity requirements (pH < 4.6), moisture activity, and sanitation."
        }
      ],
      "scrapWasteMetrics": {
        "wasteDivertedPercentage": "90%",
        "householdAnnualSavingsUSD": "$210",
        "co2ReductionKg": "9.8 kg"
      },
      "keyTakeaways": [
        "Takeaway bullet 1",
        "Takeaway bullet 2"
      ]
    }
  ],
  "assessment": {
    "title": "Module Assessment: Knowledge Check",
    "passingGrade": 80,
    "questions": [
      {
        "id": "q1",
        "question": "Realistic scenario or knowledge question based on the lessons?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Clear pedagogical explanation of why this answer is correct."
      },
      {
        "id": "q2",
        "question": "Second realistic scenario question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 1,
        "explanation": "Pedagogical explanation."
      },
      {
        "id": "q3",
        "question": "Third food safety or culinary calculation question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 2,
        "explanation": "Pedagogical explanation."
      }
    ]
  }
}

Respond ONLY with valid JSON. Do not include markdown blocks or other text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error generating module with Gemini:', err);
    return res.status(500).json({
      error: 'Failed to generate course module: ' + (err.message || String(err)),
    });
  }
});

// Setup Vite Dev Server or Production Static Serving
async function startServer() {
  // Intercept incoming document navigations arriving from https://zerowaste.supritamone.com/
  // and immediately issue a signed HttpOnly SSO session cookie so members never have to log in again.
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api/') &&
      !req.path.startsWith('/assets/') &&
      !req.path.startsWith('/@') &&
      !req.path.startsWith('/src/') &&
      !req.path.startsWith('/node_modules/')
    ) {
      const headerReferrer = String(req.headers.referer || req.headers.referrer || '');
      const fromQuery = req.query.from || req.query.source || req.query.ref || req.query.partner || (req.query.sso ? 'partner_sso' : '');
      const isPartnerArrival = isPartnerOriginUrl(headerReferrer) || isPartnerQueryIndicator(fromQuery);
      if (isPartnerArrival) {
        const cookies = parseCookies(req.headers.cookie);
        const existingValid = verifySessionToken(cookies[SESSION_COOKIE_NAME] || '');
        if (!existingValid) {
          const result = issuePartnerRedirectSession({
            email: typeof req.query.email === 'string' ? req.query.email : undefined,
            name: typeof req.query.name === 'string' ? req.query.name : undefined,
            planId: typeof req.query.plan === 'string' ? req.query.plan : undefined,
            ip: getClientIp(req),
            device: getDeviceSummary(req),
          });
          if (result.token) {
            setSessionCookie(req, res, result.token);
          }
        }
      }
    }
    next();
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
