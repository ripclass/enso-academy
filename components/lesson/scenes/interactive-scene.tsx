'use client'

import type { InteractiveSpec } from '@/lib/lesson/scenes'
import type { Confidence } from './confidence-chips'
import { RiskClassify } from './interactives/risk-classify'
import { RedFlagSpot } from './interactives/red-flag-spot'
import { FlowTrace } from './interactives/flow-trace'
import { ScreeningMatch } from './interactives/screening-match'
import { CaseFile } from './interactives/case-file'
import { useShuffled } from './use-shuffled'

/**
 * Renders an in-lesson `interactive` scene. The list-based mechanics
 * (risk-classify, red-flags, screening-match) get their items shuffled per
 * mount so the answer is not memorisable by position and any authoring pattern
 * (for example red flags listed first) does not leak. This matches what the
 * end-of-lesson challenge already does for the same widgets; here the shuffle is
 * SSR-safe because a resumed student can be server-rendered straight onto this
 * scene. flow-trace is a graph, so display order carries no tell and it renders
 * as authored.
 */
export function InteractiveScene({
  title,
  summary,
  spec,
  onComplete,
  onContinue,
  onSpeak,
  onDecision,
  seed,
}: {
  title: string
  summary?: string
  spec: InteractiveSpec
  onComplete: (correct: number, total: number) => void
  /** Advance the lesson from a widget's completion state (case-file debrief). */
  onContinue?: () => void
  /** Narrate widget-driven text through the lesson's voice (case-file cards). */
  onSpeak?: (text: string) => void
  /** Per-decision calibration report (case-file committed decisions). */
  onDecision?: (correct: boolean, confidence: Confidence) => void
  /** Per-visit variant seed (case-file rotation across retakes). */
  seed?: string
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-primary">{title}</h2>
        {summary && <p className="text-sm text-muted-foreground">{summary}</p>}
      </div>
      {spec.kind === 'risk-classify' && <RiskClassifyBody spec={spec} onComplete={onComplete} />}
      {spec.kind === 'red-flags' && <RedFlagsBody spec={spec} onComplete={onComplete} />}
      {spec.kind === 'screening-match' && <ScreeningBody spec={spec} onComplete={onComplete} />}
      {spec.kind === 'flow-trace' && (
        <FlowTrace
          prompt={spec.prompt}
          nodes={spec.nodes}
          edges={spec.edges}
          path={spec.path}
          why={spec.why}
          onComplete={onComplete}
        />
      )}
      {spec.kind === 'case-file' && (
        <CaseFile
          caseTitle={spec.caseTitle}
          intro={spec.intro}
          steps={spec.steps}
          debrief={spec.debrief}
          alternates={spec.alternates}
          seed={seed}
          onComplete={onComplete}
          onContinue={onContinue}
          onSpeak={onSpeak}
          onDecision={onDecision}
        />
      )}
    </div>
  )
}

// Per-kind bodies: each shuffles its own list at the top level (rules of hooks),
// so exactly one useShuffled runs for the rendered mechanic.

function RiskClassifyBody({
  spec,
  onComplete,
}: {
  spec: Extract<InteractiveSpec, { kind: 'risk-classify' }>
  onComplete: (correct: number, total: number) => void
}) {
  const items = useShuffled(spec.items)
  return <RiskClassify prompt={spec.prompt} items={items} onComplete={onComplete} />
}

function RedFlagsBody({
  spec,
  onComplete,
}: {
  spec: Extract<InteractiveSpec, { kind: 'red-flags' }>
  onComplete: (correct: number, total: number) => void
}) {
  const items = useShuffled(spec.items)
  return (
    <RedFlagSpot prompt={spec.prompt} scenario={spec.scenario} items={items} onComplete={onComplete} />
  )
}

function ScreeningBody({
  spec,
  onComplete,
}: {
  spec: Extract<InteractiveSpec, { kind: 'screening-match' }>
  onComplete: (correct: number, total: number) => void
}) {
  const alerts = useShuffled(spec.alerts)
  return <ScreeningMatch prompt={spec.prompt} alerts={alerts} onComplete={onComplete} />
}
