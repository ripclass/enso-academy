// lib/ai/generator/codex_dispatch.ts
//
// Path-2 cycle 4 — Codex orchestration wrapper.
//
// Fixes the failure mode that surfaced once in Path 1: the codex-rescue
// subagent claimed shell-argument-size limits and produced a Claude-written
// verdict labelled as Codex's. The infrastructure-level fix is to always
// write the brief to a temp file and pipe via stdin, never pass through the
// command line. This module is the single point of Codex invocation for
// Path 2; downstream orchestrators call dispatchCodex() / parallelCrossCheck()
// and trust the returned verdict.
//
// Server-only by convention (lib/ai/* — see CLAUDE.md gotchas). Requires
// the `codex` CLI to be installed locally and logged in (codex login status
// → "Logged in using ChatGPT").
//
// Usage:
//   import { dispatchCodex, parallelCrossCheck, appendReviewEvent } from './codex_dispatch'
//   const verdict = await dispatchCodex({ brief: '...' })
//   const { methodology, fidelity } = await parallelCrossCheck({
//     methodologyBrief: '...',
//     fidelityBrief: '...',
//   })

import { spawnSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'

// ── Public types ──────────────────────────────────────────────────────────

export type CodexDecision = 'agree' | 'disagree' | 'split'

export type CodexVerdict = {
  /** AGREE / DISAGREE / SPLIT, lowercased — matches the lesson_review_events.decision vocabulary. */
  decision: CodexDecision
  /** The REASONING line, verbatim. */
  reasoning: string
  /** SPECIFIC ISSUES bullets, verbatim — empty array on AGREE. */
  specificIssues: string[]
  /** The raw Codex output verbatim — caller stores this in the event's notes field. */
  raw: string
  /** Codex CLI's exit code. 0 on success. */
  exitCode: number
}

export type DispatchOptions = {
  /** Override codex CLI binary; defaults to `codex`. */
  codexBinary?: string
  /** Timeout for the codex exec call, in milliseconds. Default 10 minutes. */
  timeoutMs?: number
  /** Extra args to pass to `codex exec` — appended after the defaults. */
  extraArgs?: string[]
}

// ── Core dispatch ─────────────────────────────────────────────────────────

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000

/** Invoke `codex exec` non-interactively with the given brief via stdin.
 *  Always pipes the brief through a temp file — never command-line arg —
 *  to remove the shell-argument-size failure mode end-to-end. */
export async function dispatchCodex(args: { brief: string } & DispatchOptions): Promise<CodexVerdict> {
  const { brief, codexBinary = 'codex', timeoutMs = DEFAULT_TIMEOUT_MS, extraArgs = [] } = args

  const workDir = mkdtempSync(join(tmpdir(), 'codex-dispatch-'))
  const briefPath = join(workDir, 'brief.txt')
  const outputPath = join(workDir, 'output.txt')

  try {
    writeFileSync(briefPath, brief, 'utf8')

    const cliArgs = [
      'exec',
      '--skip-git-repo-check',
      '--output-last-message',
      outputPath,
      ...extraArgs,
    ]

    // Pipe the brief via stdin — never as a command-line argument.
    const stdinContents = readFileSync(briefPath, 'utf8')
    const result = spawnSync(codexBinary, cliArgs, {
      input: stdinContents,
      encoding: 'utf8',
      timeout: timeoutMs,
      maxBuffer: 50 * 1024 * 1024, // 50MB — codex output can be large
    })

    if (result.error) {
      throw new Error(`codex exec failed to spawn: ${result.error.message}`)
    }

    // Prefer the --output-last-message file; fall back to stdout if file is missing.
    let raw = ''
    try {
      raw = readFileSync(outputPath, 'utf8').trim()
    } catch {
      raw = (result.stdout ?? '').toString().trim()
    }
    if (!raw) {
      throw new Error(
        `codex exec produced no output (exit ${result.status ?? '?'}, stderr: ${(result.stderr ?? '').toString().slice(0, 500)})`,
      )
    }

    return parseVerdict(raw, result.status ?? 0)
  } finally {
    // Best-effort cleanup; ignore errors so we don't shadow the original failure.
    try {
      rmSync(workDir, { recursive: true, force: true })
    } catch {
      /* noop */
    }
  }
}

// ── Verdict parsing ───────────────────────────────────────────────────────

/** Parse Codex's standard structured output into a CodexVerdict.
 *
 * Expected shape:
 *   VERDICT: AGREE | DISAGREE | SPLIT
 *   REASONING: one or two sentences, plain English.
 *   SPECIFIC ISSUES: (only if DISAGREE/SPLIT) bullet list of concrete problems.
 *
 * Line-based parsing is more robust than a single multi-line regex against
 * Codex's slightly variable line-break behaviour across versions. */
export function parseVerdict(raw: string, exitCode = 0): CodexVerdict {
  const lines = raw.split(/\r?\n/)
  let decision: CodexDecision | null = null
  const reasoningLines: string[] = []
  const issueLines: string[] = []
  type Section = 'preamble' | 'reasoning' | 'issues'
  let section: Section = 'preamble'

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '')
    const verdictMatch = line.match(/^\s*VERDICT:\s*(AGREE|DISAGREE|SPLIT)\b/i)
    if (verdictMatch) {
      decision = verdictMatch[1].toLowerCase() as CodexDecision
      section = 'preamble'
      continue
    }
    const reasoningMatch = line.match(/^\s*REASONING:\s*(.*)$/i)
    if (reasoningMatch) {
      section = 'reasoning'
      if (reasoningMatch[1].trim()) reasoningLines.push(reasoningMatch[1].trim())
      continue
    }
    const issuesMatch = line.match(/^\s*SPECIFIC\s+ISSUES:\s*(.*)$/i)
    if (issuesMatch) {
      section = 'issues'
      const tail = issuesMatch[1].trim()
      if (tail) issueLines.push(tail)
      continue
    }
    if (!line.trim()) continue
    if (section === 'reasoning') reasoningLines.push(line.trim())
    else if (section === 'issues') issueLines.push(line.trim())
  }

  if (!decision) {
    throw new Error(`codex output did not contain a VERDICT line: ${raw.slice(0, 400)}`)
  }

  const reasoning = reasoningLines.join(' ').replace(/\s+/g, ' ').trim()

  // Split the combined issues text into individual bullets — Codex uses '-',
  // '*', '•' or just newlines.
  const specificIssues: string[] = []
  for (const piece of issueLines) {
    // A single line may contain multiple bullets if Codex didn't break them
    // across lines (it sometimes packs everything onto one line). Split on
    // the bullet marker too.
    const bulletParts = piece.split(/(?:^|\s)[-•*]\s+/).map((s) => s.trim()).filter(Boolean)
    for (const b of bulletParts) {
      if (/^\(?none\)?\.?$/i.test(b)) continue
      specificIssues.push(b)
    }
  }

  return { decision, reasoning, specificIssues, raw, exitCode }
}

