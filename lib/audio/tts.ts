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
}

// The lecturer's voice. Google "Chirp 3: HD" — the newest generative tier,
// far more natural than Wavenet. Swap this single constant to change the voice
// course-wide (audition others: Kore, Orus, Aoede, Puck, Algenib …).
// NOTE: Chirp 3 HD voices do NOT support SSML or `pitch`; plain text + rate only.
export const LECTURER_VOICE = 'en-US-Chirp3-HD-Charon'

const DEFAULT_VOICE = LECTURER_VOICE
const DEFAULT_LANGUAGE = 'en-US'

// Chirp 3 HD is billed per character like other premium tiers; this is an
// estimate for cost logging only (not billing). ~$30 per 1M characters.
const PRICE_PER_M_CHARS = 30

export type SynthesizeResult = {
  audioBuffer: Buffer
  characterCount: number
  costCents: number
}

/**
 * Normalize text for natural speech: spell out symbols a TTS engine reads badly
 * (legal citations are full of "§"), strip markdown, and collapse whitespace.
 * Used by every narration path so the spoken script never says "section-sign".
 * The on-screen text is untouched — this only shapes what the voice says.
 */
export function textToSpeechReady(raw: string): string {
  return (raw ?? '')
    .replace(/§§/g, ' sections ')
    .replace(/§/g, ' section ')
    .replace(/¶¶/g, ' paragraphs ')
    .replace(/¶/g, ' paragraph ')
    .replace(/&/g, ' and ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // markdown links → their text
    .replace(/[*_`#>]/g, '') // markdown punctuation
    .replace(/\n+/g, '. ') // newlines → sentence breaks
    .replace(/\s+/g, ' ')
    .trim()
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
    },
  })

  if (!response.audioContent) {
    throw new Error('No audio content returned from TTS')
  }

  const audioBuffer = Buffer.from(response.audioContent as Uint8Array)
  const characterCount = opts.text.length
  const costCents = Math.round((characterCount / 1_000_000) * PRICE_PER_M_CHARS * 100 * 10000) / 10000

  return { audioBuffer, characterCount, costCents }
}

// For streaming responses in real-time Q&A. Returns full audio in one shot;
// Google Cloud TTS API doesn't true-stream small responses, but we can
// synthesize in chunks if responses get long.
export async function synthesizeStreaming(text: string): Promise<SynthesizeResult> {
  return synthesizeSpeech({ text })
}
