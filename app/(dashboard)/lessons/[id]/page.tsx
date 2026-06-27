import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { LessonPlayer } from './lesson-player'
import { startLessonSession, getLessonContent, getResumeSceneIndex } from '@/lib/lesson/actions'
import { getAvatarChoice } from '@/lib/settings'
import { isPreviewLessonId } from '@/lib/courses/preview'
import { parseScene, type ContentRow, type Scene } from '@/lib/lesson/scenes'
import { LESSON_CASE_MAP } from '@/lib/cases/generate'
import { lessonHasChallenge } from '@/lib/lesson/challenge-config'

type Props = { params: Promise<{ id: string }> }

export default async function LessonPage({ params }: Props) {
  const { id } = await params
  const isPreview = isPreviewLessonId(id)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Preview lessons are signup-gated (send anonymous prospects to sign up, which
  // captures the lead); other lessons use the normal login redirect.
  if (!user) redirect(`/${isPreview ? 'signup' : 'login'}?next=/lessons/${id}`)

  const admin = createAdminClient()

  // Fetch lesson with course context
  const { data: lesson } = await admin
    .from('lessons')
    .select(`
      id, slug, name, description, learning_objectives, estimated_minutes,
      module:modules!inner (
        id, name, sort_order,
        course:courses!inner (id, slug, name, short_name)
      )
    `)
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  const courseId = (lesson.module as any).course.id
  const courseSlug = (lesson.module as any).course.slug

  // Confirm enrollment — except for free preview lessons, which any signed-in
  // user may play (the buy gate is on the rest of the course).
  const { data: enrollment } = await admin
    .from('enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single()

  if (!enrollment && !isPreview) redirect(`/courses/${courseSlug}`)

  // Fetch the remaining inputs in parallel (independent reads/writes) so the
  // lesson renders fast. The lecturer's continuity greeting is intentionally NOT
  // fetched here: it is an LLM call, so the player fetches it after mount
  // (fetchLecturerOpening) rather than blocking first paint.
  type NavModule = { sort_order: number | null; lessons: { id: string; sort_order: number | null }[] }
  const [elements, sessionId, userAvatar, navRes, resumeIndex] = await Promise.all([
    getLessonContent(id),
    startLessonSession(id),
    getAvatarChoice(),
    admin
      .from('modules')
      .select('sort_order, lessons(id, sort_order)')
      .eq('course_id', courseId)
      .order('sort_order'),
    getResumeSceneIndex(id),
  ])
  const baseScenes = elements.map((row) => parseScene(row as unknown as ContentRow))

  // Lesson Challenge ("Apply it"): for pilot lessons (Module 9), inject an
  // adaptive applied round immediately before the synthesis scene. This is
  // player-side only — it writes nothing to the lesson content in the DB; the
  // round itself is assembled at render by getLessonChallenge from a code-side
  // scenario bank. See docs/SPEC-lesson-challenge.md.
  const lessonSlug = (lesson as { slug: string }).slug
  let scenes = baseScenes
  if (lessonHasChallenge(lessonSlug) && baseScenes.length > 1) {
    const conceptTags = [...new Set(baseScenes.flatMap((s) => s.conceptTags))]
    // Insert before the lesson's closing synthesis. Prefer a "What to carry
    // forward" scene anywhere; otherwise fall back to the final scene when it is
    // a synthesis reading or a closing slide (some lessons end either way).
    const carryIdx = baseScenes.findIndex((s) => /what to carry forward/i.test(s.title ?? ''))
    const lastIdx = baseScenes.length - 1
    const last = baseScenes[lastIdx]
    const lastIsSynthesis = !!last && (/synthesis/i.test(last.title ?? '') || last.sceneType === 'slide')
    const synthIdx = carryIdx > 0 ? carryIdx : lastIsSynthesis ? lastIdx : -1
    if (synthIdx > 0 && conceptTags.length > 0) {
      const challengeScene: Scene = {
        id: `challenge-${(lesson as { id: string }).id}`,
        title: 'Apply it',
        conceptTags,
        teachesConcepts: [],
        audioUrl: null,
        estimatedSeconds: null,
        sceneType: 'challenge',
        data: { lessonSlug, conceptTags },
      }
      scenes = [...baseScenes.slice(0, synthIdx), challengeScene, ...baseScenes.slice(synthIdx)]
    }
  }

  // Resume at the last scene the student was on (clamped to the current count).
  const initialSceneIndex = Math.min(Math.max(0, resumeIndex), Math.max(0, scenes.length - 1))

  // The student's first name, for the lecturer to address them in office hours.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.given_name === 'string' && meta.given_name) ||
    ''
  const userName = fullName.trim().split(/\s+/)[0] || null

  // The next lesson in course order (module sort_order, then lesson sort_order),
  // so "Complete lesson" can advance straight into it. Null on the last lesson.
  const orderedLessonIds = ((navRes.data ?? []) as NavModule[]).flatMap((m) =>
    [...(m.lessons ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((l) => l.id),
  )
  const curIdx = orderedLessonIds.indexOf(id)
  const nextLessonId =
    curIdx >= 0 && curIdx < orderedLessonIds.length - 1 ? orderedLessonIds[curIdx + 1] : null

  return (
    <LessonPlayer
      sessionId={sessionId}
      lesson={lesson as any}
      scenes={scenes}
      courseId={courseId}
      courseSlug={courseSlug}
      initialSceneIndex={initialSceneIndex}
      userAvatar={userAvatar}
      userName={userName}
      nextLessonId={nextLessonId}
      caseHref={
        LESSON_CASE_MAP[(lesson as { slug: string }).slug]
          ? `/courses/${courseSlug}/cases?case=${LESSON_CASE_MAP[(lesson as { slug: string }).slug]}`
          : undefined
      }
    />
  )
}
