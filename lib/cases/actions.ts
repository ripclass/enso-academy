'use server'

// Case Mode -> the student model. When a signed-in student finishes a case,
// the result is recorded as per-domain evidence in the knowledge model
// (student_knowledge_state), the same model lessons and quizzes feed and the
// lecturer reads. So working cases genuinely moves the student's domain mastery,
// which is what the readiness signoff is built on. Anonymous play (the free
// taster) is a no-op: there is no account to attribute it to.
//
// The formal readiness status stays anchored to full faithful mocks by design;
// cases strengthen the underlying domain mastery rather than inflating the
// signoff.

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordEvidence } from '@/lib/student-model/knowledge'

// Case domain -> the knowledge-model concept(s) it exercises. Aligned with the
// course's typology vocabulary so cases reinforce the same concepts as lessons.
const DOMAIN_CONCEPTS: Record<string, string[]> = {
  'Trade finance': ['trade_based_money_laundering'],
  'Correspondent banking': ['correspondent_banking'],
  'PEP / private banking': ['politically_exposed_persons'],
  'PEP / complex structures': ['politically_exposed_persons', 'beneficial_ownership'],
  'MSB / virtual assets': ['virtual_assets'],
  'Cash-intensive business': ['cash_intensive_businesses'],
  'Transaction monitoring': ['transaction_monitoring'],
}

function conceptsFor(domain: string): string[] {
  return (
    DOMAIN_CONCEPTS[domain] ?? [domain.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')]
  )
}

export async function recordCaseResult(input: {
  courseSlug: string
  domain: string
  flagsCorrect: number
  flagsTotal: number
  screeningCorrect: number
  decisionCorrect: boolean
}): Promise<{ recorded: boolean }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { recorded: false }

    const admin = createAdminClient()
    const { data: course } = await admin
      .from('courses')
      .select('id')
      .eq('slug', input.courseSlug)
      .single()
    if (!course) return { recorded: false }

    const conceptTags = conceptsFor(input.domain)
    const base = { studentId: user.id, courseId: course.id, conceptTags }

    // Three judgments per case, each correct/incorrect evidence on the domain
    // concept(s). Sequential so each update sees the previous one.
    const flagsOk = input.flagsTotal > 0 && input.flagsCorrect / input.flagsTotal >= 0.75
    await recordEvidence({ ...base, evidence: flagsOk ? 'correct' : 'incorrect' })
    await recordEvidence({ ...base, evidence: input.screeningCorrect >= 1 ? 'correct' : 'incorrect' })
    await recordEvidence({ ...base, evidence: input.decisionCorrect ? 'correct' : 'incorrect' })

    return { recorded: true }
  } catch (err) {
    console.error('recordCaseResult failed:', err)
    return { recorded: false }
  }
}
