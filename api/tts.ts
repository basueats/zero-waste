import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

const CANONICAL_CALM_VOICE = 'Puck';
const DEFAULT_CALM_STYLE =
  'Calm, peaceful, gentle warm man speaking softly, smoothly, and clearly at an unhurried educational pace with zero deep bass heaviness and crisp natural pauses between sentences';

const warmTtsCache = new Map<string, string>();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function readJsonBody<T = Record<string, unknown>>(
  req: IncomingMessage & { body?: unknown }
): Promise<T> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as T;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    return JSON.parse(req.body) as T;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  const raw = Buffer.concat(chunks).toString('utf-8').trim();
  if (!raw) return {} as T;
  return JSON.parse(raw) as T;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown, extraHeaders?: Record<string, string>) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      res.setHeader(k, v);
    }
  }
  res.end(JSON.stringify(data));
}

function ensureWavBase64(base64Data: string, mimeType?: string): string {
  const buf = Buffer.from(base64Data, 'base64');
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WAVE'
  ) {
    return base64Data;
  }

  let sampleRate = 24000;
  const rateMatch = String(mimeType || '').match(/rate=(\d+)/i);
  if (rateMatch) {
    const parsedRate = parseInt(rateMatch[1], 10);
    if (parsedRate >= 8000 && parsedRate <= 96000) {
      sampleRate = parsedRate;
    }
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = buf.length;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, buf]).toString('base64');
}

async function generateCalmMaleTts(
  ai: GoogleGenAI,
  cleanText: string
): Promise<{ audio?: string; modelUsed?: string; errorDetail?: string; statusCode?: number }> {
  const modelsToTry: Array<{ model: string; useSpeechMetadata: boolean }> = [
    { model: 'gemini-3.8-flash-lite-tts', useSpeechMetadata: true },
    { model: 'gemini-3.8-flash-tts', useSpeechMetadata: true },
    { model: 'gemini-2.5-flash-preview-tts', useSpeechMetadata: false },
  ];
  let lastError = 'Unknown error';
  let lastStatus = 502;

  for (const { model: modelName, useSpeechMetadata } of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const partPayload = useSpeechMetadata
          ? {
              text: cleanText,
              speechMetadata: { style: DEFAULT_CALM_STYLE },
            }
          : {
              text: `Say calmly, softly, peacefully, and slowly in a gentle warm male voice without any heavy bass:\n${cleanText}`,
            };

        const response = await ai.models.generateContent({
          model: modelName,
          contents: [{ role: 'user', parts: [partPayload] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: CANONICAL_CALM_VOICE },
              },
            },
          },
        });
        const candidate = response.candidates?.[0];
        const inlineData = candidate?.content?.parts?.[0]?.inlineData;
        if (inlineData?.data) {
          return {
            audio: ensureWavBase64(inlineData.data, inlineData.mimeType),
            modelUsed: modelName,
          };
        }
        lastError = `${modelName}: No audio part (finishReason=${candidate?.finishReason || 'none'})`;
        lastStatus = 502;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
        const isRateLimit = lastError.includes('429') || lastError.includes('RESOURCE_EXHAUSTED');
        const isNotFound = lastError.includes('404') || lastError.includes('NOT_FOUND') || /not found/i.test(lastError);
        const isBadArg = lastError.includes('400') || lastError.includes('INVALID_ARGUMENT');
        const isUnavailable = lastError.includes('503') || lastError.includes('UNAVAILABLE');
        lastStatus = isRateLimit ? 429 : 502;
        if (isNotFound || isBadArg || lastError.includes('PerDay') || lastError.includes('GenerateRequestsPerDay')) {
          break;
        }
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, isRateLimit || isUnavailable ? 1100 * attempt : 450));
        }
      }
    }
  }
  return { errorDetail: lastError, statusCode: lastStatus };
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody<{ text?: unknown }>(req);
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) {
      return sendJson(res, 400, { error: 'Text is required' });
    }

    const cacheKey = `tts_v7_${CANONICAL_CALM_VOICE}_${text}`;
    const hit = warmTtsCache.get(cacheKey);
    if (hit) {
      return sendJson(
        res,
        200,
        { audio: hit, mimeType: 'audio/wav', voice: CANONICAL_CALM_VOICE, cached: true },
        { 'Cache-Control': 'private, max-age=86400' }
      );
    }

    const ai = getGeminiClient();
    if (!ai) {
      return sendJson(res, 503, { error: 'Gemini client unavailable: GEMINI_API_KEY missing in Vercel' });
    }

    const result = await generateCalmMaleTts(ai, text);
    if (!result.audio) {
      return sendJson(res, result.statusCode || 502, {
        error: result.statusCode === 429 ? 'Daily speech synthesis quota reached' : 'No audio returned from speech model',
        detail: result.errorDetail,
      });
    }

    if (warmTtsCache.size > 200) {
      const firstKey = warmTtsCache.keys().next().value;
      if (firstKey) warmTtsCache.delete(firstKey);
    }
    warmTtsCache.set(cacheKey, result.audio);

    return sendJson(res, 200, {
      audio: result.audio,
      mimeType: 'audio/wav',
      voice: CANONICAL_CALM_VOICE,
      modelUsed: result.modelUsed,
      cached: false,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJson(res, 500, { error: 'TTS failed: ' + message });
  }
}
