import { createAdminClient } from '@/lib/supabase/admin'
import type { QuizSceneData, QuizQuestion } from '@/lib/lesson/scenes'

/**
 * The session warm-up: a short retrieval round served BEFORE a lesson's new
 * material, assembled at render from the student model. Retrieval practice on
 * decaying knowledge is the highest-leverage rep in learning science, so the
 * warm-up targets the student's weakest concepts that have actual evidence
 * behind them (observed at least once, mastery lowest first) and quizzes them
 * from the course question bank.
 *
 * Returns null when there is nothing honest to warm up: a brand-new student
 * has no observed concepts, and a student with no matching bank questions
 * gets no filler. No warm-up is better than a fake one.
 */
export async function getLessonWarmup(opts: {
  userId: string
  courseId: string
}): Promise<QuizSceneData | null> {
  const admin = createAdminClient()

  // The student's weakest observed concepts (evidence-backed, lowest mastery).
  const { data: weak } = await admin
    .from('student_knowledge_state')
    .select('concept_tag, mastery_probability, observation_count')
    .eq('student_id', opts.userId)
    .eq('course_id', opts.courseId)
    .gte('observation_count', 1)
    .order('mastery_probability', { ascending: true })
    .limit(8)
  const concepts = (weak ?? []).map((w) => w.concept_tag)
  if (concepts.length < 2) return null

  // Quiz-eligible single-answer bank questions touching those concepts.
  const { data: bank } = await admin
    .from('question_bank')
    .select('id, question_text, options, correct_answer, explanation, concept_tags')
    .eq('course_id', opts.courseId)
    .eq('eligible_for_quiz', true)
    .overlaps('concept_tags', concepts)
    .limit(40)
  if (!bank || bank.length === 0) return null

  // Prefer one question per weak concept, weakest first; single-answer only.
  const questions: QuizQuestion[] = []
  const usedIds = new Set<string>()
  for (const concept of concepts) {
    if (questions.length >= 3) break
    const row = bank.find(
      (q) =>
        !usedIds.has(q.id) &&
        (q.concept_tags ?? []).includes(concept) &&
        typeof q.correct_answer === 'string' &&
        Array.isArray(q.options),
    )
    if (!row) continue
    const options = (row.options as { id: string; text: string }[]).filter(
      (o) => o && typeof o.id === 'string' && typeof o.text === 'string',
    )
    if (options.length < 2 || !options.some((o) => o.id === row.correct_answer)) continue
    usedIds.add(row.id)
    questions.push({
      prompt: row.question_text,
      options,
      correctOptionId: row.correct_answer as string,
      explanation: row.explanation ?? '',
      conceptTags: row.concept_tags ?? [],
    })
  }
  if (questions.length < 2) return null

  return {
    intro:
      'Before the new material: a short warm-up on the concepts your record says are slipping. These are yours, picked from your own past answers.',
    questions,
  }
}
