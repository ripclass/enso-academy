// lib/ai/generator/generate_with_gates.ts
//
// Path-2 follow-up to ADR 0019: integrate `runGates` into the Opus generation
// flow. After Stage 2 produces a LessonArtifact and before the artifact is
// written to disk, validate it through the seven deterministic gates, persist
// the <slug>.validation.json sibling, and append a lesson_review_events JSONL
// entry. The script orchestrates retries on FAIL via the retryFeedback hook
// in `generateLessonScenes`.
//
// Server-only by convention (lib/ai/* — see CLAUDE.md gotchas).

import { createHash } from 'node:crypto'

import { saveArtifact } from './artifacts'
import { appendReviewEvent, makeReviewEvent } from './codex_dispatch'
import { METHODOLOGY_VERSION } from './methodology'
import { runGates, type GateOutcome, type ValidationReport } from './validate_gates'
import type { LessonArtifact, OutlineArtifact } from './types'

// ── Gate-retry cap (Path-2 follow-up contract) ───────────────────────────

/** Total in-flight gate-validation attempts allowed before the run pauses.
 *  First attempt + two retries = three artifact generations on a hot lesson. */
export const MAX_GATE_VALIDATION_ATTEMPTS = 3

/** Thrown when a lesson exhausts MAX_GATE_VALIDATION_ATTEMPTS consecutive
 *  in-flight FAILs from the deterministic gate runner. The script's `full`
 *  mode lets this propagate (pause the run); per-lesson errors that are not
 *  this class are caught and skipped per the existing resumability contract. */
export class GateValidationCapExceededError extends Error {
  constructor(
    public readonly lessonSlug: string,
    public readonly attempts: number,
    public readonly lastReport: ValidationReport,
    public readonly courseSlug: string,
  ) {
    super(
      `Lesson "${lessonSlug}" failed deterministic-gate validation after ${attempts} attempt(s). ` +
        `Run paused per the Path-2 contract (ADR 0019 follow-up). ` +
        `Inspect generated/${courseSlug}/lessons/${lessonSlug}.validation.json and the review_events.jsonl tail.`,
    )
    this.name = 'GateValidationCapExceededError'
  }
}

// ── Event-vocabulary mappings (ADR 0019 / brief contract) ─────────────────

const REVIEWER = 'gate_runner'
const REVIEWER_ROLE = 'validator'

const DECISION_BY_OUTCOME: Record<Exclude<GateOutcome, 'skip'>, string> = {
  pass: 'validated',
  flag: 'flagged',
  fail: 'rejected',
}

const TO_STATUS_BY_OUTCOME: Record<Exclude<GateOutcome, 'skip'>, string> = {
  pass: 'gate_validated',
  flag: 'gate_flagged',
  fail: 'gate_rejected',
}

// ── Hashes for the event (match Path-1 JSONL field shape) ────────────────

function sha256(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

// ── Feedback synthesis for retry prompts ─────────────────────────────────

/** Build a feedback string suitable for `generateLessonScenes({ retryFeedback })`.
 *  Lists every FAIL gate first with its first few error items, then FLAGs as
 *  opportunistic fixes. Returns "" iff the report has no fails or flags. */
export function summarizeFailures(report: ValidationReport): string {
  const lines: string[] = []
  for (const [gateName, gate] of Object.entries(report.gates)) {
    if (gate.outcome !== 'fail') continue
    lines.push(`- gate \`${gateName}\` (FAIL): ${gate.detail}`)
    const errors =
      (gate.data?.errors as unknown[] | undefined) ??
      (gate.data?.findings as unknown[] | undefined) ??
      (gate.data?.issues as unknown[] | undefined)
    if (Array.isArray(errors) && errors.length > 0) {
      for (const e of errors.slice(0, 5)) {
        lines.push(`    • ${typeof e === 'string' ? e : JSON.stringify(e)}`)
      }
    }
  }
  for (const [gateName, gate] of Object.entries(report.gates)) {
    if (gate.outcome !== 'flag') continue
    lines.push(`- gate \`${gateName}\` (flag, fix opportunistically): ${gate.detail}`)
  }
  return lines.join('\n')
}

// ── The orchestration helper ─────────────────────────────────────────────

export type ValidateAndPersistArgs = {
  courseSlug: string
  artifact: LessonArtifact
  outline?: OutlineArtifact
  /** Status the lesson is transitioning from. Default 'auto_generated'. */
  fromStatus?: string | null
  /** Extra notes to prepend onto the event (e.g. retry context). */
  notesPrefix?: string
}

export type ValidateAndPersistResult = {
  report: ValidationReport
  /** false on overall='fail' — caller must NOT saveArtifact in that case. */
  shouldSave: boolean
  /** Path to the <slug>.validation.json sibling that was written. */
  validationPath: string
}

/** Run the deterministic gates against a generated LessonArtifact, write the
 *  <slug>.validation.json sibling, and emit a lesson_review_events row per
 *  ADR 0019. Does NOT write the artifact itself — caller decides based on
 *  shouldSave (fail → do not write; flag/pass → write). */
export async function validateAndPersistLesson(
  args: ValidateAndPersistArgs,
): Promise<ValidateAndPersistResult> {
  const { courseSlug, artifact, outline, fromStatus = 'auto_generated', notesPrefix } = args
  const report = runGates(artifact, { outline, methodologyVersion: METHODOLOGY_VERSION })

  // Validation.json sibling — same shape the standalone CLI (scripts/validate-lesson.ts) writes.
  const validationPath = saveArtifact(
    courseSlug,
    `lessons/${artifact.lessonSlug}.validation.json`,
    report,
  )

  // skip at the overall level shouldn't happen, but if it does, treat as flag (per CLI convention).
  const overall = report.overall === 'skip' ? 'flag' : report.overall
  const decision = DECISION_BY_OUTCOME[overall as Exclude<GateOutcome, 'skip'>]
  const toStatus = TO_STATUS_BY_OUTCOME[overall as Exclude<GateOutcome, 'skip'>]
  const notes = [notesPrefix, summarizeReport(report)].filter(Boolean).join(' — ')

  await appendReviewEvent(
    makeReviewEvent({
      courseSlug,
      lessonSlug: artifact.lessonSlug,
      fromStatus,
      toStatus,
      reviewer: REVIEWER,
      reviewerRole: REVIEWER_ROLE,
      decision,
      notes,
      methodologyVersion: METHODOLOGY_VERSION,
      outlineHash: outline ? sha256(outline) : '',
      artifactHash: sha256(artifact),
    }),
  )

  return {
    report,
    shouldSave: report.overall !== 'fail',
    validationPath,
  }
}

function summarizeReport(report: ValidationReport): string {
  const parts: string[] = [`gates → ${report.overall.toUpperCase()}`]
  for (const [name, gate] of Object.entries(report.gates)) {
    if (gate.outcome === 'pass') continue
    parts.push(`${name}=${gate.outcome}:${gate.detail}`)
  }
  return parts.join(' | ')
}
