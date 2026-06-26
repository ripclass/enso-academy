'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Sparkles,
  Target,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Gavel,
} from 'lucide-react'
import { getLessonChallenge } from '@/lib/lesson/challenge'
import type { ChallengeRound } from '@/lib/lesson/challenge-config'
import type { ChallengeScenario, DecisionSpec } from '@/lib/cases/scenario-bank'
import { RedFlagSpot } from '@/components/lesson/scenes/interactives/red-flag-spot'
import { ScreeningMatch } from '@/components/lesson/scenes/interactives/screening-match'
import { RiskClassify } from '@/components/lesson/scenes/interactives/risk-classify'

type Result = { correct: number; total: number }

const titleize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
const scenarioOk = (r: Result | null) => !!r && r.total > 0 && r.correct / r.total >= 0.6

/**
 * The end-of-lesson "Apply it" round. Pulls an adaptive set of short applied
 * judgments (weighted toward the concepts this student is weak on), plays them
 * with the existing interactive widgets, scores the round, and writes each
 * scenario's result back into the knowledge model via the player's onResult.
 *
 * Placed immediately before the lesson's synthesis scene. It is a payoff, not a
 * gate: the student can move on (Next) whether they ace it or not.
 */
export function LessonChallenge({
  courseId,
  lessonSlug,
  conceptTags,
  onResult,
}: {
  courseId: string
  lessonSlug: string
  conceptTags: string[]
  /** Write one scenario's result into the knowledge model (the player's recordQuizEvidence). */
  onResult?: (conceptTags: string[], correct: boolean) => void
}) {
  const [round, setRound] = useState<ChallengeRound | null>(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'intro' | 'play' | 'verdict'>('intro')
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState<(Result | null)[]>([])
  const [attempt, setAttempt] = useState(0)

  const tagKey = conceptTags.join(',')
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getLessonChallenge({ courseId, lessonSlug, conceptTags })
      .then((r) => {
        if (cancelled) return
        setRound(r)
        setResults(new Array(r.scenarios.length).fill(null))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonSlug, tagKey])

  const scenarios = round?.scenarios ?? []
  const current = scenarios[idx]

  const totals = useMemo(() => {
    const correct = results.reduce((a, r) => a + (r?.correct ?? 0), 0)
    const total = results.reduce((a, r) => a + (r?.total ?? 0), 0)
    const solved = results.filter(scenarioOk).length
    return { correct, total, solved, pct: total ? Math.round((correct / total) * 100) : 0 }
  }, [results])

  function report(i: number, correct: number, total: number) {
    setResults((prev) => {
      const next = [...prev]
      next[i] = { correct, total }
      return next
    })
  }

  function advance() {
    if (idx < scenarios.length - 1) {
      setIdx((i) => i + 1)
    } else {
      // Write each scenario's result into the knowledge model, once per attempt.
      scenarios.forEach((s, i) => onResult?.(s.conceptTags, scenarioOk(results[i])))
      setPhase('verdict')
    }
  }

  function retry() {
    setResults(new Array(scenarios.length).fill(null))
    setIdx(0)
    setAttempt((a) => a + 1)
    setPhase('play')
  }

  // ── Loading / empty ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center font-mono text-2xs uppercase tracking-widest text-neutral-400">
        Preparing your challenge…
      </div>
    )
  }
  if (!round || scenarios.length === 0) {
    return null // nothing to apply here — the lesson simply continues to synthesis
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="mx-auto max-w-2xl animate-in fade-in duration-500">
        <div className="flex items-center gap-2 font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Apply it
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          {scenarios.length} quick judgments on what you just learned
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Not a recall quiz. These are the calls a practitioner makes. Work each one, get the
          reasoning, and it sharpens your knowledge model. There’s no penalty, and you can retry.
        </p>
        {round.adaptive && round.focus.length > 0 && (
          <p className="mt-3 inline-flex items-start gap-1.5 rounded-md bg-accent-light px-3 py-2 text-xs text-foreground">
            <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            <span>
              Tuned to what you found tricky here:{' '}
              <span className="font-semibold">
                {round.focus.slice(0, 3).map(titleize).join(', ')}
              </span>
              .
            </span>
          </p>
        )}
        <button
          type="button"
          onClick={() => setPhase('play')}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Begin the challenge <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  // ── Verdict ───────────────────────────────────────────────────────────────
  if (phase === 'verdict') {
    const aced = totals.solved === scenarios.length
    return (
      <div className="mx-auto max-w-2xl text-center animate-in fade-in duration-300">
        <div className="font-mono text-2xs font-semibold uppercase tracking-widest text-neutral-400">
          {aced ? 'Cleared' : 'Reviewed'}
        </div>
        <div
          className={`mt-2 text-5xl font-extrabold font-mono ${aced ? 'text-primary' : 'text-accent'}`}
        >
          {totals.pct}%
        </div>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {aced
            ? 'You applied all of it correctly.'
            : `${totals.solved} of ${scenarios.length} judgments solid. Read the reasoning, then carry it forward below.`}
        </p>

        <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
          {scenarios.map((s, i) => {
            const r = results[i]
            const ok = scenarioOk(r)
            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2 text-neutral-700">
                  {ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-accent" />
                  )}
                  <span className="truncate">{s.title}</span>
                </span>
                <span
                  className={`shrink-0 font-mono text-2xs font-bold uppercase tracking-wider ${ok ? 'text-primary' : 'text-accent'}`}
                >
                  {r ? `${r.correct}/${r.total}` : 'skipped'}
                </span>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        </div>
        <p className="mt-5 inline-flex items-center gap-1.5 font-mono text-2xs uppercase tracking-wider text-primary">
          <CheckCircle2 className="h-3 w-3" /> Counted toward your knowledge model
        </p>
        <p className="mt-3 font-mono text-2xs uppercase tracking-wider text-neutral-400">
          Press Next to carry it forward →
        </p>
      </div>
    )
  }

  // ── Play ──────────────────────────────────────────────────────────────────
  const done = results[idx] != null
  return (
    <div className="mx-auto max-w-2xl">
      {/* Step rail */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-2xs font-semibold uppercase tracking-widest text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Apply it
        </div>
        <div className="flex items-center gap-1.5">
          {scenarios.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                i === idx
                  ? 'w-6 bg-primary'
                  : results[i] != null
                    ? 'w-1.5 bg-primary/40'
                    : 'w-1.5 bg-neutral-200'
              }`}
            />
          ))}
        </div>
      </div>

      <h2 className="mt-4 text-lg font-bold tracking-tight text-foreground">{current.title}</h2>
      <p className="mt-1 font-mono text-2xs uppercase tracking-wider text-neutral-400">
        Judgment {idx + 1} of {scenarios.length}
      </p>

      <div key={`${attempt}-${idx}`} className="mt-5 animate-in fade-in duration-300">
        <ScenarioPlayer
          scenario={current}
          onComplete={(correct, total) => report(idx, correct, total)}
        />
      </div>

      {done && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={advance}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            {idx < scenarios.length - 1 ? 'Next judgment' : 'See your result'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Mechanic dispatch ─────────────────────────────────────────────────────────

function ScenarioPlayer({
  scenario,
  onComplete,
}: {
  scenario: ChallengeScenario
  onComplete: (correct: number, total: number) => void
}) {
  const spec = scenario.spec
  switch (spec.kind) {
    case 'red-flags':
      return (
        <RedFlagSpot
          prompt={spec.prompt}
          scenario={spec.scenario}
          items={spec.items}
          onComplete={onComplete}
        />
      )
    case 'screening-match':
      return <ScreeningMatch prompt={spec.prompt} alerts={spec.alerts} onComplete={onComplete} />
    case 'risk-classify':
      return <RiskClassify prompt={spec.prompt} items={spec.items} onComplete={onComplete} />
    case 'decision':
      return <DecisionStep spec={spec} onComplete={onComplete} />
  }
}

// The single-best-call step (mirrors Case Mode's decision phase).
function DecisionStep({
  spec,
  onComplete,
}: {
  spec: DecisionSpec
  onComplete: (correct: number, total: number) => void
}) {
  const [choice, setChoice] = useState<string | null>(null)
  const decided = choice != null

  function pick(id: string) {
    if (decided) return
    setChoice(id)
    const correct = spec.options.find((o) => o.id === id)?.correct ?? false
    onComplete(correct ? 1 : 0, 1)
  }

  return (
    <div className="space-y-4">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-neutral-700">
        <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
        <span>{spec.prompt}</span>
      </p>
      <div className="space-y-2">
        {spec.options.map((o) => {
          const isChoice = choice === o.id
          let cls = 'w-full text-left rounded-md border px-4 py-3 text-sm transition-colors'
          if (!decided) cls += ' border-neutral-200 hover:border-primary/50 hover:bg-muted cursor-pointer'
          else if (o.correct) cls += ' border-primary/50 bg-primary-light text-foreground'
          else if (isChoice) cls += ' border-destructive/50 bg-destructive/10 text-foreground'
          else cls += ' border-neutral-200 opacity-60'
          return (
            <button key={o.id} type="button" disabled={decided} onClick={() => pick(o.id)} className={cls}>
              <span className="flex items-start gap-2">
                {decided && o.correct && (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                )}
                {decided && isChoice && !o.correct && (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <span>{o.text}</span>
              </span>
              {decided && (isChoice || o.correct) && (
                <span className="mt-2 block pl-6 text-xs leading-relaxed text-neutral-500">{o.why}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
