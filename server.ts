import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// In-memory TTS audio cache (cacheKey -> base64 WAV)
const ttsAudioCache = new Map<string, string>();

// Check AI status
app.get('/api/ai/status', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    available: hasKey,
    model: 'gemini-3.8-flash',
    ttsModel: 'gemini-3.8-flash-lite-tts',
  });
});

// Endpoint: Generate Real Human Voice Speech using Gemini 3.8 Flash Lite TTS
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'Fenrir', style = 'Calm, natural, deep, articulate human voice of an experienced master chef and author' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text.trim();
    const cacheKey = `${voice}_${cleanText}`;

    // Return instant cached human audio if available
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({
        audio: ttsAudioCache.get(cacheKey),
        mimeType: 'audio/wav',
        cached: true,
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: 'Gemini client unavailable' });
    }

    // Call gemini-3.8-flash-lite-tts directly for fast, authentic low-latency human speech
    let base64Audio: string | undefined;
    const humanStyle = style || 'Warm, natural, deeply conversational human voice of an experienced master chef and author explaining in a real kitchen, warm gentle tone, unhurried, genuine human breathing and cadence';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: humanStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Charon' },
            },
          },
        },
      });
      base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (primaryErr: any) {
      console.warn('TTS generation notice:', primaryErr?.message || primaryErr);
    }

    if (!base64Audio) {
      return res.status(502).json({ error: 'No audio returned from speech model' });
    }

    // Keep cache bounded
    if (ttsAudioCache.size > 300) {
      const firstKey = ttsAudioCache.keys().next().value;
      if (firstKey) ttsAudioCache.delete(firstKey);
    }
    ttsAudioCache.set(cacheKey, base64Audio);

    return res.json({
      audio: base64Audio,
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
      model: 'gemini-3.8-flash',
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
