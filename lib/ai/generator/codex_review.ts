// lib/ai/generator/codex_review.ts
//
// Per-lesson Codex cross-check orchestrator. Composes the low-level
// codex_dispatch.ts primitives (parallelCrossCheck, makeReviewEvent,
// appendReviewEvent) with brief generation, artifact persistence, and the
// iteration-cap semantics described in methodology v1.1 (4b) and ADR 0019.
//
// Flow (one Codex iteration):
//   1. Build the methodology brief + factual-fidelity brief from the artifact.
//   2. Dispatch both in parallel (parallelCrossCheck).
//   3. Persist the briefs + Codex responses to <slug>.codex.<n>.txt — audit
//      trail discipline; cheap; lets the operator inspect any iteration.
//   4. Emit a lesson_review_events JSONL row with reviewer_role 'cross_check'
//      and decision validated | flagged | rejected, mapping from the parallel
//      cross-check's combined verdict (agree | split | disagree).
//   5. Return { decision, feedback } — caller (the script orchestrator)
//      decides save / retry / throw.
//
// Server-only by convention (lib/ai/* — see CLAUDE.md gotchas).

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { appendReviewEvent, makeReviewEvent, parallelCrossCheck, type CodexVerdict } from './codex_dispatch'
import { CURRENT_FACTS_PACK } from './facts_pack'
import { METHODOLOGY_VERSION } from './methodology'
import type {
  LessonArtifact,
  OutlineArtifact,
  OutlineLesson,
  OutlineModule,
} from './types'

// ── Cap / errors ──────────────────────────────────────────────────────────

/** Maximum Codex cross-check rounds per lesson before pausing the run.
 *  Mirrors MAX_CODEX_ITERATIONS_PER_LESSON from codex_dispatch.ts (= 3) but
 *  named here to make the cap visible at the orchestrator level. */
export const MAX_CODEX_REVIEW_ITERATIONS = 3

/** Thrown when a lesson exhausts MAX_CODEX_REVIEW_ITERATIONS consecutive
 *  Codex DISAGREE iterations. The script's `full` mode catches this and
 *  pauses the run; other per-lesson errors continue per the existing
 *  resumability contract. */
export class CodexIterationCapExceededError extends Error {
  constructor(
    public readonly lessonSlug: string,
    public readonly iterations: number,
    public readonly courseSlug: string,
  ) {
    super(
      `Lesson "${lessonSlug}" failed Codex cross-check after ${iterations} iteration(s). ` +
        `Run paused per methodology v1.1 (4d). Inspect ` +
        `generated/${courseSlug}/lessons/${lessonSlug}.codex.*.txt and the ` +
        `review_events.jsonl tail; reprompt manually if recoverable.`,
    )
    this.name = 'CodexIterationCapExceededError'
  }
}

// ── Cross-check outcome shape ─────────────────────────────────────────────

export type CrossCheckOutcome = 'validated' | 'flagged' | 'rejected'

/** Map the combined parallelCrossCheck verdict to the methodology-v1.1
 *  cross-check vocabulary (validated / flagged / rejected). */
function outcomeFromVerdict(combined: CodexVerdict['decision']): CrossCheckOutcome {
  if (combined === 'agree') return 'validated'
  if (combined === 'split') return 'flagged'
  return 'rejected'
}

/** Per-cross-check status the JSONL row records. */
const TO_STATUS_BY_OUTCOME: Record<CrossCheckOutcome, string> = {
  validated: 'cross_check_validated',
  flagged: 'cross_check_flagged',
  rejected: 'cross_check_rejected',
}

// ── Hashes ────────────────────────────────────────────────────────────────

