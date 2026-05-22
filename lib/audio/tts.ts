// lib/audio/tts.ts
// Server-only Google Cloud Text-to-Speech wrapper.
// Handles credential loading from either a file path (local dev) or
// inline JSON (Vercel production) via GOOGLE_APPLICATION_CREDENTIALS_JSON.

import { TextToSpeechClient } from '@google-cloud/text-to-speech'

let cachedClient: TextToSpeechClient | null = null

function getClient(): TextToSpeechClient {
  if (cachedClient) return cachedClient

  // Production (Vercel): credentials passed as inline JSON env var
  const inlineCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  if (inlineCredentials) {
    const parsed = JSON.parse(inlineCredentials)
    cachedClient = new TextToSpeechClient({
      credentials: parsed,
      projectId: parsed.project_id,
    })
    return cachedClient
  }

  // Local dev: GOOGLE_APPLICATION_CREDENTIALS points to a file path.
  // The SDK reads it automatically. Just instantiate.
  cachedClient = new TextToSpeechClient()
  return cachedClient
}

export type SynthesizeOptions = {
  text: string
  voiceName?: string
  languageCode?: string
  speakingRate?: number
  pitch?: number
}

const DEFAULT_VOICE = 'en-US-Wavenet-D'
const DEFAULT_LANGUAGE = 'en-US'

// Pricing for Wavenet voices: $16 per 1M characters
const WAVENET_PRICE_PER_M_CHARS = 16

export type SynthesizeResult = {
  audioBuffer: Buffer
  characterCount: number
  costCents: number
}

export async function synthesizeSpeech(opts: SynthesizeOptions): Promise<SynthesizeResult> {
  const client = getClient()
  const voiceName = opts.voiceName ?? DEFAULT_VOICE
  const languageCode = opts.languageCode ?? DEFAULT_LANGUAGE

  const [response] = await client.synthesizeSpeech({
    input: { text: opts.text },
    voice: { languageCode, name: voiceName },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: opts.speakingRate ?? 1.0,
      pitch: opts.pitch ?? 0,
    },
  })

  if (!response.audioContent) {
    throw new Error('No audio content returned from TTS')
  }

  const audioBuffer = Buffer.from(response.audioContent as Uint8Array)
  const characterCount = opts.text.length
  const costCents = Math.round((characterCount / 1_000_000) * WAVENET_PRICE_PER_M_CHARS * 100 * 10000) / 10000

  return { audioBuffer, characterCount, costCents }
}

// For streaming responses in real-time Q&A. Returns full audio in one shot;
// Google Cloud TTS API doesn't true-stream small responses, but we can
// synthesize in chunks if responses get long.
export async function synthesizeStreaming(text: string): Promise<SynthesizeResult> {
  return synthesizeSpeech({ text })
}
