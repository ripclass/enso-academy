import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppHeader } from '@/components/in-app/app-header'
import { SectionHeader } from '@/components/in-app/ui-kit'
import { getAttemptResults } from '@/lib/mock/actions'
import { AutopsyPanel, type AutopsyMiss } from '@/components/mock/autopsy-panel'
import { QuestionReview, type ReviewItem } from '@/components/mock/question-review'
import { readinessBand } from '@/lib/mock/readiness-band'

type Props = {
  params: Promise<{ slug: string; attemptId: string }>
  searchParams: Promise<{ autopsy?: string }>
}

export const metadata = { title: 'Mock results' }

function titleize(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default async function MockResultsPage({ params, searchParams }: Props) {
  const { slug, attemptId } = await params
  const { autopsy: autopsyParam } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/courses/${slug}/mock/results/${attemptId}`)

  const { attempt, questions, qbankMap } = await getAttemptResults(attemptId)

  const score = Number(attempt.score_percent ?? 0)
  const correct = attempt.correct_count ?? 0
  const total = attempt.total_questions ?? questions.length
  const band = readinessBand(score)
  const tone = {
    pass: 'text-primary',
    warn: 'text-neutral-700',
    fail: 'text-accent',
  }[band.tone]
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

  // The autopsy: every ANSWERED-wrong question, classified before the next
  // simulation unlocks. Skipped questions are a pacing signal, not a
  // misconception, so they stay out of the classification list.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attemptMeta = (attempt.metadata ?? {}) as any
  const isSimulation = attemptMeta.kind === 'simulation'
  const existingRepairs: string[] | null = attemptMeta.autopsy?.repairs ?? null
  const misses: AutopsyMiss[] = questions
    .filter((q) => {
      const qb = qbankMap[q.id]
      const studentSet = toIdSet(answers[q.id])
      const correctSet = toIdSet(qb?.correct_answer)
      if (studentSet.size === 0) return false
      return !(
        studentSet.size === correctSet.size && [...correctSet].every((id) => studentSet.has(id))
      )
    })
    .map((q) => ({
      questionId: q.id,
      prompt: String(q.question_text ?? qbankMap[q.id]?.question_text ?? ''),
      domain: (q.domain ?? qbankMap[q.id]?.domain ?? null) as string | null,
    }))

  // Build the serializable review items the client accordion renders.
  const reviewItems: ReviewItem[] = questions.map((q, i) => {
    const qb = qbankMap[q.id]
    // Prefer the snapshot's option order (the order the student saw,
    // shuffled per attempt), so the review matches the exam.
    const options = q.options ?? qb?.options ?? []
    const studentSet = toIdSet(answers[q.id])
    const correctSet = toIdSet(qb?.correct_answer)
    const skipped = studentSet.size === 0
    // All-or-nothing: the student's selected id set equals the correct id set.
    const isCorrect =
      !skipped &&
      studentSet.size === correctSet.size &&
      [...correctSet].every((id) => studentSet.has(id))
    return {
      questionId: q.id,
      index: i,
      questionText: String(q.question_text ?? qb?.question_text ?? ''),
      options,
      correctIds: [...correctSet],
      studentIds: [...studentSet],
      outcome: skipped ? 'skipped' : isCorrect ? 'correct' : 'incorrect',
      explanation: qb?.explanation ?? null,
      rationales: qb?.wrong_answer_rationales ?? null,
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader context="Mock result" />

      <main className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full space-y-10">
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to course
        </Link>

        {(isSimulation || existingRepairs) && (
          <AutopsyPanel
            attemptId={attemptId}
            misses={misses}
            existing={existingRepairs}
            required={autopsyParam === 'required'}
          />
        )}

        {/* Readiness band (leads with a verdict, not a bare raw %) */}
        <div className="rounded-lg border-2 border-neutral-900 bg-white p-8 text-center">
          <div className="text-2xs font-semibold uppercase tracking-widest text-neutral-400 font-mono">
            Mock exam readiness
          </div>
          <div className={`mt-3 text-5xl font-extrabold tracking-tight ${tone}`}>
            {band.label}
          </div>
          <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 leading-relaxed">
            {band.blurb}
          </p>
          <div className="mt-5 flex items-center justify-center gap-2 text-2xs font-mono text-neutral-500 uppercase tracking-wider">
            <span>{correct} / {total} correct</span>
            <span className="text-neutral-300">&middot;</span>
            <span>{score}% raw</span>
          </div>
          <p className="mx-auto mt-4 max-w-md border-t border-neutral-100 pt-3 text-2xs text-neutral-400 leading-relaxed">
            The real exam is reported as a scaled score with a pass mark of 75 (scaled), not a
            raw percentage. This band maps your practice result to that standard.
          </p>
        </div>

        {/* By domain */}
        {Object.keys(byDomain).length > 0 && (
          <div>
            <SectionHeader title="Performance by domain" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <QuestionReview attemptId={attemptId} items={reviewItems} />
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