function sha256(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

// ── Brief generators ──────────────────────────────────────────────────────

type BriefContext = {
  artifact: LessonArtifact
  outline: OutlineArtifact
  module: OutlineModule
  lesson: OutlineLesson
  priorMethodologyFeedback?: string
  priorFidelityFeedback?: string
}

const OUTPUT_FORMAT = `
Output in this exact format — nothing else, no preamble, no code fences:

VERDICT: AGREE | DISAGREE | SPLIT
REASONING: one or two sentences explaining the verdict.
SPECIFIC ISSUES: (only if DISAGREE or SPLIT) a bulleted list of concrete problems with the lesson, each citing the scene title and the issue. Use "-" as the bullet marker.

A verdict of AGREE means the audit dimension is acceptable for publication. SPLIT means the dimension is mostly acceptable but has soft issues a reviewer should see at module rollup. DISAGREE means at least one issue must be fixed before the lesson can ship.`

function listOutlineSources(outline: OutlineArtifact, limit = 25): string {
  return (
    outline.sources
      ?.slice(0, limit)
      .map((s) => `- ${s.sourceName}${s.sourceOrganization ? ` (${s.sourceOrganization})` : ''}${s.sourceYear ? ` ${s.sourceYear}` : ''}`)
      .join('\n') ?? '(no sources listed)'
  )
}

export function buildMethodologyBrief(ctx: BriefContext): string {
  const priorBlock = ctx.priorMethodologyFeedback
    ? `\nPRIOR CROSS-CHECK DISAGREEMENT (your earlier review of an earlier draft):\n${ctx.priorMethodologyFeedback}\n\nThe lesson has been re-generated to address that feedback. Confirm whether the disagreement is now resolved and whether new methodology issues have appeared.\n`
    : ''
  return `You are a Codex cross-check reviewer auditing a generated Enso Academy lesson against the course-generation methodology (version ${METHODOLOGY_VERSION}, see docs/COURSE-GENERATION-PROMPT.md).

CONTEXT
- Course: ${ctx.outline.course.name} (${ctx.outline.course.certifyingBody})
- Module: ${ctx.module.name} — ${ctx.module.objective}
- Lesson: ${ctx.lesson.name}
- Lesson learning objectives: ${ctx.lesson.learningObjectives.join('; ')}
- Lesson concept tags: ${ctx.lesson.conceptTags.join(', ')}

YOUR JOB — methodology audit
Audit the lesson artifact below against these methodology requirements:

1. **Source discipline.** Every factual claim must trace to one of the allowed source types: primary regulatory texts; international standard-setter publications intended for public reuse (FATF / Wolfsberg / Basel / Egmont / IOSCO / OECD); public-domain government enforcement actions; open-access academic work; original analysis. News reporting is allowed ONLY as a pointer ("see FT coverage for context"), never as the substantive base of a scene.

2. **IP compliance.** No content from commercial study guides (ACAMS, ACFE, GARP, Wiley, Kaplan, Schweser, Becker, BPP, ICA, or any commercial exam-prep brand). No verbatim or close-paraphrase reproduction of ICC rule text (UCP 600, ISBP, URDG, ISP 98, URC 522) — reference by name and section is acceptable; reproduction is not. No paraphrase that mirrors a certification body's published structure.

3. **Pedagogical structure.** At least one deep-case scene grounded in a real public enforcement action OR a specific, named, well-documented public matter (named entity + year + substantive analysis); a generic process/peer-review walkthrough does not count. Distinct concepts per scene: judge this on what each scene TEACHES (its \`teachesConcepts\`) — each scene must make a substantively distinct contribution. Do NOT flag a scene merely because it shares a topical \`conceptTags\` value with another scene: topical tags (e.g. \`fatf\`, \`fiu\`) legitimately recur across a lesson on that topic, exactly as they do in the approved baseline lessons. Flag only genuine re-teaching of the same concept. Quizzes are formative and scenario-based, not certification-format mimics ("All of the following EXCEPT" is a red flag).

4. **Citation discipline.** Every factual claim in a reading scene appears in the citations[] array with name + section. Structured references in slide items (statutes, FATF Recs, EOs, case names) must be locatable in the lesson's citation pool. Numeric or quantitative claims must co-occur with a primary-source citation in the same or adjacent reading scene.

5. **Adult-professional register.** No marketing register ("comprehensive", "powerful", "robust", "industry-leading"). No condescension. No undefined jargon. No made-up statistics.

OUTLINE'S DECLARED SOURCES (advisory)
${listOutlineSources(ctx.outline)}

CURRENT FACTS REFERENCE (verified — treat as ground truth over your own recollection)
${CURRENT_FACTS_PACK}

${priorBlock}
LESSON ARTIFACT (JSON)
\`\`\`json
${JSON.stringify(ctx.artifact, null, 2)}
\`\`\`
${OUTPUT_FORMAT}`
}

export function buildFidelityBrief(ctx: BriefContext): string {
  const priorBlock = ctx.priorFidelityFeedback
    ? `\nPRIOR CROSS-CHECK DISAGREEMENT (your earlier review of an earlier draft):\n${ctx.priorFidelityFeedback}\n\nConfirm whether the factual issues are now resolved and whether new factual problems have appeared.\n`
    : ''
  return `You are a Codex cross-check reviewer auditing a generated Enso Academy lesson for FACTUAL FIDELITY.

CONTEXT
- Course: ${ctx.outline.course.name} (${ctx.outline.course.certifyingBody})
- Module: ${ctx.module.name}
- Lesson: ${ctx.lesson.name}

YOUR JOB — factual-fidelity audit
Audit the lesson artifact below for factual accuracy. Specifically:

1. **Citation precision.** Statute numbers, sections, paragraph identifiers, code titles must be correct (e.g. "18 U.S.C. § 2339B" must really be that section; "UNSCR 1373" must be the resolution that paragraph 1(c) actually says what the lesson claims). FATF Recommendation numbers, INR numbers, EU Regulation / Directive numbers, UK statute years — every numeric identifier is fact-checked.

2. **Case fidelity.** For enforcement actions and court cases: docket numbers, the named court, the named judge, the named defendant, the plea or settlement date, and the disposition (DPA / plea / verdict / forfeiture / fine amount) must match the cited primary source. The deep-case scene is the highest-value site for this audit.

3. **Regulatory-text fidelity.** Paraphrases of statutes, regulations, or standards must not misstate the rule. Specifically check that scope language is right — who the rule applies to, which transactions, which thresholds, which exceptions. Mis-stated scope is the most common subtle error (e.g. mis-attributing a Travel Rule obligation to DNFBPs).

4. **Numeric claims.** Dollar amounts, percentages, counts, durations — must trace to the cited source. Made-up plausibility figures ("tens of billions", "hundreds of dollars per customer") need anchoring.

5. **Timeline and chronology.** Effective dates, amendment dates, enforcement-action dates, designation chronologies must be correct.

6. **Identity precision.** Named individuals (judges, monitors, defendants) must be the actual named individuals in the cited source. Do not flag absence of names that are not in the source; flag misattributions or fabrications.

CURRENT FACTS REFERENCE (verified — treat as ground truth over your own recollection; flag any claim in the lesson that contradicts these)
${CURRENT_FACTS_PACK}

${priorBlock}
LESSON ARTIFACT (JSON)
\`\`\`json
${JSON.stringify(ctx.artifact, null, 2)}
\`\`\`
${OUTPUT_FORMAT}`
}

// ── Codex-artifact persistence (.codex.<n>.txt audit trail) ──────────────

function writeCodexArtifact(
  courseSlug: string,
  lessonSlug: string,
  iteration: number,
  methodologyBrief: string,
  methodologyVerdict: CodexVerdict,
  fidelityBrief: string,
  fidelityVerdict: CodexVerdict,
): string {
  const path = resolve(
    process.cwd(),
    'generated',
    courseSlug,
    'lessons',
    `${lessonSlug}.codex.${iteration}.txt`,
  )
  mkdirSync(dirname(path), { recursive: true })
  const sep = `\n\n${'='.repeat(80)}\n`
  const content = [
    `=== Codex cross-check iteration ${iteration} — lesson ${lessonSlug} ===`,
    `=== created ${new Date().toISOString()} ===`,
    `${sep}--- METHODOLOGY BRIEF ---\n`,
    methodologyBrief,
    `${sep}--- METHODOLOGY VERDICT ---`,
    `decision=${methodologyVerdict.decision} exitCode=${methodologyVerdict.exitCode}`,
    methodologyVerdict.raw,
    `${sep}--- FIDELITY BRIEF ---\n`,
    fidelityBrief,
    `${sep}--- FIDELITY VERDICT ---`,
    `decision=${fidelityVerdict.decision} exitCode=${fidelityVerdict.exitCode}`,
    fidelityVerdict.raw,
    '',
  ].join('\n')
  writeFileSync(path, content, 'utf8')
  return path
}

// ── Feedback synthesis ────────────────────────────────────────────────────

/** Format one verdict's reasoning + issues as a readable single-string block —
 *  suitable for embedding as `priorMethodologyFeedback` / `priorFidelityFeedback`
 *  in the next Codex cross-check iteration's brief. */
export function formatVerdictFeedback(verdict: CodexVerdict): string {
  const lines: string[] = []
  lines.push(`VERDICT: ${verdict.decision.toUpperCase()}`)
  if (verdict.reasoning) lines.push(`REASONING: ${verdict.reasoning}`)
  if (verdict.specificIssues.length > 0) {
    lines.push('SPECIFIC ISSUES:')
    for (const i of verdict.specificIssues) lines.push(`- ${i}`)
  }
  return lines.join('\n')
}

/** Combine the disagreement details from one or both Codex verdicts into a
 *  retryFeedback string suitable for the next generateLessonScenes call. */
export function synthesizeCodexFeedback(
  methodologyVerdict: CodexVerdict,
  fidelityVerdict: CodexVerdict,
): string {
  const lines: string[] = []
  if (methodologyVerdict.decision !== 'agree') {
    lines.push(`Codex methodology cross-check returned ${methodologyVerdict.decision.toUpperCase()}.`)
    if (methodologyVerdict.reasoning) lines.push(`REASONING: ${methodologyVerdict.reasoning}`)
    if (methodologyVerdict.specificIssues.length > 0) {
      lines.push('SPECIFIC METHODOLOGY ISSUES:')
      for (const i of methodologyVerdict.specificIssues) lines.push(`- ${i}`)
    }
    lines.push('')
  }
  if (fidelityVerdict.decision !== 'agree') {
    lines.push(`Codex factual-fidelity cross-check returned ${fidelityVerdict.decision.toUpperCase()}.`)
    if (fidelityVerdict.reasoning) lines.push(`REASONING: ${fidelityVerdict.reasoning}`)
    if (fidelityVerdict.specificIssues.length > 0) {
      lines.push('SPECIFIC FACTUAL ISSUES:')
      for (const i of fidelityVerdict.specificIssues) lines.push(`- ${i}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

// ── Public orchestrator ──────────────────────────────────────────────────

export type CodexCrossCheckArgs = {
  courseSlug: string
  artifact: LessonArtifact
  outline: OutlineArtifact
  module: OutlineModule
  lesson: OutlineLesson
  iteration: number // 1-indexed Codex round number
  fromStatus: string // typically 'gate_validated' or 'gate_flagged'
  priorMethodologyFeedback?: string
  priorFidelityFeedback?: string
}

export type CodexCrossCheckResult = {
  outcome: CrossCheckOutcome // validated | flagged | rejected
  combinedDecision: CodexVerdict['decision']
  methodologyVerdict: CodexVerdict
  fidelityVerdict: CodexVerdict
  /** Path to the persisted .codex.<n>.txt artifact. */
  codexArtifactPath: string
  /** Codex retry feedback to merge into the next generateLessonScenes call (only when rejected). */
  feedback: string
}

/** Run one Codex cross-check round on a gate-cleared lesson artifact. Builds
 *  briefs, dispatches in parallel, persists the .codex.<n>.txt audit trail,
 *  emits a lesson_review_events JSONL row, and returns the outcome + retry
 *  feedback. Does NOT save the lesson artifact — caller decides based on
 *  outcome. */
export async function runCodexCrossCheck(args: CodexCrossCheckArgs): Promise<CodexCrossCheckResult> {
  const ctx: BriefContext = {
    artifact: args.artifact,
    outline: args.outline,
    module: args.module,
    lesson: args.lesson,
    priorMethodologyFeedback: args.priorMethodologyFeedback,
    priorFidelityFeedback: args.priorFidelityFeedback,
  }
  const methodologyBrief = buildMethodologyBrief(ctx)
  const fidelityBrief = buildFidelityBrief(ctx)

  const parallel = await parallelCrossCheck({
    methodologyBrief,
    fidelityBrief,
  })

  const outcome = outcomeFromVerdict(parallel.combined)
  const codexArtifactPath = writeCodexArtifact(
    args.courseSlug,
    args.lesson.slug,
    args.iteration,
    methodologyBrief,
    parallel.methodology,
    fidelityBrief,
    parallel.fidelity,
  )

  const notes = [
    `Codex cross-check iteration ${args.iteration}; combined=${parallel.combined}.`,
    `Methodology verdict=${parallel.methodology.decision}: ${parallel.methodology.reasoning}`,
    `Fidelity verdict=${parallel.fidelity.decision}: ${parallel.fidelity.reasoning}`,
    parallel.methodology.specificIssues.length > 0
      ? `Methodology issues: ${parallel.methodology.specificIssues.slice(0, 8).join(' | ')}`
      : '',
    parallel.fidelity.specificIssues.length > 0
      ? `Fidelity issues: ${parallel.fidelity.specificIssues.slice(0, 8).join(' | ')}`
      : '',
  ]
    .filter(Boolean)
    .join(' || ')

  await appendReviewEvent(
    makeReviewEvent({
      courseSlug: args.courseSlug,
      lessonSlug: args.lesson.slug,
      fromStatus: args.fromStatus,
      toStatus: TO_STATUS_BY_OUTCOME[outcome],
      reviewer: 'codex',
      reviewerRole: 'cross_check',
      decision: outcome,
      notes,
      methodologyVersion: METHODOLOGY_VERSION,
      outlineHash: sha256(args.outline),
      artifactHash: sha256(args.artifact),
    }),
  )

  return {
    outcome,
    combinedDecision: parallel.combined,
    methodologyVerdict: parallel.methodology,
    fidelityVerdict: parallel.fidelity,
    codexArtifactPath,
    feedback: outcome === 'rejected' ? synthesizeCodexFeedback(parallel.methodology, parallel.fidelity) : '',
  }
}
