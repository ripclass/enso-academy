// scripts/validate-lesson.ts
// Path 2 — operator CLI for the deterministic gate runner (validate_gates.ts).
// Runs every gate against a saved LessonArtifact, writes the
// <lesson-slug>.validation.json sibling, and exits with a structured code so
// CI / orchestration can branch on outcome.
//
// Usage:
//   pnpm tsx scripts/validate-lesson.ts <course-slug> <lesson-slug>
//   pnpm tsx scripts/validate-lesson.ts <course-slug> --all
//
// Exit codes:
//   0   overall = pass
//   1   overall = flag (soft gate raised — review, do not block automatically)
//   2   overall = fail (hard gate raised — block)
//   3   I/O or invocation error
//
// The CLI is a pure validator: it reads the artifact, runs the gates, and
// writes the report. It does NOT emit review_events.jsonl rows or trigger
// Codex; those are orchestration concerns owned by later Path-2 cycles. See
// the validate_gates.ts header for the gate vocabulary.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  runGates,
  type GateOutcome,
  type LessonArtifact,
  type OutlineArtifact,
  type ValidationReport,
} from '../lib/ai/generator/index'

type ExitCode = 0 | 1 | 2 | 3

const OVERALL_TO_EXIT: Record<GateOutcome, ExitCode> = {
  pass: 0,
  flag: 1,
  fail: 2,
  skip: 1, // shouldn't happen at the overall level; treat as flag if it does
}

function die(msg: string): never {
  process.stderr.write(`validate-lesson: ${msg}\n`)
  process.exit(3)
}

function courseDir(courseSlug: string): string {
  const dir = resolve(process.cwd(), 'generated', courseSlug)
  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    die(`course directory not found: ${dir}`)
  }
  return dir
}

function loadOutline(courseSlug: string): OutlineArtifact | undefined {
  const path = join(courseDir(courseSlug), 'outline.json')
  if (!existsSync(path)) return undefined
  return JSON.parse(readFileSync(path, 'utf8')) as OutlineArtifact
}

function loadLessonArtifact(courseSlug: string, lessonSlug: string): LessonArtifact {
  const path = join(courseDir(courseSlug), 'lessons', `${lessonSlug}.json`)
  if (!existsSync(path)) die(`lesson artifact not found: ${path}`)
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as LessonArtifact
  if (!parsed.lessonSlug || !Array.isArray(parsed.scenes)) {
    die(`lesson artifact malformed at ${path}: missing lessonSlug or scenes[]`)
  }
  return parsed
}

function listLessonSlugs(courseSlug: string): string[] {
  const dir = join(courseDir(courseSlug), 'lessons')
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    // Ignore validation sibling files and any secondary-suffix variants
    // (e.g. .inline-trial.json, .validation.json) — primary artifacts only.
    .filter((f) => !f.includes('.validation.') && !/\.[a-z-]+\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

function writeValidationReport(courseSlug: string, lessonSlug: string, report: ValidationReport): string {
  const path = join(courseDir(courseSlug), 'lessons', `${lessonSlug}.validation.json`)
  writeFileSync(path, JSON.stringify(report, null, 2) + '\n', 'utf8')
  return path
}

function printReportSummary(courseSlug: string, lessonSlug: string, report: ValidationReport): void {
  const overallTag =
    report.overall === 'pass' ? 'PASS' : report.overall === 'flag' ? 'FLAG' : report.overall === 'fail' ? 'FAIL' : 'SKIP'
  process.stdout.write(`\n${courseSlug}/${lessonSlug}  →  ${overallTag}\n`)
  for (const [name, gate] of Object.entries(report.gates)) {
    const tag = gate.outcome.toUpperCase().padEnd(4)
    process.stdout.write(`  ${tag}  ${name.padEnd(16)}  ${gate.detail}\n`)
  }
}

function validateOne(courseSlug: string, lessonSlug: string, outline: OutlineArtifact | undefined): ExitCode {
  const artifact = loadLessonArtifact(courseSlug, lessonSlug)
  const report = runGates(artifact, { outline })
  const path = writeValidationReport(courseSlug, lessonSlug, report)
  printReportSummary(courseSlug, lessonSlug, report)
  process.stdout.write(`  → wrote ${path}\n`)
  return OVERALL_TO_EXIT[report.overall]
}

function main(): void {
  const [courseSlug, lessonArg] = process.argv.slice(2)
  if (!courseSlug || !lessonArg) {
    die('usage: validate-lesson <course-slug> <lesson-slug | --all>')
  }
  const outline = loadOutline(courseSlug)
  if (!outline) {
    process.stderr.write(`validate-lesson: no outline.json under generated/${courseSlug}/ — citation gate will run without outline resolution\n`)
  }
  if (lessonArg === '--all') {
    const slugs = listLessonSlugs(courseSlug)
    if (slugs.length === 0) die(`no primary lesson artifacts found under generated/${courseSlug}/lessons/`)
    let worst: ExitCode = 0
    for (const slug of slugs) {
      const code = validateOne(courseSlug, slug, outline)
      if (code > worst) worst = code
    }
    process.stdout.write(`\n${slugs.length} lesson(s) validated; worst outcome → exit ${worst}\n`)
    process.exit(worst)
  }
  const code = validateOne(courseSlug, lessonArg, outline)
  process.exit(code)
}

main()
