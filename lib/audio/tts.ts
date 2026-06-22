// lib/audio/tts.ts
// Server-only Google Cloud Text-to-Speech wrapper.
// Handles credential loading from either a file path (local dev) or
// inline JSON (Vercel production) via GOOGLE_APPLICATION_CREDENTIALS_JSON.

import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import { createHash } from 'crypto'

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

// The lecturer's voices. Google "Chirp 3: HD" — the newest generative tier,
// far more natural than Wavenet. A male and a female voice so the spoken voice
// matches the lecturer's avatar (which alternates per chapter). Swap these to
// re-cast (audition others: Orus, Aoede, Puck, Algenib, Leda …).
// NOTE: Chirp 3 HD voices do NOT support SSML or `pitch`; plain text + rate only.
export const LECTURER_VOICES: Record<'male' | 'female', string> = {
  male: 'en-US-Chirp3-HD-Charon',
  female: 'en-US-Chirp3-HD-Kore',
}
export const LECTURER_VOICE = LECTURER_VOICES.male

const DEFAULT_VOICE = LECTURER_VOICE
const DEFAULT_LANGUAGE = 'en-US'

/**
 * Storage path for a hash-cached text clip (lecturer Q&A lines, and per-beat
 * narration). The SAME function is used by the on-demand synth action and the
 * batch pre-generator, so a beat the player requests and a beat the batch
 * created land at the identical path. `cleanText` must already be run through
 * textToSpeechReady().
 */
export function textClipFileName(cleanText: string, variant: 'male' | 'female'): string {
  const hash = createHash('sha1').update(`${variant}:${cleanText}`).digest('hex').slice(0, 24)
  return `qa-audio/text/${hash}.mp3`
}

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
  const cleaned = (raw ?? '')
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
  return breakLongSentences(cleaned)
}

// Chirp 3 HD rejects a single sentence that exceeds its length cap ("split with
// periods"). A few legal run-on sentences trip this. Break only those, at a
// clause boundary near the middle — and leave text without an over-long
// sentence byte-for-byte unchanged (so cached-clip hashes don't move).
const MAX_SENTENCE_CHARS = 240

function breakLongSentences(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? []
  if (!sentences.some((s) => s.trim().length > MAX_SENTENCE_CHARS)) return text

  const out: string[] = []
  const split = (s: string): void => {
    const t = s.trim()
    if (!t) return
    if (t.length <= MAX_SENTENCE_CHARS) {
      out.push(t)
      return
    }
    const mid = Math.floor(t.length / 2)
    let best = -1
    const re = /[,;:](\s)/g
    let m: RegExpExecArray | null
    while ((m = re.exec(t)) !== null) {
      if (best === -1 || Math.abs(m.index - mid) < Math.abs(best - mid)) best = m.index
    }
    if (best === -1) {
      out.push(t) // no clause boundary to split on — leave it (rare)
      return
    }
    split(t.slice(0, best)) // drop the comma; the period below ends the clause
    split(t.slice(best + 1))
  }
  for (const s of sentences) split(s)
  return out.map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)).join(' ')
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
