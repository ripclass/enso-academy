'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordEvidence } from '@/lib/student-model/knowledge'

// A question as seen by the student — never includes the correct answer.
export type MockQuestion = {
  id: string
  question_text: string
  options: string[]
  domain: string
  difficulty: string
}

type StartMockResult = {
  attemptId: string
  templateName: string
  questions: MockQuestion[]
  timeLimitMinutes: number
}

type SubmitMockOptions = {
  attemptId: string
  answers: Record<string, string>
  flags: string[]
  navigationEvents: unknown[]
  focusBlurCount: number
  durationSeconds: number
}

type SubmitMockResult = {
  scorePercent: number
  correctCount: number
  incorrectCount: number
  skippedCount: number
  totalQuestions: number
  passed: boolean
}

type QbankResultRow = {
  correct_answer: string
  explanation: string | null
  wrong_answer_rationales: Record<string, string> | null
  question_text: string
  options: string[]
  domain: string
}

type AttemptResults = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attempt: any
  questions: MockQuestion[]
  qbankMap: Record<string, QbankResultRow>
  passScorePercent: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Start a mock exam: validate enrollment, select questions per the template's
 * by_domain criteria, shuffle, create an in_progress attempt with a snapshot.
 */
export async function startMockExam(templateId: string): Promise<StartMockResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  const { data: template } = await admin
    .from('mock_exam_templates')
    .select('id, course_id, name, question_count, time_limit_minutes, selection_criteria, is_published')
    .eq('id', templateId)
    .single()

  if (!template || !template.is_published) throw new Error('Mock template not found')

  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', template.course_id)
    .eq('status', 'active')
    .single()
  if (!enrollment) throw new Error('Not enrolled in this course')

  // Select questions per by_domain criteria: fetch each domain's pool, shuffle, take N.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byDomain: Record<string, number> = ((template.selection_criteria as any)?.by_domain) ?? {}
  const selected: MockQuestion[] = []

  for (const [domain, countRaw] of Object.entries(byDomain)) {
    const count = Number(countRaw)
    const { data: pool } = await admin
      .from('question_bank')
      .select('id, question_text, options, domain, difficulty')
      .eq('course_id', template.course_id)
      .eq('domain', domain)
      .eq('eligible_for_mock', true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const picked = shuffle((pool ?? []) as any[]).slice(0, count)
    for (const q of picked) {
      selected.push({
        id: q.id,
        question_text: q.question_text,
        options: (q.options as string[]) ?? [],
        domain: q.domain,
        difficulty: q.difficulty,
      })
    }
  }

  const questions = shuffle(selected)

  const { data: attempt, error } = await admin
    .from('mock_exam_attempts')
    .insert({
      student_id: user.id,
      course_id: template.course_id,
      template_id: template.id,
      status: 'in_progress',
      total_questions: questions.length,
      questions_snapshot: questions,
    })
    .select('id')
    .single()

  if (error || !attempt) {
    throw new Error('Failed to start mock: ' + (error?.message ?? 'unknown'))
  }

  return {
    attemptId: attempt.id,
    templateName: template.name,
    questions,
    timeLimitMinutes: template.time_limit_minutes,
  }
}

/**
 * Submit a mock exam: grade against question_bank, compute by-domain scores,
 * persist the attempt snapshot, and re-evaluate student readiness.
 */
