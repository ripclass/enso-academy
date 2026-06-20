// lib/ai/generator/codex_review_assessment.ts
//
// Per-module Codex cross-check for an INLINE-generated ASSESSMENT artifact
// (a module's question set + glossary). The assessment analogue of
// codex_review.ts: it reuses the same low-level dispatch primitives
// (parallelCrossCheck, makeReviewEvent, appendReviewEvent) and the same
// CURRENT_FACTS_PACK ground-truth injection, but its two briefs audit a
// question bank rather than a lesson:
//
//   - FIDELITY:    is each keyed answer actually correct, is any distractor
//                  defensibly also-correct, and are the stem / options /
//                  explanation / wrong-answer rationales factually accurate?
//   - METHODOLOGY: are the items original (not copied from a certification
//                  body or commercial prep), durable (not pinned to volatile
//                  current-list facts), scenario-based (not rote
//                  certification-format mimicry), with sane domain + tags?
//
// Server-only by convention (lib/ai/* — see CLAUDE.md gotchas).

import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { appendReviewEvent, makeReviewEvent, parallelCrossCheck, type CodexVerdict } from './codex_dispatch'
import { CURRENT_FACTS_PACK } from './facts_pack'
import { METHODOLOGY_VERSION } from './methodology'
import type { AssessmentArtifact, OutlineArtifact, OutlineModule } from './types'

export type AssessmentCrossCheckOutcome = 'validated' | 'flagged' | 'rejected'

function outcomeFromVerdict(combined: CodexVerdict['decision']): AssessmentCrossCheckOutcome {
  if (combined === 'agree') return 'validated'
  if (combined === 'split') return 'flagged'
  return 'rejected'
}

const TO_STATUS_BY_OUTCOME: Record<AssessmentCrossCheckOutcome, string> = {
  validated: 'assessment_cross_check_validated',
  flagged: 'assessment_cross_check_flagged',
  rejected: 'assessment_cross_check_rejected',
}

