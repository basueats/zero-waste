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

interface StoredAuthUser {
  email: string;
  name: string;
  passwordHash?: string;
  role: 'admin' | 'member';
  planId: 'admin' | 'trial' | 'individual' | 'team' | 'training';
  planTitle: string;
  status: 'active' | 'expired';
  expiresAt: number | null;
  transactionRef?: string;
  source?: string;
  createdAt: number;
  updatedAt: number;
}

interface AuthStoreData {
  users: Record<string, StoredAuthUser>;
}

const SEED_PARTNER_USERS: Array<Omit<StoredAuthUser, 'createdAt' | 'updatedAt'>> = [
  {
    email: 'supritamone@gmail.com',
    name: 'Supritamone Master Admin',
    role: 'admin',
    planId: 'admin',
    planTitle: 'Permanent Executive Admin Access',
    status: 'active',
    expiresAt: null,
    source: 'admin_root',
  },
  {
    email: 'supritam.basu@supritamone.com',
    name: 'Dr. Chef Supritam Basu',
    role: 'admin',
    planId: 'admin',
    planTitle: 'Faculty & Master Executive Admin',
    status: 'active',
    expiresAt: null,
    source: 'admin_faculty',
  },
  {
    email: 'basueats@gmail.com',
    name: 'Supritam Basu',
    role: 'member',
    planId: 'training',
    planTitle: 'Executive Advisory & Training',
    status: 'active',
    expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
    source: 'zerowaste.supritamone.com',
  },
  {
    email: 'culinary.director@grandresort.com',
    name: 'Executive Culinary Director',
    role: 'member',
    planId: 'training',
    planTitle: 'Executive Advisory & Training',
    status: 'active',
    expiresAt: Date.now() + 337 * 24 * 60 * 60 * 1000,
    transactionRef: 'ZN-PAY-9812401',
    source: 'zerowaste.supritamone.com',
  },
  {
    email: 'head.chef@metropolitanhotel.com',
    name: 'Brigade Operations Lead',
    role: 'member',
    planId: 'team',
    planTitle: 'Team Brigade Plan (5+ Chefs)',
    status: 'active',
    expiresAt: Date.now() + 356 * 24 * 60 * 60 * 1000,
    transactionRef: 'ZN-PAY-4491022',
    source: 'zerowaste.supritamone.com',
  },
  {
    email: 'pastry.station@artisanbistro.fr',
    name: 'Pastry & Bakery Supervisor',
    role: 'member',
    planId: 'individual',
    planTitle: 'Individual Chef Annual Plan',
    status: 'active',
    expiresAt: Date.now() + 360 * 24 * 60 * 60 * 1000,
    transactionRef: 'ZN-PAY-7719203',
    source: 'zerowaste.supritamone.com',
  },
  {
    email: 'banquet.prep@cityconvention.org',
    name: 'Banquet Sous Chef',
    role: 'member',
    planId: 'trial',
    planTitle: '3-Day Free Trial',
    status: 'active',
    expiresAt: Date.now() + 2 * 24 * 60 * 60 * 1000,
    source: 'zerowaste.supritamone.com',
  },
  {
    email: 'operations@summitcatering.com',
    name: 'Catering Operations Manager',
    role: 'member',
    planId: 'trial',
    planTitle: '3-Day Free Trial (Ended)',
    status: 'expired',
    expiresAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    source: 'zerowaste.supritamone.com',
  },
];