export async function submitMockExam(opts: SubmitMockOptions): Promise<SubmitMockResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  const { data: attempt } = await admin
    .from('mock_exam_attempts')
    .select('id, student_id, course_id, template_id, status, questions_snapshot')
    .eq('id', opts.attemptId)
    .single()

  if (!attempt || attempt.student_id !== user.id) throw new Error('Attempt not found')
  if (attempt.status !== 'in_progress') throw new Error('This mock has already been submitted')

  const snapshot = (attempt.questions_snapshot as MockQuestion[]) ?? []
  const questionIds = snapshot.map((q) => q.id)

  const { data: qbankRows } = await admin
    .from('question_bank')
    .select('id, correct_answer, domain, concept_tags')
    .in('id', questionIds)

  const correctMap = new Map<string, string>()
  const domainMap = new Map<string, string>()
  const conceptMap = new Map<string, string[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (qbankRows ?? []) as any[]) {
    correctMap.set(row.id, row.correct_answer as string)
    domainMap.set(row.id, row.domain)
    conceptMap.set(row.id, (row.concept_tags as string[]) ?? [])
  }

  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0
  const domainTally: Record<string, { correct: number; total: number }> = {}

  for (const q of snapshot) {
    const domain = domainMap.get(q.id) ?? q.domain
    if (!domainTally[domain]) domainTally[domain] = { correct: 0, total: 0 }
    domainTally[domain].total += 1

    const studentAnswer = opts.answers[q.id]
    if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') {
      skippedCount += 1
      continue
    }
    if (studentAnswer === correctMap.get(q.id)) {
      correctCount += 1
      domainTally[domain].correct += 1
    } else {
      incorrectCount += 1
    }
  }

  const total = snapshot.length
  const scorePercent = total > 0 ? round2((correctCount / total) * 100) : 0

  const byDomainScores: Record<string, { correct: number; total: number; percent: number }> = {}
  for (const [domain, t] of Object.entries(domainTally)) {
    byDomainScores[domain] = {
      correct: t.correct,
      total: t.total,
      percent: t.total > 0 ? round2((t.correct / t.total) * 100) : 0,
    }
  }

  const { data: template } = await admin
    .from('mock_exam_templates')
    .select('pass_score_percent')
    .eq('id', attempt.template_id)
    .single()
  const passThreshold = Number(template?.pass_score_percent ?? 75)
  const passed = scorePercent >= passThreshold

  await admin
    .from('mock_exam_attempts')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      duration_seconds: opts.durationSeconds,
      total_questions: total,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      score_percent: scorePercent,
      by_domain_scores: byDomainScores,
      answers: opts.answers,
      flags: opts.flags,
      navigation_events: opts.navigationEvents,
      focus_blur_events: opts.focusBlurCount,
    })
    .eq('id', attempt.id)

  await updateReadiness(user.id, attempt.course_id, admin, attempt.id)

  // Feed the student knowledge model: one observation per answered question.
  for (const q of snapshot) {
    const studentAnswer = opts.answers[q.id]
    if (studentAnswer === undefined || studentAnswer === null || studentAnswer === '') continue
    const conceptTags = conceptMap.get(q.id) ?? []
    if (conceptTags.length === 0) continue
    await recordEvidence({
      studentId: user.id,
      courseId: attempt.course_id,
      conceptTags,
      evidence: studentAnswer === correctMap.get(q.id) ? 'correct' : 'incorrect',
    })
  }

  return {
    scorePercent,
    correctCount,
    incorrectCount,
    skippedCount,
    totalQuestions: total,
    passed,
  }
}

/**
 * Re-evaluate student_readiness from the last 5 submitted attempts.
 * Writes a signoff_event when the readiness status transitions.
 * v1 thresholds: ready = count>=5, avg>=80, min>=70, weakest>=65;
 *                approaching = count>=3, avg>=70; else not_ready.
 */
