'use client'

import { useState } from 'react'
import { ClipboardList, Check } from 'lucide-react'
import { submitMockAutopsy } from '@/lib/mock/actions'

/**
 * The mock autopsy: classify every miss before the next simulation unlocks.
 * Five categories, one tap each — the output is a "next 3 repairs" list, not
 * a dashboard. Completing it clears the AUTOPSY_REQUIRED gate in
 * startMockExam.
 */
const CATEGORIES = [
  { id: 'knowledge', label: 'Knowledge gap' },
  { id: 'misread', label: 'Misread it' },
  { id: 'overthink', label: 'Overthought it' },
  { id: 'time', label: 'Time pressure' },
  { id: 'confidence', label: 'Sure but wrong' },
] as const

export type AutopsyMiss = { questionId: string; prompt: string; domain: string | null }

export function AutopsyPanel({
  attemptId,
  misses,
  existing,
  required,
}: {
  attemptId: string
  misses: AutopsyMiss[]
  /** A previously completed autopsy's repairs (renders the done state). */
  existing?: string[] | null
  /** True when the student was bounced here trying to start the next sim. */
  required?: boolean
}) {
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [repairs, setRepairs] = useState<string[] | null>(existing ?? null)
  const [error, setError] = useState<string | null>(null)

  const done = repairs != null
  const complete = misses.every((m) => picks[m.questionId])

  async function submit() {
    if (!complete || saving) return
    setSaving(true)
    setError(null)
    try {
      const res = await submitMockAutopsy(attemptId, picks)
      setRepairs(res.repairs)
    } catch {
      setError('Could not save the autopsy. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (misses.length === 0 && !done) return null

  return (
    <section className="rounded-lg border-2 border-neutral-900 bg-white p-6">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-bold text-neutral-900">The autopsy</h2>
      </div>

      {done ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-neutral-600">
            Autopsy complete. Your next three repairs, in order:
          </p>
          <ol className="space-y-2">
            {repairs!.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-800">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-2xs font-bold text-white">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
          </ol>
          <p className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
            The next simulation is unlocked.
          </p>
        </div>
      ) : (
        <>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">
            {required
              ? 'Your next simulation unlocks after this. '
              : 'Before your next simulation: '}
            classify each miss honestly. A wrong answer is only useful once you know
            which kind of wrong it was.
          </p>
          <div className="mt-5 space-y-4">
            {misses.map((m, i) => (
              <div key={m.questionId} className="rounded-md border border-neutral-200 p-3.5">
                <p className="text-sm leading-relaxed text-neutral-800">
                  <span className="mr-1.5 font-mono text-2xs text-neutral-400">{i + 1}.</span>
                  {m.prompt.length > 180 ? m.prompt.slice(0, 180) + '…' : m.prompt}
                </p>
                {m.domain && (
                  <p className="mt-1 font-mono text-2xs uppercase tracking-widest text-neutral-400">
                    {m.domain}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {CATEGORIES.map((c) => {
                    const active = picks[m.questionId] === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setPicks((p) => ({ ...p, [m.questionId]: c.id }))}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-300 text-neutral-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="font-mono text-2xs uppercase tracking-widest text-neutral-400">
              {Object.keys(picks).length} / {misses.length} classified
            </span>
            <button
              type="button"
              onClick={submit}
              disabled={!complete || saving}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Saving…' : 'Close the autopsy'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm font-medium text-accent">{error}</p>}
        </>
      )}
    </section>
  )
}
