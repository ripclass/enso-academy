'use server'

// Server-only. Transcribe a short spoken question via OpenRouter's Whisper
// (the /audio/transcriptions endpoint). Uses the existing OPENROUTER_API_KEY,
// so there is no new key or billing. Whisper auto-detects the language, so a
// student can speak in Bangla, Hindi, Arabic, Urdu, Chinese, etc.; the lecturer
// then answers in English (see askLecturer's prompt).

import { createClient } from '@/lib/supabase/server'

// A normal question is a few KB; this is a backstop against an oversized
// payload. The client also caps recording length, and Next.js caps the server
// action body, so this rarely fires.
const MAX_BASE64_CHARS = 1_200_000

export async function transcribeAudio(
  audioBase64: string,
  format: string,
): Promise<{ text: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  if (!audioBase64) return { error: 'No audio captured.' }
  if (audioBase64.length > MAX_BASE64_CHARS) {
    return { error: 'That recording is too long. Keep it under a minute.' }
  }

  // Container format (webm / mp4 / ogg / wav). Sanitize before sending.
  const safeFormat = /^[a-z0-9]{2,8}$/.test(format) ? format : 'webm'

  try {
    const res = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/whisper-1',
        input_audio: { data: audioBase64, format: safeFormat },
      }),
    })
    if (!res.ok) {
      console.error('transcribeAudio: OpenRouter', res.status, (await res.text()).slice(0, 300))
      return { error: 'Could not transcribe that. Please try again.' }
    }
    const json = (await res.json()) as { text?: string }
    const text = typeof json.text === 'string' ? json.text.trim() : ''
    return { text }
  } catch (err) {
    console.error('transcribeAudio failed:', err)
    return { error: 'Could not transcribe that. Please try again.' }
  }
}
