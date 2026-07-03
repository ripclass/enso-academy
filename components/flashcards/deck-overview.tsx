'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'

type Counts = { due: number; learned: number; total: number }

/** The deck landing: due / learned / total tiles, a start button, and a learned bar. */
export function DeckOverview({
  counts,
  canStart,
  onStart,
}: {
  counts: Counts
  canStart: boolean
  onStart: () => void
}) {
  const { due, learned, total } = counts
  const pct = total ? Math.round((learned / total) * 100) : 0

  return (
    <div className="rounded-lg border-2 border-neutral-900 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Tile value={due} label="Due today" accent={due > 0} />
        <Tile value={learned} label="Learned" />
        <Tile value={total} label="In deck" />
      </div>

      <div className="mt-7">
        {canStart ? (
          <button
            type="button"
            onClick={onStart}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Start studying <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-md bg-primary-light px-4 py-2.5 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {total === 0 ? 'No glossary for this course yet.' : 'All caught up. Come back when cards are due.'}
          </p>
        )}
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-wider text-neutral-400">
          <span>Learned</span>
          <span>
            {learned} / {total}
          </span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

function Tile({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-muted/40 px-3 py-4 text-center">
      <div className={`font-mono text-3xl font-extrabold ${accent ? 'text-accent' : 'text-neutral-900'}`}>
        {value}
      </div>
      <div className="mt-1 font-mono text-2xs font-semibold uppercase tracking-wider text-neutral-400">
        {label}
      </div>
    </div>
  )
}
