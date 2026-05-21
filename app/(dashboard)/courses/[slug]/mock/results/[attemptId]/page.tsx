import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Wordmark } from '@/components/brand/wordmark'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { getAttemptResults } from '@/lib/mock/actions'

type Props = { params: Promise<{ slug: string; attemptId: string }> }

export const metadata = { title: 'Mock results — Enso Academy' }

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
  const answers: Record<string, string> = (attempt.answers as Record<string, string>) ?? {}
  const byDomain: Record<string, { correct: number; total: number; percent: number }> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (attempt.by_domain_scores as any) ?? {}

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Wordmark />
          <Link href={`/courses/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
            Back to course
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full space-y-8">
        {/* hero */}
        <div className="text-center space-y-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Mock exam result</div>
          <div className={`text-5xl font-medium tabular-nums ${passed ? 'text-success' : 'text-foreground'}`}>
            {score}%
          </div>
          <p className="text-muted-foreground">{correct} of {total} correct</p>
          <div>
            <span
              className={`inline-block text-xs font-medium rounded-md px-2.5 py-1 ${
                passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}
            >
              {passed ? 'Passed' : 'Not yet passed'} · {passScorePercent}% to pass
            </span>
          </div>
        </div>

        {/* by-domain */}
        {Object.keys(byDomain).length > 0 && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">By domain</h2>
              <div className="space-y-3">
                {Object.entries(byDomain).map(([domain, d]) => (
                  <div key={domain} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{titleize(domain)}</span>
                      <span className="text-muted-foreground tabular-nums">
                        {d.correct} / {d.total} · {d.percent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${d.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* per-question review */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Question review</h2>
          {questions.map((q, i) => {
            const qb = qbankMap[q.id]
            const studentAnswer = answers[q.id]
            const correctAnswer = qb?.correct_answer
            const skipped = studentAnswer === undefined || studentAnswer === ''
            const isCorrect = !skipped && studentAnswer === correctAnswer
            const badge = skipped
              ? { label: 'Skipped', cls: 'bg-muted text-muted-foreground' }
              : isCorrect
                ? { label: 'Correct', cls: 'bg-success/10 text-success' }
                : { label: 'Incorrect', cls: 'bg-destructive/10 text-destructive' }
            return (
              <Card key={q.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-sm font-medium leading-relaxed">
                      <span className="text-muted-foreground tabular-nums mr-2">{i + 1}.</span>
                      {q.question_text}
                    </div>
                    <span className={`shrink-0 text-xs font-medium rounded-md px-2 py-0.5 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isCorrectOpt = opt === correctAnswer
                      const isStudentWrong = opt === studentAnswer && !isCorrectOpt
                      return (
                        <div
                          key={opt}
                          className={`text-sm rounded-md border px-3 py-2 flex items-start gap-2 ${
                            isCorrectOpt
                              ? 'border-success bg-success/5'
                              : isStudentWrong
                                ? 'border-destructive bg-destructive/5'
                                : 'border-border'
                          }`}
                        >
                          <span className="shrink-0 w-4 text-center" aria-hidden>
                            {isCorrectOpt ? '✓' : isStudentWrong ? '✗' : ''}
                          </span>
                          <span>{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                  {qb?.explanation && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {qb.explanation}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center pt-2">
          <Link href={`/courses/${slug}`} className={buttonVariants()}>
            Back to course
          </Link>
        </div>
      </main>
    </div>
  )
}
