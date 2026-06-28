'use server'

// The Lesson Challenge assembler. Reads the student's mastery for the lesson's
// concepts and returns a short, adaptive round weighted toward what THIS student
// is weak on, the differentiator over a fixed end-of-lesson quiz. Reads only;
// the write-back goes through the player's existing recordQuizEvidence path.
//
// Scenarios are DB-served (challenge_scenarios) so they can be added or edited
// without a deploy, like lesson content. The typed in-code bank
// (lib/cases/scenario-bank.ts) is the seed source AND a runtime floor: DB rows
// are unioned OVER the in-code pool (DB wins by id), so coverage never regresses
// if a row is missing and a DB outage falls back to the in-code bank.

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getMasterySummary } from '@/lib/student-model/knowledge'
import type { ChallengeScenario, ChallengeMechanic, ChallengeSpec } from '@/lib/cases/scenario-bank'
import { CHALLENGE_SIZE, poolForLesson, selectScenarios, type ChallengeRound } from './challenge-config'

const KNOWN_MECHANICS: ChallengeMechanic[] = [
  'red-flags',
  'screening-match',
  'risk-classify',
  'decision',
  'sequence',
  'match',
  'sort',
]

/** A challenge_scenarios row's spec is jsonb; accept it only if it is a well-formed mechanic. */
function specIsValid(spec: unknown): spec is ChallengeSpec {
  if (!spec || typeof spec !== 'object') return false
  const s = spec as Record<string, unknown>
  switch (s.kind) {
    case 'decision':
      return Array.isArray(s.options)
    case 'red-flags':
    case 'risk-classify':
      return Array.isArray(s.items)
    case 'screening-match':
      return Array.isArray(s.alerts)
    case 'sequence':
      return Array.isArray(s.steps)
    case 'match':
      return Array.isArray(s.pairs)
    case 'sort':
      return Array.isArray(s.buckets) && Array.isArray(s.items)
    default:
      return false
  }
}

/** Fetch DB-served scenarios for a course whose concepts intersect the lesson's. */
async function fetchDbScenarios(courseId: string, concepts: string[]): Promise<ChallengeScenario[]> {
  if (concepts.length === 0) return []
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('challenge_scenarios')
      .select('id, mechanic, title, concept_tags, spec')
      .eq('course_id', courseId)
      .overlaps('concept_tags', concepts)
    if (error || !data) return []
    const out: ChallengeScenario[] = []
    for (const row of data as Array<Record<string, unknown>>) {
      if (
        typeof row.id === 'string' &&
        typeof row.title === 'string' &&
        KNOWN_MECHANICS.includes(row.mechanic as ChallengeMechanic) &&
        specIsValid(row.spec)
      ) {
        out.push({
          id: row.id,
          conceptTags: Array.isArray(row.concept_tags) ? (row.concept_tags as string[]) : [],
          mechanic: row.mechanic as ChallengeMechanic,
          title: row.title,
          spec: row.spec,
        })
      }
    }
    return out
  } catch {
    return [] // DB unavailable: the in-code floor below covers it
  }
}

export async function getLessonChallenge(opts: {
  courseId: string
  lessonSlug: string
  conceptTags: string[]
  n?: number
}): Promise<ChallengeRound> {
  const n = opts.n ?? CHALLENGE_SIZE
  const concepts = [...new Set(opts.conceptTags.filter(Boolean))]

  // Union DB-served scenarios OVER the in-code floor (DB wins by id). The floor
  // (poolForLesson) already broadens to the whole in-code bank when too few
  // match, so coverage is always at least the in-code behavior.
  const dbPool = await fetchDbScenarios(opts.courseId, concepts)
  const byId = new Map<string, ChallengeScenario>()
  for (const s of poolForLesson(concepts, n)) byId.set(s.id, s)
  for (const s of dbPool) byId.set(s.id, s) // DB precedence
  const pool = [...byId.values()]

  // Best-effort student model. Anonymous / no-history → non-adaptive even spread.
  let adaptive = false
  const weak: string[] = []
  const weight = new Map<string, number>()
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const summary = await getMasterySummary(user.id, opts.courseId, concepts)
      if (summary.concepts.some((c) => c.observations > 0)) adaptive = true
      for (const c of summary.concepts) {
        // Weak concepts pull the round toward them; strong ones get little weight.
        const w =
          c.bucket === 'weak' ? 3 : c.bucket === 'developing' ? 2 : c.bucket === 'strong' ? 0.6 : 1.4
        weight.set(c.conceptTag, w)
        if (c.bucket === 'weak') weak.push(c.conceptTag)
      }
    }
  } catch {
    /* signed out or model unavailable — fall through to the even-spread default */
  }

  const weightOf = (tag: string) => weight.get(tag) ?? 1
  const scenarios = selectScenarios(pool, weightOf, n)
  return { scenarios, adaptive, focus: weak }
}
