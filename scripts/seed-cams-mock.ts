// scripts/seed-cams-mock.ts
//
// Seeds the FAITHFUL CAMS / AFC full-exam-simulation mock template(s) for the
// `cams` course. Idempotent: it deletes any template of the same name for the
// course, then inserts the current definition, so it is safe to re-run.
//
// Run AFTER the question bank has been promoted to the DB
// (`pnpm tsx scripts/generate-course.ts write`), because the mock pulls live
// rows from `question_bank` by domain at attempt time.
//
//   pnpm tsx scripts/seed-cams-mock.ts
//
// NOTE on faithfulness: the real exam's pass mark is SCALED (≈75% equivalent)
// and the exact multiple-response proportion should be confirmed against the
// current ACAMS candidate handbook. Those two values are the only operator
// checks; the structure (120 items / 210 min / A30·B20·C30·D20) is the AFC
// blueprint we have re-locked from the handbook.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createAdminClient } from '../lib/supabase/admin'

// These MUST exactly match the `domain` strings stored on question_bank rows.
const DOMAIN_A = 'A - Understanding the Risks and Methods of Financial Crime'
const DOMAIN_B = 'B - Global AFC Frameworks, Governance, and Regulations'
const DOMAIN_C = 'C - Building an Anti-Financial Crime Compliance Program'
const DOMAIN_D = 'D - Tools and Technologies to Fight Financial Crime'

type TemplateDef = {
  name: string
  sortOrder: number
  questionCount: number
  timeLimitMinutes: number
  passScorePercent: number
  byDomain: Record<string, number>
  metadata: Record<string, unknown>
}

// Domain weighting 30 / 20 / 30 / 20 (AFC blueprint), scaled to each length.
const FULL_SIM: TemplateDef = {
  name: 'CAMS Full Exam Simulation',
  sortOrder: 1,
  questionCount: 120,
  timeLimitMinutes: 210, // 3.5 hours
  passScorePercent: 75,
  byDomain: { [DOMAIN_A]: 36, [DOMAIN_B]: 24, [DOMAIN_C]: 36, [DOMAIN_D]: 24 },
  metadata: {
    faithful: true,
    blueprint: 'AFC A30/B20/C30/D20',
    note: 'Full-length exact simulation. Pass mark scaled ≈75%; confirm vs current ACAMS handbook.',
    includes_multiple_response: true,
  },
}

// A shorter diagnostic for the freemium funnel (same weighting, half length).
const DIAGNOSTIC: TemplateDef = {
  name: 'CAMS Diagnostic (Half-Length)',
  sortOrder: 2,
  questionCount: 60,
  timeLimitMinutes: 105,
  passScorePercent: 75,
  byDomain: { [DOMAIN_A]: 18, [DOMAIN_B]: 12, [DOMAIN_C]: 18, [DOMAIN_D]: 12 },
  metadata: { faithful: true, blueprint: 'AFC A30/B20/C30/D20', diagnostic: true },
}

async function main() {
  const admin = createAdminClient()

  const { data: course, error: ce } = await admin
    .from('courses')
    .select('id, slug, status')
    .eq('slug', 'cams')
    .single()
  if (ce || !course) {
    throw new Error('cams course not found — run generate-course.ts write first. ' + (ce?.message ?? ''))
  }
  console.log(`Found cams course ${course.id} (status: ${course.status})`)

  // Report bank coverage per domain so the operator sees whether a faithful
  // mock can actually be assembled without exhausting any domain pool.
  for (const dom of [DOMAIN_A, DOMAIN_B, DOMAIN_C, DOMAIN_D]) {
    const { count } = await admin
      .from('question_bank')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', course.id)
      .eq('domain', dom)
      .eq('eligible_for_mock', true)
    console.log(`  ${dom[0]}: ${count ?? 0} mock-eligible questions`)
  }

  for (const t of [FULL_SIM, DIAGNOSTIC]) {
    await admin
      .from('mock_exam_templates')
      .delete()
      .eq('course_id', course.id)
      .eq('name', t.name)

    const { error: ie } = await admin.from('mock_exam_templates').insert({
      course_id: course.id,
      name: t.name,
      sort_order: t.sortOrder,
      question_count: t.questionCount,
      time_limit_minutes: t.timeLimitMinutes,
      pass_score_percent: t.passScorePercent,
      selection_criteria: { by_domain: t.byDomain },
      is_published: true,
      metadata: t.metadata,
    })
    if (ie) throw new Error(`Failed to insert template "${t.name}": ${ie.message}`)
    const total = Object.values(t.byDomain).reduce((s, n) => s + n, 0)
    console.log(`Seeded "${t.name}" — ${t.questionCount} q / ${t.timeLimitMinutes} min / pass ${t.passScorePercent}% (domain sum ${total})`)
  }

  console.log('\nDone. Faithful CAMS mock template(s) seeded and published.')
}

main().catch((err) => {
  console.error('seed-cams-mock failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
