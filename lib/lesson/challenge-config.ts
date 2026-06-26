// lib/lesson/challenge-config.ts
//
// Pure config + selection logic for the Lesson Challenge ("Apply it"). Kept
// separate from challenge.ts because that file is a 'use server' module (which
// may only export async actions). The page imports the slug gate from here; the
// server action imports the selector.

import { SCENARIO_BANK, scenariosForConcepts, type ChallengeScenario } from '@/lib/cases/scenario-bank'

/**
 * Lessons that carry an end-of-lesson challenge. PILOT: Module 9 ("Learning
 * from Enforcement"). Expand deliberately as the scenario bank grows.
 */
export const CHALLENGE_LESSON_SLUGS = new Set<string>([
  'how-to-read-an-enforcement-action',
  'case-study-correspondent-banking-failures',
  'case-study-the-danske-bank-estonia-affair',
  'case-study-westpac-and-the-litepay-channel',
  'case-study-1mdb-and-the-private-banking-failure-mode',
  'course-synthesis-and-exam-preparation',
])

export function lessonHasChallenge(slug: string): boolean {
  return CHALLENGE_LESSON_SLUGS.has(slug)
}

/** Default number of judgments in a round. */
export const CHALLENGE_SIZE = 3

export type ChallengeRound = {
  scenarios: ChallengeScenario[]
  /** True when the selection was weighted by a real (observed) student model. */
  adaptive: boolean
  /** The weak concepts the round leaned into — for a subtle "we focused on X" note. */
  focus: string[]
}

/**
 * Pick `n` scenarios from a pool, weighted by `weightOf(conceptTag)` (higher =
 * target it more), with a first pass for mechanic variety so a round never
 * repeats the same interaction. Deterministic given its inputs.
 */
export function selectScenarios(
  pool: ChallengeScenario[],
  weightOf: (conceptTag: string) => number,
  n: number,
): ChallengeScenario[] {
  const scored = pool
    .map((s) => ({
      s,
      score: s.conceptTags.reduce((a, t) => a + weightOf(t), 0) / Math.max(1, s.conceptTags.length),
    }))
    .sort((a, b) => b.score - a.score)

  const picked: ChallengeScenario[] = []
  const usedMechanics = new Set<string>()
  // Pass 1: the highest-scoring scenario of each distinct mechanic (variety).
  for (const { s } of scored) {
    if (picked.length >= n) break
    if (!usedMechanics.has(s.mechanic)) {
      picked.push(s)
      usedMechanics.add(s.mechanic)
    }
  }
  // Pass 2: fill any remaining slots by score.
  for (const { s } of scored) {
    if (picked.length >= n) break
    if (!picked.includes(s)) picked.push(s)
  }
  return picked.slice(0, n)
}

/**
 * Build the candidate pool for a lesson: scenarios whose concepts intersect the
 * lesson's, broadened to the rest of the bank only if there are too few (e.g.
 * the synthesis lesson, which legitimately draws across concepts).
 */
export function poolForLesson(conceptTags: string[], n: number): ChallengeScenario[] {
  let pool = scenariosForConcepts(conceptTags)
  if (pool.length < n) {
    const have = new Set(pool.map((s) => s.id))
    pool = [...pool, ...SCENARIO_BANK.filter((s) => !have.has(s.id))]
  }
  return pool
}
