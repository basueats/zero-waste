import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

interface SentenceTiming {
  start: number;
  end: number;
  speechStart?: number;
  speechEnd?: number;
}

const CANONICAL_CALM_VOICE = 'Puck';
const DEFAULT_CALM_STYLE =
  'Calm, peaceful, gentle warm man speaking softly, smoothly, and clearly at an unhurried educational pace with zero deep bass heaviness and crisp natural pauses between sentences';

const warmLectureCache = new Map<
  string,
  { audio: string; mimeType: string; duration: number; sentenceTimings: SentenceTiming[]; modelUsed?: string }
>();

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

function estimateSpokenWeight(sentence: string): number {
  const expanded = sentence
    .trim()
    .replace(/CO2|CO₂/gi, 'carbon dioxide')
    .replace(/CH4|CH₄/gi, 'methane')
    .replace(/≥|>=/g, ' greater than or equal to ')
    .replace(/≤|<=/g, ' less than or equal to ')
    .replace(/°C/g, ' degrees celsius ')
    .replace(/%/g, ' percent ')
    .replace(/\bDr\./gi, 'Doctor')
    .replace(/\b(\d+)\.(\d+)\b/g, '$1 point $2 ')
    .replace(/\b\d+\b/g, (m) => ' '.repeat(Math.max(4, m.length * 4)));
  const syllableGroups = expanded.toLowerCase().match(/[aeiouy]+/g)?.length || 1;
  const punctMatches = sentence.match(/[,;:—–-]/g)?.length || 0;
  return Math.max(12, expanded.length * 0.65 + syllableGroups * 2.1 + punctMatches * 6.5);
}

