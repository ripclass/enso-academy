'use client'

import { useState } from 'react'
import { Check, X, AlertTriangle, RotateCcw } from 'lucide-react'
import type { RedFlagItem } from '@/lib/lesson/scenes'

/**
 * Spot-the-red-flags: select the statements that are genuine indicators, then
 * check. Each item gives feedback — correctly flagged, missed, or a false
 * positive — and a score. Reusable across typologies, sanctions, fraud, etc.
 */
export function RedFlagSpot({
  prompt,
  scenario,
  items,
  onComplete,
}: {
  prompt?: string
  scenario?: string
  items: RedFlagItem[]
  onComplete?: (correct: number, total: number) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [checked, setChecked] = useState(false)

  function toggle(id: string) {
    if (checked) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function check() {
    setChecked(true)
    const correct = items.filter((it) => selected.has(it.id) === it.flag).length
    onComplete?.(correct, items.length)
  }

  function reset() {
    setChecked(false)
    setSelected(new Set())
  }

  const correctCount = items.filter((it) => selected.has(it.id) === it.flag).length

  return (
    <div className="space-y-4">
      {prompt && <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>}
      {scenario && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-3 text-sm leading-relaxed text-neutral-700">
          {scenario}
        </div>
      )}

      <ul className="space-y-2">
        {items.map((it) => {
          const sel = selected.has(it.id)
          let state: 'idle' | 'hit' | 'miss' | 'false' | 'ok' = 'idle'
          if (checked) {
            if (it.flag && sel) state = 'hit'
            else if (it.flag && !sel) state = 'miss'
            else if (!it.flag && sel) state = 'false'
            else state = 'ok'
          }
          const tone =
            state === 'hit'
              ? 'border-emerald-200 bg-emerald-50'
              : state === 'miss'
                ? 'border-amber-200 bg-amber-50'
                : state === 'false'
                  ? 'border-rose-200 bg-rose-50'
                  : state === 'ok'
                    ? 'border-neutral-200 bg-neutral-50'
                    : sel
                      ? 'border-primary bg-primary/5'
                      : 'border-neutral-200 bg-white hover:border-primary/40'
          return (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => toggle(it.id)}
                disabled={checked}
                className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left text-sm transition-colors ${tone}`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    sel ? 'border-primary bg-primary text-white' : 'border-neutral-300 bg-white'
                  }`}
                >
                  {sel && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0">
                  <span className="text-neutral-800">{it.label}</span>
                  {checked && (
                    <span className="mt-1 flex items-start gap-1.5 text-2xs text-neutral-500">
                      {state === 'hit' && <Check className="mt-px h-3 w-3 shrink-0 text-emerald-600" />}
                      {state === 'miss' && (
                        <AlertTriangle className="mt-px h-3 w-3 shrink-0 text-amber-600" />
                      )}
                      {state === 'false' && <X className="mt-px h-3 w-3 shrink-0 text-rose-600" />}
                      {state === 'ok' && <Check className="mt-px h-3 w-3 shrink-0 text-neutral-400" />}
                      <span>
                        {state === 'miss' && 'Missed. This is a red flag. '}
                        {state === 'false' && 'Not a red flag. '}
                        {it.why}
                      </span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex items-center justify-between">
        {checked ? (
          <>
            <span className="text-sm font-medium text-primary">
              {correctCount} of {items.length} judged correctly.
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
            disabled={selected.size === 0}
            className="ml-auto inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Check answers
          </button>
        )}
      </div>
    </div>
  )
}
