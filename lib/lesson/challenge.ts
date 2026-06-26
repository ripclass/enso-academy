'use server'

// The Lesson Challenge assembler. Reads the student's mastery for the lesson's
// concepts and returns a short, adaptive round weighted toward what THIS student
// is weak on — the differentiator over a fixed end-of-lesson quiz. Reads only;
// the write-back goes through the player's existing recordQuizEvidence path.

import { createClient } from '@/lib/supabase/server'
import { getMasterySummary } from '@/lib/student-model/knowledge'
import { CHALLENGE_SIZE, poolForLesson, selectScenarios, type ChallengeRound } from './challenge-config'

export async function getLessonChallenge(opts: {
  courseId: string
  lessonSlug: string
  conceptTags: string[]
  n?: number
}): Promise<ChallengeRound> {
  const n = opts.n ?? CHALLENGE_SIZE
  const concepts = [...new Set(opts.conceptTags.filter(Boolean))]
  const pool = poolForLesson(concepts, n)

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
