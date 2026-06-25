'use client'

import { useMemo, useState } from 'react'
import { Check, X, GripVertical } from 'lucide-react'
import type { RiskClassifyItem } from '@/lib/lesson/scenes'

type Tier = 'low' | 'medium' | 'high'

const TIERS: { tier: Tier; label: string; ring: string; chip: string }[] = [
  { tier: 'low', label: 'Lower risk', ring: 'border-primary/30', chip: 'bg-primary text-white' },
  { tier: 'medium', label: 'Medium risk', ring: 'border-accent/40', chip: 'bg-accent text-white' },
  { tier: 'high', label: 'Higher risk', ring: 'border-destructive/40', chip: 'bg-destructive text-white' },
]
const TIER_LABEL: Record<Tier, string> = { low: 'Lower risk', medium: 'Medium risk', high: 'Higher risk' }

/**
 * Drag (or tap) each customer scenario into the risk tier you'd assign it.
 * Each placement locks with immediate feedback; a wrong tier shows the right
 * one and why. Calls `onComplete` once everything is placed.
 */
export function RiskClassify({
  prompt,
  items,
  onComplete,
}: {
  prompt?: string
  items: RiskClassifyItem[]
  onComplete?: (correct: number, total: number) => void
}) {
  // itemId → tier it was dropped in (undefined = still in the tray).
  const [placed, setPlaced] = useState<Record<string, Tier>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overTier, setOverTier] = useState<Tier | null>(null)
  const [reported, setReported] = useState(false)

  const tray = items.filter((it) => !placed[it.id])
  const done = tray.length === 0
  const correctCount = useMemo(
    () => items.filter((it) => placed[it.id] === it.tier).length,
    [items, placed],
  )

  function place(id: string, tier: Tier) {
    if (placed[id]) return
    const next = { ...placed, [id]: tier }
    setPlaced(next)
    setSelectedId(null)
    if (items.every((it) => next[it.id]) && !reported) {
      setReported(true)
      const correct = items.filter((it) => next[it.id] === it.tier).length
      onComplete?.(correct, items.length)
    }
  }

  return (
    <div className="space-y-5">
      {prompt && <p className="text-sm leading-relaxed text-neutral-600">{prompt}</p>}

      {/* Tray of unplaced scenarios */}
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
                draggable
                onDragStart={() => setDragId(it.id)}
                onDragEnd={() => setDragId(null)}
                onClick={() => setSelectedId((s) => (s === it.id ? null : it.id))}
                className={`flex max-w-xs items-start gap-1.5 rounded-lg border bg-white px-3 py-2 text-left text-sm text-neutral-700 shadow-sm transition-all ${
                  selectedId === it.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-neutral-200 hover:border-primary/50'
                } ${dragId === it.id ? 'opacity-50' : ''}`}
              >
                <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
                <span className="leading-snug">{it.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedId && !done && (
        <p className="text-center font-mono text-2xs uppercase tracking-widest text-primary">
          Now pick a tier ↓
        </p>
      )}

      {/* The three risk tiers */}
      <div className="grid gap-3 sm:grid-cols-3">
        {TIERS.map(({ tier, label, ring, chip }) => {
          const here = items.filter((it) => placed[it.id] === tier)
          return (
            <div
              key={tier}
              onDragOver={(e) => {
                e.preventDefault()
                setOverTier(tier)
              }}
              onDragLeave={() => setOverTier((t) => (t === tier ? null : t))}
              onDrop={() => {
                if (dragId) place(dragId, tier)
                setOverTier(null)
                setDragId(null)
              }}
              onClick={() => selectedId && place(selectedId, tier)}
              className={`flex min-h-[7rem] flex-col rounded-lg border-2 p-3 transition-colors ${ring} ${
                overTier === tier ? 'bg-neutral-50' : 'bg-white'
              } ${selectedId ? 'cursor-pointer hover:bg-neutral-50' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider ${chip}`}>
                  {label}
                </span>
              </div>
              <div className="space-y-1.5">
                {here.map((it) => {
                  const ok = it.tier === tier
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
                        {ok ? it.why : `Better fit: ${TIER_LABEL[it.tier]}. ${it.why}`}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Score */}
      {done && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center text-sm font-medium text-primary animate-in fade-in duration-300">
          {correctCount} of {items.length} placed in the right tier.
          {correctCount === items.length
            ? ' Spot on.'
            : ' Review the ones marked in red. The reasoning is what the exam tests.'}
        </div>
      )}
    </div>
  )
}
