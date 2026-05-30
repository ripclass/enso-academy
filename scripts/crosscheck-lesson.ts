// scripts/crosscheck-lesson.ts
//
// Standalone Codex cross-check for an INLINE-generated lesson artifact.
//
// The inline-generation workflow (cams-session-brief.md): the Claude session
// generates a lesson, self-validates with `validate-lesson.ts` (deterministic
// gates), then runs THIS to dispatch the parallel methodology + factual-fidelity
// Codex cross-check, persist the .codex.<n>.txt audit trail, and append the
// review_events.jsonl rows. It does NOT generate or call any model API for
// generation — generation is the session's job. Codex runs via the `codex` CLI
// on the ChatGPT subscription.
//
// Usage: pnpm tsx scripts/crosscheck-lesson.ts <course-slug> <lesson-slug> [iteration]
// Exit codes: 0 = AGREE, 1 = SPLIT (flagged), 2 = DISAGREE (rejected), 3 = invocation error.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Import the specific modules (not the index) so we never pull lib/ai/client.ts,
// which throws at load without OPENROUTER_API_KEY. Cross-check needs no API key.
import { runCodexCrossCheck } from '../lib/ai/generator/codex_review'
import { makeReviewEvent, appendReviewEvent } from '../lib/ai/generator/codex_dispatch'
import { METHODOLOGY_VERSION } from '../lib/ai/generator/methodology'
import type { LessonArtifact, OutlineArtifact } from '../lib/ai/generator/types'

function sha256(data: unknown): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

async function main() {
  const [courseSlug, lessonSlug, iterArg] = process.argv.slice(2)
  if (!courseSlug || !lessonSlug) {
    console.error('Usage: pnpm tsx scripts/crosscheck-lesson.ts <course-slug> <lesson-slug> [iteration]')
    process.exit(3)
  }
  const iteration = Number(iterArg ?? '1') || 1

  const root = process.cwd()
  const outlinePath = resolve(root, 'generated', courseSlug, 'outline.json')
  const artifactPath = resolve(root, 'generated', courseSlug, 'lessons', `${lessonSlug}.json`)

  let outline: OutlineArtifact
  let artifact: LessonArtifact
  try {
    outline = JSON.parse(readFileSync(outlinePath, 'utf8'))
  } catch {
    console.error(`Could not read outline at ${outlinePath}`)
    process.exit(3)
  }
  try {
    artifact = JSON.parse(readFileSync(artifactPath, 'utf8'))
  } catch {
    console.error(`Could not read lesson artifact at ${artifactPath} — generate it first.`)
    process.exit(3)
  }

  // Locate the lesson + its module in the outline.
  let foundModule: OutlineArtifact['modules'][number] | undefined
  let foundLesson: OutlineArtifact['modules'][number]['lessons'][number] | undefined
  for (const m of outline.modules) {
    const l = m.lessons.find((x) => x.slug === lessonSlug)
    if (l) {
      foundModule = m
      foundLesson = l
      break
    }
  }
  if (!foundModule || !foundLesson) {
    console.error(`Lesson slug "${lessonSlug}" not found in ${courseSlug} outline.`)
    process.exit(3)
  }

  // Record that this artifact was generated inline by the Claude session
  // (the brief's auto_generated event), then run the cross-check.
  await appendReviewEvent(
    makeReviewEvent({
      courseSlug,
      lessonSlug,
      fromStatus: null,
      toStatus: 'auto_generated',
      reviewer: 'inline-generator',
      reviewerRole: 'internal',
      decision: 'auto_generate',
      notes: 'Inline generation by the Claude Code session (per cams-session-brief.md); self-validated, deterministic gates PASS.',
      methodologyVersion: METHODOLOGY_VERSION,
      outlineHash: sha256(outline),
      artifactHash: sha256(artifact),
    }),
  )

  console.log(`Dispatching parallel Codex cross-check (methodology + fidelity) for "${foundLesson.name}"…`)
  const result = await runCodexCrossCheck({
    courseSlug,
    artifact,
    outline,
    module: foundModule,
    lesson: foundLesson,
    iteration,
    fromStatus: 'auto_generated',
  })

  console.log(`\n  combined verdict: ${result.combinedDecision.toUpperCase()}  (outcome: ${result.outcome})`)
  console.log(`  methodology: ${result.methodologyVerdict.decision} — ${result.methodologyVerdict.reasoning}`)
  if (result.methodologyVerdict.specificIssues.length) {
    for (const i of result.methodologyVerdict.specificIssues) console.log(`     • ${i}`)
  }
  console.log(`  fidelity: ${result.fidelityVerdict.decision} — ${result.fidelityVerdict.reasoning}`)
  if (result.fidelityVerdict.specificIssues.length) {
    for (const i of result.fidelityVerdict.specificIssues) console.log(`     • ${i}`)
  }
  console.log(`  audit: ${result.codexArtifactPath}`)

  process.exit(result.combinedDecision === 'agree' ? 0 : result.combinedDecision === 'split' ? 1 : 2)
}

main().catch((err) => {
  console.error('crosscheck-lesson failed:', err instanceof Error ? err.message : err)
  process.exit(3)
})
