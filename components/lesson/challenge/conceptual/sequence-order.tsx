'use client'

import { useMemo, useState } from 'react'
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react'
import type { SequenceStep } from '@/lib/cases/scenario-bank'
import { shuffleStable } from './shuffle'

/**
 * Sequence: put the stages of a process in the right order. The `steps` come in
 * their correct order; the widget shows them shuffled and the student taps them
 * into an ordered answer, then checks. Scored by how many sit in the right
 * position. For conceptual lessons with a natural order (placement, layering,
 * integration; inherent, control, residual). Tap-based for mobile.
 */
export function SequenceOrder({
  prompt,
  steps,
  onComplete,
}: {
  prompt: string
  steps: SequenceStep[]
  onComplete?: (correct: number, total: number) => void
}) {
  // A stable display shuffle of the pool, so the correct order is never the
  // order shown. seed by the step ids so it does not reshuffle on every render.
  const display = useMemo(() => shuffleStable(steps), [steps])
  const [answer, setAnswer] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const byId = useMemo(() => new Map(steps.map((s) => [s.id, s])), [steps])
  const pool = display.filter((s) => !answer.includes(s.id))
  const full = answer.length === steps.length

  const correctCount = answer.filter((id, i) => steps[i]?.id === id).length

  function place(id: string) {
    if (checked) return
    setAnswer((a) => (a.includes(id) ? a : [...a, id]))
  }
  function removeAt(i: number) {
    if (checked) return
    setAnswer((a) => a.filter((_, j) => j !== i))
  }
  function check() {
    setChecked(true)
    onComplete?.(answer.filter((id, i) => steps[i]?.id === id).length, steps.length)
  }
  function reset() {
    setChecked(false)
    setAnswer([])
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>

      {/* The ordered answer */}
      <ol className="space-y-2">
        {steps.map((_, i) => {
          const id = answer[i]
          const step = id ? byId.get(id) : undefined
          const ok = checked && step && steps[i]?.id === id
          const wrong = checked && step && steps[i]?.id !== id
          let tone = 'border-dashed border-neutral-300 bg-neutral-50/60'
          if (step && !checked) tone = 'border-neutral-200 bg-white'
          if (ok) tone = 'border-primary/40 bg-primary-light'
          if (wrong) tone = 'border-accent/40 bg-accent-light'
          return (
            <li key={i} className="flex items-stretch gap-2">
              <span className="flex w-7 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-2xs font-bold text-neutral-500">
                {i + 1}
              </span>
              <button
                type="button"
                disabled={!step || checked}
                onClick={() => removeAt(i)}
                className={`flex min-h-[2.75rem] flex-1 items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${tone} ${
                  step && !checked ? 'hover:border-accent/50' : ''
                }`}
              >
                {step ? (
                  <span className="flex items-start gap-2 text-neutral-800">
                    {ok && <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                    {wrong && <X className="mt-0.5 h-4 w-4 shrink-0 text-accent" />}
                    <span className="leading-snug">{step.label}</span>
                  </span>
                ) : (
                  <span className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
                    Tap a step below
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      {/* The pool of remaining steps */}
      {!checked && pool.length > 0 && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 p-3">
          <div className="flex flex-wrap gap-2">
            {pool.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => place(s.id)}
                className="max-w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm leading-snug text-neutral-700 shadow-sm transition-all hover:border-primary/50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Post-check reasoning */}
      {checked && (
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={s.id} className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-neutral-600">
              <span className="font-semibold text-neutral-800">
                {i + 1}. {s.label}.
              </span>{' '}
              {s.why}
            </div>
          ))}
        </div>
      )}

      {/* Controls / score */}
      <div className="flex items-center justify-between">
        {checked ? (
          <>
            <span className="text-sm font-medium text-primary">
              {correctCount} of {steps.length} in the right place.
            </span>
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-primary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Try again
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={!full}
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Check order <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
