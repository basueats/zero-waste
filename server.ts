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

// Concurrency queue for upstream Gemini TTS (prevents burst quota/rate-limit spikes)
let activeTtsRequests = 0;
const MAX_CONCURRENT_TTS = 1;
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

const DEFAULT_CALM_STYLE =
  'Calm, deep, steady, unhurried human male baritone voice of an experienced executive master chef and university professor teaching in a quiet studio, consistent pitch, warm tone, and even pacing throughout';

async function generateTtsWithRetry(
  ai: GoogleGenAI,
  cleanText: string,
  voice: string,
  style: string
): Promise<{ audio?: string; errorDetail?: string; statusCode?: number }> {
  // Try primary model first; if quota-limited (429), immediately try secondary TTS model bucket using exact same voice
  const modelsToTry = ['gemini-3.8-flash-lite-tts', 'gemini-3.8-flash-tts'];
  let lastError = 'Unknown error';
  let lastStatus = 502;

  for (const modelName of modelsToTry) {
    const maxAttempts = 2;
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
          await new Promise((r) => setTimeout(r, isRateLimit || isUnavailable ? 1200 : 400));
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

// Endpoint: Synthesize a full lecture as ONE unbroken human male voice WAV track with pause-aligned captions
app.post('/api/tts/lecture', async (req, res) => {
  try {
    const {
      sentences,
      voice = 'Fenrir',
      voiceName,
      style = DEFAULT_CALM_STYLE,
    } = req.body;

    if (!Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({ error: 'sentences array is required' });
    }

    const cleanSentences = sentences.map((s) => String(s || '').trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      return res.status(400).json({ error: 'sentences cannot be empty' });
    }

    const resolvedVoice = voiceName || voice || 'Fenrir';
    const rawKey = `lecture_${resolvedVoice}_${cleanSentences.join(' | ')}`;

    if (lectureTtsCache.has(rawKey)) {
      return res.json({ ...lectureTtsCache.get(rawKey)!, cached: true });
    }

    const diskHit = readDiskCacheJson<CachedLectureAudio>('lec', rawKey);
    if (diskHit?.audio) {
      lectureTtsCache.set(rawKey, diskHit);
      return res.json({ ...diskHit, cached: true });
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
      voice = 'Fenrir',
      voiceName,
      style = DEFAULT_CALM_STYLE,
    } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim();
    const resolvedVoice = voiceName || voice || 'Fenrir';
    const cacheKey = `${resolvedVoice}_${cleanText}`;

    if (ttsAudioCache.has(cacheKey)) {
      return res.json({
        audio: ttsAudioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    const diskHit = readDiskCacheJson<{ audio: string }>('tts', cacheKey);
    if (diskHit?.audio) {
      ttsAudioCache.set(cacheKey, diskHit.audio);
      return res.json({
        audio: diskHit.audio,
        mimeType: 'audio/wav',
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
