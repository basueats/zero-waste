// Audio & Voice Narration Engine for Supritamone Academy
// Real Human Male Speech Synthesis for Dr. Chef Supritam Basu via Gemini 3.8 Flash Lite TTS + Web Audio & Web Speech API

export type TTSVoiceName = 'Fenrir' | 'Charon' | 'Puck' | 'Kore' | 'Zephyr';

export interface TTSVoiceOption {
  id: TTSVoiceName;
  label: string;
  description: string;
  gender: 'male' | 'female';
}

export const AVAILABLE_VOICES: TTSVoiceOption[] = [
  { id: 'Fenrir', label: 'Dr. Chef Basu (Calm Baritone Chef)', description: 'Calm, deep, warm, articulate human male voice with unhurried culinary cadence', gender: 'male' },
  { id: 'Charon', label: 'Dr. Chef Basu (Conversational Chef)', description: 'Warm, natural conversational master chef voice', gender: 'male' },
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

export interface SentenceTiming {
  start: number;
  end: number;
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
}

const CALM_MALE_STYLE =
  'Calm, deep, unhurried, reassuring human male voice of an experienced executive master chef and university professor teaching peacefully in a quiet studio, warm clear articulation, steady natural pacing';

class AudioNarrator {
  private audioCtx: AudioContext | null = null;
  private sharedAudio: HTMLAudioElement | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentObjectUrl: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private audioCache: Map<string, string> = new Map(); // cacheKey -> base64 WAV
  private audioDurationCache: Map<string, number> = new Map(); // cacheKey -> exact duration in seconds at 1.0x
  private inFlightFetches: Map<string, Promise<string | null>> = new Map();
  private lectureCache: Map<string, LectureAudioData> = new Map();
  private lectureInFlight: Map<string, Promise<LectureAudioData | null>> = new Map();
  private lectureQuotaHit: boolean = false;
  private durationListeners: Set<() => void> = new Set();
  private selectedVoice: TTSVoiceName = 'Fenrir';
  private currentSessionId: number = 0;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private fallbackInterval: ReturnType<typeof setInterval> | null = null;
  private fallbackWatchdog: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {};
      }
    }
  }

  public getVoice(): TTSVoiceName {
    return this.selectedVoice;
  }

  public setVoice(voice: TTSVoiceName): void {
    this.selectedVoice = voice;
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
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Parse exact duration in seconds from WAV RIFF subchunks ('fmt ' & 'data')
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
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.audioDurationCache.set(cacheKey, audio.duration);
          this.notifyDurationsUpdated();
        }
      };
    } catch {
      // Ignore
    }
  }

  // Exact or pre-calculated speaking duration (~2.15 words/sec for calm male delivery at 1.0x)
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

  // Group long transcripts cleanly into ~55s cohesive spoken chunks (~125 words each) for seamless Fenrir narration
  private splitLectureIntoChunks(sentences: string[]): Array<{
    chunkIndex: number;
    startSentenceIdx: number;
    sentences: string[];
    estStart: number;
    estEnd: number;
    estDuration: number;
  }> {
    const clean = sentences.map((s) => s.trim()).filter(Boolean);
    if (clean.length === 0) return [];

    const chunks: Array<{
      chunkIndex: number;
      startSentenceIdx: number;
      sentences: string[];
      estStart: number;
      estEnd: number;
      estDuration: number;
    }> = [];

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

  // Synthesize & cache entire lecture as ONE unified Fenrir human male WAV file
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
      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        try {
          const res = await fetch('/api/tts/lecture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              sentences: cleanSentences,
              voice: this.selectedVoice,
              style: CALM_MALE_STYLE,
            }),
          });
          clearTimeout(timeoutId);
          if (res.status === 429) {
            this.lectureQuotaHit = true;
            return null;
          }
          if (res.status === 503) {
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
            this.lectureCache.set(key, payload);
            this.lectureQuotaHit = false;
            cleanSentences.forEach((s, idx) => {
              const timing = payload.sentenceTimings[idx];
              if (timing) {
                this.audioDurationCache.set(`${this.selectedVoice}_${s}`, Math.max(0.5, timing.end - timing.start));
              }
            });
            this.notifyDurationsUpdated();
            return payload;
          }
        } catch {
          clearTimeout(timeoutId);
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 400));
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

  // Fetch & deduplicate single-line TTS audio
  private fetchTtsAudio(cleanText: string): Promise<string | null> {
    const cacheKey = `${this.selectedVoice}_${cleanText}`;
    if (this.audioCache.has(cacheKey)) {
      return Promise.resolve(this.audioCache.get(cacheKey)!);
    }
    if (this.inFlightFetches.has(cacheKey)) {
      return this.inFlightFetches.get(cacheKey)!;
    }

    const attemptFetch = async (): Promise<string | null> => {
      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              text: cleanText,
              voice: this.selectedVoice,
              style: CALM_MALE_STYLE,
            }),
          });
          clearTimeout(timeoutId);
          if (res.status === 503 || res.status === 429) {
            return null;
          }
          if (!res.ok) {
            throw new Error('TTS server returned ' + res.status);
          }
          const data = await res.json();
          if (data?.audio) {
            this.audioCache.set(cacheKey, data.audio);
            this.extractWavDuration(cacheKey, data.audio);
            return data.audio as string;
          }
        } catch {
          clearTimeout(timeoutId);
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 350));
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

  // Pre-load lecture narrations (single unified track when multi-sentence)
  public async prefetch(texts: string[]): Promise<void> {
    if (typeof window === 'undefined' || texts.length === 0) return;
    if (texts.length > 1) {
      await this.fetchLectureAudio(texts);
      return;
    }
    await this.fetchTtsAudio(texts[0].trim());
  }

  // Best calm male voice selector for browser fallback (strictly excludes female voices)
  private getBestBrowserVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleDenyList = [
      'female', 'samantha', 'victoria', 'karen', 'zira', 'jenny', 'aria', 'susan',
      'hazel', 'fiona', 'moira', 'tessa', 'veena', 'serena', 'kate', 'libby', 'sonia',
      'claire', 'allison', 'ava', 'nicky', 'joana', 'monica', 'paulina', 'amelie',
      'kore', 'zephyr', 'aoede', 'leda', 'us english',
    ];
    const isFemale = (v: SpeechSynthesisVoice) => {
      const lower = v.name.toLowerCase();
      if (lower.includes('male') && !lower.includes('female')) return false;
      return femaleDenyList.some((token) => lower.includes(token));
    };

    const preferredMaleNames = [
      'Daniel',
      'Arthur',
      'George',
      'Oliver',
      'Google UK English Male',
      'Microsoft Ryan',
      'Microsoft Guy',
      'Microsoft Christopher',
      'Alex',
      'David',
      'Mark',
      'James',
      'Fred',
      'Aaron',
      'Ralph',
    ];

    for (const name of preferredMaleNames) {
      const match = voices.find(
        (v) => v.lang.startsWith('en') && !isFemale(v) && v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (match) return match;
    }

    const naturalEnMale = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        !isFemale(v) &&
        (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('male'))
    );
    if (naturalEnMale) return naturalEnMale;

    return voices.find((v) => v.lang.startsWith('en') && !isFemale(v)) || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  // Update volume live without restarting playback
  public setVolume(volume: number): void {
    const safeVol = Math.max(0, Math.min(1, volume));
    if (this.currentAudio) {
      this.currentAudio.volume = safeVol;
    }
  }

  // Update playback rate live without restarting playback
  public setRate(rate: number): void {
    const safeRate = Math.max(0.75, Math.min(2.0, rate));
    if (this.currentAudio) {
      this.currentAudio.playbackRate = safeRate;
    }
  }

  public getQuotaReached(): boolean {
    return this.lectureQuotaHit;
  }

  private activeLectureChunks: Array<{
    chunkIndex: number;
    startSentenceIdx: number;
    sentences: string[];
    estStart: number;
    estEnd: number;
    estDuration: number;
  }> = [];
  private activeChunkIndex: number = 0;
  private activeChunkStartOffset: number = 0;
  private activeLectureTotalDuration: number = 0;
  private activeLectureOpts: LectureSpeakOptions | null = null;

  // Seek instantaneously inside active chunk OR seamlessly jump to target chunk in hour-long chapters
  public seekTo(seconds: number): boolean {
    if (!this.activeLectureOpts || this.activeLectureChunks.length === 0) {
      if (this.currentAudio && isFinite(this.currentAudio.duration) && this.currentAudio.duration > 0) {
        const clamped = Math.max(0, Math.min(this.currentAudio.duration - 0.05, seconds));
        this.currentAudio.currentTime = clamped;
        return true;
      }
      return false;
    }

    const chunks = this.activeLectureChunks;
    const clampedGlobal = Math.max(0, Math.min(this.activeLectureTotalDuration - 0.05, seconds));
    let targetIdx = 0;
    for (let i = chunks.length - 1; i >= 0; i--) {
      if (clampedGlobal >= chunks[i].estStart) {
        targetIdx = i;
        break;
      }
    }

    if (
      targetIdx === this.activeChunkIndex &&
      this.currentAudio &&
      isFinite(this.currentAudio.duration) &&
      this.currentAudio.duration > 0
    ) {
      const localSec = Math.max(0, Math.min(this.currentAudio.duration - 0.05, clampedGlobal - chunks[targetIdx].estStart));
      this.currentAudio.currentTime = localSec;
      return true;
    }

    const localOffset = Math.max(0, clampedGlobal - chunks[targetIdx].estStart);
    this.startLectureAtChunk(targetIdx, localOffset, this.activeLectureOpts);
    return true;
  }

  private base64WavToObjectUrl(base64Audio: string): string {
    const binStr = atob(base64Audio);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  }

  // Play ANY length lecture smoothly via windowed Fenrir WAV chunks with zero voice switching & synced slides/captions
  public speakLecture(opts: LectureSpeakOptions): void {
    const cleanSentences = (opts.sentences || []).map((s) => s.trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      opts.onEnd?.();
      return;
    }

    this.getAudioContext();
    this.getSharedAudio();

    const chunks = this.splitLectureIntoChunks(cleanSentences);
    const totalDur = chunks.length > 0 ? chunks[chunks.length - 1].estEnd : 1;
    const targetSec = Math.max(0, Math.min(totalDur - 0.05, opts.startTimeOffset || 0));

    let startChunkIdx = 0;
    for (let i = chunks.length - 1; i >= 0; i--) {
      if (targetSec >= chunks[i].estStart) {
        startChunkIdx = i;
        break;
      }
    }

    this.activeLectureChunks = chunks;
    this.activeLectureTotalDuration = totalDur;
    this.activeLectureOpts = opts;

    const localOffset = Math.max(0, targetSec - chunks[startChunkIdx].estStart);
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
    this.activeChunkStartOffset = chunks[chunkIdx].estStart;

    const chunk = chunks[chunkIdx];
    const actualRate = opts.rate || 1.0;
    const actualVolume = opts.volume !== undefined ? opts.volume : 0.9;
    const key = this.getLectureKey(chunk.sentences);

    if (chunkIdx + 1 < chunks.length) {
      setTimeout(() => {
        if (this.currentSessionId === sessionId) {
          this.fetchLectureAudio(chunks[chunkIdx + 1].sentences);
        }
      }, 600);
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
      this.playLectureWav(this.lectureCache.get(key)!, chunk.sentences, actualRate, actualVolume, sessionId, chunkOpts);
      return;
    }

    this.fetchLectureAudio(chunk.sentences).then((data) => {
      if (this.currentSessionId !== sessionId) return;
      if (data) {
        this.playLectureWav(data, chunk.sentences, actualRate, actualVolume, sessionId, chunkOpts);
      } else {
        if (this.lectureQuotaHit) {
          opts.onQuotaFallback?.();
        }
        this.playFallbackLectureSequence(chunk.sentences, localOffsetSec, actualRate, actualVolume, sessionId, chunkOpts);
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
        const segDur = Math.max(0.25, t.end - t.start);
        const segElapsed = Math.max(0, cur - t.start);
        const segFrac = Math.min(1, segElapsed / segDur);
        const words = tokenizedSentences[sIdx] || [];
        const wordIdx = words.length > 0 ? Math.min(words.length - 1, Math.floor(segFrac * words.length)) : 0;

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

  private playFallbackLectureSequence(
    sentences: string[],
    startOffsetSec: number,
    rate: number,
    volume: number,
    sessionId: number,
    opts: LectureSpeakOptions
  ): void {
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
      const lineOffset = idx === startIdx ? Math.max(0, startOffsetSec - baseStart) : 0;
      const estLineDur = Math.max(0.5, (timings[idx].end - timings[idx].start - lineOffset) / rate);
      const tokens = tokenizeTextIntoWords(line);

      // Run a fresh timer + consistent single browser male voice for this sentence
      const lineStartMs = Date.now();
      this.clearAllTimers();
      this.fallbackInterval = setInterval(() => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking || this.isPaused) return;
        const elapsed = (Date.now() - lineStartMs) / 1000;
        const frac = Math.min(0.99, (lineOffset + elapsed * rate) / Math.max(0.5, estDurs[idx]));
        const wIdx = Math.min(tokens.length - 1, Math.floor(frac * tokens.length));
        opts.onProgress?.({
          currentTime: Math.min(totalDuration, baseStart + lineOffset + elapsed * rate),
          duration: totalDuration,
          sentenceIndex: idx,
          sentenceElapsed: lineOffset + elapsed * rate,
          wordIndex: Math.max(0, wIdx),
        });
      }, 60);

      let lineDone = false;
      const advance = () => {
        if (lineDone || this.currentSessionId !== sessionId) return;
        lineDone = true;
        this.clearAllTimers();
        speakFrom(idx + 1);
      };

      if (typeof window !== 'undefined' && window.speechSynthesis && volume > 0) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(line);
          const voice = this.getBestBrowserVoice();
          if (voice) utterance.voice = voice;
          utterance.rate = Math.max(0.8, Math.min(1.8, rate * 0.92));
          utterance.pitch = 0.85;
          utterance.volume = Math.max(0, Math.min(1, volume));
          utterance.onend = advance;
          utterance.onerror = advance;
          this.fallbackWatchdog = setTimeout(advance, (estLineDur + 1.5) * 1000);
          this.currentUtterance = utterance;
          window.speechSynthesis.speak(utterance);
          return;
        } catch {
          // Fall through to silent synced advance
        }
      }
      this.fallbackWatchdog = setTimeout(advance, estLineDur * 1000);
    };

    speakFrom(startIdx);
  }

  // Core Speech method with live word & timeline sync
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

    // Cleanly stop any prior active utterance/audio
    this.stop();
    const sessionId = ++this.currentSessionId;
    this.isSpeaking = true;
    this.isPaused = false;

    this.getAudioContext();

    const actualRate = opts.rate || 1.0;
    const actualVolume = opts.volume !== undefined ? opts.volume : 0.9;
    const cacheKey = `${this.selectedVoice}_${cleanText}`;

    // 1. Instant zero-latency playback if cached
    if (this.audioCache.has(cacheKey)) {
      const base64Audio = this.audioCache.get(cacheKey)!;
      this.playBase64Audio(base64Audio, cleanText, actualRate, actualVolume, sessionId, opts);
      return;
    }

    // 2. Await shared fetch (joins prefetch promise if already in progress!)
    this.fetchTtsAudio(cleanText).then((base64Audio) => {
      if (this.currentSessionId !== sessionId) return;
      if (base64Audio) {
        this.playBase64Audio(base64Audio, cleanText, actualRate, actualVolume, sessionId, opts);
      } else {
        this.fallbackSpeak(cleanText, actualRate, actualVolume, sessionId, opts);
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
    try {
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;
      const audio = this.getSharedAudio();
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.onplay = null;
      audio.onended = null;
      audio.onerror = null;

      audio.src = audioUrl;
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

        if (opts.onProgress) {
          opts.onProgress({
            currentTime: cur / audio.playbackRate,
            duration: dur / audio.playbackRate,
            progressFraction: fraction,
            wordIndex: wordIdx,
            charIndex: activeToken ? activeToken.startChar : 0,
            word: activeToken ? activeToken.word : '',
          });
        }
      };

      audio.onplay = () => {
        if (this.currentSessionId !== sessionId) return;
        const dur =
          audio.duration && isFinite(audio.duration) && audio.duration > 0
            ? audio.duration
            : baseDuration;
        if (opts.onStart) {
          opts.onStart(dur / audio.playbackRate);
        }
      };

      audio.ontimeupdate = sendProgress;

      // 50ms high-resolution ticker so time bar & karaoke captions stay silky smooth
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

        if (opts.onProgress) {
          opts.onProgress({
            currentTime: dur / audio.playbackRate,
            duration: dur / audio.playbackRate,
            progressFraction: 1,
            wordIndex: Math.max(0, tokens.length - 1),
            charIndex: text.length,
            word: tokens[tokens.length - 1]?.word || '',
          });
        }
        if (opts.onEnd) {
          opts.onEnd();
        }
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

  // Calm male Browser SpeechSynthesis fallback with guaranteed timer-driven word sync & Chrome watchdog
  private fallbackSpeak(
    text: string,
    rate: number = 1.0,
    volume: number = 0.9,
    sessionId: number,
    opts: SpeakOptions
  ): void {
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
      if (opts.onProgress) {
        opts.onProgress({
          currentTime: estDuration,
          duration: estDuration,
          progressFraction: 1,
          wordIndex: Math.max(0, tokens.length - 1),
          charIndex: text.length,
          word: tokens[tokens.length - 1]?.word || '',
        });
      }
      if (opts.onEnd) opts.onEnd();
    };

    // Smooth timer-driven sync (ensures UI progresses smoothly even if browser speech omits boundary events)
    this.fallbackInterval = setInterval(() => {
      if (this.currentSessionId !== sessionId || !this.isSpeaking || this.isPaused) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const fraction = Math.min(0.98, elapsed / Math.max(0.5, estDuration));
      const wordIdx = Math.min(tokens.length - 1, Math.floor(fraction * tokens.length));
      const activeToken = tokens[wordIdx];

      if (opts.onProgress) {
        opts.onProgress({
          currentTime: elapsed,
          duration: estDuration,
          progressFraction: fraction,
          wordIndex: wordIdx,
          charIndex: activeToken ? activeToken.startChar : 0,
          word: activeToken ? activeToken.word : '',
        });
      }
    }, 60);

    if (typeof window === 'undefined' || !window.speechSynthesis || volume <= 0) {
      if (opts.onStart) opts.onStart(estDuration);
      this.fallbackWatchdog = setTimeout(finishFallback, estDuration * 1000);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getBestBrowserVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = Math.max(0.80, Math.min(1.8, rate * 0.92));
      utterance.pitch = 0.88; // Calm lower male register
      utterance.volume = Math.max(0, Math.min(1, volume));

      utterance.onstart = () => {
        if (this.currentSessionId !== sessionId) return;
        if (opts.onStart) opts.onStart(estDuration);
      };

      utterance.onboundary = (e) => {
        if (this.currentSessionId !== sessionId) return;
        const charIdx = e.charIndex;
        let foundWordIdx = 0;
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
        if (opts.onProgress) {
          opts.onProgress({
            currentTime: elapsedSec,
            duration: estDuration,
            progressFraction: fraction,
            wordIndex: foundWordIdx,
            charIndex: charIdx,
            word: activeToken ? activeToken.word : '',
          });
        }
      };

      utterance.onend = finishFallback;
      utterance.onerror = finishFallback;

      // Watchdog guarantees progression if Chrome speechSynthesis stalls
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
    this.isPaused = false;
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

  // Subtle pleasant UI audio chimes
  public playSound(type: 'play' | 'pause' | 'correct' | 'wrong' | 'checkpoint' | 'click'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
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
