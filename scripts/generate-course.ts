// scripts/generate-course.ts
// Operator CLI for the course-generation pipeline (Prompt 13 / ADR 0017).
// Run with: pnpm tsx scripts/generate-course.ts <mode>
//
//   outline                — Stage 1: generate the course outline (review it before continuing)
//   lesson <mIdx> <lIdx>   — Stage 2: generate one lesson's scenes
//   assessment <mIdx>      — Stage 3: generate one module's questions + glossary
//   full                   — generate every lesson + every module's assessment (resumable; needs an outline)
//   write                  — write the persisted artifacts to the database as a DRAFT course
//
// Each stage persists JSON artifacts under generated/<slug>/ (gitignored) so a
// run is resumable and reviewable. `write` never runs automatically. See
// docs/RUNBOOK-course-generation.md. Generation costs real money — Claude Opus.

import { config } from 'dotenv'
config({ path: '.env.local' })

import type {
  OutlineArtifact,
  OutlineModule,
  OutlineLesson,
  AssessmentArtifact,
} from '../lib/ai/generator/index'

// The first course — CAMS (AML/CFT). IP-clean: abundant free primary sources.
const COURSE = {
  slug: 'cams',
  certification: 'CAMS',
  subject: 'Anti-money-laundering and counter-financing-of-terrorism (AML/CFT) compliance',
  learnerProfile:
    'A working compliance professional or aspiring practitioner, fluent in professional English, with some banking exposure, preparing for an internationally recognised AML certification.',
}

const usd = (cents: number) => `$${(cents / 100).toFixed(4)}`

type GeneratorModule = typeof import('../lib/ai/generator/index')

type LessonRunSummary = {
  sceneCount: number
  totalCostCents: number
  gateAttempts: number
  codexIterations: number
  overall: 'pass' | 'flag'
  codexCombined: 'agree' | 'split' | 'disagree'
}

/** Drive one lesson end-to-end through the full AI verification spine
 *  (methodology v1.1 / ADR 0020):
 *
 *    OUTER LOOP — Codex cross-check (cap MAX_CODEX_REVIEW_ITERATIONS = 3)
 *      INNER LOOP — deterministic gates (cap MAX_GATE_VALIDATION_ATTEMPTS = 3)
 *        generate → runGates → write .validation.json → emit gate event
 *        pass / flag → break inner loop (proceed to Codex)
 *        fail      → retry with gate feedback; on cap → GateValidationCapExceededError
 *      runCodexCrossCheck → write .codex.<n>.txt → emit cross_check event
 *      agree     → save artifact, return (overall pass; or flag if gates flagged)
 *      split     → save artifact, return (overall flag — Codex weak-supported)
 *      disagree  → do NOT save, retry generation with Codex feedback
 *
 *    On Codex cap exceeded → CodexIterationCapExceededError; `full` mode
 *    catches it and pauses the run.
 *
 *  Two retry caps run independently; their feedback signals are merged into
 *  the next generation prompt when both are present in the same iteration.
 *  The lesson artifact JSON is written ONLY after Codex clears (agree or
 *  split) — never on a Codex disagree. The .validation.json + .codex.<n>.txt
 *  siblings persist every iteration's audit trail, gate-fail included. */
