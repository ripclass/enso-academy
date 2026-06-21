'use client'

import { Hand, X, ArrowRight } from 'lucide-react'
import { Avatar } from './avatar'
import { LecturerAvatar, type LecturerVariant } from './lecturer-presence'

export type MomentPhase = 'bridge' | 'question' | 'answer'

/**
 * The on-stage classmate moment, choreographed as three beats so it doesn't cut
 * the lecture off cold:
 *   1. bridge   — the lecturer notices the raised hand and acknowledges it
 *                 ("Hold on — Priya, go ahead").
 *   2. question — the classmate asks (their bubble appears).
 *   3. answer   — the lecturer answers, then Continue resumes the lecture.
 */
export function ClassmateMoment({
  name,
  question,
  answer,
  bridge,
  phase,
  speaking,
  lecturerVariant = 'female',
  onDismiss,
}: {
  name: string
  question: string
  answer: string
  bridge: string
  phase: MomentPhase
  speaking: boolean
  lecturerVariant?: LecturerVariant
  onDismiss: () => void
}) {
  return (
    <div className="pointer-events-auto w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
      {/* Classmate */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="relative shrink-0">
            <div className="overflow-hidden rounded-full border-2 border-accent">
              <Avatar seed={name} size={40} />
            </div>
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-accent text-white">
              <Hand className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-mono text-2xs font-bold uppercase tracking-widest text-accent">
              {name} · raised a hand
            </div>
            {phase === 'bridge' ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
                <TypingDots /> waiting to ask…
              </p>
            ) : (
              <p className="mt-1 text-sm italic leading-relaxed text-neutral-700">{question}</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Lecturer */}
      <div className="mt-3 flex gap-3 border-t border-neutral-100 pt-3">
        <LecturerAvatar size={40} variant={lecturerVariant} speaking={speaking} />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-2xs font-bold uppercase tracking-widest text-primary">
            Lecturer
          </div>
          {phase === 'bridge' && (
            <p className="mt-1 text-sm leading-relaxed text-neutral-800 animate-in fade-in duration-300">
              {bridge}
            </p>
          )}
          {phase === 'question' && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-400">
              <TypingDots /> answering…
            </p>
          )}
          {phase === 'answer' && (
            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
              <p className="mt-1 text-sm leading-relaxed text-neutral-800">{answer}</p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Continue <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TypingDots() {
  return (
    <span className="flex gap-0.5" aria-hidden>
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-300"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </span>
  )
}
