// Audio & Voice Narration Engine for Supritamone Academy
// Unified Calm Educator Voice (Charon neural TTS + Prioritized Calm Natural/Online Voices across all browsers)

export type TTSVoiceName = 'Charon' | 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';

export interface TTSVoiceOption {
  id: TTSVoiceName;
  label: string;
  description: string;
  gender: 'male' | 'female';
}

export const AVAILABLE_VOICES: TTSVoiceOption[] = [
  { id: 'Charon', label: 'Dr. Chef Basu (Calm Natural Educator)', description: 'Calm, gentle, serene conversational human educator voice with unhurried cadence', gender: 'male' },
  { id: 'Fenrir', label: 'Dr. Chef Basu (Deep Baritone Chef)', description: 'Warm baritone chef narration', gender: 'male' },
  { id: 'Puck', label: 'Puck (Engaging Culinary Mentor)', description: 'Expressive kitchen educator delivery', gender: 'male' },
  { id: 'Kore', label: 'Kore (Warm Hospitality Educator)', description: 'Warm, clear culinary educator', gender: 'female' },
  { id: 'Zephyr', label: 'Zephyr (Serene Kitchen Voice)', description: 'Calm, gentle, relaxed pacing', gender: 'female' },
];

export interface SpeechProgressEvent {
  currentTime: number;
  duration: number;
  progressFraction: number; // 0 to 1
  wordIndex: number;
  charIndex: number;
  word?: string;
}

export interface SpeakOptions {
  text: string;
  rate?: number;
  volume?: number;
  onStart?: (duration: number) => void;
  onProgress?: (progress: SpeechProgressEvent) => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

export interface SpokenWordToken {
  word: string;
  index: number;
  startChar: number;
  endChar: number;
}

export function tokenizeTextIntoWords(text: string): SpokenWordToken[] {
  const tokens: SpokenWordToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  let idx = 0;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      word: match[0],
      index: idx++,
      startChar: match.index,
      endChar: match.index + match[0].length,
    });
  }
  return tokens;
}

export interface WordTimingRange {
  startFrac: number;
  endFrac: number;
}

