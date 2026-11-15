import { signInWithPopup, signOut } from 'firebase/auth';
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
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';

const PERMANENT_ADMIN_EMAIL = 'supritamone@gmail.com';
const BOOTSTRAP_ADMIN_EMAILS = new Set(['supritamone@gmail.com', 'basueats@gmail.com']);
const DAY_MS = 24 * 60 * 60 * 1000;

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

export async function signInWithGoogleAndSyncFirestore(): Promise<{
  uid: string;
  email: string;
  name: string;
  idToken: string;
  record: FirestoreUserRecord;
  isLocked: boolean;
  lockReason?: string;
}> {
  const credential = await signInWithGooglePopupRobust();
  const fbUser = credential.user;
  const uid = fbUser.uid;
  const email = (fbUser.email || '').trim().toLowerCase();
  const displayName = (fbUser.displayName || email.split('@')[0] || 'Zero Waste Chef').trim().slice(0, 120);
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
  const device = detectClientDevice();

  let finalRecord: FirestoreUserRecord;
  let isLocked = false;
  let lockReason: string | undefined;

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

    const nextCount = Number(existingData.loginCount || 0) + 1;
    try {
      await updateDoc(userRef, {
        name: displayName || String(existingData.name || 'Zero Waste Chef'),
        lastLoginAt: now,
        loginCount: nextCount,
        lastIp: 'Google OAuth',
        deviceInfo: device,
        updatedAt: serverTimestamp(),
      });
      if (isExpired && existingData.status !== 'restricted') {
        await updateDoc(userRef, {
          status: 'restricted',
          restrictedByAdmin: true,
          restrictedReason: lockReason || 'Plan Expired — Auto-Restricted',
          updatedAt: serverTimestamp(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `academy_users/${uid}`);
    }

    finalRecord = {
      uid,
      email,
      name: displayName || String(existingData.name || 'Zero Waste Chef'),
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
      lastLoginAt: now,
      loginCount: nextCount,
      lastIp: 'Google OAuth',
      deviceInfo: device,
      createdAtMs: toEpochMs(existingData.createdAt, now),
      updatedAtMs: now,
    };
  }

  // Record real-time login audit log in Firestore
  const logId = sanitizeDocId(`log_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`);
  try {
    await setDoc(doc(db, 'academy_logs', logId), {
      uid,
      email,
      name: finalRecord.name,
      action: !existingData && !isAdminEmail ? 'trial_started' : 'login',
      status: isLocked ? 'blocked' : 'success',
      detail: isLocked
        ? `Google Sign-In while auto-restricted (${finalRecord.planTitle} locked)`
        : !existingData && !isAdminEmail
          ? 'Started 3-Day Free Trial via Google Sign-In'
          : `Google Sign-In (${finalRecord.planTitle})`,
      planId: finalRecord.planId,
      paymentStatus: finalRecord.paymentStatus,
      ip: 'Google OAuth',
      device,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `academy_logs/${logId}`);
  }

  return { uid, email, name: finalRecord.name, idToken, record: finalRecord, isLocked, lockReason };
}

export async function connectAdminGoogleCloud(): Promise<{ email: string; name: string }> {
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
  return {
    email,
    name: credential.user.displayName || 'Master Admin',
  };
}

export function subscribeAdminFirestore(
  onUsers: (users: FirestoreUserRecord[]) => void,
  onLogs: (logs: FirestoreLogRecord[]) => void
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
    return true;
  } catch (err) {
    console.warn('Firestore admin update skipped:', err);
    return false;
  }
}
