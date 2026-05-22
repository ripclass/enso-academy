import React from 'react'

/**
 * In-app UI kit — the "Auditable Editorial" building blocks shared across the
 * dashboard, course, and mock surfaces. See docs/BRAND.md.
 */

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-neutral-200 pb-3 mb-6">
      <h2 className="text-lg font-bold tracking-tight text-primary">{title}</h2>
      {subtitle && <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export function StatDisplay({
  label,
  value,
  subtext,
}: {
  label: string
  value: string
  subtext?: string
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-2xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 mt-1 font-mono">{value}</p>
      {subtext && <p className="text-2xs text-neutral-400 mt-1">{subtext}</p>}
    </div>
  )
}

const BADGE_STYLES: Record<'ready' | 'approaching' | 'locked', { cls: string; label: string }> = {
  ready: { cls: 'bg-primary-light text-primary border-primary/20', label: 'Ready' },
  approaching: { cls: 'bg-accent-light text-accent border-accent/20', label: 'Approaching' },
  locked: { cls: 'bg-neutral-100 text-neutral-500 border-neutral-200', label: 'Locked' },
}

export function StatusBadge({
  status,
  label,
}: {
  status: 'ready' | 'approaching' | 'locked'
  label?: string
}) {
  const config = BADGE_STYLES[status]
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider font-mono ${config.cls}`}
    >
      {label ?? config.label}
    </span>
  )
}

export function ConceptMasteryRow({ concept, score }: { concept: string; score: number }) {
  const rounded = Math.round(score)
  const isStrong = rounded >= 75
  const isWeak = rounded < 60
  const barColor = isStrong ? 'bg-primary' : isWeak ? 'bg-accent' : 'bg-neutral-400'
  const textColor = isStrong ? 'text-primary' : isWeak ? 'text-accent' : 'text-neutral-600'

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-neutral-100 last:border-0">
      <span className="text-sm font-medium text-neutral-700 truncate pr-4">{concept}</span>
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${rounded}%` }} />
        </div>
        <span className={`text-sm font-bold font-mono w-10 text-right ${textColor}`}>
          {rounded}%
        </span>
      </div>
    </div>
  )
}
