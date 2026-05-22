// lib/student-model/knowledge.ts
// Server-only. The student knowledge model — a per-concept mastery estimate.
//
// This is capability one of the framework ("the student model is real"). A
// "concept" is a concept_tag string from content / question_bank; mastery is
// a value in [0,1] stored in student_knowledge_state.mastery_probability.
//
// v1 update rule (see docs/decisions/0012-student-knowledge-model-v1.md):
//   lr = 1 / (observation_count + K),  K = 4
//   mastery_new = clamp(mastery_old + lr * (target - mastery_old), 0, 1)
// Early evidence moves the estimate more; it stabilises as observations grow.
// This is Bayesian-flavoured, not a full Bayesian Knowledge Tracing model —
// honest for v1, upgradeable once there is real student data to fit against.

import { createAdminClient } from '@/lib/supabase/admin'

export type EvidenceKind = 'correct' | 'incorrect' | 'lesson_completed'

const K = 4
const TARGET: Record<EvidenceKind, number> = {
  correct: 1.0,
  incorrect: 0.0,
  lesson_completed: 0.7,
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n))
const round4 = (n: number) => Math.round(n * 10000) / 10000
const titleize = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export type ConceptMastery = {
  conceptTag: string
  mastery: number
  observations: number
  bucket: 'strong' | 'developing' | 'weak' | 'unassessed'
}

export type MasterySummary = {
  concepts: ConceptMastery[]
  preamble: string // natural-language preamble for the AI lecturer; '' if no concepts
}

function bucketFor(observations: number, mastery: number): ConceptMastery['bucket'] {
  if (observations === 0) return 'unassessed'
  if (mastery >= 0.75) return 'strong'
  if (mastery >= 0.4) return 'developing'
  return 'weak'
}

/**
 * Record evidence about a student's grasp of one or more concepts.
 * Upserts a student_knowledge_state row per concept and applies the v1
 * update rule. Never throws — the student model is an enhancement; a failure
 * here must not break a mock submission or a lesson completion.
 */
export async function recordEvidence(opts: {
  studentId: string
  courseId: string
  conceptTags: string[]
  evidence: EvidenceKind
}): Promise<void> {
  const tags = [...new Set(opts.conceptTags.filter(Boolean))]
  if (tags.length === 0) return

  try {
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('student_knowledge_state')
      .select('concept_tag, mastery_probability, observation_count, correct_count, incorrect_count')
      .eq('student_id', opts.studentId)
      .eq('course_id', opts.courseId)
      .in('concept_tag', tags)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const byTag = new Map<string, any>(((existing ?? []) as any[]).map((r) => [r.concept_tag, r]))

    const target = TARGET[opts.evidence]
    const isQuiz = opts.evidence === 'correct' || opts.evidence === 'incorrect'
    const now = new Date().toISOString()

    const rows = tags.map((tag) => {
      const prior = byTag.get(tag)
      const priorMastery = prior ? Number(prior.mastery_probability) : 0.5
      const priorObs = prior ? Number(prior.observation_count) : 0
      const lr = 1 / (priorObs + K)
      const mastery = clamp01(priorMastery + lr * (target - priorMastery))
      const observationCount = priorObs + 1

      return {
        student_id: opts.studentId,
        course_id: opts.courseId,
        concept_tag: tag,
        mastery_probability: round4(mastery),
        confidence: round4(observationCount / (observationCount + K)),
        observation_count: observationCount,
        correct_count: Number(prior?.correct_count ?? 0) + (opts.evidence === 'correct' ? 1 : 0),
        incorrect_count: Number(prior?.incorrect_count ?? 0) + (opts.evidence === 'incorrect' ? 1 : 0),
        last_observed_at: now,
        ...(isQuiz ? { last_quiz_at: now } : {}),
        updated_at: now,
      }
    })

    await admin
      .from('student_knowledge_state')
      .upsert(rows, { onConflict: 'student_id,course_id,concept_tag' })
  } catch (err) {
    console.error('recordEvidence failed:', err)
  }
}

/**
 * Fetch the student's mastery for a set of concepts and build a
 * natural-language preamble for the AI lecturer. Never throws.
 */
export async function getMasterySummary(
  studentId: string,
  courseId: string,
  conceptTags: string[],
): Promise<MasterySummary> {
  const tags = [...new Set(conceptTags.filter(Boolean))]
  if (tags.length === 0) return { concepts: [], preamble: '' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[] = []
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('student_knowledge_state')
      .select('concept_tag, mastery_probability, observation_count')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .in('concept_tag', tags)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows = (data ?? []) as any[]
  } catch (err) {
    console.error('getMasterySummary failed:', err)
    return { concepts: [], preamble: '' }
  }

  const byTag = new Map(rows.map((r) => [r.concept_tag, r]))
  const concepts: ConceptMastery[] = tags.map((tag) => {
    const r = byTag.get(tag)
    const observations = r ? Number(r.observation_count) : 0
    const mastery = r ? Number(r.mastery_probability) : 0.5
    return { conceptTag: tag, mastery, observations, bucket: bucketFor(observations, mastery) }
  })

  const strong = concepts.filter((c) => c.bucket === 'strong').map((c) => titleize(c.conceptTag))
  const developing = concepts.filter((c) => c.bucket === 'developing').map((c) => titleize(c.conceptTag))
  const weak = concepts.filter((c) => c.bucket === 'weak').map((c) => titleize(c.conceptTag))

  const parts: string[] = []
  if (strong.length) parts.push(`has shown solid command of ${strong.join(', ')}`)
  if (developing.length) parts.push(`is still developing ${developing.join(', ')}`)
  if (weak.length) parts.push(`appears weak on ${weak.join(', ')}`)

  const preamble = parts.length
    ? `STUDENT KNOWLEDGE MODEL — for the concepts in this lesson, the student ${parts.join('; ')}.`
    : ''

  return { concepts, preamble }
}
