import { signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

const PERMANENT_ADMIN_EMAIL = 'supritamone@gmail.com';
const BOOTSTRAP_ADMIN_EMAILS = new Set(['supritamone@gmail.com', 'basueats@gmail.com']);
const DAY_MS = 24 * 60 * 60 * 1000;

export function isAuthorizedAdminEmail(email?: string | null): boolean {
  const clean = String(email || '').trim().toLowerCase();
  return Boolean(clean && BOOTSTRAP_ADMIN_EMAILS.has(clean));
}

export async function getCurrentFirebaseIdToken(): Promise<string> {
  if (!auth.currentUser) return '';
  try {
    return await auth.currentUser.getIdToken();
  } catch {
    return '';
  }
}

export interface FirestoreUserRecord {
  uid: string;
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
  restrictedByAdmin: boolean;
  restrictedReason?: string;
  expiresAt: number | null;
  transactionRef?: string;
  source?: string;
  lastLoginAt?: number | null;
  loginCount: number;
  lastIp?: string;
  deviceInfo?: string;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface FirestoreLogRecord {
  id: string;
  uid: string;
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

function toEpochMs(val: unknown, fallback: number): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'toMillis' in val && typeof (val as { toMillis?: unknown }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  return fallback;
}

function detectClientDevice(): string {
  if (typeof navigator === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent || '';
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

export function sanitizeDocId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128) || 'user';
}

function clearPopupOriginValidationCache(): void {
  try {
    const authInternal = auth as unknown as {
      _popupRedirectResolver?: {
        originValidationPromises?: Record<string, Promise<void>>;
      };
      _key?: () => string;
    };
    const promises = authInternal?._popupRedirectResolver?.originValidationPromises;
    if (promises && typeof promises === 'object') {
      const key = typeof authInternal._key === 'function' ? authInternal._key() : '';
      if (key && key in promises) {
        delete promises[key];
      } else {
        for (const k of Object.keys(promises)) {
          delete promises[k];
        }
      }
    }
  } catch {
    // Ignore internal SDK property differences across versions
  }
}

async function isCurrentHostAuthorizedLive(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.location?.hostname) return false;
  const apiKey = auth.app?.options?.apiKey;
  if (!apiKey) return false;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(apiKey)}&_t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { authorizedDomains?: unknown };
    if (!Array.isArray(data.authorizedDomains)) return false;
    const host = window.location.hostname.toLowerCase();
    return data.authorizedDomains.some((d) => {
      const domain = String(d || '').toLowerCase();
      return domain === host || host.endsWith(`.${domain}`);
    });
  } catch {
    return false;
  }
}

async function signInWithGooglePopupRobust() {
  clearPopupOriginValidationCache();
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err ? String((err as { code?: unknown }).code || '') : '';
    const message = err instanceof Error ? err.message : String(err || '');
    if (code.includes('unauthorized-domain') || message.includes('unauthorized-domain')) {
      clearPopupOriginValidationCache();
      const authorizedNow = await isCurrentHostAuthorizedLive();
      if (authorizedNow) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        clearPopupOriginValidationCache();
        return await signInWithPopup(auth, googleProvider);
      }
    }
    throw err;
  }
}

export function formatFirebaseAuthError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err ? String((err as { code?: unknown }).code || '') : '';
  const message = err instanceof Error ? err.message : String(err || '');
  const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'this domain';

  if (code.includes('unauthorized-domain') || message.includes('unauthorized-domain')) {
    return `Google Sign-In rejected domain "${host}" (auth/unauthorized-domain). Verify "${host}" is saved under Firebase Console / Identity Platform (Project: magnetic-cumulus-jt8c4) -> Authorized domains, then hard-refresh this page (Ctrl+F5). Meanwhile, you can sign in above with your Email & Password.`;
  }
  if (code.includes('web-storage-unsupported') || message.includes('web-storage-unsupported')) {
    return 'Your browser shields or third-party cookie settings blocked Google Sign-In storage. Allow popups/cookies for this site or sign in above with Email & Password.';
  }
  if (code.includes('popup-blocked') || message.includes('popup-blocked')) {
    return 'Google Sign-In popup was blocked by your browser. Please allow popups for this site or sign in with your Email & Password.';
  }
  if (code.includes('popup-closed-by-user') || message.includes('popup-closed-by-user')) {
    return 'Google Sign-In window was closed before completing sign-in.';
  }
  if (code.includes('cancelled-popup-request') || message.includes('cancelled-popup-request')) {
    return 'Another Google Sign-In window is already open. Complete that popup or try again.';
  }
  return message || 'Google sign-in was cancelled or unavailable.';
}

