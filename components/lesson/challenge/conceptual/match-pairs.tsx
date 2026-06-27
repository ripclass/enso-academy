'use client'

import { useMemo, useState } from 'react'
import { Check, X, ArrowRight, RotateCcw } from 'lucide-react'
import type { MatchPair } from '@/lib/cases/scenario-bank'
import { shuffleStable } from './shuffle'

/**
 * Match: pair each term on the left with its correct role/definition on the
 * right. The right column is shown shuffled; the student taps a term, then taps
 * the definition that fits it. Scored by correct pairs. For conceptual lessons
 * where the work is "which one is which" (FATF bodies and their roles, terms and
 * their meanings). Tap-based for mobile.
 */
export function MatchPairs({
  prompt,
  pairs,
  onComplete,
}: {
  prompt: string
  pairs: MatchPair[]
  onComplete?: (correct: number, total: number) => void
}) {
  // Right column shuffled so left order never gives the answer.
  const rights = useMemo(
    () => shuffleStable(pairs.map((p) => ({ id: p.id, text: p.right }))),
    [pairs],
  )
  const [assign, setAssign] = useState<Record<string, string>>({}) // leftId -> rightId
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const assignedRights = new Set(Object.values(assign))
  const tray = rights.filter((r) => !assignedRights.has(r.id))
  const rightText = (id: string) => rights.find((r) => r.id === id)?.text ?? ''
  const full = pairs.every((p) => assign[p.id])
  const correctCount = pairs.filter((p) => assign[p.id] === p.id).length

  function pickRight(rightId: string) {
    if (checked || !selectedLeft) return
    setAssign((a) => ({ ...a, [selectedLeft]: rightId }))
    setSelectedLeft(null)
  }
  function tapLeft(leftId: string) {
    if (checked) return
    if (assign[leftId]) {
      // Unassign and re-select for reassignment.
      setAssign((a) => {
        const next = { ...a }
        delete next[leftId]
        return next
      })
      setSelectedLeft(leftId)
      return
    }
    setSelectedLeft((s) => (s === leftId ? null : leftId))
  }
  function check() {
    setChecked(true)
    onComplete?.(pairs.filter((p) => assign[p.id] === p.id).length, pairs.length)
  }
  function reset() {
    setChecked(false)
    setAssign({})
    setSelectedLeft(null)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>

      {/* Terms (tap targets) */}
      <ul className="space-y-2">
        {pairs.map((p) => {
          const a = assign[p.id]
          const ok = checked && a === p.id
          const wrong = checked && a && a !== p.id
          const selected = selectedLeft === p.id
          let tone = 'border-neutral-200 bg-white'
          if (selected) tone = 'border-primary ring-2 ring-primary/20 bg-white'
          if (ok) tone = 'border-primary/40 bg-primary-light'
          if (wrong) tone = 'border-accent/40 bg-accent-light'
          return (
            <li key={p.id}>
              <button
                type="button"
                disabled={checked}
                onClick={() => tapLeft(p.id)}
                className={`flex w-full flex-col gap-1 rounded-lg border px-3 py-2.5 text-left transition-colors ${tone} ${
                  !checked ? 'hover:border-primary/50' : ''
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  {ok && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  {wrong && <X className="h-4 w-4 shrink-0 text-accent" />}
                  {p.left}
                </span>
                <span className={`text-xs leading-snug ${a ? 'text-neutral-600' : 'text-neutral-400'}`}>
                  {a ? rightText(a) : selected ? 'Now tap its match below' : 'Tap, then pick a match'}
                </span>
                {checked && wrong && (
                  <span className="text-2xs leading-relaxed text-neutral-500">
                    Correct match: {p.right}. {p.why}
                  </span>
                )}
                {checked && ok && p.why && (
                  <span className="text-2xs leading-relaxed text-neutral-500">{p.why}</span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {/* The definitions tray */}
      {!checked && tray.length > 0 && (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 p-3">
          {!selectedLeft && (
            <p className="mb-2 text-center font-mono text-2xs uppercase tracking-widest text-neutral-400">
              Tap a term above first
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {tray.map((r) => (
              <button
                key={r.id}
                type="button"
                disabled={!selectedLeft}
                onClick={() => pickRight(r.id)}
                className={`max-w-full rounded-lg border bg-white px-3 py-2 text-left text-sm leading-snug shadow-sm transition-all ${
                  selectedLeft
                    ? 'border-neutral-200 text-neutral-700 hover:border-primary/50'
                    : 'border-neutral-200 text-neutral-400'
                }`}
              >
                {r.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls / score */}
      <div className="flex items-center justify-between">
        {checked ? (
          <>
            <span className="text-sm font-medium text-primary">
              {correctCount} of {pairs.length} matched correctly.
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
            Check matches <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
