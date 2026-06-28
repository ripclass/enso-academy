// scripts/seed-challenge-scenarios.ts
//
// Publishes the typed in-code scenario bank (lib/cases/scenario-bank.ts) into
// the challenge_scenarios table, so the "Apply it" round is DB-served (scenarios
// can be added or edited via SQL without a deploy). Idempotent: upserts by id,
// so it is safe to re-run after editing the in-code bank.
//
//   pnpm tsx scripts/seed-challenge-scenarios.ts
//
// The in-code bank stays the seed source AND a runtime floor (getLessonChallenge
// unions DB rows over it, DB winning by id), so coverage never regresses.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createAdminClient } from '../lib/supabase/admin'
import { SCENARIO_BANK } from '../lib/cases/scenario-bank'

async function main() {
  const db = createAdminClient()

  const { data: course, error: cErr } = await db
    .from('courses')
    .select('id')
    .eq('slug', 'cams')
    .single()
  if (cErr || !course) throw new Error(`cams course not found: ${cErr?.message ?? 'no row'}`)
  const courseId = (course as { id: string }).id

  const now = new Date().toISOString()
  const rows = SCENARIO_BANK.map((s, i) => ({
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
  console.log(`Seeded ${rows.length} challenge scenarios for cams (${courseId}).`)

  const { count, error: cntErr } = await db
    .from('challenge_scenarios')
    .select('*', { count: 'exact', head: true })
  if (cntErr) throw cntErr
  console.log(`challenge_scenarios now holds ${count} row(s).`)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
