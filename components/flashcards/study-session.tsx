'use client'

import { useState } from 'react'
import { RotateCcw, ArrowRight, CheckCircle2 } from 'lucide-react'
import { recordFlashcardReview } from '@/lib/flashcards/actions'
import type { FlashCard } from '@/lib/flashcards/types'
import { intervalHint, type Rating } from '@/lib/flashcards/schedule'

/**
 * One study pass over the deck. Flip a card, self-rate, and the rating schedules
 * the card and moves on. "Again" re-queues the card to the end of this session so
 * it comes back once more now; "Good"/"Easy" retire it for this pass. The write
 * is fire-and-forget so the UI never waits on the network between cards.
 */
export function StudySession({
  courseSlug,
  cards,
  onDone,
}: {
  courseSlug: string
  cards: FlashCard[]
  onDone: () => void
}) {
  const [queue, setQueue] = useState<FlashCard[]>(cards)
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)

  const current = queue[pos]

  function rate(rating: Rating) {
    if (!current) return
    void recordFlashcardReview(courseSlug, current.glossaryId, rating).catch(() => {})
    setReviewed((n) => n + 1)
    if (rating === 'again') setQueue((q) => [...q, current]) // see it again this session
    setFlipped(false)
    setPos((p) => p + 1)
  }

  // ── End of pass ─────────────────────────────────────────────────────────────
  if (!current) {
    return (
      <div className="rounded-lg border-2 border-neutral-900 bg-white p-8 text-center">
        <div className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
          Session done
        </div>
        <div className="mt-2 inline-flex items-center gap-2 text-4xl font-extrabold font-mono text-primary">
          <CheckCircle2 className="h-8 w-8" /> {reviewed}
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {reviewed === 1 ? 'card reviewed' : 'cards reviewed'}. Nice work.
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          The ones you found hard will come back sooner. Come back tomorrow to keep them fresh.
        </p>
        <button
          type="button"
          onClick={onDone}
          className="mt-6 inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Back to deck <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const remaining = queue.length - pos
  const pct = queue.length ? Math.round((pos / queue.length) * 100) : 0

  return (
    <div>
      {/* Progress rail */}
      <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-wider text-neutral-400">
        <span className="inline-flex items-center gap-1.5 text-accent">
          <RotateCcw className="h-3.5 w-3.5" /> Studying
        </span>
        <span>{remaining} to go</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* Card */}
      <div className="mt-5">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="flex min-h-[13rem] w-full flex-col items-center justify-center gap-4 rounded-lg border-2 border-neutral-900 bg-white p-8 text-center transition-colors hover:border-primary"
          >
            <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
              Term
            </span>
            <span className="text-2xl font-bold tracking-tight text-neutral-900">{current.term}</span>
            <span className="font-mono text-2xs uppercase tracking-wider text-neutral-300">
              tap to flip
            </span>
          </button>
        ) : (
          <div className="min-h-[13rem] rounded-lg border-2 border-neutral-900 bg-white p-8 animate-in fade-in duration-200">
            <div className="text-lg font-bold text-neutral-900">{current.term}</div>
            <div className="mt-3 border-t border-neutral-200 pt-3 text-sm leading-relaxed text-neutral-700">
              {current.definition}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-5">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="inline-flex h-10 items-center justify-center rounded-md border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          >
            Show answer
          </button>
        ) : (
          <div>
            <p className="font-mono text-2xs uppercase tracking-wider text-neutral-400">
              How well did you know it?
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
              <RateButton label="Again" hint={intervalHint(current.box, 'again')} tone="again" onClick={() => rate('again')} />
              <RateButton label="Good" hint={intervalHint(current.box, 'good')} tone="good" onClick={() => rate('good')} />
              <RateButton label="Easy" hint={intervalHint(current.box, 'easy')} tone="easy" onClick={() => rate('easy')} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RateButton({
  label,
  hint,
  tone,
  onClick,
}: {
  label: string
  hint: string
  tone: 'again' | 'good' | 'easy'
  onClick: () => void
}) {
  const border =
    tone === 'again'
      ? 'border-destructive/40 hover:border-destructive hover:bg-destructive/5'
      : tone === 'easy'
        ? 'border-primary/40 hover:border-primary hover:bg-primary-light'
        : 'border-neutral-300 hover:border-primary hover:bg-muted'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-md border py-3 text-sm font-semibold text-neutral-800 transition-colors ${border}`}
    >
      {label}
      <span className="font-mono text-2xs font-normal uppercase tracking-wider text-neutral-400">{hint}</span>
    </button>
  )
}