function sha256(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

const OUTPUT_FORMAT = `
Output in this exact format — nothing else, no preamble, no code fences:

VERDICT: AGREE | DISAGREE | SPLIT
REASONING: one or two sentences explaining the verdict.
SPECIFIC ISSUES: (only if DISAGREE or SPLIT) a bulleted list of concrete problems, each citing the offending question by its stem (first ~10 words) and stating the defect. Use "-" as the bullet marker.

A verdict of AGREE means the audit dimension is acceptable for promotion to the question bank. SPLIT means mostly acceptable with soft issues a reviewer should see. DISAGREE means at least one question must be fixed before the set can ship.`

type AssessmentBriefContext = {
  artifact: AssessmentArtifact
  outline: OutlineArtifact
  module: OutlineModule
  priorFidelityFeedback?: string
  priorMethodologyFeedback?: string
}

function moduleTagUnion(module: OutlineModule): string {
  const tags = new Set<string>()
  for (const l of module.lessons ?? []) for (const t of l.conceptTags ?? []) tags.add(t)
  return [...tags].join(', ') || '(none declared)'
}

export function buildAssessmentFidelityBrief(ctx: AssessmentBriefContext): string {
  const prior = ctx.priorFidelityFeedback
    ? `\nPRIOR CROSS-CHECK DISAGREEMENT (your earlier review of an earlier draft):\n${ctx.priorFidelityFeedback}\n\nThe set has been revised. Confirm whether the issues are resolved and whether new ones appeared.\n`
    : ''
  return `You are a Codex cross-check reviewer auditing a generated Enso Academy ASSESSMENT question set for FACTUAL FIDELITY and ANSWER-KEY CORRECTNESS.

CONTEXT
- Course: ${ctx.outline.course.name} (${ctx.outline.course.certifyingBody})
- Module: ${ctx.module.name} — ${ctx.module.objective}

YOUR JOB — audit every question in the set below for:

1. **Answer-key correctness.** For a single-answer question (\`questionType\` 'scenario_mcq'/'single_choice'), confirm the option identified by \`correctOptionId\` is genuinely, unambiguously correct. For a **multiple-response** question (\`questionType\` 'multiple_choice'), confirm the SET of options in \`correctOptionIds\` is exactly right — every listed id is genuinely correct AND no correct option is missing from the set; the stem should make clear how many to select (\`selectCount\`). A wrong key, a wrongly-included id, or a missing-correct id is a ship-blocking defect.

2. **No defensible distractor (no second correct answer).** For single-answer questions, confirm no wrong option is also defensibly correct. For multiple-response questions, confirm that every option NOT in \`correctOptionIds\` is clearly wrong and that no correct option was left out of the set — a "distractor" that is actually correct is a defect. Flag it.

3. **Distractor wrongness.** Each distractor must be clearly wrong (plausible but incorrect), and its entry in \`wrongAnswerRationales\` must correctly state WHY it is wrong. Flag a distractor that is not actually wrong, or a rationale that misstates the reason.

4. **Factual accuracy of stem, options and explanation.** Statute / section / regulation / Recommendation / INR numbers, dates, dollar amounts, counts, named cases and entities, and scope language (who/which transactions/which thresholds/which exceptions) must be correct against the verified facts reference below and the primary public record. Mis-stated scope is the most common subtle error.

5. **Consistency.** The \`explanation\` must support the keyed answer and not contradict the stem or options.

Treat the facts reference as ground truth over your own recollection; flag any question that contradicts it.

CURRENT FACTS REFERENCE (verified — ground truth)
${CURRENT_FACTS_PACK}
${prior}
ASSESSMENT ARTIFACT (JSON — questions + glossary)
\`\`\`json
${JSON.stringify(ctx.artifact, null, 2)}
\`\`\`
${OUTPUT_FORMAT}`
}

export function buildAssessmentMethodologyBrief(ctx: AssessmentBriefContext): string {
  const prior = ctx.priorMethodologyFeedback
    ? `\nPRIOR CROSS-CHECK DISAGREEMENT (your earlier review of an earlier draft):\n${ctx.priorMethodologyFeedback}\n\nThe set has been revised. Confirm whether the issues are resolved and whether new ones appeared.\n`
    : ''
  return `You are a Codex cross-check reviewer auditing a generated Enso Academy ASSESSMENT question set against the course-generation methodology (version ${METHODOLOGY_VERSION}).

CONTEXT
- Course: ${ctx.outline.course.name} (${ctx.outline.course.certifyingBody})
- Module: ${ctx.module.name}
- Module concept tags (questions' \`conceptTags\` must be a subset of these): ${moduleTagUnion(ctx.module)}

YOUR JOB — methodology audit of the question set below:

1. **IP / originality.** The questions must be ORIGINAL scenario items. Flag any question that reproduces or closely paraphrases an actual exam question of a certification body (ACAMS/CAMS, ACFE, etc.) or any commercial exam-prep provider (Wiley, Kaplan, Schweser, Becker, BPP, ICA), or that reproduces ICC rule text (UCP 600, ISBP, URDG, ISP 98, URC 522). Reference to law/standards by name and section is fine; reproduction is not.

2. **Durability.** The bank must stay correct over time. Flag any question whose correct answer depends on a VOLATILE current fact that will date — e.g. current FATF grey/black-list membership, a specific entity's current sanctions-designation status, "the latest" amendment — rather than a durable, concept-anchored fact (statutory structure, typology, control principle).

3. **Format.** TWO question formats are valid and both are exam-faithful — do NOT flag a question merely for which of these it uses:
   - **Single-answer** (\`questionType\` 'scenario_mcq'/'single_choice'): four plausible options, one correct, with an explanation and wrong-answer rationales. Prefer scenario-based application framing.
   - **Multiple-response** (\`questionType\` 'multiple_choice'): the real certification exam includes "select N" / "select all that apply" items, so these are legitimate and faithful, NOT certification-format mimicry. They normally carry 4–6 options with two or more correct (\`correctOptionIds\`), a clear select-count instruction in the stem, an explanation, and rationales for the incorrect options. A 5- or 6-option "select THREE" checklist is the expected shape here, NOT a format violation.
   "Certification-format mimicry" means copying a prep provider's proprietary question wording/content or its house style — it does NOT mean using the standard single-answer or multiple-response MCQ formats. "All of the following EXCEPT" / "Which of the following is NOT" / pure trivia-recall stems remain red flags. Multiple-response items may be knowledge-anchored (e.g. "select the THREE characteristics of …") or scenario-framed; prefer scenario framing where natural, but do not reject a knowledge-anchored multiple-response item on format grounds alone.

4. **Domain + tag sanity.** Each question's \`domain\` should be appropriate to its content (A = risks & methods of financial crime; B = global AFC frameworks/governance/regulations; C = building an AFC compliance program; D = tools & technologies), and its \`conceptTags\` should be drawn from the module's tag set above. Flag a clear domain misassignment or out-of-scope tags.

5. **Adult-professional register.** No marketing language, condescension, undefined jargon, or made-up statistics.

CURRENT FACTS REFERENCE (verified — ground truth for the durability/scope judgments above)
${CURRENT_FACTS_PACK}
${prior}
ASSESSMENT ARTIFACT (JSON — questions + glossary)
\`\`\`json
${JSON.stringify(ctx.artifact, null, 2)}
\`\`\`
${OUTPUT_FORMAT}`
}

function writeAssessmentCodexArtifact(
  courseSlug: string,
  moduleSlug: string,
  iteration: number,
  fidelityBrief: string,
  fidelityVerdict: CodexVerdict,
  methodologyBrief: string,
  methodologyVerdict: CodexVerdict,
): string {
  const path = resolve(process.cwd(), 'generated', courseSlug, 'assessment', `${moduleSlug}.codex.${iteration}.txt`)
  mkdirSync(dirname(path), { recursive: true })
  const sep = `\n\n${'='.repeat(80)}\n`
  const content = [
    `=== Codex assessment cross-check iteration ${iteration} — module ${moduleSlug} ===`,
    `=== created ${new Date().toISOString()} ===`,
    `${sep}--- FIDELITY BRIEF ---\n`,
    fidelityBrief,
    `${sep}--- FIDELITY VERDICT ---`,
    `decision=${fidelityVerdict.decision} exitCode=${fidelityVerdict.exitCode}`,
    fidelityVerdict.raw,
    `${sep}--- METHODOLOGY BRIEF ---\n`,
    methodologyBrief,
    `${sep}--- METHODOLOGY VERDICT ---`,
    `decision=${methodologyVerdict.decision} exitCode=${methodologyVerdict.exitCode}`,
    methodologyVerdict.raw,
    '',
  ].join('\n')
  writeFileSync(path, content, 'utf8')
  return path
}

export type AssessmentCrossCheckArgs = {
  courseSlug: string
  artifact: AssessmentArtifact
  outline: OutlineArtifact
  module: OutlineModule
  iteration: number
  fromStatus: string
  priorFidelityFeedback?: string
  priorMethodologyFeedback?: string
}

export type AssessmentCrossCheckResult = {
  outcome: AssessmentCrossCheckOutcome
  combinedDecision: CodexVerdict['decision']
  fidelityVerdict: CodexVerdict
  methodologyVerdict: CodexVerdict
  codexArtifactPath: string
}

/** Run one Codex cross-check round on a module's assessment artifact. Builds the
 *  fidelity + methodology briefs, dispatches in parallel, persists the
 *  .codex.<n>.txt audit trail, emits a review-events JSONL row, and returns the
 *  outcome. Does NOT modify the artifact — caller fixes and re-dispatches. */
export async function runAssessmentCrossCheck(args: AssessmentCrossCheckArgs): Promise<AssessmentCrossCheckResult> {
  const ctx: AssessmentBriefContext = {
    artifact: args.artifact,
    outline: args.outline,
    module: args.module,
    priorFidelityFeedback: args.priorFidelityFeedback,
    priorMethodologyFeedback: args.priorMethodologyFeedback,
  }
  const fidelityBrief = buildAssessmentFidelityBrief(ctx)
  const methodologyBrief = buildAssessmentMethodologyBrief(ctx)

  // Reuse parallelCrossCheck's two-lane dispatch: lane 1 = fidelity, lane 2 = methodology.
  const parallel = await parallelCrossCheck({ methodologyBrief, fidelityBrief })
  const fidelityVerdict = parallel.fidelity
  const methodologyVerdict = parallel.methodology
  const combinedDecision = parallel.combined
  const outcome = outcomeFromVerdict(combinedDecision)

  const codexArtifactPath = writeAssessmentCodexArtifact(
    args.courseSlug,
    args.module.slug,
    args.iteration,
    fidelityBrief,
    fidelityVerdict,
    methodologyBrief,
    methodologyVerdict,
  )

  const notes = [
    `Assessment Codex cross-check iteration ${args.iteration}; combined=${combinedDecision}.`,
    `Fidelity verdict=${fidelityVerdict.decision}: ${fidelityVerdict.reasoning}`,
    `Methodology verdict=${methodologyVerdict.decision}: ${methodologyVerdict.reasoning}`,
    fidelityVerdict.specificIssues.length > 0 ? `Fidelity issues: ${fidelityVerdict.specificIssues.slice(0, 10).join(' | ')}` : '',
    methodologyVerdict.specificIssues.length > 0 ? `Methodology issues: ${methodologyVerdict.specificIssues.slice(0, 10).join(' | ')}` : '',
  ]
    .filter(Boolean)
    .join(' || ')

  await appendReviewEvent(
    makeReviewEvent({
      courseSlug: args.courseSlug,
      lessonSlug: `assessment:${args.module.slug}`,
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

  return { outcome, combinedDecision, fidelityVerdict, methodologyVerdict, codexArtifactPath }
}