export async function syncFirebaseUserRecord(
  fbUser: FirebaseUser,
  options: { throttleMinutes?: number; forceLog?: boolean } = {}
): Promise<{
  uid: string;
  email: string;
  name: string;
  idToken: string;
  record: FirestoreUserRecord;
  isLocked: boolean;
  lockReason?: string;
}> {
  const uid = fbUser.uid;
  const email = (fbUser.email || '').trim().toLowerCase().slice(0, 200);
  const rawDisplay = (fbUser.displayName || '').trim();
  const displayName = (rawDisplay || email.split('@')[0] || 'Zero Waste Chef').slice(0, 120);
  const idToken = await fbUser.getIdToken();
  const now = Date.now();
  const userRef = doc(db, 'academy_users', uid);

  let existingData: Record<string, unknown> | null = null;
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      existingData = snap.data() as Record<string, unknown>;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `academy_users/${uid}`);
  }

  const isAdminEmail = email === PERMANENT_ADMIN_EMAIL || BOOTSTRAP_ADMIN_EMAILS.has(email);
  const device = detectClientDevice().slice(0, 120);

  let finalRecord: FirestoreUserRecord;
  let isLocked = false;
  let lockReason: string | undefined;
  let shouldWriteLog = options.forceLog !== false;

  if (!existingData) {
    const planId = isAdminEmail ? 'admin' : 'trial';
    const planTitle = isAdminEmail ? 'Permanent Executive Admin Access' : '3-Day Free Trial ($0 / 72h)';
    const paymentStatus = isAdminEmail ? 'admin' : 'trial';
    const expiresAt = isAdminEmail ? null : now + 3 * DAY_MS;

    const payload = {
      uid,
      email,
      name: displayName,
      role: isAdminEmail ? 'admin' : 'member',
      planId,
      planTitle,
      paymentStatus,
      amountPaid: 0,
      currency: 'USD',
      workPlace: '',
      designation: '',
      status: 'active',
      restrictedByAdmin: false,
      expiresAt,
      transactionRef: isAdminEmail ? 'ADM-ROOT' : `TRIAL-${now.toString(36).toUpperCase()}`,
      source: 'google_signin',
      lastLoginAt: now,
      loginCount: 1,
      lastIp: 'Google OAuth',
      deviceInfo: device,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(userRef, payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `academy_users/${uid}`);
    }

    finalRecord = {
      ...payload,
      role: isAdminEmail ? 'admin' : 'member',
      planId,
      paymentStatus,
      status: 'active',
      createdAtMs: now,
      updatedAtMs: now,
    };
  } else {
    const existingRole = existingData.role === 'admin' || isAdminEmail ? 'admin' : 'member';
    const existingExpiresAt =
      existingRole === 'admin'
        ? null
        : typeof existingData.expiresAt === 'number'
          ? existingData.expiresAt
          : null;
    const isExpired = existingRole !== 'admin' && existingExpiresAt !== null && now > existingExpiresAt;
    const isAdminRestricted =
      existingRole !== 'admin' &&
      (existingData.status === 'restricted' || existingData.status === 'expired' || existingData.restrictedByAdmin === true);
    isLocked = isExpired || isAdminRestricted;
    const existingPlanTitle = String(existingData.planTitle || 'Academy Membership');
    const existingPlanId = String(existingData.planId || 'trial') as FirestoreUserRecord['planId'];

    if (isLocked) {
      lockReason =
        (typeof existingData.restrictedReason === 'string' && existingData.restrictedReason) ||
        (existingPlanId === 'trial'
          ? 'Your 3-Day Free Trial has ended — All academy features are auto-locked. Upgrade to a paid plan to restore access.'
          : `Your ${existingPlanTitle} period has ended — All academy features are auto-locked. Renew to restore access.`);
    }

    const throttleMs = Math.max(0, Number(options.throttleMinutes || 0)) * 60 * 1000;
    const prevLoginAt = typeof existingData.lastLoginAt === 'number' ? existingData.lastLoginAt : 0;
    const withinThrottle = throttleMs > 0 && now - prevLoginAt < throttleMs;
    if (withinThrottle && options.forceLog !== true) {
      shouldWriteLog = false;
    }

    const nextCount = shouldWriteLog ? Number(existingData.loginCount || 0) + 1 : Number(existingData.loginCount || 1);
    const resolvedName = (displayName || String(existingData.name || 'Zero Waste Chef')).trim().slice(0, 120) || 'Zero Waste Chef';
    try {
      if (shouldWriteLog) {
        await updateDoc(userRef, {
          name: resolvedName,
          lastLoginAt: now,
          loginCount: nextCount,
          lastIp: 'Google OAuth',
          deviceInfo: device,
          updatedAt: serverTimestamp(),
        });
      }
      if (isExpired && existingData.status !== 'restricted') {
        await updateDoc(userRef, {
          status: 'restricted',
          restrictedByAdmin: true,
          restrictedReason: (lockReason || 'Plan Expired — Auto-Restricted').slice(0, 300),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `academy_users/${uid}`);
    }

    finalRecord = {
      uid,
      email,
      name: resolvedName,
      role: existingRole,
      planId: existingPlanId,
      planTitle: existingPlanTitle,
      paymentStatus: (isLocked && existingRole !== 'admin' ? 'unpaid' : String(existingData.paymentStatus || 'trial')) as FirestoreUserRecord['paymentStatus'],
      amountPaid: Number(existingData.amountPaid || 0),
      currency: String(existingData.currency || 'USD'),
      workPlace: String(existingData.workPlace || ''),
      designation: String(existingData.designation || ''),
      chefSeats: typeof existingData.chefSeats === 'number' ? existingData.chefSeats : null,
      status: isLocked ? 'restricted' : (String(existingData.status || 'active') as FirestoreUserRecord['status']),
      restrictedByAdmin: isLocked ? true : Boolean(existingData.restrictedByAdmin),
      restrictedReason: lockReason,
      expiresAt: existingExpiresAt,
      transactionRef: String(existingData.transactionRef || ''),
      source: String(existingData.source || 'google_signin'),
      lastLoginAt: shouldWriteLog ? now : prevLoginAt || now,
      loginCount: nextCount,
      lastIp: 'Google OAuth',
      deviceInfo: device,
      createdAtMs: toEpochMs(existingData.createdAt, now),
      updatedAtMs: now,
    };
  }

  // Record real-time login audit log in Firestore
  if (shouldWriteLog) {
    const logId = sanitizeDocId(`log_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    try {
      await setDoc(doc(db, 'academy_logs', logId), {
        uid,
        email,
        name: finalRecord.name.slice(0, 120) || 'Zero Waste Chef',
        action: !existingData && !isAdminEmail ? 'trial_started' : 'login',
        status: isLocked ? 'blocked' : 'success',
        detail: (isLocked
          ? `Google Sign-In while auto-restricted (${finalRecord.planTitle} locked)`
          : !existingData && !isAdminEmail
            ? 'Started 3-Day Free Trial via Google Sign-In'
            : `Google Sign-In (${finalRecord.planTitle})`).slice(0, 400),
        planId: String(finalRecord.planId || 'trial').slice(0, 40),
        paymentStatus: String(finalRecord.paymentStatus || 'trial').slice(0, 40),
        ip: 'Google OAuth',
        device,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `academy_logs/${logId}`);
    }
  }

  return { uid, email, name: finalRecord.name, idToken, record: finalRecord, isLocked, lockReason };
}

export async function signInWithGoogleAndSyncFirestore() {
  const credential = await signInWithGooglePopupRobust();
  return await syncFirebaseUserRecord(credential.user, { forceLog: true });
}

export async function syncReturningGoogleUserIfNeeded(fbUser: FirebaseUser) {
  return await syncFirebaseUserRecord(fbUser, { throttleMinutes: 15, forceLog: false });
}

export async function connectAdminGoogleCloud(): Promise<{ email: string; name: string; idToken: string }> {
  const credential = await signInWithGooglePopupRobust();
  const email = (credential.user.email || '').trim().toLowerCase();
  if (!BOOTSTRAP_ADMIN_EMAILS.has(email)) {
    // Check admins/{uid} collection before rejecting
    const adminDoc = await getDoc(doc(db, 'admins', credential.user.uid)).catch(() => null);
    if (!adminDoc || !adminDoc.exists()) {
      await signOut(auth).catch(() => {});
      throw new Error(`Google account ${email} is not authorized as an Academy Admin.`);
    }
  }
  const idToken = await credential.user.getIdToken();
  return {
    email,
    name: credential.user.displayName || 'Master Admin',
    idToken,
  };
}

export function subscribeAdminFirestore(
  onUsers: (users: FirestoreUserRecord[]) => void,
  onLogs: (logs: FirestoreLogRecord[]) => void,
  onError?: (err: Error) => void
): () => void {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return () => {};
  }

  const unsubUsers = onSnapshot(
    collection(db, 'academy_users'),
    (snap) => {
      const now = Date.now();
      const mapped: FirestoreUserRecord[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        const role = raw.role === 'admin' ? 'admin' : 'member';
        const expiresAt = role === 'admin' ? null : typeof raw.expiresAt === 'number' ? raw.expiresAt : null;
        const expiredNow = role !== 'admin' && expiresAt !== null && now > expiresAt;
        return {
          uid: String(raw.uid || d.id),
          email: String(raw.email || '').toLowerCase(),
          name: String(raw.name || 'Chef Member'),
          role,
          planId: String(raw.planId || 'trial') as FirestoreUserRecord['planId'],
          planTitle: String(raw.planTitle || 'Verified Member'),
          paymentStatus: (expiredNow ? 'unpaid' : String(raw.paymentStatus || 'trial')) as FirestoreUserRecord['paymentStatus'],
          amountPaid: Number(raw.amountPaid || 0),
          currency: String(raw.currency || 'USD'),
          workPlace: String(raw.workPlace || ''),
          designation: String(raw.designation || ''),
          chefSeats: typeof raw.chefSeats === 'number' ? raw.chefSeats : null,
          status: (expiredNow ? 'restricted' : String(raw.status || 'active')) as FirestoreUserRecord['status'],
          restrictedByAdmin: expiredNow ? true : Boolean(raw.restrictedByAdmin),
          restrictedReason:
            typeof raw.restrictedReason === 'string'
              ? raw.restrictedReason
              : expiredNow
                ? 'Membership / Trial Ended — Auto-Locked'
                : undefined,
          expiresAt,
          transactionRef: String(raw.transactionRef || ''),
          source: String(raw.source || ''),
          lastLoginAt: typeof raw.lastLoginAt === 'number' ? raw.lastLoginAt : null,
          loginCount: Number(raw.loginCount || 0),
          lastIp: String(raw.lastIp || ''),
          deviceInfo: String(raw.deviceInfo || ''),
          createdAtMs: toEpochMs(raw.createdAt, now),
          updatedAtMs: toEpochMs(raw.updatedAt, now),
        };
      });
      onUsers(mapped);
    },
    (err) => {
      console.warn('Firestore users listener notice:', err.message);
      onError?.(err);
    }
  );

  const logsQ = query(collection(db, 'academy_logs'), orderBy('timestamp', 'desc'), limit(250));
  const unsubLogs = onSnapshot(
    logsQ,
    (snap) => {
      const now = Date.now();
      const mapped: FirestoreLogRecord[] = snap.docs.map((d) => {
        const raw = d.data() as Record<string, unknown>;
        return {
          id: d.id,
          uid: String(raw.uid || ''),
          email: String(raw.email || '').toLowerCase(),
          name: String(raw.name || ''),
          action: String(raw.action || 'login'),
          status: (raw.status === 'blocked' || raw.status === 'info' ? raw.status : 'success') as FirestoreLogRecord['status'],
          detail: String(raw.detail || ''),
          planId: typeof raw.planId === 'string' ? raw.planId : undefined,
          paymentStatus: typeof raw.paymentStatus === 'string' ? raw.paymentStatus : undefined,
          ip: typeof raw.ip === 'string' ? raw.ip : undefined,
          device: typeof raw.device === 'string' ? raw.device : undefined,
          timestamp: toEpochMs(raw.timestamp, now),
        };
      });
      onLogs(mapped);
    },
    (err) => {
      console.warn('Firestore logs listener notice:', err.message);
      onError?.(err);
    }
  );

  return () => {
    unsubUsers();
    unsubLogs();
  };
}

export async function adminMutateFirestoreUser(
  uidOrEmail: string,
  action: 'approve_paid' | 'mark_unpaid' | 'restrict' | 'expire_trial' | 'extend_trial' | 'unrestrict' | 'delete',
  extra?: { planId?: string; reason?: string; trialDays?: number }
): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    const snap = await getDocs(collection(db, 'academy_users'));
    const targetDoc = snap.docs.find((d) => {
      const data = d.data();
      return d.id === uidOrEmail || String(data.email || '').toLowerCase() === uidOrEmail.toLowerCase();
    });
    if (!targetDoc) return false;

    if (action === 'delete') {
      await deleteDoc(targetDoc.ref);
      return true;
    }

    const now = Date.now();
    const cur = targetDoc.data();
    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (action === 'approve_paid') {
      const plan = extra?.planId || (cur.planId === 'trial' ? 'individual' : cur.planId) || 'individual';
      updates.planId = plan;
      updates.planTitle =
        plan === 'team'
          ? 'Team Brigade Plan'
          : plan === 'training'
            ? 'EXECUTIVE ADVISORY · Training ($1499/5 chefs/yr)'
            : 'Individual Annual Plan ($99/yr)';
      updates.paymentStatus = 'paid';
      updates.amountPaid = Math.max(Number(cur.amountPaid || 0), plan === 'training' ? 1499 : plan === 'team' ? 395 : 99);
      updates.status = 'active';
      updates.restrictedByAdmin = false;
      updates.restrictedReason = '';
      updates.expiresAt = now + 365 * DAY_MS;
    } else if (action === 'mark_unpaid') {
      updates.paymentStatus = 'unpaid';
      updates.amountPaid = 0;
    } else if (action === 'restrict') {
      updates.status = 'restricted';
      updates.restrictedByAdmin = true;
      updates.restrictedReason = extra?.reason || 'Access restricted by Administrator';
    } else if (action === 'expire_trial') {
      updates.status = 'restricted';
      updates.paymentStatus = 'unpaid';
      updates.restrictedByAdmin = true;
      updates.restrictedReason = '3-Day Free Trial Ended — Auto-Locked';
      updates.expiresAt = now - 1000;
    } else if (action === 'extend_trial') {
      const days = Math.max(1, Number(extra?.trialDays || 3));
      const base = typeof cur.expiresAt === 'number' && cur.expiresAt > now ? cur.expiresAt : now;
      updates.planId = 'trial';
      updates.planTitle = '3-Day Free Trial ($0 / 72h)';
      updates.paymentStatus = 'trial';
      updates.status = 'active';
      updates.restrictedByAdmin = false;
      updates.restrictedReason = '';
      updates.expiresAt = base + days * DAY_MS;
    } else if (action === 'unrestrict') {
      updates.status = 'active';
      updates.restrictedByAdmin = false;
      updates.restrictedReason = '';
      if (!cur.expiresAt || Number(cur.expiresAt) <= now) {
        updates.expiresAt = now + 30 * DAY_MS;
      }
    }

    await updateDoc(targetDoc.ref, updates);

    // Record admin action in Firestore audit logs
    const logId = sanitizeDocId(`log_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    await setDoc(doc(db, 'academy_logs', logId), {
      uid: String(cur.uid || targetDoc.id),
      email: String(cur.email || uidOrEmail).toLowerCase().slice(0, 200),
      name: String(cur.name || 'Chef Member').slice(0, 120) || 'Chef Member',
      action: action === 'expire_trial' ? 'blocked_expired' : action === 'restrict' ? 'blocked_restricted' : 'admin_action',
      status: action === 'restrict' || action === 'expire_trial' ? 'blocked' : 'info',
      detail: `Admin ${action.replace(/_/g, ' ')} applied`.slice(0, 400),
      planId: String(updates.planId || cur.planId || 'trial').slice(0, 40),
      paymentStatus: String(updates.paymentStatus || cur.paymentStatus || 'trial').slice(0, 40),
      ip: 'Admin Portal',
      device: detectClientDevice().slice(0, 120),
      timestamp: serverTimestamp(),
    }).catch(() => {});

    return true;
  } catch (err) {
    console.warn('Firestore admin update skipped:', err);
    return false;
  }
}

export async function adminUpsertFirestoreUser(user: {
  email: string;
  name: string;
  role?: 'admin' | 'member';
  planId: 'admin' | 'trial' | 'individual' | 'team' | 'training' | 'partner_member';
  planTitle: string;
  paymentStatus: 'paid' | 'unpaid' | 'trial' | 'pending_approval' | 'admin';
  amountPaid: number;
  currency?: string;
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
  loginCount?: number;
  lastIp?: string;
  deviceInfo?: string;
}): Promise<boolean> {
  if (!auth.currentUser) return false;
  try {
    const cleanEmail = user.email.trim().toLowerCase().slice(0, 200);
    if (!cleanEmail) return false;
    const snap = await getDocs(collection(db, 'academy_users'));
    const existingDoc = snap.docs.find((d) => String(d.data().email || '').toLowerCase() === cleanEmail);
    const uid = existingDoc?.id || sanitizeDocId(`adm_${cleanEmail}`);
    const now = Date.now();
    const docRef = doc(db, 'academy_users', uid);

    const payload: Record<string, unknown> = {
      uid: existingDoc ? String(existingDoc.data().uid || uid) : uid,
      email: cleanEmail,
      name: (user.name || cleanEmail.split('@')[0] || 'Chef Member').trim().slice(0, 120),
      role: user.role === 'admin' ? 'admin' : 'member',
      planId: user.planId,
      planTitle: (user.planTitle || 'Verified Member').slice(0, 160),
      paymentStatus: user.paymentStatus,
      amountPaid: Number(user.amountPaid || 0),
      currency: (user.currency || 'USD').slice(0, 10),
      workPlace: (user.workPlace || '').slice(0, 160),
      designation: (user.designation || '').slice(0, 120),
      status: user.status,
      restrictedByAdmin: Boolean(user.restrictedByAdmin),
      expiresAt: user.expiresAt ?? null,
      transactionRef: (user.transactionRef || '').slice(0, 120),
      source: (user.source || 'admin_panel_created').slice(0, 120),
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: Number(user.loginCount || 0),
      lastIp: (user.lastIp || 'Admin Portal').slice(0, 80),
      deviceInfo: (user.deviceInfo || 'Admin Registry').slice(0, 120),
      updatedAt: serverTimestamp(),
      createdAt: existingDoc?.data()?.createdAt || serverTimestamp(),
    };
    if (typeof user.chefSeats === 'number') {
      payload.chefSeats = user.chefSeats;
    }
    if (user.restrictedReason) {
      payload.restrictedReason = user.restrictedReason.slice(0, 300);
    }

    await setDoc(docRef, payload, { merge: true });
    const logId = sanitizeDocId(`log_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
    await setDoc(doc(db, 'academy_logs', logId), {
      uid: String(payload.uid),
      email: cleanEmail,
      name: String(payload.name),
      action: 'admin_action',
      status: 'info',
      detail: `Admin synced/created user (${String(payload.planTitle)})`.slice(0, 400),
      planId: String(payload.planId).slice(0, 40),
      paymentStatus: String(payload.paymentStatus).slice(0, 40),
      ip: 'Admin Portal',
      device: detectClientDevice().slice(0, 120),
      timestamp: serverTimestamp(),
    }).catch(() => {});
    return true;
  } catch (err) {
    console.warn('Firestore upsert skipped:', err);
    return false;
  }
}

export async function adminBulkDeleteFirestoreUsers(opts: { emails?: string[]; deleteAll?: boolean }): Promise<number> {
  if (!auth.currentUser) return 0;
  try {
    const snap = await getDocs(collection(db, 'academy_users'));
    const targetEmails = new Set((opts.emails || []).map((e) => e.trim().toLowerCase()));
    const batch = writeBatch(db);
    let count = 0;

    for (const d of snap.docs) {
      const data = d.data();
      const email = String(data.email || '').toLowerCase();
      if (email === PERMANENT_ADMIN_EMAIL || data.role === 'admin') continue;
      if (opts.deleteAll || targetEmails.has(email)) {
        batch.delete(d.ref);
        count++;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (err) {
    console.warn('Firestore bulk delete skipped:', err);
    return 0;
  }
}
