// scripts/backfill-review-events.ts
// Path 2 cycle 3 — ingest the per-course review_events.jsonl audit trail into
// the public.lesson_review_events table. Idempotent on event_id (upserts).
//
// Usage:
//   pnpm tsx scripts/backfill-review-events.ts <course-slug>
//
// Reads generated/<course-slug>/review_events.jsonl and inserts each row into
// lesson_review_events. Re-running is safe — event_id is the primary key and
// the upsert is a no-op for existing rows. Reports per-event status so a
// partial run is debuggable.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { createAdminClient } from '../lib/supabase/admin'

type ReviewEvent = {
  event_id: string
  lesson_slug: string
  from_status: string | null
  to_status: string
  reviewer: string
  reviewer_role: string
  decision: string
  notes: string
  methodology_version: string
  outline_hash: string
  artifact_hash: string
  created_at: string
}

function die(msg: string): never {
  process.stderr.write(`backfill-review-events: ${msg}\n`)
  process.exit(1)
}

async function main(): Promise<void> {
  const courseSlug = process.argv[2]
  if (!courseSlug) die('usage: backfill-review-events <course-slug>')

  const path = resolve(process.cwd(), 'generated', courseSlug, 'review_events.jsonl')
  if (!existsSync(path)) die(`audit trail file not found: ${path}`)

  const lines = readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) die(`audit trail file is empty: ${path}`)

  const events: ReviewEvent[] = lines.map((line, i) => {
    try {
      return JSON.parse(line) as ReviewEvent
    } catch (err) {
      die(`line ${i + 1} is not valid JSON: ${(err as Error).message}`)
    }
  })

  const admin = createAdminClient()

  const rows = events.map((e) => ({
    event_id: e.event_id,
    course_slug: courseSlug,
    lesson_slug: e.lesson_slug,
    from_status: e.from_status,
    to_status: e.to_status,
    reviewer: e.reviewer,
    reviewer_role: e.reviewer_role,
    decision: e.decision,
    notes: e.notes,
    methodology_version: e.methodology_version,
    outline_hash: e.outline_hash,
    artifact_hash: e.artifact_hash,
    created_at: e.created_at,
  }))

  // Upsert in a single batch — Postgres handles the conflict resolution per row.
  const { data, error } = await admin
    .from('lesson_review_events')
    .upsert(rows, { onConflict: 'event_id', ignoreDuplicates: false })
    .select('event_id')

  if (error) die(`upsert failed: ${error.message}`)

  process.stdout.write(
    `Backfilled ${data?.length ?? 0} event(s) into lesson_review_events (course_slug=${courseSlug}).\n`,
  )

  // Verify by counting rows for this course.
  const { count, error: countErr } = await admin
    .from('lesson_review_events')
    .select('*', { count: 'exact', head: true })
    .eq('course_slug', courseSlug)
  if (countErr) die(`count verify failed: ${countErr.message}`)
  process.stdout.write(`lesson_review_events now holds ${count} row(s) for course_slug=${courseSlug}.\n`)
}

main().catch((err) => die((err as Error).message ?? String(err)))
