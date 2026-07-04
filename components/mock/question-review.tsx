'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, MinusCircle, XCircle } from 'lucide-react'
import { QuestionQa } from '@/components/mock/question-qa'

export type ReviewItem = {
  questionId: string
  index: number
  questionText: string
  options: { id: string; text: string }[]
  correctIds: string[]
  studentIds: string[]
  outcome: 'correct' | 'incorrect' | 'skipped'
  explanation: string | null
  rationales: Record<string, string> | null
}

type Filter = 'all' | 'incorrect' | 'skipped' | 'correct'

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'incorrect', label: 'Incorrect' },
  { id: 'skipped', label: 'Skipped' },
  { id: 'correct', label: 'Correct' },
]

/**
 * The per-question review, as a collapsed, filterable accordion. Every
 * question defaults to a single-line header (outcome icon + truncated
 * stem); expanding one reveals the same option/rationale/explanation/Q&A
 * body the review used to render inline for every question at once.
 */
export function QuestionReview({
  attemptId,
  items,
}: {
  attemptId: string
  items: ReviewItem[]
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: items.length, incorrect: 0, skipped: 0, correct: 0 }
    for (const item of items) {
      if (item.outcome === 'incorrect') c.incorrect += 1
      else if (item.outcome === 'skipped') c.skipped += 1
      else if (item.outcome === 'correct') c.correct += 1
    }
    return c
  }, [items])

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.outcome === filter)),
    [items, filter],
  )

  const allFilteredExpanded =
    filtered.length > 0 && filtered.every((item) => expanded.has(item.questionId))

  function toggle(questionId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) next.delete(questionId)
      else next.add(questionId)
      return next
    })
  }

  function toggleAll() {
    setExpanded((prev) => {
      if (allFilteredExpanded) {
        const next = new Set(prev)
        for (const item of filtered) next.delete(item.questionId)
        return next
      }
      const next = new Set(prev)
      for (const item of filtered) next.add(item.questionId)
      return next
    })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => {
            const count = counts[f.id]
            if (f.id !== 'all' && count === 0) return null
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-1 font-mono text-2xs font-semibold uppercase tracking-wider transition-colors ${
                  active
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-neutral-200 text-neutral-500 hover:text-primary'
                }`}
              >
                {f.label} ({count})
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={toggleAll}
          disabled={filtered.length === 0}
          className="font-mono text-2xs font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:text-primary disabled:opacity-40"
        >
          {allFilteredExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {filtered.map((item) => {
          const isOpen = expanded.has(item.questionId)
          const correctSet = new Set(item.correctIds)
          const studentSet = new Set(item.studentIds)

          return (
            <div key={item.questionId} className="rounded-lg border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => toggle(item.questionId)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <span className="mt-0.5 shrink-0 font-mono text-2xs tabular-nums text-neutral-400">
                  Q{item.index + 1}
                </span>
                <span className="mt-0.5 shrink-0">
                  {item.outcome === 'skipped' ? (
                    <MinusCircle className="h-4 w-4 text-neutral-400" />
                  ) : item.outcome === 'correct' ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 text-accent" />
                  )}
                </span>
                <span
                  className="line-clamp-2 flex-1 text-sm font-semibold leading-relaxed text-neutral-800"
                >
                  {item.questionText}
                </span>
                <ChevronDown
                  className={`mt-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-neutral-100 px-6 pb-6 pt-4">
                  <div className="space-y-2">
                    {item.options.map((opt) => {
                      const isCorrectOpt = correctSet.has(opt.id)
                      const isStudentPick = studentSet.has(opt.id)
                      const isStudentWrong = isStudentPick && !isCorrectOpt
                      // The rationale for a wrong option the student actually picked:
                      // shown beneath that option so the miss is explained in place.
                      const wrongRationale = isStudentWrong
                        ? item.rationales?.[opt.id]
                        : undefined
                      return (
                        <div key={opt.id}>
                          <div
                            className={`text-sm rounded border px-3 py-2 flex items-start gap-2 ${
                              isCorrectOpt
                                ? 'border-primary/30 bg-primary-light/40 text-neutral-900'
                                : isStudentWrong
                                  ? 'border-accent/30 bg-accent-light/40 text-neutral-900'
                                  : 'border-neutral-200 text-neutral-600'
                            }`}
                          >
                            <span className="shrink-0 w-4 text-center font-mono text-xs" aria-hidden>
                              {isCorrectOpt ? '✓' : isStudentWrong ? '✗' : ''}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {wrongRationale && (
                            <div className="mt-1.5 pl-9">
                              <div className="text-2xs font-mono uppercase tracking-widest text-accent/70">
                                Why this is wrong
                              </div>
                              <p className="mt-0.5 text-sm text-neutral-600 leading-relaxed">
                                {wrongRationale}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {item.explanation && (
                    <p className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-600 leading-relaxed">
                      {item.explanation}
                    </p>
                  )}
                  <QuestionQa attemptId={attemptId} questionId={item.questionId} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