// ── Parallel cross-check (methodology + factual-fidelity) ─────────────────

export type ParallelCrossCheckArgs = {
  methodologyBrief: string
  fidelityBrief: string
} & DispatchOptions

export type ParallelCrossCheckResult = {
  methodology: CodexVerdict
  fidelity: CodexVerdict
  /** The combined decision: AGREE iff both AGREE; SPLIT if any SPLIT; DISAGREE if any DISAGREE. */
  combined: CodexDecision
}

/** Dispatch the methodology audit and the factual-fidelity check in parallel
 *  (the Path-1 lesson: running them in series collapses one cross-check
 *  iteration into two — the methodology gate only surfaces under LQB strictness). */
export async function parallelCrossCheck(args: ParallelCrossCheckArgs): Promise<ParallelCrossCheckResult> {
  const { methodologyBrief, fidelityBrief, ...rest } = args
  const [methodology, fidelity] = await Promise.all([
    dispatchCodex({ brief: methodologyBrief, ...rest }),
    dispatchCodex({ brief: fidelityBrief, ...rest }),
  ])
  const combined: CodexDecision = [methodology.decision, fidelity.decision].includes('disagree')
    ? 'disagree'
    : [methodology.decision, fidelity.decision].includes('split')
      ? 'split'
      : 'agree'
  return { methodology, fidelity, combined }
}

// ── Codex iteration cap (Path-2 cycle 5) ─────────────────────────────────
//
// The Path-1 lesson on 1.3 took 6 Codex rounds to reach AGREE — too many.
// MAX_CODEX_ITERATIONS_PER_LESSON caps how many cross_checked events a
// single lesson can accumulate before the orchestrator treats the next
// cross-check as a generator-quality signal rather than "Codex doing extra
// work". When the cap is exceeded, the recommended action is reprompting
// the generator with the accumulated issue list, or rebuilding the scene
// from scratch — not invoking Codex again.

/** Maximum Codex per-artifact cross-check iterations per lesson before
 *  surfacing a generator-quality flag. Path-2 cycle 5 / ADR 0019. */
export const MAX_CODEX_ITERATIONS_PER_LESSON = 3

/** Count prior cross_checked events for a lesson from the JSONL audit trail.
 *  (We read JSONL rather than DB so the cap works even when the migration
 *  hasn't been applied or the DB is offline. JSONL is the source of truth.) */
export function countPriorCrossChecks(courseSlug: string, lessonSlug: string): number {
  const path = resolve(process.cwd(), 'generated', courseSlug, 'review_events.jsonl')
  if (!existsSync(path)) return 0
  const lines = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim().length > 0)
  let n = 0
  for (const line of lines) {
    try {
      const e = JSON.parse(line) as { lesson_slug?: string; to_status?: string }
      if (e.lesson_slug === lessonSlug && e.to_status === 'cross_checked') n++
    } catch {
      /* skip malformed line */
    }
  }
  return n
}

