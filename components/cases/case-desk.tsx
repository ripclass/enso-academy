'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  RotateCcw,
  Flame,
  Briefcase,
  ShieldQuestion,
  Gavel,
  CheckCircle2,
  XCircle,
  Lock,
  Shuffle,
} from 'lucide-react'
import {
  generateCase,
  buildCaseById,
  type GeneratedCase,
  type RealCaseMeta,
} from '@/lib/cases/generate'
import { RedFlagSpot } from '@/components/lesson/scenes/interactives/red-flag-spot'
import { ScreeningMatch } from '@/components/lesson/scenes/interactives/screening-match'

type Phase = 'brief' | 'flags' | 'screen' | 'decide' | 'verdict'
type Score = { correct: number; total: number }

const STEPS: { phase: Phase; label: string; icon: typeof Briefcase }[] = [
  { phase: 'brief', label: 'Brief', icon: Briefcase },
  { phase: 'flags', label: 'Red flags', icon: ShieldQuestion },
  { phase: 'screen', label: 'Screening', icon: ShieldQuestion },
  { phase: 'decide', label: 'The call', icon: Gavel },
]

export function CaseDesk({
  courseSlug,
  unlocked = false,
  realCases = [],
  initialCaseId,
}: {
  courseSlug: string
  /** Enrolled owners unlock the real-case packs; free users get synthetic only. */
  unlocked?: boolean
  realCases?: RealCaseMeta[]
  initialCaseId?: string
}) {
  const [c, setC] = useState<GeneratedCase | null>(null)
  const [phase, setPhase] = useState<Phase>('brief')
  const [flags, setFlags] = useState<Score | null>(null)
  const [screen, setScreen] = useState<Score | null>(null)
  const [choice, setChoice] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [solved, setSolved] = useState(0)

  const deal = useCallback(
    (opts?: { caseId?: string; avoidDomain?: string }) => {
      const built = opts?.caseId ? buildCaseById(opts.caseId) : null
      setC(built ?? generateCase({ avoidDomain: opts?.avoidDomain, includeReal: unlocked }))
      setPhase('brief')
      setFlags(null)
      setScreen(null)
      setChoice(null)
    },
    [unlocked],
  )

  // First deal + restore streak (client only, avoids hydration mismatch).
  useEffect(() => {
    deal(initialCaseId && unlocked ? { caseId: initialCaseId } : undefined)
    try {
      setStreak(Number(localStorage.getItem('casemode_streak') || 0))
      setSolved(Number(localStorage.getItem('casemode_solved') || 0))
    } catch {
      /* ignore */
    }
  }, [deal, initialCaseId, unlocked])

  if (!c) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-mono text-2xs uppercase tracking-widest text-neutral-400">
        Dealing a case…
      </div>
    )
  }

  const decided = choice != null
  const decisionCorrect =
    decided && (c.decision.options.find((o) => o.id === choice)?.correct ?? false)

  function commitVerdict() {
    const solvedNow = !!decisionCorrect
    const nextStreak = solvedNow ? streak + 1 : 0
    const nextSolved = solved + (solvedNow ? 1 : 0)
    setStreak(nextStreak)
    setSolved(nextSolved)
    try {
      localStorage.setItem('casemode_streak', String(nextStreak))
      localStorage.setItem('casemode_solved', String(nextSolved))
    } catch {
      /* ignore */
    }
    setPhase('verdict')
  }

  const totalCorrect = (flags?.correct ?? 0) + (screen?.correct ?? 0) + (decisionCorrect ? 1 : 0)
  const totalPoints = (flags?.total ?? 0) + (screen?.total ?? 0) + 1
  const pct = totalPoints ? Math.round((totalCorrect / totalPoints) * 100) : 0
  const stepIndex = STEPS.findIndex((s) => s.phase === phase)

  return (
    <div>
      {/* Case library */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-2xs uppercase tracking-wider text-neutral-400">Cases</span>
        <button
          type="button"
          onClick={() => deal({ avoidDomain: c.domain })}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary-light px-3 font-mono text-2xs font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary"
        >
          <Shuffle className="h-3 w-3" /> Surprise me
        </button>
        {realCases.map((rc) =>
          unlocked ? (
            <button
              key={rc.id}
              type="button"
              onClick={() => deal({ caseId: rc.id })}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-neutral-200 px-3 font-mono text-2xs font-semibold uppercase tracking-wider text-neutral-600 transition-colors hover:border-primary hover:text-primary"
            >
              {rc.title}
            </button>
          ) : (
            <span
              key={rc.id}
              className="inline-flex h-8 cursor-default items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 font-mono text-2xs font-semibold uppercase tracking-wider text-neutral-400"
              title="In the course"
            >
              <Lock className="h-3 w-3" /> {rc.title}
            </span>
          ),
        )}
      </div>

      {!unlocked && realCases.length > 0 && (
        <div className="mt-3 flex flex-col items-start gap-2 rounded-lg border border-neutral-200 bg-muted p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-neutral-600">
            These are the warm-up cases. The real-case packs ({realCases.map((r) => r.title).join(', ')}) are in the course.
          </span>
          <Link
            href={`/courses/${courseSlug}`}
            className="shrink-0 font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Unlock them
          </Link>
        </div>
      )}

      {/* Desk header */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {c.real && (
            <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider text-white">
              Real case
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-2.5 py-0.5 font-mono text-2xs font-bold uppercase tracking-wider text-accent">
            {c.domain}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 font-mono text-2xs font-semibold uppercase tracking-wider text-primary">
              <Flame className="h-3.5 w-3.5" /> {streak} streak
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => deal({ avoidDomain: c.domain })}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 font-mono text-2xs font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:text-primary"
        >
          <RotateCcw className="h-3 w-3" /> New case
        </button>
      </div>

      {/* Step rail */}
      {phase !== 'verdict' && (
        <div className="mt-5 flex items-center gap-2">
          {STEPS.map((s, i) => {
            const done = i < stepIndex
            const active = i === stepIndex
            return (
              <div key={s.phase} className="flex flex-1 items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-2xs font-bold ${
                    active
                      ? 'bg-primary text-white'
                      : done
                        ? 'bg-primary-light text-primary'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`hidden text-2xs font-semibold uppercase tracking-wider sm:inline ${active ? 'text-foreground' : 'text-neutral-400'}`}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="h-px flex-1 bg-neutral-200" />}
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8">
        {/* BRIEF */}
        {phase === 'brief' && (
          <div className="rounded-lg border-2 border-neutral-900 bg-white p-6 animate-in fade-in duration-300">
            <h2 className="text-xl font-bold text-foreground">{c.title}</h2>
            <p className="mt-1 font-mono text-2xs uppercase tracking-wider text-neutral-400">
              {c.subjectName} &middot; {c.subjectLine}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-neutral-700">{c.brief}</p>
            <button
              type="button"
              onClick={() => setPhase('flags')}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Open the file <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* RED FLAGS */}
        {phase === 'flags' && (
          <div className="animate-in fade-in duration-300">
            <RedFlagSpot
              prompt="Step 1. Which of these are genuine red flags?"
              scenario={c.redFlagScenario}
              items={c.redFlags}
              onComplete={(correct, total) => setFlags({ correct, total })}
            />
            {flags && (
              <button
                type="button"
                onClick={() => setPhase('screen')}
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Run the screening check <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* SCREENING */}
        {phase === 'screen' && (
          <div className="animate-in fade-in duration-300">
            <p className="mb-4 text-sm font-semibold text-foreground">
              Step 2. An alert fired. Clear it or escalate it.
            </p>
            <ScreeningMatch
              alerts={[c.alert]}
              onComplete={(correct, total) => setScreen({ correct, total })}
            />
            {screen && (
              <button
                type="button"
                onClick={() => setPhase('decide')}
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Make the call <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* DECISION */}
        {phase === 'decide' && (
          <div className="animate-in fade-in duration-300">
            <p className="text-sm font-semibold text-foreground">Step 3. The call.</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{c.decision.prompt}</p>
            <div className="mt-4 space-y-2">
              {c.decision.options.map((o) => {
                const isChoice = choice === o.id
                let cls = 'w-full text-left rounded-md border px-4 py-3 text-sm transition-colors'
                if (!decided) cls += ' border-neutral-200 hover:border-primary/50 hover:bg-muted cursor-pointer'
                else if (o.correct) cls += ' border-primary/50 bg-primary-light text-foreground'
                else if (isChoice) cls += ' border-destructive/50 bg-destructive/10 text-foreground'
                else cls += ' border-neutral-200 opacity-60'
                return (
                  <button
                    key={o.id}
                    type="button"
                    disabled={decided}
                    onClick={() => setChoice(o.id)}
                    className={cls}
                  >
                    <span className="flex items-start gap-2">
                      {decided && o.correct && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                      {decided && isChoice && !o.correct && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />}
                      <span>{o.text}</span>
                    </span>
                    {decided && (isChoice || o.correct) && (
                      <span className="mt-2 block pl-6 text-xs leading-relaxed text-neutral-500">{o.why}</span>
                    )}
                  </button>
                )
              })}
            </div>
            {decided && (
              <button
                type="button"
                onClick={commitVerdict}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                See your verdict <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* VERDICT */}
        {phase === 'verdict' && (
          <div className="rounded-lg border-2 border-neutral-900 bg-white p-8 text-center animate-in fade-in duration-300">
            <div className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
              {decisionCorrect ? 'Case closed' : 'Reviewed'}
            </div>
            <div className={`mt-2 text-5xl font-extrabold font-mono ${decisionCorrect ? 'text-primary' : 'text-accent'}`}>
              {pct}%
            </div>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {decisionCorrect ? 'You made the right call.' : 'The final call was wrong. Read the reasoning above and run another.'}
            </p>

            <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
              <VerdictRow label="Red flags" score={flags} />
              <VerdictRow label="Screening" score={screen} />
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                <span className="text-neutral-700">The call</span>
                <span className={`font-mono text-2xs font-bold uppercase tracking-wider ${decisionCorrect ? 'text-primary' : 'text-destructive'}`}>
                  {decisionCorrect ? 'Correct' : 'Wrong'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => deal({ avoidDomain: c.domain })}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Next case <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href={`/courses/${courseSlug}`}
                className="inline-flex h-11 items-center justify-center rounded-md border border-foreground/20 px-5 text-sm font-semibold text-foreground transition-colors hover:border-foreground"
              >
                Back to course
              </Link>
            </div>
            <p className="mt-5 font-mono text-2xs uppercase tracking-wider text-neutral-400">
              {streak > 0 && <span className="text-primary">{streak} in a row</span>}
              {streak > 0 && ' · '}
              {solved} cases solved
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function VerdictRow({ label, score }: { label: string; score: Score | null }) {
  const all = score && score.correct === score.total
  return (
    <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
      <span className="text-neutral-700">{label}</span>
      <span className={`font-mono text-2xs font-bold uppercase tracking-wider ${all ? 'text-primary' : 'text-accent'}`}>
        {score ? `${score.correct} / ${score.total}` : 'skipped'}
      </span>
    </div>
  )
}