function parseWavInfoAndAlignSentences(
  base64Audio: string,
  sentences: string[]
): { duration: number; sentenceTimings: SentenceTiming[] } {
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

  const findSpeechBounds = (segStart: number, segEnd: number): { speechStart: number; speechEnd: number } => {
    if (numFrames <= 4) {
      return { speechStart: segStart, speechEnd: segEnd };
    }
    const fStart = Math.max(0, Math.floor(segStart / frameMs));
    const fEnd = Math.min(numFrames - 1, Math.floor(segEnd / frameMs));
    const speechThreshold = 0.015;
    let firstVoiced = fStart;
    let lastVoiced = fEnd;
    for (let f = fStart; f <= fEnd; f++) {
      if (frameRms[f] >= speechThreshold) {
        firstVoiced = f;
        break;
      }
    }
    for (let f = fEnd; f >= firstVoiced; f--) {
      if (frameRms[f] >= speechThreshold) {
        lastVoiced = f;
        break;
      }
    }
    const sStart = Number(Math.max(segStart, firstVoiced * frameMs).toFixed(3));
    const sEnd = Number(Math.min(segEnd, Math.max(sStart + 0.25, (lastVoiced + 1) * frameMs)).toFixed(3));
    return { speechStart: sStart, speechEnd: sEnd };
  };

  if (sentences.length <= 1) {
    const bounds = findSpeechBounds(0, totalDuration);
    return {
      duration: Number(totalDuration.toFixed(3)),
      sentenceTimings: [{ start: 0, end: Number(totalDuration.toFixed(3)), ...bounds }],
    };
  }

  const weights = sentences.map((s) => estimateSpokenWeight(s));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const firstBounds = findSpeechBounds(0, totalDuration);
  const activeStartSec = firstBounds.speechStart;
  const activeEndSec = Math.max(activeStartSec + 0.5, firstBounds.speechEnd);
  const activeSpanSec = activeEndSec - activeStartSec;

  const silentThreshold = 0.012;
  const silenceWidthMs: number[] = new Array(numFrames).fill(0);
  let runStart = -1;
  for (let f = 0; f <= numFrames; f++) {
    const isSilent = f < numFrames && frameRms[f] < silentThreshold;
    if (isSilent && runStart === -1) {
      runStart = f;
    } else if (!isSilent && runStart !== -1) {
      const spanMs = (f - runStart) * frameMs * 1000;
      for (let k = runStart; k < f; k++) {
        silenceWidthMs[k] = spanMs;
      }
      runStart = -1;
    }
  }

  const frameValleyScore: number[] = new Array(numFrames).fill(0);
  for (let f = 0; f < numFrames; f++) {
    let energySum = 0;
    for (let d = -4; d <= 4; d++) {
      const idx = Math.max(0, Math.min(numFrames - 1, f + d));
      energySum += frameRms[idx];
    }
    const windowEnergy = energySum / 9;
    const widthBonus = Math.min(0.08, (silenceWidthMs[f] / 1000) * 0.065);
    frameValleyScore[f] = windowEnergy - widthBonus;
  }

  const boundaryCount = sentences.length - 1;
  const cumWeights: number[] = [];
  let cw = 0;
  for (let i = 0; i < boundaryCount; i++) {
    cw += weights[i];
    cumWeights.push(cw);
  }
  const expectedTimes = cumWeights.map((w) => activeStartSec + (w / totalWeight) * activeSpanSec);

  const searchRadiusSec = Math.max(3.5, Math.min(8.5, activeSpanSec * 0.2));
  const candidatesPerBoundary: Array<Array<{ time: number; cost: number }>> = [];

  for (let i = 0; i < boundaryCount; i++) {
    const expT = expectedTimes[i];
    const searchStart = Math.max(activeStartSec + 0.4, expT - searchRadiusSec);
    const searchEnd = Math.min(activeEndSec - 0.4, expT + searchRadiusSec);
    const startF = Math.max(1, Math.floor(searchStart / frameMs));
    const endF = Math.min(numFrames - 2, Math.ceil(searchEnd / frameMs));
    const cands: Array<{ time: number; cost: number }> = [];

    if (numFrames > 10 && endF > startF) {
      const step = Math.max(1, Math.floor(0.1 / frameMs));
      for (let b = startF; b <= endF; b += step) {
        let bestF = b;
        let bestV = Number.POSITIVE_INFINITY;
        const bEnd = Math.min(endF, b + step - 1);
        for (let f = b; f <= bEnd; f++) {
          if (frameValleyScore[f] < bestV) {
            bestV = frameValleyScore[f];
            bestF = f;
          }
        }
        const t = Number((bestF * frameMs).toFixed(3));
        const anchorPenalty = Math.abs(t - expT) * 0.004;
        cands.push({ time: t, cost: bestV + anchorPenalty });
      }
    }
    if (cands.length === 0) {
      cands.push({ time: Number(expT.toFixed(3)), cost: 0 });
    }
    candidatesPerBoundary.push(cands);
  }

  const dpCosts: number[][] = candidatesPerBoundary.map((c) => new Array(c.length).fill(Number.POSITIVE_INFINITY));
  const dpPrev: number[][] = candidatesPerBoundary.map((c) => new Array(c.length).fill(-1));

  for (let j = 0; j < candidatesPerBoundary[0].length; j++) {
    const t = candidatesPerBoundary[0][j].time;
    const minFirst = Math.max(0.5, (weights[0] / totalWeight) * activeSpanSec * 0.45);
    dpCosts[0][j] = t >= activeStartSec + minFirst ? candidatesPerBoundary[0][j].cost : candidatesPerBoundary[0][j].cost + 0.5;
  }

  for (let i = 1; i < boundaryCount; i++) {
    const expectedSegDur = (weights[i] / totalWeight) * activeSpanSec;
    const minSegDur = Math.max(0.55, expectedSegDur * 0.45);
    const maxSegDur = Math.max(minSegDur + 1.5, expectedSegDur * 2.1);

    for (let j = 0; j < candidatesPerBoundary[i].length; j++) {
      const cur = candidatesPerBoundary[i][j];
      let bestCost = Number.POSITIVE_INFINITY;
      let bestPrev = -1;

      for (let k = 0; k < candidatesPerBoundary[i - 1].length; k++) {
        const prevCost = dpCosts[i - 1][k];
        if (!isFinite(prevCost)) continue;
        const gap = cur.time - candidatesPerBoundary[i - 1][k].time;
        if (gap < 0.45) continue;
        let transitionPenalty = Math.abs(gap - expectedSegDur) * 0.0045;
        if (gap < minSegDur) transitionPenalty += (minSegDur - gap) * 0.08;
        if (gap > maxSegDur) transitionPenalty += (gap - maxSegDur) * 0.05;
        const total = prevCost + cur.cost + transitionPenalty;
        if (total < bestCost) {
          bestCost = total;
          bestPrev = k;
        }
      }
      dpCosts[i][j] = bestCost;
      dpPrev[i][j] = bestPrev;
    }
  }

  const boundaries: number[] = new Array(boundaryCount + 2).fill(0);
  boundaries[0] = 0;
  boundaries[boundaryCount + 1] = Number(totalDuration.toFixed(3));

  let lastIdx = 0;
  let minFinal = Number.POSITIVE_INFINITY;
  for (let j = 0; j < candidatesPerBoundary[boundaryCount - 1].length; j++) {
    const c = dpCosts[boundaryCount - 1][j];
    if (c < minFinal) {
      minFinal = c;
      lastIdx = j;
    }
  }

  let curIdx = lastIdx;
  for (let i = boundaryCount - 1; i >= 0; i--) {
    if (curIdx >= 0 && curIdx < candidatesPerBoundary[i].length && isFinite(minFinal)) {
      boundaries[i + 1] = candidatesPerBoundary[i][curIdx].time;
      curIdx = dpPrev[i][curIdx];
    } else {
      boundaries[i + 1] = Number(expectedTimes[i].toFixed(3));
    }
  }

  for (let i = 1; i <= boundaryCount; i++) {
    const minAllowed = boundaries[i - 1] + 0.45;
    const maxAllowed = totalDuration - 0.45 * (boundaryCount + 1 - i);
    boundaries[i] = Number(Math.max(minAllowed, Math.min(maxAllowed, boundaries[i])).toFixed(3));
  }

  const sentenceTimings: SentenceTiming[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const start = boundaries[i];
    const end = Math.max(boundaries[i] + 0.3, boundaries[i + 1]);
    const bounds = findSpeechBounds(start, end);
    sentenceTimings.push({ start, end, ...bounds });
  }

  return { duration: Number(totalDuration.toFixed(3)), sentenceTimings };
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
    const body = await readJsonBody<{ sentences?: unknown }>(req);
    const sentencesRaw = body?.sentences;
    if (!Array.isArray(sentencesRaw) || sentencesRaw.length === 0) {
      return sendJson(res, 400, { error: 'sentences array is required' });
    }

    const cleanSentences = sentencesRaw.map((s) => String(s || '').trim()).filter(Boolean);
    if (cleanSentences.length === 0) {
      return sendJson(res, 400, { error: 'sentences cannot be empty' });
    }

    const rawKey = `lecture_v7_${CANONICAL_CALM_VOICE}_${cleanSentences.join(' | ')}`;
    const hit = warmLectureCache.get(rawKey);
    if (hit) {
      return sendJson(
        res,
        200,
        { ...hit, voice: CANONICAL_CALM_VOICE, cached: true },
        { 'Cache-Control': 'private, max-age=86400' }
      );
    }

    const ai = getGeminiClient();
    if (!ai) {
      return sendJson(res, 503, { error: 'Gemini client unavailable: GEMINI_API_KEY missing in Vercel' });
    }

    const combinedScript = cleanSentences.join(' ... ');
    const result = await generateCalmMaleTts(ai, combinedScript);
    if (!result.audio) {
      return sendJson(res, result.statusCode || 502, {
        error: result.statusCode === 429 ? 'Daily speech synthesis quota reached' : 'Speech generation failed',
        detail: result.errorDetail,
      });
    }

    const { duration, sentenceTimings } = parseWavInfoAndAlignSentences(result.audio, cleanSentences);
    const payload = {
      audio: result.audio,
      mimeType: 'audio/wav',
      duration,
      sentenceTimings,
      modelUsed: result.modelUsed,
    };

    if (warmLectureCache.size > 40) {
      const firstKey = warmLectureCache.keys().next().value;
      if (firstKey) warmLectureCache.delete(firstKey);
    }
    warmLectureCache.set(rawKey, payload);

    return sendJson(res, 200, { ...payload, voice: CANONICAL_CALM_VOICE, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return sendJson(res, 500, { error: 'Lecture TTS failed: ' + message });
  }
}
