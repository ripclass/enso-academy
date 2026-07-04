'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Desk Mix — the anti-"lesson arc" practice mode.
 *
 * The simulator trains reasoning inside a well-framed lesson; the exam
 * delivers concepts mixed, time-boxed, and stripped of scaffolding. Desk Mix
 * closes that transfer gap: a short block of committed decisions drawn from
 * ACROSS the course's domains, in no narrative order, with the domain and
 * concept revealed only AFTER the student commits (interleaving; Kornell &
 * Bjork's desirable difficulty). Half the set is biased to the student's
 * weakest observed concepts; the rest is drawn wide so strong areas stay warm.
 */

export type DeskMixQuestion = {
  id: string
  prompt: string
  options: { id: string; text: string }[]
  correctOptionId: string
  explanation: string
  conceptTags: string[]
  domain: string | null
}

const MIX_SIZE = 8

export async function startDeskMix(
  courseSlug: string,
): Promise<{ courseId: string; courseName: string; questions: DeskMixQuestion[] } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('id, name')
    .eq('slug', courseSlug)
    .single()
  if (!course) return null

  // Enrolled students only — the mix draws on the full question bank.
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()
  if (!enrollment) return null

  // The student's repair targets: the error ledger first (repeat misses),
  // then lowest mastery. "Same trap, new facts": the ledger's concepts get
  // resurfaced in fresh questions rather than replayed.
  const { data: weak } = await admin
    .from('student_knowledge_state')
    .select('concept_tag, mastery_probability, incorrect_count')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .gte('observation_count', 1)
    .order('mastery_probability', { ascending: true })
    .limit(24)
  const weakConcepts = [...(weak ?? [])]
    .sort(
      (a, b) =>
        Number(b.incorrect_count ?? 0) - Number(a.incorrect_count ?? 0) ||
        Number(a.mastery_probability) - Number(b.mastery_probability),
    )
    .slice(0, 6)
    .map((w) => w.concept_tag)

  // A wide random-ish pool: quiz-eligible, single-answer, across domains.
  const { data: bank } = await admin
    .from('question_bank')
    .select('id, question_text, options, correct_answer, explanation, concept_tags, domain')
    .eq('course_id', course.id)
    .eq('eligible_for_quiz', true)
    .limit(400)
  if (!bank || bank.length === 0) return null

  const usable = bank.filter(
    (q) =>
      typeof q.correct_answer === 'string' &&
      Array.isArray(q.options) &&
      (q.options as unknown[]).length >= 3 &&
      (q.options as { id?: unknown }[]).every((o) => typeof o?.id === 'string') &&
      (q.options as { id: string }[]).some((o) => o.id === q.correct_answer),
  )
  if (usable.length < MIX_SIZE) return null

  const shuffled = [...usable].sort(() => Math.random() - 0.5)
  const picked: typeof usable = []
  const usedIds = new Set<string>()

  // Up to half the mix targets weak concepts (at most one question each).
  for (const concept of weakConcepts) {
    if (picked.length >= MIX_SIZE / 2) break
    const row = shuffled.find(
      (q) => !usedIds.has(q.id) && (q.concept_tags ?? []).includes(concept),
    )
    if (row) {
      picked.push(row)
      usedIds.add(row.id)
    }
  }

  // Fill the rest wide: prefer domains not yet represented, then anything.
  for (const preferNewDomain of [true, false]) {
    for (const q of shuffled) {
      if (picked.length >= MIX_SIZE) break
      if (usedIds.has(q.id)) continue
      if (preferNewDomain && q.domain && picked.some((p) => p.domain === q.domain)) continue
      picked.push(q)
      usedIds.add(q.id)
    }
  }

  // Final order: shuffled again so the weak-concept reps don't cluster first.
  const questions: DeskMixQuestion[] = picked
    .sort(() => Math.random() - 0.5)
    .slice(0, MIX_SIZE)
    .map((q) => ({
      id: q.id,
      prompt: q.question_text,
      options: (q.options as { id: string; text: string }[]).map((o) => ({
        id: o.id,
        text: o.text,
      })),
      correctOptionId: q.correct_answer as string,
      explanation: q.explanation ?? '',
      conceptTags: q.concept_tags ?? [],
      domain: q.domain,
    }))

  return { courseId: course.id, courseName: course.name, questions }
}