function loadAuthStore(): AuthStoreData {
  let data: AuthStoreData = { users: {} };
  try {
    if (fs.existsSync(AUTH_STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(AUTH_STORE_PATH, 'utf-8'));
      if (parsed && parsed.users && typeof parsed.users === 'object') {
        data = parsed;
      }
    }
  } catch {
    // Initialize fresh store
  }
  const now = Date.now();
  let modified = false;
  for (const seed of SEED_PARTNER_USERS) {
    const key = seed.email.toLowerCase();
    if (!data.users[key]) {
      data.users[key] = { ...seed, email: key, createdAt: now, updatedAt: now };
      modified = true;
    } else if (key === PERMANENT_ADMIN_EMAIL) {
      // Guarantee supritamone@gmail.com always remains unrestricted active admin
      data.users[key] = {
        ...data.users[key],
        role: 'admin',
        planId: 'admin',
        planTitle: 'Permanent Executive Admin Access',
        status: 'active',
        expiresAt: null,
      };
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

const SESSION_COOKIE_NAME = 'supritamone_academy_session';

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
}) {
  const store = loadAuthStore();
  const rawEmail = String(opts.email || '').trim().toLowerCase();
  const cleanEmail = rawEmail && rawEmail.includes('@') ? rawEmail : 'member@zerowaste.supritamone.com';
  const existing = store.users[cleanEmail];
  const isAdmin = cleanEmail === PERMANENT_ADMIN_EMAIL || existing?.role === 'admin';
  const resolvedName =
    String(opts.name || '').trim() ||
    existing?.name ||
    (cleanEmail === 'member@zerowaste.supritamone.com'
      ? 'Zero Waste Member'
      : (cleanEmail.split('@')[0] || 'Zero Waste Member')
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()));

  const requestedPlan = String(opts.planId || '').trim().toLowerCase();
  const resolvedPlanId = isAdmin ? 'admin' : existing?.planId || requestedPlan || 'partner_member';
  const resolvedPlanTitle = isAdmin
    ? 'Permanent Executive Admin Access'
    : existing?.planTitle || 'Verified Member · zerowaste.supritamone.com';

  // Verified redirect from zerowaste.supritamone.com always grants active unlocked access (never carryover stale expired date)
  const minActiveExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const resolvedExpiry = isAdmin ? null : Math.max(Number(existing?.expiresAt || 0), minActiveExpiry);

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
  if (verified) {
    setSessionCookie(req, res, candidateToken);
    return res.json({
      authenticated: true,
      user: verified,
      token: candidateToken,
    });
  }

  const headerReferrer = String(req.headers.referer || req.headers.referrer || '');
  if (isPartnerOriginUrl(headerReferrer)) {
    const partnerSession = issuePartnerRedirectSession({});
    setSessionCookie(req, res, partnerSession.token);
    return res.json({
      authenticated: true,
      user: partnerSession.user,
      token: partnerSession.token,
    });
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

  const { user, token } = issuePartnerRedirectSession({
    email: email || existingCookieUser?.email,
    name: name || existingCookieUser?.name,
    planId: planId || existingCookieUser?.planId,
  });

  setSessionCookie(req, res, token);
  return res.json({
    authenticated: true,
    user,
    token,
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

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const store = loadAuthStore();
  const now = Date.now();

  // Rule: supritamone@gmail.com MUST ALWAYS have unrestricted Master Admin access
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
    const adminUser = store.users[PERMANENT_ADMIN_EMAIL];
    const sessionPayload = {
      email: PERMANENT_ADMIN_EMAIL,
      name: adminUser?.name || 'Supritamone Master Admin',
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
    return res.status(401).json({
      error:
        'No active membership found for this email. Redirect via https://zerowaste.supritamone.com/ or select a plan below to unlock access.',
    });
  }

  // If user registered a custom password, validate against salted scrypt hash
  if (record.passwordHash) {
    if (!cleanPassword || !verifyPassword(cleanPassword, record.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password for this account. Please check your password and retry.' });
    }
  } else {
    // Migrated partner accounts from zerowaste.supritamone.com require non-empty password on first manual password login
    if (cleanPassword.length < 4) {
      return res.status(401).json({
        error: 'Enter your password (min 4 characters) or sign in directly from https://zerowaste.supritamone.com/.',
      });
    }
  }

  if (record.status === 'expired' || (record.expiresAt && now > record.expiresAt)) {
    return res.status(403).json({
      expired: true,
      error: 'Your 3-Day Free Trial has ended. Choose an annual plan below to continue full access.',
    });
  }

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
  const { planId, email, name, password, transactionRef, chefSeats } = req.body || {};
  const cleanPlan = String(planId || 'trial').trim().toLowerCase() as 'trial' | 'individual' | 'team' | 'training';
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');
  const cleanName =
    String(name || '').trim() ||
    (cleanEmail.split('@')[0] || 'Culinary Director')
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

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

  // Always keep supritamone@gmail.com permanently unlocked as Admin
  if (cleanEmail === PERMANENT_ADMIN_EMAIL) {
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

  if (cleanPlan === 'trial' && existing && existing.planId === 'trial' && existing.status === 'expired') {
    return res.status(403).json({
      expired: true,
      error: 'A 3-Day Free Trial was already used for this email. Please select Individual, Team, or Executive Advisory.',
    });
  }

  const PLAN_META: Record<'trial' | 'individual' | 'team' | 'training', { title: string; durationMs: number }> = {
    trial: { title: '3-Day Free Trial ($0 / 72h)', durationMs: 3 * 24 * 60 * 60 * 1000 },
    individual: { title: 'Individual Annual Plan ($99/yr)', durationMs: 365 * 24 * 60 * 60 * 1000 },
    team: {
      title: `Team Brigade Plan (${Math.max(5, Number(chefSeats) || 5)} Chefs · $79/chef/yr)`,
      durationMs: 365 * 24 * 60 * 60 * 1000,
    },
    training: { title: 'EXECUTIVE ADVISORY · Training ($1499/5 chefs/yr)', durationMs: 365 * 24 * 60 * 60 * 1000 },
  };

  const meta = PLAN_META[cleanPlan];
  const expiresAt = now + meta.durationMs;

  const updatedRecord: StoredAuthUser = {
    email: cleanEmail,
    name: cleanName,
    passwordHash: hashPassword(cleanPassword),
    role: 'member',
    planId: cleanPlan,
    planTitle: meta.title,
    status: 'active',
    expiresAt,
    transactionRef: transactionRef || (cleanPlan === 'trial' ? `TRIAL-${now.toString(36).toUpperCase()}` : `ZN-PAY-${Math.floor(1000000 + Math.random() * 9000000)}`),
    source: 'direct_plan_enrollment',
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  store.users[cleanEmail] = updatedRecord;
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
          const { token } = issuePartnerRedirectSession({
            email: typeof req.query.email === 'string' ? req.query.email : undefined,
            name: typeof req.query.name === 'string' ? req.query.name : undefined,
            planId: typeof req.query.plan === 'string' ? req.query.plan : undefined,
          });
          setSessionCookie(req, res, token);
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
