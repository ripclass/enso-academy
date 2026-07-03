'use server'

// Glossary flashcards -> per-student spaced repetition.
//
// getStudyDeck returns the cards due now (plus a capped batch of new ones) for
// an enrolled student; recordFlashcardReview applies the Leitner scheduler and
// persists the card's next box + due time. All DB access is through the admin
// client (flashcard_reviews is service-role only, like daily_case_results); the
// server client is used only to identify the signed-in user. Both actions are
// gated to enrolled students, matching the rest of the course content.

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { nextState, LEARNED_BOX, RATINGS, type Rating } from './schedule'
import type { FlashCard, StudyDeck } from './types'

const NEW_PER_SESSION = 20

type Ctx = { admin: ReturnType<typeof createAdminClient>; courseId: string; userId: string }

/** Resolve the course + signed-in enrolled student, or null (not published / signed out / not enrolled). */
async function resolveContext(courseSlug: string): Promise<Ctx | null> {
  const admin = createAdminClient()
  const { data: course } = await admin
    .from('courses')
    .select('id, status')
    .eq('slug', courseSlug)
    .single()
  if (!course || course.status !== 'published') return null

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: enr } = await admin
    .from('enrollments')
    .select('status')
    .eq('student_id', user.id)
    .eq('course_id', course.id)
    .maybeSingle()
  if (enr?.status !== 'active') return null

  return { admin, courseId: course.id as string, userId: user.id as string }
}

/** The study deck for an enrolled student: due cards + a capped batch of new ones, plus counts. */
export async function getStudyDeck(courseSlug: string): Promise<StudyDeck> {
  const empty: StudyDeck = { cards: [], counts: { due: 0, learned: 0, total: 0 } }
  try {
    const ctx = await resolveContext(courseSlug)
    if (!ctx) return empty
    const { admin, courseId, userId } = ctx

    const { data: glossary } = await admin
      .from('glossary')
      .select('id, term, definition')
      .eq('course_id', courseId)
    const terms = (glossary ?? []) as Array<{ id: string; term: string; definition: string }>
    if (terms.length === 0) return empty

    const { data: reviews } = await admin
      .from('flashcard_reviews')
      .select('glossary_id, box, due_at')
      .eq('student_id', userId)
      .eq('course_id', courseId)
    const state = new Map<string, { box: number; dueAt: number }>()
    for (const r of (reviews ?? []) as Array<{ glossary_id: string; box: number; due_at: string }>) {
      state.set(r.glossary_id, { box: r.box, dueAt: new Date(r.due_at).getTime() })
    }

    const now = Date.now()
    const due: FlashCard[] = []
    const fresh: FlashCard[] = []
    let learned = 0
    for (const t of terms) {
      const s = state.get(t.id)
      const card = { glossaryId: t.id, term: t.term, definition: t.definition }
      if (s) {
        if (s.box >= LEARNED_BOX) learned++
        if (s.dueAt <= now) due.push({ ...card, box: s.box })
      } else {
        fresh.push({ ...card, box: null })
      }
    }

    return {
      cards: [...due, ...fresh.slice(0, NEW_PER_SESSION)],
      counts: { due: due.length, learned, total: terms.length },
    }
  } catch (err) {
    console.error('getStudyDeck failed:', err)
    return empty
  }
}

/** Record a rating for one card: apply the scheduler and persist the next box + due time. */
export async function recordFlashcardReview(
  courseSlug: string,
  glossaryId: string,
  rating: Rating,
): Promise<{ ok: boolean; box?: number }> {
  try {
    if (!RATINGS.includes(rating)) return { ok: false }
    const ctx = await resolveContext(courseSlug)
    if (!ctx) return { ok: false }
    const { admin, courseId, userId } = ctx

    // Confirm the card belongs to this course before writing (guards a crafted id).
    const { data: card } = await admin
      .from('glossary')
      .select('id')
      .eq('id', glossaryId)
      .eq('course_id', courseId)
      .maybeSingle()
    if (!card) return { ok: false }

    const { data: existing } = await admin
      .from('flashcard_reviews')
      .select('box, reps, lapses')
      .eq('student_id', userId)
      .eq('glossary_id', glossaryId)
      .maybeSingle()
    const prev = existing as { box: number; reps: number; lapses: number } | null

    const now = new Date()
    const { box, dueAt } = nextState(prev?.box ?? null, rating, now)

    await admin.from('flashcard_reviews').upsert(
      {
        student_id: userId,
        course_id: courseId,
        glossary_id: glossaryId,
        box,
        due_at: dueAt.toISOString(),
        reps: (prev?.reps ?? 0) + 1,
        lapses: (prev?.lapses ?? 0) + (rating === 'again' ? 1 : 0),
        last_reviewed_at: now.toISOString(),
      },
      { onConflict: 'student_id,glossary_id' },
    )

    return { ok: true, box }
  } catch (err) {
    console.error('recordFlashcardReview failed:', err)
    return { ok: false }
  }
}
