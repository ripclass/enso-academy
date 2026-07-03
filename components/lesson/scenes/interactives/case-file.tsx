'use client'

import { useEffect, useState } from 'react'
import { Check, X, ArrowRight, FolderOpen, Scale, RotateCcw } from 'lucide-react'
import type { CaseFileStep } from '@/lib/lesson/scenes'
import { useShuffled } from '../use-shuffled'

/**
 * Case-file investigation. The student works a real matter one evidence item
 * at a time: read the structured evidence card (observed / source / inference /
 * confidence), commit to a decision, and only then see the reveal — what the
 * investigators actually did. The reveal is locked behind the decision by
 * design: evidence first, action second, hindsight never.
 */
export function CaseFile({
  caseTitle,
  intro,
  steps,
  debrief,
  onComplete,
  onContinue,
  onSpeak,
}: {
  caseTitle: string
  intro?: string
  steps: CaseFileStep[]
  debrief: string
  onComplete?: (correct: number, total: number) => void
  /** Advance the lesson — rendered as a Continue button on the closing debrief. */
  onContinue?: () => void
  /** Narrate widget text through the lesson's voice (no-op outside listen mode). */
  onSpeak?: (text: string) => void
}) {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const step = steps[idx]
  const isLast = idx === steps.length - 1
  const correct = picked != null && picked === step?.decision.correctOptionId

  // Narration follows the file: each evidence card is read as it appears
  // (fields in examiner's order, ending on the decision prompt), each reveal
  // as it unlocks, and the debrief when the file closes. All through the
  // lesson's shared voice — silent when the student is in read mode.
  useEffect(() => {
    if (finished) {
      onSpeak?.(`The file is closed. ${debrief}`)
      return
    }
    const s = steps[idx]
    if (!s) return
    if (picked == null) {
      onSpeak?.(
        `${s.heading}. Observed: ${s.evidence.observed} The source: ${s.evidence.source} The inference: ${s.evidence.inference} Confidence: ${s.evidence.confidence} ${s.decision.prompt}`,
      )
    } else {
      const verdict = picked === s.decision.correctOptionId ? 'Your call stands.' : 'Not the call.'
      onSpeak?.(
        `${verdict} ${s.decision.explanation} Here is what the investigators did. ${s.reveal}`,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, picked, finished])

  function pick(id: string) {
    if (picked || !step) return
    setPicked(id)
    if (id === step.decision.correctOptionId) setScore((s) => s + 1)
  }

  function next() {
    if (isLast) {
      setFinished(true)
      onComplete?.(score, steps.length)
      return
    }
    setIdx((i) => i + 1)
    setPicked(null)
  }

  function restart() {
    setIdx(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-5">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 shrink-0 text-primary" />
            <p className="text-lg font-semibold text-neutral-800">
              The file is closed. {score} of {steps.length} calls matched the investigators&rsquo;.
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">{debrief}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={restart}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Work the file again
          </button>
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!step) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <FolderOpen className="h-4 w-4 shrink-0 text-accent" />
          <span className="truncate font-mono text-2xs uppercase tracking-widest text-neutral-500">
            {caseTitle}
          </span>
        </div>
        <span className="shrink-0 font-mono text-2xs uppercase tracking-widest text-neutral-400">
          Item {idx + 1} of {steps.length}
        </span>
      </div>

      {intro && idx === 0 && !picked && (
        <p className="text-sm leading-relaxed text-neutral-600">{intro}</p>
      )}

      {/* The evidence card — examiner's-file discipline, field by field */}
      <div className="rounded-lg border border-neutral-300 bg-[#FCFBF8] p-4 shadow-sm">
        <div className="text-sm font-bold text-neutral-900">{step.heading}</div>
        <dl className="mt-3 space-y-2.5">
          <EvidenceRow label="Observed" value={step.evidence.observed} />
          <EvidenceRow label="Source" value={step.evidence.source} />
          <EvidenceRow label="Inference" value={step.evidence.inference} />
          <EvidenceRow label="Confidence" value={step.evidence.confidence} />
        </dl>
      </div>

      {/* The decision — committed before the reveal */}
      <DecisionBlock key={step.id} step={step} picked={picked} onPick={pick} />

      {/* The reveal — only after a committed decision */}
      {picked && (
        <div className="space-y-3 animate-in fade-in duration-500">
          <div
            className={`flex items-start gap-2 rounded-md px-3 py-2.5 text-sm leading-relaxed ${
              correct ? 'bg-primary-light text-foreground' : 'bg-accent-light text-foreground'
            }`}
          >
            {correct ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            )}
            <span>
              <span className="font-semibold">{correct ? 'Your call stands. ' : 'Not the call. '}</span>
              {step.decision.explanation}
            </span>
          </div>
          <div className="rounded-lg border border-primary/25 bg-primary/[0.04] p-4">
            <div className="font-mono text-2xs uppercase tracking-widest text-primary">
              What the investigators did
            </div>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">{step.reveal}</p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={next}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {isLast ? 'Close the file' : 'Next evidence item'}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-24 shrink-0 pt-px font-mono text-2xs uppercase tracking-widest text-neutral-400">
        {label}
      </dt>
      <dd className="min-w-0 text-sm leading-relaxed text-neutral-700">{value}</dd>
    </div>
  )
}

/**
 * The decision options, shuffled per mount (keyed by step so each item
 * reshuffles) — the correct answer is never memorisable by position.
 */
function DecisionBlock({
  step,
  picked,
  onPick,
}: {
  step: CaseFileStep
  picked: string | null
  onPick: (id: string) => void
}) {
  const options = useShuffled(step.decision.options)
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-neutral-800">{step.decision.prompt}</p>
      <div className="space-y-2">
        {options.map((o) => {
          const isPicked = picked === o.id
          const isCorrect = picked != null && o.id === step.decision.correctOptionId
          return (
            <button
              key={o.id}
              type="button"
              disabled={picked != null}
              onClick={() => onPick(o.id)}
              className={`w-full rounded-md border px-3 py-2.5 text-left text-sm leading-relaxed transition-colors ${
                isCorrect
                  ? 'border-primary bg-primary-light text-foreground'
                  : isPicked
                    ? 'border-accent bg-accent-light text-foreground'
                    : picked != null
                      ? 'border-neutral-200 text-neutral-400'
                      : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
              }`}
            >
              {o.text}
            </button>
          )
        })}
      </div>
    </div>
  )
}