async function generateLessonWithFullSpine(
  g: GeneratorModule,
  outline: OutlineArtifact,
  module: OutlineModule,
  lesson: OutlineLesson,
): Promise<LessonRunSummary> {
  let totalCostCents = 0
  let totalGateAttempts = 0
  let priorMethodologyFeedback: string | undefined
  let priorFidelityFeedback: string | undefined

  for (let codexIter = 0; codexIter < g.MAX_CODEX_REVIEW_ITERATIONS; codexIter++) {
    // Feedback the OUTER (Codex) loop carries forward into the prompt of
    // every gate-loop attempt in this Codex iteration.
    const codexRetryFeedback =
      codexIter === 0
        ? undefined
        : [priorMethodologyFeedback, priorFidelityFeedback].filter(Boolean).join('\n\n').trim() || undefined

    // Inner gate loop. lastGateFeedback is reset at the start of every
    // Codex iteration (the next iteration sees a fresh artifact).
    let gateFeedback: string | undefined
    let artifact: import('../lib/ai/generator/index').LessonArtifact | null = null
    let report: import('../lib/ai/generator/index').ValidationReport | null = null

    for (let gateAttempt = 0; gateAttempt < g.MAX_GATE_VALIDATION_ATTEMPTS; gateAttempt++) {
      const retryFeedback =
        [codexRetryFeedback, gateFeedback].filter(Boolean).join('\n\n').trim() || undefined
      const { artifact: a, costCents } = await g.generateLessonScenes({
        outline,
        module,
        lesson,
        retryFeedback,
      })
      artifact = a
      totalCostCents += costCents
      totalGateAttempts += 1

      const notesPrefix =
        codexIter === 0
          ? gateAttempt === 0
            ? 'Stage 2 attempt 1'
            : `Stage 2 retry ${gateAttempt} after deterministic-gate FAIL`
          : gateAttempt === 0
            ? `Stage 2 codex-iter ${codexIter + 1} attempt 1 (after Codex DISAGREE)`
            : `Stage 2 codex-iter ${codexIter + 1} retry ${gateAttempt} after deterministic-gate FAIL`
      const result = await g.validateAndPersistLesson({
        courseSlug: COURSE.slug,
        artifact: a,
        outline,
        fromStatus: 'auto_generated',
        notesPrefix,
      })
      report = result.report

      if (result.shouldSave) break // gates cleared (pass or flag) — proceed to Codex

      gateFeedback = g.summarizeFailures(result.report)
      process.stderr.write(
        `  [gate FAIL] codex-iter ${codexIter + 1} attempt ${gateAttempt + 1} on "${lesson.name}":\n`,
      )
      for (const line of gateFeedback.split('\n').slice(0, 8)) {
        process.stderr.write(`    ${line}\n`)
      }
      process.stderr.write(`    (see ${result.validationPath})\n`)

      if (gateAttempt === g.MAX_GATE_VALIDATION_ATTEMPTS - 1) {
        // Persist the final rejected artifact so a near-miss survives for
        // hand-finishing instead of evaporating (it is never written to the
        // canonical <slug>.json because gates never cleared).
        const rejectedPath = g.saveArtifact(COURSE.slug, `lessons/${lesson.slug}.rejected.json`, a)
        process.stderr.write(`    [rejected artifact saved] ${rejectedPath}\n`)
        throw new g.GateValidationCapExceededError(
          lesson.slug,
          gateAttempt + 1,
          result.report,
          COURSE.slug,
        )
      }
    }

    // Sanity — gate loop either broke on pass/flag or threw on cap.
    if (!artifact || !report) {
      throw new Error('gate loop exited without producing an artifact (internal bug)')
    }

    // Run Codex cross-check on the gate-cleared artifact.
    const gateStatus = report.overall === 'flag' ? 'gate_flagged' : 'gate_validated'
    const codex = await g.runCodexCrossCheck({
      courseSlug: COURSE.slug,
      artifact,
      outline,
      module,
      lesson,
      iteration: codexIter + 1,
      fromStatus: gateStatus,
      priorMethodologyFeedback,
      priorFidelityFeedback,
    })

    if (codex.outcome === 'validated' || codex.outcome === 'flagged') {
      g.saveArtifact(COURSE.slug, `lessons/${lesson.slug}.json`, artifact)
      const overall: 'pass' | 'flag' =
        codex.outcome === 'flagged' || report.overall === 'flag' ? 'flag' : 'pass'
      return {
        sceneCount: artifact.scenes.length,
        totalCostCents,
        gateAttempts: totalGateAttempts,
        codexIterations: codexIter + 1,
        overall,
        codexCombined: codex.combinedDecision,
      }
    }

    // Codex DISAGREE → do NOT save the lesson artifact; re-prompt with
    // Codex's feedback merged into the next iteration's retry payload.
    priorMethodologyFeedback =
      codex.methodologyVerdict.decision !== 'agree'
        ? g.formatVerdictFeedback(codex.methodologyVerdict)
        : undefined
    priorFidelityFeedback =
      codex.fidelityVerdict.decision !== 'agree'
        ? g.formatVerdictFeedback(codex.fidelityVerdict)
        : undefined
    process.stderr.write(
      `  [codex REJECT] iteration ${codexIter + 1} on "${lesson.name}": combined=${codex.combinedDecision}\n`,
    )
    for (const line of codex.feedback.split('\n').slice(0, 10)) {
      process.stderr.write(`    ${line}\n`)
    }
    process.stderr.write(`    (see ${codex.codexArtifactPath})\n`)

    if (codexIter === g.MAX_CODEX_REVIEW_ITERATIONS - 1) {
      // Persist the final gate-cleared, Codex-rejected artifact. This is the
      // best near-miss draft (it cleared every deterministic gate); saving it
      // lets the operator hand-finish the residual Codex issues rather than
      // regenerate from scratch. The .codex.<n>.txt verdicts name the fixes.
      const rejectedPath = g.saveArtifact(COURSE.slug, `lessons/${lesson.slug}.rejected.json`, artifact)
      process.stderr.write(`    [rejected artifact saved for hand-finishing] ${rejectedPath}\n`)
      throw new g.CodexIterationCapExceededError(
        lesson.slug,
        g.MAX_CODEX_REVIEW_ITERATIONS,
        COURSE.slug,
      )
    }
  }

  // Unreachable — the Codex loop either returns or throws.
  throw new Error('generateLessonWithFullSpine reached unreachable tail')
}

