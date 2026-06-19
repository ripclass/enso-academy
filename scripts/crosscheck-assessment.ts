// scripts/crosscheck-assessment.ts
//
// Standalone Codex cross-check for an INLINE-generated ASSESSMENT artifact
// (one module's question set + glossary). The assessment analogue of
// crosscheck-lesson.ts: dispatches the parallel fidelity + methodology Codex
// cross-check, persists the .codex.<n>.txt audit trail under
// generated/<course>/assessment/, and appends the review_events.jsonl rows.
// Generation is the Claude session's job; Codex runs via the `codex` CLI.
//
// Usage: pnpm tsx scripts/crosscheck-assessment.ts <course-slug> <module-slug> [iteration]
// Exit codes: 0 = AGREE, 1 = SPLIT (flagged), 2 = DISAGREE (rejected), 3 = invocation error.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { runAssessmentCrossCheck } from '../lib/ai/generator/codex_review_assessment'
import type { AssessmentArtifact, OutlineArtifact } from '../lib/ai/generator/types'

async function main() {
  const [courseSlug, moduleSlug, iterArg] = process.argv.slice(2)
  if (!courseSlug || !moduleSlug) {
    console.error('Usage: pnpm tsx scripts/crosscheck-assessment.ts <course-slug> <module-slug> [iteration]')
    process.exit(3)
  }
  const iteration = Number(iterArg ?? '1') || 1

  const root = process.cwd()
  const outlinePath = resolve(root, 'generated', courseSlug, 'outline.json')
  const artifactPath = resolve(root, 'generated', courseSlug, 'assessment', `${moduleSlug}.json`)

  let outline: OutlineArtifact
  let artifact: AssessmentArtifact
  try {
    outline = JSON.parse(readFileSync(outlinePath, 'utf8'))
  } catch {
    console.error(`Could not read outline at ${outlinePath}`)
    process.exit(3)
  }
  try {
    artifact = JSON.parse(readFileSync(artifactPath, 'utf8'))
  } catch {
    console.error(`Could not read assessment artifact at ${artifactPath} — generate it first.`)
    process.exit(3)
  }

  const module = outline.modules.find((m) => m.slug === moduleSlug)
  if (!module) {
    console.error(`Module slug "${moduleSlug}" not found in ${courseSlug} outline.`)
    process.exit(3)
  }

  const n = artifact.questions?.length ?? 0
  console.log(`Dispatching parallel Codex assessment cross-check (fidelity + methodology) for "${module.name}" (${n} questions)…`)
  const result = await runAssessmentCrossCheck({
    courseSlug,
    artifact,
    outline,
    module,
    iteration,
    fromStatus: 'auto_generated',
  })

  console.log(`\n  combined verdict: ${result.combinedDecision.toUpperCase()}  (outcome: ${result.outcome})`)
  console.log(`  fidelity: ${result.fidelityVerdict.decision} — ${result.fidelityVerdict.reasoning}`)
  for (const i of result.fidelityVerdict.specificIssues) console.log(`     • ${i}`)
  console.log(`  methodology: ${result.methodologyVerdict.decision} — ${result.methodologyVerdict.reasoning}`)
  for (const i of result.methodologyVerdict.specificIssues) console.log(`     • ${i}`)
  console.log(`  audit: ${result.codexArtifactPath}`)

  process.exit(result.combinedDecision === 'agree' ? 0 : result.combinedDecision === 'split' ? 1 : 2)
}

main().catch((err) => {
  console.error('crosscheck-assessment failed:', err instanceof Error ? err.message : err)
  process.exit(3)
})
