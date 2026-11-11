// Audio & Voice Narration Engine for SURPLUS Academy
// Real Human Speech Synthesis for Dr. Chef Supritam Basu via Gemini 3.8 Flash Lite TTS + Web Audio & Web Speech API

export type TTSVoiceName = 'Charon' | 'Fenrir' | 'Puck' | 'Kore' | 'Zephyr';

export interface TTSVoiceOption {
  id: TTSVoiceName;
  label: string;
  description: string;
  gender: 'male' | 'female';
}

export const AVAILABLE_VOICES: TTSVoiceOption[] = [
  { id: 'Charon', label: 'Dr. Chef Basu (Conversational Chef)', description: 'Warm, natural conversational master chef voice with relaxed human cadence', gender: 'male' },
  { id: 'Fenrir', label: 'Dr. Chef Basu (Authoritative Baritone)', description: 'Deep, resonant, measured culinary science authority', gender: 'male' },
  { id: 'Puck', label: 'Puck (Engaging Culinary Mentor)', description: 'Lively, expressive kitchen educator delivery', gender: 'male' },
  { id: 'Kore', label: 'Kore (Warm Hospitality Educator)', description: 'Warm, clear, elegant culinary educator', gender: 'female' },
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
  onError?: (err?: any) => void;
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

class AudioNarrator {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private ambientOsc: OscillatorNode | null = null;
  private audioCache: Map<string, string> = new Map(); // key -> base64 WAV
  private audioDurationCache: Map<string, number> = new Map(); // key -> duration in seconds
  private selectedVoice: TTSVoiceName = 'Fenrir';
  private currentSessionId: number = 0;
  private progressInterval: any = null;

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

  // Pre-calculate human speaking duration (approx 2.3 words/sec at 1.0x rate)
  public estimateDuration(text: string, rate: number = 1.0): number {
    const clean = text.trim();
    const cacheKey = `${this.selectedVoice}_${clean}`;
    if (this.audioDurationCache.has(cacheKey)) {
      return (this.audioDurationCache.get(cacheKey)! / Math.max(0.5, rate));
    }
    const words = clean.split(/\s+/).filter(Boolean).length;
    // Base speaking speed for Dr. Chef Basu is ~135 WPM (~2.25 words per second)
    const baseSeconds = Math.max(2.5, words / 2.25);
    return baseSeconds / Math.max(0.5, rate);
  }

  // Pre-load upcoming module narrations into memory for instant zero-latency playback
  public async prefetch(texts: string[]): Promise<void> {
    if (typeof window === 'undefined') return;
    for (const text of texts) {
      const clean = text.trim();
      if (!clean) continue;
      const cacheKey = `${this.selectedVoice}_${clean}`;
      if (!this.audioCache.has(cacheKey)) {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: clean,
              voice: this.selectedVoice,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audio) {
              this.audioCache.set(cacheKey, data.audio);
              // Probe audio duration
              this.probeAudioDuration(cacheKey, data.audio);
            }
          }
        } catch {
          // Ignore prefetch background network errors
        }
      }
    }
  }

  private probeAudioDuration(cacheKey: string, base64Audio: string) {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          this.audioDurationCache.set(cacheKey, audio.duration);
        }
      };
    } catch {
      // Ignore
    }
  }

  // Best natural voice selector for browser fallback
  private getBestBrowserVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritize natural / neural / online human-sounding voices
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('online'))
    );
    if (naturalVoice) return naturalVoice;

    // Next prefer premium British or US male voices (Dr. Chef Supritam Basu)
    const preferredNames = ['Daniel', 'George', 'Arthur', 'Oliver', 'Google UK English Male', 'en-GB', 'en-US'];
    for (const name of preferredNames) {
      const match = voices.find((v) => v.name.toLowerCase().includes(name.toLowerCase()));
      if (match) return match;
    }

    const enVoice = voices.find((v) => v.lang.startsWith('en'));
    return enVoice || voices[0] || null;
  }

  // Core Speech method with real-time word boundary and progress sync
  public speak(
    textOrOptions: string | SpeakOptions,
    rate: number = 1.0,
    volume: number = 0.9,
    onEnd?: () => void
  ): void {
    let opts: SpeakOptions;
    if (typeof textOrOptions === 'string') {
      opts = {
        text: textOrOptions,
        rate,
        volume,
        onEnd,
      };
    } else {
      opts = textOrOptions;
    }

    const cleanText = (opts.text || '').trim();
    if (!cleanText || (opts.volume !== undefined && opts.volume <= 0)) {
      if (opts.onEnd) opts.onEnd();
      return;
    }

    // Stop current speech cleanly and increment session
    this.stop();
    const sessionId = ++this.currentSessionId;
    this.isSpeaking = true;
    this.isPaused = false;

    // Ensure audio context is ready on user gesture
    this.getAudioContext();

    const actualRate = opts.rate || 1.0;
    const actualVolume = opts.volume !== undefined ? opts.volume : 0.9;
    const cacheKey = `${this.selectedVoice}_${cleanText}`;

    // 1. Instant Play from In-Memory Audio Cache
    if (this.audioCache.has(cacheKey)) {
      const base64Audio = this.audioCache.get(cacheKey)!;
      this.playBase64Audio(base64Audio, cleanText, actualRate, actualVolume, sessionId, opts);
      return;
    }

    // 2. Fetch High-Fidelity Human Audio from Gemini 3.8 Flash Lite TTS
    // Set a fast 4s abort timeout so if network is slow, it instantly falls back to browser speech
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        text: cleanText,
        voice: this.selectedVoice,
      }),
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('TTS server returned ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (this.currentSessionId !== sessionId) return;
        if (data.audio) {
          this.audioCache.set(cacheKey, data.audio);
          this.playBase64Audio(data.audio, cleanText, actualRate, actualVolume, sessionId, opts);
        } else {
          throw new Error('No audio in response');
        }
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (this.currentSessionId !== sessionId) return;
        // Gracefully use natural browser speech synthesis with full sync
        this.fallbackSpeak(cleanText, actualRate, actualVolume, sessionId, opts);
      });
  }

  // Plays decoded WAV audio buffer with synchronized time & word progress events
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
      const audio = new Audio(audioUrl);
      audio.playbackRate = Math.max(0.75, Math.min(1.5, rate));
      audio.volume = Math.max(0, Math.min(1, volume));

      const tokens = tokenizeTextIntoWords(text);
      let reportedDuration = this.estimateDuration(text, rate);

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
          reportedDuration = audio.duration;
          this.audioDurationCache.set(`${this.selectedVoice}_${text}`, audio.duration);
        }
      };

      audio.onplay = () => {
        if (this.currentSessionId !== sessionId) return;
        if (opts.onStart) {
          opts.onStart(reportedDuration);
        }
      };

      const sendProgress = () => {
        if (this.currentSessionId !== sessionId || !this.isSpeaking) return;
        const cur = audio.currentTime;
        const dur = (audio.duration && isFinite(audio.duration) && audio.duration > 0)
          ? audio.duration
          : reportedDuration;
        const fraction = Math.min(1, Math.max(0, cur / dur));
        const wordIdx = Math.min(tokens.length - 1, Math.floor(fraction * tokens.length));
        const activeToken = tokens[wordIdx];

        if (opts.onProgress) {
          opts.onProgress({
            currentTime: cur,
            duration: dur,
            progressFraction: fraction,
            wordIndex: wordIdx,
            charIndex: activeToken ? activeToken.startChar : 0,
            word: activeToken ? activeToken.word : '',
          });
        }
      };

      audio.ontimeupdate = sendProgress;

      // High-resolution interval for silky smooth word highlighting (every 60ms)
      this.progressInterval = setInterval(() => {
        if (this.currentSessionId === sessionId && this.isSpeaking && !this.isPaused) {
          sendProgress();
        }
      }, 60);

      const handleDone = () => {
        if (this.currentSessionId !== sessionId) return;
        this.clearProgressInterval();
        this.isSpeaking = false;
        this.currentAudio = null;
        if (opts.onProgress) {
          // Send final completion progress
          opts.onProgress({
            currentTime: reportedDuration,
            duration: reportedDuration,
            progressFraction: 1,
            wordIndex: tokens.length - 1,
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
        this.clearProgressInterval();
        // Fallback to browser speech if audio element decoding fails
        this.fallbackSpeak(text, rate, volume, sessionId, opts);
      };

      this.currentAudio = audio;
      audio.play().catch((playErr) => {
        console.warn('Audio play failed, falling back to speech synthesis:', playErr);
        if (this.currentSessionId === sessionId) {
          this.fallbackSpeak(text, rate, volume, sessionId, opts);
        }
      });
    } catch (e) {
      this.fallbackSpeak(text, rate, volume, sessionId, opts);
    }
  }

  // Browser SpeechSynthesis fallback with full boundary sync
  private fallbackSpeak(
    text: string,
    rate: number = 1.0,
    volume: number = 0.9,
    sessionId: number,
    opts: SpeakOptions
  ): void {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.isSpeaking = false;
      if (opts.onEnd) opts.onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.getBestBrowserVoice();
      if (voice) utterance.voice = voice;

      utterance.rate = Math.max(0.80, Math.min(1.1, rate * 0.90));
      utterance.pitch = 0.92;
      utterance.volume = Math.max(0, Math.min(1, volume));

      const tokens = tokenizeTextIntoWords(text);
      const estDuration = this.estimateDuration(text, rate);
      const startTime = Date.now();

      utterance.onstart = () => {
        if (this.currentSessionId !== sessionId) return;
        if (opts.onStart) opts.onStart(estDuration);
      };

      // Native boundary event gives exact character and word synchronization
      utterance.onboundary = (e) => {
        if (this.currentSessionId !== sessionId) return;
        const charIdx = e.charIndex;
        // Find matching word token
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

      const handleDone = () => {
        if (this.currentSessionId !== sessionId) return;
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (opts.onProgress) {
          opts.onProgress({
            currentTime: estDuration,
            duration: estDuration,
            progressFraction: 1,
            wordIndex: tokens.length - 1,
            charIndex: text.length,
            word: tokens[tokens.length - 1]?.word || '',
          });
        }
        if (opts.onEnd) opts.onEnd();
      };

      utterance.onend = handleDone;
      utterance.onerror = handleDone;

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      this.isSpeaking = false;
      if (opts.onEnd) opts.onEnd();
    }
  }

  private clearProgressInterval() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
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

  // Stop active speech and audio immediately
  public stop(): void {
    this.currentSessionId++;
    this.clearProgressInterval();

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.ontimeupdate = null;
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch {
        // Ignore
      }
      this.currentAudio = null;
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

  // Play synthetic pleasant UI audio chimes
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
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'pause') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'correct') {
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'triangle';
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          const t = now + idx * 0.08;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          o.start(t);
          o.stop(t + 0.35);
        });
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(196, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'checkpoint') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.2); // D6
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
        osc.start(now);
        osc.stop(now + 0.38);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }

  public stopAmbiance(): void {
    if (this.ambientOsc) {
      try {
        this.ambientOsc.stop();
        this.ambientOsc.disconnect();
      } catch {
        // Ignore
      }
      this.ambientOsc = null;
    }
  }
}

export const audioNarrator = new AudioNarrator();
