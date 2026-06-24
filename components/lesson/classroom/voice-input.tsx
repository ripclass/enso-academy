'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Mic, Square } from 'lucide-react'

// Minimal shape of the Web Speech API we use (not in the TS DOM lib).
type RecognitionAlternative = { transcript: string }
type RecognitionResult = ArrayLike<RecognitionAlternative> & { isFinal: boolean }
type RecognitionEvent = { results: ArrayLike<RecognitionResult> }
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: RecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  // The Web Speech API ctor isn't in the DOM lib types; probe both names.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionLike)
    | null
}

/**
 * Mic button that dictates a question via the browser's Web Speech API — no API
 * key, fully client-side, supported in Chrome/Edge. Renders nothing where the
 * browser has no speech recognition (Firefox, most Safari), so callers can drop
 * it in unconditionally. Streams the running transcript to `onTranscript` as the
 * student speaks; `onTranscript` should set the question input's value.
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
  const [listening, setListening] = useState(false)
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  // Read browser support without setState-in-effect or a hydration mismatch:
  // false on the server, the real capability on the client.
  const supported = useSyncExternalStore(
    () => () => {},
    () => getRecognitionCtor() != null,
    () => false,
  )

  // Stop any in-flight recognition on unmount.
  useEffect(() => () => recRef.current?.stop(), [])

  if (!supported) return null

  function toggle() {
    if (disabled) return
    if (listening) {
      recRef.current?.stop()
      return
    }
    const Ctor = getRecognitionCtor()
    if (!Ctor) return
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = false
    rec.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0]?.transcript ?? ''
      }
      onTranscript(text.trim())
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      aria-label={listening ? 'Stop dictation' : 'Ask by voice'}
      title={listening ? 'Stop' : 'Ask by voice'}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-40 ${
        listening ? 'bg-accent text-white' : 'text-neutral-400 hover:text-primary'
      } ${className ?? ''}`}
    >
      {listening ? (
        <Square className="h-3 w-3 fill-current" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
