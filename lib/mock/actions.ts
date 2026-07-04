'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { recordEvidence } from '@/lib/student-model/knowledge'
import { consumeMockAttempt } from '@/lib/stripe/entitlements'
import { MOCK_PAYWALL, type MockOption, type MockQuestion } from './types'

type StartMockResult = {
  attemptId: string
  templateName: string
  questions: MockQuestion[]
  timeLimitMinutes: number
}

// Single answers are an option id string; multi-select answers are an array of ids.
type SubmitMockOptions = {
  attemptId: string
  answers: Record<string, string | string[]>
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
  // Single-answer types: an option id string. Multiple_choice: an array of ids.
  correct_answer: string | string[]
  explanation: string | null
  wrong_answer_rationales: Record<string, string> | null
  question_text: string
  options: MockOption[]
  question_type: string
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
 * Normalize a question_bank `options` value to `{ id, text }[]`, robust to both
 * the id-based generated format ({id,text} objects) and the legacy CDCS format
 * (plain option-text strings, for which the id IS the text).
 */
function normalizeOptions(raw: unknown): MockOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((o) => {
    if (o && typeof o === 'object' && 'id' in o && 'text' in o) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = o as any
      return { id: String(obj.id), text: String(obj.text) }
    }
    const text = String(o)
    return { id: text, text }
  })
}

/**
 * Grade one question. Returns true iff the student's answer is fully correct.
 * - single-answer types: exact id match.
 * - multiple_choice: all-or-nothing set equality (order-independent, dedup).
 * An empty / undefined answer is treated as not-correct by the caller as "skipped".
 */
function gradeAnswer(
  questionType: string,
  studentAnswer: string | string[] | undefined,
  correctAnswer: string | string[],
): boolean {
  if (questionType === 'multiple_choice') {
    const selected = new Set((Array.isArray(studentAnswer) ? studentAnswer : []).map(String))
    const correct = new Set((Array.isArray(correctAnswer) ? correctAnswer : [String(correctAnswer)]).map(String))
    if (selected.size !== correct.size) return false
    for (const id of correct) if (!selected.has(id)) return false
    return true
  }
  // single-answer: legacy text path works because correct_answer text === id.
  const ans = Array.isArray(studentAnswer) ? studentAnswer[0] : studentAnswer
  const correct = Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer
  return ans !== undefined && String(ans) === String(correct)
}