/** Dispatch options that include the iteration-cap check. Returns either the
 *  Codex verdict or a synthetic 'cap_exceeded' result that the caller can
 *  treat as a generator-quality flag (no actual Codex invocation happens). */
export type CappedDispatchResult =
  | { kind: 'verdict'; verdict: CodexVerdict; priorCrossChecks: number }
  | { kind: 'cap_exceeded'; priorCrossChecks: number; cap: number }

/** Dispatch Codex with the iteration cap enforced. If the lesson has already
 *  accumulated MAX_CODEX_ITERATIONS_PER_LESSON cross_checked events, refuses
 *  to dispatch and surfaces a generator-quality flag instead. */
export async function dispatchCodexWithCap(
  args: { brief: string; courseSlug: string; lessonSlug: string; cap?: number } & DispatchOptions,
): Promise<CappedDispatchResult> {
  const { courseSlug, lessonSlug, cap = MAX_CODEX_ITERATIONS_PER_LESSON, brief, ...rest } = args
  const priorCrossChecks = countPriorCrossChecks(courseSlug, lessonSlug)
  if (priorCrossChecks >= cap) {
    return { kind: 'cap_exceeded', priorCrossChecks, cap }
  }
  const verdict = await dispatchCodex({ brief, ...rest })
  return { kind: 'verdict', verdict, priorCrossChecks }
}

// ── Event persistence ─────────────────────────────────────────────────────
//
// Writes a lesson_review_events row via the admin client (Path-2 cycle 3).
// JSONL append is intentionally kept as a separate concern — back-compat with
// the Path-1 file-based audit trail and useful when the DB is offline.

export type ReviewEventInput = {
  courseSlug: string
  lessonSlug: string
  fromStatus: string | null
  toStatus: string
  reviewer: string
  reviewerRole: string
  decision: string
  notes: string
  methodologyVersion: string
  outlineHash: string
  artifactHash: string
  createdAt?: string
}

export type ReviewEvent = ReviewEventInput & { eventId: string; createdAt: string }

/** Construct a fully-populated review event (assigns event_id + created_at). */
export function makeReviewEvent(input: ReviewEventInput): ReviewEvent {
  return {
    eventId: randomUUID(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    ...input,
  }
}

/** Persist a review event to both the JSONL audit trail and (best-effort) the
 *  lesson_review_events table. JSONL is the source of truth — the DB is a
 *  query-friendly mirror per ADR 0019. */
export async function appendReviewEvent(event: ReviewEvent, options: { jsonlOnly?: boolean } = {}): Promise<void> {
  // JSONL append — always.
  const jsonlPath = resolve(process.cwd(), 'generated', event.courseSlug, 'review_events.jsonl')
  if (!existsSync(dirname(jsonlPath))) mkdirSync(dirname(jsonlPath), { recursive: true })
  appendFileSync(
    jsonlPath,
    JSON.stringify({
      event_id: event.eventId,
      lesson_slug: event.lessonSlug,
      from_status: event.fromStatus,
      to_status: event.toStatus,
      reviewer: event.reviewer,
      reviewer_role: event.reviewerRole,
      decision: event.decision,
      notes: event.notes,
      methodology_version: event.methodologyVersion,
      outline_hash: event.outlineHash,
      artifact_hash: event.artifactHash,
      created_at: event.createdAt,
    }) + '\n',
    'utf8',
  )
  if (options.jsonlOnly) return

  // DB upsert — best effort. If the table doesn't exist yet (migration not
  // applied), silently fall back to JSONL-only. Caller can verify with a
  // count check later. We use dynamic import to avoid pulling in supabase in
  // contexts that don't have env vars (e.g. local dev without .env.local).
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { error } = await admin.from('lesson_review_events').upsert(
      {
        event_id: event.eventId,
        course_slug: event.courseSlug,
        lesson_slug: event.lessonSlug,
        from_status: event.fromStatus,
        to_status: event.toStatus,
        reviewer: event.reviewer,
        reviewer_role: event.reviewerRole,
        decision: event.decision,
        notes: event.notes,
        methodology_version: event.methodologyVersion,
        outline_hash: event.outlineHash,
        artifact_hash: event.artifactHash,
        created_at: event.createdAt,
      },
      { onConflict: 'event_id', ignoreDuplicates: false },
    )
    if (error) {
      process.stderr.write(
        `appendReviewEvent: DB upsert failed (JSONL append still succeeded): ${error.message}\n`,
      )
    }
  } catch (err) {
    process.stderr.write(
      `appendReviewEvent: DB unavailable (JSONL append still succeeded): ${(err as Error).message}\n`,
    )
  }
}
