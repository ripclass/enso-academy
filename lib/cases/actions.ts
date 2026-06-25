'use server'

// Case Mode -> the student model + the daily-case leaderboard.
//
// Finishing a case records per-domain evidence in the knowledge model
// (student_knowledge_state) — the same model lessons/quizzes feed and the
// lecturer reads, so cases move domain mastery (what the readiness signoff is
// built on). The daily case additionally writes one leaderboard row per day.
// Anonymous play (the free taster) is a no-op for both: no account to attribute.

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

type CaseInput = {
  courseSlug: string
  domain: string
  flagsCorrect: number
  flagsTotal: number
  screeningCorrect: number
  decisionCorrect: boolean
}

const flagsOkOf = (i: CaseInput) => i.flagsTotal > 0 && i.flagsCorrect / i.flagsTotal >= 0.75

// Three judgments per case, each correct/incorrect evidence on the domain
// concept(s). Sequential so each update sees the previous one.
async function feedKnowledge(studentId: string, courseId: string, i: CaseInput) {
  const base = { studentId, courseId, conceptTags: conceptsFor(i.domain) }
  await recordEvidence({ ...base, evidence: flagsOkOf(i) ? 'correct' : 'incorrect' })
  await recordEvidence({ ...base, evidence: i.screeningCorrect >= 1 ? 'correct' : 'incorrect' })
  await recordEvidence({ ...base, evidence: i.decisionCorrect ? 'correct' : 'incorrect' })
}

// score out of 100 across the three judgments (matches the verdict %).
function scoreOf(i: CaseInput): { score: number; correct: number; total: number } {
  const correct = i.flagsCorrect + i.screeningCorrect + (i.decisionCorrect ? 1 : 0)
  const total = i.flagsTotal + 1 /* screening */ + 1 /* decision */
  return { score: total ? Math.round((correct / total) * 100) : 0, correct, total }
}

function displayNameFor(user: { user_metadata?: Record<string, unknown>; email?: string }): string {
  const full = (user.user_metadata?.full_name as string | undefined)?.trim()
  if (full) {
    const parts = full.split(/\s+/)
    return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0]
  }
  return user.email ? user.email.split('@')[0].slice(0, 14) : 'Analyst'
}

function utcDay(): string {
  const n = new Date()
  return `${n.getUTCFullYear()}-${String(n.getUTCMonth() + 1).padStart(2, '0')}-${String(n.getUTCDate()).padStart(2, '0')}`
}

async function courseIdFor(slug: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('courses').select('id').eq('slug', slug).single()
  return data?.id ?? null
}

/** A regular case result -> the knowledge model (no-op if signed out). */
export async function recordCaseResult(input: CaseInput): Promise<{ recorded: boolean }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { recorded: false }
    const courseId = await courseIdFor(input.courseSlug)
    if (!courseId) return { recorded: false }
    await feedKnowledge(user.id, courseId, input)
    return { recorded: true }
  } catch (err) {
    console.error('recordCaseResult failed:', err)
    return { recorded: false }
  }
}

/**
 * Submit the daily case: writes one leaderboard row for today (first attempt
 * counts) AND feeds the knowledge model. No-op if signed out.
 */
export async function submitDailyResult(
  input: CaseInput,
): Promise<{ recorded: boolean; score: number }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { recorded: false, score: 0 }
    const courseId = await courseIdFor(input.courseSlug)
    if (!courseId) return { recorded: false, score: 0 }

    const { score, correct, total } = scoreOf(input)
    const admin = createAdminClient()
    // First attempt of the day counts; later replays do not overwrite the board.
    // daily_case_results is not in the generated types yet; cast locally.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('daily_case_results').upsert(
      {
        student_id: user.id,
        course_id: courseId,
        day: utcDay(),
        score,
        correct,
        total,
        display_name: displayNameFor(user),
      },
      { onConflict: 'student_id,course_id,day', ignoreDuplicates: true },
    )
    await feedKnowledge(user.id, courseId, input)
    return { recorded: true, score }
  } catch (err) {
    console.error('submitDailyResult failed:', err)
    return { recorded: false, score: 0 }
  }
}

export type LeaderboardEntry = { rank: number; name: string; score: number; isMe: boolean }
export type Leaderboard = { entries: LeaderboardEntry[]; total: number; me: LeaderboardEntry | null }

/** Today's daily-case leaderboard for a course (top entries + the caller's row). */
export async function getDailyLeaderboard(courseSlug: string): Promise<Leaderboard> {
  const empty: Leaderboard = { entries: [], total: 0, me: null }
  try {
    const courseId = await courseIdFor(courseSlug)
    if (!courseId) return empty

    let myId: string | null = null
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      myId = user?.id ?? null
    } catch {
      /* anonymous */
    }

    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, count } = await (admin as any)
      .from('daily_case_results')
      .select('student_id, score, display_name, created_at', { count: 'exact' })
      .eq('course_id', courseId)
      .eq('day', utcDay())
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data ?? []) as any[]
    const ranked: LeaderboardEntry[] = rows.map((r, i) => ({
      rank: i + 1,
      name: (r.display_name as string) || 'Analyst',
      score: Number(r.score),
      isMe: !!myId && r.student_id === myId,
    }))
    const me = ranked.find((e) => e.isMe) ?? null
    return { entries: ranked.slice(0, 15), total: count ?? ranked.length, me }
  } catch (err) {
    console.error('getDailyLeaderboard failed:', err)
    return empty
  }
}