async function updateReadiness(
  studentId: string,
  courseId: string,
  admin: ReturnType<typeof createAdminClient>,
  triggeredByAttemptId: string,
) {
  const { data: recent } = await admin
    .from('mock_exam_attempts')
    .select('id, score_percent, by_domain_scores')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'submitted')
    .order('submitted_at', { ascending: false })
    .limit(5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attempts = (recent ?? []) as any[]

  const { count: totalSubmitted } = await admin
    .from('mock_exam_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('status', 'submitted')

  const mockCount = totalSubmitted ?? attempts.length

  const scores = attempts.map((a) => Number(a.score_percent ?? 0))
  const average = scores.length > 0 ? scores.reduce((s, x) => s + x, 0) / scores.length : 0
  const minimum = scores.length > 0 ? Math.min(...scores) : 0

  const domainAgg: Record<string, { sum: number; n: number }> = {}
  for (const a of attempts) {
    const bd = (a.by_domain_scores as Record<string, { percent: number }>) ?? {}
    for (const [domain, v] of Object.entries(bd)) {
      if (!domainAgg[domain]) domainAgg[domain] = { sum: 0, n: 0 }
      domainAgg[domain].sum += Number(v?.percent ?? 0)
      domainAgg[domain].n += 1
    }
  }
  let weakestDomain: string | null = null
  let weakestScore: number | null = null
  for (const [domain, agg] of Object.entries(domainAgg)) {
    const avg = agg.n > 0 ? agg.sum / agg.n : 0
    if (weakestScore === null || avg < weakestScore) {
      weakestScore = avg
      weakestDomain = domain
    }
  }

  let status: 'not_ready' | 'approaching' | 'ready' = 'not_ready'
  if (
    mockCount >= 5 && average >= 80 && minimum >= 70 &&
    (weakestScore === null || weakestScore >= 65)
  ) {
    status = 'ready'
  } else if (mockCount >= 3 && average >= 70) {
    status = 'approaching'
  }

  const criteriaMet = {
    mock_count: mockCount,
    average_score: round2(average),
    minimum_score: round2(minimum),
    weakest_domain: weakestDomain,
    weakest_domain_score: weakestScore === null ? null : round2(weakestScore),
    thresholds: {
      ready: 'count>=5, avg>=80, min>=70, weakest>=65',
      approaching: 'count>=3, avg>=70',
    },
  }

  const { data: prior } = await admin
    .from('student_readiness')
    .select('status')
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .maybeSingle()
  const priorStatus: string | null = prior?.status ?? null

  await admin
    .from('student_readiness')
    .upsert(
      {
        student_id: studentId,
        course_id: courseId,
        status,
        mock_count: mockCount,
        average_score: round2(average),
        minimum_score: round2(minimum),
        weakest_domain: weakestDomain,
        weakest_domain_score: weakestScore === null ? null : round2(weakestScore),
        criteria_met: criteriaMet,
        last_evaluated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,course_id' },
    )

  if (priorStatus !== status) {
    await admin.from('signoff_events').insert({
      student_id: studentId,
      course_id: courseId,
      from_status: priorStatus,
      to_status: status,
      triggered_by_attempt_id: triggeredByAttemptId,
      criteria_snapshot: criteriaMet,
    })
  }
}

/**
 * Fetch a submitted attempt plus the question_bank answers/explanations
 * needed to render the per-question review on the results page.
 */
export async function getAttemptResults(attemptId: string): Promise<AttemptResults> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  const { data: attempt } = await admin
    .from('mock_exam_attempts')
    .select('*')
    .eq('id', attemptId)
    .single()

  if (!attempt || attempt.student_id !== user.id) throw new Error('Attempt not found')

  const { data: template } = await admin
    .from('mock_exam_templates')
    .select('pass_score_percent')
    .eq('id', attempt.template_id)
    .single()
  const passScorePercent = Number(template?.pass_score_percent ?? 75)

  const snapshot = (attempt.questions_snapshot as MockQuestion[]) ?? []
  const questionIds = snapshot.map((q) => q.id)

  const { data: qbankRows } = await admin
    .from('question_bank')
    .select('id, question_text, options, correct_answer, explanation, wrong_answer_rationales, domain')
    .in('id', questionIds)

  const qbankMap: Record<string, QbankResultRow> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (qbankRows ?? []) as any[]) {
    qbankMap[row.id] = {
      correct_answer: row.correct_answer as string,
      explanation: row.explanation,
      wrong_answer_rationales: row.wrong_answer_rationales as Record<string, string> | null,
      question_text: row.question_text,
      options: (row.options as string[]) ?? [],
      domain: row.domain,
    }
  }

  return { attempt, questions: snapshot, qbankMap, passScorePercent }
}
