'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Shuffle, RotateCcw, Check, X } from 'lucide-react'
import { recordQuizEvidence } from '@/lib/lesson/actions'
import { ConfidenceChips, type Confidence } from '@/components/lesson/scenes/confidence-chips'
import { useShuffled } from '@/components/lesson/scenes/use-shuffled'
import type { DeskMixQuestion } from '@/lib/practice/desk-mix'

/**
 * Desk Mix runner: one committed decision at a time, no lesson scaffolding.
 * The exam's shape, not the lesson's: you don't know the topic until AFTER
 * you commit (the domain + concept reveal is part of the feedback). Every
 * answer feeds the same student knowledge model as lessons and mocks.
 */
export function DeskMixSession({
  courseSlug,
  courseId,
  questions,
}: {
  courseSlug: string
  courseId: string
  questions: DeskMixQuestion[]
}) {
  const router = useRouter()
  const [idx, setIdx] = useState(0)
  const [pending, setPending] = useState<string | null>(null)
  const [committed, setCommitted] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [tally, setTally] = useState({ over: 0, under: 0 })
  const [missed, setMissed] = useState<string[]>([])
  const [finished, setFinished] = useState(false)

  const q = questions[idx]
  const isLast = idx === questions.length - 1
  // SSR-safe shuffle: source order on the server paint, shuffled after mount
  // (a render-time Math.random() order diverges between server and client).
  const options = useShuffled(q?.options ?? [])
  const correct = committed != null && committed === q?.correctOptionId

  function commit(confidence: Confidence) {
    if (!pending || committed || !q) return
    const isCorrect = pending === q.correctOptionId
    setCommitted(pending)
    setPending(null)
    if (isCorrect) setScore((s) => s + 1)
    else setMissed((m) => [...new Set([...m, ...q.conceptTags])])
    setTally((t) => ({
      over: t.over + (confidence === 'high' && !isCorrect ? 1 : 0),
      under: t.under + (confidence === 'low' && isCorrect ? 1 : 0),
    }))
    void recordQuizEvidence({ courseId, conceptTags: q.conceptTags, correct: isCorrect }).catch(
      () => {},
    )
  }

  function next() {
    if (isLast) {
      setFinished(true)
      return
    }
    setIdx((i) => i + 1)
    setCommitted(null)
    setPending(null)
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-xl space-y-5">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-6">
          <p className="text-lg font-semibold text-neutral-800">
            Mix complete: {score} of {questions.length}.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            {tally.over > 0 && (
              <>
                <span className="font-semibold text-accent">{tally.over} certain-but-wrong</span>
                {': those are the exam’s most dangerous misses; the model has them now. '}
              </>
            )}
            {tally.under > 0 && <>{tally.under} unsure-but-right; trust your reads more. </>}
            {missed.length > 0 ? (
              <>Missed ground: {[...new Set(missed)].slice(0, 4).map((t) => t.replace(/_/g, ' ')).join(', ')}.</>
            ) : (
              <>Clean sheet across mixed domains. That is what transfer looks like.</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <RotateCcw className="h-4 w-4" /> Run another mix
          </button>
          <Link
            href={`/courses/${courseSlug}`}
            className="inline-flex h-10 items-center rounded-md border border-neutral-300 px-5 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          >
            Back to the course
          </Link>
        </div>
      </div>
    )
  }

  if (!q) return null

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-widest text-neutral-500">
          <Shuffle className="h-3.5 w-3.5 text-accent" /> Desk Mix
        </span>
        <span className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
          {idx + 1} / {questions.length}
        </span>
      </div>

      <div className="rounded-lg border border-neutral-300 bg-white p-5 shadow-sm">
        <p className="font-medium leading-relaxed text-neutral-900">{q.prompt}</p>
        <div className="mt-4 space-y-2">
          {options.map((o) => {
            const isSel = (committed ?? pending) === o.id
            const isCorrectOpt = committed != null && o.id === q.correctOptionId
            let cls =
              'w-full rounded-md border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors'
            if (committed == null && pending == null) {
              cls += ' border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
            } else if (committed == null) {
              cls += isSel
                ? ' border-primary bg-neutral-50 text-foreground'
                : ' border-neutral-200 text-neutral-400'
            } else if (isCorrectOpt) {
              cls += ' border-primary bg-primary-light text-foreground'
            } else if (isSel) {
              cls += ' border-accent bg-accent-light text-foreground'
            } else {
              cls += ' border-neutral-200 text-neutral-400'
            }
            return (
              <button
                key={o.id}
                type="button"
                disabled={pending != null || committed != null}
                onClick={() => setPending(o.id)}
                className={cls}
              >
                {o.text}
              </button>
            )
          })}
        </div>

        {pending && !committed && (
          <div className="mt-3">
            <ConfidenceChips onPick={commit} />
          </div>
        )}

        {committed && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-300">
            <div
              className={`flex items-start gap-2 rounded-md px-3 py-2.5 text-sm leading-relaxed ${
                correct ? 'bg-primary-light text-foreground' : 'bg-accent-light text-foreground'
              }`}
            >
              {correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              )}
              <span>
                <span className="font-semibold">{correct ? 'Correct. ' : 'Not the call. '}</span>
                {q.explanation}
              </span>
            </div>
            {/* The reveal the lesson never withholds: what ground you were on. */}
            <p className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
              This was{q.domain ? `: ${q.domain}` : ''} ·{' '}
              {q.conceptTags.slice(0, 3).map((t) => t.replace(/_/g, ' ')).join(' · ')}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={next}
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                {isLast ? 'Finish the mix' : 'Next decision'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
