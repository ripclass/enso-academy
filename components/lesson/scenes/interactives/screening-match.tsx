'use client'

import { useState } from 'react'
import { Check, X, ShieldAlert, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react'
import type { ScreeningAlert, ScreeningField } from '@/lib/lesson/scenes'

/**
 * Sanctions/PEP alert adjudication. The student works a queue of screening
 * alerts: for each, an inbound party is shown side-by-side with the watchlist
 * record that triggered it, and they decide Clear (false positive) or Escalate
 * (true / potential match) — weighing fuzzy names, DOB, country, identifiers.
 * Each decision gives feedback + the reasoning; a running score feeds the
 * knowledge model.
 */
export function ScreeningMatch({
  prompt,
  alerts,
  onComplete,
}: {
  prompt?: string
  alerts: ScreeningAlert[]
  onComplete?: (correct: number, total: number) => void
}) {
  const [idx, setIdx] = useState(0)
  const [decided, setDecided] = useState<'clear' | 'escalate' | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const alert = alerts[idx]
  const isLast = idx === alerts.length - 1
  const correct = decided != null && decided === alert?.verdict

  function decide(v: 'clear' | 'escalate') {
    if (decided || !alert) return
    setDecided(v)
    if (v === alert.verdict) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) {
      setFinished(true)
      onComplete?.(score, alerts.length)
      return
    }
    setIdx((i) => i + 1)
    setDecided(null)
  }

  function restart() {
    setIdx(0)
    setDecided(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-5 text-center">
          <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
          <p className="mt-2 text-lg font-semibold text-neutral-800">
            {score} of {alerts.length} adjudicated correctly
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Clearing a true match lets a prohibited party through; escalating every alert buries the
            real ones. The call is the judgment.
          </p>
        </div>
        <button
          type="button"
          onClick={restart}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Work them again
        </button>
      </div>
    )
  }

  if (!alert) return null

  return (
    <div className="space-y-4">
      {prompt && <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>}

      <div className="flex items-center justify-between text-xs">
        <span className="font-mono uppercase tracking-widest text-neutral-400">
          Alert {idx + 1} of {alerts.length}
        </span>
        <span className="font-mono tabular-nums text-neutral-400">
          {score} correct
        </span>
      </div>

      {/* The two records, side by side */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Record
          heading="Inbound party"
          name={alert.party.name}
          fields={alert.party.fields}
          tone="neutral"
        />
        <Record
          heading={`Watchlist hit · ${alert.listEntry.list}`}
          name={alert.listEntry.name}
          fields={alert.listEntry.fields}
          tone="alert"
        />
      </div>

      {/* Decision */}
      {!decided ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => decide('clear')}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 text-sm font-semibold text-neutral-700 transition-colors hover:border-emerald-400 hover:text-emerald-700"
          >
            <ShieldCheck className="h-4 w-4" /> Clear (false positive)
          </button>
          <button
            type="button"
            onClick={() => decide('escalate')}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 text-sm font-semibold text-neutral-700 transition-colors hover:border-rose-400 hover:text-rose-700"
          >
            <ShieldAlert className="h-4 w-4" /> Escalate (true match)
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
              correct ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
            }`}
          >
            {correct ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <span>
              <span className="font-semibold">
                {correct ? 'Correct. ' : `Not quite. The right call was to ${alert.verdict}. `}
              </span>
              {alert.why}
            </span>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={next}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {isLast ? 'See result' : 'Next alert'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Record({
  heading,
  name,
  fields,
  tone,
}: {
  heading: string
  name: string
  fields?: ScreeningField[]
  tone: 'neutral' | 'alert'
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        tone === 'alert' ? 'border-rose-200 bg-rose-50/40' : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="font-mono text-2xs uppercase tracking-widest text-neutral-400">{heading}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-800">{name}</div>
      {fields && fields.length > 0 && (
        <dl className="mt-2 space-y-1">
          {fields.map((f, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <dt className="w-20 shrink-0 text-neutral-400">{f.label}</dt>
              <dd className="min-w-0 text-neutral-700">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