/** True when the student left a question unanswered (single empty or empty array). */
function isSkipped(studentAnswer: string | string[] | undefined): boolean {
  if (studentAnswer === undefined || studentAnswer === null) return true
  if (Array.isArray(studentAnswer)) return studentAnswer.length === 0
  return studentAnswer === ''
}

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const criteria = (template.selection_criteria as any) ?? {}
  // 'mock' = free, unlimited PRACTICE — a course benefit (no attempt consumed),
  // gated only by active enrollment. Anything else is the full SIMULATION, which
  // is entitlement-gated (1 free taste, then purchased / course-included).
  const isPractice = criteria.kind === 'mock'

  if (isPractice) {
    const { data: enrollment } = await admin
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', template.course_id)
      .eq('status', 'active')
      .maybeSingle()
    // Not enrolled → practice is not available; backstop (the UI only surfaces
    // practice to owners). Reuse MOCK_PAYWALL so the page routes to purchase.
    if (!enrollment) throw new Error(MOCK_PAYWALL)
  } else {
    // Autopsy gate: a full simulation does not unlock until the previous
    // simulation's misses have been classified (repeating mocks without an
    // autopsy is fluency theater). Applies only to attempts that carry the
    // kind marker (older attempts are grandfathered) and had wrong answers.
    const { data: lastSim } = await admin
      .from('mock_exam_attempts')
      .select('id, incorrect_count, metadata')
      .eq('student_id', user.id)
      .eq('course_id', template.course_id)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const lastMeta = (lastSim?.metadata ?? {}) as { kind?: string; autopsy?: unknown }
    if (
      lastSim &&
      lastMeta.kind === 'simulation' &&
      Number(lastSim.incorrect_count ?? 0) > 0 &&
      !lastMeta.autopsy
    ) {
      throw new Error(`AUTOPSY_REQUIRED:${lastSim.id}`)
    }
    // Entitlement-gated. The atomic consume_mock_attempt RPC is race-safe (it
    // increments `used` only when an attempt is available).
    const consumed = await consumeMockAttempt(user.id, template.course_id)
    if (!consumed) throw new Error(MOCK_PAYWALL)
  }

  // Selection criteria: per-domain counts (by_domain), plus an optional
  // multi_response_count that guarantees ~that many multiple-response items in
  // the exam (distributed across domains by their share) so the single/
  // multi-response mix is faithful to the real exam rather than left to chance.
  // 0 / absent = natural mix.
  const byDomain: Record<string, number> = criteria.by_domain ?? {}
  const domains = Object.entries(byDomain).map(([domain, c]) => ({ domain, count: Number(c) }))
  const totalCount = domains.reduce((s, d) => s + d.count, 0)
  const multiTarget = Number(criteria.multi_response_count ?? 0)

  // Largest-remainder allocation of the multi-response target across domains,
  // proportional to each domain's question count.
  const domainMulti: Record<string, number> = {}
  if (multiTarget > 0 && totalCount > 0) {
    const exact = domains.map((d) => ({ domain: d.domain, e: (multiTarget * d.count) / totalCount }))
    for (const x of exact) domainMulti[x.domain] = Math.floor(x.e)
    let allocated = Object.values(domainMulti).reduce((s, n) => s + n, 0)
    const byFrac = exact
      .map((x) => ({ domain: x.domain, frac: x.e - Math.floor(x.e) }))
      .sort((a, b) => b.frac - a.frac)
    for (let i = 0; allocated < multiTarget && i < byFrac.length; i++, allocated++) {
      domainMulti[byFrac[i].domain] += 1
    }
  }

  // Map a question_bank row to an answer-free MockQuestion (the snapshot is
  // stored AND returned to the browser, so it must never carry the answer).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toMock = (q: any): MockQuestion => {
    const metaCount = q.metadata?.select_count
    let selectCount = 1
    if (typeof metaCount === 'number' && metaCount > 0) selectCount = metaCount
    else if (q.question_type === 'multiple_choice') selectCount = Array.isArray(q.correct_answer) ? q.correct_answer.length : 1
    return {
      id: q.id,
      question_text: q.question_text,
      // Shuffle options per attempt so the answer position is not memorizable
      // on retakes. Grading is id-based, so display order does not affect scoring.
      options: shuffle(normalizeOptions(q.options)),
      domain: q.domain,
      difficulty: q.difficulty,
      question_type: q.question_type,
      select_count: selectCount,
    }
  }

  const selected: MockQuestion[] = []
  for (const { domain, count } of domains) {
    const { data: pool } = await admin
      .from('question_bank')
      .select('id, question_text, options, correct_answer, question_type, metadata, domain, difficulty')
      .eq('course_id', template.course_id)
      .eq('domain', domain)
      .eq('eligible_for_mock', true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all = (pool ?? []) as any[]
    const wantMulti = domainMulti[domain] ?? 0
    let picked: typeof all
    if (wantMulti > 0) {
      const multiPool = shuffle(all.filter((q) => q.question_type === 'multiple_choice'))
      const singlePool = shuffle(all.filter((q) => q.question_type !== 'multiple_choice'))
      const takeMulti = multiPool.slice(0, Math.min(wantMulti, multiPool.length))
      const takeSingle = singlePool.slice(0, Math.max(0, count - takeMulti.length))
      picked = [...takeMulti, ...takeSingle]
      if (picked.length < count) {
        // Backfill if a pool was short (e.g. fewer single-answer than needed).
        const leftover = [...multiPool.slice(takeMulti.length), ...singlePool.slice(takeSingle.length)]
        picked = picked.concat(leftover.slice(0, count - picked.length))
      }
      picked = shuffle(picked)
    } else {
      picked = shuffle(all).slice(0, count)
    }
    for (const q of picked) selected.push(toMock(q))
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
      metadata: { kind: isPractice ? 'mock' : 'simulation' },
    })
    .select('id')
    .single()

  if (error || !attempt) {
    // A simulation attempt was consumed above; best-effort refund so a failed
    // build does not silently burn the student's credit. Practice mocks consume
    // nothing, so there is nothing to refund.
    if (!isPractice) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
        const { data: ent } = await (admin as any)
          .from('mock_entitlements')
          .select('used')
          .eq('student_id', user.id)
          .eq('course_id', template.course_id)
          .maybeSingle()
        const usedNow = Number(ent?.used ?? 0)
        if (usedNow > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- types regenerate after migration apply
          await (admin as any)
            .from('mock_entitlements')
            .update({ used: usedNow - 1 })
            .eq('student_id', user.id)
            .eq('course_id', template.course_id)
        }
      } catch {
        // Swallow refund errors — don't shadow the original failure below.
      }
    }
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
    .select('id, correct_answer, question_type, domain, concept_tags')
    .in('id', questionIds)

  const correctMap = new Map<string, string | string[]>()
  const typeMap = new Map<string, string>()
  const domainMap = new Map<string, string>()
  const conceptMap = new Map<string, string[]>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (qbankRows ?? []) as any[]) {
    correctMap.set(row.id, row.correct_answer as string | string[])
    typeMap.set(row.id, row.question_type as string)
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
    if (isSkipped(studentAnswer)) {
      skippedCount += 1
      continue
    }
    const correctAnswer = correctMap.get(q.id)
    const questionType = typeMap.get(q.id) ?? q.question_type
    if (correctAnswer !== undefined && gradeAnswer(questionType, studentAnswer, correctAnswer)) {
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
    if (isSkipped(studentAnswer)) continue
    const conceptTags = conceptMap.get(q.id) ?? []
    if (conceptTags.length === 0) continue
    const correctAnswer = correctMap.get(q.id)
    const questionType = typeMap.get(q.id) ?? q.question_type
    const isCorrect =
      correctAnswer !== undefined && gradeAnswer(questionType, studentAnswer, correctAnswer)
    await recordEvidence({
      studentId: user.id,
      courseId: attempt.course_id,
      conceptTags,
      evidence: isCorrect ? 'correct' : 'incorrect',
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
 *
 * v2 model (conservative, anchored to the course pass mark P, default 75):
 *   ready       = >=5 mocks AND last 3 attempts all passed AND recent avg >= P+5
 *                 AND no recent attempt below P AND every domain >= P-5
 *                 AND no sharp recent decline.
 *   approaching = >=3 mocks AND recent avg >= P.
 *   else not_ready.
 * The bias is deliberate: hold at "approaching" rather than falsely call
 * "ready". criteria_met carries a human-readable `reason` for the UI.
 */
/**
 * The mock autopsy: after a full simulation, every miss gets classified before
 * the next simulation unlocks. Repeating mocks without an autopsy is fluency
 * theater; the classification turns lost points into named repair targets.
 * Returns the "next 3 repairs" derived from the classification.
 */
export async function submitMockAutopsy(
  attemptId: string,
  classifications: Record<string, string>,
): Promise<{ repairs: string[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()
  const { data: attempt } = await admin
    .from('mock_exam_attempts')
    .select('id, student_id, course_id, status, metadata, questions_snapshot, answers, by_domain_scores')
    .eq('id', attemptId)
    .single()
  if (!attempt || attempt.student_id !== user.id) throw new Error('Attempt not found')
  if (attempt.status !== 'submitted') throw new Error('Attempt not submitted')

  // Category counts drive the repair plan.
  const counts: Record<string, number> = {}
  for (const cat of Object.values(classifications)) {
    counts[cat] = (counts[cat] ?? 0) + 1
  }
  const total = Object.values(counts).reduce((s, n) => s + n, 0)

  // Weakest domain from this attempt, for the knowledge-gap repair target.
  const byDomain = (attempt.by_domain_scores ?? {}) as Record<string, { percent?: number }>
  let weakDomain: string | null = null
  let weakPct: number | null = null
  for (const [d, v] of Object.entries(byDomain)) {
    const pct = Number(v?.percent ?? 100)
    if (weakPct === null || pct < weakPct) {
      weakPct = pct
      weakDomain = d
    }
  }

  const REPAIR: Record<string, string> = {
    knowledge: weakDomain
      ? `Revisit the material: most misses were knowledge gaps. Re-study your weakest domain (${weakDomain}) and run a Desk Mix on it before the next simulation.`
      : 'Revisit the material: most misses were knowledge gaps. Re-study the weakest topics and run a Desk Mix before the next simulation.',
    misread: 'Slow the first read: you misread stems. On every question, restate what is being asked in your own words before looking at the options.',
    overthink: 'Trust the first disciplined read: you talked yourself out of correct answers. Answer, flag, and only revisit flagged questions with a concrete reason.',
    time: 'Run the pressure ladder: time cost you points. Do a Sprint (5 questions, 7 minutes) daily until pacing is automatic, then a Pace check.',
    confidence: 'Recalibrate: you were certain and wrong. In lessons and Desk Mix, keep answering with the confidence step and review every certain-but-wrong reveal twice.',
  }
  const repairs = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, n]) => `${REPAIR[cat] ?? 'Review these misses with a colleague.'} (${n} of ${total} misses)`)

  const metadata = {
    ...((attempt.metadata ?? {}) as Record<string, unknown>),
    autopsy: {
      classifications,
      repairs,
      completed_at: new Date().toISOString(),
    },
  }
  const { error } = await admin
    .from('mock_exam_attempts')
    .update({ metadata })
    .eq('id', attemptId)
  if (error) throw new Error('Failed to save autopsy: ' + error.message)

  return { repairs }
}

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

  // Anchor the model to the course's actual pass mark rather than hardcoded
  // numbers, so readiness scales if the pass standard changes.
  const { data: tpl } = await admin
    .from('mock_exam_templates')
    .select('pass_score_percent')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })
    .limit(1)
    .maybeSingle()
  const passMark = Number(tpl?.pass_score_percent ?? 75)
  const readyAvgTarget = passMark + 5 // margin above pass for exam-day variance
  const domainFloor = Math.max(0, passMark - 5)

  // attempts are most-recent-first. Consistency: a streak of recent passes,
  // not a single lucky run.
  let passStreak = 0
  for (const a of attempts) {
    if (Number(a.score_percent ?? 0) >= passMark) passStreak += 1
    else break
  }
  const mostRecent = attempts.length > 0 ? Number(attempts[0].score_percent ?? 0) : 0
  // A sharp recent drop is a warning even if the average still looks fine.
  const decliningSharply = attempts.length >= 2 && mostRecent < average - 8
  const allDomainsClear = weakestScore === null || weakestScore >= domainFloor

  // Calibration: lesson-decision confidence from the calibration layer. A
  // student who scores well while repeatedly CERTAIN-and-wrong is the exam's
  // most dangerous profile, so heavy overconfidence caps readiness at
  // "approaching" until the calibration recovers.
  const { data: confEvents } = await admin
    .from('session_events')
    .select('payload')
    .eq('student_id', studentId)
    .eq('event_type', 'decision_confidence')
    .contains('payload', { course_id: courseId })
    .order('occurred_at', { ascending: false })
    .limit(200)
  let certainCalls = 0
  let certainWrong = 0
  for (const e of confEvents ?? []) {
    const p = e.payload as { confidence?: string; correct?: boolean }
    if (p?.confidence === 'high') {
      certainCalls += 1
      if (p.correct === false) certainWrong += 1
    }
  }
  const overconfidenceRate = certainCalls >= 8 ? certainWrong / certainCalls : null
  const badlyOverconfident = overconfidenceRate !== null && overconfidenceRate > 0.25

  // READY is deliberately conservative — every condition must hold. We would
  // rather hold someone at "approaching" than tell them they are ready and be
  // wrong (the signoff is meant to mean something).
  let status: 'not_ready' | 'approaching' | 'ready' = 'not_ready'
  if (
    mockCount >= 5 &&
    passStreak >= 3 &&            // last 3 attempts all at/above pass
    average >= readyAvgTarget &&  // averaging comfortably above pass
    minimum >= passMark &&        // no recent attempt below the pass line
    allDomainsClear &&            // no domain dragging risk
    !decliningSharply &&          // not on a downward slide
    !badlyOverconfident           // calibration: certain-but-wrong under control
  ) {
    status = 'ready'
  } else if (mockCount >= 3 && average >= passMark) {
    status = 'approaching'
  }

  // A transparent, human-readable reason so the UI can tell the student exactly
  // why — confidence comes from knowing what's left, not just a colour.
  const gaps: string[] = []
  if (mockCount < 5) gaps.push(`take ${5 - mockCount} more full mock(s)`)
  if (passStreak < 3) gaps.push('string together 3 consecutive passes')
  if (average < readyAvgTarget) gaps.push(`raise your recent average to ${readyAvgTarget}% (now ${round2(average)}%)`)
  if (minimum < passMark) gaps.push('clear the pass mark on every recent mock')
  if (!allDomainsClear && weakestDomain) gaps.push(`lift ${weakestDomain} above ${domainFloor}% (now ${round2(weakestScore ?? 0)}%)`)
  if (decliningSharply) gaps.push('recover from a recent dip in your scores')
  if (badlyOverconfident)
    gaps.push(
      `bring your certain-but-wrong rate down (${Math.round((overconfidenceRate ?? 0) * 100)}% of your "certain" calls in lessons were wrong)`,
    )

  const reason =
    status === 'ready'
      ? `Ready: ${mockCount} mocks, last ${passStreak} passed, averaging ${round2(average)}% with no domain below ${domainFloor}%.`
      : status === 'approaching'
        ? `Almost there (averaging ${round2(average)}%). To reach ready: ${gaps.join('; ')}.`
        : `Not ready yet. To progress: ${gaps.join('; ')}.`

  const criteriaMet = {
    mock_count: mockCount,
    pass_mark: passMark,
    average_score: round2(average),
    minimum_score: round2(minimum),
    recent_pass_streak: passStreak,
    most_recent_score: round2(mostRecent),
    declining_sharply: decliningSharply,
    weakest_domain: weakestDomain,
    weakest_domain_score: weakestScore === null ? null : round2(weakestScore),
    calibration_certain_calls: certainCalls,
    calibration_overconfidence_rate:
      overconfidenceRate === null ? null : round2(overconfidenceRate),
    reason,
    thresholds: {
      ready: `count>=5, last-3-passes, avg>=${readyAvgTarget} (pass+5), min>=${passMark}, every domain>=${domainFloor}, no sharp decline`,
      approaching: `count>=3, avg>=${passMark}`,
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
    .select('id, question_text, options, correct_answer, question_type, explanation, wrong_answer_rationales, domain')
    .in('id', questionIds)

  const qbankMap: Record<string, QbankResultRow> = {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const row of (qbankRows ?? []) as any[]) {
    qbankMap[row.id] = {
      correct_answer: row.correct_answer as string | string[],
      explanation: row.explanation,
      wrong_answer_rationales: row.wrong_answer_rationales as Record<string, string> | null,
      question_text: row.question_text,
      options: normalizeOptions(row.options),
      question_type: row.question_type as string,
      domain: row.domain,
    }
  }

  return { attempt, questions: snapshot, qbankMap, passScorePercent }
}
