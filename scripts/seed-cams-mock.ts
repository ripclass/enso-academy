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
// NOTE on faithfulness (verified 2026-07-04 against the OFFICIAL current CAMS
// Candidate Handbook, acams.org/en/media/document/6341, retrieved directly):
// 120 "multiple choice and multiple selection" questions / 3.5 hours, domains
// A 30% / B 20% / C 30% / D 20% — all confirmed verbatim, so the split below
// (36/24/36/24) is exact; the old Domain-B 24-vs-30 operator check is CLOSED.
// The handbook states "the passing score ... is 75" with no unit; candidate
// Pearson VUE score reports denominate it in scaled-score units (~62.5% raw by
// the team's estimate), so pass_score_percent below is only a conservative
// readiness target and the results page presents a readiness BAND
// (lib/mock/readiness-band.ts), not a raw pass/fail headline. No official
// multi-response proportion is published; the 12-item (~10%) slice is a
// product choice.

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
  /** Approx. number of multiple-response items the exam should include. */
  multiResponseCount: number
  /**
   * 'simulation' = the full, exam-faithful, ENTITLEMENT-GATED product (1 free
   * taste, then purchased / course-included attempts). 'mock' = a short, FREE,
   * UNLIMITED practice exam, available only to enrolled course owners (no
   * attempt is consumed). The ethical line: we only charge for the genuine
   * full-length simulation; practice is free with the course.
   */
  kind: 'simulation' | 'mock'
  metadata: Record<string, unknown>
}

// Domain weighting 30 / 20 / 30 / 20 (AFC blueprint), scaled to each length.
// THE PAID PRODUCT — a genuine simulation: 120 items / 3.5 hours, exactly the
// real CAMS exam length and blueprint.
const FULL_SIM: TemplateDef = {
  name: 'CAMS Full Exam Simulation',
  sortOrder: 1,
  questionCount: 120,
  timeLimitMinutes: 210, // 3.5 hours — matches the real ACAMS exam
  passScorePercent: 75,
  byDomain: { [DOMAIN_A]: 36, [DOMAIN_B]: 24, [DOMAIN_C]: 36, [DOMAIN_D]: 24 },
  multiResponseCount: 12, // ≈10%; no official proportion published (handbook confirms the format only)
  kind: 'simulation',
  metadata: {
    faithful: true,
    blueprint: 'AFC A30/B20/C30/D20',
    note: 'Full-length exact simulation (120 q / 3.5 h). Pass mark is a conservative readiness target (75% raw; the real exam is 75 scaled ≈ 62.5% raw).',
    includes_multiple_response: true,
  },
}

// FREE practice for enrolled course owners — short and unlimited. NOT charged.
// Deliberately small so it is clearly practice, not the simulation.
const PRACTICE_MOCK: TemplateDef = {
  name: 'CAMS Practice Mock',
  sortOrder: 2,
  questionCount: 25,
  timeLimitMinutes: 30,
  passScorePercent: 70,
  byDomain: { [DOMAIN_A]: 8, [DOMAIN_B]: 5, [DOMAIN_C]: 7, [DOMAIN_D]: 5 },
  multiResponseCount: 2,
  kind: 'mock',
  metadata: { practice: true, blueprint: 'AFC A30/B20/C30/D20', free_unlimited_for_enrolled: true },
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

  // Remove the superseded half-length diagnostic if it exists (renamed to mock).
  await admin
    .from('mock_exam_templates')
    .delete()
    .eq('course_id', course.id)
    .eq('name', 'CAMS Diagnostic (Half-Length)')

  for (const t of [FULL_SIM, PRACTICE_MOCK]) {
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
      selection_criteria: { by_domain: t.byDomain, multi_response_count: t.multiResponseCount, kind: t.kind },
      is_published: true,
      metadata: t.metadata,
    })
    if (ie) throw new Error(`Failed to insert template "${t.name}": ${ie.message}`)
    const total = Object.values(t.byDomain).reduce((s, n) => s + n, 0)
    console.log(`Seeded "${t.name}" [${t.kind}] — ${t.questionCount} q / ${t.timeLimitMinutes} min / pass ${t.passScorePercent}% (domain sum ${total})`)
  }

  console.log('\nDone. Faithful CAMS mock template(s) seeded and published.')
}

main().catch((err) => {
  console.error('seed-cams-mock failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
