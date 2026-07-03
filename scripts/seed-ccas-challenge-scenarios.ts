// scripts/seed-ccas-challenge-scenarios.ts
//
// Publishes the CCAS "Apply it" scenario bank (lib/cases/ccas-scenario-bank.ts)
// into challenge_scenarios (course_id = ccas). getLessonChallenge serves CCAS
// purely from the DB, so this is how CCAS scenarios reach students. Idempotent:
// upserts by id, safe to re-run after editing the bank.
//
//   pnpm tsx scripts/seed-ccas-challenge-scenarios.ts

import { config } from 'dotenv'
config({ path: '.env.local' })

import { readFileSync } from 'node:fs'
import { createAdminClient } from '../lib/supabase/admin'
import { CCAS_SCENARIO_BANK } from '../lib/cases/ccas-scenario-bank'
import type { ChallengeScenario } from '../lib/cases/scenario-bank'

async function main() {
  const db = createAdminClient()

  const { data: course, error: cErr } = await db
    .from('courses')
    .select('id')
    .eq('slug', 'ccas')
    .single()
  if (cErr || !course) throw new Error(`ccas course not found: ${cErr?.message ?? 'no row'}`)
  const courseId = (course as { id: string }).id

  // Seed both sources: the typed pilot/Module-1 bank plus the JSON rollout
  // (Modules 2, 4-10), deduped by id.
  const rollout = JSON.parse(
    readFileSync('lib/cases/ccas-rollout-scenarios.json', 'utf8'),
  ) as ChallengeScenario[]
  const byId = new Map<string, ChallengeScenario>()
  for (const s of CCAS_SCENARIO_BANK) byId.set(s.id, s)
  for (const s of rollout) byId.set(s.id, s)

  const now = new Date().toISOString()
  const rows = [...byId.values()].map((s, i) => ({
    id: s.id,
    course_id: courseId,
    mechanic: s.mechanic,
    title: s.title,
    concept_tags: s.conceptTags,
    spec: s.spec,
    sort_order: i,
    updated_at: now,
  }))

  const { error } = await db.from('challenge_scenarios').upsert(rows, { onConflict: 'id' })
  if (error) throw error
  console.log(`Seeded ${rows.length} CCAS challenge scenarios for ccas (${courseId}).`)

  const { count, error: cntErr } = await db
    .from('challenge_scenarios')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId)
  if (cntErr) throw cntErr
  console.log(`challenge_scenarios for ccas now holds ${count} row(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
