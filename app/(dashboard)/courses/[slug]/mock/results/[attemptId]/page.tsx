import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { SectionHeader } from '@/components/in-app/ui-kit'
import { getAttemptResults } from '@/lib/mock/actions'

type Props = { params: Promise<{ slug: string; attemptId: string }> }

export const metadata = { title: 'Mock results' }

function titleize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function MockResultsPage({ params }: Props) {
  const { slug, attemptId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/mock/results/${attemptId}`)

  const { attempt, questions, qbankMap, passScorePercent } = await getAttemptResults(attemptId)

  const score = Number(attempt.score_percent ?? 0)
  const correct = attempt.correct_count ?? 0
  const total = attempt.total_questions ?? questions.length
  const passed = score >= passScorePercent
  const answers: Record<string, string | string[]> =
    (attempt.answers as Record<string, string | string[]>) ?? {}

  // Normalize a single/array answer (or correct answer) to a set of option ids.
  const toIdSet = (value: string | string[] | undefined): Set<string> => {
    if (value === undefined || value === null) return new Set()
    if (Array.isArray(value)) return new Set(value.map(String))
    if (value === '') return new Set()
    return new Set([String(value)])
  }
  const byDomain: Record<string, { correct: number; total: number; percent: number }> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attempt.by_domain_scores as any) ?? {}

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <AppHeader context="Mock result" />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full space-y-10">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to course
        </Link>

        {/* Score */}
        <div className="rounded-lg border-2 border-neutral-900 bg-white p-8 text-center">
          <div className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
            Mock exam result
          </div>
          <div
            className={`mt-3 text-6xl font-extrabold font-mono ${passed ? 'text-primary' : 'text-accent'}`}
          >
            {score}%
          </div>
          <p className="mt-2 text-2xs font-mono text-neutral-500 uppercase tracking-wider">
            {correct} / {total} correct
          </p>
          <div className="mt-4">
            <span
              className={`inline-flex items-center rounded border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider font-mono ${
                passed
                  ? 'bg-primary-light text-primary border-primary/20'
                  : 'bg-accent-light text-accent border-accent/20'
              }`}
            >
              {passed ? 'Target met' : 'Target not met'} &middot; {passScorePercent}% to pass
            </span>
          </div>
        </div>

        {/* By domain */}
        {Object.keys(byDomain).length > 0 && (
          <div>
            <SectionHeader title="Performance by domain" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(byDomain).map(([domain, d]) => {
                const strong = d.percent >= 80
                const weak = d.percent < 65
                const barColor = strong ? 'bg-primary' : weak ? 'bg-accent' : 'bg-neutral-400'
                const textColor = strong ? 'text-primary' : weak ? 'text-accent' : 'text-neutral-600'
                return (
                  <div key={domain} className="rounded-lg border border-neutral-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-bold text-neutral-800">{titleize(domain)}</span>
                      <span className={`text-xs font-bold font-mono ${textColor}`}>{d.percent}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${d.percent}%` }} />
                    </div>
                    <div className="mt-2 text-2xs font-mono text-neutral-400">
                      {d.correct} / {d.total} correct
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Per-question review */}
        <div>
          <SectionHeader title="Question review" />
          <div className="space-y-4">
            {questions.map((q, i) => {
              const qb = qbankMap[q.id]
              // Prefer the snapshot's option order — the order the student saw
              // (shuffled per attempt) — so the review matches the exam.
              const options = q.options ?? qb?.options
              const studentSet = toIdSet(answers[q.id])
              const correctSet = toIdSet(qb?.correct_answer)
              const skipped = studentSet.size === 0
              // All-or-nothing: the student's selected id set equals the correct id set.
              const isCorrect =
                !skipped &&
                studentSet.size === correctSet.size &&
                [...correctSet].every((id) => studentSet.has(id))
              return (
                <div key={q.id} className="rounded-lg border border-neutral-200 bg-white p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-semibold leading-relaxed text-neutral-800">
                      <span className="text-2xs font-mono text-neutral-400 mr-2 tabular-nums">
                        Q{i + 1}
                      </span>
                      {q.question_text}
                    </div>
                    <span className="shrink-0">
                      {skipped ? (
                        <MinusCircle className="h-5 w-5 text-neutral-400" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <XCircle className="h-5 w-5 text-accent" />
                      )}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {options.map((opt) => {
                      const isCorrectOpt = correctSet.has(opt.id)
                      const isStudentPick = studentSet.has(opt.id)
                      const isStudentWrong = isStudentPick && !isCorrectOpt
                      return (
                        <div
                          key={opt.id}
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
                      )
                    })}
                  </div>
                  {qb?.explanation && (
                    <p className="mt-4 border-t border-neutral-100 pt-3 text-sm text-neutral-600 leading-relaxed">
                      {qb.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href={`/courses/${slug}`}
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            Back to course
          </Link>
        </div>
      </main>
    </div>
  )
}
