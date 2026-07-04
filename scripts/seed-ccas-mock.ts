// scripts/seed-ccas-mock.ts
//
// Seeds the FAITHFUL CCAS full-exam-simulation mock template(s) for the `ccas`
// course. Idempotent: it deletes any template of the same name for the course,
// then inserts the current definition, so it is safe to re-run.
//
// Run AFTER the CCAS question bank has been promoted to the DB
// (`COURSE_SLUG=ccas pnpm tsx scripts/generate-course.ts write`), because the
// mock pulls live rows from `question_bank` by domain at attempt time.
//
//   pnpm tsx scripts/seed-ccas-mock.ts
//
// Blueprint (verified 2026-07-04 against the OFFICIAL CCAS Candidate Handbook,
// acams.org/en/media/document/31416, retrieved directly; see
// generated/ccas/BLUEPRINT.md): 100 "multiple choice and multiple response"
// items / 175 minutes, domains I 30% / II 35% / III 35% — all confirmed
// verbatim. The handbook notes the exam "may include unscored questions" that
// are not identified (not simulated here; all 100 count). It states "the
// passing score ... is 75" with no unit; Pearson VUE score reports denominate
// it in scaled-score units (~62.5% raw by the team's estimate), so
// pass_score_percent below is only a conservative readiness target; the
// results page presents a readiness BAND (lib/mock/readiness-band.ts), not a
// raw pass/fail headline. No official multi-response proportion is published;
// the ~10% slice is a product choice.

import { config } from 'dotenv'
config({ path: '.env.local' })

import { createAdminClient } from '../lib/supabase/admin'

// These MUST exactly match the `domain` strings stored on question_bank rows.
const DOMAIN_1 = '1 - Cryptoassets and Blockchain'
const DOMAIN_2 = '2 - AML Foundations for Cryptoassets and Blockchain'
const DOMAIN_3 = '3 - Risk Management Programs for Cryptoassets and Blockchain'

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
   * UNLIMITED practice exam for enrolled course owners (no attempt is consumed).
   */
  kind: 'simulation' | 'mock'
  metadata: Record<string, unknown>
}

// THE PAID PRODUCT — a genuine simulation: 100 items / 175 min, exactly the real
// CCAS exam length and blueprint (domains 30 / 35 / 35).
const FULL_SIM: TemplateDef = {
  name: 'CCAS Full Exam Simulation',
  sortOrder: 1,
  questionCount: 100,
  timeLimitMinutes: 175, // matches the real ACAMS CCAS exam
  passScorePercent: 75,
  byDomain: { [DOMAIN_1]: 30, [DOMAIN_2]: 35, [DOMAIN_3]: 35 },
  multiResponseCount: 10, // ~10%; the CCAS exam includes select-all items
  kind: 'simulation',
  metadata: {
    faithful: true,
    blueprint: 'CCAS 30/35/35',
    note: 'Full-length exact simulation (100 q / 175 min). Pass mark is a conservative readiness target (75% raw); the real exam is 75 scaled (~62.5% raw), so the results page shows a scaled readiness band.',
    includes_multiple_response: true,
  },
}

// FREE practice for enrolled course owners — short and unlimited. NOT charged.
const PRACTICE_MOCK: TemplateDef = {
  name: 'CCAS Practice Mock',
  sortOrder: 2,
  questionCount: 25,
  timeLimitMinutes: 30,
  passScorePercent: 70,
  byDomain: { [DOMAIN_1]: 8, [DOMAIN_2]: 9, [DOMAIN_3]: 8 },
  multiResponseCount: 2,
  kind: 'mock',
  metadata: { practice: true, blueprint: 'CCAS 30/35/35', free_unlimited_for_enrolled: true },
}

async function main() {
  const admin = createAdminClient()

  const { data: course, error: ce } = await admin
    .from('courses')
    .select('id, slug, status')
    .eq('slug', 'ccas')
    .single()
  if (ce || !course) {
    throw new Error('ccas course not found — run generate-course.ts write first. ' + (ce?.message ?? ''))
  }
  console.log(`Found ccas course ${course.id} (status: ${course.status})`)

  // Report bank coverage per domain so the operator sees whether a faithful mock
  // can actually be assembled without exhausting any domain pool.
  for (const dom of [DOMAIN_1, DOMAIN_2, DOMAIN_3]) {
    const { count } = await admin
      .from('question_bank')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', course.id)
      .eq('domain', dom)
      .eq('eligible_for_mock', true)
    console.log(`  ${dom.split(' ')[0]}: ${count ?? 0} mock-eligible questions`)
  }

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

  console.log('\nDone. Faithful CCAS mock template(s) seeded and published.')
}

main().catch((err) => {
  console.error('seed-ccas-mock failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
