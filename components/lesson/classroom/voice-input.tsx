'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { transcribeAudio } from '@/lib/audio/transcribe'

// Auto-stop after a minute so a question stays small (and a forgotten mic does
// not record forever).
const MAX_MS = 60_000

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * Mic button that records a spoken question and transcribes it via OpenRouter's
 * Whisper (a server action). Whisper auto-detects the language, so a student can
 * ask in any language; the lecturer answers in English. Works in any browser
 * with MediaRecorder + getUserMedia (Chrome, Edge, Firefox, Safari); renders
 * nothing where unsupported, so callers can drop it in unconditionally.
 * Recording -> stop -> transcribe -> onTranscript(text) (one shot, not live).
 */
export function VoiceInput({
  onTranscript,
  disabled,
  className,
}: {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}) {
  const [state, setState] = useState<'idle' | 'recording' | 'transcribing'>('idle')
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | null>(null)

  // SSR-safe capability check: false on the server, real check on the client.
  const supported = useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined',
    () => false,
  )

  // Release the mic + timer on unmount.
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  if (!supported) return null

  async function start() {
    if (disabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      rec.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        const type = rec.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        const format = type.split(';')[0].split('/')[1] || 'webm'
        if (blob.size === 0) {
          setState('idle')
          return
        }
        setState('transcribing')
        try {
          const base64 = await blobToBase64(blob)
          const result = await transcribeAudio(base64, format)
          if ('text' in result && result.text) onTranscript(result.text)
        } catch {
          // Network/transcription hiccup: leave the input as it was.
        } finally {
          setState('idle')
        }
      }
      recRef.current = rec
      rec.start()
      setState('recording')
      timerRef.current = window.setTimeout(() => {
        if (rec.state === 'recording') rec.stop()
      }, MAX_MS)
    } catch {
      // Permission denied, no device, etc.
      setState('idle')
    }
  }

  function stop() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    recRef.current?.stop()
  }

  const busy = state === 'transcribing'
  const recording = state === 'recording'

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      disabled={disabled || busy}
      aria-label={recording ? 'Stop and transcribe' : busy ? 'Transcribing' : 'Ask by voice'}
      title={recording ? 'Stop' : busy ? 'Transcribing…' : 'Ask by voice (any language)'}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-40 ${
        recording ? 'bg-accent text-white' : 'text-neutral-400 hover:text-primary'
      } ${className ?? ''}`}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : recording ? (
        <Square className="h-3 w-3 fill-current" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