async function main() {
  const [mode, ...rest] = process.argv.slice(2)
  // Dynamic import AFTER dotenv.config() — lib/ai/client.ts reads OPENROUTER_API_KEY at load.
  const g = await import('../lib/ai/generator/index')

  if (mode === 'outline') {
    console.log(`Stage 1 — generating the course outline for ${COURSE.certification}…`)
    const { outline, costCents } = await g.generateOutline({
      certification: COURSE.certification,
      subject: COURSE.subject,
      learnerProfile: COURSE.learnerProfile,
    })
    g.saveArtifact(COURSE.slug, 'outline.json', outline)
    const lessons = outline.modules.reduce((n, m) => n + m.lessons.length, 0)
    console.log(`  ${outline.modules.length} modules, ${lessons} lessons — cost ${usd(costCents)}`)
    console.log(`  saved generated/${COURSE.slug}/outline.json — review it before generating lessons`)
    return
  }

  if (mode === 'lesson') {
    const mIdx = Number(rest[0])
    const lIdx = Number(rest[1])
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    const module = outline.modules[mIdx]
    const lesson = module?.lessons[lIdx]
    if (!lesson) throw new Error(`No lesson at module ${mIdx}, lesson ${lIdx}.`)
    console.log(
      `Stage 2 — generating scenes for "${lesson.name}" (deterministic gates + parallel Codex cross-check)…`,
    )
    const result = await generateLessonWithFullSpine(g, outline, module, lesson)
    console.log(
      `  ${result.sceneCount} scenes — cost ${usd(result.totalCostCents)} — ${result.gateAttempts} gate attempt(s) / ${result.codexIterations} codex round(s) — overall ${result.overall.toUpperCase()} (codex ${result.codexCombined.toUpperCase()})`,
    )
    console.log(`  saved generated/${COURSE.slug}/lessons/${lesson.slug}.json + .validation.json + .codex.*.txt`)
    return
  }

  if (mode === 'assessment') {
    const mIdx = Number(rest[0])
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    const module = outline.modules[mIdx]
    if (!module) throw new Error(`No module at index ${mIdx}.`)
    console.log(`Stage 3 — generating assessment for module "${module.name}"…`)
    const { artifact, costCents } = await g.generateAssessment({ outline, module })
    g.saveArtifact(COURSE.slug, `assessment/${module.slug}.json`, artifact)
    console.log(`  ${artifact.questions.length} questions, ${artifact.glossary.length} glossary terms — cost ${usd(costCents)}`)
    return
  }

  if (mode === 'full') {
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first, and review it.')
    console.log('Full generation — this costs real money and takes a while. Resumable: existing artifacts are skipped.')
    console.log(
      'Every lesson runs the full AI verification spine (deterministic gates + parallel Codex cross-check). A lesson that exhausts either retry cap pauses the run.',
    )
    let total = 0
    for (let mi = 0; mi < outline.modules.length; mi++) {
      const module = outline.modules[mi]
      for (let li = 0; li < module.lessons.length; li++) {
        const lesson = module.lessons[li]
        if (g.artifactExists(COURSE.slug, `lessons/${lesson.slug}.json`)) {
          console.log(`  [skip] ${lesson.name}`)
          continue
        }
        try {
          const result = await generateLessonWithFullSpine(g, outline, module, lesson)
          total += result.totalCostCents
          const tag = result.overall === 'flag' ? 'flag' : 'ok'
          console.log(
            `  [${tag}]   ${lesson.name} — ${result.sceneCount} scenes — ${usd(result.totalCostCents)} — ${result.gateAttempts} gate / ${result.codexIterations} codex — combined ${result.codexCombined}`,
          )
        } catch (err) {
          // Cap exceeded (gate OR codex) → pause the run. All other per-lesson errors → log + continue (resumable).
          if (
            err instanceof g.GateValidationCapExceededError ||
            err instanceof g.CodexIterationCapExceededError
          ) {
            console.error(`\n  [PAUSE] ${err.message}\n`)
            throw err
          }
          console.error(`  [FAIL] ${lesson.name}:`, err instanceof Error ? err.message : err)
        }
      }
      if (!g.artifactExists(COURSE.slug, `assessment/${module.slug}.json`)) {
        try {
          const { artifact, costCents } = await g.generateAssessment({ outline, module })
          g.saveArtifact(COURSE.slug, `assessment/${module.slug}.json`, artifact)
          total += costCents
          console.log(`  [ok]   assessment: ${module.name} — ${artifact.questions.length} questions — ${usd(costCents)}`)
        } catch (err) {
          console.error(`  [FAIL] assessment ${module.name}:`, err instanceof Error ? err.message : err)
        }
      }
    }
    console.log(`Total generation cost this run: ${usd(total)}. Now review the artifacts, then run \`write\`.`)
    return
  }

  if (mode === 'write') {
    const outline = g.loadArtifact<OutlineArtifact>(COURSE.slug, 'outline.json')
    if (!outline) throw new Error('No outline.json — run `outline` first.')
    // Use the operator's clean slug for the course URL, not the model's verbose one.
    outline.course.slug = COURSE.slug
    const lessons = g
      .listArtifacts(COURSE.slug, 'lessons')
      .map((f) => g.loadArtifact<import('../lib/ai/generator/index').LessonArtifact>(COURSE.slug, f))
      .filter((x): x is NonNullable<typeof x> => x != null)
    const assessmentFiles = g.listArtifacts(COURSE.slug, 'assessment')
    let assessment: AssessmentArtifact | null = null
    if (assessmentFiles.length > 0) {
      assessment = { questions: [], glossary: [] }
      for (const f of assessmentFiles) {
        const a = g.loadArtifact<AssessmentArtifact>(COURSE.slug, f)
        if (a) {
          assessment.questions.push(...a.questions)
          assessment.glossary.push(...a.glossary)
        }
      }
    }
    console.log(`Writing "${outline.course.slug}" — ${outline.modules.length} modules, ${lessons.length} generated lesson(s)…`)
    const result = await g.writeCourse({
      outline,
      lessons,
      assessment,
      costSummary:
        'Generated via the Prompt 13 content pipeline (methodology v1.1, ADR 0020 — AI verification spine).',
    })
    console.log(`  course ${result.courseId}`)
    console.log(`  ${result.modules} modules, ${result.lessons} lessons, ${result.scenes} scenes, ${result.questions} questions, ${result.glossary} glossary terms`)
    console.log(
      '  written as DRAFT — unpublished, not enrollable. Per methodology v1.1 (ADR 0020), the AI verification spine has run per-lesson; the operator publishes after reviewing any FLAGs and resolving any over-cap lessons.',
    )
    return
  }

  console.error('Usage: pnpm tsx scripts/generate-course.ts <outline | lesson M L | assessment M | full | write>')
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