export function computeWordProgressRanges(tokens: SpokenWordToken[]): WordTimingRange[] {
  if (tokens.length === 0) return [];
  const weights = tokens.map((tok) => {
    const clean = tok.word;
    const base = Math.max(2, clean.replace(/[^a-zA-Z0-9]/g, '').length);
    const hasDigit = /\d/.test(clean) ? 3 : 0;
    const minorPunct = /[,;:—–-]$/.test(clean) ? 3.5 : 0;
    const majorPunct = /[.!?]$/.test(clean) ? 4.5 : 0;
    return base + hasDigit + minorPunct + majorPunct;
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return weights.map((w) => {
    const startFrac = acc / total;
    acc += w;
    const endFrac = acc / total;
    return { startFrac, endFrac };
  });
}

export function findWeightedWordIndex(ranges: WordTimingRange[], frac: number): number {
  if (ranges.length === 0) return 0;
  const clamped = Math.max(0, Math.min(0.99999, frac));
  for (let i = 0; i < ranges.length; i++) {
    if (clamped < ranges[i].endFrac) {
      return i;
    }
  }
  return ranges.length - 1;
}

export interface SentenceTiming {
  start: number;
  end: number;
  speechStart?: number;
  speechEnd?: number;
}

export interface LectureAudioData {
  audio: string;
  duration: number;
  sentenceTimings: SentenceTiming[];
}

export interface LectureProgressEvent {
  currentTime: number;
  duration: number;
  sentenceIndex: number;
  sentenceElapsed: number;
  wordIndex: number;
}

export interface LectureSpeakOptions {
  sentences: string[];
  startTimeOffset?: number;
  rate?: number;
  volume?: number;
  onStart?: (timings: SentenceTiming[], duration: number) => void;
  onProgress?: (progress: LectureProgressEvent) => void;
  onEnd?: () => void;
  onQuotaFallback?: () => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface LectureChunkPlan {
  chunkIndex: number;
  startSentenceIdx: number;
  sentences: string[];
  estStart: number;
  estEnd: number;
  estDuration: number;
}

interface ResolvedChunkPlan extends LectureChunkPlan {
  resolvedStart: number;
  resolvedEnd: number;
  resolvedDuration: number;
}

// Canonical studio voice prompt aligned 1:1 with server.ts DEFAULT_CALM_STYLE
const CALM_MALE_STYLE =
  'Calm, gentle, serene, unhurried male educator speaking smoothly at a slow, relaxed studio pace with light natural conversational warmth and soft pauses between sentences';

const AUDIO_IDB_NAME = 'supritamone_calm_audio_v4';
const AUDIO_IDB_STORE = 'audio_entries';

class PersistentAudioCache {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private openDb(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return Promise.resolve(null);
    }
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(AUDIO_IDB_NAME, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(AUDIO_IDB_STORE)) {
            db.createObjectStore(AUDIO_IDB_STORE, { keyPath: 'key' });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return this.dbPromise;
  }

  public async get<T>(key: string): Promise<T | null> {
    const db = await this.openDb();
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(AUDIO_IDB_STORE, 'readonly');
        const store = tx.objectStore(AUDIO_IDB_STORE);
        const req = store.get(key);
        req.onsuccess = () => {
          const record = req.result as { key: string; value: T; updatedAt: number } | undefined;
          resolve(record?.value ?? null);
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  public async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(AUDIO_IDB_STORE, 'readwrite');
        const store = tx.objectStore(AUDIO_IDB_STORE);
        store.put({ key, value, updatedAt: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

class AudioNarrator {
  private audioCtx: AudioContext | null = null;
  private sharedAudio: HTMLAudioElement | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private audioCache: Map<string, string> = new Map();
  private audioDurationCache: Map<string, number> = new Map();
  private inFlightFetches: Map<string, Promise<string | null>> = new Map();
  private lectureCache: Map<string, LectureAudioData> = new Map();
  private lectureInFlight: Map<string, Promise<LectureAudioData | null>> = new Map();
  private lectureQuotaHit: boolean = false;
  private serverTtsUnavailable: boolean = false;
  private durationListeners: Set<() => void> = new Set();
  private readonly selectedVoice: TTSVoiceName = 'Charon';
  private cachedBestVoice: SpeechSynthesisVoice | null = null;
  private currentSessionId: number = 0;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private fallbackInterval: ReturnType<typeof setInterval> | null = null;
  private fallbackWatchdog: ReturnType<typeof setTimeout> | null = null;
  private calibratedBrowserWps: number = 2.45;

  private activeGainNode: GainNode | null = null;
  private activeSourceNode: AudioBufferSourceNode | null = null;
  private decodedBufferCache: Map<string, AudioBuffer> = new Map();
  private webAudioPlaying: boolean = false;
  private webAudioMode: 'lecture' | 'single' | null = null;
  private webAudioBuffer: AudioBuffer | null = null;
  private webAudioStartCtxTime: number = 0;
  private webAudioStartOffset: number = 0;
  private webAudioRate: number = 1.0;
  private webAudioVolume: number = 0.9;
  private currentRate: number = 1.0;
  private currentVolume: number = 0.9;
  private webAudioTimings: SentenceTiming[] = [];
  private webAudioTokens: SpokenWordToken[][] = [];
  private webAudioWordRanges: WordTimingRange[][] = [];
  private webAudioOpts: LectureSpeakOptions | null = null;
  private webAudioSingleOpts: SpeakOptions | null = null;
  private webAudioSingleTokens: SpokenWordToken[] = [];
  private webAudioSingleWordRanges: WordTimingRange[] = [];
  private webAudioSessionId: number = 0;
  private audioUnlocked: boolean = false;

  private persistentCache = new PersistentAudioCache();
  private broadcastChannel: BroadcastChannel | null = null;

  private activeLectureChunks: LectureChunkPlan[] = [];
  private activeChunkIndex: number = 0;
  private activeChunkStartOffset: number = 0;
  private activeLectureTotalDuration: number = 0;
  private activeLectureOpts: LectureSpeakOptions | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.cachedBestVoice = null;
        };
      }

      // Auto-unlock audio context cleanly on first gesture & keep awake across mobile/tab resumes
      const warmUnlock = () => {
        this.unlockOnUserGesture();
      };
      window.addEventListener('pointerdown', warmUnlock, { passive: true, once: true });
      window.addEventListener('touchstart', warmUnlock, { passive: true, once: true });
      window.addEventListener('keydown', warmUnlock, { passive: true, once: true });

      const onVisibilityOrFocus = () => {
        if (!document.hidden && this.audioCtx && (this.audioCtx.state as string) !== 'running') {
          this.audioCtx.resume().catch(() => {});
        }
      };
      document.addEventListener('visibilitychange', onVisibilityOrFocus);
      window.addEventListener('pageshow', onVisibilityOrFocus);

      try {
        if ('BroadcastChannel' in window) {
          this.broadcastChannel = new BroadcastChannel('supritamone_audio_sync');
          this.broadcastChannel.onmessage = (evt) => {
            const msg = evt.data;
            if (!msg || typeof msg !== 'object') return;
            if (msg.type === 'rate' && typeof msg.value === 'number') {
              this.currentRate = Math.max(0.75, Math.min(2.0, msg.value));
            } else if (msg.type === 'volume' && typeof msg.value === 'number') {
              this.currentVolume = Math.max(0, Math.min(1, msg.value));
            }
          };
        }
      } catch {
        // Ignore BroadcastChannel restriction in sandboxed environments
      }
    }
  }

  public getVoice(): TTSVoiceName {
    return this.selectedVoice;
  }

  public setVoice(_voice: TTSVoiceName): void {
    // Locked unconditionally to Fenrir calm human male baritone across all browsers, tablets, phones & tabs
  }

  public onDurationsUpdated(cb: () => void): () => void {
    this.durationListeners.add(cb);
    return () => {
      this.durationListeners.delete(cb);
    };
  }

  private notifyDurationsUpdated() {
    this.durationListeners.forEach((cb) => {
      try {
        cb();
      } catch {
        // Ignore listener errors
      }
    });
  }

  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!this.audioCtx && AudioContextClass) {
      try {
        this.audioCtx = new AudioContextClass({ latencyHint: 'playback' });
      } catch {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && (this.audioCtx.state as string) !== 'running') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private async ensureAudioContextRunning(ctx: AudioContext): Promise<boolean> {
    if ((ctx.state as string) === 'running') return true;
    try {
      await Promise.race([
        ctx.resume(),
        new Promise<void>((resolve) => setTimeout(resolve, 900)),
      ]);
    } catch {
      // Ignore resume error
    }
    return (ctx.state as string) === 'running';
  }

  // Must be called SYNCHRONOUSLY inside Play/Seek/Listen taps to keep iOS, Android & Desktop Web Audio unlocked
  public unlockOnUserGesture(): void {
    if (typeof window === 'undefined') return;
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if ((ctx.state as string) !== 'running') {
          ctx.resume().catch(() => {});
        }
        if (!this.audioUnlocked || (ctx.state as string) !== 'running') {
          const silentBuf = ctx.createBuffer(1, 1, 22050);
          const src = ctx.createBufferSource();
          src.buffer = silentBuf;
          src.connect(ctx.destination);
          src.start(0);
          this.audioUnlocked = true;
        }
      }
    } catch {
      // Ignore Web Audio gesture errors
    }
    try {
      const audio = this.getSharedAudio();
      if (!this.isSpeaking && audio.paused) {
        if (!audio.src) {
          audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        }
        audio.volume = 0;
        const p = audio.play();
        if (p && typeof p.then === 'function') {
          p.then(() => {
            if (!this.isSpeaking) {
              audio.pause();
              audio.currentTime = 0;
              audio.volume = this.currentVolume;
            }
          }).catch(() => {});
        }
      }
    } catch {
      // Ignore HTMLAudio gesture errors
    }
  }

  private extractWavDuration(cacheKey: string, base64Audio: string): number | null {
    try {
      const headerLen = Math.min(base64Audio.length, 1024);
      const bin = atob(base64Audio.slice(0, headerLen));
      if (bin.length >= 44 && bin.slice(0, 4) === 'RIFF') {
        const readU32 = (offset: number) =>
          (bin.charCodeAt(offset) |
            (bin.charCodeAt(offset + 1) << 8) |
            (bin.charCodeAt(offset + 2) << 16) |
            (bin.charCodeAt(offset + 3) << 24)) >>> 0;

        let byteRate = readU32(28);
        let dataBytes = 0;
        let offset = 12;
        while (offset + 8 <= bin.length) {
          const chunkId = bin.slice(offset, offset + 4);
          const chunkSize = readU32(offset + 4);
          if (chunkId === 'fmt ' && offset + 8 + 12 <= bin.length) {
            const parsedByteRate = readU32(offset + 8 + 8);
            if (parsedByteRate > 0) byteRate = parsedByteRate;
          } else if (chunkId === 'data') {
            dataBytes = chunkSize;
            break;
          }
          if (chunkSize === 0) break;
          offset += 8 + chunkSize + (chunkSize % 2);
        }

        if (!dataBytes) {
          const totalBytes = Math.floor((base64Audio.length * 3) / 4);
          dataBytes = Math.max(0, totalBytes - 44);
        }

        if (byteRate > 0 && dataBytes > 0) {
          const secs = dataBytes / byteRate;
          if (secs > 0.3 && secs < 600) {
            this.audioDurationCache.set(cacheKey, secs);
            this.notifyDurationsUpdated();
            return secs;
          }
        }
      }
    } catch {
      // Ignore header parse error
    }

    this.probeAudioDuration(cacheKey, base64Audio);
    return null;
  }

  private probeAudioDuration(cacheKey: string, base64Audio: string) {
    try {
      const url = this.base64WavToObjectUrl(base64Audio);
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.audioDurationCache.set(cacheKey, audio.duration);
          this.notifyDurationsUpdated();
        }
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  }

  public estimateDuration(text: string, rate: number = 1.0): number {
    const clean = text.trim();
    const cacheKey = `${this.selectedVoice}_${clean}`;
    const safeRate = Math.max(0.5, Math.min(2.0, rate));
    if (this.audioDurationCache.has(cacheKey)) {
      return this.audioDurationCache.get(cacheKey)! / safeRate;
    }
    const words = clean.split(/\s+/).filter(Boolean).length;
    const baseSeconds = Math.max(3.0, words / 2.15);
    return baseSeconds / safeRate;
  }

  public isCached(text: string): boolean {
    const clean = text.trim();
    return this.audioCache.has(`${this.selectedVoice}_${clean}`);
  }

  private getLectureKey(sentences: string[]): string {
    return `${this.selectedVoice}_${sentences.map((s) => s.trim()).filter(Boolean).join(' | ')}`;
  }

  private splitLectureIntoChunks(sentences: string[]): LectureChunkPlan[] {
    const clean = sentences.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return [];

    const chunks: LectureChunkPlan[] = [];
    const TARGET_WORDS_PER_CHUNK = 125;
    let curSentences: string[] = [];
    let curWords = 0;
    let chunkStartIdx = 0;
    let accTime = 0;

    const flush = () => {
      if (curSentences.length === 0) return;
      const chunkDur = curSentences.reduce((sum, line) => sum + this.estimateDuration(line, 1.0), 0);
      chunks.push({
        chunkIndex: chunks.length,
        startSentenceIdx: chunkStartIdx,
        sentences: curSentences,
        estStart: accTime,
        estEnd: accTime + chunkDur,
        estDuration: chunkDur,
      });
      accTime += chunkDur;
      curSentences = [];
      curWords = 0;
    };

    clean.forEach((line, idx) => {
      const words = line.split(/\s+/).filter(Boolean).length;
      if (curSentences.length > 0 && curWords + words > TARGET_WORDS_PER_CHUNK && curSentences.length >= 2) {
        flush();
        chunkStartIdx = idx;
      }
      if (curSentences.length === 0) {
        chunkStartIdx = idx;
      }
      curSentences.push(line);
      curWords += words;
    });
    flush();

    return chunks;
  }

  // Always resolve chunk start/end using real loaded WAV durations when available so chunk transitions never jump
  private resolveChunkPlans(chunks: LectureChunkPlan[]): {
    resolved: ResolvedChunkPlan[];
    totalDuration: number;
  } {
    const resolved: ResolvedChunkPlan[] = [];
    let cursor = 0;
    for (const ch of chunks) {
      const cKey = this.getLectureKey(ch.sentences);
      const cached = this.lectureCache.get(cKey);
      const dur = cached && cached.duration > 0 ? cached.duration : ch.estDuration;
      resolved.push({
        ...ch,
        resolvedStart: cursor,
        resolvedEnd: cursor + dur,
        resolvedDuration: dur,
      });
      cursor += dur;
    }
    return { resolved, totalDuration: Math.max(1, cursor) };
  }

  public getLectureTimings(sentences: string[]): LectureAudioData | null {
    const clean = sentences.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return null;
    const key = this.getLectureKey(clean);
    if (this.lectureCache.has(key)) return this.lectureCache.get(key)!;

    const chunks = this.splitLectureIntoChunks(clean);
    if (chunks.length > 1) {
      let hasAnyChunk = false;
      const allTimings: SentenceTiming[] = [];
      let cursor = 0;
      for (const ch of chunks) {
        const cKey = this.getLectureKey(ch.sentences);
        const cached = this.lectureCache.get(cKey);
        if (cached && cached.sentenceTimings.length === ch.sentences.length) {
          hasAnyChunk = true;
          for (const st of cached.sentenceTimings) {
            allTimings.push({ start: cursor + st.start, end: cursor + st.end });
          }
          cursor += cached.duration;
        } else {
          for (const s of ch.sentences) {
            const d = this.estimateDuration(s, 1.0);
            allTimings.push({ start: cursor, end: cursor + d });
            cursor += d;
          }
        }
      }
      if (hasAnyChunk) {
        return { audio: '', duration: cursor, sentenceTimings: allTimings };
      }
    }
    return null;
  }

  private cacheLecturePayload(key: string, sentences: string[], payload: LectureAudioData) {
    if (this.lectureCache.size > 80) {
      const firstKey = this.lectureCache.keys().next().value;
      if (firstKey) this.lectureCache.delete(firstKey);
    }
    this.lectureCache.set(key, payload);
    this.lectureQuotaHit = false;
    sentences.forEach((s, idx) => {
      const timing = payload.sentenceTimings[idx];
      if (timing) {
        this.audioDurationCache.set(`${this.selectedVoice}_${s}`, Math.max(0.5, timing.end - timing.start));
      }
    });
    this.notifyDurationsUpdated();
  }

  private resolveTtsEndpoint(path: string): string {
    try {
      const envBase = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env?.VITE_API_BASE_URL;
      const winBase = typeof window !== 'undefined'
        ? (window as unknown as { __SUPRITAMONE_API_BASE__?: string }).__SUPRITAMONE_API_BASE__
        : undefined;
      const base = (envBase || winBase || '').trim().replace(/\/+$/, '');
      if (base) return `${base}${path}`;
    } catch {
      // Ignore env access issues in constrained environments
    }
    return path;
  }

  // Synthesize & cache lecture chunk as ONE unified calm human WAV file (RAM -> IndexedDB -> Server)
  public fetchLectureAudio(sentences: string[]): Promise<LectureAudioData | null> {
    const cleanSentences = sentences.map((s) => s.trim()).filter(Boolean);
    if (cleanSentences.length === 0) return Promise.resolve(null);

    const key = this.getLectureKey(cleanSentences);
    if (this.lectureCache.has(key)) {
      return Promise.resolve(this.lectureCache.get(key)!);
    }
    if (this.lectureInFlight.has(key)) {
      return this.lectureInFlight.get(key)!;
    }

    const doFetch = async (): Promise<LectureAudioData | null> => {
      // 1. Check browser-persistent IndexedDB cache first (instant across tabs & reloads)
      const idbHit = await this.persistentCache.get<LectureAudioData>(`lec_${key}`);
      if (idbHit?.audio && Array.isArray(idbHit.sentenceTimings)) {
        this.cacheLecturePayload(key, cleanSentences, idbHit);
        return idbHit;
      }

      if (this.serverTtsUnavailable) {
        return null;
      }

      // 2. Fetch from canonical calm Charon TTS endpoint with patient mobile/cross-browser retry backoff
      const endpoint = this.resolveTtsEndpoint('/api/tts/lecture');
      for (let attempt = 1; attempt <= 3; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 55000);
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              sentences: cleanSentences,
              voice: 'Charon',
              style: CALM_MALE_STYLE,
            }),
          });
          clearTimeout(timeoutId);
          if (res.status === 429) {
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 1200 * attempt));
              continue;
            }
            this.lectureQuotaHit = true;
            return null;
          }
          if (res.status === 503 || res.status >= 500) {
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 900 * attempt));
              continue;
            }
            return null;
          }
          if (res.status === 404 || res.status === 405) {
            this.serverTtsUnavailable = true;
            return null;
          }
          if (!res.ok) {
            throw new Error('Lecture TTS returned ' + res.status);
          }
          const data = await res.json();
          if (data?.audio && Array.isArray(data?.sentenceTimings)) {
            const payload: LectureAudioData = {
              audio: data.audio,
              duration: Number(data.duration) || 10,
              sentenceTimings: data.sentenceTimings,
            };
            this.cacheLecturePayload(key, cleanSentences, payload);
            this.persistentCache.set(`lec_${key}`, payload).catch(() => {});
            return payload;
          }
        } catch {
          clearTimeout(timeoutId);
        }
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 700 * attempt));
        }
      }
      return null;
    };

    const promise = doFetch().finally(() => {
      this.lectureInFlight.delete(key);
    });
    this.lectureInFlight.set(key, promise);
    return promise;
  }

  public async prefetchLecture(sentences: string[]): Promise<void> {
    if (typeof window === 'undefined' || sentences.length === 0) return;
    const chunks = this.splitLectureIntoChunks(sentences);
    if (chunks.length > 0) {
      await this.fetchLectureAudio(chunks[0].sentences);
    }
  }

  private fetchTtsAudio(cleanText: string): Promise<string | null> {
    const cacheKey = `${this.selectedVoice}_${cleanText}`;
    if (this.audioCache.has(cacheKey)) {
      return Promise.resolve(this.audioCache.get(cacheKey)!);
    }
    if (this.inFlightFetches.has(cacheKey)) {
      return this.inFlightFetches.get(cacheKey)!;
    }

    const attemptFetch = async (): Promise<string | null> => {
      const idbHit = await this.persistentCache.get<string>(`tts_${cacheKey}`);
      if (idbHit) {
        this.audioCache.set(cacheKey, idbHit);
        this.extractWavDuration(cacheKey, idbHit);
        return idbHit;
      }

      if (this.serverTtsUnavailable) {
        return null;
      }

      const endpoint = this.resolveTtsEndpoint('/api/tts');
      for (let attempt = 1; attempt <= 3; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              text: cleanText,
              voice: 'Charon',
              style: CALM_MALE_STYLE,
            }),
          });
          clearTimeout(timeoutId);
          if (res.status === 429 || res.status === 503 || res.status >= 500) {
            if (attempt < 3) {
              await new Promise((r) => setTimeout(r, 900 * attempt));
              continue;
            }
            return null;
          }
          if (res.status === 404 || res.status === 405) {
            this.serverTtsUnavailable = true;
            return null;
          }
          if (!res.ok) {
            throw new Error('TTS server returned ' + res.status);
          }
          const data = await res.json();
          if (data?.audio) {
            this.audioCache.set(cacheKey, data.audio);
            this.extractWavDuration(cacheKey, data.audio);
            this.persistentCache.set(`tts_${cacheKey}`, data.audio as string).catch(() => {});
            return data.audio as string;
          }
        } catch {
          clearTimeout(timeoutId);
        }
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 600 * attempt));
        }
      }
      return null;
    };

    const fetchPromise = attemptFetch().finally(() => {
      this.inFlightFetches.delete(cacheKey);
    });

    this.inFlightFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
  }

  public async prefetch(texts: string[]): Promise<void> {
    if (typeof window === 'undefined' || texts.length === 0) return;
    if (texts.length > 1) {
      await this.fetchLectureAudio(texts);
      return;
    }
    await this.fetchTtsAudio(texts[0].trim());
  }

  // Wait cleanly for asynchronous getVoices() (critical on Brave, Chromium, Firefox & mobile first play)
  private ensureVoicesLoaded(timeoutMs: number = 500): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return Promise.resolve([]);
    }
    const existing = window.speechSynthesis.getVoices();
    if (existing && existing.length > 0) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearInterval(pollTimer);
        clearTimeout(timeoutTimer);
        try {
          window.speechSynthesis.removeEventListener?.('voiceschanged', onChanged);
        } catch {
          // Ignore
        }
        resolve(window.speechSynthesis.getVoices() || []);
      };
      const onChanged = () => {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedBestVoice = null;
          finish();
        }
      };
      try {
        window.speechSynthesis.addEventListener?.('voiceschanged', onChanged);
      } catch {
        // Fallback to polling when addEventListener is unsupported
      }
      const pollTimer = setInterval(() => {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedBestVoice = null;
          finish();
        }
      }, 45);
      const timeoutTimer = setTimeout(finish, timeoutMs);
    });
  }

  private scoreBrowserVoice(v: SpeechSynthesisVoice): number {
    const lang = (v.lang || '').toLowerCase();
    const name = (v.name || '').toLowerCase();
    let score = 0;

    if (!lang.startsWith('en')) {
      return -2000;
    }
    if (lang.startsWith('en-us') || lang.startsWith('en-gb')) score += 45;
    else if (lang.startsWith('en-ca') || lang.startsWith('en-au') || lang.startsWith('en-in')) score += 25;

    const isOnline = name.includes('online') || !v.localService;
    const isNaturalOrNeural =
      name.includes('natural') ||
      name.includes('neural') ||
      name.includes('wavenet') ||
      name.includes('studio') ||
      name.includes('multilingual');
    const isGoogle = name.includes('google');
    const isAppleQuality = name.includes('enhanced') || name.includes('premium') || name.includes('siri');

    // Tier 1: Modern Natural / Online / Neural / Google / Enhanced voices ALWAYS outrank legacy OS voices
    if (name.includes('online') && isNaturalOrNeural) score += 1400;
    else if (isNaturalOrNeural) score += 1050;
    if (isGoogle) score += 880;
    if (isOnline && !isGoogle) score += 720;
    if (isAppleQuality) score += 660;

    // Tier 2: Calm, warm educator voice personas (prioritizing natural clarity across all browsers)
    const calmMalePersonas = [
      'andrew', 'brian', 'christopher', 'steffan', 'ryan', 'guy',
      'george', 'arthur', 'oliver', 'daniel', 'uk english male', 'aaron', 'thomas',
    ];
    const calmFemalePersonas = [
      'ava', 'emma', 'jenny', 'aria', 'libby', 'sonia', 'samantha',
      'serena', 'karen', 'kate', 'uk english female', 'us english', 'nicky', 'allison',
    ];

    if (calmMalePersonas.some((tok) => name.includes(tok))) {
      score += 240;
    } else if (calmFemalePersonas.some((tok) => name.includes(tok))) {
      score += 190;
    }

    // Penalize legacy heavy/monotone offline robotic synthesizers so Natural/Online always win if present
    if (name.includes('espeak') || name.includes('festival') || name.includes('flite') || name.includes('mbrola')) {
      score -= 900;
    }
    if (!isNaturalOrNeural && !isOnline) {
      if (name.includes('microsoft david') || name === 'david' || name.includes('david desktop')) score -= 500;
      if (name.includes('microsoft mark') || name === 'mark' || name.includes('mark desktop')) score -= 420;
      if (name.includes('microsoft zira') || name === 'zira' || name.includes('zira desktop')) score -= 340;
    }

    return score;
  }

  private getBestBrowserVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (this.cachedBestVoice && voices.some((v) => v.name === this.cachedBestVoice?.name)) {
      return this.cachedBestVoice;
    }

    let best: SpeechSynthesisVoice | null = null;
    let bestScore = -Infinity;
    for (const v of voices) {
      const s = this.scoreBrowserVoice(v);
      if (s > bestScore) {
        bestScore = s;
        best = v;
      }
    }
    this.cachedBestVoice = best || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
    return this.cachedBestVoice;
  }

  // Calibrate rate & pitch per voice engine so Brave/legacy local voices never sound heavy, booming, or muddy
  private getBrowserAcousticProfile(
    voice: SpeechSynthesisVoice | null,
    activeRate: number
  ): { rate: number; pitch: number } {
    const safeActive = Math.max(0.75, Math.min(2.0, activeRate || 1.0));
    const name = (voice?.name || '').toLowerCase();

    const isModernNeuralOrOnline =
      name.includes('natural') ||
      name.includes('online') ||
      name.includes('neural') ||
      name.includes('google') ||
      name.includes('wavenet') ||
      name.includes('studio') ||
      name.includes('enhanced') ||
      name.includes('premium') ||
      name.includes('siri') ||
      (voice ? !voice.localService : false);

    if (isModernNeuralOrOnline) {
      return {
        rate: Math.max(0.72, Math.min(1.45, safeActive * 0.84)),
        pitch: 1.0,
      };
    }

    const isLegacyLightVoice =
      name.includes('zira') ||
      name.includes('hazel') ||
      name.includes('susan') ||
      name.includes('heera') ||
      name.includes('samantha') ||
      name.includes('karen') ||
      name.includes('fiona') ||
      name.includes('female');

    if (isLegacyLightVoice) {
      return {
        rate: Math.max(0.74, Math.min(1.45, safeActive * 0.82)),
        pitch: 0.93,
      };
    }

    // Legacy bass OS voices on Brave (e.g. Windows SAPI5 David / Mark / eSpeak / unset default):
    // Lift pitch to clear heavy chest boom while keeping speech calm, smooth, and unhurried.
    return {
      rate: Math.max(0.75, Math.min(1.45, safeActive * 0.85)),
      pitch: 1.16,
    };
  }

  public setVolume(volume: number): void {
    const safeVol = Math.max(0, Math.min(1, volume));
    this.currentVolume = safeVol;
    this.webAudioVolume = safeVol;
    if (this.activeGainNode) {
      try {
        this.activeGainNode.gain.value = safeVol;
      } catch {
        // Ignore
      }
    }
    if (this.currentAudio) {
      this.currentAudio.volume = safeVol;
    }
    try {
      this.broadcastChannel?.postMessage({ type: 'volume', value: safeVol });
    } catch {
      // Ignore
    }
  }

  public setRate(rate: number): void {
    const safeRate = Math.max(0.75, Math.min(2.0, rate));
    this.currentRate = safeRate;
    if (this.webAudioPlaying && this.audioCtx && this.activeSourceNode) {
      const now = this.audioCtx.currentTime;
      if (!this.isPaused) {
        const curPos = this.webAudioStartOffset + (now - this.webAudioStartCtxTime) * this.webAudioRate;
        this.webAudioStartOffset = curPos;
        this.webAudioStartCtxTime = now;
      }
      this.webAudioRate = safeRate;
      try {
        this.activeSourceNode.playbackRate.value = safeRate;
      } catch {
        // Ignore
      }
    } else {
      this.webAudioRate = safeRate;
    }
    if (this.currentAudio) {
      this.currentAudio.playbackRate = safeRate;
    }
    try {
      this.broadcastChannel?.postMessage({ type: 'rate', value: safeRate });
    } catch {
      // Ignore
    }
  }

  public getQuotaReached(): boolean {
    return this.lectureQuotaHit;
  }

  private getWebAudioCurrentPos(): number {
    if (!this.webAudioBuffer) return 0;
    if (this.isPaused || !this.audioCtx) return this.webAudioStartOffset;
    const elapsed = Math.max(0, this.audioCtx.currentTime - this.webAudioStartCtxTime);
    return Math.min(this.webAudioBuffer.duration, this.webAudioStartOffset + elapsed * this.webAudioRate);
  }

  private stopWebAudioNode(): void {
    if (this.activeSourceNode) {
      try {
        this.activeSourceNode.onended = null;
        this.activeSourceNode.stop();
        this.activeSourceNode.disconnect();
      } catch {
        // Ignore
      }
      this.activeSourceNode = null;
    }
    if (this.activeGainNode) {
      try {
        this.activeGainNode.disconnect();
      } catch {
        // Ignore
      }
      this.activeGainNode = null;
    }
    this.webAudioPlaying = false;
  }

  private startWebAudioBufferFrom(offsetSec: number): void {
    const ctx = this.getAudioContext();
    const buffer = this.webAudioBuffer;
    const sessionId = this.webAudioSessionId;
    if (!ctx || !buffer) return;

    this.stopWebAudioNode();
    const safeOffset = Math.max(0, Math.min(Math.max(0, buffer.duration - 0.05), offsetSec));

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = this.webAudioRate;

    const gain = ctx.createGain();
    gain.gain.value = this.webAudioVolume;

    source.connect(gain);
    gain.connect(ctx.destination);

    this.activeSourceNode = source;
    this.activeGainNode = gain;
    this.webAudioStartOffset = safeOffset;
    this.webAudioStartCtxTime = ctx.currentTime;
    this.webAudioPlaying = true;

    const emitWebProgress = () => {
      if (this.currentSessionId !== sessionId || !this.isSpeaking || !this.webAudioPlaying) return;
      const dur = buffer.duration || 1;
      const cur = this.getWebAudioCurrentPos();

      if (this.webAudioMode === 'single' && this.webAudioSingleOpts) {
        const words = this.webAudioSingleTokens;
        const frac = Math.min(1, Math.max(0, cur / Math.max(0.1, dur)));
        const wordIdx =
          this.webAudioSingleWordRanges.length > 0
            ? findWeightedWordIndex(this.webAudioSingleWordRanges, frac)
            : words.length > 0
              ? Math.min(words.length - 1, Math.floor(frac * words.length))
              : 0;
        const activeToken = words[wordIdx];
        this.webAudioSingleOpts.onProgress?.({
          currentTime: cur / this.webAudioRate,
          duration: dur / this.webAudioRate,
          progressFraction: frac,
          wordIndex: wordIdx,
          charIndex: activeToken ? activeToken.startChar : 0,
          word: activeToken ? activeToken.word : '',
        });
        return;
      }

      if (this.webAudioMode === 'lecture' && this.webAudioOpts) {
        const timings = this.webAudioTimings;
        let sIdx = Math.max(0, timings.length - 1);
        for (let i = 0; i < timings.length; i++) {
          if (cur < timings[i].end || i === timings.length - 1) {
            sIdx = i;
            break;
          }
        }
        const t = timings[sIdx] || { start: 0, end: dur };
        const segElapsed = Math.max(0, cur - t.start);
        const speechStart = t.speechStart !== undefined ? t.speechStart : t.start;
        const speechEnd = t.speechEnd !== undefined ? Math.max(speechStart + 0.25, t.speechEnd) : t.end;
        const speechDur = Math.max(0.25, speechEnd - speechStart);
        const speechFrac = Math.min(1, Math.max(0, (cur - speechStart) / speechDur));
        const words = this.webAudioTokens[sIdx] || [];
        const ranges = this.webAudioWordRanges[sIdx] || [];
        const wordIdx =
          ranges.length > 0
            ? findWeightedWordIndex(ranges, speechFrac)
            : words.length > 0
              ? Math.min(words.length - 1, Math.floor(speechFrac * words.length))
              : 0;

        this.webAudioOpts.onProgress?.({
          currentTime: cur,
          duration: dur,
          sentenceIndex: sIdx,
          sentenceElapsed: segElapsed,
          wordIndex: wordIdx,
        });
      }
    };

    source.onended = () => {
      if (this.currentSessionId !== sessionId || this.isPaused || !this.webAudioPlaying) return;
      this.webAudioPlaying = false;
      this.clearAllTimers();
      this.isSpeaking = false;
      if (this.webAudioMode === 'single' && this.webAudioSingleOpts) {
        const sOpts = this.webAudioSingleOpts;
        const words = this.webAudioSingleTokens;
        const dur = buffer.duration || 1;
        sOpts.onProgress?.({
          currentTime: dur / this.webAudioRate,
          duration: dur / this.webAudioRate,
          progressFraction: 1,
          wordIndex: Math.max(0, words.length - 1),
          charIndex: (sOpts.text || '').length,
          word: words[words.length - 1]?.word || '',
        });
        sOpts.onEnd?.();
      } else {
        this.webAudioOpts?.onEnd?.();
      }
    };

    this.clearAllTimers();
    this.progressInterval = setInterval(() => {
      if (this.currentSessionId === sessionId && this.isSpeaking && !this.isPaused) {
        emitWebProgress();
      }
    }, 50);

    source.start(0, safeOffset);
    emitWebProgress();
  }

  public seekTo(seconds: number): boolean {
    this.unlockOnUserGesture();

    if (!this.activeLectureOpts || this.activeLectureChunks.length === 0) {
      if (this.webAudioPlaying && this.webAudioBuffer) {
        const clamped = Math.max(0, Math.min(this.webAudioBuffer.duration - 0.05, seconds));
        this.startWebAudioBufferFrom(clamped);
        return true;
      }
      if (this.currentAudio && isFinite(this.currentAudio.duration) && this.currentAudio.duration > 0) {
        const clamped = Math.max(0, Math.min(this.currentAudio.duration - 0.05, seconds));
        this.currentAudio.currentTime = clamped;
        return true;
      }
      return false;
    }

    const { resolved, totalDuration } = this.resolveChunkPlans(this.activeLectureChunks);
    this.activeLectureTotalDuration = totalDuration;
    const clampedGlobal = Math.max(0, Math.min(totalDuration - 0.05, seconds));

    let targetIdx = 0;
    for (let i = resolved.length - 1; i >= 0; i--) {
      if (clampedGlobal >= resolved[i].resolvedStart) {
        targetIdx = i;
        break;
      }
    }

    const localOffset = Math.max(0, clampedGlobal - resolved[targetIdx].resolvedStart);

    if (targetIdx === this.activeChunkIndex && this.webAudioBuffer && (this.webAudioPlaying || this.isPaused)) {
      const localSec = Math.max(0, Math.min(this.webAudioBuffer.duration - 0.05, localOffset));
      if (this.isPaused) {
        this.webAudioStartOffset = localSec;
      } else {
        this.startWebAudioBufferFrom(localSec);
      }
      return true;
    }

    if (
      targetIdx === this.activeChunkIndex &&
      this.currentAudio &&
      isFinite(this.currentAudio.duration) &&
      this.currentAudio.duration > 0
    ) {
      const localSec = Math.max(0, Math.min(this.currentAudio.duration - 0.05, localOffset));
      this.currentAudio.currentTime = localSec;
      return true;
    }

    this.startLectureAtChunk(targetIdx, localOffset, this.activeLectureOpts);
    return true;
  }

  private base64ToUint8Array(base64Audio: string): Uint8Array<ArrayBuffer> {
    const binStr = atob(base64Audio);
    const buffer = new ArrayBuffer(binStr.length);
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    return bytes;
  }

  private base64WavToObjectUrl(base64Audio: string): string {
    const bytes = this.base64ToUint8Array(base64Audio);
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  public speakLecture(opts: LectureSpeakOptions): void {
    const cleanSentences = (opts.sentences || []).map((s) => s.trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      opts.onEnd?.();
      return;
    }

    this.unlockOnUserGesture();
    this.currentRate = Math.max(0.75, Math.min(2.0, opts.rate || this.currentRate || 1.0));
    this.currentVolume = Math.max(0, Math.min(1, opts.volume !== undefined ? opts.volume : this.currentVolume));

    const chunks = this.splitLectureIntoChunks(cleanSentences);
    const { resolved, totalDuration } = this.resolveChunkPlans(chunks);
    const targetSec = Math.max(0, Math.min(totalDuration - 0.05, opts.startTimeOffset || 0));

    let startChunkIdx = 0;
    for (let i = resolved.length - 1; i >= 0; i--) {
      if (targetSec >= resolved[i].resolvedStart) {
        startChunkIdx = i;
        break;
      }
    }

    this.activeLectureChunks = chunks;
    this.activeLectureTotalDuration = totalDuration;
    this.activeLectureOpts = opts;

    const localOffset = Math.max(0, targetSec - resolved[startChunkIdx].resolvedStart);
    this.startLectureAtChunk(startChunkIdx, localOffset, opts);
  }

  private startLectureAtChunk(chunkIdx: number, localOffsetSec: number, opts: LectureSpeakOptions): void {
    const chunks = this.activeLectureChunks;
    if (chunkIdx >= chunks.length) {
      this.stop();
      opts.onEnd?.();
      return;
    }

    this.stop(true);
    const sessionId = ++this.currentSessionId;
    this.isSpeaking = true;
    this.isPaused = false;
    this.activeChunkIndex = chunkIdx;

    const { resolved, totalDuration } = this.resolveChunkPlans(chunks);
    this.activeChunkStartOffset = resolved[chunkIdx].resolvedStart;
    this.activeLectureTotalDuration = totalDuration;

    const chunk = chunks[chunkIdx];
    const key = this.getLectureKey(chunk.sentences);

    // Pre-fetch next chunk proactively during playback
    if (chunkIdx + 1 < chunks.length) {
      setTimeout(() => {
        if (this.currentSessionId === sessionId) {
          this.fetchLectureAudio(chunks[chunkIdx + 1].sentences);
        }
      }, 350);
    }

    const handleChunkDone = () => {
      if (this.currentSessionId !== sessionId) return;
      if (chunkIdx + 1 < chunks.length) {
        this.startLectureAtChunk(chunkIdx + 1, 0, opts);
      } else {
        this.clearAllTimers();
        this.isSpeaking = false;
        this.currentAudio = null;
        opts.onEnd?.();
      }
    };

    const chunkOpts: LectureSpeakOptions = {
      ...opts,
      startTimeOffset: localOffsetSec,
      onStart: (timings, _dur) => {
        const refreshed = this.resolveChunkPlans(this.activeLectureChunks);
        this.activeChunkStartOffset = refreshed.resolved[chunkIdx]?.resolvedStart ?? this.activeChunkStartOffset;
        this.activeLectureTotalDuration = refreshed.totalDuration;
        const mapped = timings.map((t) => ({
          start: this.activeChunkStartOffset + t.start,
          end: this.activeChunkStartOffset + t.end,
        }));
        opts.onStart?.(mapped, this.activeLectureTotalDuration);
      },
      onProgress: (p) => {
        opts.onProgress?.({
          currentTime: Math.min(this.activeLectureTotalDuration, this.activeChunkStartOffset + p.currentTime),
          duration: this.activeLectureTotalDuration,
          sentenceIndex: chunk.startSentenceIdx + p.sentenceIndex,
          sentenceElapsed: p.sentenceElapsed,
          wordIndex: p.wordIndex,
        });
      },
      onEnd: handleChunkDone,
    };

    if (this.lectureCache.has(key)) {
      opts.onLoadingChange?.(false);
      this.playLectureWav(
        this.lectureCache.get(key)!,
        chunk.sentences,
        this.currentRate,
        this.currentVolume,
        sessionId,
        chunkOpts
      );
      return;
    }

    opts.onLoadingChange?.(true);
    this.fetchLectureAudio(chunk.sentences).then((data) => {
      if (this.currentSessionId !== sessionId) return;
      opts.onLoadingChange?.(false);
      if (data) {
        this.playLectureWav(data, chunk.sentences, this.currentRate, this.currentVolume, sessionId, chunkOpts);
      } else {
        if (this.lectureQuotaHit) {
          opts.onQuotaFallback?.();
        }
        this.playFallbackLectureSequence(
          chunk.sentences,
          localOffsetSec,
          this.currentRate,
          this.currentVolume,
          sessionId,
          chunkOpts
        );
      }
    });
  }

  private playLectureWav(
    lectureData: LectureAudioData,
    sentences: string[],
    rate: number,
    volume: number,
    sessionId: number,
    opts: LectureSpeakOptions
  ): void {
    const chunkKey = this.getLectureKey(sentences);
    const safeRate = Math.max(0.75, Math.min(2.0, rate));
    const safeVol = Math.max(0, Math.min(1, volume));
    const timings = lectureData.sentenceTimings;
    const tokenizedSentences = sentences.map((s) => tokenizeTextIntoWords(s));
    const wordRangesPerSentence = tokenizedSentences.map((toks) => computeWordProgressRanges(toks));
    const startOffset = Math.max(0, opts.startTimeOffset || 0);

    // Primary Cross-Platform Engine: Hardware-clock Web Audio API (Identical Fenrir voice + exact timing across iOS, Android, Tablet & Desktop)
    const ctx = this.getAudioContext();
    if (ctx) {
      const playDecoded = async (audioBuffer: AudioBuffer) => {
        if (this.currentSessionId !== sessionId) return;
        const isRunning = await this.ensureAudioContextRunning(ctx);
        if (this.currentSessionId !== sessionId) return;
        if (!isRunning) {
          // If mobile browser suspended Web Audio across an async gap, seamlessly play same Fenrir WAV via unlocked HTMLAudio
          this.playLectureHtmlAudio(lectureData, sentences, this.currentRate, this.currentVolume, sessionId, opts);
          return;
        }
        this.webAudioMode = 'lecture';
        this.webAudioSingleOpts = null;
        this.webAudioSingleTokens = [];
        this.webAudioSingleWordRanges = [];
        this.webAudioBuffer = audioBuffer;
        this.webAudioRate = Math.max(0.75, Math.min(2.0, this.currentRate || safeRate));
        this.webAudioVolume = Math.max(0, Math.min(1, this.currentVolume));
        this.webAudioTimings = timings;
        this.webAudioTokens = tokenizedSentences;
        this.webAudioWordRanges = wordRangesPerSentence;
        this.webAudioOpts = opts;
        this.webAudioSessionId = sessionId;
        opts.onStart?.(timings, audioBuffer.duration || lectureData.duration);
        if (this.isPaused) {
          this.webAudioStartOffset = Math.max(0, Math.min(Math.max(0, audioBuffer.duration - 0.05), startOffset));
          return;
        }
        this.startWebAudioBufferFrom(startOffset);
      };

      const cachedBuf = this.decodedBufferCache.get(chunkKey);
      if (cachedBuf) {
        void playDecoded(cachedBuf);
        return;
      }

      try {
        const bytes = this.base64ToUint8Array(lectureData.audio);
        const arrayBuf: ArrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        ctx.decodeAudioData(
          arrayBuf,
          (decoded) => {
            if (this.decodedBufferCache.size > 40) {
              const firstKey = this.decodedBufferCache.keys().next().value;
              if (firstKey) this.decodedBufferCache.delete(firstKey);
            }
            this.decodedBufferCache.set(chunkKey, decoded);
            void playDecoded(decoded);
          },
          () => {
            if (this.currentSessionId === sessionId) {
              this.playLectureHtmlAudio(lectureData, sentences, this.currentRate, this.currentVolume, sessionId, opts);
            }
          }
        );
        return;
      } catch {
        // Fall through to HTMLAudioElement using exact same Fenrir WAV
      }
    }

    this.playLectureHtmlAudio(lectureData, sentences, safeRate, safeVol, sessionId, opts);
  }

  private playLectureHtmlAudio(
    lectureData: LectureAudioData,
    sentences: string[],
    rate: number,
    volume: number,
    sessionId: number,
    opts: LectureSpeakOptions
  ): void {
    try {
      const objectUrl = this.base64WavToObjectUrl(lectureData.audio);
      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
      }
      this.currentObjectUrl = objectUrl;

      const audio = this.getSharedAudio();
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;

      audio.src = objectUrl;
      const safeRate = Math.max(0.75, Math.min(2.0, rate));
      audio.playbackRate = safeRate;
      if ('preservesPitch' in audio) {
        (audio as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = true;
      }
      audio.volume = Math.max(0, Math.min(1, volume));

      const timings = lectureData.sentenceTimings;
      const tokenizedSentences = sentences.map((s) => tokenizeTextIntoWords(s));
      const wordRangesPerSentence = tokenizedSentences.map((toks) => computeWordProgressRanges(toks));
      let hasEnded = false;
      const startOffset = Math.max(0, opts.startTimeOffset || 0);

      const applyStartOffset = () => {
        if (startOffset > 0 && isFinite(audio.duration) && startOffset < audio.duration - 0.1) {
          try {
            audio.currentTime = startOffset;
          } catch {
            // Ignore pre-seek errors before metadata
          }
        }
      };

      audio.onloadedmetadata = () => {
        if (this.currentSessionId !== sessionId) return;
        applyStartOffset();
        opts.onStart?.(timings, audio.duration || lectureData.duration);
      };

      const sendProgress = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking || hasEnded) return;
        const dur =
          audio.duration && isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : lectureData.duration;
        const cur = Math.min(dur, Math.max(0, audio.currentTime));

        let sIdx = timings.length - 1;
        for (let i = 0; i < timings.length; i++) {
          if (cur < timings[i].end || i === timings.length - 1) {
            sIdx = i;
            break;
          }
        }

        const t = timings[sIdx] || { start: 0, end: dur };
        const segElapsed = Math.max(0, cur - t.start);
        const speechStart = t.speechStart !== undefined ? t.speechStart : t.start;
        const speechEnd = t.speechEnd !== undefined ? Math.max(speechStart + 0.25, t.speechEnd) : t.end;
        const speechDur = Math.max(0.25, speechEnd - speechStart);
        const speechFrac = Math.min(1, Math.max(0, (cur - speechStart) / speechDur));
        const words = tokenizedSentences[sIdx] || [];
        const ranges = wordRangesPerSentence[sIdx] || [];
        const wordIdx =
          ranges.length > 0
            ? findWeightedWordIndex(ranges, speechFrac)
            : words.length > 0
              ? Math.min(words.length - 1, Math.floor(speechFrac * words.length))
              : 0;

        opts.onProgress?.({
          currentTime: cur,
          duration: dur,
          sentenceIndex: sIdx,
          sentenceElapsed: segElapsed,
          wordIndex: wordIdx,
        });
      };

      audio.onplay = () => {
        if (this.currentSessionId !== sessionId) return;
        opts.onStart?.(timings, audio.duration || lectureData.duration);
      };

      audio.ontimeupdate = sendProgress;
      this.progressInterval = setInterval(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking && !this.isPaused) {
          sendProgress();
        }
      }, 50);

      audio.onended = () => {
        if (hasEnded || this.currentSessionId !== sessionId) return;
        hasEnded = true;
        this.clearAllTimers();
        this.isSpeaking = false;
        this.currentAudio = null;
        opts.onEnd?.();
      };

      audio.onerror = () => {
        if (this.currentSessionId !== sessionId) return;
        this.clearAllTimers();
        this.playFallbackLectureSequence(sentences, opts.startTimeOffset || 0, rate, volume, sessionId, opts);
      };

      this.currentAudio = audio;
      applyStartOffset();
      if (this.isPaused) return;
      audio.play().catch(() => {
        if (this.currentSessionId === sessionId) {
          this.clearAllTimers();
          this.playFallbackLectureSequence(sentences, opts.startTimeOffset || 0, rate, volume, sessionId, opts);
        }
      });
    } catch {
      this.playFallbackLectureSequence(sentences, opts.startTimeOffset || 0, rate, volume, sessionId, opts);
    }
  }

  private async playFallbackLectureSequence(
    sentences: string[],
    startOffsetSec: number,
    rate: number,
    volume: number,
    sessionId: number,
    opts: LectureSpeakOptions
  ): Promise<void> {
    // Ensure async browser voice list (e.g. Brave / Chromium / Firefox) is ready before speaking
    await this.ensureVoicesLoaded(450);
    if (this.currentSessionId !== sessionId) return;

    const estDurs = sentences.map((s) => this.estimateDuration(s, 1.0));
    const timings: SentenceTiming[] = [];
    let acc = 0;
    for (const d of estDurs) {
      timings.push({ start: acc, end: acc + d });
      acc += d;
    }
    const totalDuration = Math.max(1, acc);
    opts.onStart?.(timings, totalDuration);

    let startIdx = 0;
    for (let i = 0; i < timings.length; i++) {
      if (startOffsetSec < timings[i].end || i === timings.length - 1) {
        startIdx = i;
        break;
      }
    }

    // Split long multi-sentence paragraphs (and >24-word sentences at commas) without isolating tiny <6-word fragments
    const splitSubClauses = (line: string): Array<{ text: string; charStart: number; wordOffset: number }> => {
      const sentenceParts = line.match(/[^.!?]+(?:[.!?]+|$)/g) || [line];
      const fineParts: string[] = [];
      for (const sp of sentenceParts) {
        const trimmed = sp.trim();
        if (!trimmed) continue;
        if (tokenizeTextIntoWords(trimmed).length > 24) {
          const rawSub = trimmed.match(/[^,;—–]+(?:[,;—–]+|$)/g) || [trimmed];
          const mergedSub: string[] = [];
          for (const piece of rawSub) {
            const p = piece.trim();
            if (!p) continue;
            if (mergedSub.length > 0 && tokenizeTextIntoWords(mergedSub[mergedSub.length - 1]).length < 6) {
              mergedSub[mergedSub.length - 1] = `${mergedSub[mergedSub.length - 1]} ${p}`;
            } else {
              mergedSub.push(p);
            }
          }
          if (mergedSub.length > 1 && tokenizeTextIntoWords(mergedSub[mergedSub.length - 1]).length < 5) {
            const tail = mergedSub.pop()!;
            mergedSub[mergedSub.length - 1] = `${mergedSub[mergedSub.length - 1]} ${tail}`;
          }
          for (const m of mergedSub) {
            fineParts.push(m);
          }
        } else {
          fineParts.push(trimmed);
        }
      }
      const parts: Array<{ text: string; charStart: number; wordOffset: number }> = [];
      let cursorChar = 0;
      let wordAcc = 0;
      for (const trimmed of fineParts) {
        const foundAt = line.indexOf(trimmed, cursorChar);
        const charStart = foundAt >= 0 ? foundAt : cursorChar;
        const tokCount = tokenizeTextIntoWords(trimmed).length;
        parts.push({ text: trimmed, charStart, wordOffset: wordAcc });
        cursorChar = charStart + trimmed.length;
        wordAcc += tokCount;
      }
      return parts.length > 0 ? parts : [{ text: line, charStart: 0, wordOffset: 0 }];
    };

    const speakFrom = (idx: number) => {
      if (this.currentSessionId !== sessionId) return;
      if (idx >= sentences.length) {
        this.clearAllTimers();
        this.isSpeaking = false;
        opts.onEnd?.();
        return;
      }
      const line = sentences[idx];
      const baseStart = timings[idx].start;
      const tokens = tokenizeTextIntoWords(line);
      const subClauses = splitSubClauses(line);
      const activeRate = Math.max(0.75, Math.min(2.0, this.currentRate || rate));

      const speakSubClause = (subIdx: number) => {
        if (this.currentSessionId !== sessionId) return;
        if (subIdx >= subClauses.length) {
          this.fallbackWatchdog = setTimeout(() => {
            if (this.currentSessionId === sessionId) {
              speakFrom(idx + 1);
            }
          }, 140);
          return;
        }

        const clause = subClauses[subIdx];
        const subTokens = tokenizeTextIntoWords(clause.text);
        const subRanges = computeWordProgressRanges(subTokens);
        const selectedVoice = this.getBestBrowserVoice();
        const acousticForClause = this.getBrowserAcousticProfile(selectedVoice, activeRate);
        const effectiveRateFactor = Math.max(0.65, acousticForClause.rate);
        const liveWps = Math.max(1.5, Math.min(3.8, this.calibratedBrowserWps));
        const estSubDur = Math.max(0.75, (subTokens.length / liveWps) / effectiveRateFactor);

        let speechStarted = false;
        let speechStartMs = Date.now();
        let anchorTimeMs = speechStartMs;
        let anchorFrac = 0;
        let lastBoundaryEventMs = 0;

        this.clearAllTimers();
        const startHighlightLoop = () => {
          if (this.currentSessionId !== sessionId) return;
          this.fallbackInterval = setInterval(() => {
            if (this.currentSessionId !== sessionId || !this.isSpeaking || this.isPaused || !speechStarted) {
              return;
            }
            const now = Date.now();
            // If exact onboundary fired < 260ms ago, let it hold cleanly without jitter; otherwise interpolate smoothly from last anchor
            if (lastBoundaryEventMs > 0 && now - lastBoundaryEventMs < 260) {
              return;
            }
            const curRate = Math.max(0.75, Math.min(2.0, this.currentRate || activeRate));
            const curAcoustic = this.getBrowserAcousticProfile(selectedVoice, curRate);
            const curEffectiveRate = Math.max(0.65, curAcoustic.rate);
            const curEstDur = Math.max(0.75, (subTokens.length / Math.max(1.5, Math.min(3.8, this.calibratedBrowserWps))) / curEffectiveRate);
            const elapsedSinceAnchor = Math.max(0, (now - anchorTimeMs) / 1000);
            const frac = Math.min(0.985, anchorFrac + elapsedSinceAnchor / curEstDur);
            const localWIdx =
              subRanges.length > 0
                ? findWeightedWordIndex(subRanges, frac)
                : Math.min(Math.max(0, subTokens.length - 1), Math.floor(frac * subTokens.length));
            const globalWIdx = Math.min(Math.max(0, tokens.length - 1), clause.wordOffset + localWIdx);
            const lineFrac = (globalWIdx + 0.5) / Math.max(1, tokens.length);
            const syncedElapsed = lineFrac * estDurs[idx];

            opts.onProgress?.({
              currentTime: Math.min(totalDuration, baseStart + syncedElapsed),
              duration: totalDuration,
              sentenceIndex: idx,
              sentenceElapsed: syncedElapsed,
              wordIndex: globalWIdx,
            });
          }, 40);
        };

        let clauseDone = false;
        const advanceClause = () => {
          if (clauseDone || this.currentSessionId !== sessionId) return;
          clauseDone = true;
          this.clearAllTimers();
          if (speechStarted && subTokens.length >= 6) {
            const actualSec = Math.max(0.6, (Date.now() - speechStartMs) / 1000);
            const measuredWps = (subTokens.length / actualSec) / effectiveRateFactor;
            if (measuredWps >= 1.4 && measuredWps <= 4.2) {
              this.calibratedBrowserWps = this.calibratedBrowserWps * 0.45 + measuredWps * 0.55;
            }
          }
          speakSubClause(subIdx + 1);
        };

        if (typeof window !== 'undefined' && window.speechSynthesis && volume > 0) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(clause.text);
            if (selectedVoice) utterance.voice = selectedVoice;
            utterance.rate = acousticForClause.rate;
            utterance.pitch = acousticForClause.pitch;
            utterance.volume = Math.max(0, Math.min(1, this.currentVolume ?? volume));

            utterance.onstart = () => {
              if (this.currentSessionId !== sessionId || clauseDone) return;
              speechStarted = true;
              speechStartMs = Date.now();
              anchorTimeMs = speechStartMs;
              anchorFrac = 0;
              lastBoundaryEventMs = 0;
              const globalWIdx = Math.min(Math.max(0, tokens.length - 1), clause.wordOffset);
              const syncedElapsed = (globalWIdx / Math.max(1, tokens.length)) * estDurs[idx];
              opts.onProgress?.({
                currentTime: Math.min(totalDuration, baseStart + syncedElapsed),
                duration: totalDuration,
                sentenceIndex: idx,
                sentenceElapsed: syncedElapsed,
                wordIndex: globalWIdx,
              });
              startHighlightLoop();
            };

            utterance.onboundary = (e) => {
              if (this.currentSessionId !== sessionId || clauseDone) return;
              const now = Date.now();
              if (!speechStarted) {
                speechStarted = true;
                speechStartMs = now;
              }
              const charIdx = Math.max(0, e.charIndex || 0);
              let localWIdx = Math.max(0, subTokens.length - 1);
              for (let i = 0; i < subTokens.length; i++) {
                if (charIdx >= subTokens[i].startChar && charIdx <= subTokens[i].endChar) {
                  localWIdx = i;
                  break;
                } else if (charIdx < subTokens[i].startChar) {
                  localWIdx = Math.max(0, i - 1);
                  break;
                }
              }
              anchorFrac = subRanges[localWIdx]?.startFrac ?? (localWIdx / Math.max(1, subTokens.length));
              anchorTimeMs = now;
              lastBoundaryEventMs = now;

              // Dynamically tune live WPS mid-clause when word boundaries advance smoothly
              const elapsedSec = (now - speechStartMs) / 1000;
              if (localWIdx >= 3 && elapsedSec > 0.7 && anchorFrac > 0.12) {
                const liveMeasuredWps = ((localWIdx + 0.5) / elapsedSec) / effectiveRateFactor;
                if (liveMeasuredWps >= 1.5 && liveMeasuredWps <= 4.2) {
                  this.calibratedBrowserWps = this.calibratedBrowserWps * 0.7 + liveMeasuredWps * 0.3;
                }
              }

              const globalWIdx = Math.min(Math.max(0, tokens.length - 1), clause.wordOffset + localWIdx);
              const progressFrac = Math.min(1, (globalWIdx + 0.5) / Math.max(1, tokens.length));
              const syncedElapsed = progressFrac * estDurs[idx];
              opts.onProgress?.({
                currentTime: Math.min(totalDuration, baseStart + syncedElapsed),
                duration: totalDuration,
                sentenceIndex: idx,
                sentenceElapsed: syncedElapsed,
                wordIndex: globalWIdx,
              });
            };

            utterance.onend = advanceClause;
            utterance.onerror = advanceClause;

            // Safety start trigger if browser omits onstart
            setTimeout(() => {
              if (this.currentSessionId === sessionId && !clauseDone && !speechStarted) {
                speechStarted = true;
                speechStartMs = Date.now();
                anchorTimeMs = speechStartMs;
                startHighlightLoop();
              }
            }, 350);

            this.fallbackWatchdog = setTimeout(advanceClause, Math.max(4.0, estSubDur * 1.55 + 3.0) * 1000);
            this.currentUtterance = utterance;
            window.speechSynthesis.speak(utterance);
            return;
          } catch {
            // Fall through to silent synced advance
          }
        }
        speechStarted = true;
        speechStartMs = Date.now();
        anchorTimeMs = speechStartMs;
        startHighlightLoop();
        this.fallbackWatchdog = setTimeout(advanceClause, estSubDur * 1000);
      };

      const lineOffset = idx === startIdx ? Math.max(0, startOffsetSec - baseStart) : 0;
      const startSubIdx =
        lineOffset > 0.8 && subClauses.length > 1
          ? Math.min(subClauses.length - 1, Math.floor((lineOffset / Math.max(1, estDurs[idx])) * subClauses.length))
          : 0;
      speakSubClause(startSubIdx);
    };

    speakFrom(startIdx);
  }

  public speak(
    textOrOptions: string | SpeakOptions,
    rate: number = 1.0,
    volume: number = 0.9,
    onEnd?: () => void
  ): void {
    const opts: SpeakOptions =
      typeof textOrOptions === 'string'
        ? { text: textOrOptions, rate, volume, onEnd }
        : textOrOptions;

    const cleanText = (opts.text || '').trim();
    if (!cleanText) {
      if (opts.onEnd) opts.onEnd();
      return;
    }

    this.unlockOnUserGesture();
    this.stop();
    const sessionId = ++this.currentSessionId;
    this.isSpeaking = true;
    this.isPaused = false;

    const actualRate = Math.max(0.75, Math.min(2.0, opts.rate || this.currentRate || 1.0));
    const actualVolume = Math.max(0, Math.min(1, opts.volume !== undefined ? opts.volume : this.currentVolume));
    this.currentRate = actualRate;
    this.currentVolume = actualVolume;
    const cacheKey = `${this.selectedVoice}_${cleanText}`;

    if (this.audioCache.has(cacheKey)) {
      const base64Audio = this.audioCache.get(cacheKey)!;
      this.playBase64Audio(base64Audio, cleanText, actualRate, actualVolume, sessionId, opts);
      return;
    }

    this.fetchTtsAudio(cleanText).then((base64Audio) => {
      if (this.currentSessionId !== sessionId) return;
      if (base64Audio) {
        this.playBase64Audio(base64Audio, cleanText, this.currentRate, this.currentVolume, sessionId, opts);
      } else {
        this.fallbackSpeak(cleanText, this.currentRate, this.currentVolume, sessionId, opts);
      }
    });
  }

  private getSharedAudio(): HTMLAudioElement {
    if (!this.sharedAudio) {
      this.sharedAudio = new Audio();
      this.sharedAudio.preload = 'auto';
    }
    return this.sharedAudio;
  }

  private playBase64Audio(
    base64Audio: string,
    text: string,
    rate: number,
    volume: number,
    sessionId: number,
    opts: SpeakOptions
  ): void {
    const cacheKey = `${this.selectedVoice}_${text}`;
    const tokens = tokenizeTextIntoWords(text);
    const wordRanges = computeWordProgressRanges(tokens);
    const safeRate = Math.max(0.75, Math.min(2.0, rate));
    const safeVol = Math.max(0, Math.min(1, volume));

    // Primary Cross-Platform Engine: Hardware-clock Web Audio API (same Fenrir engine as lecture player!)
    const ctx = this.getAudioContext();
    if (ctx) {
      const playDecodedSingle = async (audioBuffer: AudioBuffer) => {
        if (this.currentSessionId !== sessionId) return;
        const isRunning = await this.ensureAudioContextRunning(ctx);
        if (this.currentSessionId !== sessionId) return;
        if (!isRunning) {
          this.playSingleHtmlAudio(base64Audio, text, this.currentRate, this.currentVolume, sessionId, opts);
          return;
        }
        this.webAudioMode = 'single';
        this.webAudioOpts = null;
        this.webAudioBuffer = audioBuffer;
        this.webAudioRate = Math.max(0.75, Math.min(2.0, this.currentRate || safeRate));
        this.webAudioVolume = Math.max(0, Math.min(1, this.currentVolume));
        this.webAudioSingleOpts = opts;
        this.webAudioSingleTokens = tokens;
        this.webAudioSingleWordRanges = wordRanges;
        this.webAudioSessionId = sessionId;
        opts.onStart?.((audioBuffer.duration || 1) / this.webAudioRate);
        if (this.isPaused) {
          this.webAudioStartOffset = 0;
          return;
        }
        this.startWebAudioBufferFrom(0);
      };

      const cachedBuf = this.decodedBufferCache.get(cacheKey);
      if (cachedBuf) {
        void playDecodedSingle(cachedBuf);
        return;
      }

      try {
        const bytes = this.base64ToUint8Array(base64Audio);
        const arrayBuf: ArrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        ctx.decodeAudioData(
          arrayBuf,
          (decoded) => {
            if (this.decodedBufferCache.size > 40) {
              const firstKey = this.decodedBufferCache.keys().next().value;
              if (firstKey) this.decodedBufferCache.delete(firstKey);
            }
            this.decodedBufferCache.set(cacheKey, decoded);
            void playDecodedSingle(decoded);
          },
          () => {
            if (this.currentSessionId === sessionId) {
              this.playSingleHtmlAudio(base64Audio, text, this.currentRate, this.currentVolume, sessionId, opts);
            }
          }
        );
        return;
      } catch {
        // Fall through to Blob HTMLAudio
      }
    }

    this.playSingleHtmlAudio(base64Audio, text, safeRate, safeVol, sessionId, opts);
  }

  private playSingleHtmlAudio(
    base64Audio: string,
    text: string,
    rate: number,
    volume: number,
    sessionId: number,
    opts: SpeakOptions
  ): void {
    try {
      const objectUrl = this.base64WavToObjectUrl(base64Audio);
      if (this.currentObjectUrl) {
        URL.revokeObjectURL(this.currentObjectUrl);
      }
      this.currentObjectUrl = objectUrl;

      const audio = this.getSharedAudio();
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;

      audio.src = objectUrl;
      const safeRate = Math.max(0.75, Math.min(2.0, rate));
      audio.playbackRate = safeRate;
      if ('preservesPitch' in audio) {
        (audio as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = true;
      }
      audio.volume = Math.max(0, Math.min(1, volume));

      const tokens = tokenizeTextIntoWords(text);
      const cacheKey = `${this.selectedVoice}_${text}`;
      let baseDuration =
        this.audioDurationCache.get(cacheKey) ||
        this.extractWavDuration(cacheKey, base64Audio) ||
        this.estimateDuration(text, 1.0);

      let hasEnded = false;

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          baseDuration = audio.duration;
          this.audioDurationCache.set(cacheKey, audio.duration);
          this.notifyDurationsUpdated();
        }
      };

      const sendProgress = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking || hasEnded) return;
        const dur =
          audio.duration && isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : baseDuration;
        const cur = audio.currentTime;
        const fraction = Math.min(1, Math.max(0, cur / Math.max(0.1, dur)));
        const wordIdx = Math.min(tokens.length - 1, Math.floor(fraction * tokens.length));
        const activeToken = tokens[wordIdx];

        opts.onProgress?.({
          currentTime: cur / audio.playbackRate,
          duration: dur / audio.playbackRate,
          progressFraction: fraction,
          wordIndex: wordIdx,
          charIndex: activeToken ? activeToken.startChar : 0,
          word: activeToken ? activeToken.word : '',
        });
      };

      audio.onplay = () => {
        if (this.currentSessionId !== sessionId) return;
        const dur =
          audio.duration && isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : baseDuration;
        opts.onStart?.(dur / audio.playbackRate);
      };

      audio.ontimeupdate = sendProgress;
      this.progressInterval = setInterval(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking && !this.isPaused) {
          sendProgress();
        }
      }, 50);

      const handleDone = () => {
        if (hasEnded || this.currentSessionId !== sessionId) return;
        hasEnded = true;
        this.clearAllTimers();
        this.isSpeaking = false;
        this.currentAudio = null;
        const dur =
          audio.duration && isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : baseDuration;

        opts.onProgress?.({
          currentTime: dur / audio.playbackRate,
          duration: dur / audio.playbackRate,
          progressFraction: 1,
          wordIndex: Math.max(0, tokens.length - 1),
          charIndex: text.length,
          word: tokens[tokens.length - 1]?.word || '',
        });
        opts.onEnd?.();
      };

      audio.onended = handleDone;
      audio.onerror = () => {
        if (this.currentSessionId !== sessionId) return;
        this.clearAllTimers();
        this.fallbackSpeak(text, rate, volume, sessionId, opts);
      };

      this.currentAudio = audio;
      audio.play().catch(() => {
        if (this.currentSessionId === sessionId) {
          this.clearAllTimers();
          this.fallbackSpeak(text, rate, volume, sessionId, opts);
        }
      });
    } catch {
      this.fallbackSpeak(text, rate, volume, sessionId, opts);
    }
  }

  private async fallbackSpeak(
    text: string,
    rate: number = 1.0,
    volume: number = 0.9,
    sessionId: number,
    opts: SpeakOptions
  ): Promise<void> {
    await this.ensureVoicesLoaded(450);
    if (this.currentSessionId !== sessionId) return;

    const tokens = tokenizeTextIntoWords(text);
    const estDuration = this.estimateDuration(text, rate);
    const startTime = Date.now();
    let hasFinished = false;

    const finishFallback = () => {
      if (hasFinished || this.currentSessionId !== sessionId) return;
      hasFinished = true;
      this.clearAllTimers();
      this.isSpeaking = false;
      this.currentUtterance = null;
      opts.onProgress?.({
        currentTime: estDuration,
        duration: estDuration,
        progressFraction: 1,
        wordIndex: Math.max(0, tokens.length - 1),
        charIndex: text.length,
        word: tokens[tokens.length - 1]?.word || '',
      });
      opts.onEnd?.();
    };

    this.fallbackInterval = setInterval(() => {
      if (this.currentSessionId !== sessionId || !this.isSpeaking || this.isPaused) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const fraction = Math.min(0.98, elapsed / Math.max(0.5, estDuration));
      const wordIdx = Math.min(tokens.length - 1, Math.floor(fraction * tokens.length));
      const activeToken = tokens[wordIdx];

      opts.onProgress?.({
        currentTime: elapsed,
        duration: estDuration,
        progressFraction: fraction,
        wordIndex: wordIdx,
        charIndex: activeToken ? activeToken.startChar : 0,
        word: activeToken ? activeToken.word : '',
      });
    }, 60);

    if (typeof window === 'undefined' || !window.speechSynthesis || volume <= 0) {
      opts.onStart?.(estDuration);
      this.fallbackWatchdog = setTimeout(finishFallback, estDuration * 1000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getBestBrowserVoice();
      if (voice) utterance.voice = voice;
      const acoustic = this.getBrowserAcousticProfile(voice, rate);

      utterance.rate = acoustic.rate;
      utterance.pitch = acoustic.pitch;
      utterance.volume = Math.max(0, Math.min(1, volume));

      utterance.onstart = () => {
        if (this.currentSessionId !== sessionId) return;
        opts.onStart?.(estDuration);
      };

      utterance.onboundary = (e) => {
        if (this.currentSessionId !== sessionId) return;
        const charIdx = Math.max(0, e.charIndex || 0);
        let foundWordIdx = Math.max(0, tokens.length - 1);
        for (let i = 0; i < tokens.length; i++) {
          if (charIdx >= tokens[i].startChar && charIdx <= tokens[i].endChar) {
            foundWordIdx = i;
            break;
          } else if (charIdx < tokens[i].startChar) {
            foundWordIdx = Math.max(0, i - 1);
            break;
          }
        }
        const elapsedSec = (Date.now() - startTime) / 1000;
        const fraction = Math.min(1, Math.max(0, charIdx / Math.max(1, text.length)));
        const activeToken = tokens[foundWordIdx];
        opts.onProgress?.({
          currentTime: elapsedSec,
          duration: estDuration,
          progressFraction: fraction,
          wordIndex: foundWordIdx,
          charIndex: charIdx,
          word: activeToken ? activeToken.word : '',
        });
      };

      utterance.onend = finishFallback;
      utterance.onerror = finishFallback;

      this.fallbackWatchdog = setTimeout(finishFallback, (estDuration + 2.0) * 1000);
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.fallbackWatchdog = setTimeout(finishFallback, estDuration * 1000);
    }
  }

  private clearAllTimers() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }
    if (this.fallbackWatchdog) {
      clearTimeout(this.fallbackWatchdog);
      this.fallbackWatchdog = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
    if (this.webAudioPlaying && this.audioCtx && this.webAudioBuffer) {
      this.webAudioStartOffset = this.getWebAudioCurrentPos();
      this.stopWebAudioNode();
    }
    if (this.currentAudio && !this.currentAudio.paused) {
      try {
        this.currentAudio.pause();
      } catch {
        // Ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.pause();
      } catch {
        // Ignore
      }
    }
  }

  public resume(): void {
    this.unlockOnUserGesture();
    this.isPaused = false;
    if (this.webAudioBuffer && !this.webAudioPlaying && this.webAudioSessionId === this.currentSessionId) {
      const ctx = this.getAudioContext();
      if (ctx && (ctx.state as string) !== 'running') {
        ctx.resume().catch(() => {});
      }
      this.startWebAudioBufferFrom(this.webAudioStartOffset);
      return;
    }
    if (this.currentAudio && this.currentAudio.paused) {
      try {
        this.currentAudio.play();
      } catch {
        // Ignore
      }
    }
    if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
      } catch {
        // Ignore
      }
    }
  }

  public stop(preserveChunkPlan: boolean = false): void {
    this.currentSessionId++;
    this.clearAllTimers();
    this.stopWebAudioNode();
    this.webAudioBuffer = null;
    this.webAudioMode = null;
    this.webAudioSingleOpts = null;
    this.webAudioSingleTokens = [];
    if (!preserveChunkPlan) {
      this.activeLectureChunks = [];
      this.activeLectureOpts = null;
      this.activeChunkIndex = 0;
      this.activeChunkStartOffset = 0;
      this.activeLectureTotalDuration = 0;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.onloadedmetadata = null;
        this.currentAudio.ontimeupdate = null;
        this.currentAudio.onplay = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }

    if (this.currentObjectUrl) {
      try {
        URL.revokeObjectURL(this.currentObjectUrl);
      } catch {
        // Ignore
      }
      this.currentObjectUrl = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
      this.currentUtterance = null;
    }

    this.isSpeaking = false;
    this.isPaused = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public playSound(type: 'play' | 'pause' | 'correct' | 'wrong' | 'checkpoint' | 'click'): void {
    if (this.currentVolume === 0) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      if ((ctx.state as string) !== 'running') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'play') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'pause') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          const t = now + idx * 0.08;
          g.gain.setValueAtTime(0.1, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
          o.start(t);
          o.stop(t + 0.32);
        });
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'checkpoint') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // Ignore WebAudio errors
    }
  }
}

export const audioNarrator = new AudioNarrator();
