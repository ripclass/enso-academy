'use client'

import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import type { SortBucket, SortItem } from '@/lib/cases/scenario-bank'
import { shuffle } from './shuffle'

const GRID: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2',
}

/**
 * Sort: drop each item into the category it belongs to. Generalizes the
 * risk-classify widget from fixed risk tiers to arbitrary named buckets, for
 * conceptual lessons (money laundering vs terrorist financing vs both; the
 * policy groupings of the 40 Recommendations). Tap an item, tap a bucket;
 * placement locks with immediate feedback. Tap-based for mobile.
 */
export function SortBuckets({
  prompt,
  buckets,
  items,
  onComplete,
}: {
  prompt: string
  buckets: SortBucket[]
  items: SortItem[]
  onComplete?: (correct: number, total: number) => void
}) {
  const shuffled = useMemo(() => shuffle(items), [items])
  const [placed, setPlaced] = useState<Record<string, string>>({}) // itemId -> bucketId
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reported, setReported] = useState(false)

  const tray = shuffled.filter((it) => !placed[it.id])
  const done = tray.length === 0
  const bucketLabel = (id: string) => buckets.find((b) => b.id === id)?.label ?? id
  const correctCount = items.filter((it) => placed[it.id] === it.bucket).length

  function place(itemId: string, bucketId: string) {
    if (placed[itemId]) return
    const next = { ...placed, [itemId]: bucketId }
    setPlaced(next)
    setSelectedId(null)
    if (items.every((it) => next[it.id]) && !reported) {
      setReported(true)
      onComplete?.(items.filter((it) => next[it.id] === it.bucket).length, items.length)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>

      {/* Tray */}
      <div className="min-h-[3rem] rounded-lg border border-dashed border-neutral-300 bg-neutral-50/60 p-3">
        {tray.length === 0 ? (
          <p className="py-1 text-center font-mono text-2xs uppercase tracking-widest text-neutral-400">
            All sorted
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tray.map((it) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setSelectedId((s) => (s === it.id ? null : it.id))}
                className={`max-w-full rounded-lg border bg-white px-3 py-2 text-left text-sm leading-snug text-neutral-700 shadow-sm transition-all ${
                  selectedId === it.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-neutral-200 hover:border-primary/50'
                }`}
              >
                {it.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && !done && (
        <p className="text-center font-mono text-2xs uppercase tracking-widest text-primary">
          Now pick a category
        </p>
      )}

      {/* Buckets */}
      <div className={`grid grid-cols-1 gap-3 ${GRID[buckets.length] ?? 'sm:grid-cols-2'}`}>
        {buckets.map((b) => {
          const here = items.filter((it) => placed[it.id] === b.id)
          return (
            <div
              key={b.id}
              onClick={() => selectedId && place(selectedId, b.id)}
              className={`flex min-h-[7rem] flex-col rounded-lg border-2 border-neutral-200 p-3 transition-colors ${
                selectedId ? 'cursor-pointer hover:bg-neutral-50' : ''
              }`}
            >
              <span className="mb-2 inline-flex w-fit rounded-full bg-muted px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider text-neutral-600">
                {b.label}
              </span>
              <div className="space-y-1.5">
                {here.map((it) => {
                  const ok = it.bucket === b.id
                  return (
                    <div
                      key={it.id}
                      className={`rounded-md border p-2 text-xs leading-snug ${
                        ok ? 'border-primary/30 bg-primary-light' : 'border-destructive/30 bg-destructive/10'
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        {ok ? (
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        ) : (
                          <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                        )}
                        <span className="text-neutral-700">{it.label}</span>
                      </div>
                      <p className="mt-1 pl-5 text-2xs text-neutral-500">
                        {ok ? it.why : `Belongs in ${bucketLabel(it.bucket)}. ${it.why}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {done && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center text-sm font-medium text-primary animate-in fade-in duration-300">
          {correctCount} of {items.length} sorted correctly.
          {correctCount === items.length
            ? ' Spot on.'
            : ' Review the ones marked in red, the reasoning is what the exam tests.'}
        </div>
      )}
    </div>
  )
}
